import {
    currentUserQueryOptions,
    useCurrentUser,
} from "@/hooks/useCurrentUser";
import { queryClient } from "@/lib/queryClient";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
    loader: async () => {
        try {
            return await queryClient.ensureQueryData(currentUserQueryOptions);
        } catch {
            throw redirect({ to: "/login" });
        }
    },
    component: RouteComponent,
});

function RouteComponent() {
    const { currentUser } = useCurrentUser();
    if (!currentUser) {
        return null;
    }
    return <div>Hello {currentUser.username}!</div>;
}
