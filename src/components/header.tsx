import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useLogoutMutation } from "@/hooks/useLogoutMutation";

export default function Header() {
    const { theme, toggleTheme } = useTheme();
    const { currentUser } = useCurrentUser();
    const logoutMutation = useLogoutMutation();
    const navigate = useNavigate();
    return (
        <header className="h-14 border-b border-border">
            <div className="mx-auto flex h-full max-w-4xl items-center justify-between  px-4 sm:px-6">
                <Link
                    to="/"
                    className="text-base font-semibold text-foreground"
                >
                    Quizee
                </Link>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon-lg"
                        className="text-muted-foreground hover:text-foreground dark:hover:bg-muted"
                        onClick={toggleTheme}
                    >
                        {theme === "dark" ? <Sun /> : <Moon />}
                    </Button>
                    {currentUser && (
                        <Button
                            variant="ghost"
                            size="icon-lg"
                            className="text-muted-foreground hover:text-foreground dark:hover:bg-muted"
                            onClick={() =>
                                logoutMutation.mutate(undefined, {
                                    onSuccess: () => {
                                        navigate({ to: "/" });
                                    },
                                })
                            }
                        >
                            <LogOut />
                        </Button>
                    )}
                </div>
            </div>
        </header>
    );
}
