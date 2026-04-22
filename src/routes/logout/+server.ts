import { SESSION_COOKIE_NAME } from '$lib/server/platform';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies, locals }) => {
	const token = cookies.get(SESSION_COOKIE_NAME);
	await locals.platform.auth.clearSession(token);
	cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
	throw redirect(303, '/');
};
