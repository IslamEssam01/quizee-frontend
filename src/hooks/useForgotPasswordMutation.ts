import { fetchAPI } from "@/lib/auth";
import { errorToast } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function useForgotPasswordMutation() {
    return useMutation({
        mutationFn: (userData: { email: string }) =>
            fetchAPI(
                "/auth/forgot-password",
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
