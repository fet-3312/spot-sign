import { importRestaurantsFromCsv } from '$lib/spot-sign/domain';
import { getCurrentUser } from '$lib/server/spot-sign/auth';
import { fail, ok } from '$lib/server/spot-sign/http';
import { getState } from '$lib/server/spot-sign/state';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies, request }) => {
	const user = await getCurrentUser(cookies);
	if (!user) return fail(401, 'UNAUTHORIZED', '請先登入');
	if (user.role !== 'supervisor') return fail(403, 'FORBIDDEN', '僅主管可匯入');
	const formData = await request.formData();
	const file = formData.get('file');
	if (!(file instanceof File))
		return fail(400, 'VALIDATION_ERROR', '請上傳 CSV', { file: '請選擇 CSV 檔案' });
	if (!['text/csv', 'application/vnd.ms-excel', 'text/plain'].includes(file.type || 'text/csv')) {
		return fail(400, 'VALIDATION_ERROR', '僅接受 CSV', { file: '僅接受 CSV' });
	}
	const importJob = importRestaurantsFromCsv(
		getState(),
		user,
		await file.text(),
		file.name || 'restaurants.csv'
	);
	return ok({ importJob: { id: importJob.id, status: importJob.status } }, 201);
};
