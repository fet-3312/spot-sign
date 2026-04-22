import { env as privateEnv } from '$env/dynamic/private';
import type { PlatformConfig } from './types';

const DEFAULTS = {
	latitude: 25.033964,
	longitude: 121.564468,
	radiusMeters: 3000,
	sessionMaxAgeSeconds: 60 * 60 * 12,
	devDatabasePath: '/tmp/spot-sign-dev.sqlite',
	devObjectStoragePath: '/tmp/spot-sign-dev-r2'
} as const;

function readNumber(value: string | undefined, fallback: number): number {
	if (!value) return fallback;

	const parsed = Number(value);
	if (Number.isFinite(parsed)) {
		return parsed;
	}

	console.warn(`Ignoring invalid numeric Spot Sign config value: ${value}`);
	return fallback;
}

export function createPlatformConfig(
	env: Record<string, string | undefined> = privateEnv
): PlatformConfig {
	return {
		defaultArea: {
			latitude: readNumber(env.SPOT_SIGN_DEFAULT_AREA_LATITUDE, DEFAULTS.latitude),
			longitude: readNumber(env.SPOT_SIGN_DEFAULT_AREA_LONGITUDE, DEFAULTS.longitude),
			radiusMeters: readNumber(env.SPOT_SIGN_DEFAULT_AREA_RADIUS_METERS, DEFAULTS.radiusMeters)
		},
		sessionMaxAgeSeconds: readNumber(
			env.SPOT_SIGN_SESSION_MAX_AGE_SECONDS,
			DEFAULTS.sessionMaxAgeSeconds
		),
		devDatabasePath: env.SPOT_SIGN_DEV_SQLITE_PATH || DEFAULTS.devDatabasePath,
		devObjectStoragePath: env.SPOT_SIGN_DEV_OBJECT_STORAGE_PATH || DEFAULTS.devObjectStoragePath
	};
}
