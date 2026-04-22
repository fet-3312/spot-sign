<svelte:options runes={false} />

<script lang="ts">
	import { buildTodayLocalValue, formatDateTime } from '$lib/spot-sign/domain';
	import { statusMeta } from '$lib/spot-sign/constants';
	import type { RestaurantStatus, RestaurantSummary } from '$lib/spot-sign/types';

	export let restaurant: RestaurantSummary;
	export let reports: Array<{
		id: string;
		status: RestaurantStatus;
		notes: string;
		visitedAt: string;
		photoKey?: string | null;
	}> = [];
	export let onBack: () => void;
	export let onUploadPhoto: (file: File) => Promise<{ photoKey: string; previewUrl: string }>;
	export let onSubmit: (payload: {
		contactName: string;
		status: RestaurantStatus;
		notes: string;
		photoKey: string | null;
		visitedAt: string;
	}) => Promise<void>;
	export let error = '';
	export let pending = false;
	const statusOptions = Object.entries(statusMeta) as Array<
		[RestaurantStatus, (typeof statusMeta)[RestaurantStatus]]
	>;

	let contactName = '';
	let status: RestaurantStatus = 'new_lead';
	let notes = '';
	let visitedAt = buildTodayLocalValue();
	let uploadState = '';
	let photoKey: string | null = null;
	let previewUrl = '';

	$: if (restaurant) {
		contactName = restaurant.currentContactName;
		status = restaurant.currentStatus;
	}

	async function handlePhoto(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		uploadState = '上傳中…';
		try {
			const uploaded = await onUploadPhoto(file);
			photoKey = uploaded.photoKey;
			previewUrl = uploaded.previewUrl;
			uploadState = '已上傳照片';
		} catch (uploadError) {
			uploadState = uploadError instanceof Error ? uploadError.message : '照片上傳失敗';
		}
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		await onSubmit({
			contactName,
			status,
			notes,
			photoKey,
			visitedAt: new Date(visitedAt).toISOString()
		});
	}
</script>

<section class="space-y-4">
	<button class="text-sm font-semibold text-slate-600" on:click={onBack}>← 返回地圖</button>
	<div class="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
		<p
			class={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusMeta[restaurant.currentStatus].color}`}
		>
			{statusMeta[restaurant.currentStatus].label}
		</p>
		<h1 class="mt-3 text-2xl font-bold text-slate-900">{restaurant.name}</h1>
		<p class="mt-1 text-sm text-slate-600">{restaurant.addressText || '現場新增，尚未補地址'}</p>
		<p class="mt-2 text-sm text-slate-500">
			目前 owner：{restaurant.assignedUser?.name ?? '未指派'} · 最新回報：{formatDateTime(
				restaurant.lastReportAt
			)}
		</p>
	</div>

	<form
		class="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200"
		on:submit={handleSubmit}
	>
		<div class="space-y-5">
			<div>
				<p class="mb-2 block text-sm font-medium text-slate-700">狀態</p>
				<div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
					{#each statusOptions as [value, meta] (value)}
						<button
							class:selected={status === value}
							type="button"
							class={`rounded-2xl border px-3 py-3 text-sm font-medium ${status === value ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-slate-50 text-slate-700'}`}
							on:click={() => (status = value as RestaurantStatus)}
						>
							{meta.label}
						</button>
					{/each}
				</div>
			</div>

			<div class="grid gap-4 sm:grid-cols-2">
				<label class="block">
					<span class="mb-2 block text-sm font-medium text-slate-700">聯絡人</span>
					<input
						class="w-full rounded-2xl border-slate-300"
						bind:value={contactName}
						placeholder="例如：張店長"
					/>
				</label>
				<label class="block">
					<span class="mb-2 block text-sm font-medium text-slate-700">拜訪時間</span>
					<input
						class="w-full rounded-2xl border-slate-300"
						bind:value={visitedAt}
						type="datetime-local"
					/>
				</label>
			</div>

			<label class="block">
				<span class="mb-2 block text-sm font-medium text-slate-700">備註</span>
				<textarea
					class="min-h-28 w-full rounded-2xl border-slate-300"
					bind:value={notes}
					placeholder="快速補充今天的進度與阻塞"
				></textarea>
			</label>

			<div class="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-4">
				<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<p class="text-sm font-semibold text-slate-900">單張照片</p>
						<p class="text-sm text-slate-500">接受 JPEG / PNG / WebP，最多 10MB</p>
					</div>
					<label
						class="inline-flex cursor-pointer items-center justify-center rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
					>
						選擇照片
						<input
							class="hidden"
							type="file"
							accept="image/jpeg,image/png,image/webp"
							on:change={handlePhoto}
						/>
					</label>
				</div>
				{#if uploadState}
					<p class="mt-3 text-sm text-slate-600">{uploadState}</p>
				{/if}
				{#if previewUrl}
					<img
						class="mt-4 h-48 w-full rounded-2xl object-cover"
						alt="uploaded preview"
						src={previewUrl}
					/>
				{/if}
			</div>

			{#if error}
				<p class="rounded-2xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
			{/if}

			<button
				class="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
				type="submit"
				disabled={pending}
			>
				{pending ? '送出中…' : '完成本次回報'}
			</button>
		</div>
	</form>

	<section class="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
		<h2 class="text-lg font-semibold text-slate-900">可見歷史回報</h2>
		<p class="mt-1 text-sm text-slate-500">業務僅能查看自己的紀錄，主管可看全員。</p>
		<div class="mt-4 space-y-3">
			{#each reports as report (report.id)}
				<div class="rounded-2xl border border-slate-200 p-3">
					<div class="flex items-center justify-between gap-3">
						<span
							class={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusMeta[report.status].color}`}
						>
							{statusMeta[report.status].label}
						</span>
						<span class="text-sm text-slate-500">{formatDateTime(report.visitedAt)}</span>
					</div>
					<p class="mt-3 text-sm text-slate-700">{report.notes || '無備註'}</p>
				</div>
			{/each}
		</div>
	</section>
</section>
