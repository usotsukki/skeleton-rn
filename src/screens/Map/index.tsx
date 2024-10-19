import { withProfiler } from '@sentry/react-native'
import * as Location from 'expo-location'
import { useEffect, useState } from 'react'
import { StyleSheet } from 'react-native'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import { Colors, View } from 'react-native-ui-lib'

const Map = () => {
	const [status, requestPermission] = Location.useForegroundPermissions()
	const [location, setLocation] = useState<Location.LocationObject | null>(null)

	const fetchLocation = async () => {
		try {
			const locationRes = await Location.getCurrentPositionAsync({})
			setLocation(locationRes)
		} catch (error) {
			console.error('Error fetching location:', error)
		}
	}

	useEffect(() => {
		if (status?.status === 'undetermined') {
			requestPermission()
		}
		if (status?.status === 'granted') {
			fetchLocation()
		}
	}, [status])

	return (
		<View flex center backgroundColor={Colors.grayBlack}>
			<MapView provider={PROVIDER_GOOGLE} style={styles.map}>
				{location && <Marker coordinate={location.coords} title={'You are here'} />}
			</MapView>
		</View>
	)
}

const styles = StyleSheet.create({
	map: {
		width: '100%',
		height: '100%',
	},
})

export default withProfiler(Map)
