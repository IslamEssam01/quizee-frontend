import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useQuizzes } from "@/hooks/useQuizzes";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const QUIZZES_PER_PAGE = 6;

export const Route = createFileRoute("/")({
    component: RouteComponent,
});

function RouteComponent() {
    const { currentUser } = useCurrentUser();
    const [page, setPage] = useState(1);
    const { quizzes, total, isPending } = useQuizzes(
        (page - 1) * QUIZZES_PER_PAGE,
        QUIZZES_PER_PAGE,
    );

    const pageCount = Math.ceil(total / QUIZZES_PER_PAGE);
    const rangeStart = total === 0 ? 0 : (page - 1) * QUIZZES_PER_PAGE + 1;
    const rangeEnd = Math.min(page * QUIZZES_PER_PAGE, total);

    return (
        <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-10 sm:px-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-semibold text-foreground">
                    Browse quizzes
                </h1>
                <span className="text-sm text-muted-foreground">
                    Pick a quiz and test your knowledge. No account needed to
                    take a quiz.
                </span>
            </div>

            {isPending ? (
                <div className="flex w-full justify-center py-10">
                    <Spinner className="size-6" />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {quizzes?.map((quiz) => (
                        <Card key={quiz.id} className="w-full">
                            <CardHeader>
                                <CardTitle className="text-base">
                                    {quiz.title}
                                </CardTitle>
                                <span className="text-sm text-muted-foreground">
                                    {quiz.description}
                                </span>
                            </CardHeader>
                            <CardContent className="flex items-center justify-between">
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <span>
                                        <span className="font-semibold text-foreground">
                                            {quiz.questions.length}
                                        </span>{" "}
                                        questions
                                    </span>
                                    <span>
                                        <span className="font-semibold text-foreground">
                                            0
                                        </span>{" "}
                                        attempts
                                    </span>
                                </div>
                                <Button variant="default">Take quiz</Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {!isPending && pageCount > 1 && (
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                        {rangeStart}-{rangeEnd} of {total}
                    </span>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-muted-foreground hover:bg-muted hover:text-foreground"
                            disabled={page === 1}
                            onClick={() => setPage((prev) => prev - 1)}
                        >
                            <ChevronLeft />
                        </Button>
                        {Array.from({ length: pageCount }, (_, i) => i + 1).map(
                            (pageNumber) => (
                                <Button
                                    key={pageNumber}
                                    variant={
                                        pageNumber === page
                                            ? "default"
                                            : "ghost"
                                    }
                                    size="icon-sm"
                                    className={cn(
                                        pageNumber !== page &&
                                            "text-muted-foreground hover:bg-muted hover:text-foreground",
                                    )}
                                    onClick={() => setPage(pageNumber)}
                                >
                                    {pageNumber}
                                </Button>
                            ),
                        )}
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-muted-foreground hover:bg-muted hover:text-foreground"
                            disabled={page === pageCount}
                            onClick={() => setPage((prev) => prev + 1)}
                        >
                            <ChevronRight />
                        </Button>
                    </div>
                </div>
            )}

            {!currentUser && (
                <>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                            Want to create your own quizzes?
                        </span>
                        <div className="flex items-center gap-2">
                            <Link to="/login">
                                <Button variant="outline">Sign in</Button>
                            </Link>
                            <Link to="/register">
                                <Button variant="default">
                                    Create account
                                </Button>
                            </Link>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
