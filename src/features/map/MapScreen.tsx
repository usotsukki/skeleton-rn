import { requireOptionalNativeModule } from 'expo'
import { useTranslation } from 'react-i18next'
import { Platform, StyleSheet, View } from 'react-native'
import MapView, { Marker } from 'react-native-maps'
import { AppText } from '@app/shared/ui'

const INITIAL_REGION = {
	latitude: 37.7749,
	longitude: -122.4194,
	latitudeDelta: 0.05,
	longitudeDelta: 0.05,
}

/**
 * Google Maps on Android throws while the view is created when the build has no API key, and tabs
 * mount this screen with the app. The key is baked into the binary, so this reads the config embedded
 * in that binary: `Constants.expoConfig` in a dev build is Metro's live config, which can already have
 * a key the installed app was not built with. iOS falls back to Apple Maps without a key.
 */
function isMapAvailable(): boolean {
	if (Platform.OS !== 'android') return true
	const embedded = requireOptionalNativeModule<{ manifest?: unknown }>('ExponentConstants')?.manifest
	try {
		const config = typeof embedded === 'string' ? JSON.parse(embedded) : embedded
		return config?.extra?.androidMapsConfigured === true
	} catch {
		return false
	}
}

export default function Map() {
	const { t } = useTranslation()

	if (!isMapAvailable()) {
		return (
			<View className="flex-1 items-center justify-center bg-bg px-8" testID="map-unavailable">
				<AppText className="text-center text-text-secondary" variant="ts">
					{t('modules.map.noApiKey')}
				</AppText>
			</View>
		)
	}

	return (
		<View className="flex-1 bg-bg">
			<MapView initialRegion={INITIAL_REGION} style={styles.map}>
				<Marker
					coordinate={{ latitude: INITIAL_REGION.latitude, longitude: INITIAL_REGION.longitude }}
					title="San Francisco"
				/>
			</MapView>
		</View>
	)
}

const styles = StyleSheet.create({
	map: { flex: 1 },
})
