import { StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export const accountScreenStyles = StyleSheet.create({
    root: {
        flex:            1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        paddingBottom: spacing.xxl,
    },
    scrollInner: {
        paddingHorizontal: spacing.lg,
        paddingTop:        spacing.md,
    },
    sectionTitle: {
        ...typography.sectionHeading,
        marginBottom: spacing.sm,
    },
    sectionHint: {
        ...typography.bodySmall,
        marginBottom: spacing.md,
    },
    /** Profile block — neutral surface. */
    sectionPanel: {
        backgroundColor: colors.surface,
        borderRadius:    radii.md,
        borderWidth:     1,
        borderColor:     colors.border,
        padding:         spacing.lg,
        marginBottom:    spacing.lg,
    },
    /** Fire stations — muted gray. */
    sectionPanelStations: {
        backgroundColor: colors.sectionMuted,
        borderRadius:    radii.md,
        borderWidth:     1,
        borderColor:     colors.border,
        padding:         spacing.lg,
        marginBottom:    spacing.lg,
    },
    /** Password — subtle blue tint. */
    sectionPanelPassword: {
        backgroundColor: colors.sectionAlt,
        borderRadius:    radii.md,
        borderWidth:     1,
        borderColor:     colors.border,
        padding:         spacing.lg,
        marginBottom:    spacing.lg,
    },
    membershipCard: {
        borderWidth:       1,
        borderColor:       colors.border,
        borderRadius:      radii.sm,
        padding:           spacing.base,
        marginBottom:      spacing.sm,
        backgroundColor:   colors.surface,
    },
    membershipTitle: {
        ...typography.bodyLargeSemibold,
    },
    membershipMeta: {
        ...typography.bodyMedium,
        marginTop: spacing.xs,
    },
    removeLink: {
        ...typography.link,
        marginTop: spacing.sm,
    },
    stationActions: {
        marginTop: spacing.sm,
    },
    stationSecondaryAction: {
        marginTop: spacing.sm,
    },
    secondaryButton: {
        borderWidth:     1,
        borderColor:     colors.brand,
        borderRadius:    radii.sm,
        paddingVertical: 14,
        alignItems:      'center',
    },
    secondaryButtonText: {
        ...typography.buttonLabel,
        color: colors.brand,
    },
    modalBackdrop: {
        flex:            1,
        backgroundColor: colors.overlay,
        justifyContent:  'center',
        padding:         spacing.lg,
    },
    modalCard: {
        backgroundColor: colors.surface,
        borderRadius:    radii.md,
        borderWidth:     1,
        borderColor:     colors.border,
        padding:         spacing.lg,
        maxHeight:       '90%',
    },
    modalTitle: {
        ...typography.sectionHeading,
        marginBottom: spacing.lg,
    },
    modalActions: {
        marginTop:    spacing.lg,
        flexDirection: 'column',
    },
    modalCancelRow: {
        flexDirection:  'row',
        justifyContent: 'flex-end',
        marginBottom:   spacing.sm,
    },
    modalCancelText: {
        ...typography.bodyLarge,
        color: colors.textSecondary,
        paddingVertical: spacing.sm,
    },
});
