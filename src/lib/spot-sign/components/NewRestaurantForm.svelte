<svelte:options runes={false} />

<script lang="ts">
	export let onBack: () => void;
	export let onSubmit: (payload: {
		name: string;
		addressText: string;
		latitude: number;
		longitude: number;
	}) => Promise<void>;
	export let pending = false;
	export let error = '';
	export let positionLabel: string;

	let name = '';
	let addressText = '';
	let latitude = 25.0418;
	let longitude = 121.5435;

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		await onSubmit({ name, addressText, latitude, longitude });
	}
</script>

<section class="space-y-4">
	<button class="text-sm font-semibold text-slate-600" on:click={onBack}>← 返回地圖</button>
	<div class="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
		<h1 class="text-2xl font-bold text-slate-900">新增地圖上不存在的餐廳</h1>
		<p class="mt-2 text-sm text-slate-600">使用目前定位或手動修正座標，建立後可直接進入回報。</p>
		<p class="mt-2 rounded-2xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
			定位來源：{positionLabel}
		</p>
	</div>
	<form
		class="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200"
		on:submit={handleSubmit}
	>
		<div class="space-y-4">
			<label class="block">
				<span class="mb-2 block text-sm font-medium text-slate-700">餐廳名稱</span>
				<input
					class="w-full rounded-2xl border-slate-300"
					bind:value={name}
					placeholder="例如：晴日食堂"
				/>
			</label>
			<label class="block">
				<span class="mb-2 block text-sm font-medium text-slate-700">地址（選填）</span>
				<input
					class="w-full rounded-2xl border-slate-300"
					bind:value={addressText}
					placeholder="現場可先留簡短地址"
				/>
			</label>
			<div class="grid gap-4 sm:grid-cols-2">
				<label class="block">
					<span class="mb-2 block text-sm font-medium text-slate-700">緯度</span>
					<input
						class="w-full rounded-2xl border-slate-300"
						bind:value={latitude}
						type="number"
						step="0.000001"
					/>
				</label>
				<label class="block">
					<span class="mb-2 block text-sm font-medium text-slate-700">經度</span>
					<input
						class="w-full rounded-2xl border-slate-300"
						bind:value={longitude}
						type="number"
						step="0.000001"
					/>
				</label>
			</div>
			{#if error}
				<p class="rounded-2xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
			{/if}
			<button
				class="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
				type="submit"
				disabled={pending}
			>
				{pending ? '建立中…' : '建立餐廳並繼續回報'}
			</button>
		</div>
	</form>
</section>
