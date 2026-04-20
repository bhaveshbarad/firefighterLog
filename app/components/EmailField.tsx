import { forwardRef } from 'react';
import type { ReactElement } from 'react';
import { TextInput } from 'react-native';
import type { TextInput as RNTextInput } from 'react-native';
import { formStyles } from './formStyles';

export type EmailFieldProps = {
    value:            string;
    onChangeText:     (value: string) => void;
    editable:         boolean;
    onSubmitEditing?: () => void;
};

/**
 * Email `TextInput` with consistent autofill and keyboard settings.
 */
export const EmailField = forwardRef<RNTextInput, EmailFieldProps>(
    function EmailField(
        { value, onChangeText, editable, onSubmitEditing },
        ref,
    ): ReactElement {
        return (
            <TextInput
                ref={ref}
                style={formStyles.input}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                textContentType="username"
                autoCorrect={false}
                returnKeyType="next"
                blurOnSubmit={false}
                value={value}
                onChangeText={onChangeText}
                editable={editable}
                onSubmitEditing={onSubmitEditing}
            />
        );
    },
);
