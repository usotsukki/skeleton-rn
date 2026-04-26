import { StyleSheet, View } from 'react-native'
import MapView, { Marker } from 'react-native-maps'

const INITIAL_REGION = {
	latitude: 37.7749,
	longitude: -122.4194,
	latitudeDelta: 0.05,
	longitudeDelta: 0.05,
}

export default function Map() {
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
