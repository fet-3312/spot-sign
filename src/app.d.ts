import type { PlatformServices } from '$lib/server/platform';
import type { CurrentUser } from '$lib/server/platform/types';

declare global {
	namespace App {
		interface Locals {
			platform: PlatformServices;
			currentUser: CurrentUser | null;
		}
	}
}

export {};
