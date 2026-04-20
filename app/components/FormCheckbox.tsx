import type { ReactElement } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export type FormCheckboxProps = {
    label:               string;
    value:               boolean;
    onValueChange:       (next: boolean) => void;
    disabled?:           boolean;
    accessibilityLabel?: string;
};

const BOX = 24;

/**
 * Theme-styled checkbox using Pressable + bordered box (no native checkbox).
 */
export function FormCheckbox({
    label,
    value,
    onValueChange,
    disabled = false,
    accessibilityLabel,
}: FormCheckboxProps): ReactElement {
    const a11yLabel = accessibilityLabel ?? label;

    return (
        <Pressable
            style={styles.row}
            onPress={() => {
                if (!disabled) {
                    onValueChange(!value);
                }
            }}
            disabled={disabled}
            accessibilityRole="checkbox"
            accessibilityLabel={a11yLabel}
            accessibilityState={{ checked: value, disabled }}
        >
            <View
                style={[styles.box, value && styles.boxChecked]}
                accessibilityElementsHidden
            >
                {value ? (
                    <Text style={styles.mark} accessibilityElementsHidden>
                        ✓
                    </Text>
                ) : null}
            </View>
            <Text style={styles.label}>{label}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems:    'center',
        marginBottom:  spacing.base,
    },
    box: {
        width:           BOX,
        height:          BOX,
        borderRadius:    radii.sm,
        borderWidth:     2,
        borderColor:     colors.borderInput,
        backgroundColor: colors.surface,
        alignItems:      'center',
        justifyContent:  'center',
    },
    boxChecked: {
        borderColor: colors.brand,
    },
    mark: {
        fontSize:   14,
        fontWeight: '700',
        color:      colors.brand,
    },
    label: {
        ...typography.bodyLarge,
        flex:       1,
        marginLeft: spacing.md,
    },
});
