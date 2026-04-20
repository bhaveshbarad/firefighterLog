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
    TextInput,
    View,
} from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { appHeaderStyles as headerStyles } from '../components/appHeaderStyles';
import { DateTimePickerModal } from '../components/DateTimePickerModal';
import { FormCheckbox } from '../components/FormCheckbox';
import { FormErrorMessage } from '../components/FormErrorMessage';
import { FormSelectField } from '../components/FormSelectField';
import { formStyles } from '../components/formStyles';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenCard } from '../components/ScreenCard';
import { ApiError, api } from '../lib/api-client';
import { colors } from '../theme/colors';
import { createCallLogScreenStyles as styles } from './createCallLogScreenStyles';

export type CreateCallLogScreenProps = {
    onBack:     () => void;
    onCreated:  () => void;
};

function formatReportedAt(d: Date): string {
    return d.toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
}

/**
 * Form to create a call log (POST /call-logs).
 */
export function CreateCallLogScreen({
    onBack,
    onCreated,
}: CreateCallLogScreenProps): ReactElement {
    const [title, setTitle]                 = useState('');
    const [reportedAt, setReportedAt]       = useState(() => new Date());
    const [callTypeId, setCallTypeId]       = useState('');
    const [apparatusTypeId, setApparatusTypeId] = useState('');
    const [isFalseAlarm, setIsFalseAlarm]   = useState(false);
    const [notes, setNotes]                 = useState('');

    const [showDateTimeModal, setShowDateTimeModal] = useState(false);

    const [callTypes, setCallTypes]         = useState<
        { id: string; label: string }[]
    >([]);
    const [apparatusTypes, setApparatusTypes] = useState<
        { id: string; label: string }[]
    >([]);
    const [lookupsLoading, setLookupsLoading] = useState(true);
    const [submitting, setSubmitting]       = useState(false);
    const [error, setError]                 = useState<string | null>(null);

    const loadLookups = useCallback(async (): Promise<void> => {
        setLookupsLoading(true);
        setError(null);
        try {
            const [ct, at] = await Promise.all([
                api.getCallTypes(),
                api.getApparatusTypes(),
            ]);
            setCallTypes(ct);
            setApparatusTypes(at);
            if (ct.length > 0) {
                setCallTypeId(ct[0].id);
            }
            if (at.length > 0) {
                setApparatusTypeId(at[0].id);
            }
        } catch (e) {
            const msg =
                e instanceof ApiError ? e.message : 'Failed to load options';
            setError(msg);
        } finally {
            setLookupsLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadLookups();
    }, [loadLookups]);

    async function handleSubmit(): Promise<void> {
        const t = title.trim();
        if (!t) {
            setError('Please enter a title');
            return;
        }
        if (!callTypeId || !apparatusTypeId) {
            setError('Please select call type and apparatus');
            return;
        }
        setSubmitting(true);
        setError(null);
        try {
            await api.createCallLog({
                title:           t,
                reportedAt:      reportedAt.toISOString(),
                callTypeId,
                apparatusTypeId,
                isFalseAlarm,
                notes:           notes.trim() || undefined,
            });
            onCreated();
        } catch (e) {
            const msg =
                e instanceof ApiError ? e.message : 'Network error';
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    }

    const lookupsReady =
        !lookupsLoading &&
        callTypes.length > 0 &&
        apparatusTypes.length > 0;

    return (
        <KeyboardAvoidingView
            style={styles.root}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <AppHeader
                title="New call log"
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
            <ScrollView
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.scrollContent}
                style={{ flex: 1, padding: 24 }}
            >
                <ScreenCard>
                    {lookupsLoading ? (
                        <ActivityIndicator
                            size="large"
                            color={colors.brand}
                        />
                    ) : !lookupsReady ? (
                        <>
                            <FormErrorMessage
                                message={
                                    error ?? 'Could not load call types.'
                                }
                                variant="form"
                            />
                            <PrimaryButton
                                label="Retry"
                                busy={false}
                                onPress={() => void loadLookups()}
                                accessibilityLabel="Retry loading options"
                            />
                        </>
                    ) : (
                        <>
                            <Text style={formStyles.label}>Title</Text>
                            <TextInput
                                style={formStyles.input}
                                value={title}
                                onChangeText={setTitle}
                                editable={!submitting}
                                accessibilityLabel="Call title"
                            />

                            <Text style={formStyles.label}>Date and time</Text>
                            <Pressable
                                style={[
                                    formStyles.input,
                                    styles.datetimeTrigger,
                                ]}
                                onPress={() => {
                                    if (!submitting) {
                                        setShowDateTimeModal(true);
                                    }
                                }}
                                disabled={submitting}
                                accessibilityRole="button"
                                accessibilityLabel="Date and time"
                                accessibilityHint={formatReportedAt(reportedAt)}
                            >
                                <Text style={styles.datetimeSummary}>
                                    {formatReportedAt(reportedAt)}
                                </Text>
                                <Text style={styles.datetimeAction}>
                                    Change
                                </Text>
                            </Pressable>
                            <DateTimePickerModal
                                visible={showDateTimeModal}
                                value={reportedAt}
                                onConfirm={(next) => {
                                    setReportedAt(next);
                                    setShowDateTimeModal(false);
                                }}
                                onCancel={() => setShowDateTimeModal(false)}
                            />

                            <Text style={formStyles.label}>Incident type</Text>
                            <FormSelectField
                                accessibilityLabel="Incident type"
                                options={callTypes}
                                value={callTypeId}
                                onValueChange={setCallTypeId}
                                disabled={submitting}
                            />

                            <Text style={formStyles.label}>Apparatus</Text>
                            <FormSelectField
                                accessibilityLabel="Apparatus type"
                                options={apparatusTypes}
                                value={apparatusTypeId}
                                onValueChange={setApparatusTypeId}
                                disabled={submitting}
                            />

                            <FormCheckbox
                                label="False alarm"
                                value={isFalseAlarm}
                                onValueChange={setIsFalseAlarm}
                                disabled={submitting}
                            />

                            <Text style={formStyles.label}>Notes</Text>
                            <TextInput
                                style={[formStyles.input, styles.multiline]}
                                value={notes}
                                onChangeText={setNotes}
                                multiline
                                editable={!submitting}
                                accessibilityLabel="Notes"
                            />

                            <FormErrorMessage
                                message={error}
                                variant="form"
                            />
                            <View style={styles.actionsRow}>
                                <Pressable
                                    style={[
                                        styles.cancelButton,
                                        submitting && styles.cancelButtonDisabled,
                                    ]}
                                    onPress={onBack}
                                    disabled={submitting}
                                    accessibilityRole="button"
                                    accessibilityLabel="Cancel and go back"
                                >
                                    <Text style={styles.cancelButtonText}>
                                        Cancel
                                    </Text>
                                </Pressable>
                                <View style={styles.actionHalf}>
                                    <PrimaryButton
                                        label="Save call log"
                                        busy={submitting}
                                        onPress={() => void handleSubmit()}
                                        accessibilityLabel="Save call log"
                                    />
                                </View>
                            </View>
                        </>
                    )}
                </ScreenCard>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
