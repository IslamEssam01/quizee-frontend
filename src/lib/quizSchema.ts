import { z } from "zod";

export const quizAnswerSchema = z.object({
    text: z.string(),
    is_correct: z.boolean(),
});

export const quizQuestionSchema = z.object({
    text: z.string(),
    type: z.enum(["mcq", "T OR F"]),
    answers: z.array(quizAnswerSchema).min(2),
});

export const quizPayloadSchema = z.object({
    title: z.string(),
    description: z.string(),
    pass_threshold: z.number().min(1).max(100),
    questions: z.array(quizQuestionSchema).min(1),
});

export type QuizJsonPayload = z.infer<typeof quizPayloadSchema>;

// Use Zod v4's built-in toJSONSchema() method which works better with the current version
export const quizJsonSchema = quizPayloadSchema.toJSONSchema();
