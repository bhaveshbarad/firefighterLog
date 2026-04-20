import { useState } from 'react';
import type { ReactElement } from 'react';
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from 'react-native';
import { formModalStyles } from './formModalStyles';
import { formStyles } from './formStyles';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export type FormSelectOption = {
    id:    string;
    label: string;
};

export type FormSelectFieldProps = {
    /** Accessibility label for the control (e.g. field name). */
    accessibilityLabel: string;
    options:              FormSelectOption[];
    value:                string;
    onValueChange:        (id: string) => void;
    disabled?:            boolean;
    placeholder?:         string;
};

/**
 * Pressable field that opens a Modal + scrollable list so options look the same on
 * web, iOS, and Android.
 */
export function FormSelectField({
    accessibilityLabel,
    options,
    value,
    onValueChange,
    disabled = false,
    placeholder = 'Select…',
}: FormSelectFieldProps): ReactElement {
    const [open, setOpen] = useState(false);
    const { height: windowHeight } = useWindowDimensions();
    const selected = options.find((o) => o.id === value);
    const display = selected?.label ?? placeholder;

    /**
     * Leave room for title, padding, and Close row inside the sheet (max ~85% of
     * window). ScrollView gets a hard maxHeight so the list scrolls instead of
     * growing past the screen (fixes web + native modal layout).
     */
    const listScrollMaxHeight = Math.max(
        140,
        Math.min(320, windowHeight * 0.42 - 140),
    );

    return (
        <>
            <Pressable
                style={[formStyles.input, styles.trigger]}
                onPress={() => {
                    if (!disabled) {
                        setOpen(true);
                    }
                }}
                disabled={disabled}
                accessibilityRole="button"
                accessibilityLabel={accessibilityLabel}
                accessibilityHint={display}
            >
                <Text
                    style={styles.triggerText}
                    numberOfLines={2}
                >
                    {display}
                </Text>
                <Text style={styles.chevron} accessibilityElementsHidden>
                    ▼
                </Text>
            </Pressable>
            <Modal
                visible={open}
                transparent
                animationType="fade"
                onRequestClose={() => setOpen(false)}
            >
                <Pressable
                    style={formModalStyles.overlay}
                    onPress={() => setOpen(false)}
                    accessibilityRole="button"
                    accessibilityLabel="Close list"
                >
                    <Pressable
                        style={formModalStyles.sheet}
                        onPress={(e) => e.stopPropagation()}
                        accessibilityViewIsModal
                    >
                        <Text style={formModalStyles.sheetTitle}>
                            {accessibilityLabel}
                        </Text>
                        <ScrollView
                            style={[
                                styles.scrollList,
                                { maxHeight: listScrollMaxHeight },
                            ]}
                            contentContainerStyle={styles.listContent}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator
                            bounces={false}
                        >
                            {options.map((item) => {
                                const isSelected = item.id === value;
                                return (
                                    <Pressable
                                        key={item.id}
                                        style={[
                                            styles.row,
                                            isSelected && styles.rowSelected,
                                        ]}
                                        onPress={() => {
                                            onValueChange(item.id);
                                            setOpen(false);
                                        }}
                                        accessibilityRole="button"
                                        accessibilityLabel={item.label}
                                        accessibilityState={{
                                            selected: isSelected,
                                        }}
                                    >
                                        <Text
                                            style={[
                                                styles.rowLabel,
                                                isSelected &&
                                                    styles.rowLabelSelected,
                                            ]}
                                            numberOfLines={3}
                                        >
                                            {item.label}
                                        </Text>
                                        {isSelected ? (
                                            <Text
                                                style={styles.check}
                                                accessibilityElementsHidden
                                            >
                                                ✓
                                            </Text>
                                        ) : null}
                                    </Pressable>
                                );
                            })}
                        </ScrollView>
                        <View style={formModalStyles.buttonRow}>
                            <Pressable
                                style={formModalStyles.buttonSecondary}
                                onPress={() => setOpen(false)}
                                accessibilityRole="button"
                                accessibilityLabel="Close"
                            >
                                <Text
                                    style={formModalStyles.buttonSecondaryText}
                                >
                                    Close
                                </Text>
                            </Pressable>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    trigger: {
        flexDirection:  'row',
        alignItems:     'center',
        justifyContent: 'space-between',
    },
    triggerText: {
        ...typography.bodyLarge,
        flex:       1,
        flexShrink: 1,
    },
    chevron: {
        ...typography.caption,
        color:      colors.textMuted,
        marginLeft: spacing.sm,
    },
    scrollList: {
        width: '100%',
    },
    listContent: {
        paddingBottom: spacing.sm,
        flexGrow:      0,
    },
    row: {
        flexDirection:     'row',
        alignItems:        'center',
        justifyContent:    'space-between',
        paddingVertical:   spacing.md,
        paddingHorizontal: spacing.base,
        borderRadius:      radii.sm,
        marginBottom:      spacing.xs,
    },
    rowSelected: {
        backgroundColor: colors.background,
    },
    rowLabel: {
        ...typography.bodyLarge,
        flex:       1,
        flexShrink: 1,
    },
    rowLabelSelected: {
        fontWeight: '600',
    },
    check: {
        ...typography.bodyLargeSemibold,
        color:      colors.brand,
        marginLeft: spacing.md,
    },
});
