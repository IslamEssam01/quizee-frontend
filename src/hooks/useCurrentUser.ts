import { fetchAPI } from "@/lib/auth";
import { queryOptions, useQuery } from "@tanstack/react-query";

export const currentUserQueryOptions = queryOptions({
    queryKey: ["currentUser"],
    queryFn: () => fetchAPI("/users/me"),
    retry: false,
});

export function useCurrentUser() {
    const { data, isPending, isError } = useQuery(currentUserQueryOptions);

    return {
        currentUser: data,
        isPending,
        isError,
    };
}
