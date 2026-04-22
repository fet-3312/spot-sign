<script lang="ts">
	let { data } = $props();
</script>

<section
	class="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl shadow-slate-950/40"
>
	<h2 class="text-lg font-semibold">Supervisor-only access check</h2>
	<p class="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
		This page proves the current platform slice can distinguish supervisor access from rep access
		before the restaurant assignment workflow is implemented.
	</p>

	<div class="mt-6 grid gap-4 md:grid-cols-2">
		{#each data.users as user (user.id)}
			<article class="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
				<p class="text-sm text-slate-400">{user.role}</p>
				<h3 class="mt-2 text-lg font-semibold text-cyan-300">{user.name}</h3>
				<p class="mt-1 text-sm break-all text-slate-300">{user.email}</p>
			</article>
		{/each}
	</div>
</section>
