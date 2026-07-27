import { fetchAPI } from "@/lib/auth";
import { queryOptions, useQuery } from "@tanstack/react-query";

export type Quiz = {
    id: number;
    title: string;
    description: string;
    pass_threshold: number;
    questions: unknown[];
};

type PaginatedQuizzes = {
    quizzes: Quiz[];
    skip: number;
    limit: number;
    total: number;
    has_more: boolean;
};

export function quizzesQueryOptions(skip: number, limit: number) {
    return queryOptions({
        queryKey: ["quizzes", skip, limit],
        queryFn: (): Promise<PaginatedQuizzes> =>
            fetchAPI(`/quizzes?skip=${skip}&limit=${limit}`, undefined, true),
        staleTime: 60 * 1000,
    });
}

export function useQuizzes(skip: number, limit: number) {
    const { data, isPending, isError } = useQuery(
        quizzesQueryOptions(skip, limit),
    );

    return {
        quizzes: data?.quizzes,
        total: data?.total ?? 0,
        isPending,
        isError,
    };
}
