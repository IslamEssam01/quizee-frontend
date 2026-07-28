import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/pagination";
import { Spinner } from "@/components/ui/spinner";
import {
    currentUserQueryOptions,
    useCurrentUser,
} from "@/hooks/useCurrentUser";
import { useMyQuizzes } from "@/hooks/useMyQuizzes";
import { queryClient } from "@/lib/queryClient";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Pencil, Plus } from "lucide-react";
import { useState } from "react";

const QUIZZES_PER_PAGE = 5;

export const Route = createFileRoute("/my-quizzes")({
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
    const [page, setPage] = useState(1);
    const { quizzes, total, isPending } = useMyQuizzes(
        (page - 1) * QUIZZES_PER_PAGE,
        QUIZZES_PER_PAGE,
    );

    const pageCount = Math.ceil(total / QUIZZES_PER_PAGE);
    const rangeStart = total === 0 ? 0 : (page - 1) * QUIZZES_PER_PAGE + 1;
    const rangeEnd = Math.min(page * QUIZZES_PER_PAGE, total);

    if (!currentUser) {
        return null;
    }

    return (
        <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-10 sm:px-6">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-semibold text-foreground">
                        My Quizzes
                    </h1>
                    <span className="text-sm text-muted-foreground">
                        {total} {total === 1 ? "quiz" : "quizzes"}
                    </span>
                </div>
                <Link to="/quizzes/create">
                    <Button variant="default">
                        <Plus data-icon="inline-start" />
                        Create quiz
                    </Button>
                </Link>
            </div>

            {isPending ? (
                <div className="flex w-full justify-center py-10">
                    <Spinner className="size-6" />
                </div>
            ) : (
                <div className="divide-y divide-border overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
                    {quizzes?.map((quiz) => (
                        <div
                            key={quiz.id}
                            className="group relative flex items-start justify-between gap-4 px-4 py-4 hover:bg-muted/50 sm:items-center"
                        >
                            <Link
                                to="/quizzes/$quizId"
                                params={{ quizId: String(quiz.id) }}
                                className="absolute inset-0"
                            >
                                <span className="sr-only">{quiz.title}</span>
                            </Link>
                            <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-6">
                                <div className="flex min-w-0 flex-col gap-1 sm:flex-1">
                                    <span className="text-base font-semibold text-foreground group-hover:text-primary">
                                        {quiz.title}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        {quiz.description}
                                    </span>
                                </div>
                                <div className="ml-auto self-end flex shrink-0 items-center gap-4 sm:self-auto sm:ml-0">
                                    <div className="flex items-baseline gap-1 text-sm text-muted-foreground">
                                        <span className="font-semibold text-foreground">
                                            {quiz.questions.length}
                                        </span>
                                        questions
                                    </div>
                                    <div className="flex items-baseline gap-1 text-sm text-muted-foreground">
                                        <span className="font-semibold text-foreground">
                                            {quiz.attempts_count}
                                        </span>
                                        attempts
                                    </div>
                                </div>
                            </div>
                            <Link
                                to="/quizzes/$quizId/edit"
                                params={{ quizId: String(quiz.id) }}
                                className="relative z-10 shrink-0"
                            >
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    className="text-muted-foreground hover:bg-muted hover:text-foreground"
                                >
                                    <Pencil />
                                </Button>
                            </Link>
                        </div>
                    ))}
                </div>
            )}

            {!isPending && pageCount > 1 && (
                <Pagination
                    page={page}
                    pageCount={pageCount}
                    rangeStart={rangeStart}
                    rangeEnd={rangeEnd}
                    total={total}
                    onPageChange={setPage}
                />
            )}
        </div>
    );
}
