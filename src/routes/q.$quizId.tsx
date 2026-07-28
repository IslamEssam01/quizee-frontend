import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { InputField } from "@/components/inputField";
import { Spinner } from "@/components/ui/spinner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useQuiz } from "@/hooks/useQuiz";
import { useStartAttemptMutation } from "@/hooks/useStartAttemptMutation";
import { useSubmitAttemptMutation } from "@/hooks/useSubmitAttemptMutation";
import type { QuestionType } from "@/hooks/useQuiz";
import { cn } from "@/lib/utils";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";

const takeQuizSearchSchema = z.object({
    preview: z.boolean().optional(),
});

export const Route = createFileRoute("/q/$quizId")({
    component: RouteComponent,
    validateSearch: takeQuizSearchSchema,
});

type TakingOption = { id: number; text: string };
type TakingQuestion = {
    id: number;
    text: string;
    type: QuestionType;
    answers: TakingOption[];
};

type ReviewOption = { id: number; text: string; is_correct: boolean };
type ReviewQuestion = {
    id: number;
    text: string;
    type: QuestionType;
    answers: ReviewOption[];
};

function ResultBadge({ passed }: { passed: boolean }) {
    return (
        <span
            className={cn(
                "w-fit rounded-full px-2 py-0.5 text-xs font-medium",
                passed
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "bg-destructive/10 text-destructive",
            )}
        >
            {passed ? "Passed" : "Failed"}
        </span>
    );
}

function ResultsView({
    title,
    score,
    total,
    passThreshold,
    passed,
    questions,
    selections,
    onRetake,
    onDone,
    doneLabel,
}: {
    title: string;
    score: number;
    total: number;
    passThreshold: number;
    passed: boolean;
    questions: ReviewQuestion[];
    selections: Record<number, number>;
    onRetake: () => void;
    onDone: () => void;
    doneLabel: string;
}) {
    const percent = total > 0 ? Math.round((score / total) * 100) : 0;

    return (
        <div className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-10 sm:px-6">
            <Card>
                <CardContent className="flex flex-col items-center gap-2 py-8">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">
                        {title}
                    </span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-foreground">
                            {score}
                        </span>
                        <span className="text-lg text-muted-foreground">
                            /{total}
                        </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                        {percent}% correct
                    </span>
                    <ResultBadge passed={passed} />
                    <span className="text-xs text-muted-foreground">
                        Pass threshold: {passThreshold}%
                    </span>
                </CardContent>
            </Card>

            <div className="flex flex-col gap-3">
                <span className="text-xs font-semibold text-muted-foreground uppercase">
                    Review
                </span>
                {questions.map((question, index) => {
                    const userAnswerId = selections[question.id];
                    const correctAnswer = question.answers.find(
                        (a) => a.is_correct,
                    );
                    const userAnswer = question.answers.find(
                        (a) => a.id === userAnswerId,
                    );
                    const isCorrect =
                        userAnswerId !== undefined &&
                        userAnswerId === correctAnswer?.id;

                    return (
                        <div
                            key={question.id}
                            className={cn(
                                "rounded-lg border-l-4 bg-card p-4",
                                isCorrect
                                    ? "border-emerald-500"
                                    : "border-destructive",
                            )}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <span className="text-sm font-medium text-foreground">
                                    {index + 1}. {question.text}
                                </span>
                                <span
                                    className={cn(
                                        "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                                        isCorrect
                                            ? "bg-emerald-500/10 text-emerald-500"
                                            : "bg-destructive/10 text-destructive",
                                    )}
                                >
                                    {isCorrect ? "Correct" : "Wrong"}
                                </span>
                            </div>
                            {isCorrect ? (
                                <span className="text-sm text-emerald-500">
                                    {userAnswer?.text}
                                </span>
                            ) : (
                                <div className="flex flex-col gap-0.5 text-sm">
                                    <span className="text-muted-foreground">
                                        Your answer:{" "}
                                        <span className="text-destructive">
                                            {userAnswer?.text ?? "No answer"}
                                        </span>
                                    </span>
                                    <span className="text-muted-foreground">
                                        Correct:{" "}
                                        <span className="text-emerald-500">
                                            {correctAnswer?.text}
                                        </span>
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="flex items-center gap-3">
                <Button
                    variant="outline"
                    className="h-11 flex-1"
                    onClick={onRetake}
                >
                    Retake quiz
                </Button>
                <Button
                    variant="default"
                    className="h-11 flex-1"
                    onClick={onDone}
                >
                    {doneLabel}
                </Button>
            </div>
        </div>
    );
}

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
    selections: Record<number, number>;
    setSelections: (
        updater: (prev: Record<number, number>) => Record<number, number>,
    ) => void;
    onSubmit: () => void;
    isSubmitting: boolean;
}) {
    const totalQuestions = questions.length;
    const question = questions[currentIndex];
    const answeredCount = Object.keys(selections).length;
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
                    <RadioGroup
                        value={
                            selections[question.id] !== undefined
                                ? String(selections[question.id])
                                : undefined
                        }
                        onValueChange={(value) =>
                            setSelections((prev) => ({
                                ...prev,
                                [question.id]: Number(value as string),
                            }))
                        }
                        className="flex flex-col gap-3"
                    >
                        {question.answers.map((option) => (
                            <label
                                key={option.id}
                                className={cn(
                                    "flex cursor-pointer items-center gap-3 rounded-lg border border-border px-4 py-3",
                                    selections[question.id] === option.id &&
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
    const { preview } = Route.useSearch();
    const numericQuizId = Number(quizId);
    const { currentUser } = useCurrentUser();
    const { quiz } = useQuiz(numericQuizId);
    const navigate = useNavigate();

    const isPreview =
        !!preview && !!currentUser && quiz?.owner_id === currentUser.id;

    const [takerName, setTakerName] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selections, setSelections] = useState<Record<number, number>>({});
    const [previewSubmitted, setPreviewSubmitted] = useState(false);

    const startAttemptMutation = useStartAttemptMutation(numericQuizId);
    const submitAttemptMutation = useSubmitAttemptMutation();

    const ownershipResolved = !preview || quiz !== undefined;

    const hasAutoStarted = useRef(false);
    useEffect(() => {
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
    }, [currentUser, ownershipResolved, isPreview, startAttemptMutation]);

    function resetAndRetake() {
        setCurrentIndex(0);
        setSelections({});
        if (isPreview) {
            setPreviewSubmitted(false);
            return;
        }
        submitAttemptMutation.reset();
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
            const total = quiz.questions.length;
            const score = quiz.questions.reduce((count, question) => {
                const chosen = selections[question.id];
                const correct = question.answers.find((a) => a.is_correct);
                return chosen !== undefined && chosen === correct?.id
                    ? count + 1
                    : count;
            }, 0);
            const passed =
                total > 0 && (score / total) * 100 >= quiz.pass_threshold;

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
                total={result.quiz_json.questions.length}
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

    const attempt = startAttemptMutation.data;
    if (attempt) {
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
                        answers: Object.entries(selections).map(
                            ([questionId, answerId]) => ({
                                question_id: Number(questionId),
                                answer_id: answerId,
                            }),
                        ),
                    })
                }
            />
        );
    }

    if (!currentUser) {
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

    if (startAttemptMutation.isError) {
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
