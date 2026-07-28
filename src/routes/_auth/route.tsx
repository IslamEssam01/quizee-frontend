import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-8 px-4 pt-16 sm:pt-40">
            <Outlet />
        </div>
    );
}
