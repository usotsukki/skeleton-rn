import { withProfiler } from '@sentry/react-native'
import LottieView from 'lottie-react-native'
import { StyleSheet } from 'react-native'
import { Colors, View } from 'react-native-ui-lib'

const Home = () => {
	return (
		<View flex center backgroundColor={Colors.grayBlack} testID="Home">
			<LottieView
				style={styles.mainAnimation}
				source={require(`@assets/lottie/animation-mail-letters.json`)}
				autoPlay
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	mainAnimation: {
		height: 500,
		aspectRatio: 1,
	},
})

export default withProfiler(Home)
