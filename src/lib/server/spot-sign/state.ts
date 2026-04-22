import { defaultArea } from '$lib/spot-sign/constants';
import { createRestaurant } from '$lib/spot-sign/domain';
import type { AppState, User } from '$lib/spot-sign/types';

const now = '2026-04-22T08:30:00Z';

function createSeedUsers() {
	return [
		{
			id: 'usr_rep_alice',
			name: '王小玲',
			email: 'rep@spotsign.test',
			password: 'rep-demo-123',
			role: 'rep',
			status: 'active'
		},
		{
			id: 'usr_rep_bob',
			name: '陳志豪',
			email: 'bob@spotsign.test',
			password: 'rep-demo-123',
			role: 'rep',
			status: 'active'
		},
		{
			id: 'usr_sup_amy',
			name: '林佩雯',
			email: 'supervisor@spotsign.test',
			password: 'super-demo-123',
			role: 'supervisor',
			status: 'active'
		}
	] satisfies User[];
}

function createSeedState(): AppState {
	const users = createSeedUsers();
	const state: AppState = {
		users,
		sessions: [],
		restaurants: [
			{
				id: 'rst_cafe_spring',
				name: '春光咖啡',
				addressText: '台北市大安區復興南路 1 段 120 號',
				latitude: 25.0413,
				longitude: 121.5434,
				currentStatus: 'in_discussion',
				currentContactName: '張店長',
				assignedUserId: 'usr_rep_alice',
				lastReportId: 'rpt_001',
				lastReportAt: '2026-04-21T10:40:00Z',
				sourceType: 'seed',
				geocodeStatus: 'verified',
				createdByUserId: 'usr_sup_amy',
				createdAt: now,
				updatedAt: now
			},
			{
				id: 'rst_noodle_lane',
				name: '巷口麵館',
				addressText: '台北市中山區長安東路 2 段 75 號',
				latitude: 25.0488,
				longitude: 121.5365,
				currentStatus: 'visited',
				currentContactName: '陳老闆',
				assignedUserId: null,
				lastReportId: 'rpt_002',
				lastReportAt: '2026-04-20T07:30:00Z',
				sourceType: 'seed',
				geocodeStatus: 'verified',
				createdByUserId: 'usr_sup_amy',
				createdAt: now,
				updatedAt: now
			},
			{
				id: 'rst_green_leaf',
				name: '綠葉小館',
				addressText: '台北市松山區南京東路 5 段 12 號',
				latitude: 25.0502,
				longitude: 121.567,
				currentStatus: 'new_lead',
				currentContactName: '',
				assignedUserId: 'usr_rep_bob',
				lastReportId: null,
				lastReportAt: null,
				sourceType: 'seed',
				geocodeStatus: 'verified',
				createdByUserId: 'usr_sup_amy',
				createdAt: now,
				updatedAt: now
			}
		],
		reports: [
			{
				id: 'rpt_001',
				restaurantId: 'rst_cafe_spring',
				userId: 'usr_rep_alice',
				contactName: '張店長',
				status: 'in_discussion',
				notes: '老闆願意在下週看合約條件。',
				photoKey: null,
				visitedAt: '2026-04-21T10:40:00Z',
				createdAt: '2026-04-21T10:42:00Z'
			},
			{
				id: 'rpt_002',
				restaurantId: 'rst_noodle_lane',
				userId: 'usr_rep_alice',
				contactName: '陳老闆',
				status: 'visited',
				notes: '已完成第一次介紹，請再追蹤。',
				photoKey: null,
				visitedAt: '2026-04-20T07:30:00Z',
				createdAt: '2026-04-20T07:32:00Z'
			}
		],
		assignmentHistories: [
			{
				id: 'ash_001',
				restaurantId: 'rst_cafe_spring',
				fromUserId: null,
				toUserId: 'usr_rep_alice',
				assignedByUserId: 'usr_sup_amy',
				reason: null,
				assignedAt: '2026-04-18T09:00:00Z'
			},
			{
				id: 'ash_002',
				restaurantId: 'rst_green_leaf',
				fromUserId: null,
				toUserId: 'usr_rep_bob',
				assignedByUserId: 'usr_sup_amy',
				reason: null,
				assignedAt: '2026-04-19T09:00:00Z'
			}
		],
		importJobs: [
			{
				id: 'imp_demo_001',
				createdByUserId: 'usr_sup_amy',
				sourceFilename: 'initial-seed.csv',
				totalRows: 2,
				completedRows: 1,
				failedRows: 1,
				status: 'completed_with_review',
				createdAt: '2026-04-20T09:00:00Z',
				completedAt: '2026-04-20T09:02:00Z'
			}
		],
		importReviewItems: [
			{
				id: 'rev_demo_001',
				importJobId: 'imp_demo_001',
				rawName: '霧巷茶屋',
				rawAddress: 'fail road 7',
				geocodeStatus: 'failed',
				geocodeMessage: '地址無法解析',
				duplicateCandidateRestaurantId: null,
				proposedLatitude: null,
				proposedLongitude: null,
				resolutionStatus: 'pending',
				resolvedByUserId: null,
				resolvedAt: null,
				createdAt: '2026-04-20T09:01:00Z'
			}
		],
		photos: [],
		defaultArea
	};

	const supervisor = users.find((user) => user.role === 'supervisor');
	if (supervisor) {
		createRestaurant(state, supervisor, {
			name: '港町食堂',
			addressText: '台北市大同區赤峰街 88 號',
			latitude: 25.055,
			longitude: 121.519,
			sourceType: 'import'
		});
	}

	return state;
}

let state = createSeedState();

export function getState() {
	return state;
}

export function resetState() {
	state = createSeedState();
	return state;
}

export function publicUser(user: User) {
	return {
		id: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
		status: user.status
	};
}
