export type UserRole = 'rep' | 'supervisor';

export interface CurrentUser {
	id: string;
	email: string;
	name: string;
	role: UserRole;
}

export interface DefaultArea {
	latitude: number;
	longitude: number;
	radiusMeters: number;
}

export interface PlatformConfig {
	defaultArea: DefaultArea;
	sessionMaxAgeSeconds: number;
	devDatabasePath: string;
	devObjectStoragePath: string;
}

export interface DevUserSeed extends CurrentUser {
	password: string;
}

export interface StorageObjectMetadata {
	key: string;
	size: number;
}

export interface StorageDescriptor {
	provider: string;
	rootPath: string;
}
