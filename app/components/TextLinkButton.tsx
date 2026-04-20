import type { ReactElement } from 'react';
import { Pressable, Text } from 'react-native';
import { formStyles } from './formStyles';

export type TextLinkButtonProps = {
    label:                string;
    onPress:              () => void;
    accessibilityLabel:   string;
    disabled?:            boolean;
};

/**
 * Secondary text-style action below a primary button.
 */
export function TextLinkButton({
    label,
    onPress,
    accessibilityLabel,
    disabled,
}: TextLinkButtonProps): ReactElement {
    return (
        <Pressable
            style={formStyles.link}
            onPress={onPress}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel}
        >
            <Text style={formStyles.linkText}>{label}</Text>
        </Pressable>
    );
}
