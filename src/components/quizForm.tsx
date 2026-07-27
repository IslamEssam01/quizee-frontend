import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { InputField } from "@/components/inputField";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { QuestionType, QuizQuestion } from "@/hooks/useQuiz";
import { errorToast } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Check, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

type OptionDraft = {
    key: string;
    text: string;
    is_correct: boolean;
};

type QuestionDraft = {
    key: string;
    text: string;
    type: QuestionType;
    options: OptionDraft[];
};

function blankOptions(count: number): OptionDraft[] {
    return Array.from({ length: count }, () => ({
        key: crypto.randomUUID(),
        text: "",
        is_correct: false,
    }));
}

function blankQuestion(): QuestionDraft {
    return {
        key: crypto.randomUUID(),
        text: "",
        type: "mcq",
        options: blankOptions(4),
    };
}

export type QuizFormPayload = {
    title: string;
    description: string;
    pass_threshold: number;
    questions: QuizQuestion[];
};

type QuizFormProps = {
    initialTitle?: string;
    initialDescription?: string;
    initialPassThreshold?: number;
    initialQuestions?: QuizQuestion[];
    isPending: boolean;
    submitLabel: string;
    onSubmit: (payload: QuizFormPayload) => void;
};

export function QuizForm({
    initialTitle = "",
    initialDescription = "",
    initialPassThreshold = 70,
    initialQuestions,
    isPending,
    submitLabel,
    onSubmit,
}: QuizFormProps) {
    const [title, setTitle] = useState(initialTitle);
    const [description, setDescription] = useState(initialDescription);
    const [passThreshold, setPassThreshold] = useState(initialPassThreshold);
    const [questions, setQuestions] = useState<QuestionDraft[]>(() =>
        initialQuestions?.length
            ? initialQuestions.map((question) => ({
                  key: crypto.randomUUID(),
                  text: question.text,
                  type: question.type,
                  options: question.answers.map((answer) => ({
                      key: crypto.randomUUID(),
                      text: answer.text,
                      is_correct: answer.is_correct,
                  })),
              }))
            : [blankQuestion()],
    );

    const isDisabled = isPending;

    function updateQuestion(
        key: string,
        updater: (question: QuestionDraft) => QuestionDraft,
    ) {
        setQuestions((prev) =>
            prev.map((question) =>
                question.key === key ? updater(question) : question,
            ),
        );
    }

    function addQuestion() {
        setQuestions((prev) => [...prev, blankQuestion()]);
    }

    function removeQuestion(key: string) {
        setQuestions((prev) =>
            prev.filter((question) => question.key !== key),
        );
    }

    function setQuestionType(key: string, type: QuestionType) {
        updateQuestion(key, (question) => ({
            ...question,
            type,
            options:
                type === "T OR F"
                    ? [
                          {
                              key: crypto.randomUUID(),
                              text: "True",
                              is_correct: false,
                          },
                          {
                              key: crypto.randomUUID(),
                              text: "False",
                              is_correct: false,
                          },
                      ]
                    : blankOptions(4),
        }));
    }

    function addOption(key: string) {
        updateQuestion(key, (question) => ({
            ...question,
            options: [
                ...question.options,
                { key: crypto.randomUUID(), text: "", is_correct: false },
            ],
        }));
    }

    function removeOption(questionKey: string, optionKey: string) {
        updateQuestion(questionKey, (question) => ({
            ...question,
            options: question.options.filter(
                (option) => option.key !== optionKey,
            ),
        }));
    }

    function setCorrectOption(questionKey: string, optionKey: string) {
        updateQuestion(questionKey, (question) => ({
            ...question,
            options: question.options.map((option) => ({
                ...option,
                is_correct: option.key === optionKey,
            })),
        }));
    }

    function updateOptionText(
        questionKey: string,
        optionKey: string,
        text: string,
    ) {
        updateQuestion(questionKey, (question) => ({
            ...question,
            options: question.options.map((option) =>
                option.key === optionKey ? { ...option, text } : option,
            ),
        }));
    }

    function handleSubmit() {
        for (const question of questions) {
            if (!question.options.some((option) => option.is_correct)) {
                errorToast(
                    `Select a correct answer for "${question.text || "an untitled question"}"`,
                );
                return;
            }
        }

        onSubmit({
            title,
            description,
            pass_threshold: passThreshold,
            questions: questions.map((question, index) => ({
                text: question.text,
                type: question.type,
                position: index + 1,
                answers: question.options.map((option) => ({
                    text: option.text,
                    is_correct: option.is_correct,
                })),
            })),
        });
    }

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
            }}
            className="flex flex-col gap-8"
        >
            <Card className="w-full">
                <CardContent className="flex flex-col gap-4">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">
                        Details
                    </span>
                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="title"
                            className="text-sm font-medium text-foreground"
                        >
                            Title
                        </label>
                        <InputField
                            id="title"
                            placeholder="e.g. JavaScript Fundamentals"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            disabled={isDisabled}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="description"
                            className="text-sm font-medium text-foreground"
                        >
                            Description
                        </label>
                        <Textarea
                            id="description"
                            placeholder="A brief description of what this quiz covers"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            disabled={isDisabled}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="pass-threshold"
                            className="text-sm font-medium text-foreground"
                        >
                            Pass threshold (%)
                        </label>
                        <InputField
                            id="pass-threshold"
                            type="number"
                            min={1}
                            max={100}
                            value={passThreshold}
                            onChange={(e) =>
                                setPassThreshold(Number(e.target.value))
                            }
                            required
                            disabled={isDisabled}
                        />
                        <span className="text-xs text-muted-foreground">
                            Minimum percentage score required to pass
                        </span>
                    </div>
                </CardContent>
            </Card>

            <div className="flex flex-col gap-4">
                <span className="text-xs font-semibold text-muted-foreground uppercase">
                    Questions ({questions.length})
                </span>

                {questions.map((question, index) => (
                    <Card key={question.key} className="w-full">
                        <CardContent className="flex flex-col gap-4">
                            <div className="flex items-start gap-3">
                                <span className="pt-2 text-sm text-muted-foreground">
                                    {index + 1}
                                </span>
                                <Textarea
                                    value={question.text}
                                    placeholder="Question text"
                                    onChange={(e) =>
                                        updateQuestion(question.key, (q) => ({
                                            ...q,
                                            text: e.target.value,
                                        }))
                                    }
                                    required
                                    disabled={isDisabled}
                                    className="flex-1"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    className="text-muted-foreground hover:bg-muted hover:text-foreground"
                                    disabled={
                                        isDisabled || questions.length === 1
                                    }
                                    onClick={() =>
                                        removeQuestion(question.key)
                                    }
                                >
                                    <Trash2 />
                                </Button>
                            </div>

                            <div className="inline-flex w-fit items-center gap-1 rounded-lg border border-border bg-muted/30 p-1">
                                <button
                                    type="button"
                                    disabled={isDisabled}
                                    onClick={() =>
                                        setQuestionType(question.key, "mcq")
                                    }
                                    className={cn(
                                        "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                                        question.type === "mcq"
                                            ? "bg-card text-foreground"
                                            : "text-muted-foreground hover:text-foreground",
                                    )}
                                >
                                    Multiple choice
                                </button>
                                <button
                                    type="button"
                                    disabled={isDisabled}
                                    onClick={() =>
                                        setQuestionType(
                                            question.key,
                                            "T OR F",
                                        )
                                    }
                                    className={cn(
                                        "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                                        question.type === "T OR F"
                                            ? "bg-card text-foreground"
                                            : "text-muted-foreground hover:text-foreground",
                                    )}
                                >
                                    True / False
                                </button>
                            </div>

                            <RadioGroup
                                value={
                                    question.options.find(
                                        (o) => o.is_correct,
                                    )?.key
                                }
                                onValueChange={(value) =>
                                    setCorrectOption(
                                        question.key,
                                        value as string,
                                    )
                                }
                                className="flex flex-col gap-2"
                            >
                                {question.type === "T OR F"
                                    ? question.options.map((option) => (
                                          <label
                                              key={option.key}
                                              className="flex items-center gap-2 text-sm text-foreground"
                                          >
                                              <RadioGroupItem
                                                  value={option.key}
                                                  disabled={isDisabled}
                                              />
                                              {option.text}
                                          </label>
                                      ))
                                    : question.options.map(
                                          (option, optionIndex) => (
                                              <div
                                                  key={option.key}
                                                  className="flex items-center gap-2"
                                              >
                                                  <RadioGroupItem
                                                      value={option.key}
                                                      disabled={isDisabled}
                                                  />
                                                  <InputField
                                                      value={option.text}
                                                      placeholder={`Option ${optionIndex + 1}`}
                                                      onChange={(e) =>
                                                          updateOptionText(
                                                              question.key,
                                                              option.key,
                                                              e.target.value,
                                                          )
                                                      }
                                                      required
                                                      disabled={isDisabled}
                                                      className="flex-1"
                                                  />
                                                  <Button
                                                      type="button"
                                                      variant="ghost"
                                                      size="icon-sm"
                                                      className="text-muted-foreground hover:bg-muted hover:text-foreground"
                                                      disabled={
                                                          isDisabled ||
                                                          question.options
                                                              .length <= 2
                                                      }
                                                      onClick={() =>
                                                          removeOption(
                                                              question.key,
                                                              option.key,
                                                          )
                                                      }
                                                  >
                                                      <Trash2 />
                                                  </Button>
                                              </div>
                                          ),
                                      )}
                            </RadioGroup>

                            {question.type === "mcq" && (
                                <button
                                    type="button"
                                    disabled={isDisabled}
                                    onClick={() => addOption(question.key)}
                                    className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                                >
                                    <Plus className="size-4" />
                                    Add option
                                </button>
                            )}
                        </CardContent>
                    </Card>
                ))}

                <Button
                    type="button"
                    variant="outline"
                    className="h-12 w-full"
                    disabled={isDisabled}
                    onClick={addQuestion}
                >
                    <Plus data-icon="inline-start" />
                    Add question
                </Button>
            </div>

            <Separator />

            <Button
                type="submit"
                variant="default"
                className="h-11 w-full text-sm font-medium"
                disabled={isDisabled}
            >
                <Check data-icon="inline-start" />
                {submitLabel}
                {isDisabled && <Spinner data-icon="inline-end" />}
            </Button>
        </form>
    );
}
