import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export default function Header() {
    const { theme, toggleTheme } = useTheme();
    return (
        <header className="h-14 border-b border-border">
            <div className="mx-auto flex h-full max-w-4xl items-center justify-between  px-4 sm:px-6">
                <Link
                    to="/"
                    className="text-base font-semibold text-foreground"
                >
                    Quizee
                </Link>

                <Button
                    variant="ghost"
                    size="icon-lg"
                    className="text-muted-foreground hover:text-foreground dark:hover:bg-muted"
                    onClick={toggleTheme}
                >
                    {theme === "dark" ? <Sun /> : <Moon />}
                </Button>
            </div>
        </header>
    );
}
