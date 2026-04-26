import { Text, TextProps } from 'react-native'
import { cn } from '@app/utils'

const textVariants = {
	disp: 'text-[34px] font-semibold tracking-tight', // Display (iOS Large Title)
	h1: 'text-[28px] font-semibold tracking-tight', // Title 1
	h2: 'text-[22px] font-semibold', // Title 2
	h3: 'text-[20px] font-semibold', // Title 3

	tl: 'text-[17px]', // Body large
	tm: 'text-[16px]', // Body
	tmed: 'text-[16px] font-medium', // Body medium
	ts: 'text-[14px]', // Subhead

	btn: 'text-[16px] font-semibold', // Button
	ol: 'text-[12px]', // Footnote
	ols: 'text-[12px] font-semibold', // Footnote semibold
	cap: 'text-[11px]', // Caption
	capm: 'text-[11px] font-medium', // Caption medium
} as const

interface AppTextProps extends TextProps {
	variant?: keyof typeof textVariants
}

const AppText = ({ variant = 'tm', className: extraClassName, ...rest }: AppTextProps) => {
	const variantClassName = variant ? textVariants[variant] : textVariants.tm
	return <Text className={cn('text-text', variantClassName, extraClassName)} {...rest} />
}

export default AppText
