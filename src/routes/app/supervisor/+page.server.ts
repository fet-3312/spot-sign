import { requireRole, requireUser } from '$lib/server/platform/guards';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const user = requireUser(locals.currentUser);
	requireRole(user, 'supervisor');

	return {
		users: await locals.platform.auth.listUsers()
	};
};
