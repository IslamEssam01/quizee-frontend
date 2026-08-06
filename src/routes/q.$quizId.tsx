import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { InputField } from "@/components/inputField";
import { Spinner } from "@/components/ui/spinner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useQuiz } from "@/hooks/useQuiz";
import { useStartAttemptMutation } from "@/hooks/useStartAttemptMutation";
import { useResumeAttemptMutation } from "@/hooks/useResumeAttemptMutation";
import { useUpdateAttemptMutation } from "@/hooks/useUpdateAttemptMutation";
import { useSubmitAttemptMutation } from "@/hooks/useSubmitAttemptMutation";
import type { AttemptAnswerPayload, AttemptQuestion } from "@/hooks/useAttempt";
import type { QuestionType } from "@/hooks/useQuiz";
import { cn } from "@/lib/utils";
import {
    calculateScore,
    isPassed,
    totalPoints,
} from "@/lib/quizScoring";
import { ResultsView } from "@/components/quizResultsView";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";

const takeQuizSearchSchema = z.object({
    preview: z.boolean().optional(),
    attemptId: z.number().optional(),
});

function buildAnswersPayload(
    selections: Record<number, number[]>,
    questions: AttemptQuestion[],
): AttemptAnswerPayload[] {
    return Object.entries(selections)
        .filter(([, ids]) => ids.length > 0)
        .map(([questionId, ids]) => {
            const question = questions.find(
                (q) => q.id === Number(questionId),
            );
            return question?.allow_multiple_answers
                ? { question_id: Number(questionId), answer_ids: ids }
                : { question_id: Number(questionId), answer_id: ids[0] };
        });
}

export const Route = createFileRoute("/q/$quizId")({
    component: RouteComponent,
    validateSearch: takeQuizSearchSchema,
});

type TakingOption = { id: number; text: string };
type TakingQuestion = {
    id: number;
    text: string;
    type: QuestionType;
    allow_multiple_answers: boolean;
    answers: TakingOption[];
};

function TakingView({
    title,
    description,
    questions,
    currentIndex,
    setCurrentIndex,
    selections,
    setSelections,
    onSubmit,
    isSubmitting,
}: {
    title: string;
    description: string;
    questions: TakingQuestion[];
    currentIndex: number;
    setCurrentIndex: (updater: (prev: number) => number) => void;
    selections: Record<number, number[]>;
    setSelections: (
        updater: (prev: Record<number, number[]>) => Record<number, number[]>,
    ) => void;
    onSubmit: () => void;
    isSubmitting: boolean;
}) {
    const totalQuestions = questions.length;
    const question = questions[currentIndex];
    const answeredCount = Object.values(selections).filter(
        (ids) => ids.length > 0,
    ).length;
    const isLastQuestion = currentIndex === totalQuestions - 1;

    return (
        <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10 sm:px-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-semibold text-foreground">
                    {title}
                </h1>
                <span className="text-sm text-muted-foreground">
                    {description}
                </span>
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                        {currentIndex + 1} / {totalQuestions}
                    </span>
                    <span>{answeredCount} answered</span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                    <div
                        className="h-full bg-primary transition-all"
                        style={{
                            width: `${((currentIndex + 1) / totalQuestions) * 100}%`,
                        }}
                    />
                </div>
            </div>

            <Card>
                <CardContent className="flex flex-col gap-4">
                    <p className="text-base font-medium text-foreground">
                        {question.text}
                    </p>
                    {question.allow_multiple_answers ? (
                        <div className="flex flex-col gap-3">
                            {question.answers.map((option) => {
                                const checked =
                                    selections[question.id]?.includes(
                                        option.id,
                                    ) ?? false;
                                return (
                                    <label
                                        key={option.id}
                                        className={cn(
                                            "flex cursor-pointer items-center gap-3 rounded-lg border border-border px-4 py-3",
                                            checked &&
                                                "border-primary bg-primary/5",
                                        )}
                                    >
                                        <Checkbox
                                            checked={checked}
                                            onCheckedChange={(next) =>
                                                setSelections((prev) => {
                                                    const current =
                                                        prev[question.id] ?? [];
                                                    const nextIds =
                                                        next === true
                                                            ? [
                                                                  ...current,
                                                                  option.id,
                                                              ]
                                                            : current.filter(
                                                                  (id) =>
                                                                      id !==
                                                                      option.id,
                                                              );
                                                    return {
                                                        ...prev,
                                                        [question.id]: nextIds,
                                                    };
                                                })
                                            }
                                        />
                                        <span className="text-sm text-foreground">
                                            {option.text}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    ) : (
                        <RadioGroup
                            value={
                                selections[question.id]?.[0] !== undefined
                                    ? String(selections[question.id][0])
                                    : undefined
                            }
                            onValueChange={(value) =>
                                setSelections((prev) => ({
                                    ...prev,
                                    [question.id]: [Number(value as string)],
                                }))
                            }
                            className="flex flex-col gap-3"
                        >
                            {question.answers.map((option) => (
                                <label
                                    key={option.id}
                                    className={cn(
                                        "flex cursor-pointer items-center gap-3 rounded-lg border border-border px-4 py-3",
                                        selections[question.id]?.[0] ===
                                            option.id &&
                                            "border-primary bg-primary/5",
                                    )}
                                >
                                    <RadioGroupItem value={String(option.id)} />
                                    <span className="text-sm text-foreground">
                                        {option.text}
                                    </span>
                                </label>
                            ))}
                        </RadioGroup>
                    )}
                </CardContent>
            </Card>

            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    className="text-muted-foreground hover:bg-muted hover:text-foreground"
                    disabled={currentIndex === 0}
                    onClick={() =>
                        setCurrentIndex((prev) => Math.max(0, prev - 1))
                    }
                >
                    <ChevronLeft data-icon="inline-start" />
                    Previous
                </Button>
                {isLastQuestion ? (
                    <Button
                        variant="default"
                        disabled={isSubmitting}
                        onClick={onSubmit}
                    >
                        Submit quiz
                        {isSubmitting && <Spinner data-icon="inline-end" />}
                    </Button>
                ) : (
                    <Button
                        variant="default"
                        onClick={() =>
                            setCurrentIndex((prev) =>
                                Math.min(totalQuestions - 1, prev + 1),
                            )
                        }
                    >
                        Next
                        <ChevronRight data-icon="inline-end" />
                    </Button>
                )}
            </div>
        </div>
    );
}

function RouteComponent() {
    const { quizId } = Route.useParams();
    const { preview, attemptId } = Route.useSearch();
    const numericQuizId = Number(quizId);
    const { currentUser, isPending: isCurrentUserPending } = useCurrentUser();
    const { quiz } = useQuiz(numericQuizId);
    const navigate = useNavigate();

    const isPreview =
        !!preview && !!currentUser && quiz?.owner_id === currentUser.id;
    const isResuming = !!attemptId;

    const [takerName, setTakerName] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selections, setSelections] = useState<Record<number, number[]>>({});
    const [previewSubmitted, setPreviewSubmitted] = useState(false);
    const [resumedAnswersLoaded, setResumedAnswersLoaded] = useState(false);

    const startAttemptMutation = useStartAttemptMutation(numericQuizId);
    const resumeAttemptMutation = useResumeAttemptMutation();
    const updateAttemptMutation = useUpdateAttemptMutation();
    const submitAttemptMutation = useSubmitAttemptMutation();

    const attempt = isResuming
        ? resumeAttemptMutation.data
        : startAttemptMutation.data;
    const answersInitialized = isResuming ? resumedAnswersLoaded : !!attempt;

    const ownershipResolved = !preview || quiz !== undefined;

    const hasAutoStarted = useRef(false);
    useEffect(() => {
        if (isResuming) {
            if (currentUser && !hasAutoStarted.current) {
                hasAutoStarted.current = true;
                setTimeout(() => {
                    resumeAttemptMutation.mutate(attemptId);
                }, 0);
            }
            return;
        }
        if (
            currentUser &&
            ownershipResolved &&
            !isPreview &&
            !hasAutoStarted.current
        ) {
            hasAutoStarted.current = true;
            setTimeout(() => {
                startAttemptMutation.mutate(undefined);
            }, 0);
        }
    }, [
        currentUser,
        ownershipResolved,
        isPreview,
        isResuming,
        attemptId,
        startAttemptMutation,
        resumeAttemptMutation,
    ]);

    // When resuming, load any previously saved answers once the attempt exists.
    const hasLoadedAnswers = useRef(false);
    useEffect(() => {
        if (!attempt || !isResuming || hasLoadedAnswers.current) {
            return;
        }
        hasLoadedAnswers.current = true;
        updateAttemptMutation.mutate(
            { attemptId: attempt.id },
            {
                onSuccess: (data) => {
                    const loaded: Record<number, number[]> = {};
                    for (const answer of data.answers_json ?? []) {
                        loaded[answer.question_id] = answer.answer_ids ??
                            (answer.answer_id !== undefined
                                ? [answer.answer_id]
                                : []);
                    }
                    setSelections(loaded);
                    setResumedAnswersLoaded(true);
                },
            },
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [attempt, isResuming]);

    // Autosave: persist answers to the attempt every time a selection changes.
    useEffect(() => {
        if (
            !answersInitialized ||
            !attempt ||
            submitAttemptMutation.data ||
            isPreview
        ) {
            return;
        }
        updateAttemptMutation.mutate({
            attemptId: attempt.id,
            answers: buildAnswersPayload(selections, attempt.quiz.questions),
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selections]);

    function resetAndRetake() {
        setCurrentIndex(0);
        setSelections({});
        setResumedAnswersLoaded(false);
        if (isPreview) {
            setPreviewSubmitted(false);
            return;
        }
        submitAttemptMutation.reset();
        if (isResuming) {
            hasAutoStarted.current = false;
            hasLoadedAnswers.current = false;
            resumeAttemptMutation.reset();
            navigate({
                to: "/q/$quizId",
                params: { quizId },
                search: { attemptId: undefined },
            });
            return;
        }
        startAttemptMutation.mutate(takerName || undefined);
    }

    // Preview: owner viewing their own quiz. Renders and scores locally —
    // no attempt is started or persisted server-side.
    if (isPreview) {
        if (!quiz) {
            return (
                <div className="flex w-full justify-center py-20">
                    <Spinner className="size-6" />
                </div>
            );
        }

        if (previewSubmitted) {
            const scoringQuestions = quiz.questions.map((question) => ({
                id: question.id,
                points: question.points,
                grading_mode: question.grading_mode,
                penalty_per_wrong: question.penalty_per_wrong,
                answers: question.answers,
            }));
            const scoringSelections = Object.entries(selections).map(
                ([questionId, ids]) => ({
                    question_id: Number(questionId),
                    answer_ids: ids,
                }),
            );
            const total = totalPoints(quiz.questions);
            const score = calculateScore(
                scoringQuestions,
                scoringSelections,
                quiz.allow_negative_score,
            );
            const passed = isPassed(
                scoringQuestions,
                score,
                quiz.pass_threshold,
            );

            return (
                <ResultsView
                    title={quiz.title}
                    score={score}
                    total={total}
                    passThreshold={quiz.pass_threshold}
                    passed={passed}
                    questions={quiz.questions}
                    selections={selections}
                    onRetake={resetAndRetake}
                    onDone={() =>
                        navigate({
                            to: "/quizzes/$quizId",
                            params: { quizId },
                        })
                    }
                    doneLabel="Back to quiz"
                />
            );
        }

        return (
            <TakingView
                title={quiz.title}
                description={quiz.description}
                questions={quiz.questions}
                currentIndex={currentIndex}
                setCurrentIndex={setCurrentIndex}
                selections={selections}
                setSelections={setSelections}
                onSubmit={() => setPreviewSubmitted(true)}
                isSubmitting={false}
            />
        );
    }

    const result = submitAttemptMutation.data;
    if (result) {
        return (
            <ResultsView
                title={result.quiz_json.title}
                score={result.score}
                total={totalPoints(result.quiz_json.questions)}
                passThreshold={result.quiz_json.pass_threshold}
                passed={result.passed}
                questions={result.quiz_json.questions}
                selections={selections}
                onRetake={resetAndRetake}
                onDone={() => navigate({ to: "/" })}
                doneLabel="Dashboard"
            />
        );
    }

    if (attempt && answersInitialized) {
        return (
            <TakingView
                title={attempt.quiz.title}
                description={attempt.quiz.description}
                questions={attempt.quiz.questions}
                currentIndex={currentIndex}
                setCurrentIndex={setCurrentIndex}
                selections={selections}
                setSelections={setSelections}
                isSubmitting={submitAttemptMutation.isPending}
                onSubmit={() =>
                    submitAttemptMutation.mutate({
                        attemptId: attempt.id,
                        answers: buildAnswersPayload(
                            selections,
                            attempt.quiz.questions,
                        ),
                    })
                }
            />
        );
    }

    if (isCurrentUserPending) {
        return (
            <div className="flex w-full justify-center py-20">
                <Spinner className="size-6" />
            </div>
        );
    }

    if (!currentUser) {
        if (isResuming) {
            return (
                <div className="flex w-full justify-center py-20">
                    <Spinner className="size-6" />
                </div>
            );
        }
        return (
            <div className="mx-auto flex max-w-md flex-col gap-8 px-4 py-24 sm:px-6">
                <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">
                        {quiz?.title}
                    </span>
                    <h1 className="text-2xl font-semibold text-foreground">
                        Before you start
                    </h1>
                    <span className="text-sm text-muted-foreground">
                        Enter your name so your result can be recorded.
                    </span>
                </div>
                <Card>
                    <CardContent className="flex flex-col gap-4">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                startAttemptMutation.mutate(takerName);
                            }}
                            className="flex flex-col gap-4"
                        >
                            <div className="flex flex-col gap-2">
                                <label
                                    htmlFor="taker-name"
                                    className="text-sm font-medium text-foreground"
                                >
                                    Your name
                                </label>
                                <InputField
                                    id="taker-name"
                                    placeholder="e.g. Jordan Lee"
                                    value={takerName}
                                    onChange={(e) =>
                                        setTakerName(e.target.value)
                                    }
                                    required
                                    disabled={startAttemptMutation.isPending}
                                />
                            </div>
                            <Button
                                type="submit"
                                variant="default"
                                className="h-11 w-full text-sm font-medium"
                                disabled={startAttemptMutation.isPending}
                            >
                                Start quiz
                                {startAttemptMutation.isPending && (
                                    <Spinner data-icon="inline-end" />
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (isResuming && resumeAttemptMutation.isError) {
        return (
            <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center sm:px-6">
                <span className="text-sm text-muted-foreground">
                    {resumeAttemptMutation.error.message}
                </span>
                <Button
                    variant="outline"
                    onClick={() => resumeAttemptMutation.mutate(attemptId)}
                >
                    Try again
                </Button>
            </div>
        );
    }

    if (!isResuming && startAttemptMutation.isError) {
        return (
            <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center sm:px-6">
                <span className="text-sm text-muted-foreground">
                    {startAttemptMutation.error.message}
                </span>
                <Button
                    variant="outline"
                    onClick={() => startAttemptMutation.mutate(undefined)}
                >
                    Try again
                </Button>
            </div>
        );
    }

    return (
        <div className="flex w-full justify-center py-20">
            <Spinner className="size-6" />
        </div>
    );
}
