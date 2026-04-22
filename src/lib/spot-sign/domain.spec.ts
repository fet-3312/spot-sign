import { beforeEach, describe, expect, it } from 'vitest';
import {
	assignRestaurant,
	getVisibleReports,
	importRestaurantsFromCsv,
	submitReport
} from './domain';
import { getState, resetState } from '$lib/server/spot-sign/state';

describe('spot sign domain rules', () => {
	beforeEach(() => {
		resetState();
	});

	it('requires a reason when reassigning an already-owned restaurant and records assignment history', () => {
		const state = getState();
		const supervisor = state.users.find((user) => user.role === 'supervisor')!;
		const restaurant = state.restaurants.find((item) => item.id === 'rst_cafe_spring')!;

		const rejected = assignRestaurant(state, supervisor, restaurant.id, {
			toUserId: 'usr_rep_bob',
			expectedCurrentAssignedUserId: 'usr_rep_alice'
		});
		expect(rejected.ok).toBe(false);
		if (rejected.ok) throw new Error('expected reassignment validation failure');
		expect(rejected.status).toBe(400);

		const assigned = assignRestaurant(state, supervisor, restaurant.id, {
			toUserId: 'usr_rep_bob',
			reason: '晚班重整區域',
			expectedCurrentAssignedUserId: 'usr_rep_alice'
		});
		expect(assigned.ok).toBe(true);
		if (!assigned.ok) throw new Error('expected successful assignment');
		expect(restaurant.assignedUserId).toBe('usr_rep_bob');
		expect(state.assignmentHistories[0]?.reason).toBe('晚班重整區域');
	});

	it('limits report visibility for reps but allows supervisors to see all activity', () => {
		const state = getState();
		const rep = state.users.find((user) => user.id === 'usr_rep_alice')!;
		const supervisor = state.users.find((user) => user.role === 'supervisor')!;

		submitReport(state, rep, 'rst_noodle_lane', {
			contactName: '陳老闆',
			status: 'in_discussion',
			notes: '今天確認下週再訪。',
			photoKey: null,
			visitedAt: '2026-04-22T11:20:00Z'
		});

		const repReports = getVisibleReports(state, rep);
		const supervisorReports = getVisibleReports(state, supervisor);
		expect(repReports.every((report) => report.user?.id === rep.id)).toBe(true);
		expect(supervisorReports.length).toBeGreaterThanOrEqual(repReports.length);
	});

	it('sends duplicate and geocode failures into review flow during CSV import', () => {
		const state = getState();
		const supervisor = state.users.find((user) => user.role === 'supervisor')!;
		const csv = [
			'name,address',
			'春光咖啡,台北市大安區復興南路 1 段 120 號',
			'迷霧咖啡,fail lane 99',
			'晴日食堂,台北市信義區松壽路 20 號'
		].join('\n');

		const importJob = importRestaurantsFromCsv(state, supervisor, csv, 'restaurants.csv');
		expect(importJob.status).toBe('completed_with_review');
		expect(
			state.importReviewItems.some(
				(item) => item.importJobId === importJob.id && item.geocodeStatus === 'duplicate_candidate'
			)
		).toBe(true);
		expect(
			state.importReviewItems.some(
				(item) => item.importJobId === importJob.id && item.geocodeStatus === 'failed'
			)
		).toBe(true);
		expect(state.restaurants.some((restaurant) => restaurant.name === '晴日食堂')).toBe(true);
	});

	it('requires notes for not pursuing reports', () => {
		const state = getState();
		const rep = state.users.find((user) => user.id === 'usr_rep_alice')!;
		const result = submitReport(state, rep, 'rst_noodle_lane', {
			contactName: '陳老闆',
			status: 'not_pursuing',
			notes: '',
			photoKey: null,
			visitedAt: '2026-04-22T10:00:00Z'
		});
		expect(result.ok).toBe(false);
		if (result.ok) throw new Error('expected validation failure');
		expect(result.errors?.notes).toContain('暫不追蹤');
	});
});
