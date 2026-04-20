import { useCallback, useEffect, useState } from 'react';
import type { ReactElement } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
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
import { FormErrorMessage } from '../components/FormErrorMessage';
import { FormSelectField } from '../components/FormSelectField';
import { formStyles } from '../components/formStyles';
import { PasswordInputWithVisibility } from '../components/PasswordInputWithVisibility';
import { PrimaryButton } from '../components/PrimaryButton';
import {
    ApiError,
    api,
    type PatchProfileBody,
    type PatchProfileResponse,
    type ProfileFireStation,
    type ProfileResponse,
} from '../lib/api-client';
import { colors } from '../theme/colors';
import { accountScreenStyles as styles } from './accountScreenStyles';

export type AccountScreenProps = {
    onBack:           () => void;
    onProfileSaved:   (result: PatchProfileResponse) => void;
};

type AccountSubview = 'main' | 'createStation';

function stationOptionLabel(s: ProfileFireStation): string {
    return `${s.name} (#${s.stationNumber}) — ${s.town}, ${s.state}`;
}

function formatJoined(iso: string): string {
    try {
        return new Date(iso).toLocaleDateString(undefined, {
            dateStyle: 'medium',
        });
    } catch {
        return iso;
    }
}

/**
 * Account profile: name, email, rank, year, stations, password; save at bottom.
 */
export function AccountScreen({
    onBack,
    onProfileSaved,
}: AccountScreenProps): ReactElement {
    const [profile, setProfile]               = useState<ProfileResponse | null>(
        null,
    );
    const [ranks, setRanks]                   = useState<
        { id: string; label: string }[]
    >([]);
    const [fireStations, setFireStations]     = useState<ProfileFireStation[]>(
        [],
    );
    const [loading, setLoading]               = useState(true);
    const [saving, setSaving]                 = useState(false);
    const [error, setError]                   = useState<string | null>(null);
    const [createStationError, setCreateStationError] = useState<string | null>(
        null,
    );

    const [name, setName]                     = useState('');
    const [email, setEmail]                   = useState('');
    const [initialEmail, setInitialEmail]     = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword]       = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [rankId, setRankId]                 = useState('');
    const [yearStr, setYearStr]               = useState('');

    const [accountSubview, setAccountSubview] = useState<AccountSubview>('main');
    const [addStationModalOpen, setAddStationModalOpen] = useState(false);
    const [addStationId, setAddStationId]     = useState('');
    const [addJoinedAt, setAddJoinedAt]       = useState(() => new Date());
    const [showJoinedModal, setShowJoinedModal] = useState(false);
    const [stationBusy, setStationBusy]       = useState(false);

    const [newStaName, setNewStaName]         = useState('');
    const [newStaTown, setNewStaTown]         = useState('');
    const [newStaState, setNewStaState]       = useState('');
    const [newStaNumber, setNewStaNumber]     = useState('');

    const emailTrim = email.trim().toLowerCase();
    const emailChanged = emailTrim !== initialEmail;

    const loadAll = useCallback(async (): Promise<void> => {
        setLoading(true);
        setError(null);
        try {
            const [p, r, fs] = await Promise.all([
                api.getProfile(),
                api.getRanks(),
                api.getFireStations(),
            ]);
            setProfile(p);
            setRanks(r);
            setFireStations(fs);
            setName(p.name ?? '');
            setEmail(p.email);
            setInitialEmail(p.email);
            setRankId(p.rank?.id ?? '');
            setYearStr(
                p.yearStartedFirefighting != null
                    ? String(p.yearStartedFirefighting)
                    : '',
            );
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (e) {
            const msg =
                e instanceof ApiError ? e.message : 'Failed to load profile';
            setError(msg);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadAll();
    }, [loadAll]);

    async function handleSaveProfile(): Promise<void> {
        if (!profile) {
            return;
        }
        const wantsCred =
            emailChanged || (newPassword.trim().length > 0);
        if (wantsCred && !currentPassword) {
            setError(
                'Enter your current password to change email or password.',
            );
            return;
        }
        if (newPassword.trim().length > 0) {
            if (newPassword.length < 8) {
                setError('New password must be at least 8 characters.');
                return;
            }
            if (newPassword !== confirmPassword) {
                setError('New password and confirmation do not match.');
                return;
            }
        }

        setSaving(true);
        setError(null);
        try {
            const yearTrim = yearStr.trim();
            let yearNum: number | null | undefined;
            if (yearTrim === '') {
                yearNum = null;
            } else {
                const y = Number.parseInt(yearTrim, 10);
                if (!Number.isFinite(y) || y < 1900 || y > 2100) {
                    setError('Year started must be a valid year (1900–2100).');
                    setSaving(false);
                    return;
                }
                yearNum = y;
            }

            const body: PatchProfileBody = {
                name:                     name.trim() || null,
                email:                    emailTrim,
                rankId:                   rankId === '' ? null : rankId,
                yearStartedFirefighting:  yearNum,
            };
            if (wantsCred) {
                body.currentPassword = currentPassword;
            }
            if (newPassword.trim().length > 0) {
                body.newPassword = newPassword;
            }

            const result = await api.patchProfile(body);
            setProfile(result.profile);
            setInitialEmail(result.profile.email);
            setEmail(result.profile.email);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            onProfileSaved(result);
        } catch (e) {
            const msg =
                e instanceof ApiError ? e.message : 'Could not save profile';
            setError(msg);
        } finally {
            setSaving(false);
        }
    }

    function openAddStationModal(): void {
        setAddJoinedAt(new Date());
        setAddStationId(fireStations[0]?.id ?? '');
        setAddStationModalOpen(true);
    }

    async function handleCreateStation(): Promise<void> {
        const n = newStaName.trim();
        const t = newStaTown.trim();
        const s = newStaState.trim();
        const num = newStaNumber.trim();
        if (!n || !t || !s || !num) {
            setCreateStationError('Fill in all fire station fields.');
            return;
        }
        setStationBusy(true);
        setCreateStationError(null);
        try {
            const created = await api.createFireStation({
                name:           n,
                town:           t,
                state:          s,
                stationNumber:  num,
            });
            setFireStations((prev) => [...prev, created].sort((a, b) =>
                a.name.localeCompare(b.name),
            ));
            setAddStationId(created.id);
            setNewStaName('');
            setNewStaTown('');
            setNewStaState('');
            setNewStaNumber('');
            setAccountSubview('main');
        } catch (e) {
            const msg =
                e instanceof ApiError ? e.message : 'Could not create station';
            setCreateStationError(msg);
        } finally {
            setStationBusy(false);
        }
    }

    async function handleAddMembership(): Promise<void> {
        if (!addStationId) {
            setError('Select a fire station.');
            return;
        }
        setStationBusy(true);
        setError(null);
        try {
            const next = await api.addStationMembership({
                fireStationId: addStationId,
                joinedAt:       addJoinedAt.toISOString(),
            });
            setProfile(next);
            setAddStationModalOpen(false);
        } catch (e) {
            const msg =
                e instanceof ApiError ? e.message : 'Could not add station';
            setError(msg);
        } finally {
            setStationBusy(false);
        }
    }

    function confirmRemoveMembership(id: string): void {
        Alert.alert(
            'Remove station',
            'Remove this fire station from your profile?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text:    'Remove',
                    style:   'destructive',
                    onPress: () => void removeMembership(id),
                },
            ],
        );
    }

    async function removeMembership(id: string): Promise<void> {
        setStationBusy(true);
        setError(null);
        try {
            const next = await api.removeStationMembership(id);
            setProfile(next);
        } catch (e) {
            const msg =
                e instanceof ApiError ? e.message : 'Could not remove';
            setError(msg);
        } finally {
            setStationBusy(false);
        }
    }

    const rankOptions = [
        { id: '', label: 'None' },
        ...ranks.map((r) => ({ id: r.id, label: r.label })),
    ];

    const stationOptions = fireStations.map((fs) => ({
        id:    fs.id,
        label: stationOptionLabel(fs),
    }));

    const formDisabled = saving || stationBusy;

    if (accountSubview === 'createStation') {
        return (
            <KeyboardAvoidingView
                style={styles.root}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <AppHeader
                    title="New fire station"
                    headerLeft={
                        <Pressable
                            style={headerStyles.menuButton}
                            onPress={() => {
                                setCreateStationError(null);
                                setAccountSubview('main');
                            }}
                            accessibilityRole="button"
                            accessibilityLabel="Back to account"
                        >
                            <Ionicons
                                name="chevron-back"
                                size={22}
                                color={colors.textOnPrimary}
                            />
                            <Text style={headerStyles.menuButtonText}>
                                Back
                            </Text>
                        </Pressable>
                    }
                />
                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.scrollContent}
                    style={[styles.scrollInner, { flex: 1 }]}
                >
                    <View style={styles.sectionPanel}>
                        <Text style={styles.sectionTitle}>
                            Station details
                        </Text>
                        <Text style={formStyles.label}>Name</Text>
                        <TextInput
                            style={formStyles.input}
                            value={newStaName}
                            onChangeText={setNewStaName}
                            editable={!stationBusy}
                            accessibilityLabel="Station name"
                        />
                        <Text style={formStyles.label}>Town</Text>
                        <TextInput
                            style={formStyles.input}
                            value={newStaTown}
                            onChangeText={setNewStaTown}
                            editable={!stationBusy}
                            accessibilityLabel="Town"
                        />
                        <Text style={formStyles.label}>State</Text>
                        <TextInput
                            style={formStyles.input}
                            value={newStaState}
                            onChangeText={setNewStaState}
                            autoCapitalize="characters"
                            editable={!stationBusy}
                            accessibilityLabel="State"
                        />
                        <Text style={formStyles.label}>Station number</Text>
                        <TextInput
                            style={formStyles.input}
                            value={newStaNumber}
                            onChangeText={setNewStaNumber}
                            editable={!stationBusy}
                            accessibilityLabel="Station number"
                        />
                        <FormErrorMessage
                            message={createStationError}
                            variant="form"
                        />
                        <PrimaryButton
                            label="Create fire station"
                            busy={stationBusy}
                            onPress={() => void handleCreateStation()}
                            accessibilityLabel="Create fire station"
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.root}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <AppHeader
                title="Account"
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
                style={[styles.scrollInner, { flex: 1 }]}
            >
                {loading ? (
                    <ActivityIndicator
                        size="large"
                        color={colors.brand}
                    />
                ) : !profile ? (
                    <View style={styles.sectionPanel}>
                        <FormErrorMessage
                            message={error ?? 'Could not load profile.'}
                            variant="form"
                        />
                        <PrimaryButton
                            label="Retry"
                            busy={false}
                            onPress={() => void loadAll()}
                            accessibilityLabel="Retry loading profile"
                        />
                    </View>
                ) : (
                    <>
                        <View style={styles.sectionPanel}>
                            <Text style={styles.sectionTitle}>Profile</Text>
                            <Text style={formStyles.label}>Name</Text>
                            <TextInput
                                style={formStyles.input}
                                value={name}
                                onChangeText={setName}
                                editable={!formDisabled}
                                accessibilityLabel="Your name"
                            />
                            <Text style={formStyles.label}>Email</Text>
                            <TextInput
                                style={formStyles.input}
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                editable={!formDisabled}
                                accessibilityLabel="Email"
                            />
                            <Text style={formStyles.label}>Rank</Text>
                            <FormSelectField
                                accessibilityLabel="Rank"
                                options={rankOptions}
                                value={rankId}
                                onValueChange={setRankId}
                                disabled={formDisabled}
                            />
                            <Text style={formStyles.label}>
                                Year started as firefighter
                            </Text>
                            <TextInput
                                style={formStyles.input}
                                value={yearStr}
                                onChangeText={setYearStr}
                                keyboardType="number-pad"
                                placeholder="e.g. 2015"
                                editable={!formDisabled}
                                accessibilityLabel="Year started as firefighter"
                            />
                        </View>

                        <View style={styles.sectionPanelStations}>
                            <Text style={styles.sectionTitle}>
                                Fire stations
                            </Text>
                            <Text style={styles.sectionHint}>
                                Stations you belong to. Add from the directory
                                or create a new one.
                            </Text>
                            {profile.stationMemberships.map((m) => (
                                <View
                                    key={m.id}
                                    style={styles.membershipCard}
                                >
                                    <Text style={styles.membershipTitle}>
                                        {m.fireStation.name} — #
                                        {m.fireStation.stationNumber}
                                    </Text>
                                    <Text style={styles.membershipMeta}>
                                        {m.fireStation.town},{' '}
                                        {m.fireStation.state}
                                    </Text>
                                    <Text style={styles.membershipMeta}>
                                        Joined {formatJoined(m.joinedAt)}
                                    </Text>
                                    <Pressable
                                        onPress={() =>
                                            confirmRemoveMembership(m.id)
                                        }
                                        disabled={stationBusy}
                                        accessibilityRole="button"
                                        accessibilityLabel="Remove station"
                                    >
                                        <Text style={styles.removeLink}>
                                            Remove
                                        </Text>
                                    </Pressable>
                                </View>
                            ))}
                            <View style={styles.stationActions}>
                                <PrimaryButton
                                    label="Add station"
                                    busy={stationBusy}
                                    onPress={openAddStationModal}
                                    disabled={
                                        stationBusy ||
                                        fireStations.length === 0
                                    }
                                    accessibilityLabel="Add fire station"
                                />
                                <Pressable
                                    style={[
                                        styles.secondaryButton,
                                        styles.stationSecondaryAction,
                                    ]}
                                    onPress={() => {
                                        setCreateStationError(null);
                                        setAccountSubview('createStation');
                                    }}
                                    disabled={stationBusy}
                                    accessibilityRole="button"
                                    accessibilityLabel="Create new fire station"
                                >
                                    <Text style={styles.secondaryButtonText}>
                                        Create new fire station
                                    </Text>
                                </Pressable>
                            </View>
                        </View>

                        <View style={styles.sectionPanelPassword}>
                            <Text style={styles.sectionTitle}>
                                Password and security
                            </Text>
                            <Text style={styles.sectionHint}>
                                Leave password fields blank unless you are
                                changing your password. Current password is
                                required when you change email or set a new
                                password.
                            </Text>
                            <Text style={formStyles.label}>
                                Current password
                            </Text>
                            <PasswordInputWithVisibility
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                                editable={!formDisabled}
                                autoCorrect={false}
                                autoComplete="password"
                                textContentType="password"
                                accessibilityLabel="Current password"
                            />
                            <Text style={formStyles.label}>New password</Text>
                            <PasswordInputWithVisibility
                                value={newPassword}
                                onChangeText={setNewPassword}
                                editable={!formDisabled}
                                autoCorrect={false}
                                autoComplete="password-new"
                                textContentType="newPassword"
                                accessibilityLabel="New password"
                            />
                            <Text style={formStyles.label}>
                                Confirm new password
                            </Text>
                            <PasswordInputWithVisibility
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                editable={!formDisabled}
                                autoCorrect={false}
                                autoComplete="password-new"
                                textContentType="newPassword"
                                accessibilityLabel="Confirm new password"
                            />
                        </View>

                        <FormErrorMessage message={error} variant="form" />
                        <PrimaryButton
                            label="Save changes"
                            busy={saving}
                            onPress={() => void handleSaveProfile()}
                            accessibilityLabel="Save account changes"
                        />
                    </>
                )}
            </ScrollView>

            <Modal
                visible={addStationModalOpen}
                transparent
                animationType="fade"
                onRequestClose={() => setAddStationModalOpen(false)}
            >
                <View style={styles.modalBackdrop}>
                    <ScrollView
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
                    >
                        <View style={styles.modalCard}>
                            <Text style={styles.modalTitle}>
                                Add fire station
                            </Text>
                            <Text style={formStyles.label}>Station</Text>
                            <FormSelectField
                                accessibilityLabel="Fire station to add"
                                options={stationOptions}
                                value={addStationId}
                                onValueChange={setAddStationId}
                                disabled={
                                    stationBusy || stationOptions.length === 0
                                }
                                placeholder={
                                    stationOptions.length === 0
                                        ? 'Create a station first'
                                        : 'Select…'
                                }
                            />
                            <Text style={formStyles.label}>Joined (date)</Text>
                            <Pressable
                                style={[
                                    formStyles.input,
                                    { justifyContent: 'center' },
                                ]}
                                onPress={() => {
                                    if (!stationBusy) {
                                        setShowJoinedModal(true);
                                    }
                                }}
                                disabled={stationBusy}
                                accessibilityRole="button"
                                accessibilityLabel="Joined date"
                            >
                                <Text>
                                    {addJoinedAt.toLocaleDateString(undefined, {
                                        dateStyle: 'medium',
                                    })}
                                </Text>
                            </Pressable>
                            <DateTimePickerModal
                                visible={showJoinedModal}
                                value={addJoinedAt}
                                onConfirm={(d) => {
                                    setAddJoinedAt(d);
                                    setShowJoinedModal(false);
                                }}
                                onCancel={() => setShowJoinedModal(false)}
                            />
                            <View style={styles.modalActions}>
                                <View style={styles.modalCancelRow}>
                                    <Pressable
                                        onPress={() =>
                                            setAddStationModalOpen(false)
                                        }
                                        accessibilityRole="button"
                                        accessibilityLabel="Cancel"
                                    >
                                        <Text style={styles.modalCancelText}>
                                            Cancel
                                        </Text>
                                    </Pressable>
                                </View>
                                <PrimaryButton
                                    label="Add"
                                    busy={stationBusy}
                                    onPress={() => void handleAddMembership()}
                                    accessibilityLabel="Add station"
                                />
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}
