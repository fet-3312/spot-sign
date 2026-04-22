import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	return json({
		user: locals.currentUser,
		defaultArea: locals.platform.config.defaultArea,
		storage: locals.platform.storage.describe()
	});
};
