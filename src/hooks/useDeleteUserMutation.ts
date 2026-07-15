import { useMutation, useQueryClient } from "@tanstack/react-query";
import { errorToast } from "@/lib/utils";
import { toast } from "sonner";
import { clearAccessToken, fetchAPI } from "@/lib/auth";
import { useCurrentUser } from "./useCurrentUser";
import { useNavigate } from "@tanstack/react-router";

export function useDeleteUserMutation() {
    const { currentUser } = useCurrentUser();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    return useMutation({
        mutationFn: () =>
            fetchAPI(`/users/${currentUser.id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            }),
        onSuccess: () => {
            toast.success("User deleted successfully!");
            clearAccessToken();
            queryClient.removeQueries({ queryKey: ["currentUser"] });
            navigate({ to: "/" });
        },
        onError: (error: Error) => {
            errorToast(error.message);
        },
    });
}
