import { useMutation } from "@tanstack/react-query";
import { errorToast } from "@/lib/utils";
import { fetchAPI } from "@/lib/auth";
import type { SubmitAttemptResponse } from "@/hooks/useAttempt";

export function useSubmitAttemptMutation() {
    return useMutation({
        mutationFn: ({
            attemptId,
            answers,
        }: {
            attemptId: number;
            answers: { question_id: number; answer_id: number }[];
        }): Promise<SubmitAttemptResponse> =>
            fetchAPI(`/quizzes/submit-attempt/${attemptId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ answers }),
            }),
        onError: (error: Error) => {
            errorToast(error.message);
        },
    });
}
