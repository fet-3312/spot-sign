import { describe, expect, it } from 'vitest';
import { createPlatformConfig } from './config';

describe('createPlatformConfig', () => {
	it('returns defaults when env vars are missing', () => {
		const config = createPlatformConfig({});

		expect(config.defaultArea).toEqual({
			latitude: 25.033964,
			longitude: 121.564468,
			radiusMeters: 3000
		});
		expect(config.sessionMaxAgeSeconds).toBe(43200);
	});

	it('accepts explicit numeric overrides', () => {
		const config = createPlatformConfig({
			SPOT_SIGN_DEFAULT_AREA_LATITUDE: '10.5',
			SPOT_SIGN_DEFAULT_AREA_LONGITUDE: '20.5',
			SPOT_SIGN_DEFAULT_AREA_RADIUS_METERS: '750',
			SPOT_SIGN_SESSION_MAX_AGE_SECONDS: '900',
			SPOT_SIGN_DEV_SQLITE_PATH: '/tmp/custom.sqlite',
			SPOT_SIGN_DEV_OBJECT_STORAGE_PATH: '/tmp/custom-r2'
		});

		expect(config).toEqual({
			defaultArea: { latitude: 10.5, longitude: 20.5, radiusMeters: 750 },
			sessionMaxAgeSeconds: 900,
			devDatabasePath: '/tmp/custom.sqlite',
			devObjectStoragePath: '/tmp/custom-r2'
		});
	});
});
