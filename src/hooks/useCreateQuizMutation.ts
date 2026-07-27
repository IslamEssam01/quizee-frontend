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
            questions: QuizQuestion[];
        }): Promise<{ id: number }> =>
            fetchAPI("/quizzes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ ...quizData, visibility: "public" }),
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
