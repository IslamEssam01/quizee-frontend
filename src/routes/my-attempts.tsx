import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/pagination";
import { Spinner } from "@/components/ui/spinner";
import { ResultsView } from "@/components/quizResultsView";
import {
    currentUserQueryOptions,
    useCurrentUser,
} from "@/hooks/useCurrentUser";
import { useMyAttempts } from "@/hooks/useMyAttempts";
import { useQuiz } from "@/hooks/useQuiz";
import { totalPoints } from "@/lib/quizScoring";
import { cn } from "@/lib/utils";
import { queryClient } from "@/lib/queryClient";
import type { UserAttempt } from "@/hooks/useAttempt";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState } from "react";

const ATTEMPTS_PER_PAGE = 5;

export const Route = createFileRoute("/my-attempts")({
    loader: async () => {
        try {
            return await queryClient.ensureQueryData(currentUserQueryOptions);
        } catch {
            throw redirect({ to: "/login" });
        }
    },
    component: RouteComponent,
});

function formatDate(value: string) {
    return new Date(value).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function AttemptStatusBadge({ attempt }: { attempt: UserAttempt }) {
    if (!attempt.taken_at) {
        return (
            <span className="w-fit rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-500">
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

function AttemptQuizTitle({ quizId }: { quizId: number }) {
    const { quiz, isPending } = useQuiz(quizId);
    if (isPending) {
        return (
            <span className="text-base font-semibold text-muted-foreground">
                Loading…
            </span>
        );
    }
    return (
        <span className="text-base font-semibold text-foreground">
            {quiz?.title ?? `Quiz #${quizId}`}
        </span>
    );
}

function AttemptRow({
    attempt,
    onViewResult,
}: {
    attempt: UserAttempt;
    onViewResult: (attempt: UserAttempt) => void;
}) {
    const isSubmitted = !!attempt.taken_at;

    return (
        <div className="flex items-center justify-between gap-4 px-4 py-4 hover:bg-muted/50 sm:items-center">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
                {attempt.quiz_json ? (
                    <span className="text-base font-semibold text-foreground">
                        {attempt.quiz_json.title}
                    </span>
                ) : (
                    <AttemptQuizTitle quizId={attempt.quiz_id} />
                )}
                <div className="flex items-center gap-3">
                    <AttemptStatusBadge attempt={attempt} />
                    <span className="text-sm text-muted-foreground">
                        {formatDate(attempt.taken_at ?? attempt.started_at)}
                    </span>
                    {isSubmitted && attempt.quiz_json && (
                        <span className="text-sm text-muted-foreground">
                            {attempt.score}/
                            {totalPoints(attempt.quiz_json.questions)}
                        </span>
                    )}
                </div>
            </div>
            {isSubmitted ? (
                <Button variant="outline" onClick={() => onViewResult(attempt)}>
                    View result
                </Button>
            ) : (
                <Link
                    to="/q/$quizId"
                    params={{ quizId: String(attempt.quiz_id) }}
                    search={{ attemptId: attempt.id }}
                >
                    <Button variant="default">Resume</Button>
                </Link>
            )}
        </div>
    );
}

function RouteComponent() {
    const { currentUser } = useCurrentUser();
    const [page, setPage] = useState(1);
    const [viewedAttempt, setViewedAttempt] = useState<UserAttempt | null>(
        null,
    );
    const { attempts, total, isPending } = useMyAttempts(
        (page - 1) * ATTEMPTS_PER_PAGE,
        ATTEMPTS_PER_PAGE,
    );

    const pageCount = Math.ceil(total / ATTEMPTS_PER_PAGE);
    const rangeStart = total === 0 ? 0 : (page - 1) * ATTEMPTS_PER_PAGE + 1;
    const rangeEnd = Math.min(page * ATTEMPTS_PER_PAGE, total);

    if (!currentUser) {
        return null;
    }

    if (
        viewedAttempt &&
        viewedAttempt.quiz_json &&
        viewedAttempt.score !== null &&
        viewedAttempt.passed !== null
    ) {
        const selections: Record<number, number[]> = {};
        for (const answer of viewedAttempt.answers_json ?? []) {
            selections[answer.question_id] =
                answer.answer_ids ??
                (answer.answer_id !== undefined ? [answer.answer_id] : []);
        }

        return (
            <ResultsView
                title={viewedAttempt.quiz_json.title}
                score={viewedAttempt.score}
                total={totalPoints(viewedAttempt.quiz_json.questions)}
                passThreshold={viewedAttempt.quiz_json.pass_threshold}
                passed={viewedAttempt.passed}
                questions={viewedAttempt.quiz_json.questions}
                selections={selections}
                onDone={() => setViewedAttempt(null)}
                doneLabel="Back to attempts"
            />
        );
    }

    return (
        <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-10 sm:px-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-semibold text-foreground">
                    My Attempts
                </h1>
                <span className="text-sm text-muted-foreground">
                    {total} {total === 1 ? "attempt" : "attempts"}
                </span>
            </div>

            {isPending ? (
                <div className="flex w-full justify-center py-10">
                    <Spinner className="size-6" />
                </div>
            ) : attempts?.length === 0 ? (
                <div className="flex w-full justify-center py-10 text-sm text-muted-foreground">
                    You haven't taken any quizzes yet.
                </div>
            ) : (
                <div className="divide-y divide-border overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
                    {attempts?.map((attempt) => (
                        <AttemptRow
                            key={attempt.id}
                            attempt={attempt}
                            onViewResult={setViewedAttempt}
                        />
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
