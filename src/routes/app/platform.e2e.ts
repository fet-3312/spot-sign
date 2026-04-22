import { expect, test } from '@playwright/test';

test('allows the supervisor demo account to sign in and view the baseline dashboard', async ({
	page
}) => {
	await page.goto('/login');
	await page.getByLabel('Email').fill('supervisor@spot-sign.local');
	await page.getByLabel('Password').fill('supervisor-demo-pass');
	await page.getByRole('button', { name: 'Continue' }).click();

	await expect(page.getByRole('heading', { name: 'Local platform baseline' })).toBeVisible();
	await expect(page.getByText('simulated-r2')).toBeVisible();
	await page.getByRole('link', { name: 'Supervisor' }).click();

	await expect(page.getByRole('heading', { name: 'Supervisor-only access check' })).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Demo Supervisor' })).toBeVisible();
});

test('blocks rep access to the supervisor-only page', async ({ page }) => {
	await page.goto('/login');
	await page.getByLabel('Email').fill('rep@spot-sign.local');
	await page.getByLabel('Password').fill('rep-demo-pass');
	await page.getByRole('button', { name: 'Continue' }).click();
	await page.getByRole('link', { name: 'Supervisor' }).click();

	await expect(page.getByText('Supervisor access is required for this page.')).toBeVisible();
});
