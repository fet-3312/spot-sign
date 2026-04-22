import { submitReport } from '$lib/spot-sign/domain';
import { getCurrentUser } from '$lib/server/spot-sign/auth';
import { fail, ok } from '$lib/server/spot-sign/http';
import { getState } from '$lib/server/spot-sign/state';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies, params, request }) => {
	const user = await getCurrentUser(cookies);
	if (!user) return fail(401, 'UNAUTHORIZED', '請先登入');
	const body = await request.json().catch(() => null);
	if (!body) return fail(400, 'VALIDATION_ERROR', 'Invalid JSON body');
	const submitted = submitReport(getState(), user, params.id, {
		contactName: String(body.contactName ?? ''),
		status: body.status,
		notes: String(body.notes ?? ''),
		photoKey: body.photoKey ? String(body.photoKey) : null,
		visitedAt: String(body.visitedAt ?? '')
	});
	if (!submitted.ok) {
		const fields = (submitted as { errors?: Record<string, string> }).errors;
		return fail(submitted.status, submitted.code, submitted.message, fields);
	}
	return ok(
		{
			report: { id: submitted.report.id, restaurantId: submitted.report.restaurantId },
			restaurantSummary: submitted.restaurantSummary
		},
		201
	);
};
