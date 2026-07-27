import { fetchAPI } from "@/lib/auth";
import { queryOptions, useQuery } from "@tanstack/react-query";

export type QuizDetail = {
    id: number;
    title: string;
    description: string;
    visibility: string;
    pass_threshold: number;
    owner_id: number;
    questions: unknown[];
};

export function quizQueryOptions(quizId: number) {
    return queryOptions({
        queryKey: ["quiz", quizId],
        queryFn: (): Promise<QuizDetail> => fetchAPI(`/quizzes/${quizId}`),
    });
}

export function useQuiz(quizId: number) {
    const { data, isPending, isError } = useQuery(quizQueryOptions(quizId));

    return {
        quiz: data,
        isPending,
        isError,
    };
}
