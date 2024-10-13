export const getErrorData = (e: unknown): { code: string; message: string } => {
	let message = 'unknown error'
	let code = ''

	if (e instanceof Error) {
		message = e.message
	}

	if (typeof e === 'object' && e !== null) {
		if ('code' in e) {
			code = String(e.code)
		}
		if ('message' in e) {
			message = String(e.message)
		}
	}

	if (typeof e === 'string') {
		message = e
	}
	return { code, message }
}
