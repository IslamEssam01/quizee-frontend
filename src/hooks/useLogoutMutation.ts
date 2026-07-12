import { clearAccessToken, fetchAPI } from "@/lib/auth";
import { errorToast } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useLogoutMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () =>
            fetchAPI(
                "/auth/logout",
                {
                    method: "POST",
                    credentials: "include",
                },
                true,
            ),
        onSuccess: () => {
            clearAccessToken();
            queryClient.removeQueries({ queryKey: ["currentUser"] });
            toast.success("Logged out successfully!");
        },
        onError: (error: Error) => {
            errorToast(error.message);
        },
    });
}
