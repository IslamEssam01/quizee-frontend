import { useMutation } from "@tanstack/react-query";
import { errorToast } from "@/lib/utils";
import { fetchAPI } from "@/lib/auth";
import type { StartAttemptResponse } from "@/hooks/useAttempt";

export function useStartAttemptMutation(quizId: number) {
    return useMutation({
        mutationFn: (takerName?: string): Promise<StartAttemptResponse> =>
            fetchAPI(`/quizzes/${quizId}/attempts`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(
                    takerName ? { taker_name: takerName } : {},
                ),
            }),
        onError: (error: Error) => {
            errorToast(error.message);
        },
    });
}
