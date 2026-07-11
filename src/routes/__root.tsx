import Header from "@/components/header";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

const RootLayout = () => (
    <>
        <div className="h-dvh w-dvw bg-background font-sans">
            <Header />
            <Outlet />
        </div>
        <TanStackRouterDevtools />
    </>
);

export const Route = createRootRoute({ component: RootLayout });
