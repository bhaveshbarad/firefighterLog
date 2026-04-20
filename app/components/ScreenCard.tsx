import type { ReactElement, ReactNode } from 'react';
import { View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { formStyles } from './formStyles';

export type ScreenCardProps = {
    children:  ReactNode;
    variant?:  'default' | 'auth'; /** Auth stack cards include bottom margin; home panel does not. */
    style?:    StyleProp<ViewStyle>;
};

/**
 * White bordered panel used on home and auth forms.
 */
export function ScreenCard({
    children,
    variant = 'default',
    style,
}: ScreenCardProps): ReactElement {
    return (
        <View
            style={[
                formStyles.card,
                variant === 'auth' ? formStyles.cardAuth : null,
                style,
            ]}
        >
            {children}
        </View>
    );
}
