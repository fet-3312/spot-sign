import { getPlatformServices, SESSION_COOKIE_NAME } from '$lib/server/platform';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const platform = await getPlatformServices();
	event.locals.platform = platform;
	event.locals.currentUser = await platform.auth.getCurrentUser(
		event.cookies.get(SESSION_COOKIE_NAME)
	);

	return resolve(event);
};
