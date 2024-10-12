import React, { PropsWithChildren } from 'react'
import { ImageBackground, StyleSheet } from 'react-native'
import { View, ViewProps } from 'react-native-ui-lib'

const Background = ({ children, ...props }: PropsWithChildren & ViewProps) => {
	return (
		<ImageBackground
			style={styles.container}
			resizeMode="cover"
			source={require('@assets/png/image-auth-background.png')}
			testID="background-view">
			<View flex useSafeArea backgroundColor="rgba(0,0,0,0.6)" {...props}>
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
