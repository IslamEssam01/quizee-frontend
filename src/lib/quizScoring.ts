export type ScoringAnswer = {
    id: number;
    is_correct: boolean;
    points?: number;
};

export type ScoringQuestion = {
    id: number;
    points: number;
    grading_mode: "all_or_nothing" | "partial_credit";
    penalty_per_wrong: number;
    answers: ScoringAnswer[];
};

export type ScoringSelection = {
    question_id: number;
    answer_ids: number[];
};

export function calculateScore(
    questions: ScoringQuestion[],
    selections: ScoringSelection[],
    allowNegativeScore: boolean,
): number {
    let score = 0;

    for (const selection of selections) {
        const question = questions.find((q) => q.id === selection.question_id);
        if (!question) continue;

        const correctAnswers = question.answers.filter((a) => a.is_correct);
        if (correctAnswers.length === 0) continue;

        const selectedIds = new Set(selection.answer_ids);
        const correctIds = new Set(correctAnswers.map((a) => a.id));
        const wrongCount = [...selectedIds].filter((id) => !correctIds.has(id)).length;

        if (question.grading_mode === "all_or_nothing") {
            if (
                selectedIds.size > 0 &&
                selectedIds.size === correctIds.size &&
                [...selectedIds].every((id) => correctIds.has(id))
            ) {
                score += question.points;
            }
        } else if (wrongCount === 0) {
            const correctAnswersHavePoints = correctAnswers.some(
                (a) => a.points != null,
            );
            if (correctAnswersHavePoints) {
                score += correctAnswers
                    .filter((a) => selectedIds.has(a.id))
                    .reduce((sum, a) => sum + (a.points ?? 0), 0);
            } else {
                const correctCount = [...selectedIds].filter((id) =>
                    correctIds.has(id),
                ).length;
                score += (correctCount / correctAnswers.length) * question.points;
            }
        }

        score -= wrongCount * question.penalty_per_wrong;
    }

    return allowNegativeScore ? score : Math.max(score, 0);
}

export function totalPoints(questions: { points: number }[]): number {
    return questions.reduce((sum, q) => sum + q.points, 0);
}

export function isPassed(
    questions: ScoringQuestion[],
    score: number,
    passThreshold: number,
): boolean {
    const total = totalPoints(questions);
    if (total === 0) return false;
    return (score / total) * 100 >= passThreshold;
}

export function calculateGrade(
    questions: { points: number }[],
    score: number,
    gradeTiers: Record<string, number> | null | undefined,
): string | null {
    if (!gradeTiers) return null;
    const total = totalPoints(questions);
    if (total === 0) return null;
    const percent = (score / total) * 100;

    const tiers = Object.entries(gradeTiers).sort((a, b) => b[1] - a[1]);
    for (const [grade, threshold] of tiers) {
        if (percent >= threshold) {
            return grade;
        }
    }
    return null;
}
