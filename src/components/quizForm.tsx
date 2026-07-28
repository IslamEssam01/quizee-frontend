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
import { QuizJsonEditor } from "@/components/quizJsonEditor";
import type { QuizJsonPayload } from "@/lib/quizSchema";
import { Check, Plus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";

type OptionDraft = {
    id: number;
    text: string;
    is_correct: boolean;
};

type QuestionDraft = {
    id: number;
    text: string;
    type: QuestionType;
    options: OptionDraft[];
};

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

function toJsonPayload(
    title: string,
    description: string,
    passThreshold: number,
    questions: QuestionDraft[],
): QuizJsonPayload {
    return {
        title,
        description,
        pass_threshold: passThreshold,
        questions: questions.map((question) => ({
            text: question.text,
            type: question.type,
            answers: question.options.map((option) => ({
                text: option.text,
                is_correct: option.is_correct,
            })),
        })),
    };
}

function toSubmitPayload(
    title: string,
    description: string,
    passThreshold: number,
    questions: QuestionDraft[],
): QuizFormPayload {
    return {
        title,
        description,
        pass_threshold: passThreshold,
        questions: questions.map((question, index) => ({
            id: question.id,
            text: question.text,
            type: question.type,
            position: index + 1,
            answers: question.options.map((option) => ({
                id: option.id,
                text: option.text,
                is_correct: option.is_correct,
            })),
        })),
    };
}

function blankDraftQuestion(startId: number): {
    question: QuestionDraft;
    lastId: number;
} {
    let id = startId;
    const options: OptionDraft[] = Array.from({ length: 4 }, () => ({
        id: id++,
        text: "",
        is_correct: false,
    }));
    const question: QuestionDraft = {
        id: id++,
        text: "",
        type: "mcq",
        options,
    };
    return { question, lastId: id - 1 };
}

export function QuizForm({
    initialTitle = "",
    initialDescription = "",
    initialPassThreshold = 70,
    initialQuestions,
    isPending,
    submitLabel,
    onSubmit,
}: QuizFormProps) {
    const initialDraft = initialQuestions?.length
        ? {
              questions: initialQuestions.map((question) => ({
                  id: question.id,
                  text: question.text,
                  type: question.type,
                  options: question.answers.map((answer) => ({
                      id: answer.id,
                      text: answer.text,
                      is_correct: answer.is_correct,
                  })),
              })),
              lastId: Math.max(
                  0,
                  ...initialQuestions.flatMap((question) => [
                      question.id,
                      ...question.answers.map((answer) => answer.id),
                  ]),
              ),
          }
        : (() => {
              const { question, lastId } = blankDraftQuestion(1);
              return { questions: [question], lastId };
          })();

    const [title, setTitle] = useState(initialTitle);
    const [description, setDescription] = useState(initialDescription);
    const [passThreshold, setPassThreshold] = useState(initialPassThreshold);
    const [questions, setQuestions] = useState<QuestionDraft[]>(
        initialDraft.questions,
    );
    const nextId = useRef(initialDraft.lastId + 1);
    function newId() {
        return nextId.current++;
    }

    function blankOptions(count: number): OptionDraft[] {
        return Array.from({ length: count }, () => ({
            id: newId(),
            text: "",
            is_correct: false,
        }));
    }

    function blankQuestion(): QuestionDraft {
        return {
            id: newId(),
            text: "",
            type: "mcq",
            options: blankOptions(4),
        };
    }

    const isDisabled = isPending;

    const [jsonError, setJsonError] = useState<string | null>(null);

    const jsonValue = toJsonPayload(
        title,
        description,
        passThreshold,
        questions,
    );

    function applyJsonPayload(payload: QuizJsonPayload) {
        setTitle(payload.title);
        setDescription(payload.description);
        setPassThreshold(payload.pass_threshold);
        setQuestions(
            payload.questions.map((question, index) => {
                const existingQuestion = questions[index];
                return {
                    id: existingQuestion?.id ?? newId(),
                    text: question.text,
                    type: question.type,
                    options: question.answers.map((answer, optionIndex) => ({
                        id:
                            existingQuestion?.options[optionIndex]?.id ??
                            newId(),
                        text: answer.text,
                        is_correct: answer.is_correct,
                    })),
                };
            }),
        );
    }

    function updateQuestion(
        id: number,
        updater: (question: QuestionDraft) => QuestionDraft,
    ) {
        setQuestions((prev) =>
            prev.map((question) =>
                question.id === id ? updater(question) : question,
            ),
        );
    }

    function addQuestion() {
        setQuestions((prev) => [...prev, blankQuestion()]);
    }

    function removeQuestion(id: number) {
        setQuestions((prev) => prev.filter((question) => question.id !== id));
    }

    function setQuestionType(id: number, type: QuestionType) {
        updateQuestion(id, (question) => ({
            ...question,
            type,
            options:
                type === "T OR F"
                    ? [
                          { id: newId(), text: "True", is_correct: false },
                          { id: newId(), text: "False", is_correct: false },
                      ]
                    : blankOptions(4),
        }));
    }

    function addOption(id: number) {
        updateQuestion(id, (question) => ({
            ...question,
            options: [
                ...question.options,
                { id: newId(), text: "", is_correct: false },
            ],
        }));
    }

    function removeOption(questionId: number, optionId: number) {
        updateQuestion(questionId, (question) => ({
            ...question,
            options: question.options.filter(
                (option) => option.id !== optionId,
            ),
        }));
    }

    function setCorrectOption(questionId: number, optionId: number) {
        updateQuestion(questionId, (question) => ({
            ...question,
            options: question.options.map((option) => ({
                ...option,
                is_correct: option.id === optionId,
            })),
        }));
    }

    function updateOptionText(
        questionId: number,
        optionId: number,
        text: string,
    ) {
        updateQuestion(questionId, (question) => ({
            ...question,
            options: question.options.map((option) =>
                option.id === optionId ? { ...option, text } : option,
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

        onSubmit(
            toSubmitPayload(title, description, passThreshold, questions),
        );
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

            <QuizJsonEditor
                value={jsonValue}
                onChange={applyJsonPayload}
                onErrorChange={setJsonError}
                disabled={isDisabled}
            />

            <div className="flex flex-col gap-4">
                <span className="text-xs font-semibold text-muted-foreground uppercase">
                    Questions ({questions.length})
                </span>

                {questions.map((question, index) => (
                    <Card key={question.id} className="w-full">
                        <CardContent className="flex flex-col gap-4">
                            <div className="flex items-start gap-3">
                                <span className="pt-2 text-sm text-muted-foreground">
                                    {index + 1}
                                </span>
                                <Textarea
                                    value={question.text}
                                    placeholder="Question text"
                                    onChange={(e) =>
                                        updateQuestion(question.id, (q) => ({
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
                                        removeQuestion(question.id)
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
                                        setQuestionType(question.id, "mcq")
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
                                            question.id,
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
                                value={String(
                                    question.options.find(
                                        (o) => o.is_correct,
                                    )?.id ?? "",
                                )}
                                onValueChange={(value) =>
                                    setCorrectOption(
                                        question.id,
                                        Number(value as string),
                                    )
                                }
                                className="flex flex-col gap-2"
                            >
                                {question.type === "T OR F"
                                    ? question.options.map((option) => (
                                          <label
                                              key={option.id}
                                              className="flex items-center gap-2 text-sm text-foreground"
                                          >
                                              <RadioGroupItem
                                                  value={String(option.id)}
                                                  disabled={isDisabled}
                                              />
                                              {option.text}
                                          </label>
                                      ))
                                    : question.options.map(
                                          (option, optionIndex) => (
                                              <div
                                                  key={option.id}
                                                  className="flex items-center gap-2"
                                              >
                                                  <RadioGroupItem
                                                      value={String(
                                                          option.id,
                                                      )}
                                                      disabled={isDisabled}
                                                  />
                                                  <InputField
                                                      value={option.text}
                                                      placeholder={`Option ${optionIndex + 1}`}
                                                      onChange={(e) =>
                                                          updateOptionText(
                                                              question.id,
                                                              option.id,
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
                                                              question.id,
                                                              option.id,
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
                                    onClick={() => addOption(question.id)}
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

            {jsonError && (
                <span className="text-sm text-destructive">
                    Fix the JSON editor error before submitting: {jsonError}
                </span>
            )}

            <Button
                type="submit"
                variant="default"
                className="h-11 w-full text-sm font-medium"
                disabled={isDisabled || !!jsonError}
            >
                <Check data-icon="inline-start" />
                {submitLabel}
                {isDisabled && <Spinner data-icon="inline-end" />}
            </Button>
        </form>
    );
}
