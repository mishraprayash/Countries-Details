"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Country } from "@/types/country";
import Image from "next/image";
import { BrainCircuit, Flag, MapPin, Trophy, RefreshCw, ChevronRight, XCircle, CheckCircle2, Globe, Award, Clock, ArrowLeft, Eye } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useQuizLeaderboard } from "@/hooks/useQuizLeaderboard";

type QuestionType = "capital" | "flag" | "mixed";

interface Question {
  id: string;
  type: QuestionType;
  country: Country;
  options: string[];
  correctAnswer: string;
}

interface QuizSettings {
  questionCount: number;
  questionType: QuestionType;
  timer: number | null;
}

interface UserAnswer {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
}

export default function QuizClient() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [gameState, setGameState] = useState<"start" | "playing" | "results">("start");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [settings, setSettings] = useState<QuizSettings>({
    questionCount: 10,
    questionType: "mixed",
    timer: null,
  });
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isTimeUp, setIsTimeUp] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const scoreRef = useRef(0);
  const { scores, addScore, getPersonalBest, getTotalGamesPlayed, mounted, removeScore } = useQuizLeaderboard();

  // Keep scoreRef in sync with score state
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  // Fetch countries on mount
  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all?fields=name,capital,flags,cca3")
      .then(r => r.ok ? r.json() : Promise.reject("Failed"))
      .then(setCountries)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Timer effect - runs independently
  useEffect(() => {
    if (!settings.timer || gameState !== "playing" || timeLeft === null || timeLeft <= 0) {
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [settings.timer, gameState, timeLeft]);

  const finishQuiz = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const finalScore = scoreRef.current;
    addScore(finalScore, questions.length, settings.questionType);
    setGameState("results");
  }, [addScore, questions.length, settings.questionType]);

  // Check for time up
  useEffect(() => {
    if (timeLeft === 0 && gameState === "playing") {
      // Use setTimeout to avoid synchronous state update in effect
      const timeoutId = setTimeout(() => {
        setIsTimeUp(true);
        finishQuiz();
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [timeLeft, gameState, finishQuiz]);

  const getRandomItems = <T,>(arr: T[], count: number): T[] => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const generateQuestions = () => {
    const validCountries = countries.filter(c => c.capital?.length && c.flags?.svg);
    const selectedCountries = getRandomItems(validCountries, settings.questionCount);
    
    const newQuestions = selectedCountries.map((country, idx): Question => {
      let type: QuestionType;
      
      if (settings.questionType === "mixed") {
        type = Math.random() > 0.5 ? "capital" : "flag";
      } else {
        type = settings.questionType;
      }
      
      let correctAnswer = "";
      let options: string[] = [];

      if (type === "capital") {
        correctAnswer = country.capital![0];
        const wrongCountries = validCountries.filter(c => c.cca3 !== country.cca3 && c.capital?.[0]);
        const wrongOptions = getRandomItems(wrongCountries, 3).map(c => c.capital![0]);
        options = [...wrongOptions, correctAnswer].sort(() => 0.5 - Math.random());
      } else {
        correctAnswer = country.name.common;
        const wrongCountries = validCountries.filter(c => c.cca3 !== country.cca3);
        const wrongOptions = getRandomItems(wrongCountries, 3).map(c => c.name.common);
        options = [...wrongOptions, correctAnswer].sort(() => 0.5 - Math.random());
      }

      return { id: `q-${idx}`, type, country, correctAnswer, options };
    });

    setQuestions(newQuestions);
    setCurrentIndex(0);
    setScore(0);
    setScoreRef(0);
    setSelectedAnswer(null);
    setUserAnswers([]);
    setIsTimeUp(false);
    if (settings.timer) {
      setTimeLeft(settings.timer);
    } else {
      setTimeLeft(null);
    }
    setGameState("playing");
  };

  const setScoreRef = (val: number) => {
    scoreRef.current = val;
    setScore(val);
  };

  const handleAnswer = (answer: string) => {
    if (selectedAnswer !== null) return;
    
    const currentQuestion = questions[currentIndex];
    const isCorrect = answer === currentQuestion.correctAnswer;
    
    setSelectedAnswer(answer);
    setScoreRef(scoreRef.current + (isCorrect ? 1 : 0));
    
    setUserAnswers(prev => [
      ...prev,
      {
        questionId: currentQuestion.id,
        selectedAnswer: answer,
        isCorrect
      }
    ]);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
      setSelectedAnswer(null);
    } else {
      finishQuiz();
    }
  };

  const exitQuiz = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setGameState("start");
    setQuestions([]);
    setCurrentIndex(0);
    setScore(0);
    setScoreRef(0);
    setSelectedAnswer(null);
    setUserAnswers([]);
    setTimeLeft(null);
    setIsTimeUp(false);
  };

  const restartQuiz = () => {
    generateQuestions();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <main className="flex-1 bg-zinc-950 text-zinc-50 min-h-screen">
        <div className="sticky top-0 z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-2">
              <Globe className="h-6 w-6 text-blue-500" />
              <span className="text-xl font-bold">World Insights</span>
            </Link>
            <Navbar currentPage="quiz" />
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-500 border-t-blue-500" />
        </div>
      </main>
    );
  }

  // START SCREEN
  if (gameState === "start") {
    return (
      <main className="flex-1 bg-zinc-950 text-zinc-50 min-h-screen">
        <div className="sticky top-0 z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-2">
              <Globe className="h-6 w-6 text-blue-500" />
              <span className="text-xl font-bold">World Insights</span>
            </Link>
            <Navbar currentPage="quiz" />
          </div>
        </div>
        
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 sm:py-12">
          <div className="mb-8 border-b border-white/5 pb-8">
            <h2 className="text-3xl font-black text-white sm:text-4xl">Geography Quiz</h2>
            <p className="mt-2 text-zinc-400">Test your knowledge of the world&apos;s flags and capitals.</p>
          </div>
          
          {/* Settings */}
          <div className="mb-8 rounded-2xl border border-white/5 bg-zinc-900/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5" /> Quiz Settings
            </h3>
            <div className="grid gap-6 sm:grid-cols-3">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Questions</label>
                <div className="flex gap-2">
                  {[10, 20, 30].map(n => (
                    <button
                      key={n}
                      onClick={() => setSettings(s => ({ ...s, questionCount: n }))}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                        settings.questionCount === n
                          ? "bg-indigo-500 text-white"
                          : "bg-white/5 text-zinc-400 hover:bg-white/10"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Question Type</label>
                <div className="flex gap-2">
                  {(["mixed", "capital", "flag"] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setSettings(s => ({ ...s, questionType: t }))}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                        settings.questionType === t
                          ? "bg-indigo-500 text-white"
                          : "bg-white/5 text-zinc-400 hover:bg-white/10"
                      }`}
                    >
                      {t === "flag" ? "Flags" : t === "capital" ? "Capitals" : "Mixed"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Timer (seconds)</label>
                <div className="flex gap-2">
                  {[
                    { value: null, label: "Off" },
                    { value: 30, label: "30s" },
                    { value: 60, label: "60s" },
                    { value: 120, label: "120s" }
                  ].map(t => (
                    <button
                      key={t.label}
                      onClick={() => setSettings(s => ({ ...s, timer: t.value }))}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                        settings.timer === t.value
                          ? "bg-indigo-500 text-white"
                          : "bg-white/5 text-zinc-400 hover:bg-white/10"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center py-10 animate-in fade-in duration-500">
            <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-indigo-500/10 ring-1 ring-indigo-500/20">
              <BrainCircuit className="h-12 w-12 text-indigo-400" />
            </div>
            <h2 className="text-4xl font-black text-white mb-4">Test Your Knowledge</h2>
            <p className="text-zinc-400 mb-8 text-center max-w-md text-lg">
              {settings.questionCount} {settings.questionType === "mixed" ? "mixed" : settings.questionType + "s"} questions
              {settings.timer ? ` • ${settings.timer}s timer` : ""}
            </p>
            <button
              onClick={generateQuestions}
              className="rounded-xl bg-white px-8 py-4 text-base font-bold text-black transition-all hover:bg-zinc-200 hover:scale-105 active:scale-95 shadow-lg shadow-white/10 flex items-center gap-2"
            >
              Start Quiz <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Leaderboard */}
          {mounted && scores.length > 0 && (
            <div className="mt-12 rounded-2xl border border-white/5 bg-zinc-900/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-400" />
                  Your Performance
                </h3>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-zinc-400">Games: <span className="text-white font-semibold">{getTotalGamesPlayed()}</span></span>
                  {getPersonalBest() && (
                    <span className="text-zinc-400">Best: <span className="text-amber-400 font-semibold">{getPersonalBest()?.percentage}%</span></span>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                {scores.slice(0, 5).map((s, idx) => (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 group">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        idx === 0 ? "bg-amber-500/20 text-amber-400" : "bg-zinc-700 text-zinc-400"
                      }`}>
                        {idx + 1}
                      </span>
                      <span className="text-white font-medium">{s.score}/{s.totalQuestions}</span>
                      <span className="text-zinc-500 text-sm">{s.percentage}%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-zinc-500 text-xs">
                        {new Date(s.date).toLocaleDateString()} {new Date(s.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <button
                        onClick={() => removeScore(s.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-zinc-500 hover:text-red-400 transition-all"
                        title="Remove entry"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    );
  }

  // RESULTS SCREEN
  if (gameState === "results") {
    const percentage = Math.round((score / questions.length) * 100);
    
    return (
      <main className="flex-1 bg-zinc-950 text-zinc-50 min-h-screen">
        <div className="sticky top-0 z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-2">
              <Globe className="h-6 w-6 text-blue-500" />
              <span className="text-xl font-bold">World Insights</span>
            </Link>
            <Navbar currentPage="quiz" />
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 sm:py-12">
          <div className="mb-8 border-b border-white/5 pb-8 flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-black text-white sm:text-4xl">Quiz Results</h2>
              <p className="mt-2 text-zinc-400">
                {isTimeUp ? "Time's up!" : "Quiz completed!"} • {settings.questionType === "mixed" ? "Mixed" : settings.questionType === "flag" ? "Flags" : "Capitals"} • {settings.questionCount} questions
                {settings.timer && ` • ${settings.timer}s`}
              </p>
            </div>
          </div>

          {/* Score Summary */}
          <div className="flex flex-col items-center justify-center py-8 animate-in zoom-in-95 duration-500">
            <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-amber-500/10 ring-4 ring-amber-500/20">
              <Trophy className="h-16 w-16 text-amber-400" />
            </div>
            <h2 className="text-5xl font-black text-white mb-2">{score} / {questions.length}</h2>
            <p className="text-xl font-medium text-zinc-400 mb-2">{percentage}%</p>
            <p className="text-lg font-medium mb-8">
              {percentage >= 80 ? "🌟 Geography Master!" : percentage >= 50 ? "👍 Not bad!" : "📚 Keep practicing!"}
            </p>
            
            <div className="flex gap-4">
              <button onClick={restartQuiz} className="rounded-xl bg-indigo-500 px-8 py-4 text-base font-bold text-white transition-all hover:bg-indigo-400 active:scale-95 flex items-center gap-2">
                <RefreshCw className="h-5 w-5" /> Play Again
              </button>
              <button onClick={exitQuiz} className="rounded-xl bg-white/10 px-8 py-4 text-base font-bold text-white transition-all hover:bg-white/20 active:scale-95 ring-1 ring-white/10 flex items-center gap-2">
                Back to Settings
              </button>
            </div>
          </div>

          {/* Question Review */}
          <div className="mt-12">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Eye className="h-5 w-5" /> Question Review ({questions.length} questions)
            </h3>
            
            <div className="space-y-4">
              {questions.map((question, idx) => {
                const userAnswer = userAnswers.find(a => a.questionId === question.id);
                const isCorrect = userAnswer?.isCorrect ?? false;
                const isFlag = question.type === "flag";
                
                return (
                  <div key={question.id} className={`rounded-2xl border p-6 ${
                    isCorrect 
                      ? "border-emerald-500/30 bg-emerald-500/5" 
                      : "border-red-500/30 bg-red-500/5"
                  }`}>
                    <div className="flex items-start gap-4">
                      {/* Question number & type */}
                      <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold bg-zinc-800 text-zinc-400">
                        {idx + 1}
                      </div>
                      
                      {/* Question content */}
                      <div className="flex-1">
                        {isFlag ? (
                          <div className="flex items-center gap-4 mb-4">
                            <div className="relative w-24 h-16 rounded-lg overflow-hidden shrink-0">
                              <Image 
                                src={question.country.flags.svg} 
                                alt="Flag" 
                                fill 
                                className="object-cover" 
                              />
                            </div>
                            <div>
                              <p className="text-sm text-zinc-500 uppercase tracking-wider mb-1">Which country?</p>
                              <p className="text-lg font-bold text-white">
                                {isCorrect 
                                  ? question.correctAnswer 
                                  : <span className="text-red-400">{userAnswer?.selectedAnswer}</span>
                                }
                                {!isCorrect && (
                                  <span className="text-emerald-400 ml-2">→ {question.correctAnswer}</span>
                                )}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="mb-4">
                            <p className="text-sm text-zinc-500 uppercase tracking-wider mb-1">Capital of</p>
                            <p className="text-xl font-bold text-white">{question.country.name.common}</p>
                            <p className="text-lg mt-2">
                              {isCorrect 
                                ? question.correctAnswer 
                                : <span className="text-red-400">{userAnswer?.selectedAnswer}</span>
                              }
                              {!isCorrect && (
                                <span className="text-emerald-400 ml-2">→ {question.correctAnswer}</span>
                              )}
                            </p>
                          </div>
                        )}
                        
                        {/* Options preview */}
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          {question.options.map((opt, optIdx) => {
                            const isSelected = userAnswer?.selectedAnswer === opt;
                            const isCorrectOption = opt === question.correctAnswer;
                            
                            let optClass = "bg-white/5 text-zinc-400 text-sm py-2 px-3 rounded-lg flex items-center justify-center text-center";
                            if (isCorrectOption) {
                              optClass = "bg-emerald-500/20 text-emerald-400 font-medium flex items-center justify-center text-center rounded-lg ring-2 ring-emerald-500/50";
                            } else if (isSelected && !isCorrect) {
                              optClass = "bg-red-500/20 text-red-400 flex items-center justify-center text-center rounded-lg ring-2 ring-red-500/50";
                            }
                            
                            return (
                              <div key={optIdx} className={optClass}>
                                <span className="truncate">{opt}</span>
                                {isSelected && (
                                  isCorrect ? <CheckCircle2 className="inline ml-1 h-3 w-3 flex-shrink-0" /> : <XCircle className="inline ml-1 h-3 w-3 flex-shrink-0" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    );
  }

  // PLAYING SCREEN
  const question = questions[currentIndex];
  const isAnswered = selectedAnswer !== null;

  if (!question || questions.length === 0) {
    return (
      <main className="flex-1 bg-zinc-950 text-zinc-50 min-h-screen">
        <div className="sticky top-0 z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-2">
              <Globe className="h-6 w-6 text-blue-500" />
              <span className="text-xl font-bold">World Insights</span>
            </Link>
            <Navbar currentPage="quiz" />
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 sm:py-12">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-zinc-500 border-t-blue-500" />
            <p className="text-zinc-400">Preparing quiz...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-zinc-950 text-zinc-50 min-h-screen">
      <div className="sticky top-0 z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Globe className="h-6 w-6 text-blue-500" />
            <span className="text-xl font-bold">World Insights</span>
          </Link>
          <Navbar currentPage="quiz" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 sm:py-12">
        <div className="mb-8 border-b border-white/5 pb-8 flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-black text-white sm:text-4xl">Geography Quiz</h2>
            <p className="mt-2 text-zinc-400">Test your knowledge of the world&apos;s flags and capitals.</p>
          </div>
          <button 
            onClick={exitQuiz}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Exit Quiz
          </button>
        </div>

        <div className="max-w-2xl mx-auto py-8">
          <div className="mb-8">
            <div className="flex justify-between items-center text-sm font-bold text-zinc-400 mb-2">
              <span>Question {currentIndex + 1} of {questions.length}</span>
              <div className="flex items-center gap-4">
                {settings.timer && timeLeft !== null && (
                  <span className={`flex items-center gap-1.5 font-mono text-lg ${
                    timeLeft <= 30 ? "text-red-400" : "text-indigo-400"
                  }`}>
                    <Clock className="h-4 w-4" />
                    <span className={timeLeft <= 30 ? "animate-pulse" : ""}>
                      {formatTime(timeLeft)}
                    </span>
                  </span>
                )}
                <span className="text-indigo-400">Score: {score}</span>
              </div>
            </div>
            <div className="h-2.5 w-full bg-zinc-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 transition-all duration-500 ease-out rounded-full" 
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} 
              />
            </div>
          </div>

          <div className="rounded-3xl border border-white/5 bg-zinc-900/50 p-6 sm:p-10 shadow-2xl">
            <div className="text-center mb-8">
              {question.type === "flag" ? (
                <div className="flex flex-col items-center">
                  <span className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-zinc-500 mb-6">
                    <Flag className="h-4 w-4" /> Guess the Country
                  </span>
                  <div className="relative h-40 w-64 sm:h-56 sm:w-80 rounded-xl overflow-hidden shadow-md ring-1 ring-white/10">
                    <Image src={question.country.flags.svg} alt="Flag" fill className="object-cover" />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <span className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-zinc-500 mb-4">
                    <MapPin className="h-4 w-4" /> Guess the Capital
                  </span>
                  <h3 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                    What is the capital of <span className="text-indigo-400">{question.country.name.common}</span>?
                  </h3>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {question.options.map((opt, i) => {
                const isSelected = selectedAnswer === opt;
                const isCorrect = opt === question.correctAnswer;
                let btnClass = "border-white/5 bg-white/5 hover:bg-white/10 text-white";
                
                if (isAnswered) {
                  if (isCorrect) {
                    btnClass = "border-emerald-500/50 bg-emerald-500/20 text-emerald-400";
                  } else if (isSelected) {
                    btnClass = "border-red-500/50 bg-red-500/20 text-red-400";
                  } else {
                    btnClass = "border-white/5 bg-zinc-950/50 text-zinc-500 opacity-50";
                  }
                }
                
                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(opt)}
                    disabled={isAnswered}
                    className={`relative flex items-center justify-center rounded-xl border p-4 text-center font-bold transition-all ${btnClass} ${!isAnswered && 'hover:scale-[1.02] active:scale-[0.98]'}`}
                  >
                    <span className="truncate">{opt}</span>
                    {isAnswered && isCorrect && <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0 ml-2" />}
                    {isAnswered && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-red-400 flex-shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>

            {isAnswered && (
              <div className="mt-8 flex justify-center animate-in fade-in slide-in-from-bottom-4">
                <button 
                  onClick={handleNext} 
                  className="rounded-xl bg-indigo-500 px-8 py-3.5 text-sm font-bold text-white transition-all hover:bg-indigo-400 active:scale-95 shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                >
                  {currentIndex < questions.length - 1 ? "Next Question" : "Finish Quiz"} <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}