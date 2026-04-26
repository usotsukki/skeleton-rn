/**
 * Stub for `react-native-maps` when Metro resolves with `resolver.environment=node`
 * (Expo Router server manifest / static export). Native codegen is unavailable there.
 */
import React, { forwardRef } from 'react'
import { View } from 'react-native'

const StubMapView = forwardRef(function StubMapView(props: Record<string, unknown>, _ref: unknown) {
	return <View testID="MapView" {...props} />
})

export function Marker(props: Record<string, unknown>) {
	return <View testID="Marker" {...props} />
}

export const PROVIDER_GOOGLE = 'google'

export default StubMapView
