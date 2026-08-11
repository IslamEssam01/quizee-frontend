import { z } from "zod";

export const quizAnswerSchema = z.object({
    text: z.string(),
    is_correct: z.boolean(),
    points: z.number().gt(0).optional(),
});

export const quizQuestionSchema = z
    .object({
        text: z.string(),
        type: z.enum(["mcq", "T OR F"]),
        points: z.number().gt(0).default(1),
        grading_mode: z
            .enum(["all_or_nothing", "partial_credit"])
            .default("all_or_nothing"),
        penalty_per_wrong: z.number().gte(0).default(0),
        allow_multiple_answers: z.boolean().default(false),
        answers: z.array(quizAnswerSchema).min(2),
    })
    .refine(
        (question) => {
            const totalAnswerPoints = question.answers.reduce(
                (sum, a) => sum + (a.points ?? 0),
                0,
            );
            return totalAnswerPoints === 0 || totalAnswerPoints === question.points;
        },
        {
            message:
                "Sum of answer points must be 0 (unset) or equal the question's points",
            path: ["answers"],
        },
    );

export const quizPayloadSchema = z.object({
    title: z.string(),
    description: z.string(),
    pass_threshold: z.number().min(1).max(100),
    allow_negative_score: z.boolean().default(true),
    grade_tiers: z.record(z.string().max(20), z.number().min(0).max(100)).nullable().optional(),
    randomize_questions: z.boolean().default(false),
    randomize_answers: z.boolean().default(false),
    questions: z.array(quizQuestionSchema).min(1),
});

export type QuizJsonPayload = z.infer<typeof quizPayloadSchema>;

export const quizJsonSchema = quizPayloadSchema.toJSONSchema();
