import { createSession } from '$lib/server/spot-sign/auth';
import { fail, ok } from '$lib/server/spot-sign/http';
import { getState, publicUser } from '$lib/server/spot-sign/state';
import { normalizeText } from '$lib/spot-sign/domain';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const body = await request.json().catch(() => null);
	if (!body) return fail(400, 'VALIDATION_ERROR', 'Invalid JSON body');
	const email = normalizeText(body.email ?? '');
	const password = String(body.password ?? '');
	const fields: Record<string, string> = {};
	if (!email) fields.email = 'Email 必填';
	if (!password) fields.password = 'Password 必填';
	if (Object.keys(fields).length > 0)
		return fail(400, 'VALIDATION_ERROR', 'Invalid credentials', fields);

	const user = getState().users.find((entry) => normalizeText(entry.email) === email);
	if (!user || user.password !== password) {
		return fail(401, 'INVALID_CREDENTIALS', '帳號或密碼錯誤');
	}
	if (user.status !== 'active') {
		return fail(403, 'USER_INACTIVE', '帳號未啟用');
	}
	await createSession(cookies, user);
	return ok({ user: publicUser(user) });
};
