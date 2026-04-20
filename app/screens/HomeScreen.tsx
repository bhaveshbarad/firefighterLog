import { useCallback, useEffect, useState } from 'react';
import type { ReactElement } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
    ActivityIndicator,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { appHeaderStyles as headerStyles } from '../components/appHeaderStyles';
import { FormErrorMessage } from '../components/FormErrorMessage';
import { ScreenCard } from '../components/ScreenCard';
import { useIsWideLayout } from '../hooks/useIsWideLayout';
import { ApiError, api, type ProfileResponse } from '../lib/api-client';
import { colors } from '../theme/colors';
import { homeScreenStyles as styles } from './homeScreenStyles';

export type HomeUser = { id: string; email: string };

export type HomeScreenProps = {
    user:                 HomeUser;
    onLogout:             () => void | Promise<void>;
    onOpenCreateCallLog:  () => void;
    onOpenCallLogList:    () => void;
    onOpenAccount:        () => void;
    statsRefreshKey:      number;
};

export function HomeScreen({
    user,
    onLogout,
    onOpenCreateCallLog,
    onOpenCallLogList,
    onOpenAccount,
    statsRefreshKey,
}: HomeScreenProps): ReactElement {
    const [menuOpen, setMenuOpen]   = useState(false);
    const [total, setTotal]         = useState<number | null>(null);
    const [profile, setProfile]     = useState<ProfileResponse | null>(null);
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState<string | null>(null);
    const isWide                      = useIsWideLayout();

    const loadDashboard = useCallback(async (): Promise<void> => {
        setLoading(true);
        setError(null);

        try {
            const [stats, prof] = await Promise.all([
                api.getCallLogStats(),
                api.getProfile(),
            ]);
            setTotal(stats.total);
            setProfile(prof);
        } catch (e) {
            const msg =
                e instanceof ApiError ? e.message : 'Network error';
            setError(msg);
            setTotal(null);
            setProfile(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadDashboard();
    }, [loadDashboard, statsRefreshKey]);

    async function handleLogout(): Promise<void> {
        setMenuOpen(false);
        await onLogout();
    }

    const identityAndProfile = (
        <>
            <Text style={styles.cardLabel}>Signed in as</Text>
            <Text style={styles.email}>{user.email}</Text>
            {!loading && profile ? (
                <>
                    <Text style={styles.profileBlockLabel}>Name</Text>
                    <Text style={styles.profileBlockValue}>
                        {profile.name?.trim()
                            ? profile.name
                            : '—'}
                    </Text>
                    <Text style={styles.profileBlockLabel}>Rank</Text>
                    <Text style={styles.profileBlockValue}>
                        {profile.rank?.label ?? '—'}
                    </Text>
                    <Text style={styles.profileBlockLabel}>
                        Fire stations
                    </Text>
                    {profile.stationMemberships.length === 0 ? (
                        <Text style={styles.profileBlockValue}>
                            None added yet
                        </Text>
                    ) : (
                        profile.stationMemberships.map((m) => (
                            <View key={m.id}>
                                <Text style={styles.stationLine}>
                                    {m.fireStation.name} (#
                                    {m.fireStation.stationNumber})
                                </Text>
                                <Text style={styles.stationMeta}>
                                    {m.fireStation.town},{' '}
                                    {m.fireStation.state}
                                </Text>
                            </View>
                        ))
                    )}
                </>
            ) : null}
        </>
    );

    const statsBlock = (
        <>
            <Text style={styles.statLabel}>Total calls</Text>
            {loading ? (
                <ActivityIndicator
                    size="large"
                    color={colors.brand}
                    style={styles.statSpinner}
                />
            ) : error ? (
                <FormErrorMessage message={error} variant="block" />
            ) : (
                <Text style={styles.statValue}>{total ?? 0}</Text>
            )}
            <Text style={styles.statHint}>
                Count of call logs recorded for your account.
            </Text>
        </>
    );

    return (
        <View style={styles.root}>
            <AppHeader
                headerRight={
                    <Pressable
                        style={headerStyles.menuButton}
                        onPress={() => setMenuOpen(true)}
                        accessibilityRole="button"
                        accessibilityLabel="Open menu"
                    >
                        <Ionicons
                            name="menu"
                            size={22}
                            color={colors.textOnPrimary}
                        />
                        <Text style={headerStyles.menuButtonText}>Menu</Text>
                    </Pressable>
                }
            />

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={{ paddingBottom: 32 }}
                keyboardShouldPersistTaps="handled"
            >
                <ScreenCard>
                    {isWide ? (
                        <View style={styles.dashboardRow}>
                            <View style={styles.dashboardCol}>
                                {identityAndProfile}
                            </View>
                            <View style={styles.dashboardColStat}>
                                {statsBlock}
                            </View>
                        </View>
                    ) : (
                        <>
                            {identityAndProfile}
                            {statsBlock}
                        </>
                    )}
                </ScreenCard>
            </ScrollView>

            <Modal
                visible={menuOpen}
                transparent
                animationType="fade"
                onRequestClose={() => setMenuOpen(false)}
            >
                <View style={styles.modalRoot}>
                    <Pressable
                        style={StyleSheet.absoluteFillObject}
                        onPress={() => setMenuOpen(false)}
                        accessibilityRole="button"
                        accessibilityLabel="Close menu"
                    />
                    <View style={styles.modalMenuWrap} pointerEvents="box-none">
                        <View style={styles.menuPanel}>
                            <Pressable
                                style={styles.menuItem}
                                onPress={() => {
                                    setMenuOpen(false);
                                    onOpenCreateCallLog();
                                }}
                            >
                                <View style={styles.menuItemRow}>
                                    <Ionicons
                                        name="add-circle"
                                        size={22}
                                        color={colors.textSecondary}
                                    />
                                    <Text style={styles.menuItemText}>
                                        Create new call log
                                    </Text>
                                </View>
                            </Pressable>
                            <Pressable
                                style={styles.menuItem}
                                onPress={() => {
                                    setMenuOpen(false);
                                    onOpenCallLogList();
                                }}
                            >
                                <View style={styles.menuItemRow}>
                                    <Ionicons
                                        name="list"
                                        size={22}
                                        color={colors.textSecondary}
                                    />
                                    <Text style={styles.menuItemText}>
                                        View all logs
                                    </Text>
                                </View>
                            </Pressable>
                            <Pressable
                                style={styles.menuItem}
                                onPress={() => {
                                    setMenuOpen(false);
                                    onOpenAccount();
                                }}
                            >
                                <View style={styles.menuItemRow}>
                                    <Ionicons
                                        name="person"
                                        size={22}
                                        color={colors.textSecondary}
                                    />
                                    <Text style={styles.menuItemText}>
                                        Account
                                    </Text>
                                </View>
                            </Pressable>
                            <Pressable
                                style={[styles.menuItem, styles.menuItemLast]}
                                onPress={() => void handleLogout()}
                            >
                                <View style={styles.menuItemRow}>
                                    <Ionicons
                                        name="log-out"
                                        size={22}
                                        color={colors.error}
                                    />
                                    <Text
                                        style={[
                                            styles.menuItemText,
                                            styles.menuItemDanger,
                                        ]}
                                    >
                                        Log out
                                    </Text>
                                </View>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
