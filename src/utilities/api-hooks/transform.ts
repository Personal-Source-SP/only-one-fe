/**
 * Unwraps standard backend API envelope ({ isSuccess, data, meta, errors }).
 */
export const unwrapApiResponse = <T = unknown>(rawResponse: unknown): T | undefined => {
    if (!rawResponse) return undefined;
    const record = rawResponse as Record<string, unknown>;

    if (
        record?.data !== undefined &&
        (record?.isSuccess !== undefined ||
            record?.errors !== undefined ||
            record?.meta !== undefined)
    ) {
        return record.data as T;
    }

    return record?.data !== undefined ? (record.data as T) : (rawResponse as T);
};

/**
 * Applies data transformation with safe fallback.
 */
export const applyDataTransform = <TData, TTransformed>(
    data?: TData,
    rawResponse?: unknown,
    transform?: (data: TData | undefined, rawResponse?: unknown) => TTransformed,
): TTransformed => {
    if (transform) return transform(data, rawResponse);
    return data as unknown as TTransformed;
};
