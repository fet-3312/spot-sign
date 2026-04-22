import { getCurrentUser } from '$lib/server/spot-sign/auth';
import { fail, ok } from '$lib/server/spot-sign/http';
import { getState } from '$lib/server/spot-sign/state';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ cookies, url }) => {
	const user = await getCurrentUser(cookies);
	if (!user) return fail(401, 'UNAUTHORIZED', '請先登入');
	if (user.role !== 'supervisor') return fail(403, 'FORBIDDEN', '僅主管可查看 review queue');
	const importJobId = url.searchParams.get('importJobId');
	const resolutionStatus = url.searchParams.get('resolutionStatus');
	const items = getState().importReviewItems.filter((item) => {
		if (importJobId && item.importJobId !== importJobId) return false;
		if (resolutionStatus && item.resolutionStatus !== resolutionStatus) return false;
		return true;
	});
	return ok({ items });
};
