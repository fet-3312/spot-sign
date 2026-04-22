import { defaultArea } from '$lib/spot-sign/constants';
import { createRestaurant, getNearbyRestaurantSummaries } from '$lib/spot-sign/domain';
import { getCurrentUser } from '$lib/server/spot-sign/auth';
import { fail, ok } from '$lib/server/spot-sign/http';
import { getState } from '$lib/server/spot-sign/state';
import type { RestaurantStatus } from '$lib/spot-sign/types';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ cookies, url }) => {
	const user = await getCurrentUser(cookies);
	if (!user) return fail(401, 'UNAUTHORIZED', '請先登入');
	const lat = Number(url.searchParams.get('lat') ?? defaultArea.latitude);
	const lng = Number(url.searchParams.get('lng') ?? defaultArea.longitude);
	const radiusMeters = Number(url.searchParams.get('radiusMeters') ?? defaultArea.radiusMeters);
	const status = url.searchParams.get('status') as RestaurantStatus | null;
	const assignedUserId = url.searchParams.get('assignedUserId') ?? undefined;
	return ok({
		items: getNearbyRestaurantSummaries(
			getState(),
			user,
			lat,
			lng,
			radiusMeters,
			status ?? undefined,
			assignedUserId
		)
	});
};

export const POST: RequestHandler = async ({ cookies, request }) => {
	const user = await getCurrentUser(cookies);
	if (!user) return fail(401, 'UNAUTHORIZED', '請先登入');
	const body = await request.json().catch(() => null);
	if (!body) return fail(400, 'VALIDATION_ERROR', 'Invalid JSON body');
	const created = createRestaurant(getState(), user, {
		name: String(body.name ?? ''),
		addressText: String(body.addressText ?? ''),
		latitude: Number(body.latitude),
		longitude: Number(body.longitude)
	});
	if (!created.ok)
		return fail(400, 'VALIDATION_ERROR', 'Restaurant validation failed', created.errors);
	return ok({ restaurant: { id: created.restaurant.id } }, 201);
};
