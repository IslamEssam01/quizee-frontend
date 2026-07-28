import { Button } from "@/components/ui/button";
import {
    Collapsible,
    CollapsibleTrigger,
    CollapsiblePanel,
} from "@/components/ui/collapsible";
import { quizJsonSchema } from "@/lib/quizSchema";
import { Check, ChevronDown, Copy } from "lucide-react";
import { useState } from "react";

const schemaText = JSON.stringify(quizJsonSchema, null, 2);

export function QuizSchemaBlock() {
    const [copied, setCopied] = useState(false);

    function handleCopy() {
        navigator.clipboard.writeText(schemaText);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }

    return (
        <Collapsible className="gap-2">
            <CollapsibleTrigger className="text-xs font-medium text-muted-foreground hover:text-foreground">
                <span>View JSON Schema</span>
                <ChevronDown className="size-3.5 transition-transform group-data-[panel-open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsiblePanel>
                <div className="relative mt-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        className="absolute top-2 right-2"
                        onClick={handleCopy}
                    >
                        {copied ? <Check /> : <Copy />}
                    </Button>
                    <pre className="max-h-[300px] overflow-x-auto overflow-y-auto rounded-lg border border-border bg-muted/30 p-3 text-xs">
                        {schemaText}
                    </pre>
                </div>
            </CollapsiblePanel>
        </Collapsible>
    );
}
