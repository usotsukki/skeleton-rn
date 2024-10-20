import { FirebaseAuthTypes } from '@react-native-firebase/auth'
import { createSliceWithImmer } from '@app/utils/store/createSliceWithImmer'

export interface AuthSliceState {
	loading: boolean
	error: string | null
	user: FirebaseAuthTypes.User | null
}

export interface AuthSliceActions {
	setLoading: (value: boolean) => void
	setError: (e: null | string) => void
	setUser: (user: FirebaseAuthTypes.User | null) => void
	logout: () => void
}

const authSlice = createSliceWithImmer({
	name: 'auth',
	value: {
		user: null,
		loading: false,
		error: null,
	} as AuthSliceState,
	actions: {
		setLoading: (value: boolean) => state => {
			state.loading = value
		},
		setError: (e: string | null) => state => {
			state.error = e
		},
		setUser: (user: FirebaseAuthTypes.User | null) => state => {
			state.user = user
		},
		logout: () => state => {
			state.user = null
		},
	},
})

export default authSlice
