import type { GradingMode, QuestionType } from "@/hooks/useQuiz";

export type AttemptQuestionOption = {
    id: number;
    text: string;
    points?: number;
};

export type AttemptQuestion = {
    id: number;
    text: string;
    type: QuestionType;
    position: number;
    points: number;
    grading_mode: GradingMode;
    penalty_per_wrong: number;
    allow_multiple_answers: boolean;
    answers: AttemptQuestionOption[];
};

export type AttemptQuiz = {
    id: number;
    title: string;
    description: string;
    visibility: string;
    pass_threshold: number;
    owner_id: number;
    allow_negative_score: boolean;
    questions: AttemptQuestion[];
};

export type StartAttemptResponse = {
    id: number;
    quiz: AttemptQuiz;
};

export type ReviewAnswer = {
    id: number;
    text: string;
    is_correct: boolean;
    points?: number;
};

export type ReviewQuestion = {
    id: number;
    text: string;
    type: QuestionType;
    position: number;
    points: number;
    grading_mode: GradingMode;
    penalty_per_wrong: number;
    allow_multiple_answers: boolean;
    answers: ReviewAnswer[];
};

export type SubmitAttemptResponse = {
    id: number;
    quiz_id: number;
    user_id: number | null;
    taker_name: string | null;
    started_at: string;
    taken_at: string;
    quiz_json: {
        id: number;
        title: string;
        description: string;
        visibility: string;
        pass_threshold: number;
        owner_id: number;
        allow_negative_score: boolean;
        questions: ReviewQuestion[];
    };
    answers_json:
        | { question_id: number; answer_id?: number; answer_ids?: number[] }[]
        | null;
    score: number;
    passed: boolean;
};
