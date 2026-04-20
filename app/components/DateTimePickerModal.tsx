import DateTimePicker from '@react-native-community/datetimepicker';
import { createElement, useEffect, useState } from 'react';
import type { ReactElement } from 'react';
import {
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    View,
} from 'react-native';
import { formModalStyles } from './formModalStyles';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

function mergeDatePart(base: Date, picked: Date): Date {
    const n = new Date(base);
    n.setFullYear(
        picked.getFullYear(),
        picked.getMonth(),
        picked.getDate(),
    );
    return n;
}

function mergeTimePart(base: Date, picked: Date): Date {
    const n = new Date(base);
    n.setHours(picked.getHours(), picked.getMinutes(), 0, 0);
    return n;
}

function toDatetimeLocalValue(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocalValue(s: string): Date | null {
    if (!s) {
        return null;
    }
    const parsed = new Date(s);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export type DateTimePickerModalProps = {
    visible:    boolean;
    value:      Date;
    onConfirm:  (next: Date) => void;
    onCancel:   () => void;
};

/**
 * Modal editor for date/time: web uses datetime-local; iOS spinner; Android
 * date + time spinners inside the same sheet.
 */
export function DateTimePickerModal({
    visible,
    value,
    onConfirm,
    onCancel,
}: DateTimePickerModalProps): ReactElement {
    const [draft, setDraft] = useState(() => new Date(value.getTime()));

    useEffect(() => {
        if (visible) {
            setDraft(new Date(value.getTime()));
        }
    }, [visible, value]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <Pressable
                style={formModalStyles.overlay}
                onPress={onCancel}
                accessibilityRole="button"
                accessibilityLabel="Dismiss date and time editor"
            >
                <Pressable
                    style={formModalStyles.sheet}
                    onPress={(e) => e.stopPropagation()}
                    accessibilityViewIsModal
                >
                    <Text style={formModalStyles.sheetTitle}>
                        Date and time
                    </Text>
                    <ScrollView
                        keyboardShouldPersistTaps="handled"
                        bounces={false}
                    >
                        {Platform.OS === 'web' ? (
                            <View style={formModalStyles.webDatetimeInputWrap}>
                                {createElement('input', {
                                    type:     'datetime-local',
                                    value:    toDatetimeLocalValue(draft),
                                    onChange: (e: {
                                        target: { value: string };
                                    }) => {
                                        const next = fromDatetimeLocalValue(
                                            e.target.value,
                                        );
                                        if (next) {
                                            setDraft(next);
                                        }
                                    },
                                    style: {
                                        width:        '100%',
                                        fontSize:     16,
                                        padding:      10,
                                        borderRadius: 8,
                                        border: `1px solid ${colors.borderInput}`,
                                        boxSizing:
                                            'border-box' as const,
                                        marginBottom: spacing.base,
                                    },
                                })}
                            </View>
                        ) : null}
                        {Platform.OS === 'ios' ? (
                            <DateTimePicker
                                value={draft}
                                mode="datetime"
                                display="spinner"
                                onChange={(_, d) => {
                                    if (d) {
                                        setDraft(d);
                                    }
                                }}
                            />
                        ) : null}
                        {Platform.OS === 'android' ? (
                            <View>
                                <DateTimePicker
                                    value={draft}
                                    mode="date"
                                    display="spinner"
                                    onChange={(_, d) => {
                                        if (d) {
                                            setDraft((prev) =>
                                                mergeDatePart(prev, d),
                                            );
                                        }
                                    }}
                                />
                                <DateTimePicker
                                    value={draft}
                                    mode="time"
                                    display="spinner"
                                    onChange={(_, d) => {
                                        if (d) {
                                            setDraft((prev) =>
                                                mergeTimePart(prev, d),
                                            );
                                        }
                                    }}
                                />
                            </View>
                        ) : null}
                    </ScrollView>
                    <View style={formModalStyles.buttonRow}>
                        <Pressable
                            style={formModalStyles.buttonSecondary}
                            onPress={onCancel}
                            accessibilityRole="button"
                            accessibilityLabel="Cancel"
                        >
                            <Text style={formModalStyles.buttonSecondaryText}>
                                Cancel
                            </Text>
                        </Pressable>
                        <Pressable
                            style={formModalStyles.buttonPrimary}
                            onPress={() => onConfirm(draft)}
                            accessibilityRole="button"
                            accessibilityLabel="Confirm date and time"
                        >
                            <Text style={formModalStyles.buttonPrimaryText}>
                                Done
                            </Text>
                        </Pressable>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}
