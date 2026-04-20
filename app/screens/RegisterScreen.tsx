import { useRef } from 'react';
import type { ReactElement } from 'react';
import { Text } from 'react-native';
import type { TextInput } from 'react-native';
import { EmailField } from '../components/EmailField';
import { FormErrorMessage } from '../components/FormErrorMessage';
import { formStyles } from '../components/formStyles';
import { PasswordField } from '../components/PasswordField';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenCard } from '../components/ScreenCard';
import { TextLinkButton } from '../components/TextLinkButton';

export type RegisterScreenProps = {
    email: string;
    password: string;
    confirm: string;
    onChangeEmail: (value: string) => void;
    onChangePassword: (value: string) => void;
    onChangeConfirm: (value: string) => void;
    onSubmit: () => void | Promise<void>;
    busy: boolean;
    error: string | null;
    onBackToLogin: () => void;
};

export function RegisterScreen({
    email,
    password,
    confirm,
    onChangeEmail,
    onChangePassword,
    onChangeConfirm,
    onSubmit,
    busy,
    error,
    onBackToLogin,
}: RegisterScreenProps): ReactElement {
    const passwordRef = useRef<TextInput | null>(null);
    const confirmRef = useRef<TextInput | null>(null);

    return (
        <ScreenCard variant="auth">
            <Text style={formStyles.h2}>Register</Text>
            <Text style={formStyles.label}>Email</Text>
            <EmailField
                value={email}
                onChangeText={onChangeEmail}
                editable={!busy}
                onSubmitEditing={() => passwordRef.current?.focus()}
            />
            <Text style={formStyles.label}>Password (min 8)</Text>
            <PasswordField
                ref={passwordRef}
                value={password}
                onChangeText={onChangePassword}
                editable={!busy}
                mode="register"
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => confirmRef.current?.focus()}
            />
            <Text style={formStyles.label}>Confirm password</Text>
            <PasswordField
                ref={confirmRef}
                value={confirm}
                onChangeText={onChangeConfirm}
                editable={!busy}
                mode="register"
                returnKeyType="go"
                onSubmitEditing={() => {
                    if (!busy) {
                        onSubmit();
                    }
                }}
            />
            <FormErrorMessage message={error} variant="form" />
            <PrimaryButton
                label="Create account"
                busy={busy}
                onPress={onSubmit}
                accessibilityLabel="Create account"
            />
            <TextLinkButton
                label="Back to log in"
                onPress={onBackToLogin}
                disabled={busy}
                accessibilityLabel="Back to log in"
            />
        </ScreenCard>
    );
}
