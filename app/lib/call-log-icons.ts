import type { ComponentProps } from 'react';
import type Ionicons from '@expo/vector-icons/Ionicons';

type IonName = ComponentProps<typeof Ionicons>['name'];

/**
 * Maps API call type labels (see api migration seed) to Ionicons names (filled).
 * Unknown labels fall back to a generic icon.
 */
const CALL_TYPE_ICONS: Record<string, IonName> = {
    'Fire Alarm':             'flame',
    'CO Alarm':               'warning',
    'Medical Emergency':      'medical',
    'Motor Vehicle Accident': 'car',
    'Structure Fire':         'home',
    'Brush Fire':             'leaf',
    'Report of Smoke':        'cloud',
    'Trapped Victim':         'accessibility',
    'Hazmat':                 'flask',
};

const APPARATUS_ICONS: Record<string, IonName> = {
    /** Stacked lines read as rungs; Ionicons has no dedicated ladder. */
    'Ladder/Tower':    'reorder-four',
    'Engine':          'car',
    'Rescue':          'medical',
    'Tanker':          'water',
    'Command Vehicle': 'radio',
};

const FALLBACK: IonName = 'ellipse';

export function getCallTypeIconName(label: string): IonName {
    return CALL_TYPE_ICONS[label] ?? FALLBACK;
}

export function getApparatusTypeIconName(label: string): IonName {
    return APPARATUS_ICONS[label] ?? FALLBACK;
}
