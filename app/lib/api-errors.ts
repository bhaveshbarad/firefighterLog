/**
 * Maps NestJS validation / HTTP error bodies to a single message string.
 */
export function parseErrorMessage(data: unknown): string {
    if (
        typeof data === 'object' &&
        data !== null &&
        'message' in data
    ) {
        const msg = (data as { message: unknown }).message;
        if (Array.isArray(msg)) {
            return msg.join(', ');
        }
        if (typeof msg === 'string') {
            return msg;
        }
    }
    return 'Request failed';
}
