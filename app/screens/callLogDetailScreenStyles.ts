import { StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export const callLogDetailScreenStyles = StyleSheet.create({
    root: {
        flex:            1,
        backgroundColor: colors.background,
    },
    scroll: {
        padding:           spacing.xxl,
        paddingBottom:     spacing.xxxl,
    },
    label: {
        ...typography.bodyMedium,
        marginBottom: spacing.xs,
        marginTop:    spacing.lg,
    },
    labelFirst: {
        ...typography.bodyMedium,
        marginBottom: spacing.xs,
        marginTop:    0,
    },
    value: {
        ...typography.bodyLarge,
        flex:     1,
        minWidth: 0,
    },
    valueRow: {
        flexDirection: 'row',
        alignItems:    'center',
        gap:           spacing.sm,
    },
    notes: {
        ...typography.bodyLarge,
        marginTop: spacing.xs,
    },
});
