import { useMutation, useQueryClient } from "@tanstack/react-query";
import { errorToast } from "@/lib/utils";
import { toast } from "sonner";
import { fetchAPI } from "@/lib/auth";

export function useDeleteQuizMutation(quizId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () =>
            fetchAPI(`/quizzes/${quizId}`, {
                method: "DELETE",
            }),
        onSuccess: async () => {
            toast.success("Quiz deleted successfully!");
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
