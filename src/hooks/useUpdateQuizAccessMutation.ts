import { useMutation, useQueryClient } from "@tanstack/react-query";
import { errorToast } from "@/lib/utils";
import { toast } from "sonner";
import { fetchAPI } from "@/lib/auth";
import { quizQueryOptions } from "@/hooks/useQuiz";

export type UpdateQuizAccessResponse = {
    quiz_id: number;
    granted_user_ids: number[];
    revoked_user_ids: number[];
};

export function useUpdateQuizAccessMutation(quizId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: {
            grant_users: string[];
            revoke_users: string[];
        }): Promise<UpdateQuizAccessResponse> =>
            fetchAPI(`/quizzes/${quizId}/update-access`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            }),
        onSuccess: async () => {
            toast.success("Access updated!");
            await queryClient.invalidateQueries({
                queryKey: quizQueryOptions(quizId).queryKey,
            });
        },
        onError: (error: Error) => {
            errorToast(error.message);
        },
    });
}
