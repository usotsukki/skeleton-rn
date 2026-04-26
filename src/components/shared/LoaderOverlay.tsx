import { ActivityIndicator, Modal, View } from 'react-native'
import { colors } from '@app/theme/colors'

export default function LoaderOverlay({ visible }: { visible: boolean }) {
	return (
		<Modal transparent visible={visible}>
			<View className="absolute inset-0 z-10 flex-1 items-center justify-center bg-scrim">
				<ActivityIndicator color={colors['accent']} size="large" />
			</View>
		</Modal>
	)
}
