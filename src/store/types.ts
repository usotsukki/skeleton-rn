import { AuthSliceActions, AuthSliceState } from './authSlice'

export interface Store extends AuthSliceActions {
	auth: AuthSliceState
}
