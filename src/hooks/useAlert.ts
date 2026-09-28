import { Keyboard } from 'react-native'
import { create } from 'zustand'

export type AlertVariant = 'success' | 'info' | 'error' | 'destructive-confirm' | 'plain'

export type AlertButtonVariant = 'primary' | 'secondary' | 'destructive'

interface AlertOptions {
	title: string
	description?: string
	/** Visual variant. Defaults to `success`. */
	variant?: AlertVariant
	continueButtonText?: string
	cancelButtonText?: string
	/** Continue button styling. Default `primary` (accent fill); `destructive-confirm` alerts use `destructive`. */
	continueVariant?: AlertButtonVariant
	/** Cancel button styling. Default `secondary` (accent outline). */
	cancelVariant?: AlertButtonVariant
	onContinue?: () => void
	onCancel?: () => void
	onDismiss?: () => void
	/** When true, tapping the backdrop fires `onDismiss` and closes. */
	cancelable?: boolean
}

interface AlertStore extends AlertOptions {
	visible: boolean
	showAlert: (options: AlertOptions) => void
	hideAlert: () => void
}

// Opening over a visible keyboard would leave it covering the card: dismiss first and open on
// keyboardDidHide. The fallback covers a missed event: it opens only once the keyboard really is hidden
// (the iOS hide animation takes ~250 ms), with a hard deadline so the alert can never get stuck.
const KEYBOARD_HIDE_CHECK_MS = 300
const KEYBOARD_HIDE_DEADLINE_MS = 1000

let pendingShowSubscription: ReturnType<typeof Keyboard.addListener> | null = null
let pendingShowTimeout: ReturnType<typeof setTimeout> | null = null

function clearPendingShow() {
	pendingShowSubscription?.remove()
	pendingShowSubscription = null
	if (pendingShowTimeout) {
		clearTimeout(pendingShowTimeout)
		pendingShowTimeout = null
	}
}

const EMPTY_ALERT: Required<Pick<AlertOptions, 'title'>> & Omit<AlertOptions, 'title'> = {
	title: '',
	description: undefined,
	variant: undefined,
	continueButtonText: undefined,
	cancelButtonText: undefined,
	continueVariant: undefined,
	cancelVariant: undefined,
	onContinue: undefined,
	onCancel: undefined,
	onDismiss: undefined,
	cancelable: undefined,
}

/** App-wide alert store; rendered by `AppAlert` (mounted once in the root layout). */
const useAlert = create<AlertStore>(set => ({
	visible: false,
	...EMPTY_ALERT,
	showAlert: options => {
		clearPendingShow()

		const openAlert = () => {
			clearPendingShow()
			// Replace, don't merge: fields the new alert omits must not leak from the previous one.
			set({ ...EMPTY_ALERT, visible: true, ...options })
		}

		if (!Keyboard.isVisible()) {
			openAlert()
			return
		}

		pendingShowSubscription = Keyboard.addListener('keyboardDidHide', openAlert)
		pendingShowTimeout = setTimeout(() => {
			if (!Keyboard.isVisible()) {
				openAlert()
				return
			}
			pendingShowTimeout = setTimeout(openAlert, KEYBOARD_HIDE_DEADLINE_MS - KEYBOARD_HIDE_CHECK_MS)
		}, KEYBOARD_HIDE_CHECK_MS)
		Keyboard.dismiss()
	},
	hideAlert: () => {
		clearPendingShow()
		set({ ...EMPTY_ALERT, visible: false })
	},
}))

export default useAlert
