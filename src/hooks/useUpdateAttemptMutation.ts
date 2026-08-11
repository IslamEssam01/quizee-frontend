import { useMutation } from "@tanstack/react-query";
import { fetchAPI } from "@/lib/auth";
import type {
    AttemptAnswerPayload,
    UpdateAttemptResponse,
} from "@/hooks/useAttempt";

export function useUpdateAttemptMutation() {
    return useMutation({
        mutationFn: ({
            attemptId,
            answers,
        }: {
            attemptId: number;
            answers?: AttemptAnswerPayload[];
        }): Promise<UpdateAttemptResponse> =>
            fetchAPI(`/quizzes/attempts/${attemptId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: answers ? JSON.stringify({ answers }) : undefined,
            }),
        // Silent autosave - no toast on success or failure so it doesn't
        // interrupt the user while they're taking the quiz.
    });
}
