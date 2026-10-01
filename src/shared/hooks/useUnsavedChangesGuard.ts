import { useNavigation, usePreventRemove } from 'expo-router/react-navigation'
import { showUnsavedChangesAlert } from '@app/shared/utils/alerts'

/**
 * Stops the screen from being left (back button, swipe, `router.back()`) while it holds unsaved
 * edits, and asks "Discard changes?". Discarding replays the original navigation action.
 * Pass the form's `isDirty` / `isSubmitting` (e.g. from `form.useStore`).
 */
export function useUnsavedChangesGuard({ isDirty, isSubmitting }: { isDirty: boolean; isSubmitting: boolean }) {
	const navigation = useNavigation()
	usePreventRemove(isDirty && !isSubmitting, ({ data }) => {
		showUnsavedChangesAlert({ onDiscard: () => navigation.dispatch(data.action) })
	})
}
