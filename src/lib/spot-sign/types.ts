export type Role = 'rep' | 'supervisor';
export type UserStatus = 'active' | 'inactive';
export type RestaurantStatus =
	| 'new_lead'
	| 'visited'
	| 'in_discussion'
	| 'awaiting_signature'
	| 'signed'
	| 'not_pursuing';
export type SourceType = 'seed' | 'field' | 'import';
export type ImportJobStatus = 'processing' | 'completed' | 'completed_with_review' | 'failed';
export type ReviewResolutionStatus = 'pending' | 'resolved' | 'rejected';
export type ReviewAction = 'approve_create' | 'merge_existing' | 'retry_geocode' | 'reject_row';
export type GeocodeStatus = 'success' | 'failed' | 'duplicate_candidate';

export interface User {
	id: string;
	name: string;
	email: string;
	password: string;
	role: Role;
	status: UserStatus;
}

export interface SessionRecord {
	id: string;
	userId: string;
	tokenHash: string;
	expiresAt: string;
	createdAt: string;
	lastSeenAt: string;
}

export interface PhotoRecord {
	photoKey: string;
	contentType: string;
	size: number;
	dataUrl: string;
	reportId?: string;
	uploaderUserId: string;
}

export interface Restaurant {
	id: string;
	name: string;
	addressText: string;
	latitude: number;
	longitude: number;
	currentStatus: RestaurantStatus;
	currentContactName: string;
	assignedUserId: string | null;
	lastReportId: string | null;
	lastReportAt: string | null;
	sourceType: SourceType;
	geocodeStatus: 'manual' | 'verified';
	createdByUserId: string;
	createdAt: string;
	updatedAt: string;
}

export interface VisitReport {
	id: string;
	restaurantId: string;
	userId: string;
	contactName: string;
	status: RestaurantStatus;
	notes: string;
	photoKey: string | null;
	visitedAt: string;
	createdAt: string;
}

export interface AssignmentHistory {
	id: string;
	restaurantId: string;
	fromUserId: string | null;
	toUserId: string;
	assignedByUserId: string;
	reason: string | null;
	assignedAt: string;
}

export interface ImportJob {
	id: string;
	createdByUserId: string;
	sourceFilename: string;
	totalRows: number;
	completedRows: number;
	failedRows: number;
	status: ImportJobStatus;
	createdAt: string;
	completedAt: string | null;
}

export interface ImportReviewItem {
	id: string;
	importJobId: string;
	rawName: string;
	rawAddress: string;
	geocodeStatus: Exclude<GeocodeStatus, 'success'>;
	geocodeMessage: string;
	duplicateCandidateRestaurantId: string | null;
	proposedLatitude: number | null;
	proposedLongitude: number | null;
	resolutionStatus: ReviewResolutionStatus;
	resolvedByUserId: string | null;
	resolvedAt: string | null;
	createdAt: string;
}

export interface DefaultArea {
	latitude: number;
	longitude: number;
	radiusMeters: number;
	label: string;
}

export interface AppState {
	users: User[];
	sessions: SessionRecord[];
	restaurants: Restaurant[];
	reports: VisitReport[];
	assignmentHistories: AssignmentHistory[];
	importJobs: ImportJob[];
	importReviewItems: ImportReviewItem[];
	photos: PhotoRecord[];
	defaultArea: DefaultArea;
}

export interface RestaurantSummary {
	id: string;
	name: string;
	addressText: string;
	latitude: number;
	longitude: number;
	currentStatus: RestaurantStatus;
	currentContactName: string;
	assignedUser: { id: string; name: string } | null;
	lastReportAt: string | null;
	isOwnedByCurrentUser: boolean;
}

export interface ReportInput {
	contactName: string;
	status: RestaurantStatus;
	notes: string;
	photoKey: string | null;
	visitedAt: string;
}
