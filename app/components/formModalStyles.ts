import { StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

/**
 * Shared overlay + sheet styles for form Modals (date/time, selects).
 */
export const formModalStyles = StyleSheet.create({
    overlay: {
        flex:            1,
        backgroundColor: colors.overlay,
        justifyContent:  'center',
        padding:         spacing.lg,
    },
    sheet: {
        alignSelf:          'center',
        width:              '100%',
        maxWidth:           440,
        flexDirection:      'column',
        overflow:           'hidden',
        backgroundColor:    colors.surface,
        borderRadius:       radii.md,
        padding:            spacing.lg,
        maxHeight:          '85%',
        borderWidth:        1,
        borderColor:        colors.border,
    },
    sheetTitle: {
        ...typography.sectionHeading,
        marginBottom: spacing.md,
    },
    buttonRow: {
        flexDirection:   'row',
        justifyContent:  'flex-end',
        gap:             spacing.md,
        marginTop:       spacing.lg,
        flexShrink:      0,
    },
    buttonSecondary: {
        paddingVertical:   spacing.md,
        paddingHorizontal: spacing.lg,
    },
    buttonSecondaryText: {
        ...typography.bodyLarge,
        color: colors.textSecondary,
    },
    buttonPrimary: {
        backgroundColor:    colors.brand,
        borderRadius:       radii.sm,
        paddingVertical:    spacing.md,
        paddingHorizontal:  spacing.xl,
    },
    buttonPrimaryText: {
        ...typography.buttonLabel,
    },
    webDatetimeInputWrap: {
        marginBottom: spacing.base,
    },
});
