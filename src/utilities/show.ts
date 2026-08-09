/**
 * Evaluates a boolean flag or predicate function against a given record.
 * Defaults to true if `show` is undefined.
 */
export const evaluateShow = <T>(
    show: boolean | ((record: T) => boolean) | undefined,
    record: T,
): boolean => {
    if (typeof show === 'function') {
        const result = show(record);
        return result;
    }

    const isVisible = show ?? true;
    return isVisible;
};
