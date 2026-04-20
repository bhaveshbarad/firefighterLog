import { StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export const callLogListScreenStyles = StyleSheet.create({
    root: {
        flex:            1,
        backgroundColor: colors.background,
    },
    flatList: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: spacing.xxl,
        paddingBottom:     spacing.xxl,
    },
    headerBlock: {
        marginBottom: spacing.lg,
    },
    /** Single outer shell for the accordion (toggle + body share one border). */
    filtersAccordion: {
        borderWidth:     1,
        borderColor:     colors.border,
        borderRadius:    radii.md,
        backgroundColor: colors.surface,
        marginBottom:    spacing.lg,
        overflow:        'hidden',
    },
    filtersToggle: {
        flexDirection:  'row',
        alignItems:     'center',
        justifyContent: 'space-between',
        paddingVertical:   spacing.md,
        paddingHorizontal: spacing.lg,
    },
    /** Separator between header row and expanded fields (only when open). */
    filtersToggleExpanded: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.borderSubtle,
    },
    filtersToggleLabel: {
        ...typography.bodyLargeSemibold,
    },
    filtersToggleHint: {
        ...typography.caption,
        marginTop: spacing.xs,
    },
    filtersToggleRight: {
        flexDirection: 'row',
        alignItems:    'center',
        gap:           spacing.sm,
    },
    chevron: {
        ...typography.bodyLarge,
        color: colors.textMuted,
    },
    /** Inner padding for expanded filter fields (no second box). */
    filtersBody: {
        paddingHorizontal: spacing.lg,
        paddingTop:        spacing.sm,
        paddingBottom:     spacing.lg,
    },
    /** Single-column filters: vertical rhythm between groups. */
    filtersBodyStack: {
        paddingHorizontal: spacing.lg,
        paddingTop:        spacing.sm,
        paddingBottom:     spacing.lg,
        gap:               spacing.md,
    },
    filtersBand: {
        marginBottom: spacing.md,
    },
    filtersBandLast: {
        marginBottom: 0,
    },
    filtersBandRow: {
        flexDirection:   'row',
        flexWrap:        'wrap',
        alignItems:      'flex-start',
        gap:             spacing.md,
    },
    filterSearchCell: {
        flexGrow:   1,
        flexShrink: 1,
        minWidth:   220,
    },
    filtersDateBand: {
        flexGrow:       1,
        flexShrink:     1,
        minWidth:       200,
        flexDirection:  'row',
        gap:            spacing.md,
    },
    filterFieldHalf: {
        flex:     1,
        minWidth: 140,
    },
    filterFieldGrow: {
        flex:     1,
        minWidth: 160,
    },
    filterFieldGrowSm: {
        flex:     1,
        minWidth: 120,
    },
    listToolbarRow: {
        flexDirection:   'row',
        flexWrap:        'nowrap',
        alignItems:      'center',
        justifyContent:  'space-between',
        marginBottom:    spacing.lg,
        gap:             spacing.md,
    },
    listToolbarLeft: {
        flex:         1,
        minWidth:     0,
        marginRight:  spacing.sm,
        justifyContent: 'flex-start',
    },
    resultCountToolbar: {
        ...typography.bodySmall,
    },
    listToolbarActions: {
        flexDirection: 'row',
        alignItems:    'center',
        gap:           spacing.sm,
        flexShrink:    0,
    },
    toolbarIconBtn: {
        minWidth:          44,
        minHeight:         44,
        justifyContent:    'center',
        alignItems:        'center',
        paddingHorizontal: spacing.sm,
        borderRadius:      radii.sm,
        borderWidth:       1,
        borderColor:       colors.borderInput,
        backgroundColor:   colors.surface,
    },
    toolbarIconBtnSelected: {
        borderColor: colors.brand,
    },
    toolbarIconBtnDisabled: {
        opacity: 0.65,
    },
    dateRow: {
        flexDirection:  'row',
        alignItems:     'center',
        justifyContent: 'space-between',
        marginBottom:   spacing.sm,
    },
    dateRowLabel: {
        ...typography.bodyMedium,
        minWidth: 44,
    },
    datePressable: {
        flex:              1,
        borderWidth:       1,
        borderColor:       colors.borderInput,
        borderRadius:      radii.sm,
        paddingHorizontal: spacing.base,
        paddingVertical:   10,
        marginLeft:        spacing.md,
    },
    /** Full-width date control inside a filter column (no leading margin). */
    datePressableFull: {
        flex:              1,
        borderWidth:       1,
        borderColor:       colors.borderInput,
        borderRadius:      radii.sm,
        paddingHorizontal: spacing.base,
        paddingVertical:   10,
    },
    dateRowInline: {
        flexDirection:  'row',
        alignItems:     'center',
        gap:            spacing.sm,
    },
    datePressableText: {
        ...typography.bodyLarge,
    },
    clearLink: {
        ...typography.link,
        marginLeft: spacing.sm,
    },
    cardTitle: {
        ...typography.sectionHeading,
        marginBottom: spacing.sm,
    },
    cardMeta: {
        ...typography.bodyMedium,
        marginTop: spacing.xs,
    },
    cardMetaWithIcon: {
        flexDirection: 'row',
        alignItems:      'center',
        gap:             spacing.sm,
        marginTop:       spacing.xs,
    },
    cardMetaIcon: {
        marginTop: 2,
    },
    cardNotes: {
        ...typography.bodyMedium,
        marginTop: spacing.sm,
    },
    /** Fills the grid cell so cards in a row share the same height. */
    cardPressableGrid: {
        flex: 1,
    },
    cardGridCard: {
        flex: 1,
    },
    cardGridContent: {
        flex:       1,
        minHeight:  0,
    },
    badge: {
        alignSelf:       'flex-start',
        marginTop:       spacing.sm,
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.md,
        borderRadius:    radii.sm,
        backgroundColor: colors.borderSubtle,
    },
    badgeText: {
        ...typography.caption,
        fontWeight: '600',
    },
    badgeFalseAlarm: {
        backgroundColor: colors.borderSubtle,
    },
    listRow: {
        flexDirection:   'row',
        paddingVertical: spacing.md,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
        gap:               spacing.md,
    },
    listRowMain: {
        flex:    1,
        minWidth: 0,
    },
    listRowTitle: {
        ...typography.bodyLargeSemibold,
    },
    listRowMeta: {
        ...typography.caption,
        marginTop: 0,
        flexShrink: 1,
    },
    listRowMetaRow: {
        flexDirection:   'row',
        flexWrap:        'wrap',
        alignItems:      'center',
        gap:             spacing.xs,
        marginTop:       spacing.xs,
    },
    listRowMetaSep: {
        ...typography.caption,
        color: colors.textMuted,
    },
    listRowRight: {
        justifyContent: 'center',
    },
    listRowDate: {
        ...typography.bodySmall,
        textAlign: 'right',
    },
    emptyText: {
        ...typography.bodyMedium,
        textAlign: 'center',
        marginTop: spacing.xl,
    },
    loadingInline: {
        marginVertical: spacing.md,
    },
    listFooter: {
        paddingVertical: spacing.lg,
    },
    cardGridCell: {
        flex:     1,
        minWidth: 0,
        width:    '100%',
    },
    cardPressable: {
        width: '100%',
    },
    cardColumnWrapper: {
        alignItems:     'stretch',
        gap:            spacing.md,
        marginBottom:   spacing.base,
        justifyContent: 'flex-start',
    },
});
