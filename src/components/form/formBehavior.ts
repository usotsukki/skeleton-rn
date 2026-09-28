import type { AnyFormApi } from '@tanstack/react-form'
import type { RefObject } from 'react'
import { Keyboard, type TextInput } from 'react-native'
import { useStore } from 'zustand'
import { createStore, type StoreApi } from 'zustand/vanilla'

type SubmitError = { key: string; field?: string } | null

// Kept outside TanStack's errorMap: its blur/change validation wipes `onServer` errors without an
// edit. Keyed by the form's `store`, the one object shared by the core FormApi (onSubmit's
// `formApi`, `field.form`) and the extended API that `useAppForm` / `useFormContext` return.
const submitErrorStores = new WeakMap<object, StoreApi<SubmitError>>()

function submitErrorStore(formApi: AnyFormApi) {
	let store = submitErrorStores.get(formApi.store)
	if (!store) {
		store = createStore<SubmitError>(() => null)
		submitErrorStores.set(formApi.store, store)
	}
	return store
}

/** The `setSubmitError` state of a form, for its submit button and field adapters. */
export function useSubmitError<T>(formApi: AnyFormApi, selector: (error: SubmitError) => T): T {
	return useStore(submitErrorStore(formApi), selector)
}

/**
 * Defaults every `useAppForm` gets: submit stays enabled (an invalid submit shows every error
 * instead of a silently disabled button), the keyboard closes once a submit passes validation, and a
 * `setSubmitError` clears on the next edit. Put the schema in `validators.onChange`;
 * `getDisplayedError` decides when an error shows.
 */
export const APP_FORM_DEFAULTS = {
	canSubmitWhenInvalid: true,
	listeners: {
		onSubmit: () => Keyboard.dismiss(),
		onChange: ({ formApi }: { formApi: AnyFormApi }) => clearSubmitError(formApi),
	},
} as const

/**
 * Shows why a submitted request failed, as an i18n key: under `field` when the error is about one
 * input, else above the submit button (`form.SubmitButton`). Stays until the user edits the form or
 * submits again. Follow with `focusFirstInvalid` so a field error gets focus.
 */
export function setSubmitError(formApi: AnyFormApi, error: { key: string; field?: string }) {
	submitErrorStore(formApi).setState(error, true)
}

function clearSubmitError(formApi: AnyFormApi) {
	const store = submitErrorStores.get(formApi.store)
	if (store?.getState()) store.setState(null, true)
}

/**
 * Submits unless a submit is running or `blocked` (e.g. another request of the screen). For the
 * keyboard's return key, which stays active while the submit button shows its spinner.
 */
export function submitForm(form: AnyFormApi, blocked = false) {
	if (blocked || form.state.isSubmitting) return
	clearSubmitError(form)
	form.handleSubmit().catch(() => {
		// Invalid submit: validators already set field errors.
	})
}

type FieldRefs = readonly (readonly [name: string, ref: RefObject<TextInput | null>])[]

/** Focuses the first field, in screen order, with a validation or `setSubmitError` error. */
export function focusFirstInvalid(formApi: AnyFormApi, fields: FieldRefs) {
	const submitErrorField = submitErrorStores.get(formApi.store)?.getState()?.field
	const invalid = fields.find(([name]) => name === submitErrorField || formApi.getFieldMeta(name)?.errors.length)
	invalid?.[1].current?.focus()
}
