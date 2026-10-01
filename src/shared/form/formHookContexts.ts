import { createFormHookContexts } from '@tanstack/react-form'

/**
 * Field/form contexts for `useAppForm`. Separate module so field adapters can `useFieldContext`
 * without an import cycle through `useAppForm.ts`.
 */
export const { fieldContext, formContext, useFieldContext, useFormContext } = createFormHookContexts()
