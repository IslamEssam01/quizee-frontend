import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";

type ConfirmDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    isLoading?: boolean;
    variant?: "default" | "destructive";
    children?: ReactNode;
};

export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    onConfirm,
    isLoading = false,
    variant = "default",
    children,
}: ConfirmDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                {children}
                <DialogFooter>
                    <Button
                        variant="outline"
                        type="button"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        variant={variant}
                        type="button"
                        className={
                            variant === "destructive"
                                ? "bg-destructive! text-white"
                                : undefined
                        }
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {confirmLabel}
                        {isLoading && <Spinner data-icon="inline-end" />}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
