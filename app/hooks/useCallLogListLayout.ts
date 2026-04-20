import { useWindowDimensions } from 'react-native';
import {
    CALL_LOG_CARD_COLUMN_GAP,
    CALL_LOG_CARD_MIN_WIDTH,
    CALL_LOG_FILTER_STACK_MAX,
    CALL_LOG_FILTER_THREE_ROW_MAX,
} from '../theme/breakpoints';
import { spacing } from '../theme/spacing';

export type CallLogFilterLayout = 'stack' | 'threeRow' | 'twoRow';

const LIST_PADDING_H_TOTAL = spacing.xxl * 2;

/**
 * Responsive filter band layout and card grid column count for the call log list.
 */
export function useCallLogListLayout(): {
    filterLayout: CallLogFilterLayout;
    cardColumns:  number;
} {
    const { width } = useWindowDimensions();

    let filterLayout: CallLogFilterLayout;
    if (width < CALL_LOG_FILTER_STACK_MAX) {
        filterLayout = 'stack';
    } else if (width < CALL_LOG_FILTER_THREE_ROW_MAX) {
        filterLayout = 'threeRow';
    } else {
        filterLayout = 'twoRow';
    }

    const gap   = CALL_LOG_CARD_COLUMN_GAP;
    const usable = width - LIST_PADDING_H_TOTAL;
    const cardColumns = Math.max(
        1,
        Math.floor((usable + gap) / (CALL_LOG_CARD_MIN_WIDTH + gap)),
    );

    return { filterLayout, cardColumns };
}
