/**
 * Semantic palette for surfaces, text, and accents.
 * Dark fire-service theme: midnight chrome, charcoal panels, crimson primary,
 * silver borders, safety red for errors (distinct from brand crimson).
 */
export const colors = {
    background:     '#0e0e12',
    surface:        '#1a1a22',
    /** Slightly tinted panels for grouped sections (e.g. Account). */
    sectionMuted:   '#22222c',
    /** Alternate grouped panels — subtle warm/crimson tint vs sectionMuted. */
    sectionAlt:     '#261a1e',
    border:         '#3a3a46',
    borderInput:    '#4f4f5c',
    borderSubtle:   '#2a2a34',
    textPrimary:    '#f2f2f5',
    textSecondary:  '#b4b8c0',
    textMuted:      '#8a8f99',
    brand:          '#a31626',
    error:          '#ff4d4d',
    overlay:        'rgba(0, 0, 0, 0.65)',
    textOnPrimary:  '#ffffff',
} as const;

export type ColorName = keyof typeof colors;
