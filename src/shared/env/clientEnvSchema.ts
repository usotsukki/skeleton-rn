import { Platform } from 'react-native'
import { z } from 'zod'
import envRules from '../../../env.rules.json'
import { envKeysRequiredInProduction, optionalEnvString } from './envZod'

const clientEnvProductionKeys = envKeysRequiredInProduction(envRules.clientEnvProductionRequired)

/** Production-required keys that only matter on one platform (a missing iOS client id must not crash Android). */
const platformOnlyKeys: Partial<Record<string, typeof Platform.OS>> = {
	EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: 'ios',
}

const nodeEnv = z.enum(['development', 'production', 'testing'])

const optionalUrl = z.preprocess(optionalEnvString, z.string().url().optional())

export const clientEnvSchema = z
	.object({
		EXPO_PUBLIC_NODE_ENV: z.preprocess(optionalEnvString, nodeEnv.optional()),
		EXPO_PUBLIC_ENABLE_DEV_MODE: z.preprocess(optionalEnvString, z.enum(['true', 'false']).optional()),
		EXPO_PUBLIC_LOG_DEBUG: z.preprocess(optionalEnvString, z.string().optional()),
		EXPO_PUBLIC_LOG_LEVEL: z.preprocess(optionalEnvString, z.string().optional()),
		EXPO_PUBLIC_SENTRY_DSN: optionalUrl,
		EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: z.preprocess(optionalEnvString, z.string().optional()),
		EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: z.preprocess(optionalEnvString, z.string().optional()),
		EXPO_PUBLIC_EAS_PROJECT_ID: z.preprocess(optionalEnvString, z.string().optional()),
		EXPO_PUBLIC_EAS_OWNER: z.preprocess(optionalEnvString, z.string().optional()),
		EXPO_PUBLIC_BASE_API_URL: optionalUrl,
		EXPO_PUBLIC_SUPABASE_URL: optionalUrl,
		EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.preprocess(optionalEnvString, z.string().optional()),
		EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN: z.preprocess(optionalEnvString, z.string().optional()),
		EXPO_PUBLIC_POSTHOG_HOST: optionalUrl,
	})
	.superRefine((data, ctx) => {
		if (data.EXPO_PUBLIC_NODE_ENV !== 'production') return
		for (const key of clientEnvProductionKeys) {
			const onlyOn = platformOnlyKeys[key]
			if (onlyOn && onlyOn !== Platform.OS) continue
			const v = data[key as keyof typeof data]
			if (v === undefined || v === null || (typeof v === 'string' && v.trim() === '')) {
				ctx.addIssue({
					code: 'custom',
					path: [key],
					message: `Required when EXPO_PUBLIC_NODE_ENV is production (${key})`,
				})
			}
		}
	})

export type ClientEnv = z.infer<typeof clientEnvSchema>
