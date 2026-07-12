import { useMutation } from "@tanstack/react-query";
import { errorToast } from "@/lib/utils";
import { toast } from "sonner";
import { fetchAPI, setAccessToken } from "@/lib/auth";

export function useLoginMutation() {
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
        onSuccess: (data: { access_token: string }) => {
            setAccessToken(data.access_token);
            toast.success("Logged in successfully!");
        },
        onError: (error: Error) => {
            errorToast(error.message);
        },
    });
}
