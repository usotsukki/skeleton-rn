import type { AnyFormApi } from '@tanstack/react-form'
import { fireEvent, screen, waitFor } from '@testing-library/react-native'
import React from 'react'
import type { TextInput } from 'react-native'
import { z } from 'zod'
import { renderWithAppProviders } from '@app/test/render'
import { focusFirstInvalid, setSubmitError, submitForm } from '../formBehavior'
import { useAppForm } from '../useAppForm'

const NAME_REQUIRED = 'validation.nameRequired'
const NAME_SHORT = 'validation.nameShort'
const schema = z.object({
	name: z.string().min(1, { error: NAME_REQUIRED, abort: true }).min(3, NAME_SHORT),
	agree: z.boolean(),
})

interface DemoFormProps {
	onSubmit: (value: { name: string; agree: boolean }) => void | Promise<unknown>
	/** Error to show when `onSubmit` rejects. */
	submitError?: { key: string; field?: string }
}

function DemoForm({ onSubmit, submitError }: DemoFormProps) {
	const form = useAppForm({
		defaultValues: { name: '', agree: false },
		validators: { onChange: schema },
		onSubmit: async ({ value, formApi }) => {
			try {
				await onSubmit(value)
			} catch {
				if (submitError) setSubmitError(formApi, submitError)
			}
		},
	})
	return (
		<>
			<form.AppField name="name">{field => <field.TextField label="Name" testID="name" />}</form.AppField>
			<form.AppField name="agree">{field => <field.SwitchField label="Agree" testID="agree" />}</form.AppField>
			<form.AppForm>
				<form.SubmitButton label="Save" testID="save" />
			</form.AppForm>
		</>
	)
}

const isDisabled = () => screen.getByTestId('save').props.accessibilityState?.disabled

describe('useAppForm', () => {
	it('keeps submit enabled on an empty form; submitting shows the errors instead', async () => {
		const onSubmit = jest.fn()
		await renderWithAppProviders(<DemoForm onSubmit={onSubmit} />)
		expect(screen.queryByText(NAME_REQUIRED)).toBeNull()
		expect(isDisabled()).toBe(false)

		await fireEvent.press(screen.getByTestId('save'))
		expect(await screen.findByText(NAME_REQUIRED)).toBeOnTheScreen()
		expect(onSubmit).not.toHaveBeenCalled()
		expect(isDisabled()).toBe(false)
	})

	it('does not validate while a fresh field is typed into', async () => {
		await renderWithAppProviders(<DemoForm onSubmit={jest.fn()} />)
		await fireEvent.changeText(screen.getByTestId('name'), 'a')
		expect(screen.queryByText(NAME_SHORT)).toBeNull()
	})

	it('does not flag an empty field that was only focused and left', async () => {
		await renderWithAppProviders(<DemoForm onSubmit={jest.fn()} />)
		await fireEvent(screen.getByTestId('name'), 'blur')
		expect(screen.queryByText(NAME_REQUIRED)).toBeNull()
	})

	it('validates on leaving the field, then live while it is fixed', async () => {
		await renderWithAppProviders(<DemoForm onSubmit={jest.fn()} />)
		await fireEvent.changeText(screen.getByTestId('name'), 'a')
		await fireEvent(screen.getByTestId('name'), 'blur')
		expect(await screen.findByText(NAME_SHORT)).toBeOnTheScreen()

		await fireEvent.changeText(screen.getByTestId('name'), 'abc')
		await waitFor(() => expect(screen.queryByText(NAME_SHORT)).toBeNull())
		await fireEvent.changeText(screen.getByTestId('name'), '')
		expect(await screen.findByText(NAME_REQUIRED)).toBeOnTheScreen()
	})

	it('revalidates live after a submit attempt', async () => {
		await renderWithAppProviders(<DemoForm onSubmit={jest.fn()} />)
		await fireEvent.press(screen.getByTestId('save'))
		await screen.findByText(NAME_REQUIRED)

		await fireEvent.changeText(screen.getByTestId('name'), 'ab')
		expect(await screen.findByText(NAME_SHORT)).toBeOnTheScreen()
	})

	it('submits the typed values once valid', async () => {
		const onSubmit = jest.fn()
		await renderWithAppProviders(<DemoForm onSubmit={onSubmit} />)
		await fireEvent.changeText(screen.getByTestId('name'), 'Roma')

		await fireEvent.press(screen.getByTestId('save'))
		await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ name: 'Roma', agree: false }))
	})
})

describe('setSubmitError', () => {
	const failingSubmit = () => Promise.reject(new Error('server said no'))

	async function submitName() {
		await fireEvent.changeText(screen.getByTestId('name'), 'Roma')
		await fireEvent.press(screen.getByTestId('save'))
	}

	it('shows a form-level error above the button until the next edit', async () => {
		await renderWithAppProviders(<DemoForm onSubmit={failingSubmit} submitError={{ key: 'error.networkError' }} />)
		await submitName()
		expect(await screen.findByText('error.networkError')).toBeOnTheScreen()

		await fireEvent.changeText(screen.getByTestId('name'), 'Roma2')
		expect(screen.queryByText('error.networkError')).toBeNull()
	})

	it('shows a field error under that field, even while other edits keep the form invalid', async () => {
		await renderWithAppProviders(
			<DemoForm onSubmit={failingSubmit} submitError={{ key: 'error.emailAlreadyInUse', field: 'name' }} />,
		)
		await submitName()
		expect(await screen.findByText('error.emailAlreadyInUse')).toBeOnTheScreen()
		expect(screen.queryByTestId('form-error')).toBeNull()

		await fireEvent.changeText(screen.getByTestId('name'), '')
		expect(screen.queryByText('error.emailAlreadyInUse')).toBeNull()
		expect(await screen.findByText(NAME_REQUIRED)).toBeOnTheScreen()
	})

	it('keeps both kinds of error when a field loses focus without an edit', async () => {
		await renderWithAppProviders(<DemoForm onSubmit={failingSubmit} submitError={{ key: 'error.networkError' }} />)
		await submitName()
		await screen.findByText('error.networkError')
		await fireEvent(screen.getByTestId('name'), 'blur')
		expect(screen.getByText('error.networkError')).toBeOnTheScreen()
	})

	it('keeps a field error when a field loses focus without an edit', async () => {
		await renderWithAppProviders(
			<DemoForm onSubmit={failingSubmit} submitError={{ key: 'error.emailAlreadyInUse', field: 'name' }} />,
		)
		await submitName()
		await screen.findByText('error.emailAlreadyInUse')
		await fireEvent(screen.getByTestId('name'), 'blur')
		expect(screen.getByText('error.emailAlreadyInUse')).toBeOnTheScreen()
	})

	it('clears on a new submit', async () => {
		const onSubmit = jest.fn(failingSubmit)
		await renderWithAppProviders(<DemoForm onSubmit={onSubmit} submitError={{ key: 'error.networkError' }} />)
		await submitName()
		await screen.findByText('error.networkError')

		onSubmit.mockImplementationOnce(() => new Promise(() => {}))
		await fireEvent.press(screen.getByTestId('save'))
		expect(screen.queryByText('error.networkError')).toBeNull()
	})
})

describe('form behavior helpers', () => {
	const fakeRef = () => ({ current: { focus: jest.fn() } }) as unknown as React.RefObject<TextInput | null>

	it('focusFirstInvalid focuses the first field in order that has an error', () => {
		const errors: Record<string, string[]> = { email: [], password: ['error.required'], confirm: ['error.required'] }
		const formApi = { getFieldMeta: (name: string) => ({ errors: errors[name] }) } as unknown as AnyFormApi
		const refs = { email: fakeRef(), password: fakeRef(), confirm: fakeRef() }

		focusFirstInvalid(formApi, [
			['email', refs.email],
			['password', refs.password],
			['confirm', refs.confirm],
		])

		expect(refs.email.current?.focus).not.toHaveBeenCalled()
		expect(refs.password.current?.focus).toHaveBeenCalledTimes(1)
		expect(refs.confirm.current?.focus).not.toHaveBeenCalled()
	})

	it('focusFirstInvalid also focuses a field that only has a submit error', () => {
		const formApi = { store: {}, getFieldMeta: () => ({ errors: [] }) } as unknown as AnyFormApi
		const refs = { email: fakeRef(), password: fakeRef() }
		setSubmitError(formApi, { key: 'error.shortPassword', field: 'password' })

		focusFirstInvalid(formApi, [
			['email', refs.email],
			['password', refs.password],
		])

		expect(refs.email.current?.focus).not.toHaveBeenCalled()
		expect(refs.password.current?.focus).toHaveBeenCalledTimes(1)
	})

	it('submitForm skips while blocked or already submitting', () => {
		const handleSubmit = jest.fn(() => Promise.resolve())
		const form = (isSubmitting: boolean) =>
			({ state: { isSubmitting, errorMap: {}, fieldMeta: {} }, handleSubmit }) as unknown as AnyFormApi

		submitForm(form(false), true)
		submitForm(form(true))
		expect(handleSubmit).not.toHaveBeenCalled()

		submitForm(form(false))
		expect(handleSubmit).toHaveBeenCalledTimes(1)
	})
})
