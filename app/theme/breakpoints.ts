/**
 * Layout breakpoints (window width in density-independent pixels).
 */
export const WIDE_LAYOUT_MIN_WIDTH = 720;

/** Below this width, call log filters stack in a single column. */
export const CALL_LOG_FILTER_STACK_MAX = 640;

/** Between this and CALL_LOG_FILTER_STACK_MAX: three filter bands. Above: two. */
export const CALL_LOG_FILTER_THREE_ROW_MAX = 1000;

/** Minimum width for each call card when computing grid column count. */
export const CALL_LOG_CARD_MIN_WIDTH = 310;

/** Horizontal gap between card columns (matches spacing.md in styles). */
export const CALL_LOG_CARD_COLUMN_GAP = 8;
