import { createSliceWithImmer } from '@app/utils/store/createSliceWithImmer'

export interface ConnectionSliceState {
	hasInternetConnection: boolean
}

export interface ConnectionSliceActions {
	setConnectionStatus: (status: boolean) => void
}

const connectionSlice = createSliceWithImmer({
	name: 'connection',
	value: {
		hasInternetConnection: true,
	} as ConnectionSliceState,
	actions: {
		setConnectionStatus: (status: boolean) => state => {
			state.hasInternetConnection = status
		},
	},
})

export default connectionSlice
