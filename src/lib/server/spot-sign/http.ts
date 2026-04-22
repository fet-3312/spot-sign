import { json } from '@sveltejs/kit';

export function ok(data: Record<string, unknown>, status = 200) {
	return json({ ok: true, data }, { status });
}

export function fail(
	status: number,
	code: string,
	message: string,
	fields?: Record<string, string>
) {
	return json(
		{
			ok: false,
			error: {
				code,
				message,
				...(fields ? { fields } : {})
			}
		},
		{ status }
	);
}
