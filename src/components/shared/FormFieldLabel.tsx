import AppText from './AppText'

interface FormFieldLabelProps {
	label?: string
	errorMessage?: string
}

/** Shared label + validation message stack used by form controls. */
export function FormFieldLabel({ label, errorMessage }: FormFieldLabelProps) {
	return (
		<>
			{label && (
				<AppText className="text-text-secondary" variant="tmed">
					{label}
				</AppText>
			)}
			{errorMessage && (
				<AppText className="text-danger" variant="ts">
					{errorMessage}
				</AppText>
			)}
		</>
	)
}
