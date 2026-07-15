import { useMutation } from "@tanstack/react-query";
import { errorToast } from "@/lib/utils";
import { toast } from "sonner";
import { fetchAPI } from "@/lib/auth";

export function useChangePasswordMutation() {
    return useMutation({
        mutationFn: (userData: {
            current_password: string;
            new_password: string;
            logout_all_sessions: boolean;
        }) =>
            fetchAPI(`/users/me/password`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData),
            }),
        onSuccess: () => {
            toast.success("Password changed successfully!");
        },
        onError: (error: Error) => {
            errorToast(error.message);
        },
    });
}
