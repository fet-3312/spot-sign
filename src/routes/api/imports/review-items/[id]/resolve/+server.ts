import { resolveReviewItem } from '$lib/spot-sign/domain';
import { getCurrentUser } from '$lib/server/spot-sign/auth';
import { fail, ok } from '$lib/server/spot-sign/http';
import { getState } from '$lib/server/spot-sign/state';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies, request, params }) => {
	const user = await getCurrentUser(cookies);
	if (!user) return fail(401, 'UNAUTHORIZED', '請先登入');
	if (user.role !== 'supervisor') return fail(403, 'FORBIDDEN', '僅主管可處理 review item');
	const body = await request.json().catch(() => null);
	if (!body) return fail(400, 'VALIDATION_ERROR', 'Invalid JSON body');
	const resolved = resolveReviewItem(getState(), user, params.id, {
		action: body.action,
		correctedName: body.correctedName,
		correctedAddress: body.correctedAddress,
		correctedLatitude: body.correctedLatitude,
		correctedLongitude: body.correctedLongitude,
		targetRestaurantId: body.targetRestaurantId ?? null
	});
	if (!resolved.ok) {
		const fields = (resolved as { errors?: Record<string, string> }).errors;
		return fail(resolved.status, resolved.code, resolved.message, fields);
	}
	return ok({ reviewItem: resolved.reviewItem });
};
