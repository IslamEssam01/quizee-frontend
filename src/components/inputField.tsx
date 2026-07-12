import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function InputField({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"input">) {
    return (
        <Input
            className={cn(
                "h-10 rounded-md border border-border  text-sm transition-all placeholder:text-muted-foreground focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-ring focus-visible:duration-300 focus-visible:outline-none",
                className,
            )}
            {...props}
        />
    );
}
