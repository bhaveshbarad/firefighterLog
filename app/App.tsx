import { useCallback, useEffect, useState } from 'react';
import type { ReactElement } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ApiError, api } from './lib/api-client';
import {
    clearStoredToken,
    getStoredToken,
    setStoredToken,
} from './lib/auth-storage';
import { colors } from './theme/colors';
import { authScreenStyles as styles } from './screens/authScreenStyles';
import { CallLogDetailScreen } from './screens/CallLogDetailScreen';
import { CallLogListScreen } from './screens/CallLogListScreen';
import { AccountScreen } from './screens/AccountScreen';
import { CreateCallLogScreen } from './screens/CreateCallLogScreen';
import { HomeScreen } from './screens/HomeScreen';
import { LoginScreen } from './screens/LoginScreen';
import { RegisterScreen } from './screens/RegisterScreen';

const API_URL =
    process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

type Screen = 'loading' | 'login' | 'register' | 'home';
type User   = { id: string; email: string };
type HomePanel =
    | 'dashboard'
    | 'createCall'
    | 'callLogs'
    | 'callLogDetail'
    | 'account';

export default function App(): ReactElement {
    const [screen, setScreen]               = useState<Screen>('loading');
    const [user, setUser]                   = useState<User | null>(null);
    const [homePanel, setHomePanel]         = useState<HomePanel>('dashboard');
    const [callLogDetailId, setCallLogDetailId] = useState<string | null>(null);
    const [statsRefreshKey, setStatsRefreshKey] = useState(0);
    const [loginEmail, setLoginEmail]       = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [regEmail, setRegEmail]           = useState('');
    const [regPassword, setRegPassword]     = useState('');
    const [regConfirm, setRegConfirm]       = useState('');
    const [busy, setBusy]                   = useState(false);
    const [error, setError]                 = useState<string | null>(null);

    const loadSession = useCallback(async (): Promise<void> => {
        setError(null);
        const token = await getStoredToken();
        if (!token) {
            setScreen('login');
            return;
        }

        try {
            const data = await api.getMe();
            setUser(data);
            setScreen('home');
        } catch {
            await clearStoredToken();
            setScreen('login');
        }
    }, []);

    useEffect(() => {
        loadSession();
    }, [loadSession]);

    async function submitLogin(): Promise<void> {
        setBusy(true);
        setError(null);
        try {
            const data = await api.login(
                loginEmail.trim(),
                loginPassword,
            );
            await setStoredToken(data.access_token);
            setUser(data.user);
            setLoginPassword('');
            setScreen('home');
        } catch (e) {
            const msg =
                e instanceof ApiError ? e.message : 'Network error';
            setError(msg);
        } finally {
            setBusy(false);
        }
    }

    async function submitRegister(): Promise<void> {
        if (regPassword !== regConfirm) {
            setError('Passwords do not match');
            return;
        }
        setBusy(true);
        setError(null);
        try {
            const data = await api.register(
                regEmail.trim(),
                regPassword,
            );
            await setStoredToken(data.access_token);
            setUser(data.user);
            setRegPassword('');
            setRegConfirm('');
            setScreen('home');
        } catch (e) {
            const msg =
                e instanceof ApiError ? e.message : 'Network error';
            setError(msg);
        } finally {
            setBusy(false);
        }
    }

    async function logout(): Promise<void> {
        await clearStoredToken();
        setUser(null);
        setHomePanel('dashboard');
        setCallLogDetailId(null);
        setScreen('login');
    }

    if (screen === 'loading') {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={colors.brand} />
                <StatusBar style="light" />
            </View>
        );
    }

    if (screen === 'home' && user) {
        if (homePanel === 'createCall') {
            return (
                <>
                    <CreateCallLogScreen
                        onBack={() => setHomePanel('dashboard')}
                        onCreated={() => {
                            setHomePanel('dashboard');
                            setStatsRefreshKey((k) => k + 1);
                        }}
                    />
                    <StatusBar style="light" />
                </>
            );
        }
        if (homePanel === 'account') {
            return (
                <>
                    <AccountScreen
                        onBack={() => setHomePanel('dashboard')}
                        onProfileSaved={(result) => {
                            void (async () => {
                                if (result.access_token) {
                                    await setStoredToken(result.access_token);
                                }
                                setUser({
                                    id:    result.profile.id,
                                    email: result.profile.email,
                                });
                            })();
                        }}
                    />
                    <StatusBar style="light" />
                </>
            );
        }
        if (homePanel === 'callLogDetail' && callLogDetailId) {
            return (
                <>
                    <CallLogDetailScreen
                        callLogId={callLogDetailId}
                        onBack={() => {
                            setCallLogDetailId(null);
                            setHomePanel('callLogs');
                        }}
                    />
                    <StatusBar style="light" />
                </>
            );
        }
        if (homePanel === 'callLogs') {
            return (
                <>
                    <CallLogListScreen
                        onBack={() => setHomePanel('dashboard')}
                        onOpenCallLog={(id) => {
                            setCallLogDetailId(id);
                            setHomePanel('callLogDetail');
                        }}
                    />
                    <StatusBar style="light" />
                </>
            );
        }
        return (
            <>
                <HomeScreen
                    user={user}
                    onLogout={logout}
                    onOpenCreateCallLog={() => setHomePanel('createCall')}
                    onOpenCallLogList={() => setHomePanel('callLogs')}
                    onOpenAccount={() => setHomePanel('account')}
                    statsRefreshKey={statsRefreshKey}
                />
                <StatusBar style="light" />
            </>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                contentContainerStyle={styles.scroll}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={styles.title}>Firefighter Log</Text>

                {screen === 'login' ? (
                    <LoginScreen
                        email={loginEmail}
                        password={loginPassword}
                        onChangeEmail={setLoginEmail}
                        onChangePassword={setLoginPassword}
                        onSubmit={() => void submitLogin()}
                        busy={busy}
                        error={error}
                        onGoRegister={() => {
                            setError(null);
                            setScreen('register');
                        }}
                    />
                ) : null}

                {screen === 'register' ? (
                    <RegisterScreen
                        email={regEmail}
                        password={regPassword}
                        confirm={regConfirm}
                        onChangeEmail={setRegEmail}
                        onChangePassword={setRegPassword}
                        onChangeConfirm={setRegConfirm}
                        onSubmit={() => void submitRegister()}
                        busy={busy}
                        error={error}
                        onBackToLogin={() => {
                            setError(null);
                            setScreen('login');
                        }}
                    />
                ) : null}

                <Text style={styles.footer}>API: {API_URL}</Text>
            </ScrollView>
            <StatusBar style="light" />
        </KeyboardAvoidingView>
    );
}
