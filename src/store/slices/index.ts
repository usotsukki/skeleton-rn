import { default as authSlice, AuthSliceActions, AuthSliceState } from './authSlice'

interface RootStore extends AuthSliceActions {
	auth: AuthSliceState
}

export { authSlice, RootStore }
