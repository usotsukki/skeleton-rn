import { fireEvent, render, screen } from '@testing-library/react-native'
import * as SplashScreen from 'expo-splash-screen'
import AnimatedSplash from '../AnimatedSplash'

const mockUseReducedMotion = jest.fn(() => false)
const mockWithTiming = jest.fn(
	(value: number, _config: { reduceMotion?: string }, callback?: (finished: boolean) => void) => {
		callback?.(true)
		return value
	},
)

// Local mock: the shared one drops props on Animated.View and never runs animation callbacks.
jest.mock('react-native-reanimated', () => {
	const { Image, View } = jest.requireActual('react-native')
	const identity = <T,>(v: T) => v
	return {
		__esModule: true,
		default: { View, Image },
		Easing: { in: () => identity, out: () => identity, cubic: identity },
		ReduceMotion: { Never: 'never' },
		interpolate: (_v: number, _i: number[], out: number[]) => out[0],
		runOnJS: identity,
		useAnimatedStyle: (cb: () => unknown) => cb(),
		useReducedMotion: () => mockUseReducedMotion(),
		useSharedValue: (value: number) => ({ value }),
		withDelay: (_ms: number, value: unknown) => value,
		withTiming: (...args: Parameters<typeof mockWithTiming>) => mockWithTiming(...args),
	}
})

const getSplash = () => screen.getByTestId('animated-splash', { includeHiddenElements: true })
const getIcon = () => screen.getByTestId('animated-splash-icon', { includeHiddenElements: true })

describe('AnimatedSplash', () => {
	afterEach(() => {
		jest.useRealTimers()
		mockUseReducedMotion.mockReturnValue(false)
	})

	it('hides the native splash without its fade once its own first frame is laid out and the icon loaded', () => {
		render(<AnimatedSplash onHidden={jest.fn()} ready={false} />)
		// Set on mount so Android's queued options land before hide().
		expect(SplashScreen.setOptions).toHaveBeenCalledWith({ duration: 0, fade: false })

		fireEvent(getSplash(), 'layout')
		expect(SplashScreen.hide).not.toHaveBeenCalled()

		fireEvent(getIcon(), 'loadEnd')
		expect(SplashScreen.hide).toHaveBeenCalledTimes(1)

		fireEvent(getSplash(), 'layout')
		expect(SplashScreen.hide).toHaveBeenCalledTimes(1)
	})

	it('hides the native splash when ready even if the icon never reported loading', () => {
		const { rerender } = render(<AnimatedSplash onHidden={jest.fn()} ready={false} />)
		expect(SplashScreen.hide).not.toHaveBeenCalled()

		rerender(<AnimatedSplash onHidden={jest.fn()} ready />)
		expect(SplashScreen.hide).toHaveBeenCalledTimes(1)
	})

	it('waits for ready before playing the outro', () => {
		const onHidden = jest.fn()
		const { rerender } = render(<AnimatedSplash onHidden={onHidden} ready={false} />)
		expect(onHidden).not.toHaveBeenCalled()

		rerender(<AnimatedSplash onHidden={onHidden} ready />)
		expect(onHidden).toHaveBeenCalledTimes(1)
	})

	it('hides after a timeout when the fade never reports finishing', () => {
		jest.useFakeTimers()
		mockWithTiming.mockImplementationOnce(value => value)
		const onHidden = jest.fn()
		render(<AnimatedSplash onHidden={onHidden} ready />)
		expect(onHidden).not.toHaveBeenCalled()

		jest.advanceTimersByTime(2000)
		expect(onHidden).toHaveBeenCalledTimes(1)
	})

	it('reports hidden once when the fade finishes and the parent keeps it mounted past the timeout', () => {
		jest.useFakeTimers()
		const onHidden = jest.fn()
		render(<AnimatedSplash onHidden={onHidden} ready />)
		expect(onHidden).toHaveBeenCalledTimes(1)

		jest.advanceTimersByTime(2000)
		expect(onHidden).toHaveBeenCalledTimes(1)
	})

	it('still fades out under reduced motion instead of letting Reanimated skip the fade', () => {
		mockUseReducedMotion.mockReturnValue(true)
		const onHidden = jest.fn()
		render(<AnimatedSplash onHidden={onHidden} ready />)

		expect(mockWithTiming).toHaveBeenCalledTimes(1)
		expect(mockWithTiming.mock.calls[0][1]).toEqual(expect.objectContaining({ reduceMotion: 'never' }))
		expect(onHidden).toHaveBeenCalledTimes(1)
	})

	it('is hidden from screen readers', () => {
		render(<AnimatedSplash onHidden={jest.fn()} ready={false} />)
		expect(getSplash()).toHaveProp('accessibilityElementsHidden', true)
		expect(getSplash()).toHaveProp('importantForAccessibility', 'no-hide-descendants')
	})
})
