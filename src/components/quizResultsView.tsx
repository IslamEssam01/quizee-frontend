import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { GradingMode, QuestionType } from "@/hooks/useQuiz";

export type ReviewOption = {
    id: number;
    text: string;
    is_correct: boolean;
    points?: number;
};

export type ReviewQuestion = {
    id: number;
    text: string;
    type: QuestionType;
    position: number;
    points: number;
    grading_mode: GradingMode;
    penalty_per_wrong: number;
    allow_multiple_answers: boolean;
    answers: ReviewOption[];
};

export function ResultBadge({ passed }: { passed: boolean }) {
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

export function ResultsView({
    title,
    score,
    total,
    passThreshold,
    passed,
    grade,
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
    grade?: string | null;
    questions: ReviewQuestion[];
    selections: Record<number, number[]>;
    onRetake?: () => void;
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
                    <div className="flex items-center gap-2">
                        <ResultBadge passed={passed} />
                        {grade && (
                            <span className="w-fit rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                Grade: {grade}
                            </span>
                        )}
                    </div>
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
                    const userAnswerIds = selections[question.id] ?? [];
                    const correctAnswers = question.answers.filter(
                        (a) => a.is_correct,
                    );
                    const correctIds = new Set(
                        correctAnswers.map((a) => a.id),
                    );
                    const userAnswers = question.answers.filter((a) =>
                        userAnswerIds.includes(a.id),
                    );

                    const isFullyCorrect =
                        userAnswerIds.length > 0 &&
                        userAnswerIds.length === correctIds.size &&
                        userAnswerIds.every((id) => correctIds.has(id));

                    const showPartialCredit =
                        question.grading_mode === "partial_credit" &&
                        !isFullyCorrect;

                    const wrongCount = userAnswerIds.filter(
                        (id) => !correctIds.has(id),
                    ).length;

                    const awardedPoints = showPartialCredit
                        ? (() => {
                              if (wrongCount > 0) {
                                  return 0;
                              }
                              const correctAnswersHavePoints =
                                  correctAnswers.some(
                                      (a) => a.points != null,
                                  );
                              if (correctAnswersHavePoints) {
                                  return correctAnswers
                                      .filter((a) =>
                                          userAnswerIds.includes(a.id),
                                      )
                                      .reduce(
                                          (sum, a) => sum + (a.points ?? 0),
                                          0,
                                      );
                              }
                              const correctCount = userAnswerIds.filter(
                                  (id) => correctIds.has(id),
                              ).length;
                              return correctAnswers.length > 0
                                  ? (correctCount / correctAnswers.length) *
                                        question.points
                                  : 0;
                          })()
                        : null;

                    return (
                        <div
                            key={question.id}
                            className={cn(
                                "rounded-lg border-l-4 bg-card p-4",
                                isFullyCorrect
                                    ? "border-emerald-500"
                                    : showPartialCredit
                                      ? "border-amber-500"
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
                                        isFullyCorrect
                                            ? "bg-emerald-500/10 text-emerald-500"
                                            : showPartialCredit
                                              ? "bg-amber-500/10 text-amber-500"
                                              : "bg-destructive/10 text-destructive",
                                    )}
                                >
                                    {isFullyCorrect
                                        ? "Correct"
                                        : showPartialCredit
                                          ? `${awardedPoints} / ${question.points} pts`
                                          : "Wrong"}
                                </span>
                            </div>
                            {isFullyCorrect ? (
                                <span className="text-sm text-emerald-500">
                                    {userAnswers
                                        .map((a) => a.text)
                                        .join(", ")}
                                </span>
                            ) : (
                                <div className="flex flex-col gap-0.5 text-sm">
                                    <span className="text-muted-foreground">
                                        Your answer:{" "}
                                        <span className="text-destructive">
                                            {userAnswers.length > 0
                                                ? userAnswers
                                                      .map((a) => a.text)
                                                      .join(", ")
                                                : "No answer"}
                                        </span>
                                    </span>
                                    <span className="text-muted-foreground">
                                        Correct:{" "}
                                        <span className="text-emerald-500">
                                            {correctAnswers
                                                .map((a) => a.text)
                                                .join(", ")}
                                        </span>
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="flex items-center gap-3">
                {onRetake && (
                    <Button
                        variant="outline"
                        className="h-11 flex-1"
                        onClick={onRetake}
                    >
                        Retake quiz
                    </Button>
                )}
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
