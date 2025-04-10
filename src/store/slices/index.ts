import { default as sampleSlice, SampleSliceActions, SampleSliceState } from './sampleSlice'

interface RootStore extends SampleSliceActions {
	sample: SampleSliceState
}

export { sampleSlice, RootStore }
