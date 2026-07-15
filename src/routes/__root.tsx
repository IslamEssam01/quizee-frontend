import Header from "@/components/header";
import { Toaster } from "@/components/ui/sonner";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

const RootLayout = () => (
    <>
        <div className="flex h-dvh w-dvw flex-col overflow-hidden bg-background font-sans">
            <Header />
            <div className="flex-1 overflow-auto">
                <Outlet />
            </div>
        </div>
        <TanStackRouterDevtools />
        <Toaster position="top-center" duration={1500} />
    </>
);

export const Route = createRootRoute({ component: RootLayout });
