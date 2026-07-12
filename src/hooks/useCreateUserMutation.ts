import { useMutation } from "@tanstack/react-query";
import { errorToast, fetchAPI } from "@/lib/utils";
import { toast } from "sonner";

export function useCreateUserMutation() {
    return useMutation({
        mutationFn: (userData: {
            username: string;
            email: string;
            password: string;
        }) =>
            fetchAPI("/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData),
            }),
        onSuccess: () => {
            toast.success("User created successfully!");
        },
        onError: (error: Error) => {
            errorToast(error.message);
        },
    });
}
