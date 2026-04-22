import { getVisibleReports } from '$lib/spot-sign/domain';
import { getCurrentUser } from '$lib/server/spot-sign/auth';
import { fail, ok } from '$lib/server/spot-sign/http';
import { getState } from '$lib/server/spot-sign/state';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ cookies, url }) => {
	const user = await getCurrentUser(cookies);
	if (!user) return fail(401, 'UNAUTHORIZED', '請先登入');
	return ok({
		items: getVisibleReports(
			getState(),
			user,
			url.searchParams.get('restaurantId') ?? undefined,
			url.searchParams.get('userId') ?? undefined
		)
	});
};
