<svelte:options runes={false} />

<script lang="ts">
	import { formatDateTime } from '$lib/spot-sign/domain';
	import { statusMeta } from '$lib/spot-sign/constants';
	import type { RestaurantSummary, RestaurantStatus } from '$lib/spot-sign/types';

	export let restaurants: (RestaurantSummary & { distanceMeters?: number })[] = [];
	export let selectedRestaurantId: string | null = null;
	export let search = '';
	export let statusFilter: '' | RestaurantStatus = '';
	export let locationLabel: string;
	export let locationStatus: string;
	export let onSelect: (restaurantId: string) => void;
	export let onStartReport: (restaurantId: string) => void;
	export let onAddRestaurant: () => void;
	export let onSearchChange: (value: string) => void;
	export let onStatusFilterChange: (value: '' | RestaurantStatus) => void;
	export let showMyReports = false;
	export let reports: Array<{
		id: string;
		restaurantName: string;
		status: RestaurantStatus;
		visitedAt: string;
	}> = [];

	const statusOptions = Object.entries(statusMeta) as Array<
		[RestaurantStatus, (typeof statusMeta)[RestaurantStatus]]
	>;

	$: markerBounds = {
		minLat: Math.min(...restaurants.map((restaurant) => restaurant.latitude), 25.03),
		maxLat: Math.max(...restaurants.map((restaurant) => restaurant.latitude), 25.06),
		minLng: Math.min(...restaurants.map((restaurant) => restaurant.longitude), 121.51),
		maxLng: Math.max(...restaurants.map((restaurant) => restaurant.longitude), 121.57)
	};

	function markerPosition(restaurant: RestaurantSummary) {
		const latSpan = markerBounds.maxLat - markerBounds.minLat || 0.01;
		const lngSpan = markerBounds.maxLng - markerBounds.minLng || 0.01;
		return {
			top: `${12 + ((markerBounds.maxLat - restaurant.latitude) / latSpan) * 72}%`,
			left: `${10 + ((restaurant.longitude - markerBounds.minLng) / lngSpan) * 78}%`
		};
	}

	$: filteredRestaurants = restaurants.filter((restaurant) => {
		const matchesSearch =
			!search.trim() ||
			restaurant.name.includes(search.trim()) ||
			restaurant.addressText.includes(search.trim());
		const matchesStatus = !statusFilter || restaurant.currentStatus === statusFilter;
		return matchesSearch && matchesStatus;
	});
	$: selectedRestaurant =
		filteredRestaurants.find((restaurant) => restaurant.id === selectedRestaurantId) ??
		filteredRestaurants[0] ??
		null;
</script>

<section class="space-y-4">
	<div class="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
		<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<h2 class="text-lg font-semibold text-slate-900">地圖首頁</h2>
				<p class="text-sm text-slate-600">{locationLabel} · {locationStatus}</p>
			</div>
			<button
				class="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
				on:click={onAddRestaurant}
			>
				新增地圖上不存在的餐廳
			</button>
		</div>

		<div class="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_11rem]">
			<input
				class="rounded-2xl border-slate-300"
				placeholder="搜尋餐廳或地址"
				value={search}
				on:input={(event) => onSearchChange((event.currentTarget as HTMLInputElement).value)}
			/>
			<select
				class="rounded-2xl border-slate-300"
				value={statusFilter}
				on:change={(event) =>
					onStatusFilterChange(
						(event.currentTarget as HTMLSelectElement).value as '' | RestaurantStatus
					)}
			>
				<option value="">全部狀態</option>
				{#each statusOptions as [value, meta] (value)}
					<option {value}>{meta.label}</option>
				{/each}
			</select>
		</div>

		<div class="relative mt-4 h-[26rem] overflow-hidden rounded-[2rem] bg-slate-900 text-white">
			<div
				class="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(52,211,153,0.24),_transparent_40%),linear-gradient(160deg,#0f172a,#1e293b)]"
			></div>
			<div
				class="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.16)_1px,transparent_1px)] bg-[size:32px_32px]"
			></div>
			{#each filteredRestaurants as restaurant (restaurant.id)}
				<button
					class:selected={selectedRestaurant?.id === restaurant.id}
					class="selected:scale-110 absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white text-xs font-bold text-white shadow-lg transition hover:scale-105"
					style={`top:${markerPosition(restaurant).top};left:${markerPosition(restaurant).left};background:${statusMeta[restaurant.currentStatus].dot}`}
					on:click={() => onSelect(restaurant.id)}
				>
					{statusMeta[restaurant.currentStatus].shortLabel.slice(0, 2)}
				</button>
			{/each}
			<div class="absolute bottom-4 left-4 rounded-2xl bg-white/10 px-3 py-2 text-xs backdrop-blur">
				{filteredRestaurants.length} 間餐廳 · 點擊 marker 開啟摘要
			</div>
		</div>
	</div>

	{#if selectedRestaurant}
		<section class="rounded-[2rem] bg-white p-5 shadow-lg ring-1 ring-slate-200">
			<div class="flex items-start justify-between gap-4">
				<div>
					<p
						class={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusMeta[selectedRestaurant.currentStatus].color}`}
					>
						{statusMeta[selectedRestaurant.currentStatus].label}
					</p>
					<h3 class="mt-3 text-xl font-semibold text-slate-900">{selectedRestaurant.name}</h3>
					<p class="mt-1 text-sm text-slate-600">
						{selectedRestaurant.addressText || '現場新增，尚未補地址'}
					</p>
				</div>
				<p class="text-xs text-slate-500">bottom sheet 摘要</p>
			</div>
			<dl class="mt-4 grid gap-3 text-sm sm:grid-cols-3">
				<div class="rounded-2xl bg-slate-50 p-3">
					<dt class="text-slate-500">目前 owner</dt>
					<dd class="mt-1 font-medium text-slate-900">
						{selectedRestaurant.assignedUser?.name ?? '未指派'}
					</dd>
				</div>
				<div class="rounded-2xl bg-slate-50 p-3">
					<dt class="text-slate-500">聯絡人</dt>
					<dd class="mt-1 font-medium text-slate-900">
						{selectedRestaurant.currentContactName || '尚未填寫'}
					</dd>
				</div>
				<div class="rounded-2xl bg-slate-50 p-3">
					<dt class="text-slate-500">最新回報</dt>
					<dd class="mt-1 font-medium text-slate-900">
						{formatDateTime(selectedRestaurant.lastReportAt)}
					</dd>
				</div>
			</dl>
			<button
				class="mt-4 w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white"
				on:click={() => onStartReport(selectedRestaurant.id)}
			>
				開始回報
			</button>
		</section>
	{/if}

	{#if showMyReports}
		<section class="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
			<div class="flex items-center justify-between">
				<h3 class="text-lg font-semibold text-slate-900">我的回報</h3>
				<span class="text-sm text-slate-500">僅顯示本人紀錄</span>
			</div>
			<div class="mt-4 space-y-3">
				{#each reports as report (report.id)}
					<div class="rounded-2xl border border-slate-200 p-3">
						<div class="flex items-center justify-between gap-3">
							<div>
								<p class="font-medium text-slate-900">{report.restaurantName}</p>
								<p class="text-sm text-slate-500">{formatDateTime(report.visitedAt)}</p>
							</div>
							<span
								class={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusMeta[report.status].color}`}
							>
								{statusMeta[report.status].label}
							</span>
						</div>
					</div>
				{/each}
			</div>
		</section>
	{/if}
</section>
