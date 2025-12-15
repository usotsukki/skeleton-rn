import { getShareExtensionKey } from 'expo-share-intent'

export function redirectSystemPath({ path }: { path: string; initial: string }) {
	try {
		if (path.includes(`dataUrl=${getShareExtensionKey()}`)) {
			// redirect to the ShareIntent Screen to handle data with the hook
			console.debug('[expo-router-native-intent] redirect to ShareIntent screen')
			return '/(home)/Home'
		}
		return path
	} catch {
		return '/'
	}
}
