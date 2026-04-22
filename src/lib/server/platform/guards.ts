import { error, redirect } from '@sveltejs/kit';
import type { CurrentUser, UserRole } from './types';

export function requireUser(user: CurrentUser | null): CurrentUser {
	if (!user) {
		throw redirect(303, '/login');
	}

	return user;
}

export function requireRole(user: CurrentUser, role: UserRole): void {
	if (user.role !== role) {
		throw error(
			403,
			`${role.charAt(0).toUpperCase() + role.slice(1)} access is required for this page.`
		);
	}
}
