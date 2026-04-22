<svelte:options runes={false} />

<script lang="ts">
	import { buildDemoCsv, formatDateTime } from '$lib/spot-sign/domain';
	import { defaultArea, statusMeta } from '$lib/spot-sign/constants';
	import type { RestaurantStatus, RestaurantSummary } from '$lib/spot-sign/types';

	export let restaurants: (RestaurantSummary & { distanceMeters?: number })[] = [];
	export let employees: Array<{
		id: string;
		name: string;
		assignmentCount: number;
		lastReportAt: string | null;
	}> = [];
	export let reports: Array<{
		id: string;
		restaurantName: string;
		user: { name: string } | null;
		status: RestaurantStatus;
		visitedAt: string;
		notes: string;
	}> = [];
	export let reviewItems: Array<{
		id: string;
		rawName: string;
		rawAddress: string;
		geocodeStatus: 'failed' | 'duplicate_candidate';
		geocodeMessage: string;
		duplicateCandidateRestaurantId: string | null;
		resolutionStatus: string;
	}> = [];
	export let importJobs: Array<{
		id: string;
		status: string;
		sourceFilename: string;
		completedRows: number;
		failedRows: number;
	}> = [];
	export let selectedRestaurantId: string | null = null;
	export let selectedRepId = '';
	export let assignmentReason = '';
	export let assignmentHistory: Array<{
		id: string;
		fromUser: string;
		toUser: string;
		reason: string | null;
		assignedAt: string;
		assignedBy: string;
	}> = [];
	export let assignmentError = '';
	export let pendingAssignment = false;
	export let pendingImport = false;
	export let importError = '';
	export let onSelectRestaurant: (restaurantId: string) => void;
	export let onSelectRep: (repId: string) => void;
	export let onAssign: (payload: { toUserId: string; reason: string }) => Promise<void>;
	export let onImportCsv: (file: File) => Promise<void>;
	export let onResolveReview: (payload: {
		id: string;
		action: 'approve_create' | 'merge_existing' | 'retry_geocode' | 'reject_row';
		correctedAddress?: string;
		targetRestaurantId?: string | null;
	}) => Promise<void>;

	let demoCsv = buildDemoCsv();
	let correctedAddresses: Record<string, string> = {};

	function markerPosition(restaurant: RestaurantSummary) {
		const latSpan = 0.04;
		const lngSpan = 0.07;
		return {
			top: `${12 + ((defaultArea.latitude + latSpan / 2 - restaurant.latitude) / latSpan) * 72}%`,
			left: `${10 + ((restaurant.longitude - (defaultArea.longitude - lngSpan / 2)) / lngSpan) * 78}%`
		};
	}

	$: selectedRestaurant =
		restaurants.find((restaurant) => restaurant.id === selectedRestaurantId) ?? null;

	async function importDemoCsv() {
		const file = new File([demoCsv], 'spot-sign-demo.csv', { type: 'text/csv' });
		await onImportCsv(file);
	}
</script>

<section class="grid gap-4 xl:grid-cols-[18rem_minmax(0,1fr)_20rem]">
	<section class="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
		<div class="flex items-center justify-between">
			<h2 class="text-lg font-semibold text-slate-900">員工列表</h2>
			<span class="text-sm text-slate-500">主管工作台</span>
		</div>
		<div class="mt-4 space-y-3">
			{#each employees as employee (employee.id)}
				<button
					class:selected={selectedRepId === employee.id}
					class={`w-full rounded-2xl border px-3 py-3 text-left ${selectedRepId === employee.id ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-slate-50 text-slate-900'}`}
					on:click={() => onSelectRep(employee.id)}
				>
					<p class="font-semibold">{employee.name}</p>
					<p
						class={`mt-1 text-sm ${selectedRepId === employee.id ? 'text-slate-200' : 'text-slate-500'}`}
					>
						{employee.assignmentCount} 間餐廳 · 最近回報 {formatDateTime(employee.lastReportAt)}
					</p>
				</button>
			{/each}
		</div>
	</section>

	<section class="space-y-4">
		<div class="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
			<div class="flex items-center justify-between gap-3">
				<div>
					<h2 class="text-lg font-semibold text-slate-900">餐廳地圖</h2>
					<p class="text-sm text-slate-500">選擇業務 → 點餐廳 → 右側指派</p>
				</div>
				<span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
					>全部餐廳與狀態</span
				>
			</div>
			<div class="relative mt-4 h-[26rem] overflow-hidden rounded-[2rem] bg-slate-900">
				<div
					class="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.20),_transparent_40%),linear-gradient(160deg,#020617,#1e293b)]"
				></div>
				<div
					class="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.16)_1px,transparent_1px)] bg-[size:32px_32px]"
				></div>
				{#each restaurants as restaurant (restaurant.id)}
					<button
						class:selected={selectedRestaurantId === restaurant.id}
						class="selected:scale-110 absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white text-[11px] font-bold text-white shadow-lg transition hover:scale-105"
						style={`top:${markerPosition(restaurant).top};left:${markerPosition(restaurant).left};background:${statusMeta[restaurant.currentStatus].dot}`}
						on:click={() => onSelectRestaurant(restaurant.id)}
					>
						{statusMeta[restaurant.currentStatus].shortLabel.slice(0, 2)}
					</button>
				{/each}
			</div>
		</div>

		<div class="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
			<div class="flex items-center justify-between gap-3">
				<h2 class="text-lg font-semibold text-slate-900">全員回報</h2>
				<span class="text-sm text-slate-500">主管可看全部</span>
			</div>
			<div class="mt-4 space-y-3">
				{#each reports as report (report.id)}
					<div class="rounded-2xl border border-slate-200 p-3">
						<div class="flex items-center justify-between gap-3">
							<div>
								<p class="font-semibold text-slate-900">{report.restaurantName}</p>
								<p class="text-sm text-slate-500">
									{report.user?.name ?? '未知'} · {formatDateTime(report.visitedAt)}
								</p>
							</div>
							<span
								class={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusMeta[report.status].color}`}
							>
								{statusMeta[report.status].label}
							</span>
						</div>
						<p class="mt-3 text-sm text-slate-700">{report.notes || '無備註'}</p>
					</div>
				{/each}
			</div>
		</div>

		<div class="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
			<div class="flex items-center justify-between gap-3">
				<h2 class="text-lg font-semibold text-slate-900">CSV 匯入與 review flow</h2>
				<button
					class="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
					on:click={importDemoCsv}
					disabled={pendingImport}
				>
					{pendingImport ? '匯入中…' : '匯入示例 CSV'}
				</button>
			</div>
			<p class="mt-2 text-sm text-slate-500">
				成功 row 直接建餐廳，geocode 失敗與疑似重複會進 review queue。
			</p>
			<textarea class="mt-4 h-32 w-full rounded-2xl border-slate-300 text-sm" bind:value={demoCsv}
			></textarea>
			{#if importError}
				<p class="mt-3 rounded-2xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{importError}</p>
			{/if}
			<div class="mt-4 grid gap-3 lg:grid-cols-2">
				<div class="space-y-3 rounded-2xl bg-slate-50 p-4">
					<h3 class="font-semibold text-slate-900">匯入紀錄</h3>
					{#each importJobs as job (job.id)}
						<div class="rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
							<p class="font-medium text-slate-900">{job.sourceFilename}</p>
							<p class="mt-1">{job.status} · 成功 {job.completedRows} / review {job.failedRows}</p>
						</div>
					{/each}
				</div>
				<div class="space-y-3 rounded-2xl bg-slate-50 p-4">
					<h3 class="font-semibold text-slate-900">待 review 項目</h3>
					{#each reviewItems as item (item.id)}
						<div class="rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
							<p class="font-medium text-slate-900">{item.rawName}</p>
							<p class="mt-1">{item.rawAddress}</p>
							<p class="mt-1 text-rose-600">{item.geocodeMessage}</p>
							<input
								class="mt-3 w-full rounded-2xl border-slate-300"
								bind:value={correctedAddresses[item.id]}
								placeholder="修正地址後 retry geocode"
							/>
							<div class="mt-3 grid gap-2 sm:grid-cols-2">
								<button
									class="rounded-2xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
									on:click={() => onResolveReview({ id: item.id, action: 'approve_create' })}
								>
									直接建立
								</button>
								<button
									class="rounded-2xl bg-slate-700 px-3 py-2 text-xs font-semibold text-white"
									on:click={() =>
										onResolveReview({
											id: item.id,
											action: 'retry_geocode',
											correctedAddress: correctedAddresses[item.id]
										})}
								>
									重試 geocode
								</button>
								<button
									class="rounded-2xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white"
									on:click={() =>
										onResolveReview({
											id: item.id,
											action: 'merge_existing',
											targetRestaurantId: item.duplicateCandidateRestaurantId
										})}
									disabled={!item.duplicateCandidateRestaurantId}
								>
									合併既有
								</button>
								<button
									class="rounded-2xl bg-rose-600 px-3 py-2 text-xs font-semibold text-white"
									on:click={() => onResolveReview({ id: item.id, action: 'reject_row' })}
								>
									拒絕列
								</button>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</section>

	<section class="space-y-4">
		<div class="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
			<h2 class="text-lg font-semibold text-slate-900">指派面板</h2>
			{#if selectedRestaurant}
				<p class="mt-3 text-sm text-slate-500">已選擇餐廳</p>
				<h3 class="text-xl font-semibold text-slate-900">{selectedRestaurant.name}</h3>
				<p class="mt-1 text-sm text-slate-600">
					目前 owner：{selectedRestaurant.assignedUser?.name ?? '未指派'}
				</p>
				<label class="mt-4 block">
					<span class="mb-2 block text-sm font-medium text-slate-700">指派給</span>
					<select class="w-full rounded-2xl border-slate-300" bind:value={selectedRepId}>
						<option value="">請選擇業務</option>
						{#each employees as employee (employee.id)}
							<option value={employee.id}>{employee.name}</option>
						{/each}
					</select>
				</label>
				<label class="mt-4 block">
					<span class="mb-2 block text-sm font-medium text-slate-700">改派原因</span>
					<textarea
						class="min-h-24 w-full rounded-2xl border-slate-300"
						bind:value={assignmentReason}
						placeholder="餐廳已有 owner 時必填"
					></textarea>
				</label>
				{#if assignmentError}
					<p class="mt-3 rounded-2xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
						{assignmentError}
					</p>
				{/if}
				<button
					class="mt-4 w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
					on:click={() => onAssign({ toUserId: selectedRepId, reason: assignmentReason })}
					disabled={pendingAssignment || !selectedRepId}
				>
					{pendingAssignment ? '指派中…' : '確認指派'}
				</button>
			{:else}
				<p class="mt-3 text-sm text-slate-500">請先在地圖選擇餐廳。</p>
			{/if}
		</div>

		<div class="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
			<h2 class="text-lg font-semibold text-slate-900">assignment history</h2>
			<div class="mt-4 space-y-3">
				{#each assignmentHistory as item (item.id)}
					<div class="rounded-2xl border border-slate-200 p-3 text-sm text-slate-700">
						<p class="font-medium text-slate-900">{item.fromUser} → {item.toUser}</p>
						<p class="mt-1">{formatDateTime(item.assignedAt)} · 操作者 {item.assignedBy}</p>
						<p class="mt-1 text-slate-500">{item.reason ?? '首次指派'}</p>
					</div>
				{/each}
			</div>
		</div>
	</section>
</section>
