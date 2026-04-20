import { StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export const homeScreenStyles = StyleSheet.create({
    root: {
        flex:            1,
        backgroundColor: colors.background,
    },
    scroll: {
        flex:    1,
        padding: spacing.xxl,
    },
    dashboardRow: {
        flexDirection: 'row',
        alignItems:      'flex-start',
        gap:             spacing.xxl,
    },
    dashboardCol: {
        flex:     1,
        minWidth: 0,
    },
    dashboardColStat: {
        flex:     1,
        minWidth: 0,
    },
    statSpinner: {
        marginTop: spacing.md,
    },
    cardLabel: {
        ...typography.bodyMedium,
        marginBottom: spacing.sm,
    },
    email: {
        ...typography.bodyLargeSemibold,
        marginBottom: spacing.xl,
    },
    profileBlockLabel: {
        ...typography.bodyMedium,
        marginBottom: spacing.sm,
    },
    profileBlockValue: {
        ...typography.bodyLarge,
        marginBottom: spacing.xl,
    },
    stationLine: {
        ...typography.bodyLarge,
        marginBottom: spacing.sm,
    },
    stationMeta: {
        ...typography.bodySmall,
        marginBottom: spacing.xl,
    },
    statLabel: {
        ...typography.bodyMedium,
        marginBottom: spacing.sm,
    },
    statValue: {
        ...typography.statValue,
    },
    statHint: {
        ...typography.bodySmall,
        marginTop: spacing.lg,
    },
    modalRoot: {
        flex:              1,
        backgroundColor: colors.overlay,
    },
    modalMenuWrap: {
        position: 'absolute',
        top:      spacing.xxxl,
        right:    spacing.base,
        maxWidth: 280,
    },
    menuPanel: {
        backgroundColor: colors.surface,
        borderRadius:    radii.md,
        minWidth:        220,
        borderWidth:     1,
        borderColor:     colors.border,
        overflow:        'hidden',
    },
    menuItem: {
        paddingVertical:   14,
        paddingHorizontal: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderSubtle,
    },
    menuItemRow: {
        flexDirection: 'row',
        alignItems:    'center',
        gap:           spacing.md,
    },
    menuItemLast: {
        borderBottomWidth: 0,
    },
    menuItemText: {
        ...typography.bodyLarge,
    },
    menuItemDanger: {
        color: colors.error,
    },
    menuTitle: {
        ...typography.labelUppercase,
        paddingHorizontal: spacing.lg,
        paddingTop:        spacing.base,
        paddingBottom:     spacing.sm,
    },
});
