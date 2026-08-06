import { fetchAPI } from "@/lib/auth";
import { queryOptions, useQuery } from "@tanstack/react-query";

export type QuestionType = "mcq" | "T OR F";

export type GradingMode = "all_or_nothing" | "partial_credit";

export type QuizAnswer = {
    id: number;
    text: string;
    is_correct: boolean;
    points?: number;
};

export type QuizQuestion = {
    id: number;
    text: string;
    type: QuestionType;
    position: number;
    points: number;
    grading_mode: GradingMode;
    penalty_per_wrong: number;
    allow_multiple_answers: boolean;
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

export type QuizAccessUser = {
    id: number;
    username: string;
    email: string;
};

export type QuizAccessEntry = {
    quiz_id: number;
    user_id: number;
    user: QuizAccessUser;
    granted_at: string;
    granted_by: number;
};

export type QuizDetail = {
    id: number;
    title: string;
    description: string;
    visibility: "public" | "private" | "public_with_link";
    pass_threshold: number;
    owner_id: number;
    questions: QuizQuestion[];
    attempts_count: number;
    allow_negative_score: boolean;
    pass_rate?: number;
    attempts_summary?: AttemptSummary[];
    quiz_access?: QuizAccessEntry[];
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
