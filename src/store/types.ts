export interface State {
	count: number
}

export interface Actions {
	increment: () => void
	decrement: () => void
}

export interface Store extends State, Actions {}
