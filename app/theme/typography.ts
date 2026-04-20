import type { TextStyle } from 'react-native';
import { colors } from './colors';

/**
 * Text presets without layout margins — compose in StyleSheets as needed.
 */
export const typography = {
    screenTitle: {
        fontSize:   26,
        fontWeight: '700' as TextStyle['fontWeight'],
        color:      colors.textPrimary,
    },
    appBarTitle: {
        fontSize:   18,
        fontWeight: '700' as TextStyle['fontWeight'],
        color:      colors.textPrimary,
    },
    sectionHeading: {
        fontSize:   20,
        fontWeight: '600' as TextStyle['fontWeight'],
        color:      colors.textPrimary,
    },
    bodyLarge: {
        fontSize:   16,
        fontWeight: '400' as TextStyle['fontWeight'],
        color:      colors.textPrimary,
    },
    bodyLargeSemibold: {
        fontSize:   16,
        fontWeight: '600' as TextStyle['fontWeight'],
        color:      colors.textPrimary,
    },
    bodyMedium: {
        fontSize:   14,
        fontWeight: '400' as TextStyle['fontWeight'],
        color:      colors.textSecondary,
    },
    bodySmall: {
        fontSize:   13,
        fontWeight: '400' as TextStyle['fontWeight'],
        color:      colors.textMuted,
    },
    caption: {
        fontSize:   12,
        fontWeight: '400' as TextStyle['fontWeight'],
        color:      colors.textMuted,
    },
    error: {
        fontSize:   14,
        fontWeight: '400' as TextStyle['fontWeight'],
        color:      colors.error,
    },
    statValue: {
        fontSize:   28,
        fontWeight: '700' as TextStyle['fontWeight'],
        color:      colors.textPrimary,
    },
    labelUppercase: {
        fontSize:      12,
        fontWeight:    '600' as TextStyle['fontWeight'],
        color:         colors.textMuted,
        textTransform: 'uppercase' as TextStyle['textTransform'],
    },
    link: {
        fontSize:   16,
        fontWeight: '400' as TextStyle['fontWeight'],
        color:      colors.brand,
    },
    buttonLabel: {
        fontSize:   16,
        fontWeight: '600' as TextStyle['fontWeight'],
        color:      colors.textOnPrimary,
    },
    menuAction: {
        fontSize:   16,
        fontWeight: '600' as TextStyle['fontWeight'],
        color:      colors.brand,
    },
} as const;
