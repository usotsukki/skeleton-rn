// Set before any expo modules load to avoid "EXPO_OS is not defined" warning
process.env.EXPO_OS = process.env.EXPO_OS || 'ios'

// `src/env` Zod schema — not production, so CLIENT_ENV_REQUIRED_IN_PRODUCTION is skipped
process.env.EXPO_PUBLIC_NODE_ENV = process.env.EXPO_PUBLIC_NODE_ENV || 'testing'
process.env.EXPO_PUBLIC_ENABLE_DEV_MODE = process.env.EXPO_PUBLIC_ENABLE_DEV_MODE || 'false'
