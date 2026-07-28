import type { QuestionType } from "@/hooks/useQuiz";

export type AttemptQuestionOption = {
    id: number;
    text: string;
};

export type AttemptQuestion = {
    id: number;
    text: string;
    type: QuestionType;
    position: number;
    answers: AttemptQuestionOption[];
};

export type AttemptQuiz = {
    id: number;
    title: string;
    description: string;
    visibility: string;
    pass_threshold: number;
    owner_id: number;
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
};

export type ReviewQuestion = {
    id: number;
    text: string;
    type: QuestionType;
    position: number;
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
        questions: ReviewQuestion[];
    };
    answers_json: { question_id: number; answer_id: number }[] | null;
    score: number;
    passed: boolean;
};
