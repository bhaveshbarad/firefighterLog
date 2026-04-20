import { useCallback, useEffect, useState } from 'react';
import type { ReactElement } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    View,
} from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { appHeaderStyles as headerStyles } from '../components/appHeaderStyles';
import { FormErrorMessage } from '../components/FormErrorMessage';
import { ScreenCard } from '../components/ScreenCard';
import { ApiError, api, type CallLogListItem } from '../lib/api-client';
import {
    getApparatusTypeIconName,
    getCallTypeIconName,
} from '../lib/call-log-icons';
import { colors } from '../theme/colors';
import { callLogDetailScreenStyles as styles } from './callLogDetailScreenStyles';

export type CallLogDetailScreenProps = {
    callLogId: string;
    onBack:    () => void;
};

function formatReportedAt(iso: string): string {
    return new Date(iso).toLocaleString(undefined, {
        dateStyle: 'full',
        timeStyle: 'short',
    });
}

/**
 * Read-only detail view for a single call log.
 */
export function CallLogDetailScreen({
    callLogId,
    onBack,
}: CallLogDetailScreenProps): ReactElement {
    const [item, setItem]         = useState<CallLogListItem | null>(null);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState<string | null>(null);

    const load = useCallback(async (): Promise<void> => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.getCallLog(callLogId);
            setItem(data);
        } catch (e) {
            const msg =
                e instanceof ApiError ? e.message : 'Network error';
            setError(msg);
            setItem(null);
        } finally {
            setLoading(false);
        }
    }, [callLogId]);

    useEffect(() => {
        void load();
    }, [load]);

    return (
        <KeyboardAvoidingView
            style={styles.root}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <AppHeader
                title="Call details"
                headerLeft={
                    <Pressable
                        style={headerStyles.menuButton}
                        onPress={onBack}
                        accessibilityRole="button"
                        accessibilityLabel="Go back"
                    >
                        <Ionicons
                            name="chevron-back"
                            size={22}
                            color={colors.textOnPrimary}
                        />
                        <Text style={headerStyles.menuButtonText}>Back</Text>
                    </Pressable>
                }
            />
            {loading ? (
                <ActivityIndicator
                    size="large"
                    color={colors.brand}
                    style={{ marginTop: 24 }}
                />
            ) : error ? (
                <View style={styles.scroll}>
                    <FormErrorMessage message={error} variant="form" />
                </View>
            ) : item ? (
                <ScrollView
                    style={styles.scroll}
                    keyboardShouldPersistTaps="handled"
                >
                    <ScreenCard>
                        <Text style={styles.labelFirst}>Title</Text>
                        <Text style={styles.value}>{item.title}</Text>

                        <Text style={styles.label}>Date and time</Text>
                        <Text style={styles.value}>
                            {formatReportedAt(item.reportedAt)}
                        </Text>

                        <Text style={styles.label}>Incident type</Text>
                        <View style={styles.valueRow}>
                            <Ionicons
                                name={getCallTypeIconName(
                                    item.callType.label,
                                )}
                                size={20}
                                color={colors.textSecondary}
                            />
                            <Text style={styles.value}>
                                {item.callType.label}
                            </Text>
                        </View>

                        <Text style={styles.label}>Apparatus</Text>
                        <View style={styles.valueRow}>
                            <Ionicons
                                name={getApparatusTypeIconName(
                                    item.apparatusType.label,
                                )}
                                size={20}
                                color={colors.textSecondary}
                            />
                            <Text style={styles.value}>
                                {item.apparatusType.label}
                            </Text>
                        </View>

                        <Text style={styles.label}>False alarm</Text>
                        <Text style={styles.value}>
                            {item.isFalseAlarm ? 'Yes' : 'No'}
                        </Text>

                        <Text style={styles.label}>Notes</Text>
                        <Text style={styles.notes}>
                            {item.notes?.trim()
                                ? item.notes
                                : '—'}
                        </Text>
                    </ScreenCard>
                </ScrollView>
            ) : null}
        </KeyboardAvoidingView>
    );
}
