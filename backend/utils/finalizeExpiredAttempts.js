const {
    getExpiredAttempts,
    getQuestionsForScoring,
    getSavedAnswers,
    updateAnswerCorrectness,
    completeAttempt,
} = require("../models/attemptModel");

const {
    getQuizById,
} = require("../models/quizModel");

const finalizeExpiredAttempts = async (userId) => {
    const expiredAttempts =
        await getExpiredAttempts(userId);

    for (const attempt of expiredAttempts) {

        const questions =
            await getQuestionsForScoring(
                attempt.quiz_id
            );

        const savedAnswers =
            await getSavedAnswers(attempt.id);

        let correctAnswers = 0;
        let incorrectAnswers = 0;
        let unanswered = 0;

        let obtainedMarks = 0;
        let totalMarks = 0;

        for (const question of questions) {

            const marks = Number(
                question.marks
            );

            totalMarks += marks;

            const savedAnswer =
                savedAnswers.find(
                    (answer) =>
                        Number(answer.question_id) ===
                        Number(question.question_id)
                );

            if (!savedAnswer) {
                unanswered++;
                continue;
            }

            const isCorrect =
                Number(
                    savedAnswer.selected_option_id
                ) ===
                Number(
                    question.correct_option_id
                );

            if (isCorrect) {
                correctAnswers++;
                obtainedMarks += marks;
            } else {
                incorrectAnswers++;
            }

            await updateAnswerCorrectness(
                savedAnswer.id,
                isCorrect
            );
        }

        const percentage =
            totalMarks > 0
                ? (obtainedMarks / totalMarks) * 100
                : 0;

        const quiz = await getQuizById(
            attempt.quiz_id
        );

        if (!quiz) {
            continue;
        }

        const status =
            percentage >=
            Number(quiz.passing_score)
                ? "PASSED"
                : "FAILED";

        const startedAt =
            new Date(attempt.started_at);

        const expiresAt =
            new Date(attempt.expires_at);

        const timeTaken = Math.max(
            0,
            Math.floor(
                (
                    expiresAt.getTime() -
                    startedAt.getTime()
                ) / 1000
            )
        );

        await completeAttempt(
            attempt.id,
            {
                score: obtainedMarks,

                percentage: Number(
                    percentage.toFixed(2)
                ),

                correctAnswers,
                incorrectAnswers,
                unanswered,
                timeTaken,
                status,
            }
        );
    }
};

module.exports = finalizeExpiredAttempts;