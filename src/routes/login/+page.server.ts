import { dev } from '$app/environment';
import { SESSION_COOKIE_NAME } from '$lib/server/platform';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.currentUser) {
		throw redirect(303, '/app');
	}

	return {};
};

export const actions: Actions = {
	default: async ({ request, cookies, locals }) => {
		const formData = await request.formData();
		const email = String(formData.get('email') ?? '');
		const password = String(formData.get('password') ?? '');
		const user = await locals.platform.auth.authenticate(email, password);

		if (!user) {
			return fail(400, {
				message: 'Invalid email or password.',
				email
			});
		}

		const sessionToken = await locals.platform.auth.createSession(
			user.id,
			locals.platform.config.sessionMaxAgeSeconds
		);
		cookies.set(SESSION_COOKIE_NAME, sessionToken, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: !dev,
			maxAge: locals.platform.config.sessionMaxAgeSeconds
		});

		throw redirect(303, '/app');
	}
};
