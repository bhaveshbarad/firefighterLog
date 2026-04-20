import { StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export const appHeaderStyles = StyleSheet.create({
    header: {
        flexDirection:     'row',
        alignItems:        'center',
        justifyContent:    'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical:   spacing.base,
        paddingTop:        spacing.lg,
        backgroundColor:   colors.brand,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.28)',
    },
    headerLeftSlot: {
        flexShrink:    0,
        flexDirection: 'row',
        alignItems:    'center',
    },
    /**
     * Fills space between left and right controls. Title alignment depends on
     * whether a back/left action is present (see headerTitleLeading vs
     * headerTitleAfterBack).
     */
    headerTitleWrap: {
        flex:           1,
        minWidth:       0,
        justifyContent: 'center',
    },
    headerActions: {
        flexShrink:      0,
        flexDirection:   'row',
        alignItems:      'center',
    },
    headerTitle: {
        ...typography.appBarTitle,
        color: colors.textOnPrimary,
        width: '100%',
    },
    /** Home and other screens with no back control: title on the left. */
    headerTitleLeading: {
        textAlign: 'left',
    },
    /** Screens with a back button: title right-aligned in the middle band. */
    headerTitleAfterBack: {
        textAlign: 'right',
    },
    menuButton: {
        flexDirection:     'row',
        alignItems:        'center',
        gap:               spacing.xs,
        paddingHorizontal: spacing.base,
        paddingVertical:   spacing.md,
    },
    menuButtonText: {
        ...typography.menuAction,
        color: colors.textOnPrimary,
    },
});
