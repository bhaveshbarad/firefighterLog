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

export type LoginScreenProps = {
    email: string;
    password: string;
    onChangeEmail: (value: string) => void;
    onChangePassword: (value: string) => void;
    onSubmit: () => void | Promise<void>;
    busy: boolean;
    error: string | null;
    onGoRegister: () => void;
};

export function LoginScreen({
    email,
    password,
    onChangeEmail,
    onChangePassword,
    onSubmit,
    busy,
    error,
    onGoRegister,
}: LoginScreenProps): ReactElement {
    const passwordRef = useRef<TextInput | null>(null);

    function submitFromKeyboard(): void {
        if (!busy) {
            onSubmit();
        }
    }

    return (
        <ScreenCard variant="auth">
            <Text style={formStyles.h2}>Log in</Text>
            <Text style={formStyles.label}>Email</Text>
            <EmailField
                value={email}
                onChangeText={onChangeEmail}
                editable={!busy}
                onSubmitEditing={() => passwordRef.current?.focus()}
            />
            <Text style={formStyles.label}>Password</Text>
            <PasswordField
                ref={passwordRef}
                value={password}
                onChangeText={onChangePassword}
                editable={!busy}
                mode="login"
                returnKeyType="go"
                onSubmitEditing={submitFromKeyboard}
            />
            <FormErrorMessage message={error} variant="form" />
            <PrimaryButton
                label="Log in"
                busy={busy}
                onPress={onSubmit}
                accessibilityLabel="Log in"
            />
            <TextLinkButton
                label="Create an account"
                onPress={onGoRegister}
                disabled={busy}
                accessibilityLabel="Create an account"
            />
        </ScreenCard>
    );
}
