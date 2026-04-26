import { Image } from 'expo-image'
import { View } from 'react-native'
import { cn } from '@app/utils'
import AppText from './AppText'

interface AvatarProps {
	uri?: string | null
	name?: string | null
	size?: number
	className?: string
}

function initialsFor(name?: string | null): string {
	if (!name) return '?'
	const parts = name.trim().split(/\s+/).slice(0, 2)
	return parts.map(p => p[0]?.toUpperCase() ?? '').join('') || '?'
}

export function Avatar({ uri, name, size = 56, className }: AvatarProps) {
	const dim = { width: size, height: size, borderRadius: size / 2 }

	if (uri) {
		return <Image cachePolicy="memory-disk" contentFit="cover" source={{ uri }} style={dim} />
	}

	return (
		<View className={cn('items-center justify-center bg-accent-soft', className)} style={dim}>
			<AppText className="text-accent" variant="h3">
				{initialsFor(name)}
			</AppText>
		</View>
	)
}
