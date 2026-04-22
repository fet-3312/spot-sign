import { createPlatformConfig } from './config';
import { LocalPlatformAuth } from './auth';
import { SimulatedObjectStorage } from './object-storage';

export const SESSION_COOKIE_NAME = 'spot-sign-session';

export interface PlatformServices {
	config: ReturnType<typeof createPlatformConfig>;
	auth: LocalPlatformAuth;
	storage: SimulatedObjectStorage;
}

let platformServicesPromise: Promise<PlatformServices> | undefined;

async function createPlatformServices(): Promise<PlatformServices> {
	const config = createPlatformConfig();
	return {
		config,
		auth: new LocalPlatformAuth(config.devDatabasePath),
		storage: new SimulatedObjectStorage(config.devObjectStoragePath)
	};
}

export function getPlatformServices(): Promise<PlatformServices> {
	platformServicesPromise ??= createPlatformServices();
	return platformServicesPromise;
}
