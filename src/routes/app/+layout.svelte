<script lang="ts">
	import { resolve } from '$app/paths';

	let { data, children } = $props();
</script>

<div class="min-h-screen bg-slate-950 text-slate-50">
	<div class="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
		<header
			class="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl shadow-slate-950/40"
		>
			<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<p class="text-sm font-medium tracking-[0.3em] text-cyan-300 uppercase">Spot Sign</p>
					<h1 class="mt-2 text-2xl font-semibold">Local platform baseline</h1>
					<p class="mt-2 text-sm text-slate-300">
						Signed in as {data.user.name} · {data.user.role}
					</p>
				</div>

				<nav class="flex flex-wrap items-center gap-3 text-sm">
					<a
						class="rounded-full border border-slate-700 px-4 py-2 hover:border-slate-500"
						href={resolve('/app')}
					>
						Overview
					</a>
					<a
						class="rounded-full border border-slate-700 px-4 py-2 hover:border-slate-500"
						href={resolve('/app/supervisor')}
					>
						Supervisor
					</a>
					<form method="POST" action="/logout">
						<button
							class="rounded-full bg-slate-100 px-4 py-2 font-semibold text-slate-950 hover:bg-white"
							type="submit"
						>
							Log out
						</button>
					</form>
				</nav>
			</div>
		</header>

		{@render children()}
	</div>
</div>
