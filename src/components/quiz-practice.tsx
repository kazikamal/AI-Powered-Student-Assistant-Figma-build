import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { toast } from 'sonner@2.0.3';
import { Brain, Play, RotateCcw, CheckCircle, XCircle, Clock, Trophy, Target, Sparkles, Loader2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface QuizPracticeProps {
  user: any;
}

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizResult {
  questionIndex: number;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpent: number;
}

export function QuizPractice({ user }: QuizPracticeProps) {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [questionCount, setQuestionCount] = useState(5);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [quizStartTime, setQuizStartTime] = useState<number | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number | null>(null);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savedQuizzes, setSavedQuizzes] = useState<any[]>([]);

  useEffect(() => {
    fetchSavedQuizzes();
  }, []);

  useEffect(() => {
    if (isQuizActive && !isQuizComplete) {
      setQuestionStartTime(Date.now());
    }
  }, [currentQuestionIndex, isQuizActive, isQuizComplete]);

  const fetchSavedQuizzes = async () => {
    try {
      const token = user?.access_token || localStorage.getItem('supabase.auth.token');
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e9ea3e56/user/content`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSavedQuizzes(data.quizzes || []);
      }
    } catch (error) {
      console.error('Error fetching saved quizzes:', error);
    }
  };

  const generateQuiz = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic for the quiz');
      return;
    }

    setLoading(true);
    try {
      const token = user?.access_token || localStorage.getItem('supabase.auth.token');
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e9ea3e56/ai/generate-quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          topic,
          difficulty,
          questionCount
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate quiz');
      }

      setQuestions(data.questions);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setQuizResults([]);
      setIsQuizActive(true);
      setIsQuizComplete(false);
      setShowExplanation(false);
      setQuizStartTime(Date.now());
      toast.success(`Quiz generated with ${data.questions.length} questions!`);
      fetchSavedQuizzes(); // Refresh saved quizzes
    } catch (error: any) {
      console.error('Generate quiz error:', error);
      toast.error(error.message || 'Failed to generate quiz');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = () => {
    if (selectedAnswer === null) {
      toast.error('Please select an answer');
      return;
    }

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const timeSpent = questionStartTime ? Date.now() - questionStartTime : 0;

    const result: QuizResult = {
      questionIndex: currentQuestionIndex,
      selectedAnswer,
      isCorrect,
      timeSpent
    };

    setQuizResults([...quizResults, result]);
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      completeQuiz();
    }
  };

  const completeQuiz = () => {
    setIsQuizActive(false);
    setIsQuizComplete(true);
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setQuizResults([]);
    setIsQuizActive(true);
    setIsQuizComplete(false);
    setShowExplanation(false);
    setQuizStartTime(Date.now());
  };

  const startNewQuiz = () => {
    setQuestions([]);
    setTopic('');
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setQuizResults([]);
    setIsQuizActive(false);
    setIsQuizComplete(false);
    setShowExplanation(false);
    setQuizStartTime(null);
  };

  const loadSavedQuiz = (quiz: any) => {
    setTopic(quiz.topic);
    setDifficulty(quiz.difficulty);
    setQuestions(quiz.questions || []);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setQuizResults([]);
    setIsQuizActive(true);
    setIsQuizComplete(false);
    setShowExplanation(false);
    setQuizStartTime(Date.now());
    toast.success('Quiz loaded!');
  };

  const getQuizStats = () => {
    const correctAnswers = quizResults.filter(r => r.isCorrect).length;
    const totalQuestions = quizResults.length;
    const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    const totalTime = quizStartTime ? Date.now() - quizStartTime : 0;
    const averageTimePerQuestion = totalQuestions > 0 ? totalTime / totalQuestions / 1000 : 0;

    return {
      correctAnswers,
      totalQuestions,
      accuracy,
      totalTime: Math.round(totalTime / 1000),
      averageTimePerQuestion: Math.round(averageTimePerQuestion)
    };
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Quiz Setup Screen
  if (!isQuizActive && !isQuizComplete) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-6 w-6 text-red-600" />
              <span>Quiz Practice</span>
            </CardTitle>
            <CardDescription>
              Test your knowledge with AI-generated multiple choice questions
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Create New Quiz</CardTitle>
              <CardDescription>Generate questions on any topic</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="topic">Topic/Subject</Label>
                <Input
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., World War II, Algebra, Biology, Python Programming"
                />
              </div>

              <div>
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <select
                  id="difficulty"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-background"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <Label htmlFor="questionCount">Number of Questions</Label>
                <Input
                  id="questionCount"
                  type="number"
                  min="3"
                  max="15"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value) || 5)}
                />
              </div>

              <Button
                onClick={generateQuiz}
                disabled={loading || !topic.trim()}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Quiz...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Quiz
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {savedQuizzes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Previous Quizzes</CardTitle>
                <CardDescription>Retake your saved quizzes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {savedQuizzes.slice(0, 5).map((quiz, index) => (
                    <div key={index} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer" onClick={() => loadSavedQuiz(quiz)}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm">{quiz.topic}</span>
                          <Badge variant="outline" className={getDifficultyColor(quiz.difficulty)}>
                            {quiz.difficulty}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(quiz.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <Brain className="h-3 w-3" />
                        <span>{quiz.questions?.length || 0} questions</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Tips */}
        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <CardContent className="p-4">
            <h3 className="font-medium text-red-900 dark:text-red-100 mb-2">🧠 Quiz Tips:</h3>
            <ul className="text-sm text-red-800 dark:text-red-200 space-y-1">
              <li>• Read questions carefully before selecting an answer</li>
              <li>• Use the process of elimination for difficult questions</li>
              <li>• Review explanations to understand correct answers</li>
              <li>• Take multiple quizzes on the same topic to reinforce learning</li>
              <li>• Challenge yourself with harder difficulty levels</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Quiz Complete Screen
  if (isQuizComplete) {
    const stats = getQuizStats();
    const scorePercentage = Math.round((stats.correctAnswers / questions.length) * 100);

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-6 w-6 text-yellow-600" />
              <span>Quiz Complete!</span>
            </CardTitle>
            <CardDescription>
              {topic} • {difficulty} difficulty
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Score Circle */}
              <div className="text-center">
                <div className="relative inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  <div className="text-3xl font-bold">{scorePercentage}%</div>
                </div>
                <p className="mt-2 text-lg font-medium">
                  {stats.correctAnswers} out of {questions.length} correct
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-green-600">{stats.correctAnswers}</p>
                  <p className="text-sm text-green-700 dark:text-green-300">Correct</p>
                </div>

                <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <XCircle className="h-6 w-6 text-red-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-red-600">{questions.length - stats.correctAnswers}</p>
                  <p className="text-sm text-red-700 dark:text-red-300">Incorrect</p>
                </div>

                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Clock className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-blue-600">{formatTime(stats.totalTime)}</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">Total Time</p>
                </div>

                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <Target className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-purple-600">{stats.averageTimePerQuestion}s</p>
                  <p className="text-sm text-purple-700 dark:text-purple-300">Avg/Question</p>
                </div>
              </div>

              {/* Performance Message */}
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-lg font-medium mb-2">
                  {scorePercentage >= 90 ? '🎉 Excellent!' :
                   scorePercentage >= 70 ? '👍 Good job!' :
                   scorePercentage >= 50 ? '📚 Keep studying!' : '💪 Practice more!'}
                </p>
                <p className="text-muted-foreground">
                  {scorePercentage >= 90 ? 'You have mastered this topic!' :
                   scorePercentage >= 70 ? 'You have a solid understanding.' :
                   scorePercentage >= 50 ? 'Review the material and try again.' : 'Focus on the basics and practice more.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button onClick={restartQuiz} className="flex-1">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retake Quiz
                </Button>
                <Button onClick={startNewQuiz} variant="outline" className="flex-1">
                  <Play className="h-4 w-4 mr-2" />
                  New Quiz
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Results */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Question Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {questions.map((question, index) => {
                const result = quizResults[index];
                return (
                  <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <div className={`rounded-full p-1 ${result?.isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                        {result?.isCorrect ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium mb-2">{question.question}</p>
                        <p className="text-sm text-muted-foreground mb-2">
                          Your answer: {question.options[result?.selectedAnswer || 0]}
                        </p>
                        {!result?.isCorrect && (
                          <p className="text-sm text-green-600 mb-2">
                            Correct answer: {question.options[question.correctAnswer]}
                          </p>
                        )}
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {question.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Active Quiz Screen
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="space-y-6">
      {/* Quiz Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-6 w-6 text-red-600" />
                <span>{topic}</span>
                <Badge variant="outline" className={getDifficultyColor(difficulty)}>
                  {difficulty}
                </Badge>
              </CardTitle>
              <CardDescription>
                Question {currentQuestionIndex + 1} of {questions.length}
              </CardDescription>
            </div>
            <Button onClick={startNewQuiz} variant="outline" size="sm">
              Exit Quiz
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl leading-relaxed">
            {currentQuestion.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!showExplanation ? (
            <>
              <RadioGroup
                value={selectedAnswer?.toString()}
                onValueChange={(value) => setSelectedAnswer(parseInt(value))}
              >
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <Button
                onClick={submitAnswer}
                disabled={selectedAnswer === null}
                className="w-full"
              >
                Submit Answer
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              {/* Answer Result */}
              <div className={`p-4 rounded-lg ${quizResults[quizResults.length - 1]?.isCorrect ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
                <div className="flex items-center space-x-2 mb-2">
                  {quizResults[quizResults.length - 1]?.isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className={`font-medium ${quizResults[quizResults.length - 1]?.isCorrect ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                    {quizResults[quizResults.length - 1]?.isCorrect ? 'Correct!' : 'Incorrect'}
                  </span>
                </div>
                <p className="text-sm">
                  <strong>Your answer:</strong> {currentQuestion.options[selectedAnswer!]}
                </p>
                {!quizResults[quizResults.length - 1]?.isCorrect && (
                  <p className="text-sm">
                    <strong>Correct answer:</strong> {currentQuestion.options[currentQuestion.correctAnswer]}
                  </p>
                )}
              </div>

              {/* Explanation */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Explanation</h3>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {currentQuestion.explanation}
                </p>
              </div>

              <Button onClick={nextQuestion} className="w-full">
                {currentQuestionIndex === questions.length - 1 ? 'Complete Quiz' : 'Next Question'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}