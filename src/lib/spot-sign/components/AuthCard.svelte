<svelte:options runes={false} />

<script lang="ts">
	export let onLogin: (payload: { email: string; password: string }) => Promise<void>;
	export let pending = false;
	export let error = '';

	let email = 'rep@spotsign.test';
	let password = 'rep-demo-123';

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		await onLogin({ email, password });
	}
</script>

<div class="mx-auto flex min-h-screen max-w-md items-center px-4 py-8">
	<div class="w-full rounded-3xl bg-white p-6 shadow-lg ring-1 ring-slate-200">
		<p class="text-sm font-semibold text-emerald-600">Spot Sign MVP</p>
		<h1 class="mt-2 text-3xl font-bold text-slate-900">登入並進入對應介面</h1>
		<p class="mt-2 text-sm text-slate-600">依角色切換至業務地圖工作流或主管管理工作台。</p>

		<form class="mt-6 space-y-4" on:submit={handleSubmit}>
			<label class="block">
				<span class="mb-1 block text-sm font-medium text-slate-700">Email</span>
				<input class="w-full rounded-2xl border-slate-300" bind:value={email} type="email" />
			</label>
			<label class="block">
				<span class="mb-1 block text-sm font-medium text-slate-700">Password</span>
				<input class="w-full rounded-2xl border-slate-300" bind:value={password} type="password" />
			</label>

			{#if error}
				<p class="rounded-2xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
			{/if}

			<button
				class="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
				type="submit"
				disabled={pending}
			>
				{pending ? '登入中…' : '登入'}
			</button>
		</form>

		<div class="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
			<p class="font-semibold text-slate-900">Demo credentials</p>
			<ul class="mt-2 space-y-1">
				<li>業務：rep@spotsign.test / rep-demo-123</li>
				<li>主管：supervisor@spotsign.test / super-demo-123</li>
			</ul>
		</div>
	</div>
</div>
