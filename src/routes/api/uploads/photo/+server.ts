import { acceptedPhotoTypes, maxPhotoBytes } from '$lib/spot-sign/constants';
import { createId } from '$lib/spot-sign/domain';
import { getCurrentUser } from '$lib/server/spot-sign/auth';
import { fail, ok } from '$lib/server/spot-sign/http';
import { getState } from '$lib/server/spot-sign/state';
import type { RequestHandler } from './$types';

function buildPhotoDatePath(date: Date) {
	return date.toISOString().slice(0, 10).replace(/-/g, '/');
}

export const POST: RequestHandler = async ({ cookies, request }) => {
	const user = await getCurrentUser(cookies);
	if (!user) return fail(401, 'UNAUTHORIZED', '請先登入');
	const formData = await request.formData();
	const file = formData.get('photo');
	if (!(file instanceof File))
		return fail(400, 'VALIDATION_ERROR', '請提供單張照片', { photo: '請上傳圖片' });
	if (!acceptedPhotoTypes.includes(file.type)) {
		return fail(400, 'VALIDATION_ERROR', '不支援的圖片格式', { photo: '僅接受 JPEG、PNG、WebP' });
	}
	if (file.size > maxPhotoBytes) {
		return fail(400, 'VALIDATION_ERROR', '圖片不可超過 10MB', { photo: '圖片不可超過 10MB' });
	}
	const buffer = Buffer.from(await file.arrayBuffer());
	const now = new Date();
	const photoKey = `photos/${buildPhotoDatePath(now)}/${createId('img')}`;
	getState().photos.unshift({
		photoKey,
		contentType: file.type,
		size: file.size,
		dataUrl: `data:${file.type};base64,${buffer.toString('base64')}`,
		uploaderUserId: user.id
	});
	return ok({ photoKey, contentType: file.type, size: file.size }, 201);
};
