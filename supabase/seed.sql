-- Local-only dev user, so people and agents can sign in right after `yarn backend:start` / `backend:reset`.
-- Same credentials as .env.e2e.example. They exist only on the local stack: never run this against a hosted project.
do $$
declare
	uid uuid := '00000000-0000-4000-8000-000000000001';
	email text := 'dev@skeleton.test';
begin
	insert into auth.users (
		instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
		raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
		confirmation_token, recovery_token, email_change, email_change_token_new
	) values (
		'00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', email,
		extensions.crypt('local-dev-password', extensions.gen_salt('bf')), now(),
		'{"provider":"email","providers":["email"]}', '{}', now(), now(),
		'', '', '', ''
	);
	insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
	values (
		gen_random_uuid(), uid, uid::text,
		jsonb_build_object('sub', uid::text, 'email', email, 'email_verified', true),
		'email', now(), now(), now()
	);

	insert into public.notes (user_id, title) values (uid, 'Hello from the local backend');
end $$;
