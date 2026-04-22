import { getCurrentUser } from '$lib/server/spot-sign/auth';
import { fail, ok } from '$lib/server/spot-sign/http';
import { getState } from '$lib/server/spot-sign/state';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ cookies, url }) => {
	const user = await getCurrentUser(cookies);
	if (!user) return fail(401, 'UNAUTHORIZED', '請先登入');
	const photoKey = url.searchParams.get('photoKey');
	if (!photoKey)
		return fail(400, 'VALIDATION_ERROR', 'photoKey required', { photoKey: 'photoKey 必填' });
	const state = getState();
	const photo = state.photos.find((entry) => entry.photoKey === photoKey);
	if (!photo) return fail(404, 'NOT_FOUND', '找不到照片');
	const report = photo.reportId ? state.reports.find((entry) => entry.id === photo.reportId) : null;
	if (user.role !== 'supervisor' && report && report.userId !== user.id) {
		return fail(403, 'FORBIDDEN', '無權查看此照片');
	}
	return ok({ accessUrl: photo.dataUrl, expiresAt: new Date(Date.now() + 60_000).toISOString() });
};
