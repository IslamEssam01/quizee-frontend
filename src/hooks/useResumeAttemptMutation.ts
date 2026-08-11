import { useMutation } from "@tanstack/react-query";
import { errorToast } from "@/lib/utils";
import { fetchAPI } from "@/lib/auth";
import type { AttemptResponse } from "@/hooks/useAttempt";

export function useResumeAttemptMutation() {
    return useMutation({
        mutationFn: (attemptId: number): Promise<AttemptResponse> =>
            fetchAPI(`/quizzes/attempts/resume/${attemptId}`, {
                method: "POST",
            }),
        onError: (error: Error) => {
            errorToast(error.message);
        },
    });
}
