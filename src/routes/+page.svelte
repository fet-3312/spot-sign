<svelte:options runes={false} />

<script lang="ts">
	import { onMount } from 'svelte';
	import AuthCard from '$lib/spot-sign/components/AuthCard.svelte';
	import MapCanvas from '$lib/spot-sign/components/MapCanvas.svelte';
	import NewRestaurantForm from '$lib/spot-sign/components/NewRestaurantForm.svelte';
	import ReportComposer from '$lib/spot-sign/components/ReportComposer.svelte';
	import SupervisorWorkspace from '$lib/spot-sign/components/SupervisorWorkspace.svelte';
	import { defaultArea } from '$lib/spot-sign/constants';
	import type { RestaurantStatus, RestaurantSummary } from '$lib/spot-sign/types';

	type PublicUser = {
		id: string;
		name: string;
		email: string;
		role: 'rep' | 'supervisor';
		status: 'active' | 'inactive';
	};
	type ReviewItem = {
		id: string;
		importJobId: string;
		rawName: string;
		rawAddress: string;
		geocodeStatus: 'failed' | 'duplicate_candidate';
		geocodeMessage: string;
		duplicateCandidateRestaurantId: string | null;
		resolutionStatus: string;
	};

	let ready = false;
	let authPending = false;
	let authError = '';
	let actionPending = false;
	let actionError = '';
	let user: PublicUser | null = null;
	let screen: 'auth' | 'map' | 'report' | 'new' | 'supervisor' = 'auth';
	let location = {
		latitude: defaultArea.latitude,
		longitude: defaultArea.longitude,
		radiusMeters: defaultArea.radiusMeters
	};
	let locationStatus = `已切換至預設區域 ${defaultArea.label}`;
	let restaurants: (RestaurantSummary & { distanceMeters?: number })[] = [];
	let selectedRestaurantId: string | null = null;
	let selectedRestaurantDetail: RestaurantSummary | null = null;
	let selectedRestaurantReports: Array<{
		id: string;
		restaurantName: string;
		status: RestaurantStatus;
		notes: string;
		visitedAt: string;
	}> = [];
	let reports: Array<{
		id: string;
		restaurantName: string;
		user: { name: string } | null;
		status: RestaurantStatus;
		visitedAt: string;
		notes: string;
	}> = [];
	let employees: Array<{
		id: string;
		name: string;
		assignmentCount: number;
		lastReportAt: string | null;
	}> = [];
	let reviewItems: ReviewItem[] = [];
	let importJobs: Array<{
		id: string;
		status: string;
		sourceFilename: string;
		completedRows: number;
		failedRows: number;
	}> = [];
	let assignmentHistory: Array<{
		id: string;
		fromUser: string;
		toUser: string;
		reason: string | null;
		assignedAt: string;
		assignedBy: string;
	}> = [];
	let selectedRepId = '';
	let assignmentReason = '';
	let search = '';
	let statusFilter: '' | RestaurantStatus = '';

	const selectedRestaurant = () =>
		restaurants.find((item) => item.id === selectedRestaurantId) ?? selectedRestaurantDetail;

	async function api(path: string, init?: RequestInit) {
		const response = await fetch(path, {
			credentials: 'same-origin',
			headers: { Accept: 'application/json', ...(init?.headers ?? {}) },
			...init
		});
		const payload = await response.json();
		if (!response.ok || !payload.ok) {
			throw new Error(
				payload.error?.fields
					? Object.values(payload.error.fields)[0]
					: (payload.error?.message ?? 'Request failed')
			);
		}
		return payload.data;
	}

	async function loadRestaurantList() {
		const query = [
			['lat', String(location.latitude)],
			['lng', String(location.longitude)],
			['radiusMeters', String(location.radiusMeters)],
			...(user?.role === 'supervisor' && selectedRepId
				? ([['assignedUserId', selectedRepId]] as const)
				: []),
			...(statusFilter ? ([['status', statusFilter]] as const) : [])
		]
			.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
			.join('&');
		const data = await api(`/api/restaurants?${query}`);
		restaurants = data.items;
		if (!selectedRestaurantId && restaurants[0]) selectedRestaurantId = restaurants[0].id;
	}

	async function loadReports() {
		reports = (await api('/api/reports')).items;
	}

	async function loadRestaurantDetail(restaurantId: string) {
		selectedRestaurantId = restaurantId;
		const data = await api(`/api/restaurants/${restaurantId}`);
		selectedRestaurantDetail = data.restaurant;
		assignmentHistory = data.assignmentHistory;
		selectedRestaurantReports = (await api(`/api/reports?restaurantId=${restaurantId}`)).items;
	}

	async function loadSupervisorData() {
		employees = (await api('/api/users')).items;
		const reviewResponse = await api('/api/imports/review-items?resolutionStatus=pending');
		reviewItems = reviewResponse.items;
		const jobIds = [...new Set(reviewItems.map((item: ReviewItem) => item.importJobId))];
		importJobs = await Promise.all(
			jobIds.map(async (id) => (await api(`/api/imports/${id}`)).importJob)
		);
	}

	async function refreshData() {
		if (!user) return;
		await loadRestaurantList();
		await loadReports();
		if (user.role === 'supervisor') await loadSupervisorData();
		if (selectedRestaurantId) await loadRestaurantDetail(selectedRestaurantId);
	}

	async function detectLocation() {
		if (!navigator.geolocation) return;
		await new Promise<void>((resolve) => {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					location = {
						latitude: position.coords.latitude,
						longitude: position.coords.longitude,
						radiusMeters: defaultArea.radiusMeters
					};
					locationStatus = '已使用目前定位';
					resolve();
				},
				() => {
					locationStatus = `定位不可用，已切換至預設區域 ${defaultArea.label}`;
					resolve();
				},
				{ enableHighAccuracy: true, timeout: 2000 }
			);
		});
	}

	async function hydrateUser() {
		try {
			const currentUser = (await api('/api/me')).user as PublicUser;
			user = currentUser;
			screen = currentUser.role === 'supervisor' ? 'supervisor' : 'map';
			await detectLocation();
			await refreshData();
		} catch {
			user = null;
			screen = 'auth';
		}
		ready = true;
	}

	async function handleLogin(credentials: { email: string; password: string }) {
		authPending = true;
		authError = '';
		try {
			await api('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(credentials)
			});
			await hydrateUser();
		} catch (error) {
			authError = error instanceof Error ? error.message : '登入失敗';
		} finally {
			authPending = false;
		}
	}

	async function handleLogout() {
		await api('/api/auth/logout', { method: 'POST' });
		user = null;
		screen = 'auth';
		selectedRestaurantId = null;
		selectedRestaurantDetail = null;
		selectedRestaurantReports = [];
		reports = [];
		employees = [];
		reviewItems = [];
		importJobs = [];
	}

	async function uploadPhoto(file: File) {
		const formData = new FormData();
		formData.append('photo', file);
		const uploaded = await api('/api/uploads/photo', { method: 'POST', body: formData });
		const access = await api(
			`/api/uploads/photo-access?photoKey=${encodeURIComponent(uploaded.photoKey)}`
		);
		return { photoKey: uploaded.photoKey as string, previewUrl: access.accessUrl as string };
	}

	async function handleSubmitReport(payload: {
		contactName: string;
		status: RestaurantStatus;
		notes: string;
		photoKey: string | null;
		visitedAt: string;
	}) {
		if (!selectedRestaurantId) return;
		actionPending = true;
		actionError = '';
		try {
			await api(`/api/restaurants/${selectedRestaurantId}/reports`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});
			await refreshData();
			screen = user?.role === 'supervisor' ? 'supervisor' : 'map';
		} catch (error) {
			actionError = error instanceof Error ? error.message : '回報失敗';
		} finally {
			actionPending = false;
		}
	}

	async function handleCreateRestaurant(payload: {
		name: string;
		addressText: string;
		latitude: number;
		longitude: number;
	}) {
		actionPending = true;
		actionError = '';
		try {
			const created = await api('/api/restaurants', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});
			await refreshData();
			await loadRestaurantDetail(created.restaurant.id as string);
			screen = 'report';
		} catch (error) {
			actionError = error instanceof Error ? error.message : '建立餐廳失敗';
		} finally {
			actionPending = false;
		}
	}

	async function handleAssign(payload: { toUserId: string; reason: string }) {
		if (!selectedRestaurant()) return;
		actionPending = true;
		actionError = '';
		try {
			await api(`/api/restaurants/${selectedRestaurant()!.id}/assign`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					toUserId: payload.toUserId,
					reason: payload.reason,
					expectedCurrentAssignedUserId: selectedRestaurant()?.assignedUser?.id ?? null
				})
			});
			assignmentReason = '';
			await refreshData();
		} catch (error) {
			actionError = error instanceof Error ? error.message : '指派失敗';
		} finally {
			actionPending = false;
		}
	}

	async function handleImportCsv(file: File) {
		actionPending = true;
		actionError = '';
		try {
			const formData = new FormData();
			formData.append('file', file);
			const created = await api('/api/imports/restaurants', { method: 'POST', body: formData });
			importJobs = [
				(await api(`/api/imports/${created.importJob.id}`)).importJob,
				...importJobs.filter((item) => item.id !== created.importJob.id)
			];
			await refreshData();
		} catch (error) {
			actionError = error instanceof Error ? error.message : '匯入失敗';
		} finally {
			actionPending = false;
		}
	}

	async function handleResolveReview(payload: {
		id: string;
		action: 'approve_create' | 'merge_existing' | 'retry_geocode' | 'reject_row';
		correctedAddress?: string;
		correctedLatitude?: number;
		correctedLongitude?: number;
		targetRestaurantId?: string | null;
	}) {
		actionPending = true;
		actionError = '';
		try {
			await api(`/api/imports/review-items/${payload.id}/resolve`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					action: payload.action,
					correctedAddress: payload.correctedAddress,
					targetRestaurantId: payload.targetRestaurantId,
					correctedLatitude: payload.correctedLatitude,
					correctedLongitude: payload.correctedLongitude
				})
			});
			await refreshData();
		} catch (error) {
			actionError = error instanceof Error ? error.message : 'review 處理失敗';
		} finally {
			actionPending = false;
		}
	}

	function openReport(restaurantId: string) {
		loadRestaurantDetail(restaurantId);
		screen = 'report';
	}

	onMount(hydrateUser);
</script>

<svelte:head>
	<title>Spot Sign MVP</title>
</svelte:head>

{#if !ready}
	<div class="flex min-h-screen items-center justify-center text-sm text-slate-500">
		載入 Spot Sign…
	</div>
{:else if !user}
	<AuthCard onLogin={handleLogin} pending={authPending} error={authError} />
{:else}
	<div class="min-h-screen bg-slate-100">
		<header class="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
			<div
				class="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
			>
				<div>
					<p class="text-sm font-semibold text-emerald-600">Spot Sign</p>
					<h1 class="text-xl font-bold text-slate-900">
						{user.role === 'supervisor' ? '主管管理工作台' : '外勤地圖首頁'}
					</h1>
					<p class="text-sm text-slate-500">{user.name} · {locationStatus}</p>
				</div>
				<div class="flex gap-2">
					<button
						class="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
						on:click={() => (screen = user!.role === 'supervisor' ? 'supervisor' : 'map')}
					>
						首頁
					</button>
					<button
						class="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
						on:click={handleLogout}>登出</button
					>
				</div>
			</div>
		</header>

		<main class="mx-auto max-w-7xl px-4 py-6">
			{#if screen === 'map'}
				<MapCanvas
					{restaurants}
					{selectedRestaurantId}
					{search}
					{statusFilter}
					locationLabel={defaultArea.label}
					{locationStatus}
					{reports}
					showMyReports={true}
					onSelect={(restaurantId) => loadRestaurantDetail(restaurantId)}
					onStartReport={openReport}
					onAddRestaurant={() => {
						actionError = '';
						screen = 'new';
					}}
					onSearchChange={(value) => (search = value)}
					onStatusFilterChange={async (value) => {
						statusFilter = value;
						await loadRestaurantList();
					}}
				/>
			{:else if screen === 'report' && selectedRestaurant()}
				<ReportComposer
					restaurant={selectedRestaurant()!}
					reports={selectedRestaurantReports}
					error={actionError}
					pending={actionPending}
					onBack={() => (screen = user!.role === 'supervisor' ? 'supervisor' : 'map')}
					onUploadPhoto={uploadPhoto}
					onSubmit={handleSubmitReport}
				/>
			{:else if screen === 'new'}
				<NewRestaurantForm
					onBack={() => (screen = 'map')}
					onSubmit={handleCreateRestaurant}
					pending={actionPending}
					error={actionError}
					positionLabel={locationStatus}
				/>
			{:else}
				<SupervisorWorkspace
					{restaurants}
					{employees}
					{reports}
					{reviewItems}
					{importJobs}
					{selectedRestaurantId}
					{selectedRepId}
					{assignmentReason}
					{assignmentHistory}
					assignmentError={actionError}
					pendingAssignment={actionPending}
					pendingImport={actionPending}
					importError={actionError}
					onSelectRestaurant={loadRestaurantDetail}
					onSelectRep={async (repId) => {
						selectedRepId = repId;
						await loadRestaurantList();
					}}
					onAssign={handleAssign}
					onImportCsv={handleImportCsv}
					onResolveReview={handleResolveReview}
				/>
			{/if}
		</main>
	</div>
{/if}
