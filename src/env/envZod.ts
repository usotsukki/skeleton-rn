/** Keys in `map` whose value is `true` (production-required toggles in `env.rules.ts`). */
export function envKeysRequiredInProduction(map: Readonly<Record<string, boolean>>): string[] {
	return (Object.entries(map) as [string, boolean][]).filter(([, required]) => required).map(([key]) => key)
}

/** `process.env` values: trim; empty string → undefined. */
export const optionalEnvString = (val: unknown): string | undefined => {
	if (val === undefined || val === null) return undefined
	const s = String(val).trim()
	return s === '' ? undefined : s
}
