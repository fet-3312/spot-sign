import { assignRestaurant } from '$lib/spot-sign/domain';
import { getCurrentUser } from '$lib/server/spot-sign/auth';
import { fail, ok } from '$lib/server/spot-sign/http';
import { getState } from '$lib/server/spot-sign/state';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies, request, params }) => {
	const user = await getCurrentUser(cookies);
	if (!user) return fail(401, 'UNAUTHORIZED', '請先登入');
	if (user.role !== 'supervisor') return fail(403, 'FORBIDDEN', '僅主管可指派');
	const body = await request.json().catch(() => null);
	if (!body) return fail(400, 'VALIDATION_ERROR', 'Invalid JSON body');
	const assigned = assignRestaurant(getState(), user, params.id, {
		toUserId: String(body.toUserId ?? ''),
		reason: body.reason ? String(body.reason) : undefined,
		expectedCurrentAssignedUserId: body.expectedCurrentAssignedUserId ?? null
	});
	if (!assigned.ok) {
		const fields = (assigned as { errors?: Record<string, string> }).errors;
		return fail(assigned.status, assigned.code, assigned.message, fields);
	}
	return ok({ assignment: assigned.assignment });
};
