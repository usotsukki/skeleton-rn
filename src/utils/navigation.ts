/** Where a signed-in user lands. Change it here when another screen becomes the app's first screen. */
export const HOME_ROUTE = '/Home'
/** testID of the landing screen's root view; `maestro/flows/sign-in.yaml` waits for it. */
export const LANDING_SCREEN_TEST_ID = 'landing-screen'

const TABS_GROUP = '(tabs)'

/**
 * True when the current route is a screen pushed onto a tab's stack (segments continue past the tab
 * name, e.g. `(tabs)/Home/ListDemo`). The drawer turns off its edge swipe there so the iOS back swipe
 * isn't captured by the drawer. Uses expo-router segments: the drawer's `route.state` is not
 * populated for the nested tabs, so it can't be read from screen options.
 *
 * Limitation: a route group nested under a tab (`(tabs)/Home/(flow)/index`) adds a segment and
 * counts as pushed even at its root; account for it here if you add one.
 */
export function isPushedTabScreen(segments: readonly string[]): boolean {
	const tabs = segments.indexOf(TABS_GROUP)
	return tabs !== -1 && segments.length > tabs + 2
}
