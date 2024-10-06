import { withProfiler } from '@sentry/react-native'
import * as Location from 'expo-location'
import { throttle } from 'lodash'
import { useCallback, useEffect, useRef, useState } from 'react'
import { StyleSheet } from 'react-native'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import { Colors, View } from 'react-native-ui-lib'

const Map = () => {
	const [status, requestPermission] = Location.useForegroundPermissions()
	const [location, setLocation] = useState<Location.LocationObject | null>(null)
	const hasToZoomIn = useRef(true)
	const mapRef = useRef<MapView>(null)

	const fetchLocation = useCallback(
		throttle(async () => {
			try {
				const locationRes = await Location.getCurrentPositionAsync({})
				setLocation(locationRes)
			} catch (error) {
				console.error('Error fetching location:', error)
			}
		}, 1000),
		[],
	)

	useEffect(() => {
		if (status?.status === 'undetermined') {
			requestPermission()
		}
		if (status?.status === 'granted') {
			const interval = setInterval(fetchLocation, 1000, { leading: true })
			return () => {
				clearInterval(interval)
			}
		}
	}, [status])

	useEffect(() => {
		if (location && hasToZoomIn.current && mapRef.current) {
			mapRef.current.animateCamera({
				center: {
					latitude: location.coords.latitude,
					longitude: location.coords.longitude,
				},
				zoom: 18,
			})
			hasToZoomIn.current = false
		}
	}, [location])

	return (
		<View flex center backgroundColor={Colors.grayBlack}>
			<MapView provider={PROVIDER_GOOGLE} style={styles.map} ref={mapRef}>
				{location && <Marker coordinate={location.coords} title={'You are here'} />}
			</MapView>
		</View>
	)
}

export default withProfiler(Map)

const styles = StyleSheet.create({
	map: {
		width: '100%',
		height: '100%',
	},
})
