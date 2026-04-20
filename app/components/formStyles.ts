import { StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

/**
 * Shared form and panel styles (auth screens, ScreenCard, buttons).
 */
export const formStyles = StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        borderRadius:    radii.md,
        padding:         spacing.xl,
        borderWidth:     1,
        borderColor:     colors.border,
    },
    cardAuth: {
        marginBottom: spacing.lg,
    },
    h2: {
        ...typography.sectionHeading,
        marginBottom: spacing.lg,
    },
    label: {
        ...typography.bodyMedium,
        marginBottom: spacing.sm,
    },
    input: {
        borderWidth:       1,
        borderColor:       colors.borderInput,
        borderRadius:      radii.sm,
        paddingHorizontal: spacing.base,
        paddingVertical:   10,
        ...typography.bodyLarge,
        marginBottom:      spacing.base,
        backgroundColor:   colors.surface,
    },
    button: {
        backgroundColor: colors.brand,
        borderRadius:    radii.sm,
        paddingVertical: 14,
        alignItems:      'center',
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        ...typography.buttonLabel,
    },
    link: {
        marginTop:  spacing.lg,
        alignItems: 'center',
    },
    linkText: {
        ...typography.link,
    },
    errorForm: {
        ...typography.error,
        marginBottom: spacing.base,
    },
    errorBlock: {
        ...typography.error,
        marginTop: spacing.md,
    },
});
