import { StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

/**
 * Layout for the root auth shell in App.tsx (scroll, title, footer).
 * Form controls live in {@link ../components/formStyles}.
 */
export const authScreenStyles = StyleSheet.create({
    flex: {
        flex:            1,
        backgroundColor: colors.background,
    },
    scroll: {
        padding:    spacing.xxl,
        paddingTop: spacing.xxxl,
    },
    centered: {
        flex:            1,
        backgroundColor: colors.background,
        alignItems:      'center',
        justifyContent:  'center',
    },
    title: {
        ...typography.screenTitle,
        marginBottom: spacing.xl,
        textAlign:    'center',
    },
    footer: {
        ...typography.caption,
        textAlign: 'center',
        marginTop: spacing.md,
    },
});
