import * as PopoverPrimitive from '@rn-primitives/popover'
import * as React from 'react'
import { Platform, StyleSheet } from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { FullWindowOverlay as RNFullWindowOverlay } from 'react-native-screens'
import { cn } from '@app/shared/utils/cn'

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverClose = PopoverPrimitive.Close

// iOS: above native modals and sheets. Android renders portals above the app already.
const FullWindowOverlay = Platform.OS === 'ios' ? RNFullWindowOverlay : React.Fragment

/** Content renders into the root `PortalHost`; tapping outside closes it. */
function PopoverContent({
	className,
	align = 'center',
	sideOffset = 4,
	portalHost,
	...props
}: React.ComponentProps<typeof PopoverPrimitive.Content> & {
	portalHost?: string
}) {
	return (
		<PopoverPrimitive.Portal hostName={portalHost}>
			<FullWindowOverlay>
				<PopoverPrimitive.Overlay style={Platform.select({ native: StyleSheet.absoluteFill })}>
					<Animated.View entering={FadeIn.duration(200)} exiting={FadeOut}>
						<PopoverPrimitive.Content
							align={align}
							className={cn(
								'z-50 rounded-xl border border-border bg-bg-elevated p-3 shadow-md shadow-black/10',
								className,
							)}
							sideOffset={sideOffset}
							{...props}
						/>
					</Animated.View>
				</PopoverPrimitive.Overlay>
			</FullWindowOverlay>
		</PopoverPrimitive.Portal>
	)
}

export { Popover, PopoverClose, PopoverContent, PopoverTrigger }
