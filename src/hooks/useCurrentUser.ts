import { fetchAPI } from "@/lib/auth";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

export const currentUserQueryOptions = queryOptions({
    queryKey: ["currentUser"],
    queryFn: () => fetchAPI("/users/me"),
    retry: false,
});

export function useCurrentUser() {
    const { data } = useSuspenseQuery(currentUserQueryOptions);

    return {
        currentUser: data,
    };
}
