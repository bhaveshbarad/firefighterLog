import type { ReactElement } from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';
import { colors } from '../theme/colors';
import { formStyles } from './formStyles';

export type PrimaryButtonProps = {
    label:                string;
    busy:                 boolean;
    onPress:              () => void | Promise<void>;
    accessibilityLabel:   string;
    disabled?:            boolean;
};

/**
 * Primary filled button with loading spinner when `busy`.
 */
export function PrimaryButton({
    label,
    busy,
    onPress,
    accessibilityLabel,
    disabled,
}: PrimaryButtonProps): ReactElement {
    const isDisabled = disabled ?? false;
    return (
        <Pressable
            style={[
                formStyles.button,
                (busy || isDisabled) && formStyles.buttonDisabled,
            ]}
            onPress={() => void onPress()}
            disabled={busy || isDisabled}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel}
        >
            {busy ? (
                <ActivityIndicator color={colors.textOnPrimary} />
            ) : (
                <Text style={formStyles.buttonText}>{label}</Text>
            )}
        </Pressable>
    );
}
