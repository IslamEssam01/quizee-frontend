import { useMutation, useQueryClient } from "@tanstack/react-query";
import { errorToast } from "@/lib/utils";
import { toast } from "sonner";
import { fetchAPI } from "@/lib/auth";
import type { QuizQuestion } from "@/hooks/useQuiz";

export function useCreateQuizMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (quizData: {
            title: string;
            description: string;
            pass_threshold: number;
            allow_negative_score: boolean;
            grade_tiers: Record<string, number> | null;
            randomize_questions: boolean;
            randomize_answers: boolean;
            questions: QuizQuestion[];
            visibility?: "public" | "private" | "public_with_link";
        }): Promise<{ id: number }> =>
            fetchAPI("/quizzes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...quizData,
                    visibility: quizData.visibility ?? "public",
                }),
            }),
        onSuccess: async () => {
            toast.success("Quiz created successfully!");
            await queryClient.invalidateQueries({
                queryKey: ["myQuizzes"],
            });
            await queryClient.invalidateQueries({
                queryKey: ["quizzes"],
            });
        },
        onError: (error: Error) => {
            errorToast(error.message);
        },
    });
}
