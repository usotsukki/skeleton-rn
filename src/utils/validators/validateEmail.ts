/**
 * Validates an email address using a regular expression pattern.
 */
const validateEmail = (email?: string): boolean => {
	if (!email) return false

	const emailRegExp =
		/^[-!#$%&'*+/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/

	return emailRegExp.test(email)
}

export default validateEmail
