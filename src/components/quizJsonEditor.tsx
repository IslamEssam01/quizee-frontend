import { Button } from "@/components/ui/button";
import {
    Collapsible,
    CollapsibleTrigger,
    CollapsiblePanel,
} from "@/components/ui/collapsible";
import { QuizSchemaBlock } from "@/components/quizSchemaBlock";
import { quizPayloadSchema, type QuizJsonPayload } from "@/lib/quizSchema";
import { ChevronDown, WrapText } from "lucide-react";
import { lazy, Suspense, useEffect, useRef, useState } from "react";

const QuizJsonEditorCore = lazy(() => import("./quizJsonEditorCore"));

type QuizJsonEditorProps = {
    value: QuizJsonPayload;
    onChange: (payload: QuizJsonPayload) => void;
    onErrorChange: (error: string | null) => void;
    disabled?: boolean;
};

export function QuizJsonEditor({
    value,
    onChange,
    onErrorChange,
    disabled,
}: QuizJsonEditorProps) {
    const [text, setText] = useState(() => JSON.stringify(value, null, 2));
    const [error, setError] = useState<string | null>(null);
    const focused = useRef(false);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
        undefined,
    );

    useEffect(() => {
        if (!focused.current) {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
            setText(JSON.stringify(value, null, 2));
            setError(null);
            onErrorChange(null);
        }
    }, [value, onErrorChange]);

    useEffect(() => {
        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, []);

    function applyText(nextText: string) {
        try {
            const parsed: unknown = JSON.parse(nextText);
            const result = quizPayloadSchema.safeParse(parsed);
            if (!result.success) {
                const issue = result.error.issues[0];
                const message = issue
                    ? `${issue.path.join(".")}: ${issue.message}`
                    : "Invalid quiz JSON";
                setError(message);
                onErrorChange(message);
                return;
            }
            setError(null);
            onErrorChange(null);
            onChange(result.data);
        } catch (e) {
            const message = e instanceof Error ? e.message : "Invalid JSON";
            setError(message);
            onErrorChange(message);
        }
    }

    function handleChange(nextText: string) {
        setText(nextText);
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        debounceTimer.current = setTimeout(() => applyText(nextText), 300);
    }

    function handleFormat() {
        try {
            const formatted = JSON.stringify(JSON.parse(text), null, 2);
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
            setText(formatted);
        } catch {
            // invalid JSON — nothing to format, existing error message stands
        }
    }

    return (
        <Collapsible className="gap-3">
            <CollapsibleTrigger className="text-xs font-semibold text-muted-foreground uppercase hover:text-foreground">
                <span>Edit as JSON</span>
                <ChevronDown className="size-4 transition-transform group-data-[panel-open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsiblePanel>
                <div className="flex flex-col gap-2">
                    <div className="flex justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={!!error}
                            onClick={handleFormat}
                        >
                            <WrapText data-icon="inline-start" />
                            Format
                        </Button>
                    </div>
                    <div className="max-h-[400px] overflow-x-auto overflow-y-auto rounded-lg border border-border text-xs sm:text-sm">
                        <Suspense
                            fallback={
                                <div className="h-[400px] animate-pulse rounded-lg border border-border bg-muted/30" />
                            }
                        >
                            <QuizJsonEditorCore
                                text={text}
                                editable={!disabled}
                                onChange={handleChange}
                                onFocus={() => {
                                    focused.current = true;
                                }}
                                onBlur={() => {
                                    focused.current = false;
                                }}
                            />
                        </Suspense>
                    </div>
                    {error && (
                        <span className="text-sm text-destructive">
                            {error}
                        </span>
                    )}
                    <QuizSchemaBlock />
                </div>
            </CollapsiblePanel>
        </Collapsible>
    );
}
