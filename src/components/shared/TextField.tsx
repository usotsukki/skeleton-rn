import { useState } from 'react'
import { Pressable, TextInput, TextInputProps, View } from 'react-native'
import { colors } from '@app/theme/colors'
import { cn } from '@app/utils'
import { EyeIcon } from '../svg'
import { FormFieldLabel } from './FormFieldLabel'

export interface TextFieldProps extends TextInputProps {
	containerClassName?: string
	label?: string
	inputRef?: React.RefObject<TextInput | null>
	errorMessage?: string
	multiline?: boolean
}

export default function TextField({
	className: extraClassName,
	containerClassName,
	label,
	secureTextEntry: secureTextEntryEnabled,
	inputRef,
	errorMessage,
	multiline,
	...props
}: TextFieldProps) {
	const [isSecureTextEntry, setIsSecureTextEntry] = useState(secureTextEntryEnabled)

	const sharedProps = {
		accessibilityLabel: label,
		className: cn(
			'mt-2 w-full rounded-2xl border border-border bg-bg-elevated px-4 text-[17px] text-text',
			!multiline && 'h-[50px]',
			multiline && 'min-h-[100px] py-4',
			errorMessage && 'border-danger',
			extraClassName,
		),
		multiline,
		numberOfLines: multiline ? 4 : undefined,
		placeholderTextColor: colors['text-muted'],
		secureTextEntry: isSecureTextEntry,
		textAlignVertical: (multiline ? 'top' : undefined) as 'top' | undefined,
		...props,
	}

	return (
		<View className={cn('w-full', containerClassName)}>
			<FormFieldLabel errorMessage={errorMessage} label={label} />
			{secureTextEntryEnabled && (
				<Pressable
					className="absolute bottom-[14px] right-4 z-10"
					hitSlop={8}
					onPress={() => setIsSecureTextEntry(s => !s)}>
					<EyeIcon color={isSecureTextEntry ? colors['text-muted'] : colors['text-secondary']} />
				</Pressable>
			)}
			<TextInput ref={inputRef} {...sharedProps} />
		</View>
	)
}
