import { allowedTransitions, defaultArea, statusMeta } from './constants';
import type {
	AppState,
	AssignmentHistory,
	GeocodeStatus,
	ImportJob,
	ReportInput,
	Restaurant,
	RestaurantSummary,
	RestaurantStatus,
	ReviewAction,
	Role,
	User,
	VisitReport
} from './types';

const earthRadiusMeters = 6_371_000;
const geocodeHashMultiplier = 31;
const geocodeGridSize = 50;
const geocodeOffset = 25;
const geocodeDegreeFactor = 0.0012;

const twoDigits = (value: number) => value.toString().padStart(2, '0');

export function formatDateTime(value: string | null) {
	if (!value) return '尚無回報';

	return new Intl.DateTimeFormat('zh-TW', {
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit'
	}).format(new Date(value));
}

export function createId(prefix: string) {
	return `${prefix}_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
}

export function normalizeText(value: string) {
	return value.trim().toLowerCase();
}

export function haversineDistanceMeters(
	originLat: number,
	originLng: number,
	targetLat: number,
	targetLng: number
) {
	const toRadians = (value: number) => (value * Math.PI) / 180;
	const latDelta = toRadians(targetLat - originLat);
	const lngDelta = toRadians(targetLng - originLng);
	const startLat = toRadians(originLat);
	const endLat = toRadians(targetLat);
	const a =
		Math.sin(latDelta / 2) ** 2 +
		Math.cos(startLat) * Math.cos(endLat) * Math.sin(lngDelta / 2) ** 2;

	return 2 * earthRadiusMeters * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getRestaurantSummary(
	restaurant: Restaurant,
	users: User[],
	currentUserId: string
): RestaurantSummary {
	const assignedUser = users.find((user) => user.id === restaurant.assignedUserId);

	return {
		id: restaurant.id,
		name: restaurant.name,
		addressText: restaurant.addressText,
		latitude: restaurant.latitude,
		longitude: restaurant.longitude,
		currentStatus: restaurant.currentStatus,
		currentContactName: restaurant.currentContactName,
		assignedUser: assignedUser ? { id: assignedUser.id, name: assignedUser.name } : null,
		lastReportAt: restaurant.lastReportAt,
		isOwnedByCurrentUser: restaurant.assignedUserId === currentUserId
	};
}

export function getNearbyRestaurantSummaries(
	state: AppState,
	currentUser: User,
	lat: number,
	lng: number,
	radiusMeters = defaultArea.radiusMeters,
	status?: RestaurantStatus,
	assignedUserId?: string
) {
	const filtered = state.restaurants
		.filter((restaurant) => {
			if (status && restaurant.currentStatus !== status) return false;
			if (assignedUserId && restaurant.assignedUserId !== assignedUserId) return false;
			const distance = haversineDistanceMeters(lat, lng, restaurant.latitude, restaurant.longitude);
			return distance <= radiusMeters;
		})
		.map((restaurant) => ({
			...getRestaurantSummary(restaurant, state.users, currentUser.id),
			distanceMeters: haversineDistanceMeters(lat, lng, restaurant.latitude, restaurant.longitude)
		}))
		.sort((left, right) => left.distanceMeters - right.distanceMeters);

	return currentUser.role === 'supervisor'
		? filtered
		: filtered.filter((restaurant) => !restaurant.assignedUser || restaurant.isOwnedByCurrentUser);
}

function getRequiredReportErrors(
	restaurant: Restaurant,
	reports: VisitReport[],
	input: ReportInput
): Record<string, string> {
	const errors: Record<string, string> = {};

	if (!input.status) {
		errors.status = '請選擇狀態';
	}

	if (!input.visitedAt) {
		errors.visitedAt = '請填寫拜訪時間';
	}

	if (input.notes.length > 2000) {
		errors.notes = '備註不可超過 2000 字';
	}

	if (
		['in_discussion', 'awaiting_signature', 'signed'].includes(input.status) &&
		!input.contactName.trim()
	) {
		errors.contactName = '此狀態需要填寫聯絡人';
	}

	if (input.status === 'not_pursuing' && !input.notes.trim()) {
		errors.notes = '暫不追蹤需要留下原因';
	}

	const restaurantReportCount = reports.filter(
		(report) => report.restaurantId === restaurant.id
	).length;
	if (
		restaurant.sourceType === 'field' &&
		restaurantReportCount === 0 &&
		input.status === 'new_lead' &&
		!input.notes.trim()
	) {
		errors.notes = '現場建立的新名單第一次回報需要備註';
	}

	if (
		restaurant.currentStatus &&
		input.status &&
		restaurant.currentStatus !== input.status &&
		!allowedTransitions[restaurant.currentStatus].includes(input.status)
	) {
		errors.status = `狀態不可由「${statusMeta[restaurant.currentStatus].label}」直接切換至「${statusMeta[input.status].label}」`;
	}

	return errors;
}

export function createRestaurant(
	state: AppState,
	actor: User,
	input: {
		name: string;
		addressText: string;
		latitude: number;
		longitude: number;
		sourceType?: Restaurant['sourceType'];
	}
) {
	const errors: Record<string, string> = {};

	if (!input.name.trim()) {
		errors.name = '餐廳名稱必填';
	}

	if (input.name.trim().length > 120) {
		errors.name = '餐廳名稱不可超過 120 字';
	}

	if (!Number.isFinite(input.latitude)) {
		errors.latitude = '請提供緯度';
	}

	if (!Number.isFinite(input.longitude)) {
		errors.longitude = '請提供經度';
	}

	if (input.addressText.length > 255) {
		errors.addressText = '地址不可超過 255 字';
	}

	if (Object.keys(errors).length > 0) {
		return { ok: false as const, errors };
	}

	const now = new Date().toISOString();
	const restaurant: Restaurant = {
		id: createId('rst'),
		name: input.name.trim(),
		addressText: input.addressText.trim(),
		latitude: input.latitude,
		longitude: input.longitude,
		currentStatus: 'new_lead',
		currentContactName: '',
		assignedUserId: null,
		lastReportId: null,
		lastReportAt: null,
		sourceType: input.sourceType ?? 'field',
		geocodeStatus: input.sourceType === 'import' ? 'verified' : 'manual',
		createdByUserId: actor.id,
		createdAt: now,
		updatedAt: now
	};

	state.restaurants.unshift(restaurant);
	return { ok: true as const, restaurant };
}

export function submitReport(
	state: AppState,
	actor: User,
	restaurantId: string,
	input: ReportInput
) {
	const restaurant = state.restaurants.find((item) => item.id === restaurantId);
	if (!restaurant) {
		return { ok: false as const, status: 404, code: 'NOT_FOUND', message: 'Restaurant not found' };
	}

	const errors = getRequiredReportErrors(restaurant, state.reports, input);
	if (Object.keys(errors).length > 0) {
		return {
			ok: false as const,
			status: 400,
			code: 'VALIDATION_ERROR',
			message: 'Invalid report',
			errors
		};
	}

	const now = new Date().toISOString();
	const report: VisitReport = {
		id: createId('rpt'),
		restaurantId: restaurant.id,
		userId: actor.id,
		contactName: input.contactName.trim(),
		status: input.status,
		notes: input.notes.trim(),
		photoKey: input.photoKey,
		visitedAt: input.visitedAt,
		createdAt: now
	};

	state.reports.unshift(report);
	if (report.photoKey) {
		const photo = state.photos.find((item) => item.photoKey === report.photoKey);
		if (photo) photo.reportId = report.id;
	}

	restaurant.currentStatus = report.status;
	restaurant.currentContactName = report.contactName;
	restaurant.lastReportId = report.id;
	restaurant.lastReportAt = report.visitedAt;
	restaurant.updatedAt = now;

	return {
		ok: true as const,
		report,
		restaurantSummary: {
			currentStatus: restaurant.currentStatus,
			currentContactName: restaurant.currentContactName,
			lastReportAt: restaurant.lastReportAt
		}
	};
}

export function getVisibleReports(
	state: AppState,
	actor: User,
	restaurantId?: string,
	userId?: string
) {
	return state.reports
		.filter((report) => {
			if (restaurantId && report.restaurantId !== restaurantId) return false;
			if (actor.role !== 'supervisor' && report.userId !== actor.id) return false;
			if (actor.role === 'supervisor' && userId && report.userId !== userId) return false;
			return true;
		})
		.map((report) => ({
			...report,
			restaurantName:
				state.restaurants.find((restaurant) => restaurant.id === report.restaurantId)?.name ??
				'未知餐廳',
			user: (() => {
				const user = state.users.find((item) => item.id === report.userId);
				return user ? { id: user.id, name: user.name } : null;
			})()
		}));
}

export function getEmployeeSnapshots(state: AppState) {
	return state.users
		.filter((user) => user.role === 'rep' && user.status === 'active')
		.map((user) => {
			const assignmentCount = state.restaurants.filter(
				(restaurant) => restaurant.assignedUserId === user.id
			).length;
			const lastReportAt =
				state.reports.find((report) => report.userId === user.id)?.createdAt ?? null;
			return {
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.role,
				status: user.status,
				assignmentCount,
				lastReportAt
			};
		})
		.sort((left, right) => left.name.localeCompare(right.name, 'zh-Hant'));
}

export function assignRestaurant(
	state: AppState,
	actor: User,
	restaurantId: string,
	input: { toUserId: string; reason?: string; expectedCurrentAssignedUserId?: string | null }
) {
	const restaurant = state.restaurants.find((item) => item.id === restaurantId);
	if (!restaurant) {
		return { ok: false as const, status: 404, code: 'NOT_FOUND', message: 'Restaurant not found' };
	}

	const targetUser = state.users.find(
		(user) => user.id === input.toUserId && user.role === 'rep' && user.status === 'active'
	);
	if (!targetUser) {
		return {
			ok: false as const,
			status: 400,
			code: 'VALIDATION_ERROR',
			message: 'Invalid assignee',
			errors: { toUserId: '只能指派給啟用中的業務' }
		};
	}

	if (restaurant.assignedUserId && !input.reason?.trim()) {
		return {
			ok: false as const,
			status: 400,
			code: 'VALIDATION_ERROR',
			message: 'Reason required',
			errors: { reason: '改派既有 owner 時必須填寫原因' }
		};
	}

	if (restaurant.assignedUserId !== (input.expectedCurrentAssignedUserId ?? null)) {
		return {
			ok: false as const,
			status: 409,
			code: 'ASSIGNMENT_CONFLICT',
			message: 'Current owner has changed'
		};
	}

	const assignment: AssignmentHistory = {
		id: createId('ash'),
		restaurantId,
		fromUserId: restaurant.assignedUserId,
		toUserId: targetUser.id,
		assignedByUserId: actor.id,
		reason: restaurant.assignedUserId ? (input.reason?.trim() ?? null) : null,
		assignedAt: new Date().toISOString()
	};

	restaurant.assignedUserId = targetUser.id;
	restaurant.updatedAt = assignment.assignedAt;
	state.assignmentHistories.unshift(assignment);

	return { ok: true as const, assignment };
}

function parseCsvLine(line: string) {
	const result: string[] = [];
	let current = '';
	let inQuotes = false;

	for (let index = 0; index < line.length; index += 1) {
		const char = line[index];
		if (char === '"') {
			if (inQuotes && line[index + 1] === '"') {
				current += '"';
				index += 1;
			} else {
				inQuotes = !inQuotes;
			}
			continue;
		}

		if (char === ',' && !inQuotes) {
			result.push(current.trim());
			current = '';
			continue;
		}

		current += char;
	}

	result.push(current.trim());
	return result;
}

export function parseCsv(content: string) {
	const lines = content
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter(Boolean);
	if (lines.length === 0) return [];

	const headers = parseCsvLine(lines[0]).map((header) => normalizeText(header));
	return lines.slice(1).map((line) => {
		const cells = parseCsvLine(line);
		const record: Record<string, string> = {};
		headers.forEach((header, index) => {
			record[header] = cells[index] ?? '';
		});
		return record;
	});
}

function geocodeAddress(
	name: string,
	address: string
): {
	status: GeocodeStatus;
	message: string;
	latitude: number | null;
	longitude: number | null;
} {
	const normalizedAddress = normalizeText(address);
	if (!normalizedAddress || normalizedAddress.includes('fail')) {
		return { status: 'failed', message: '地址無法解析', latitude: null, longitude: null };
	}

	const seed = `${normalizeText(name)}:${normalizedAddress}`;
	let hash = 0;
	// TODO: Replace this demo-only geocoder with a real provider adapter before production use.
	// Use a deterministic string hash so the in-memory MVP returns stable pseudo-random coordinates.
	for (const char of seed) hash = (hash * geocodeHashMultiplier + char.charCodeAt(0)) % 10_000;
	const latitude =
		defaultArea.latitude + ((hash % geocodeGridSize) - geocodeOffset) * geocodeDegreeFactor;
	const longitude =
		defaultArea.longitude +
		(((hash / geocodeGridSize) % geocodeGridSize) - geocodeOffset) * geocodeDegreeFactor;
	return { status: 'success', message: 'ok', latitude, longitude };
}

function updateImportJobSummary(state: AppState, importJobId: string) {
	const job = state.importJobs.find((item) => item.id === importJobId);
	if (!job) return;

	const relatedItems = state.importReviewItems.filter((item) => item.importJobId === importJobId);
	job.failedRows = relatedItems.length;
	job.completedRows = Math.max(job.totalRows - job.failedRows, 0);
	job.status = relatedItems.length === 0 ? 'completed' : 'completed_with_review';
	job.completedAt = new Date().toISOString();
}

export function importRestaurantsFromCsv(
	state: AppState,
	actor: User,
	content: string,
	sourceFilename: string
) {
	const rows = parseCsv(content);
	const importJob: ImportJob = {
		id: createId('imp'),
		createdByUserId: actor.id,
		sourceFilename,
		totalRows: rows.length,
		completedRows: 0,
		failedRows: 0,
		status: 'processing',
		createdAt: new Date().toISOString(),
		completedAt: null
	};

	state.importJobs.unshift(importJob);

	for (const row of rows) {
		const rawName = row.name?.trim() ?? '';
		const rawAddress = row.address?.trim() ?? '';
		if (!rawName || !rawAddress) continue;

		const duplicateCandidate = state.restaurants.find(
			(restaurant) =>
				normalizeText(restaurant.name) === normalizeText(rawName) ||
				(normalizeText(restaurant.addressText) &&
					normalizeText(rawAddress) &&
					normalizeText(restaurant.addressText) === normalizeText(rawAddress))
		);
		if (duplicateCandidate) {
			state.importReviewItems.unshift({
				id: createId('rev'),
				importJobId: importJob.id,
				rawName,
				rawAddress,
				geocodeStatus: 'duplicate_candidate',
				geocodeMessage: '疑似重複餐廳',
				duplicateCandidateRestaurantId: duplicateCandidate.id,
				proposedLatitude: null,
				proposedLongitude: null,
				resolutionStatus: 'pending',
				resolvedByUserId: null,
				resolvedAt: null,
				createdAt: new Date().toISOString()
			});
			continue;
		}

		const geocode = geocodeAddress(rawName, rawAddress);
		if (geocode.status !== 'success') {
			state.importReviewItems.unshift({
				id: createId('rev'),
				importJobId: importJob.id,
				rawName,
				rawAddress,
				geocodeStatus: 'failed',
				geocodeMessage: geocode.message,
				duplicateCandidateRestaurantId: null,
				proposedLatitude: null,
				proposedLongitude: null,
				resolutionStatus: 'pending',
				resolvedByUserId: null,
				resolvedAt: null,
				createdAt: new Date().toISOString()
			});
			continue;
		}

		createRestaurant(state, actor, {
			name: rawName,
			addressText: rawAddress,
			latitude: geocode.latitude ?? defaultArea.latitude,
			longitude: geocode.longitude ?? defaultArea.longitude,
			sourceType: 'import'
		});
	}

	updateImportJobSummary(state, importJob.id);
	return importJob;
}

export function resolveReviewItem(
	state: AppState,
	actor: User,
	reviewItemId: string,
	input: {
		action: ReviewAction;
		correctedName?: string;
		correctedAddress?: string;
		correctedLatitude?: number;
		correctedLongitude?: number;
		targetRestaurantId?: string | null;
	}
) {
	const item = state.importReviewItems.find((entry) => entry.id === reviewItemId);
	if (!item) {
		return { ok: false as const, status: 404, code: 'NOT_FOUND', message: 'Review item not found' };
	}

	const errors: Record<string, string> = {};
	if (input.action === 'merge_existing' && !input.targetRestaurantId) {
		errors.targetRestaurantId = '合併既有餐廳時必須指定目標';
	}
	if (
		input.action === 'approve_create' &&
		(!Number.isFinite(input.correctedLatitude) || !Number.isFinite(input.correctedLongitude))
	) {
		errors.correctedLatitude = '建立餐廳時必須提供座標';
	}
	if (
		input.action === 'retry_geocode' &&
		!(input.correctedAddress?.trim() || item.rawAddress.trim())
	) {
		errors.correctedAddress = '重試 geocode 時必須有地址';
	}

	if (Object.keys(errors).length > 0) {
		return {
			ok: false as const,
			status: 400,
			code: 'VALIDATION_ERROR',
			message: 'Invalid resolution',
			errors
		};
	}

	const now = new Date().toISOString();
	if (input.action === 'approve_create') {
		createRestaurant(state, actor, {
			name: input.correctedName?.trim() || item.rawName,
			addressText: input.correctedAddress?.trim() || item.rawAddress,
			latitude: input.correctedLatitude!,
			longitude: input.correctedLongitude!,
			sourceType: 'import'
		});
		item.resolutionStatus = 'resolved';
	}

	if (input.action === 'merge_existing') {
		item.resolutionStatus = 'resolved';
	}

	if (input.action === 'retry_geocode') {
		const retriedAddress = input.correctedAddress?.trim() || item.rawAddress;
		const geocode = geocodeAddress(input.correctedName?.trim() || item.rawName, retriedAddress);
		if (geocode.status === 'success') {
			createRestaurant(state, actor, {
				name: input.correctedName?.trim() || item.rawName,
				addressText: retriedAddress,
				latitude: geocode.latitude ?? defaultArea.latitude,
				longitude: geocode.longitude ?? defaultArea.longitude,
				sourceType: 'import'
			});
			item.resolutionStatus = 'resolved';
			item.geocodeMessage = '已修正後重試並建立餐廳';
		} else {
			item.rawAddress = retriedAddress;
			item.geocodeMessage = geocode.message;
		}
	}

	if (input.action === 'reject_row') {
		item.resolutionStatus = 'rejected';
	}

	item.resolvedByUserId = actor.id;
	item.resolvedAt = now;
	updateImportJobSummary(state, item.importJobId);
	return { ok: true as const, reviewItem: item };
}

export function getAssignmentHistory(state: AppState, restaurantId: string) {
	return state.assignmentHistories
		.filter((entry) => entry.restaurantId === restaurantId)
		.map((entry) => ({
			...entry,
			fromUser: entry.fromUserId
				? (state.users.find((user) => user.id === entry.fromUserId)?.name ?? '未知')
				: '未指派',
			toUser: state.users.find((user) => user.id === entry.toUserId)?.name ?? '未知',
			assignedBy: state.users.find((user) => user.id === entry.assignedByUserId)?.name ?? '未知'
		}));
}

export function getRoleHome(role: Role) {
	return role === 'supervisor' ? '主管工作台' : '地圖首頁';
}

export function buildDemoCsv() {
	return [
		'name,address',
		'晴日食堂,台北市大安區和平東路 1 號',
		'迷霧咖啡,fail lane 99',
		'赤峰麵屋,台北市中山區赤峰街 20 號'
	].join('\n');
}

export function buildTodayLocalValue() {
	const current = new Date();
	return `${current.getFullYear()}-${twoDigits(current.getMonth() + 1)}-${twoDigits(current.getDate())}T${twoDigits(current.getHours())}:${twoDigits(current.getMinutes())}`;
}
