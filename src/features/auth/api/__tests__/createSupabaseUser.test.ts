import { createSupabaseUser } from '../supabase'

const mockSignUp = jest.fn()

jest.mock('@app/shared/api/supabase/client', () => ({
	supabase: { auth: { signUp: (...args: unknown[]) => mockSignUp(...args) } },
}))
jest.mock('@app/shared/api/supabase/deepLinks', () => ({ createResetPasswordRedirectUrl: jest.fn() }))
jest.mock('../providerTokens', () => ({ getAppleIdentityToken: jest.fn(), getGoogleIdToken: jest.fn() }))

describe('createSupabaseUser', () => {
	it('reports the session state of a new account', async () => {
		mockSignUp.mockResolvedValue({ data: { user: { id: 'u1', identities: [{}] }, session: null }, error: null })
		await expect(createSupabaseUser('a@b.co', 'secret1')).resolves.toMatchObject({ hasSession: false })
	})

	it("answers an existing address like a new one, so sign-up doesn't reveal accounts", async () => {
		mockSignUp.mockResolvedValue({ data: { user: { id: 'fake', identities: [] }, session: null }, error: null })
		await expect(createSupabaseUser('a@b.co', 'secret1')).resolves.toMatchObject({ hasSession: false })
	})
})
