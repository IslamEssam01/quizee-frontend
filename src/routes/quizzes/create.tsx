import { Button } from "@/components/ui/button";
import { QuizForm } from "@/components/quizForm";
import {
    currentUserQueryOptions,
    useCurrentUser,
} from "@/hooks/useCurrentUser";
import { useCreateQuizMutation } from "@/hooks/useCreateQuizMutation";
import { queryClient } from "@/lib/queryClient";
import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/quizzes/create")({
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
    const createQuizMutation = useCreateQuizMutation();
    const navigate = useNavigate();

    if (!currentUser) {
        return null;
    }

    return (
        <div className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-10 sm:px-6">
            <div className="flex items-center gap-2">
                <Link to="/my-quizzes">
                    <Button
                        variant="ghost"
                        size="icon-lg"
                        className="text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                        <ChevronLeft />
                    </Button>
                </Link>
                <span className="text-xl font-semibold text-foreground">
                    Create quiz
                </span>
            </div>

            <QuizForm
                isPending={createQuizMutation.isPending}
                submitLabel="Save & get link"
                onSubmit={(payload) => {
                    createQuizMutation.mutate(payload, {
                        onSuccess: (quiz) => {
                            navigate({
                                to: "/quizzes/$quizId",
                                params: { quizId: String(quiz.id) },
                            });
                        },
                    });
                }}
            />
        </div>
    );
}
