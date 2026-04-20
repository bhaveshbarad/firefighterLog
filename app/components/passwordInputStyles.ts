import { StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export const passwordInputStyles = StyleSheet.create({
    fieldRow: {
        flexDirection:   'row',
        alignItems:      'center',
        marginBottom:    spacing.base,
        borderWidth:     1,
        borderColor:     colors.borderInput,
        borderRadius:    radii.sm,
        backgroundColor: colors.surface,
        minHeight:       44,
    },
    fieldInput: {
        flex:              1,
        paddingHorizontal: spacing.base,
        paddingVertical:   10,
        ...typography.bodyLarge,
        color:             colors.textPrimary,
    },
    eyeButton: {
        paddingHorizontal: spacing.md,
        paddingVertical:   spacing.sm,
        justifyContent:    'center',
    },
});
