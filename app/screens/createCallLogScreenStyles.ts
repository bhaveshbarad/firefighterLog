import { StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export const createCallLogScreenStyles = StyleSheet.create({
    root: {
        flex:            1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        paddingBottom: spacing.xxl,
    },
    multiline: {
        minHeight:          120,
        textAlignVertical:  'top',
    },
    datetimeTrigger: {
        flexDirection:  'row',
        alignItems:     'center',
        justifyContent: 'space-between',
    },
    datetimeSummary: {
        ...typography.bodyLarge,
        flex:    1,
        flexShrink: 1,
    },
    datetimeAction: {
        ...typography.link,
        marginLeft: spacing.md,
    },
    actionsRow: {
        flexDirection:  'row',
        alignItems:     'stretch',
        gap:            spacing.md,
        marginTop:      spacing.sm,
    },
    actionHalf: {
        flex:     1,
        minWidth: 0,
    },
    cancelButton: {
        flex:              1,
        borderWidth:       1,
        borderColor:       colors.borderInput,
        borderRadius:      radii.sm,
        paddingVertical:   14,
        alignItems:        'center',
        justifyContent:    'center',
        backgroundColor:   colors.surface,
    },
    cancelButtonDisabled: {
        opacity: 0.7,
    },
    cancelButtonText: {
        ...typography.buttonLabel,
        color: colors.textPrimary,
    },
});
