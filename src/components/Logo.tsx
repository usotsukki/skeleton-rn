import React from 'react'
import { StyleSheet } from 'react-native'
import { Image, ImageProps } from 'react-native-ui-lib'

const Logo = ({ ...props }: Omit<ImageProps, 'source'>) => {
	return <Image assetGroup="illustrations" assetName="logo" style={styles.logo} {...props} />
}

const styles = StyleSheet.create({
	logo: {
		width: 200,
		height: 200,
	},
})

export default Logo
