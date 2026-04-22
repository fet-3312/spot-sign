import { getCurrentUser } from '$lib/server/spot-sign/auth';
import { fail, ok } from '$lib/server/spot-sign/http';
import { publicUser } from '$lib/server/spot-sign/state';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ cookies }) => {
	const user = await getCurrentUser(cookies);
	if (!user) return fail(401, 'UNAUTHORIZED', '請先登入');
	return ok({ user: publicUser(user) });
};
