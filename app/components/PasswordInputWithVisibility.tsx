import { forwardRef, useState } from 'react';
import type { ReactElement } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
    Pressable,
    TextInput,
    View,
    type TextInput as RNTextInput,
    type TextInputProps,
} from 'react-native';
import { colors } from '../theme/colors';
import { passwordInputStyles as styles } from './passwordInputStyles';

export type PasswordInputWithVisibilityProps = Omit<
    TextInputProps,
    'secureTextEntry'
> & {
    /** Shown when password is hidden (default). */
    accessibilityLabelEyeShow?: string;
    /** Shown when password is visible. */
    accessibilityLabelEyeHide?: string;
};

/**
 * Password field with show/hide toggle (Ionicons eye).
 */
export const PasswordInputWithVisibility = forwardRef<
    RNTextInput,
    PasswordInputWithVisibilityProps
>(function PasswordInputWithVisibility(
    {
        accessibilityLabelEyeShow = 'Show password',
        accessibilityLabelEyeHide = 'Hide password',
        style,
        editable = true,
        ...rest
    },
    ref,
): ReactElement {
    const [visible, setVisible] = useState(false);
    const hidden                = !visible;

    return (
        <View style={styles.fieldRow}>
            <TextInput
                ref={ref}
                {...rest}
                style={[styles.fieldInput, style]}
                secureTextEntry={hidden}
                editable={editable}
            />
            <Pressable
                style={styles.eyeButton}
                onPress={() => setVisible((v) => !v)}
                accessibilityRole="button"
                accessibilityLabel={
                    hidden ? accessibilityLabelEyeShow : accessibilityLabelEyeHide
                }
                disabled={editable === false}
            >
                <Ionicons
                    name={hidden ? 'eye' : 'eye-off'}
                    size={22}
                    color={colors.textMuted}
                />
            </Pressable>
        </View>
    );
});
