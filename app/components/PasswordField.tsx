import { forwardRef } from 'react';
import type { ReactElement } from 'react';
import type { TextInput as RNTextInput } from 'react-native';
import { PasswordInputWithVisibility } from './PasswordInputWithVisibility';

export type PasswordFieldProps = {
    value:             string;
    onChangeText:      (value: string) => void;
    editable:          boolean;
    mode:              'login' | 'register';
    returnKeyType:     'next' | 'go';
    blurOnSubmit?:     boolean;
    onSubmitEditing?:  () => void;
};

/**
 * Password field with visibility toggle; `mode` selects autofill hints for sign-in vs registration.
 */
export const PasswordField = forwardRef<RNTextInput, PasswordFieldProps>(
    function PasswordField(
        {
            value,
            onChangeText,
            editable,
            mode,
            returnKeyType,
            blurOnSubmit,
            onSubmitEditing,
        },
        ref,
    ): ReactElement {
        const autoComplete =
            mode === 'login' ? 'password' : 'password-new';
        const textContentType =
            mode === 'login' ? 'password' : 'newPassword';

        const resolvedBlur =
            blurOnSubmit !== undefined
                ? blurOnSubmit
                : returnKeyType === 'next'
                  ? false
                  : true;

        return (
            <PasswordInputWithVisibility
                ref={ref}
                value={value}
                onChangeText={onChangeText}
                editable={editable}
                autoComplete={autoComplete}
                textContentType={textContentType}
                autoCorrect={false}
                returnKeyType={returnKeyType}
                blurOnSubmit={resolvedBlur}
                onSubmitEditing={onSubmitEditing}
            />
        );
    },
);
