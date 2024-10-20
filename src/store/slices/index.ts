import { default as authSlice, AuthSliceActions, AuthSliceState } from './authSlice'
import { default as connectionSlice, ConnectionSliceActions, ConnectionSliceState } from './connectionSlice'
import { default as toastSlice, ToastSliceActions, ToastSliceState } from './toastSlice'

interface RootStore extends AuthSliceActions, ToastSliceActions, ConnectionSliceActions {
	auth: AuthSliceState
	toast: ToastSliceState
	connection: ConnectionSliceState
}

export { authSlice, connectionSlice, toastSlice, RootStore }
