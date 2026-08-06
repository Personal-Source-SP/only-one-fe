/**
 * Normalizes a resource name by removing API version prefix (e.g., v1/)
 * and converting kebab-case/snake_case to camelCase.
 *
 * @param resource - The resource string to normalize.
 * @returns The normalized resource key.
 */
export const normalizeResourceKey = (resource?: string): string => {
    if (!resource) return '';
    return resource.replace(/^(v\d+\/)/, '').replace(/[-_]([a-z])/g, (_, g) => g.toUpperCase());
};
