import { Slot, useRouter } from 'expo-router'
import { ErrorBoundary, FallbackProps } from 'react-error-boundary'
import { Background, ErrorFallback } from '@app/components'

const AuthStackLayout = () => {
	const router = useRouter()

	const onReset = () => router.replace('/(auth)/Welcome')
	const renderFallback = ({ error, resetErrorBoundary }: FallbackProps) => (
		<ErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} />
	)

	return (
		<Background>
			<ErrorBoundary fallbackRender={renderFallback} onReset={onReset}>
				<Slot />
			</ErrorBoundary>
		</Background>
	)
}
export default AuthStackLayout
