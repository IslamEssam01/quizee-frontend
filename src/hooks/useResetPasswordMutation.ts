import { fetchAPI } from "@/lib/auth";
import { errorToast } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function useResetPasswordMutation() {
    return useMutation({
        mutationFn: (userData: { token: string; new_password: string }) =>
            fetchAPI(
                "/auth/reset-password",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(userData),
                },
                true,
            ),
        onSuccess: (data: { message: string }) => {
            toast.success(data.message);
        },
        onError: (error: Error) => {
            errorToast(error.message);
        },
    });
}
