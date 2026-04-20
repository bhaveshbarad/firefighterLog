import { useWindowDimensions } from 'react-native';
import { WIDE_LAYOUT_MIN_WIDTH } from '../theme/breakpoints';

/**
 * True when the window is wide enough for multi-column dashboard layouts.
 */
export function useIsWideLayout(): boolean {
    const { width } = useWindowDimensions();
    return width >= WIDE_LAYOUT_MIN_WIDTH;
}
