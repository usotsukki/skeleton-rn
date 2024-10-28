import React, { PropsWithChildren } from 'react'
import { ImageBackground, StyleSheet } from 'react-native'
import { View, ViewProps } from 'react-native-ui-lib'

const Background = ({ children, ...props }: PropsWithChildren & ViewProps) => {
	return (
		<ImageBackground
			resizeMode="cover"
			source={require('@assets/png/image-auth-background.png')}
			style={styles.container}
			testID="background-view">
			<View flex bg-blackTransparent6 useSafeArea {...props}>
				{children}
			</View>
		</ImageBackground>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
})

export default Background
