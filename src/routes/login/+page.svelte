<script lang="ts">
	import { resolve } from '$app/paths';
	import { enhance } from '$app/forms';

	let { form } = $props();
</script>

<svelte:head>
	<title>Login · Spot Sign</title>
</svelte:head>

<div class="min-h-screen bg-slate-950 px-4 py-8 text-slate-50 sm:px-6 lg:px-8">
	<div class="mx-auto flex min-h-screen max-w-md items-center">
		<div
			class="w-full rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl shadow-slate-950/40 sm:p-8"
		>
			<p class="text-sm font-medium tracking-[0.3em] text-cyan-300 uppercase">Spot Sign</p>
			<h1 class="mt-3 text-3xl font-semibold tracking-tight">Sign in to the local demo</h1>
			<p class="mt-3 text-sm leading-6 text-slate-300">
				Use the seeded rep or supervisor account to verify cookie sessions and route guards.
			</p>

			<form class="mt-6 space-y-4" method="POST" use:enhance>
				<label class="block space-y-2 text-sm">
					<span class="font-medium text-slate-200">Email</span>
					<input
						class="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-50 placeholder:text-slate-500 focus:border-cyan-400 focus:ring-cyan-400"
						name="email"
						type="email"
						placeholder="rep@spot-sign.local"
						value={form?.email ?? ''}
						required
					/>
				</label>

				<label class="block space-y-2 text-sm">
					<span class="font-medium text-slate-200">Password</span>
					<input
						class="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-50 placeholder:text-slate-500 focus:border-cyan-400 focus:ring-cyan-400"
						name="password"
						type="password"
						placeholder="••••••••••••"
						required
					/>
				</label>

				{#if form?.message}
					<p
						class="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
					>
						{form.message}
					</p>
				{/if}

				<button
					class="w-full rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
					type="submit"
				>
					Continue
				</button>
			</form>

			<a class="mt-4 inline-flex text-sm text-cyan-300 hover:text-cyan-200" href={resolve('/')}>
				← Back to overview
			</a>
		</div>
	</div>
</div>
