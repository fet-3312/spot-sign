import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import initSqlJs from 'sql.js';
import type { CurrentUser, DevUserSeed } from './types';

const SQL_WASM_DIR = path.join(process.cwd(), 'node_modules', 'sql.js', 'dist');

const DEV_USERS: DevUserSeed[] = [
	{
		id: 'user-rep-demo',
		email: 'rep@spot-sign.local',
		name: 'Demo Rep',
		role: 'rep',
		password: 'rep-demo-pass'
	},
	{
		id: 'user-supervisor-demo',
		email: 'supervisor@spot-sign.local',
		name: 'Demo Supervisor',
		role: 'supervisor',
		password: 'supervisor-demo-pass'
	}
];

interface SqlUserRecord extends CurrentUser {
	password_hash: string;
	status: string;
}

function toCurrentUser(row: unknown): CurrentUser {
	const user = row as CurrentUser;
	return {
		id: String(user.id),
		email: String(user.email),
		name: String(user.name),
		role: user.role
	};
}

function hashPassword(password: string): string {
	const salt = randomBytes(16).toString('hex');
	const hash = scryptSync(password, salt, 64).toString('hex');
	return `scrypt:${salt}:${hash}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
	const [, salt, expectedHash] = storedHash.split(':');
	const actualHash = scryptSync(password, salt, 64);
	const expected = Buffer.from(expectedHash, 'hex');
	return actualHash.length === expected.length && timingSafeEqual(actualHash, expected);
}

function hashSessionToken(token: string): string {
	return createHash('sha256').update(token).digest('hex');
}

export class LocalPlatformAuth {
	private readonly databasePromise;

	constructor(private readonly databasePath: string) {
		this.databasePromise = this.initializeDatabase();
	}

	async authenticate(email: string, password: string): Promise<CurrentUser | null> {
		const database = await this.databasePromise;
		const statement = database.prepare(
			'SELECT id, email, name, role, password_hash, status FROM users WHERE email = ? LIMIT 1'
		);
		statement.bind([email.trim().toLowerCase()]);
		const found = statement.step() ? (statement.getAsObject() as unknown as SqlUserRecord) : null;
		statement.free();

		if (!found || found.status !== 'active' || !verifyPassword(password, found.password_hash)) {
			return null;
		}

		return toCurrentUser(found);
	}

	async createSession(userId: string, maxAgeSeconds: number): Promise<string> {
		const database = await this.databasePromise;
		const token = randomBytes(24).toString('base64url');
		const sessionId = randomBytes(16).toString('hex');
		const now = new Date().toISOString();
		const expiresAt = new Date(Date.now() + maxAgeSeconds * 1000).toISOString();

		database.run(
			'INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at, last_seen_at) VALUES (?, ?, ?, ?, ?, ?)',
			[sessionId, userId, hashSessionToken(token), expiresAt, now, now]
		);
		await this.persistDatabase();

		return token;
	}

	async getCurrentUser(token: string | undefined): Promise<CurrentUser | null> {
		if (!token) return null;

		const database = await this.databasePromise;
		const statement = database.prepare(
			`SELECT users.id, users.email, users.name, users.role
 FROM sessions
 JOIN users ON users.id = sessions.user_id
 WHERE sessions.token_hash = ?
   AND sessions.expires_at > ?
   AND users.status = 'active'
 LIMIT 1`
		);
		statement.bind([hashSessionToken(token), new Date().toISOString()]);
		const found = statement.step() ? toCurrentUser(statement.getAsObject()) : null;
		statement.free();

		if (!found) {
			return null;
		}

		return found;
	}

	async clearSession(token: string | undefined): Promise<void> {
		if (!token) return;
		const database = await this.databasePromise;
		database.run('DELETE FROM sessions WHERE token_hash = ?', [hashSessionToken(token)]);
		await this.persistDatabase();
	}

	async listUsers(): Promise<CurrentUser[]> {
		const database = await this.databasePromise;
		const statement = database.prepare(
			"SELECT id, email, name, role FROM users WHERE status = 'active' ORDER BY role, name"
		);
		const users: CurrentUser[] = [];
		while (statement.step()) {
			users.push(toCurrentUser(statement.getAsObject()));
		}
		statement.free();
		return users;
	}

	private async initializeDatabase() {
		const SQL = await initSqlJs({ locateFile: (file: string) => path.join(SQL_WASM_DIR, file) });
		const existingBytes = await this.readDatabaseFile();
		const database = existingBytes ? new SQL.Database(existingBytes) : new SQL.Database();

		database.run(`
CREATE TABLE IF NOT EXISTS users (
id TEXT PRIMARY KEY,
email TEXT NOT NULL UNIQUE,
name TEXT NOT NULL,
role TEXT NOT NULL,
status TEXT NOT NULL,
password_hash TEXT NOT NULL,
created_at TEXT NOT NULL,
updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
id TEXT PRIMARY KEY,
user_id TEXT NOT NULL,
token_hash TEXT NOT NULL UNIQUE,
expires_at TEXT NOT NULL,
created_at TEXT NOT NULL,
last_seen_at TEXT NOT NULL,
FOREIGN KEY(user_id) REFERENCES users(id)
);
`);

		const existingUsers =
			database.exec('SELECT COUNT(*) AS count FROM users')[0]?.values[0]?.[0] ?? 0;
		if (!existingUsers) {
			const now = new Date().toISOString();
			for (const user of DEV_USERS) {
				database.run(
					'INSERT INTO users (id, email, name, role, status, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
					[
						user.id,
						user.email,
						user.name,
						user.role,
						'active',
						hashPassword(user.password),
						now,
						now
					]
				);
			}
		}

		await this.persistBytes(database.export());
		return database;
	}

	private async readDatabaseFile(): Promise<Uint8Array | null> {
		try {
			return await readFile(this.databasePath);
		} catch {
			return null;
		}
	}

	private async persistDatabase(): Promise<void> {
		const database = await this.databasePromise;
		await this.persistBytes(database.export());
	}

	private async persistBytes(bytes: Uint8Array): Promise<void> {
		await mkdir(path.dirname(this.databasePath), { recursive: true });
		await writeFile(this.databasePath, bytes);
	}
}
