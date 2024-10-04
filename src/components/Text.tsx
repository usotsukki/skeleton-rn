import { Text as UIKitText } from 'react-native-ui-lib'
import { TextPropTypes } from 'react-native-ui-lib/src/components/text'

const Text = (props: TextPropTypes) => {
	return <UIKitText {...props}>{props.children}</UIKitText>
}

export default Text
