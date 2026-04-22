import { getCurrentUser } from '$lib/server/spot-sign/auth';
import { fail, ok } from '$lib/server/spot-sign/http';
import { getState } from '$lib/server/spot-sign/state';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ cookies, params }) => {
	const user = await getCurrentUser(cookies);
	if (!user) return fail(401, 'UNAUTHORIZED', '請先登入');
	if (user.role !== 'supervisor') return fail(403, 'FORBIDDEN', '僅主管可查看匯入');
	const importJob = getState().importJobs.find((entry) => entry.id === params.id);
	if (!importJob) return fail(404, 'NOT_FOUND', 'Import job not found');
	return ok({ importJob });
};
