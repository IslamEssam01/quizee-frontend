import { useMutation, useQueryClient } from "@tanstack/react-query";
import { errorToast } from "@/lib/utils";
import { toast } from "sonner";
import { fetchAPI } from "@/lib/auth";
import { quizQueryOptions } from "@/hooks/useQuiz";

export function useUpdateQuizVisibilityMutation(quizId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: {
            visibility: "public" | "private" | "public_with_link";
        }) =>
            fetchAPI(`/quizzes/${quizId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            }),
        onSuccess: async () => {
            toast.success("Visibility updated!");
            await queryClient.invalidateQueries({
                queryKey: quizQueryOptions(quizId).queryKey,
            });
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
