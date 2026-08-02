import { Button } from "@/components/ui/button";
import { QuizForm } from "@/components/quizForm";
import {
    currentUserQueryOptions,
    useCurrentUser,
} from "@/hooks/useCurrentUser";
import { quizQueryOptions, useQuiz } from "@/hooks/useQuiz";
import { useUpdateQuizMutation } from "@/hooks/useUpdateQuizMutation";
import { queryClient } from "@/lib/queryClient";
import {
    createFileRoute,
    Link,
    redirect,
    useNavigate,
} from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/quizzes/$quizId_/edit")({
    loader: async ({ params }) => {
        try {
            const user = await queryClient.ensureQueryData(
                currentUserQueryOptions,
            );
            await queryClient.ensureQueryData(
                quizQueryOptions(Number(params.quizId)),
            );
            return user;
        } catch {
            throw redirect({ to: "/login" });
        }
    },
    component: RouteComponent,
});

function RouteComponent() {
    const { quizId } = Route.useParams();
    const { currentUser } = useCurrentUser();
    const { quiz } = useQuiz(Number(quizId));
    const updateQuizMutation = useUpdateQuizMutation(Number(quizId));
    const navigate = useNavigate();

    if (!currentUser || !quiz) {
        return null;
    }

    return (
        <div className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-10 sm:px-6">
            <div className="flex items-center gap-2">
                <Link to="/quizzes/$quizId" params={{ quizId }}>
                    <Button
                        variant="ghost"
                        size="icon-lg"
                        className="text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                        <ChevronLeft />
                    </Button>
                </Link>
                <span className="text-xl font-semibold text-foreground">
                    Edit quiz
                </span>
            </div>

            <QuizForm
                initialTitle={quiz.title}
                initialDescription={quiz.description}
                initialPassThreshold={quiz.pass_threshold}
                initialAllowNegativeScore={quiz.allow_negative_score}
                initialQuestions={quiz.questions}
                isPending={updateQuizMutation.isPending}
                submitLabel="Save & get link"
                onSubmit={(payload) => {
                    updateQuizMutation.mutate(payload, {
                        onSuccess: () => {
                            navigate({
                                to: "/quizzes/$quizId",
                                params: { quizId },
                            });
                        },
                    });
                }}
            />
        </div>
    );
}
