import { sessionCookieName, sessionTtlMs } from '$lib/spot-sign/constants';
import type { User } from '$lib/spot-sign/types';
import type { Cookies } from '@sveltejs/kit';
import { getState, publicUser } from './state';

async function hashToken(token: string) {
	const buffer = new TextEncoder().encode(token);
	const digest = await crypto.subtle.digest('SHA-256', buffer);
	return Array.from(new Uint8Array(digest))
		.map((value) => value.toString(16).padStart(2, '0'))
		.join('');
}

export async function createSession(cookies: Cookies, user: User) {
	const token = crypto.randomUUID();
	const tokenHash = await hashToken(token);
	const now = new Date();
	const expiresAt = new Date(now.getTime() + sessionTtlMs);
	const state = getState();
	state.sessions = state.sessions.filter((session) => session.expiresAt > now.toISOString());
	state.sessions.push({
		id: `ses_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`,
		userId: user.id,
		tokenHash,
		expiresAt: expiresAt.toISOString(),
		createdAt: now.toISOString(),
		lastSeenAt: now.toISOString()
	});
	cookies.set(sessionCookieName, token, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: false,
		expires: expiresAt
	});
	return publicUser(user);
}

export async function deleteSession(cookies: Cookies) {
	const token = cookies.get(sessionCookieName);
	if (!token) return;
	const state = getState();
	const tokenHash = await hashToken(token);
	state.sessions = state.sessions.filter((session) => session.tokenHash !== tokenHash);
	cookies.delete(sessionCookieName, { path: '/' });
}

export async function getCurrentUser(cookies: Cookies) {
	const token = cookies.get(sessionCookieName);
	if (!token) return null;
	const state = getState();
	const tokenHash = await hashToken(token);
	const session = state.sessions.find((entry) => entry.tokenHash === tokenHash);
	if (!session || session.expiresAt < new Date().toISOString()) {
		cookies.delete(sessionCookieName, { path: '/' });
		return null;
	}
	const user = state.users.find(
		(entry) => entry.id === session.userId && entry.status === 'active'
	);
	if (!user) {
		cookies.delete(sessionCookieName, { path: '/' });
		return null;
	}
	session.lastSeenAt = new Date().toISOString();
	return user;
}
