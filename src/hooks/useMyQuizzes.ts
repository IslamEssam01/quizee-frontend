import { fetchAPI } from "@/lib/auth";
import { queryOptions, useQuery } from "@tanstack/react-query";
import type { Quiz } from "@/hooks/useQuizzes";

type PaginatedQuizzes = {
    quizzes: Quiz[];
    skip: number;
    limit: number;
    total: number;
    has_more: boolean;
};

export function myQuizzesQueryOptions(skip: number, limit: number) {
    return queryOptions({
        queryKey: ["myQuizzes", skip, limit],
        queryFn: (): Promise<PaginatedQuizzes> =>
            fetchAPI(`/users/me/quizzes?skip=${skip}&limit=${limit}`),
        staleTime: 60 * 1000,
    });
}

export function useMyQuizzes(skip: number, limit: number) {
    const { data, isPending, isError } = useQuery(
        myQuizzesQueryOptions(skip, limit),
    );

    return {
        quizzes: data?.quizzes,
        total: data?.total ?? 0,
        isPending,
        isError,
    };
}
