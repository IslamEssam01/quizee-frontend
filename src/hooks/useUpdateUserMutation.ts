import { useMutation, useQueryClient } from "@tanstack/react-query";
import { errorToast } from "@/lib/utils";
import { toast } from "sonner";
import { fetchAPI } from "@/lib/auth";
import { currentUserQueryOptions, useCurrentUser } from "./useCurrentUser";

export function useUpdateUserMutation() {
    const { currentUser } = useCurrentUser();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userData: { username: string; email: string }) =>
            fetchAPI(`/users/${currentUser.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData),
            }),
        onSuccess: () => {
            toast.success("User updated successfully!");
            queryClient.invalidateQueries({
                queryKey: currentUserQueryOptions.queryKey,
            });
        },
        onError: (error: Error) => {
            errorToast(error.message);
        },
    });
}
