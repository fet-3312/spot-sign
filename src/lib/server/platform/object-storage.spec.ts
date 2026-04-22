import { mkdtemp } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { SimulatedObjectStorage } from './object-storage';

describe('SimulatedObjectStorage', () => {
	it('stores and retrieves bytes from the simulated bucket', async () => {
		const rootDir = await mkdtemp(path.join(os.tmpdir(), 'spot-sign-storage-'));
		const storage = new SimulatedObjectStorage(rootDir);
		const payload = new TextEncoder().encode('hello-spot-sign');

		const metadata = await storage.put('reports/demo.txt', payload);
		const stored = await storage.get('reports/demo.txt');

		expect(metadata).toEqual({ key: 'reports/demo.txt', size: payload.byteLength });
		expect(stored).toEqual(payload);
		expect(storage.describe()).toEqual({
			provider: 'simulated-r2',
			rootPath: rootDir
		});
	});
});
