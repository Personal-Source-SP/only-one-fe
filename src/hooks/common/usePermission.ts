import { useGetIdentity } from '@refinedev/core';
import fromPairs from 'lodash/fromPairs';
import map from 'lodash/map';
import some from 'lodash/some';
import { useCallback, useMemo } from 'react';
import type { CurrentUserIdentity } from './useHasRole';

export const usePermission = () => {
    const { data: currentUser, isLoading } = useGetIdentity<CurrentUserIdentity>();

    const rights = useMemo(() => new Set(currentUser?.rights ?? []), [currentUser?.rights]);

    const can = useCallback(
        (group: string, action: string): boolean => rights.has(`${group}_${action}`),
        [rights],
    );

    const canMap = useCallback(
        <TAction extends string>(
            group: string,
            actions: readonly TAction[],
        ): Record<TAction, boolean> =>
            fromPairs(
                map(actions, (action) => [action, rights.has(`${group}_${action}`)]),
            ) as Record<TAction, boolean>,
        [rights],
    );

    const canAny = useCallback(
        (...checks: Array<[string, string]>): boolean =>
            some(checks, ([group, action]) => can(group, action)),
        [can],
    );

    return { can, canAny, canMap, isLoading };
};
