import { useMutation, useQueryClient } from "@tanstack/react-query";
import { errorToast } from "@/lib/utils";
import { toast } from "sonner";
import { fetchAPI } from "@/lib/auth";
import type { QuizDetail } from "@/hooks/useQuiz";

export function useDuplicateQuizMutation(quizId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (): Promise<QuizDetail> =>
            fetchAPI(`/quizzes/${quizId}/duplicate`, {
                method: "POST",
            }),
        onSuccess: async () => {
            toast.success("Quiz duplicated successfully!");
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
