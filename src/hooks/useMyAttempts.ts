import { fetchAPI } from "@/lib/auth";
import { queryOptions, useQuery } from "@tanstack/react-query";
import type { PaginatedUserAttemptResponse } from "@/hooks/useAttempt";

export function myAttemptsQueryOptions(skip: number, limit: number) {
    return queryOptions({
        queryKey: ["myAttempts", skip, limit],
        queryFn: (): Promise<PaginatedUserAttemptResponse> =>
            fetchAPI(`/users/me/attempts?skip=${skip}&limit=${limit}`),
        staleTime: 60 * 1000,
    });
}

export function useMyAttempts(skip: number, limit: number) {
    const { data, isPending, isError } = useQuery(
        myAttemptsQueryOptions(skip, limit),
    );

    return {
        attempts: data?.attempts,
        total: data?.total ?? 0,
        isPending,
        isError,
    };
}
