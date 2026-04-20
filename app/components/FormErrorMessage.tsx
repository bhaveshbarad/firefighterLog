import type { ReactElement } from 'react';
import { Text } from 'react-native';
import { formStyles } from './formStyles';

export type FormErrorMessageProps = {
    message:  string | null;
    variant?: 'form' | 'block'; /** Form: margin below fields, above primary button. Block: margin below stat row on home. */
};

/**
 * Renders API or validation error text when `message` is set.
 */
export function FormErrorMessage({
    message,
    variant = 'form',
}: FormErrorMessageProps): ReactElement | null {
    if (!message) {
        return null;
    }
    return (
        <Text style={ variant === 'block' ? formStyles.errorBlock : formStyles.errorForm } >
            {message}
        </Text>
    );
}
