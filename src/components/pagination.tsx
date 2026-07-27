import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
    page: number;
    pageCount: number;
    rangeStart: number;
    rangeEnd: number;
    total: number;
    onPageChange: (page: number) => void;
};

export function Pagination({
    page,
    pageCount,
    rangeStart,
    rangeEnd,
    total,
    onPageChange,
}: PaginationProps) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
                {rangeStart}-{rangeEnd} of {total}
            </span>
            <div className="flex items-center gap-1">
                <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground hover:bg-muted hover:text-foreground"
                    disabled={page === 1}
                    onClick={() => onPageChange(page - 1)}
                >
                    <ChevronLeft />
                </Button>
                {Array.from({ length: pageCount }, (_, i) => i + 1).map(
                    (pageNumber) => (
                        <Button
                            key={pageNumber}
                            variant={pageNumber === page ? "default" : "ghost"}
                            size="icon-sm"
                            className={cn(
                                pageNumber !== page &&
                                    "text-muted-foreground hover:bg-muted hover:text-foreground",
                            )}
                            onClick={() => onPageChange(pageNumber)}
                        >
                            {pageNumber}
                        </Button>
                    ),
                )}
                <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground hover:bg-muted hover:text-foreground"
                    disabled={page === pageCount}
                    onClick={() => onPageChange(page + 1)}
                >
                    <ChevronRight />
                </Button>
            </div>
        </div>
    );
}
