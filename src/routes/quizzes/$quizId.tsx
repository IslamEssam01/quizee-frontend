import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { InputField } from "@/components/inputField";
import { Spinner } from "@/components/ui/spinner";
import {
    currentUserQueryOptions,
    useCurrentUser,
} from "@/hooks/useCurrentUser";
import { useQuiz, type AttemptSummary } from "@/hooks/useQuiz";
import { totalPoints } from "@/lib/quizScoring";
import { useDeleteQuizMutation } from "@/hooks/useDeleteQuizMutation";
import { queryClient } from "@/lib/queryClient";
import { cn, errorToast } from "@/lib/utils";
import { toast } from "sonner";
import {
    createFileRoute,
    Link,
    redirect,
    useNavigate,
} from "@tanstack/react-router";
import {
    ChevronLeft,
    Copy,
    Eye,
    ExternalLink,
    Pencil,
    Trash2,
    X,
} from "lucide-react";
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useUpdateQuizVisibilityMutation } from "@/hooks/useUpdateQuizVisibilityMutation";
import { useUpdateQuizAccessMutation } from "@/hooks/useUpdateQuizAccessMutation";

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

function AccessCard({
    quizId,
    grantees,
}: {
    quizId: number;
    grantees: { user_id: number; user: { username: string; email: string } }[];
}) {
    const [pendingGrants, setPendingGrants] = useState<string[]>([]);
    const [pendingRevokes, setPendingRevokes] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState("");
    const updateAccessMutation = useUpdateQuizAccessMutation(quizId);

    const existingIdentifiers = new Set(
        grantees.flatMap((g) => [
            g.user.username.toLowerCase(),
            g.user.email.toLowerCase(),
        ]),
    );

    function addPendingGrant() {
        const trimmed = inputValue.trim();
        if (!trimmed) {
            return;
        }
        const lower = trimmed.toLowerCase();
        if (existingIdentifiers.has(lower)) {
            errorToast("This user already has access");
            return;
        }
        if (pendingGrants.some((g) => g.toLowerCase() === lower)) {
            errorToast("Already added");
            return;
        }
        setPendingGrants((prev) => [...prev, trimmed]);
        setInputValue("");
    }

    function removePendingGrant(identifier: string) {
        setPendingGrants((prev) => prev.filter((g) => g !== identifier));
    }

    function stageRevoke(username: string) {
        setPendingRevokes((prev) => [...prev, username]);
    }

    function unstageRevoke(username: string) {
        setPendingRevokes((prev) => prev.filter((r) => r !== username));
    }

    function save() {
        updateAccessMutation.mutate(
            {
                grant_users: pendingGrants,
                revoke_users: pendingRevokes,
            },
            {
                onSuccess: () => {
                    setPendingGrants([]);
                    setPendingRevokes([]);
                },
            },
        );
    }

    const hasPendingChanges =
        pendingGrants.length > 0 || pendingRevokes.length > 0;

    return (
        <Card>
            <CardContent className="flex flex-col gap-4">
                <span className="text-xs font-semibold text-muted-foreground uppercase">
                    Access
                </span>

                <div className="flex flex-col gap-2 sm:flex-row">
                    <InputField
                        placeholder="Username or email"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                addPendingGrant();
                            }
                        }}
                        className="flex-1 min-w-0"
                    />
                    <Button
                        type="button"
                        variant="outline"
                        onClick={addPendingGrant}
                    >
                        Add
                    </Button>
                </div>

                {pendingGrants.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {pendingGrants.map((identifier) => (
                            <span
                                key={identifier}
                                className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-500"
                            >
                                {identifier}
                                <button
                                    type="button"
                                    onClick={() =>
                                        removePendingGrant(identifier)
                                    }
                                    aria-label={`Remove ${identifier}`}
                                >
                                    <X className="size-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                )}

                <div className="flex flex-col gap-2">
                    {grantees.length === 0 ? (
                        <span className="text-sm text-muted-foreground">
                            No one has been granted access yet.
                        </span>
                    ) : (
                        grantees.map((grantee) => {
                            const isPendingRevoke = pendingRevokes.includes(
                                grantee.user.username,
                            );
                            return (
                                <div
                                    key={grantee.user_id}
                                    className={cn(
                                        "flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm",
                                        isPendingRevoke &&
                                            "opacity-50 line-through",
                                    )}
                                >
                                    <span className="text-foreground">
                                        {grantee.user.username} (
                                        {grantee.user.email})
                                    </span>
                                    {isPendingRevoke ? (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                unstageRevoke(
                                                    grantee.user.username,
                                                )
                                            }
                                        >
                                            Undo
                                        </Button>
                                    ) : (
                                        <button
                                            type="button"
                                            className="text-muted-foreground hover:text-destructive"
                                            onClick={() =>
                                                stageRevoke(
                                                    grantee.user.username,
                                                )
                                            }
                                            aria-label={`Revoke access for ${grantee.user.username}`}
                                        >
                                            <X className="size-4" />
                                        </button>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                <Button
                    type="button"
                    variant="default"
                    disabled={!hasPendingChanges || updateAccessMutation.isPending}
                    onClick={save}
                    className="self-start"
                >
                    Save access
                    {updateAccessMutation.isPending && (
                        <Spinner data-icon="inline-end" />
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}

function RouteComponent() {
    const { quizId } = Route.useParams();
    const { currentUser } = useCurrentUser();
    const { quiz, isPending } = useQuiz(Number(quizId));
    const deleteQuizMutation = useDeleteQuizMutation(Number(quizId));
    const updateVisibilityMutation = useUpdateQuizVisibilityMutation(
        Number(quizId),
    );
    const navigate = useNavigate();
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

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
    const totalScorePoints = totalPoints(quiz.questions);
    const attempts = quiz.attempts_summary ?? [];

    return (
        <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-10 sm:px-6">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-2">
                    <Link to="/my-quizzes">
                        <Button
                            variant="ghost"
                            size="icon-lg"
                            className="shrink-0 text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                            <ChevronLeft />
                        </Button>
                    </Link>
                    <div className="flex min-w-0 flex-col gap-1">
                        <h1 className="text-2xl font-semibold text-foreground">
                            {quiz.title}
                        </h1>
                        <span className="text-sm text-muted-foreground">
                            {quiz.description}
                        </span>
                    </div>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <Link to="/quizzes/$quizId/edit" params={{ quizId }}>
                        <Button variant="outline">
                            <Pencil data-icon="inline-start" />
                            Edit
                        </Button>
                    </Link>
                    <Link
                        to="/q/$quizId"
                        params={{ quizId }}
                        search={{ preview: true }}
                    >
                        <Button variant="default">
                            <Eye data-icon="inline-start" />
                            Preview
                        </Button>
                    </Link>
                    {isConfirmingDelete ? (
                        <>
                            <span className="text-sm text-muted-foreground">
                                Delete?
                            </span>
                            <Button
                                variant="destructive"
                                className="bg-destructive! text-white"
                                disabled={deleteQuizMutation.isPending}
                                onClick={() =>
                                    deleteQuizMutation.mutate(undefined, {
                                        onSuccess: () => {
                                            navigate({ to: "/my-quizzes" });
                                        },
                                    })
                                }
                            >
                                Yes, delete
                                {deleteQuizMutation.isPending && (
                                    <Spinner data-icon="inline-end" />
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                disabled={deleteQuizMutation.isPending}
                                onClick={() => setIsConfirmingDelete(false)}
                            >
                                Cancel
                            </Button>
                        </>
                    ) : (
                        <Button
                            variant="ghost"
                            size="icon-lg"
                            className="text-muted-foreground hover:bg-muted hover:text-foreground"
                            onClick={() => setIsConfirmingDelete(true)}
                        >
                            <Trash2 />
                        </Button>
                    )}
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
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <InputField
                            readOnly
                            disabled
                            value={shareableLink}
                            className="flex-1 min-w-0"
                        />
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="flex-1 sm:flex-none"
                                onClick={() => {
                                    navigator.clipboard.writeText(
                                        shareableLink,
                                    );
                                    toast.success("Link copied to clipboard!");
                                }}
                            >
                                <Copy data-icon="inline-start" />
                                Copy
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1 sm:flex-none"
                                onClick={() =>
                                    window.open(shareableLink, "_blank")
                                }
                            >
                                <ExternalLink data-icon="inline-start" />
                                Open
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {quiz.owner_id === currentUser.id && (
                <>
                    <Card>
                        <CardContent className="flex flex-col gap-3">
                            <span className="text-xs font-semibold text-muted-foreground uppercase">
                                Visibility
                            </span>
                            <RadioGroup
                                value={quiz.visibility}
                                onValueChange={(value) =>
                                    updateVisibilityMutation.mutate({
                                        visibility: value as
                                            | "public"
                                            | "private",
                                    })
                                }
                                className="flex items-center gap-4"
                            >
                                <label className="flex cursor-pointer items-center gap-2">
                                    <RadioGroupItem
                                        value="public"
                                        disabled={
                                            updateVisibilityMutation.isPending
                                        }
                                    />
                                    <span className="text-sm text-foreground">
                                        Public
                                    </span>
                                </label>
                                <label className="flex cursor-pointer items-center gap-2">
                                    <RadioGroupItem
                                        value="private"
                                        disabled={
                                            updateVisibilityMutation.isPending
                                        }
                                    />
                                    <span className="text-sm text-foreground">
                                        Private
                                    </span>
                                </label>
                            </RadioGroup>
                        </CardContent>
                    </Card>

                    {quiz.visibility === "private" && (
                        <AccessCard
                            key={quiz.id}
                            quizId={quiz.id}
                            grantees={quiz.quiz_access ?? []}
                        />
                    )}
                </>
            )}

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
                        <CardContent className="flex flex-col gap-0 p-0">
                            <div className="flex items-center justify-between border-b border-border px-4 py-3 text-sm font-medium text-muted-foreground">
                                <span className="flex-1">Status</span>
                                <span className="flex-1 text-center">
                                    Score
                                </span>
                                <span className="flex-1 text-right">
                                    Date
                                </span>
                            </div>
                            <div className="flex max-h-80 flex-col divide-y divide-border overflow-y-auto">
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
                                                    {totalScorePoints}{" "}
                                                    <span className="text-muted-foreground">
                                                        {totalScorePoints > 0
                                                            ? Math.round(
                                                                  (attempt.score /
                                                                      totalScorePoints) *
                                                                      100,
                                                              )
                                                            : 0}
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
                            </div>
                        </CardContent>
                    )}
                </Card>
            </div>
        </div>
    );
}
