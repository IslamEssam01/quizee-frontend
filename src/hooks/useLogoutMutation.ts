import { clearAccessToken, fetchAPI } from "@/lib/auth";
import { errorToast } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { currentUserQueryOptions } from "@/hooks/useCurrentUser";

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
        onSuccess: async () => {
            clearAccessToken();
            await queryClient.cancelQueries({
                queryKey: currentUserQueryOptions.queryKey,
            });
            queryClient.setQueryData(currentUserQueryOptions.queryKey, null);
            await queryClient.invalidateQueries({
                queryKey: currentUserQueryOptions.queryKey,
            });
            toast.success("Logged out successfully!");
        },
        onError: (error: Error) => {
            errorToast(error.message);
        },
    });
}
