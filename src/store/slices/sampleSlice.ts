import { createSliceWithImmer } from '@app/utils/store/createSliceWithImmer'

export interface SampleSliceState {
	count: number
}

export interface SampleSliceActions {
	increment: () => void
	decrement: () => void
}

const sampleSlice = createSliceWithImmer({
	name: 'sample',
	value: {
		count: 0,
	} as SampleSliceState,
	actions: {
		increment: () => state => {
			state.count += 1
		},
		decrement: () => state => {
			state.count -= 1
		},
	},
})

export default sampleSlice
