import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    Text,
    TextInput,
    View,
    type LayoutChangeEvent,
} from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { appHeaderStyles as headerStyles } from '../components/appHeaderStyles';
import { DateTimePickerModal } from '../components/DateTimePickerModal';
import { FormErrorMessage } from '../components/FormErrorMessage';
import { FormSelectField } from '../components/FormSelectField';
import { formStyles } from '../components/formStyles';
import { ScreenCard } from '../components/ScreenCard';
import { saveOrShareCallLogsCsv } from '../lib/call-log-export';
import {
    ApiError,
    api,
    type CallLogListItem,
    type GetCallLogsParams,
} from '../lib/api-client';
import { useCallLogListLayout } from '../hooks/useCallLogListLayout';
import {
    getApparatusTypeIconName,
    getCallTypeIconName,
} from '../lib/call-log-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { callLogListScreenStyles as styles } from './callLogListScreenStyles';

export type CallLogListScreenProps = {
    onBack:          () => void;
    onOpenCallLog:   (id: string) => void;
};

type ViewMode = 'cards' | 'list';

const SEARCH_DEBOUNCE_MS    = 500; // Debounce delay before applying search to the API (keeps typing smooth).
const PAGE_SIZE             = 50;

function startOfDay(d: Date): Date {
    const dt = new Date(d.getTime());
    dt.setHours(0, 0, 0, 0);
    return dt;
}

function endOfDay(d: Date): Date {
    const dt = new Date(d.getTime());
    dt.setHours(23, 59, 59, 999);
    return dt;
}

function formatItemDate(iso: string): string {
    return new Date(iso).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
}

function formatFilterDate(d: Date): string {
    return d.toLocaleDateString(undefined, { dateStyle: 'medium' });
}

function getActiveFilterCount(
    searchInput: string,
    debouncedSearch: string,
    reportedFrom: Date | null,
    reportedTo: Date | null,
    callTypeId: string,
    apparatusTypeId: string,
    falseAlarmValue: string,
): number {
    let n = 0;
    if (searchInput.trim() || debouncedSearch.trim()) {
        n += 1;
    }
    if (reportedFrom) {
        n += 1;
    }
    if (reportedTo) {
        n += 1;
    }
    if (callTypeId) {
        n += 1;
    }
    if (apparatusTypeId) {
        n += 1;
    }
    if (falseAlarmValue !== '') {
        n += 1;
    }
    return n;
}

/**
 * Lists call logs with filters and card vs compact list layout.
 */
export function CallLogListScreen({
    onBack,
    onOpenCallLog,
}: CallLogListScreenProps): ReactElement {
    const [items, setItems]               = useState<CallLogListItem[]>([]);
    const [listTotal, setListTotal]       = useState(0);
    const [loading, setLoading]         = useState(true);
    const [loadingMore, setLoadingMore]   = useState(false);
    const [exportBusy, setExportBusy]     = useState(false);
    const [lookupsLoading, setLookupsLoading] = useState(true);
    const [error, setError]               = useState<string | null>(null);

    const [callTypes, setCallTypes]       = useState<
        { id: string; label: string }[]
    >([]);
    const [apparatusTypes, setApparatusTypes] = useState<
        { id: string; label: string }[]
    >([]);

    const [reportedFrom, setReportedFrom] = useState<Date | null>(null);
    const [reportedTo, setReportedTo]   = useState<Date | null>(null);
    const [showFromModal, setShowFromModal] = useState(false);
    const [showToModal, setShowToModal]   = useState(false);

    const [callTypeId, setCallTypeId]   = useState('');
    const [apparatusTypeId, setApparatusTypeId] = useState('');
    const [falseAlarmValue, setFalseAlarmValue] = useState<
        '' | 'true' | 'false'
    >('');

    const [searchInput, setSearchInput]   = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const [viewMode, setViewMode]         = useState<ViewMode>('cards');
    const [filtersExpanded, setFiltersExpanded] = useState(true);

    const { filterLayout, cardColumns } = useCallLogListLayout();
    const numListColumns =
        viewMode === 'cards' ? cardColumns : 1;

    const viewLayoutKey                 = `${viewMode}-${numListColumns}`;
    const flatListRef                   = useRef<FlatList<CallLogListItem> | null>(null);
    const prevViewLayoutKeyRef          = useRef<string | null>(null);
    const scrollListStartAfterLayoutRef = useRef(false);

    /**
     * After list vs card (or column count) changes, FlatList remounts and scroll
     * resets to y=0 (top of header). Scroll to the end of the header so the first
     * row/cards sit at the top of the viewport.
     */
    const handleListHeaderLayout = useCallback(
        (e: LayoutChangeEvent) => {
            const h = e.nativeEvent.layout.height;
            if (! scrollListStartAfterLayoutRef.current || h <= 0) {
                return;
            }
            scrollListStartAfterLayoutRef.current = false;
            requestAnimationFrame(() => {
                flatListRef.current?.scrollToOffset({
                    offset: h,
                    animated: false,
                });
            });
        },
        [],
    );

    useLayoutEffect(() => {
        if (prevViewLayoutKeyRef.current === null) {
            prevViewLayoutKeyRef.current = viewLayoutKey;
            return;
        }
        if (prevViewLayoutKeyRef.current !== viewLayoutKey) {
            prevViewLayoutKeyRef.current = viewLayoutKey;
            scrollListStartAfterLayoutRef.current = true;
        }
    }, [viewLayoutKey]);

    const onViewModeChange = useCallback((mode: ViewMode) => {
        scrollListStartAfterLayoutRef.current = true;
        setViewMode(mode);
    }, []);

    useEffect(() => {
        const t = setTimeout(() => {
            setDebouncedSearch(searchInput);
        }, SEARCH_DEBOUNCE_MS);
        return () => clearTimeout(t);
    }, [searchInput]);

    useEffect(() => {
        let cancelled = false;
        async function loadLookups(): Promise<void> {
            setLookupsLoading(true);
            try {
                const [ct, at] = await Promise.all([
                    api.getCallTypes(),
                    api.getApparatusTypes(),
                ]);
                if (!cancelled) {
                    setCallTypes(ct);
                    setApparatusTypes(at);
                }
            } catch (e) {
                if (! cancelled) {
                    const msg =
                        e instanceof ApiError ? e.message : 'Network error';
                    setError(msg);
                }
            } finally {
                if (!cancelled) {
                    setLookupsLoading(false);
                }
            }
        }
        void loadLookups();
        return () => {
            cancelled = true;
        };
    }, []);

    const buildFilterParams = useCallback((): GetCallLogsParams => {
        const params: GetCallLogsParams = {};
        if (reportedFrom) {
            params.reportedFrom = startOfDay(reportedFrom).toISOString();
        }
        if (reportedTo) {
            params.reportedTo = endOfDay(reportedTo).toISOString();
        }
        if (callTypeId) {
            params.callTypeId = callTypeId;
        }
        if (apparatusTypeId) {
            params.apparatusTypeId = apparatusTypeId;
        }
        if (falseAlarmValue === 'true') {
            params.isFalseAlarm = true;
        } else if (falseAlarmValue === 'false') {
            params.isFalseAlarm = false;
        }
        const q = debouncedSearch.trim();
        if (q) {
            params.search = q;
        }
        return params;
    }, [
        reportedFrom,
        reportedTo,
        callTypeId,
        apparatusTypeId,
        falseAlarmValue,
        debouncedSearch,
    ]);

    const refreshList = useCallback(async (): Promise<void> => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.getCallLogs({
                ...buildFilterParams(),
                offset: 0,
                limit:  PAGE_SIZE,
            });
            setItems(res.items);
            setListTotal(res.total);
        } catch (e) {
            const msg =
                e instanceof ApiError ? e.message : 'Network error';
            setError(msg);
            setItems([]);
            setListTotal(0);
        } finally {
            setLoading(false);
        }
    }, [buildFilterParams]);

    useEffect(() => {
        void refreshList();
    }, [refreshList]);

    const loadMore = useCallback(async (): Promise<void> => {
        if (loading || loadingMore) {
            return;
        }
        if (items.length >= listTotal) {
            return;
        }
        setLoadingMore(true);
        try {
            const res = await api.getCallLogs({
                ...buildFilterParams(),
                offset: items.length,
                limit:  PAGE_SIZE,
            });
            setItems((prev) => [...prev, ...res.items]);
            setListTotal(res.total);
        } catch (e) {
            const msg =
                e instanceof ApiError ? e.message : 'Network error';
            setError(msg);
        } finally {
            setLoadingMore(false);
        }
    }, [
        loading,
        loadingMore,
        items.length,
        listTotal,
        buildFilterParams,
    ]);

    const handleExportCsv = useCallback(async (): Promise<void> => {
        setExportBusy(true);
        setError(null);
        try {
            const csv = await api.getCallLogsExportCsv(buildFilterParams());
            await saveOrShareCallLogsCsv('call-logs.csv', csv);
        } catch (e) {
            const msg =
                e instanceof ApiError ? e.message : 'Network error';
            setError(msg);
        } finally {
            setExportBusy(false);
        }
    }, [buildFilterParams]);

    const callTypeOptions = [
        { id: '', label: 'All types' },
        ...callTypes.map((o) => ({ id: o.id, label: o.label })),
    ];

    const apparatusOptions = [
        { id: '', label: 'All apparatus' },
        ...apparatusTypes.map((o) => ({ id: o.id, label: o.label })),
    ];

    const falseAlarmOptions = [
        { id: '', label: 'All' },
        { id: 'true', label: 'Yes' },
        { id: 'false', label: 'No' },
    ];

    const activeFilterCount = getActiveFilterCount(
        searchInput,
        debouncedSearch,
        reportedFrom,
        reportedTo,
        callTypeId,
        apparatusTypeId,
        falseAlarmValue,
    );

    function renderDateInlineColumn(isFrom: boolean): ReactElement {
        const value   = isFrom ? reportedFrom : reportedTo;
        const setOpen = isFrom ? setShowFromModal : setShowToModal;
        const clear   = (): void =>
            isFrom ? setReportedFrom(null) : setReportedTo(null);
        const a11yDate = isFrom ? 'Filter from date' : 'Filter to date';
        const a11yClear = isFrom ? 'Clear from date' : 'Clear to date';
        return (
            <View style={styles.filterFieldHalf}>
                <Text style={formStyles.label}>
                    {isFrom ? 'From' : 'To'}
                </Text>
                <View style={styles.dateRowInline}>
                    <Pressable
                        style={styles.datePressableFull}
                        onPress={() => setOpen(true)}
                        accessibilityRole="button"
                        accessibilityLabel={a11yDate}
                    >
                        <Text style={styles.datePressableText}>
                            {value ? formatFilterDate(value) : 'Any'}
                        </Text>
                    </Pressable>
                    {value ? (
                        <Pressable
                            onPress={clear}
                            accessibilityRole="button"
                            accessibilityLabel={a11yClear}
                        >
                            <Text style={styles.clearLink}>Clear</Text>
                        </Pressable>
                    ) : null}
                </View>
            </View>
        );
    }

    function renderToolbarIconButtons(): ReactElement {
        return (
            <>
                <Pressable
                    style={[
                        styles.toolbarIconBtn,
                        exportBusy && styles.toolbarIconBtnDisabled,
                    ]}
                    onPress={() => void handleExportCsv()}
                    disabled={exportBusy}
                    accessibilityRole="button"
                    accessibilityLabel="Export filtered call logs as CSV"
                >
                    {exportBusy ? (
                        <ActivityIndicator
                            size="small"
                            color={colors.brand}
                        />
                    ) : (
                        <Ionicons
                            name="download"
                            size={22}
                            color={colors.brand}
                        />
                    )}
                </Pressable>
                <Pressable
                    style={[
                        styles.toolbarIconBtn,
                        viewMode === 'cards' && styles.toolbarIconBtnSelected,
                    ]}
                    onPress={() => onViewModeChange('cards')}
                    accessibilityRole="button"
                    accessibilityLabel="Card view"
                    accessibilityState={{
                        selected: viewMode === 'cards',
                    }}
                >
                    <Ionicons
                        name="grid"
                        size={22}
                        color={
                            viewMode === 'cards'
                                ? colors.brand
                                : colors.textMuted
                        }
                    />
                </Pressable>
                <Pressable
                    style={[
                        styles.toolbarIconBtn,
                        viewMode === 'list' && styles.toolbarIconBtnSelected,
                    ]}
                    onPress={() => onViewModeChange('list')}
                    accessibilityRole="button"
                    accessibilityLabel="List view"
                    accessibilityState={{
                        selected: viewMode === 'list',
                    }}
                >
                    <Ionicons
                        name="list"
                        size={22}
                        color={
                            viewMode === 'list'
                                ? colors.brand
                                : colors.textMuted
                        }
                    />
                </Pressable>
            </>
        );
    }

    function renderLookupsRow(): ReactElement {
        if (lookupsLoading) {
            return (
                <ActivityIndicator
                    style={styles.loadingInline}
                    size="small"
                    color={colors.brand}
                />
            );
        }
        return (
            <>
                <View style={styles.filterFieldGrow}>
                    <Text style={formStyles.label}>Incident type</Text>
                    <FormSelectField
                        accessibilityLabel="Incident type filter"
                        options={callTypeOptions}
                        value={callTypeId}
                        onValueChange={setCallTypeId}
                    />
                </View>
                <View style={styles.filterFieldGrow}>
                    <Text style={formStyles.label}>Apparatus</Text>
                    <FormSelectField
                        accessibilityLabel="Apparatus type filter"
                        options={apparatusOptions}
                        value={apparatusTypeId}
                        onValueChange={setApparatusTypeId}
                    />
                </View>
            </>
        );
    }

    function renderFiltersExpanded(): ReactElement {
        const searchBlock = (
            <>
                <Text style={formStyles.label}>Search</Text>
                <TextInput
                    style={formStyles.input}
                    value={searchInput}
                    onChangeText={setSearchInput}
                    placeholder="Title or notes"
                    accessibilityLabel="Search call logs"
                    blurOnSubmit={false}
                    returnKeyType="search"
                />
            </>
        );

        const falseAlarmBlock = (
            <View style={styles.filterFieldGrowSm}>
                <Text style={formStyles.label}>False alarm</Text>
                <FormSelectField
                    accessibilityLabel="False alarm filter"
                    options={falseAlarmOptions}
                    value={falseAlarmValue}
                    onValueChange={(v) =>
                        setFalseAlarmValue(v as '' | 'true' | 'false')
                    }
                />
            </View>
        );

        const dateFromStack = (
            <>
                <Text style={formStyles.label}>Date from</Text>
                <View style={styles.dateRow}>
                    <Text style={styles.dateRowLabel}>From</Text>
                    <Pressable
                        style={styles.datePressable}
                        onPress={() => setShowFromModal(true)}
                        accessibilityRole="button"
                        accessibilityLabel="Filter from date"
                    >
                        <Text style={styles.datePressableText}>
                            {reportedFrom
                                ? formatFilterDate(reportedFrom)
                                : 'Any'}
                        </Text>
                    </Pressable>
                    {reportedFrom ? (
                        <Pressable
                            onPress={() => setReportedFrom(null)}
                            accessibilityRole="button"
                            accessibilityLabel="Clear from date"
                        >
                            <Text style={styles.clearLink}>Clear</Text>
                        </Pressable>
                    ) : null}
                </View>
            </>
        );

        const dateToStack = (
            <View style={styles.dateRow}>
                <Text style={styles.dateRowLabel}>To</Text>
                <Pressable
                    style={styles.datePressable}
                    onPress={() => setShowToModal(true)}
                    accessibilityRole="button"
                    accessibilityLabel="Filter to date"
                >
                    <Text style={styles.datePressableText}>
                        {reportedTo
                            ? formatFilterDate(reportedTo)
                            : 'Any'}
                    </Text>
                </Pressable>
                {reportedTo ? (
                    <Pressable
                        onPress={() => setReportedTo(null)}
                        accessibilityRole="button"
                        accessibilityLabel="Clear to date"
                    >
                        <Text style={styles.clearLink}>Clear</Text>
                    </Pressable>
                ) : null}
            </View>
        );

        const lookupsStack = lookupsLoading ? (
            <ActivityIndicator
                style={styles.loadingInline}
                size="small"
                color={colors.brand}
            />
        ) : (
            <>
                <Text style={formStyles.label}>Incident type</Text>
                <FormSelectField
                    accessibilityLabel="Incident type filter"
                    options={callTypeOptions}
                    value={callTypeId}
                    onValueChange={setCallTypeId}
                />

                <Text style={formStyles.label}>Apparatus</Text>
                <FormSelectField
                    accessibilityLabel="Apparatus type filter"
                    options={apparatusOptions}
                    value={apparatusTypeId}
                    onValueChange={setApparatusTypeId}
                />
            </>
        );

        if (filterLayout === 'stack') {
            return (
                <View style={styles.filtersBodyStack}>
                    {searchBlock}
                    {dateFromStack}
                    {dateToStack}
                    {lookupsStack}
                    <Text style={formStyles.label}>False alarm</Text>
                    <FormSelectField
                        accessibilityLabel="False alarm filter"
                        options={falseAlarmOptions}
                        value={falseAlarmValue}
                        onValueChange={(v) =>
                            setFalseAlarmValue(v as '' | 'true' | 'false')
                        }
                    />
                </View>
            );
        }

        if (filterLayout === 'threeRow') {
            return (
                <View style={styles.filtersBody}>
                    <View style={styles.filtersBand}>
                        {searchBlock}
                    </View>
                    <View style={[styles.filtersBandRow, styles.filtersBand]}>
                        {renderDateInlineColumn(true)}
                        {renderDateInlineColumn(false)}
                    </View>
                    <View
                        style={[styles.filtersBandRow, styles.filtersBandLast]}
                    >
                        {renderLookupsRow()}
                        {falseAlarmBlock}
                    </View>
                </View>
            );
        }

        return (
            <View style={styles.filtersBody}>
                <View style={[styles.filtersBandRow, styles.filtersBand]}>
                    <View style={styles.filterSearchCell}>{searchBlock}</View>
                    <View style={styles.filtersDateBand}>
                        {renderDateInlineColumn(true)}
                        {renderDateInlineColumn(false)}
                    </View>
                </View>
                <View
                    style={[styles.filtersBandRow, styles.filtersBandLast]}
                >
                    {renderLookupsRow()}
                    {falseAlarmBlock}
                </View>
            </View>
        );
    }

    function renderListHeader(): ReactElement {
        return (
            <View
                style={styles.headerBlock}
                onLayout={handleListHeaderLayout}
            >
                <View style={styles.filtersAccordion}>
                    <Pressable
                        style={[
                            styles.filtersToggle,
                            filtersExpanded && styles.filtersToggleExpanded,
                        ]}
                        onPress={() => setFiltersExpanded((v) => !v)}
                        accessibilityRole="button"
                        accessibilityLabel={
                            filtersExpanded
                                ? 'Hide filters'
                                : 'Show filters'
                        }
                        accessibilityState={{ expanded: filtersExpanded }}
                    >
                        <View>
                            <Text style={styles.filtersToggleLabel}>
                                Filters
                            </Text>
                            {!filtersExpanded ? (
                                <Text style={styles.filtersToggleHint}>
                                    {activeFilterCount === 0
                                        ? 'No filters applied'
                                        : `${activeFilterCount} active`}
                                </Text>
                            ) : null}
                        </View>
                        <View style={styles.filtersToggleRight}>
                            <Text
                                style={styles.chevron}
                                accessibilityElementsHidden
                            >
                                {filtersExpanded ? '▼' : '▶'}
                            </Text>
                        </View>
                    </Pressable>

                    {filtersExpanded ? renderFiltersExpanded() : null}
                </View>

                <View style={styles.listToolbarRow}>
                    <View style={styles.listToolbarLeft}>
                        {listTotal > 0 ? (
                            <Text
                                style={styles.resultCountToolbar}
                                numberOfLines={1}
                            >
                                Showing {items.length} of {listTotal} calls
                            </Text>
                        ) : null}
                    </View>
                    <View style={styles.listToolbarActions}>
                        {renderToolbarIconButtons()}
                    </View>
                </View>

                {loading ? (
                    <ActivityIndicator
                        style={styles.loadingInline}
                        size="small"
                        color={colors.brand}
                    />
                ) : null}
                <FormErrorMessage message={error} variant="form" />
            </View>
        );
    }

    const renderCard = useCallback(
        ({ item }: { item: CallLogListItem }) => {
            const isGrid       = numListColumns > 1;
            const notesTrimmed = item.notes?.trim() ?? '';
            const cardInner    = (
                <>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardMeta}>
                        {formatItemDate(item.reportedAt)}
                    </Text>
                    <View style={styles.cardMetaWithIcon}>
                        <Ionicons
                            name={getCallTypeIconName(item.callType.label)}
                            size={18}
                            color={colors.textSecondary}
                            style={styles.cardMetaIcon}
                        />
                        <Text style={[styles.cardMeta, { marginTop: 0 }]}>
                            {item.callType.label}
                        </Text>
                    </View>
                    <View style={styles.cardMetaWithIcon}>
                        <Ionicons
                            name={getApparatusTypeIconName(
                                item.apparatusType.label,
                            )}
                            size={18}
                            color={colors.textSecondary}
                            style={styles.cardMetaIcon}
                        />
                        <Text style={[styles.cardMeta, { marginTop: 0 }]}>
                            {item.apparatusType.label}
                        </Text>
                    </View>
                    {item.isFalseAlarm ? (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>
                                False alarm
                            </Text>
                        </View>
                    ) : null}
                    {notesTrimmed ? (
                        <Text
                            style={styles.cardNotes}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {notesTrimmed}
                        </Text>
                    ) : null}
                </>
            );

            return (
                <View style={styles.cardGridCell}>
                    <Pressable
                        style={[
                            styles.cardPressable,
                            isGrid && styles.cardPressableGrid,
                        ]}
                        onPress={() => onOpenCallLog(item.id)}
                        accessibilityRole="button"
                        accessibilityLabel={`Open call ${item.title}`}
                    >
                        <ScreenCard
                            style={[
                                isGrid ? styles.cardGridCard : undefined,
                                !isGrid && { marginBottom: spacing.base },
                            ]}
                        >
                            {isGrid ? (
                                <View style={styles.cardGridContent}>
                                    {cardInner}
                                </View>
                            ) : (
                                cardInner
                            )}
                        </ScreenCard>
                    </Pressable>
                </View>
            );
        },
        [onOpenCallLog, numListColumns],
    );

    const renderListRow = useCallback(
        ({ item }: { item: CallLogListItem }) => (
            <Pressable
                onPress={() => onOpenCallLog(item.id)}
                accessibilityRole="button"
                accessibilityLabel={`Open call ${item.title}`}
            >
                <View style={styles.listRow}>
                    <View style={styles.listRowMain}>
                        <Text style={styles.listRowTitle} numberOfLines={2}>
                            {item.title}
                        </Text>
                        <View style={styles.listRowMetaRow}>
                            <Ionicons
                                name={getCallTypeIconName(
                                    item.callType.label,
                                )}
                                size={14}
                                color={colors.textMuted}
                            />
                            <Text
                                style={styles.listRowMeta}
                                numberOfLines={1}
                            >
                                {item.callType.label}
                            </Text>
                            <Text style={styles.listRowMetaSep}>·</Text>
                            <Ionicons
                                name={getApparatusTypeIconName(
                                    item.apparatusType.label,
                                )}
                                size={14}
                                color={colors.textMuted}
                            />
                            <Text
                                style={styles.listRowMeta}
                                numberOfLines={1}
                            >
                                {item.apparatusType.label}
                                {item.isFalseAlarm ? ' · False alarm' : ''}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.listRowRight}>
                        <Text style={styles.listRowDate}>
                            {formatItemDate(item.reportedAt)}
                        </Text>
                    </View>
                </View>
            </Pressable>
        ),
        [onOpenCallLog],
    );

    return (
        <KeyboardAvoidingView
            style={styles.root}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <AppHeader
                title="Call logs"
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
            <FlatList
                ref={flatListRef}
                key={viewLayoutKey}
                style={styles.flatList}
                data={items}
                extraData={{ viewMode, numListColumns }}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={renderListHeader}
                numColumns={numListColumns}
                columnWrapperStyle={
                    numListColumns > 1 ? styles.cardColumnWrapper : undefined
                }
                renderItem={viewMode === 'cards' ? renderCard : renderListRow}
                contentContainerStyle={styles.listContent}
                keyboardShouldPersistTaps="handled"
                onEndReached={() => void loadMore()}
                onEndReachedThreshold={0.35}
                ListFooterComponent={
                    loadingMore ? (
                        <View style={styles.listFooter}>
                            <ActivityIndicator
                                size="small"
                                color={colors.brand}
                            />
                        </View>
                    ) : null
                }
                ListEmptyComponent={
                    !loading && !error && items.length === 0 ? (
                        <Text style={styles.emptyText}>
                            No calls match these filters.
                        </Text>
                    ) : null
                }
            />
            <DateTimePickerModal
                visible={showFromModal}
                value={reportedFrom ?? new Date()}
                onConfirm={(d) => {
                    setReportedFrom(startOfDay(d));
                    setShowFromModal(false);
                }}
                onCancel={() => setShowFromModal(false)}
            />
            <DateTimePickerModal
                visible={showToModal}
                value={reportedTo ?? new Date()}
                onConfirm={(d) => {
                    setReportedTo(endOfDay(d));
                    setShowToModal(false);
                }}
                onCancel={() => setShowToModal(false)}
            />
        </KeyboardAvoidingView>
    );
}
