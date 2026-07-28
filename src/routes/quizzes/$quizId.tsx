import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { InputField } from "@/components/inputField";
import { Spinner } from "@/components/ui/spinner";
import {
    currentUserQueryOptions,
    useCurrentUser,
} from "@/hooks/useCurrentUser";
import { useQuiz, type AttemptSummary } from "@/hooks/useQuiz";
import { queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ChevronLeft, Copy, Eye, ExternalLink, Pencil } from "lucide-react";

export const Route = createFileRoute("/quizzes/$quizId")({
    loader: async () => {
        try {
            return await queryClient.ensureQueryData(currentUserQueryOptions);
        } catch {
            throw redirect({ to: "/login" });
        }
    },
    component: RouteComponent,
});

function StatCard({
    value,
    label,
}: {
    value: string | number;
    label: string;
}) {
    return (
        <Card>
            <CardContent className="flex flex-col items-center gap-1 py-4">
                <span className="text-2xl font-semibold text-foreground">
                    {value}
                </span>
                <span className="text-sm text-muted-foreground">{label}</span>
            </CardContent>
        </Card>
    );
}

function formatDate(value: string) {
    return new Date(value).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function AttemptStatusBadge({ attempt }: { attempt: AttemptSummary }) {
    if (!attempt.taken_at) {
        return (
            <span className="w-fit rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                In progress
            </span>
        );
    }

    return (
        <span
            className={cn(
                "w-fit rounded-full px-2 py-0.5 text-xs font-medium",
                attempt.passed
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "bg-destructive/10 text-destructive",
            )}
        >
            {attempt.passed ? "Passed" : "Failed"}
        </span>
    );
}

function RouteComponent() {
    const { quizId } = Route.useParams();
    const { currentUser } = useCurrentUser();
    const { quiz, isPending } = useQuiz(Number(quizId));

    if (!currentUser) {
        return null;
    }

    if (isPending) {
        return (
            <div className="flex w-full justify-center py-20">
                <Spinner className="size-6" />
            </div>
        );
    }

    if (!quiz) {
        return null;
    }

    const shareableLink = `${window.location.origin}/q/${quiz.id}`;
    const totalQuestions = quiz.questions.length;
    const attempts = quiz.attempts_summary ?? [];

    return (
        <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-10 sm:px-6">
            <div className="flex items-center justify-between gap-4">
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
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-semibold text-foreground">
                            {quiz.title}
                        </h1>
                        <span className="text-sm text-muted-foreground">
                            {quiz.description}
                        </span>
                    </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                    <Link to="/quizzes/$quizId/edit" params={{ quizId }}>
                        <Button variant="outline">
                            <Pencil data-icon="inline-start" />
                            Edit
                        </Button>
                    </Link>
                    <Button variant="default">
                        <Eye data-icon="inline-start" />
                        Preview
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <StatCard value={totalQuestions} label="Questions" />
                <StatCard value={quiz.attempts_count} label="Attempts" />
                <StatCard
                    value={`${quiz.pass_threshold}%`}
                    label="Pass threshold"
                />
                <StatCard
                    value={
                        quiz.pass_rate !== undefined && quiz.attempts_count > 0
                            ? `${Math.round(quiz.pass_rate)}%`
                            : "—"
                    }
                    label="Pass rate"
                />
            </div>

            <Card>
                <CardContent className="flex flex-col gap-3">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">
                        Shareable link
                    </span>
                    <div className="flex items-center gap-2">
                        <InputField
                            readOnly
                            value={shareableLink}
                            className="flex-1"
                        />
                        <Button variant="outline">
                            <Copy data-icon="inline-start" />
                            Copy
                        </Button>
                        <Button variant="outline">
                            <ExternalLink data-icon="inline-start" />
                            Open
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="flex flex-col gap-3">
                <span className="text-xs font-semibold text-muted-foreground uppercase">
                    Attempts ({attempts.length})
                </span>
                <Card>
                    {attempts.length === 0 ? (
                        <CardContent className="flex items-center justify-center py-10 text-sm text-muted-foreground">
                            No attempts yet. Share the link to get started.
                        </CardContent>
                    ) : (
                        <CardContent className="flex flex-col gap-0 divide-y divide-border p-0">
                            <div className="flex items-center justify-between px-4 py-3 text-sm font-medium text-muted-foreground">
                                <span className="flex-1">Status</span>
                                <span className="flex-1 text-center">
                                    Score
                                </span>
                                <span className="flex-1 text-right">
                                    Date
                                </span>
                            </div>
                            {attempts.map((attempt) => (
                                <div
                                    key={attempt.id}
                                    className="flex items-center justify-between px-4 py-3 text-sm"
                                >
                                    <span className="flex-1">
                                        <AttemptStatusBadge
                                            attempt={attempt}
                                        />
                                    </span>
                                    <span className="flex-1 text-center text-foreground">
                                        {attempt.score !== null ? (
                                            <>
                                                {attempt.score}/
                                                {totalQuestions}{" "}
                                                <span className="text-muted-foreground">
                                                    {Math.round(
                                                        (attempt.score /
                                                            totalQuestions) *
                                                            100,
                                                    )}
                                                    %
                                                </span>
                                            </>
                                        ) : (
                                            <span className="text-muted-foreground">
                                                —
                                            </span>
                                        )}
                                    </span>
                                    <span className="flex-1 text-right text-muted-foreground">
                                        {formatDate(
                                            attempt.taken_at ??
                                                attempt.started_at,
                                        )}
                                    </span>
                                </div>
                            ))}
                        </CardContent>
                    )}
                </Card>
            </div>
        </div>
    );
}
