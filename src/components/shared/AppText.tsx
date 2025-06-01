import { Text, TextProps } from 'react-native'
import { cn } from '@app/utils'

const AppText = (props: TextProps) => {
	const { className: extraClassName, ...rest } = props
	return <Text className={cn('font-sfProRounded text-black', extraClassName)} {...rest} />
}

export default AppText
