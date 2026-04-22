import { deleteSession, getCurrentUser } from '$lib/server/spot-sign/auth';
import { fail, ok } from '$lib/server/spot-sign/http';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies }) => {
	const user = await getCurrentUser(cookies);
	if (!user) return fail(401, 'UNAUTHORIZED', '請先登入');
	await deleteSession(cookies);
	return ok({ loggedOut: true });
};
