import { useMutation, useQueryClient } from "@tanstack/react-query";
import { errorToast } from "@/lib/utils";
import { toast } from "sonner";
import { fetchAPI, setAccessToken } from "@/lib/auth";
import { currentUserQueryOptions } from "@/hooks/useCurrentUser";

export function useLoginMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userData: { email: string; password: string }) =>
            fetchAPI(
                "/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(userData),
                    credentials: "include",
                },
                true,
            ),
        onSuccess: async (data: { access_token: string }) => {
            setAccessToken(data.access_token);
            await queryClient.cancelQueries({
                queryKey: currentUserQueryOptions.queryKey,
            });
            await queryClient.invalidateQueries({
                queryKey: currentUserQueryOptions.queryKey,
            });
            toast.success("Logged in successfully!");
        },
        onError: (error: Error) => {
            errorToast(error.message);
        },
    });
}
