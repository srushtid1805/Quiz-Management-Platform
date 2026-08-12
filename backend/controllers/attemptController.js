const {
  findActiveAttempt,
  countCompletedAttempts,
  createAttempt,
  getAttemptQuestions,
  findAnswer,
  saveAnswer,
  updateCurrentQuestion,

  getAttemptForSubmission,
  getQuestionsForScoring,
  getSavedAnswers,
  updateAnswerCorrectness,
  completeAttempt,

  getAttemptForAutoSubmission,

  getCompletedAttempt,
  getAttemptResultAnswers,
  getStudentAttemptHistory,

  getAllStudentAttemptsForAdmin,
  getAttemptDetailsForAdmin
} = require("../models/attemptModel");

const { getPublishedQuizById } = require("../models/quizModel");

// Start or resume quiz attempt
const startQuizAttempt = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.id;

    // Check quiz exists and is published
    const quiz = await getPublishedQuizById(quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found or not available"
      });
    }

    // Check if student already has an active attempt
    const activeAttempt = await findActiveAttempt(userId, quizId);

    if (activeAttempt) {
      return res.status(200).json({
        success: true,
        message: "Existing quiz attempt resumed",
        attempt: activeAttempt,
        quiz
      });
    }

    // Check completed attempt count
    const completedAttempts = await countCompletedAttempts(userId, quizId);

    if (completedAttempts >= Number(quiz.max_attempts)) {
      return res.status(403).json({
        success: false,
        message: "Maximum quiz attempts reached"
      });
    }

    // Create a new attempt
    const attempt = await createAttempt(userId, quizId, quiz.duration);

    return res.status(201).json({
      success: true,
      message: "Quiz attempt started successfully",
      attempt,
      quiz
    });
  } catch (error) {
    console.error("Start quiz attempt error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

const fetchAttemptQuestions = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user.id;

    const data = await getAttemptQuestions(attemptId, userId);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Active quiz attempt not found"
      });
    }

    const now = new Date();

    const expiresAt = new Date(data.attempt.expires_at);

    const remainingSeconds = Math.max(
      0,
      Math.floor((expiresAt.getTime() - now.getTime()) / 1000)
    );

    return res.status(200).json({
      success: true,
      attempt: data.attempt,
      remainingSeconds,
      questions: data.questions
    });
  } catch (error) {
    console.error("Fetch attempt questions error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

const saveAttemptProgress = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user.id;

    const { questionId, selectedOptionId, currentQuestion } = req.body;

    if (!questionId || !selectedOptionId || currentQuestion === undefined) {
      return res.status(400).json({
        success: false,
        message: "Question, selected option, and current question are required"
      });
    }

    // Make sure this attempt belongs to the logged-in student
    const attemptData = await getAttemptQuestions(attemptId, userId);

    if (!attemptData) {
      return res.status(404).json({
        success: false,
        message: "Active quiz attempt not found"
      });
    }

    const attempt = attemptData.attempt;

    // Check whether quiz time has already expired
    const now = new Date();
    const expiresAt = new Date(attempt.expires_at);

    if (now >= expiresAt) {
      return res.status(403).json({
        success: false,
        message: "Quiz time has expired"
      });
    }

    const answer = await saveAnswer(attemptId, questionId, selectedOptionId);

    const updatedAttempt = await updateCurrentQuestion(
      attemptId,
      userId,
      currentQuestion
    );

    return res.status(200).json({
      success: true,
      message: "Quiz progress saved successfully",
      answer,
      currentQuestion: updatedAttempt.current_question
    });
  } catch (error) {
    console.error("Save quiz progress error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

const submitQuizAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user.id;

    const attempt = await getAttemptForSubmission(attemptId, userId);

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Active quiz attempt not found"
      });
    }

    const questions = await getQuestionsForScoring(attempt.quiz_id);

    if (questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Quiz has no questions"
      });
    }

    const savedAnswers = await getSavedAnswers(attemptId);

    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let unanswered = 0;

    let obtainedMarks = 0;
    let totalMarks = 0;

    for (const question of questions) {
      const questionMarks = Number(question.marks);

      totalMarks += questionMarks;

      const savedAnswer = savedAnswers.find(
        (answer) => Number(answer.question_id) === Number(question.question_id)
      );

      // Student did not answer this question
      if (!savedAnswer) {
        unanswered++;
        continue;
      }

      const isCorrect =
        Number(savedAnswer.selected_option_id) ===
        Number(question.correct_option_id);

      if (isCorrect) {
        correctAnswers++;
        obtainedMarks += questionMarks;
      } else {
        incorrectAnswers++;
      }

      await updateAnswerCorrectness(savedAnswer.id, isCorrect);
    }

    const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;

    // Get quiz passing score
    const quiz = await getPublishedQuizById(attempt.quiz_id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found"
      });
    }

    const status =
      percentage >= Number(quiz.passing_score) ? "PASSED" : "FAILED";

    // Time taken in seconds
    const startedAt = new Date(attempt.started_at);

    const now = new Date();

    const expiresAt = new Date(attempt.expires_at);

    const effectiveEnd = now > expiresAt ? expiresAt : now;

    const timeTaken = Math.max(
      0,
      Math.floor((effectiveEnd.getTime() - startedAt.getTime()) / 1000)
    );

    const completedAttempt = await completeAttempt(attemptId, {
      score: obtainedMarks,
      percentage: Number(percentage.toFixed(2)),
      correctAnswers,
      incorrectAnswers,
      unanswered,
      timeTaken,
      status
    });

    return res.status(200).json({
      success: true,
      message: "Quiz submitted successfully",
      result: {
        attemptId: completedAttempt.id,
        score: completedAttempt.score,
        percentage: completedAttempt.percentage,
        correctAnswers: completedAttempt.correct_answers,
        incorrectAnswers: completedAttempt.incorrect_answers,
        unanswered: completedAttempt.unanswered,
        timeTaken: completedAttempt.time_taken,
        status: completedAttempt.status,
        completedAt: completedAttempt.completed_at
      }
    });
  } catch (error) {
    console.error("Submit quiz attempt error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

const autoSubmitExpiredAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user.id;

    const attempt = await getAttemptForAutoSubmission(attemptId, userId);

    if (!attempt) {
      return res.status(400).json({
        success: false,
        message: "Attempt has not expired or is already completed"
      });
    }

    const questions = await getQuestionsForScoring(attempt.quiz_id);

    const savedAnswers = await getSavedAnswers(attemptId);

    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let unanswered = 0;

    let obtainedMarks = 0;
    let totalMarks = 0;

    for (const question of questions) {
      const marks = Number(question.marks);

      totalMarks += marks;

      const savedAnswer = savedAnswers.find(
        (answer) => Number(answer.question_id) === Number(question.question_id)
      );

      if (!savedAnswer) {
        unanswered++;
        continue;
      }

      const isCorrect =
        Number(savedAnswer.selected_option_id) ===
        Number(question.correct_option_id);

      if (isCorrect) {
        correctAnswers++;
        obtainedMarks += marks;
      } else {
        incorrectAnswers++;
      }

      await updateAnswerCorrectness(savedAnswer.id, isCorrect);
    }

    const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;

    const quiz = await getPublishedQuizById(attempt.quiz_id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found"
      });
    }

    const status =
      percentage >= Number(quiz.passing_score) ? "PASSED" : "FAILED";

    const startedAt = new Date(attempt.started_at);

    const expiresAt = new Date(attempt.expires_at);

    const timeTaken = Math.max(
      0,
      Math.floor((expiresAt.getTime() - startedAt.getTime()) / 1000)
    );

    const completedAttempt = await completeAttempt(attemptId, {
      score: obtainedMarks,
      percentage: Number(percentage.toFixed(2)),
      correctAnswers,
      incorrectAnswers,
      unanswered,
      timeTaken,
      status
    });

    return res.status(200).json({
      success: true,
      message: "Quiz automatically submitted after time expiry",
      result: {
        attemptId: completedAttempt.id,
        score: completedAttempt.score,
        percentage: completedAttempt.percentage,
        correctAnswers: completedAttempt.correct_answers,
        incorrectAnswers: completedAttempt.incorrect_answers,
        unanswered: completedAttempt.unanswered,
        timeTaken: completedAttempt.time_taken,
        status: completedAttempt.status,
        completedAt: completedAttempt.completed_at
      }
    });
  } catch (error) {
    console.error("Auto submit quiz error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

const fetchAttemptResult = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user.id;

    const attempt = await getCompletedAttempt(attemptId, userId);

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Completed quiz attempt not found"
      });
    }

    const answeredRows = await getAttemptResultAnswers(attemptId);

    const questions = await getQuestionsForScoring(attempt.quiz_id);

    const review = [];

    for (const question of questions) {
      const answered = answeredRows.find(
        (row) => Number(row.question_id) === Number(question.question_id)
      );

      if (answered) {
        review.push({
          questionId: answered.question_id,
          questionText: answered.question_text,
          marks: answered.marks,
          selectedOptionId: answered.selected_option_id,
          selectedAnswer: answered.selected_answer,
          correctOptionId: answered.correct_option_id,
          correctAnswer: answered.correct_answer,
          isCorrect: answered.is_correct,
          explanation: answered.explanation,
          status: answered.is_correct ? "CORRECT" : "INCORRECT"
        });
      } else {
        review.push({
          questionId: question.question_id,
          questionText: question.question_text,
          marks: question.marks,

          selectedOptionId: null,
          selectedAnswer: null,

          correctOptionId: question.correct_option_id,
          correctAnswer: question.correct_answer,

          isCorrect: false,
          explanation: question.explanation,

          status: "UNANSWERED"
        });
      }
    }

    return res.status(200).json({
      success: true,

      result: {
        attemptId: attempt.id,
        quizId: attempt.quiz_id,
        quizTitle: attempt.quiz_title,

        score: attempt.score,
        percentage: attempt.percentage,

        correctAnswers: attempt.correct_answers,

        incorrectAnswers: attempt.incorrect_answers,

        unanswered: attempt.unanswered,

        timeTaken: attempt.time_taken,

        status: attempt.status,

        startedAt: attempt.started_at,

        completedAt: attempt.completed_at
      },

      review
    });
  } catch (error) {
    console.error("Fetch attempt result error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

const fetchStudentAttemptHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const attempts = await getStudentAttemptHistory(userId);

    return res.status(200).json({
      success: true,
      count: attempts.length,
      attempts
    });
  } catch (error) {
    console.error("Fetch student attempt history error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

const updateAttemptPosition = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user.id;

    const { currentQuestion } = req.body;

    if (currentQuestion === undefined) {
      return res.status(400).json({
        success: false,
        message: "Current question is required"
      });
    }

    // Verify active attempt belongs to student
    const attemptData = await getAttemptQuestions(attemptId, userId);

    if (!attemptData) {
      return res.status(404).json({
        success: false,
        message: "Active quiz attempt not found"
      });
    }

    const attempt = attemptData.attempt;

    // Do not allow navigation after expiry
    const now = new Date();
    const expiresAt = new Date(attempt.expires_at);

    if (now >= expiresAt) {
      return res.status(403).json({
        success: false,
        message: "Quiz time has expired"
      });
    }

    const updatedAttempt = await updateCurrentQuestion(
      attemptId,
      userId,
      currentQuestion
    );

    return res.status(200).json({
      success: true,
      message: "Quiz position saved successfully",
      currentQuestion: updatedAttempt.current_question
    });
  } catch (error) {
    console.error("Update quiz position error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

const fetchAllAttemptsForAdmin = async (req, res) => {
  try {
    const attempts = await getAllStudentAttemptsForAdmin();

    return res.status(200).json({
      success: true,
      count: attempts.length,
      attempts
    });
  } catch (error) {
    console.error("Admin fetch attempts error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

const fetchAttemptDetailsForAdmin = async (req, res) => {
  try {
    const { attemptId } = req.params;

    const attempt = await getAttemptDetailsForAdmin(attemptId);

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Attempt not found"
      });
    }

    const answeredRows = await getAttemptResultAnswers(attemptId);

    const questions = await getQuestionsForScoring(attempt.quiz_id);

    const review = [];

    for (const question of questions) {
      const answered = answeredRows.find(
        (row) => Number(row.question_id) === Number(question.question_id)
      );

      if (answered) {
        review.push({
          questionId: answered.question_id,

          questionText: answered.question_text,

          marks: answered.marks,

          selectedOptionId: answered.selected_option_id,

          selectedAnswer: answered.selected_answer,

          correctOptionId: answered.correct_option_id,

          correctAnswer: answered.correct_answer,

          isCorrect: answered.is_correct,

          explanation: answered.explanation,

          status: answered.is_correct ? "CORRECT" : "INCORRECT"
        });
      } else {
        review.push({
          questionId: question.question_id,

          questionText: question.question_text,

          marks: question.marks,

          selectedOptionId: null,
          selectedAnswer: null,

          correctOptionId: question.correct_option_id,

          correctAnswer: question.correct_answer,

          isCorrect: false,

          explanation: question.explanation,

          status: "UNANSWERED"
        });
      }
    }

    return res.status(200).json({
      success: true,
      attempt,
      review
    });
  } catch (error) {
    console.error("Admin fetch attempt details error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

module.exports = {
  startQuizAttempt,
  fetchAttemptQuestions,
  saveAttemptProgress,
  submitQuizAttempt,
  autoSubmitExpiredAttempt,
  fetchAttemptResult,
  fetchStudentAttemptHistory,
  updateAttemptPosition,
  
  fetchAllAttemptsForAdmin,
  fetchAttemptDetailsForAdmin,
};
