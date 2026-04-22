import type { DefaultArea, RestaurantStatus } from './types';

export const defaultArea: DefaultArea = {
	latitude: 25.0418,
	longitude: 121.5435,
	radiusMeters: 2200,
	label: '台北試營運區'
};

export const statusOrder: RestaurantStatus[] = [
	'new_lead',
	'visited',
	'in_discussion',
	'awaiting_signature',
	'signed',
	'not_pursuing'
];

export const statusMeta: Record<
	RestaurantStatus,
	{
		label: string;
		shortLabel: string;
		color: string;
		dot: string;
		description: string;
	}
> = {
	new_lead: {
		label: '新名單',
		shortLabel: '新名單',
		color: 'bg-slate-100 text-slate-700 ring-slate-200',
		dot: '#64748b',
		description: '剛建立，尚未完成有效接觸'
	},
	visited: {
		label: '已接觸',
		shortLabel: '已接觸',
		color: 'bg-sky-100 text-sky-700 ring-sky-200',
		dot: '#0284c7',
		description: '已到訪或已直接聯繫'
	},
	in_discussion: {
		label: '洽談中',
		shortLabel: '洽談',
		color: 'bg-amber-100 text-amber-700 ring-amber-200',
		dot: '#d97706',
		description: '雙方正在討論合作條件'
	},
	awaiting_signature: {
		label: '待簽約',
		shortLabel: '待簽',
		color: 'bg-violet-100 text-violet-700 ring-violet-200',
		dot: '#7c3aed',
		description: '已達成口頭共識，待完成簽約'
	},
	signed: {
		label: '已簽約',
		shortLabel: '已簽',
		color: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
		dot: '#059669',
		description: '合約已簽署'
	},
	not_pursuing: {
		label: '暫不追蹤',
		shortLabel: '暫停',
		color: 'bg-rose-100 text-rose-700 ring-rose-200',
		dot: '#e11d48',
		description: '暫時停止跟進，需要留下原因'
	}
};

export const allowedTransitions: Record<RestaurantStatus, RestaurantStatus[]> = {
	new_lead: ['visited', 'in_discussion', 'not_pursuing'],
	visited: ['in_discussion', 'awaiting_signature', 'not_pursuing'],
	in_discussion: ['awaiting_signature', 'signed', 'not_pursuing'],
	awaiting_signature: ['signed', 'in_discussion', 'not_pursuing'],
	signed: ['in_discussion'],
	not_pursuing: ['new_lead', 'visited']
};

export const acceptedPhotoTypes = ['image/jpeg', 'image/png', 'image/webp'];
export const maxPhotoBytes = 10 * 1024 * 1024;
export const sessionCookieName = 'spot_sign_session';
export const sessionTtlMs = 1000 * 60 * 60 * 24 * 7;
