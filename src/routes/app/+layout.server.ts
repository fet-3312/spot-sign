import { requireUser } from '$lib/server/platform/guards';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const user = requireUser(locals.currentUser);
	return {
		user,
		defaultArea: locals.platform.config.defaultArea,
		storage: locals.platform.storage.describe()
	};
};
