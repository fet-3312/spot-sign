import { getAssignmentHistory, getRestaurantSummary } from '$lib/spot-sign/domain';
import { getCurrentUser } from '$lib/server/spot-sign/auth';
import { fail, ok } from '$lib/server/spot-sign/http';
import { getState } from '$lib/server/spot-sign/state';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ cookies, params }) => {
	const user = await getCurrentUser(cookies);
	if (!user) return fail(401, 'UNAUTHORIZED', '請先登入');
	const state = getState();
	const restaurant = state.restaurants.find((item) => item.id === params.id);
	if (!restaurant) return fail(404, 'NOT_FOUND', 'Restaurant not found');
	return ok({
		restaurant: getRestaurantSummary(restaurant, state.users, user.id),
		assignmentHistory: getAssignmentHistory(state, restaurant.id)
	});
};

export const PATCH: RequestHandler = async ({ cookies, request, params }) => {
	const user = await getCurrentUser(cookies);
	if (!user) return fail(401, 'UNAUTHORIZED', '請先登入');
	if (user.role !== 'supervisor') return fail(403, 'FORBIDDEN', '僅主管可修正餐廳主檔');
	const state = getState();
	const restaurant = state.restaurants.find((item) => item.id === params.id);
	if (!restaurant) return fail(404, 'NOT_FOUND', 'Restaurant not found');
	const body = await request.json().catch(() => null);
	if (!body) return fail(400, 'VALIDATION_ERROR', 'Invalid JSON body');
	const errors: Record<string, string> = {};
	const name = String(body.name ?? restaurant.name).trim();
	const addressText = String(body.addressText ?? restaurant.addressText).trim();
	const latitude = Number(body.latitude ?? restaurant.latitude);
	const longitude = Number(body.longitude ?? restaurant.longitude);
	if (!name) errors.name = '餐廳名稱必填';
	if (!Number.isFinite(latitude)) errors.latitude = '緯度格式錯誤';
	if (!Number.isFinite(longitude)) errors.longitude = '經度格式錯誤';
	if (Object.keys(errors).length > 0)
		return fail(400, 'VALIDATION_ERROR', 'Invalid restaurant master data', errors);
	restaurant.name = name;
	restaurant.addressText = addressText;
	restaurant.latitude = latitude;
	restaurant.longitude = longitude;
	restaurant.updatedAt = new Date().toISOString();
	return ok({ restaurant: { id: restaurant.id, updatedAt: restaurant.updatedAt } });
};
