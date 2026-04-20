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
    headerMain: {
        flex:          1,
        flexDirection: 'row',
        alignItems:    'center',
        minWidth:      0,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems:    'center',
    },
    headerTitle: {
        ...typography.appBarTitle,
        color: colors.textOnPrimary,
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
