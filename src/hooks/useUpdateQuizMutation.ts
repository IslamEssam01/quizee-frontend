import { useMutation, useQueryClient } from "@tanstack/react-query";
import { errorToast } from "@/lib/utils";
import { toast } from "sonner";
import { fetchAPI } from "@/lib/auth";
import { quizQueryOptions, type QuizQuestion } from "@/hooks/useQuiz";

export function useUpdateQuizMutation(quizId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (quizData: {
            title: string;
            description: string;
            pass_threshold: number;
            questions: QuizQuestion[];
        }) =>
            fetchAPI(`/quizzes/${quizId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(quizData),
            }),
        onSuccess: async () => {
            toast.success("Quiz updated successfully!");
            await queryClient.invalidateQueries({
                queryKey: quizQueryOptions(quizId).queryKey,
            });
            await queryClient.invalidateQueries({
                queryKey: ["myQuizzes"],
            });
        },
        onError: (error: Error) => {
            errorToast(error.message);
        },
    });
}
