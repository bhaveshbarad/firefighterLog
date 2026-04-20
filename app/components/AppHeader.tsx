import type { ReactElement, ReactNode } from 'react';
import { Text, View } from 'react-native';
import { appHeaderStyles as styles } from './appHeaderStyles';

export type AppHeaderProps = {
    title?:       string;
    headerLeft?:  ReactNode;
    headerRight?: ReactNode;
};

const DEFAULT_TITLE = 'Firefighter Log';

/**
 * app header component
 */
export function AppHeader({
    title = DEFAULT_TITLE,
    headerLeft,
    headerRight,
}: AppHeaderProps): ReactElement {
    return (
        <View style={styles.header}>
            <View style={styles.headerMain}>
                {headerLeft ? headerLeft : null}
                <Text
                    style={styles.headerTitle}
                    accessibilityRole="header"
                >
                    {title}
                </Text>
            </View>
            <View style={styles.headerActions}>
                {headerRight ? headerRight : null}
            </View>
        </View>
    );
}
