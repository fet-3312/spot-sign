import { mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { StorageDescriptor, StorageObjectMetadata } from './types';

export class SimulatedObjectStorage {
	constructor(private readonly rootPath: string) {}

	describe(): StorageDescriptor {
		return {
			provider: 'simulated-r2',
			rootPath: this.rootPath
		};
	}

	async put(key: string, bytes: Uint8Array): Promise<StorageObjectMetadata> {
		const target = this.resolvePath(key);
		await mkdir(path.dirname(target), { recursive: true });
		await writeFile(target, bytes);
		const metadata = await stat(target);

		return { key, size: metadata.size };
	}

	async get(key: string): Promise<Uint8Array | null> {
		try {
			return new Uint8Array(await readFile(this.resolvePath(key)));
		} catch {
			return null;
		}
	}

	async remove(key: string): Promise<void> {
		await rm(this.resolvePath(key), { force: true });
	}

	private resolvePath(key: string): string {
		const safeKey = key.replace(/^\/+/, '');
		return path.join(this.rootPath, safeKey);
	}
}
