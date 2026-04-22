<script lang="ts">
	import { page } from '$app/state';

	const nextSlices = [
		'Nearby restaurant lookup and geolocation fallback UI',
		'Report submission with one-photo upload through the simulated storage adapter',
		'Supervisor assignment and CSV review flows on top of the same auth/session baseline'
	];
</script>

<section class="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
	<article
		class="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl shadow-slate-950/40"
	>
		<h2 class="text-lg font-semibold">Readiness snapshot</h2>
		<dl class="mt-4 grid gap-4 sm:grid-cols-2">
			<div class="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
				<dt class="text-sm text-slate-400">Current role</dt>
				<dd class="mt-2 text-lg font-semibold text-cyan-300">{page.data.user.role}</dd>
			</div>
			<div class="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
				<dt class="text-sm text-slate-400">Storage provider</dt>
				<dd class="mt-2 text-lg font-semibold text-cyan-300">{page.data.storage.provider}</dd>
			</div>
			<div class="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 sm:col-span-2">
				<dt class="text-sm text-slate-400">Default area fallback</dt>
				<dd class="mt-2 text-base leading-7 text-slate-200">
					Lat {page.data.defaultArea.latitude}, Lng {page.data.defaultArea.longitude}, Radius
					{page.data.defaultArea.radiusMeters}m
				</dd>
			</div>
		</dl>
	</article>

	<article
		class="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl shadow-slate-950/40"
	>
		<h2 class="text-lg font-semibold">Next implementation slices</h2>
		<ul class="mt-4 space-y-3 text-sm leading-6 text-slate-300">
			{#each nextSlices as item (item)}
				<li class="flex gap-3">
					<span class="mt-1 h-2 w-2 rounded-full bg-amber-300"></span>
					<span>{item}</span>
				</li>
			{/each}
		</ul>
	</article>
</section>
