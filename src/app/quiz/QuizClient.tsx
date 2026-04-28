"use client";

import { useState, useEffect } from "react";
import { Country } from "@/types/country";
import Image from "next/image";
import { BrainCircuit, Flag, MapPin, Trophy, RefreshCw, ChevronRight, XCircle, CheckCircle2, Globe } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

type QuestionType = "capital" | "flag";

interface Question {
  id: string;
  type: QuestionType;
  country: Country;
  options: string[];
  correctAnswer: string;
}

export default function QuizClient() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [gameState, setGameState] = useState<"start" | "playing" | "end">("start");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all?fields=name,capital,flags,cca3")
      .then(r => r.ok ? r.json() : Promise.reject("Failed"))
      .then(setCountries)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getRandomItems = <T,>(arr: T[], count: number): T[] => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const generateQuestions = () => {
    const validCountries = countries.filter(c => c.capital?.length && c.flags?.svg);
    const selectedCountries = getRandomItems(validCountries, 10);
    
    const newQuestions = selectedCountries.map((country, idx): Question => {
      const type: QuestionType = Math.random() > 0.5 ? "capital" : "flag";
      let correctAnswer = "", options: string[] = [];

      if (type === "capital") {
        correctAnswer = country.capital![0];
        const wrongCountries = validCountries.filter(c => c.cca3 !== country.cca3);
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
    setSelectedAnswer(null);
    setGameState("playing");
  };

  const handleAnswer = (answer: string) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(answer);
    if (answer === questions[currentIndex].correctAnswer) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
      setSelectedAnswer(null);
    } else {
      setGameState("end");
    }
  };

  if (loading) {
    return (
      <main className="flex-1 bg-zinc-950 text-zinc-50 min-h-screen">
        <div className="sticky top-0 z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-2"><Globe className="h-6 w-6 text-blue-500" /><span className="text-xl font-bold">World Insights</span></Link>
            <Navbar currentPage="quiz" />
          </div>
        </div>
        <div className="flex items-center justify-center h-64"><div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-500 border-t-blue-500" /></div>
      </main>
    );
  }

  if (gameState === "start") {
    return (
      <main className="flex-1 bg-zinc-950 text-zinc-50 min-h-screen">
        <div className="sticky top-0 z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-2"><Globe className="h-6 w-6 text-blue-500" /><span className="text-xl font-bold">World Insights</span></Link>
            <Navbar currentPage="quiz" />
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 sm:py-12">
          <div className="mb-8 border-b border-white/5 pb-8">
            <h2 className="text-3xl font-black text-white sm:text-4xl">Geography Quiz</h2>
            <p className="mt-2 text-zinc-400">Test your knowledge of the world&apos;s flags and capitals.</p>
          </div>
          <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
            <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-indigo-500/10 ring-1 ring-indigo-500/20">
              <BrainCircuit className="h-12 w-12 text-indigo-400" />
            </div>
            <h2 className="text-4xl font-black text-white mb-4">Test Your Knowledge</h2>
            <p className="text-zinc-400 mb-8 text-center max-w-md text-lg">Can you identify flags and capitals from around the world? Take our quick 10-question geography quiz.</p>
            <button onClick={generateQuestions} className="rounded-xl bg-white px-8 py-4 text-base font-bold text-black transition-all hover:bg-zinc-200 hover:scale-105 active:scale-95 shadow-lg shadow-white/10 flex items-center gap-2">
              Start Quiz <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (gameState === "end") {
    const percentage = (score / questions.length) * 100;
    return (
      <main className="flex-1 bg-zinc-950 text-zinc-50 min-h-screen">
        <div className="sticky top-0 z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-2"><Globe className="h-6 w-6 text-blue-500" /><span className="text-xl font-bold">World Insights</span></Link>
            <Navbar currentPage="quiz" />
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 sm:py-12">
          <div className="mb-8 border-b border-white/5 pb-8">
            <h2 className="text-3xl font-black text-white sm:text-4xl">Geography Quiz</h2>
            <p className="mt-2 text-zinc-400">Test your knowledge of the world&apos;s flags and capitals.</p>
          </div>
          <div className="flex flex-col items-center justify-center py-20 animate-in zoom-in-95 duration-500">
            <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-amber-500/10 ring-4 ring-amber-500/20">
              <Trophy className="h-16 w-16 text-amber-400" />
            </div>
            <h2 className="text-5xl font-black text-white mb-2">{score} / {questions.length}</h2>
            <p className="text-xl font-medium text-zinc-400 mb-8">{percentage >= 80 ? "Geography Master!" : percentage >= 50 ? "Not bad!" : "Keep practicing!"}</p>
            <button onClick={generateQuestions} className="rounded-xl bg-white/10 px-8 py-4 text-base font-bold text-white transition-all hover:bg-white/20 active:scale-95 ring-1 ring-white/10 flex items-center gap-2">
              <RefreshCw className="h-5 w-5" /> Play Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  const question = questions[currentIndex];
  const isAnswered = selectedAnswer !== null;

  if (!question || questions.length === 0) {
    return (
      <main className="flex-1 bg-zinc-950 text-zinc-50 min-h-screen">
        <div className="sticky top-0 z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-2"><Globe className="h-6 w-6 text-blue-500" /><span className="text-xl font-bold">World Insights</span></Link>
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
          <Link href="/" className="flex items-center gap-2"><Globe className="h-6 w-6 text-blue-500" /><span className="text-xl font-bold">World Insights</span></Link>
          <Navbar currentPage="quiz" />
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 sm:py-12">
        <div className="mb-8 border-b border-white/5 pb-8">
          <h2 className="text-3xl font-black text-white sm:text-4xl">Geography Quiz</h2>
          <p className="mt-2 text-zinc-400">Test your knowledge of the world&apos;s flags and capitals.</p>
        </div>
        
        <div className="max-w-2xl mx-auto py-8">
          <div className="mb-8">
            <div className="flex justify-between text-sm font-bold text-zinc-400 mb-2">
              <span>Question {currentIndex + 1} of {questions.length}</span>
              <span className="text-indigo-400">Score: {score}</span>
            </div>
            <div className="h-2.5 w-full bg-zinc-900 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 transition-all duration-500 ease-out rounded-full" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
            </div>
          </div>

          <div className="rounded-3xl border border-white/5 bg-zinc-900/50 p-6 sm:p-10 shadow-2xl">
            <div className="text-center mb-8">
              {question.type === "flag" ? (
                <div className="flex flex-col items-center">
                  <span className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-zinc-500 mb-6"><Flag className="h-4 w-4" /> Guess the Country</span>
                  <div className="relative h-40 w-64 sm:h-56 sm:w-80 rounded-xl overflow-hidden shadow-md ring-1 ring-white/10">
                    <Image src={question.country.flags.svg} alt="Mystery Flag" fill className="object-cover" />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <span className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-zinc-500 mb-4"><MapPin className="h-4 w-4" /> Guess the Capital</span>
                  <h3 className="text-3xl sm:text-4xl font-black text-white leading-tight">What is the capital of <span className="text-indigo-400">{question.country.name.common}</span>?</h3>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {question.options.map((opt, i) => {
                const isSelected = selectedAnswer === opt;
                const isCorrect = opt === question.correctAnswer;
                let btnClass = "border-white/5 bg-white/5 hover:bg-white/10 text-white";
                if (isAnswered) {
                  if (isCorrect) btnClass = "border-emerald-500/50 bg-emerald-500/20 text-emerald-400";
                  else if (isSelected) btnClass = "border-red-500/50 bg-red-500/20 text-red-400";
                  else btnClass = "border-white/5 bg-zinc-950/50 text-zinc-500 opacity-50";
                }
                return (
                  <button key={i} onClick={() => handleAnswer(opt)} disabled={isAnswered} className={`relative flex items-center justify-between rounded-xl border p-4 text-left font-bold transition-all ${btnClass} ${!isAnswered && 'hover:scale-[1.02] active:scale-[0.98]'}`}>
                    {opt}
                    {isAnswered && isCorrect && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
                    {isAnswered && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-red-400" />}
                  </button>
                );
              })}
            </div>

            {isAnswered && (
              <div className="mt-8 flex justify-center animate-in fade-in slide-in-from-bottom-4">
                <button onClick={handleNext} className="rounded-xl bg-indigo-500 px-8 py-3.5 text-sm font-bold text-white transition-all hover:bg-indigo-400 active:scale-95 shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                  {currentIndex < questions.length - 1 ? "Next Question" : "See Results"} <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}