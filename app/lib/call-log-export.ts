import { Platform, Share } from 'react-native';

/**
 * Saves CSV on web (download) or opens the share sheet on native.
 */
export async function saveOrShareCallLogsCsv(
    filename: string,
    csv: string,
): Promise<void> {
    if (Platform.OS === 'web') {
        if (typeof document !== 'undefined') {
            const blob = new Blob([csv], {
                type: 'text/csv;charset=utf-8',
            });
            const url   = URL.createObjectURL(blob);
            const a     = document.createElement('a');
            a.href      = url;
            a.download  = filename;
            a.click();
            URL.revokeObjectURL(url);
        }
        return;
    }

    await Share.share({
        title:   filename,
        message: csv,
    });
}
