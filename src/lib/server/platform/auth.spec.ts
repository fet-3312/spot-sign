import { mkdtemp } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { LocalPlatformAuth } from './auth';

describe('LocalPlatformAuth', () => {
	it('authenticates the seeded demo users and resolves the current user from a session', async () => {
		const directory = await mkdtemp(path.join(os.tmpdir(), 'spot-sign-auth-'));
		const auth = new LocalPlatformAuth(path.join(directory, 'dev.sqlite'));

		const user = await auth.authenticate('supervisor@spot-sign.local', 'supervisor-demo-pass');
		const invalid = await auth.authenticate('supervisor@spot-sign.local', 'wrong-password');
		const token = await auth.createSession(user!.id, 120);
		const currentUser = await auth.getCurrentUser(token);

		expect(user).toMatchObject({ role: 'supervisor', email: 'supervisor@spot-sign.local' });
		expect(invalid).toBeNull();
		expect(currentUser).toMatchObject({ name: 'Demo Supervisor' });
	});
});
