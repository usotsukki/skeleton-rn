export interface AuthUser {
	uid: string
	displayName?: string | null
	email?: string | null
	phoneNumber?: string | null
	photoURL?: string | null
}

export interface CreateUserResult {
	user: AuthUser | null
	hasSession: boolean
}
