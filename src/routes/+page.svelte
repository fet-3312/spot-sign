<script lang="ts">
	import { resolve } from '$app/paths';

	const demoAccounts = [
		{ role: 'Sales rep', email: 'rep@spot-sign.local', password: 'rep-demo-pass' },
		{
			role: 'Supervisor',
			email: 'supervisor@spot-sign.local',
			password: 'supervisor-demo-pass'
		}
	];

	const baselineItems = [
		'Environment-configured default area fallback',
		'Cookie session handling backed by a local SQLite file',
		'Server-side role guards for rep and supervisor entry points',
		'Simulated R2 storage abstraction ready for later photo workflows'
	];
</script>

<svelte:head>
	<title>Spot Sign</title>
	<meta
		name="description"
		content="Spot Sign local MVP baseline for field sales reporting and supervisor workflows."
	/>
</svelte:head>

<div class="min-h-screen bg-slate-950 text-slate-50">
	<div class="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
		<header class="space-y-4">
			<p class="text-sm font-medium tracking-[0.3em] text-cyan-300 uppercase">Spot Sign</p>
			<div class="space-y-3">
				<h1 class="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
					Local platform baseline for the field-sales MVP
				</h1>
				<p class="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
					This branch now moves beyond docs and starts the real product foundation: local
					SQLite-backed sessions, role-gated routes, environment-backed default area configuration,
					and a simulated R2 storage layer.
				</p>
			</div>
			<div class="flex flex-col gap-3 sm:flex-row">
				<a
					class="inline-flex items-center justify-center rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
					href={resolve('/login')}
				>
					Open local demo login
				</a>
			</div>
		</header>

		<section class="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
			<article
				class="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/40"
			>
				<h2 class="text-lg font-semibold text-white">Platform baseline delivered in this slice</h2>
				<ul class="mt-4 space-y-3 text-sm leading-6 text-slate-300">
					{#each baselineItems as item (item)}
						<li class="flex gap-3">
							<span class="mt-1 h-2 w-2 rounded-full bg-emerald-400"></span>
							<span>{item}</span>
						</li>
					{/each}
				</ul>
			</article>

			<article
				class="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/40"
			>
				<h2 class="text-lg font-semibold text-white">Local demo accounts</h2>
				<div class="mt-4 space-y-4 text-sm text-slate-300">
					{#each demoAccounts as account (account.email)}
						<div class="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
							<p class="font-semibold text-cyan-300">{account.role}</p>
							<p class="mt-2 break-all">
								<span class="text-slate-500">Email:</span>
								{account.email}
							</p>
							<p class="break-all">
								<span class="text-slate-500">Password:</span>
								{account.password}
							</p>
						</div>
					{/each}
				</div>
			</article>
		</section>
	</div>
</div>
