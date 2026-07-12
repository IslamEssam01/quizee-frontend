import Header from "@/components/header";
import { Toaster } from "@/components/ui/sonner";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

const RootLayout = () => (
    <>
        <div className="h-dvh w-dvw bg-background font-sans">
            <Header />
            <Outlet />
        </div>
        <TanStackRouterDevtools />
        <Toaster position="top-center" duration={1000} />
    </>
);

export const Route = createRootRoute({ component: RootLayout });
