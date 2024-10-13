import { AuthSliceActions, AuthSliceState } from './authSlice'
import { ToastSliceActions, ToastSliceState } from './toastSlice'

export interface Store extends AuthSliceActions, ToastSliceActions {
	auth: AuthSliceState
	toast: ToastSliceState
}
