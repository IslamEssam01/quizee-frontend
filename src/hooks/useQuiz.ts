import { fetchAPI } from "@/lib/auth";
import { queryOptions, useQuery } from "@tanstack/react-query";

export type QuestionType = "mcq" | "T OR F";

export type QuizAnswer = {
    id: number;
    text: string;
    is_correct: boolean;
};

export type QuizQuestion = {
    id: number;
    text: string;
    type: QuestionType;
    position: number;
    answers: QuizAnswer[];
};

export type AttemptSummary = {
    id: number;
    user_id: number | null;
    taker_name: string | null;
    started_at: string;
    taken_at: string | null;
    score: number | null;
    passed: boolean | null;
};

export type QuizDetail = {
    id: number;
    title: string;
    description: string;
    visibility: string;
    pass_threshold: number;
    owner_id: number;
    questions: QuizQuestion[];
    attempts_count: number;
    pass_rate?: number;
    attempts_summary?: AttemptSummary[];
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
