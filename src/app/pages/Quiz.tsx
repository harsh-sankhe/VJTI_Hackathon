import { useState } from "react";
import { CheckCircle2, Clock, Brain, ArrowRight, ArrowLeft } from "lucide-react";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

const quizQuestions: Question[] = [
  {
    id: 1,
    question: "What is the time complexity of binary search in a sorted array?",
    options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
    correctAnswer: 1,
  },
  {
    id: 2,
    question: "Which React Hook is used for side effects?",
    options: ["useState", "useEffect", "useContext", "useMemo"],
    correctAnswer: 1,
  },
  {
    id: 3,
    question: "What does CSS 'flex-direction: column' do?",
    options: [
      "Arranges items horizontally",
      "Arranges items vertically",
      "Centers items",
      "Distributes space evenly",
    ],
    correctAnswer: 1,
  },
];

type Confidence = "sure" | "unsure" | "guessing" | null;

export function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<Confidence>(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;
  const question = quizQuestions[currentQuestion];

  const handleNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setConfidence(null);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(null);
      setConfidence(null);
    }
  };

  const getConfidenceColor = (conf: string) => {
    switch (conf) {
      case "sure":
        return "bg-[#22c55e] border-[#22c55e] text-white";
      case "unsure":
        return "bg-[#f59e0b] border-[#f59e0b] text-white";
      case "guessing":
        return "bg-[#ef4444] border-[#ef4444] text-white";
      default:
        return "bg-card border-border text-foreground";
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Adaptive Quiz</h1>
          <p className="text-muted-foreground">Data Structures & Algorithms</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg">
          <Clock className="w-5 h-5 text-[#6366f1]" />
          <span className="font-semibold text-foreground">
            {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground">Progress</span>
          <span className="text-sm font-semibold text-foreground">
            {currentQuestion + 1} of {quizQuestions.length}
          </span>
        </div>
        <div className="w-full bg-secondary rounded-full h-3">
          <div
            className="bg-gradient-to-r from-[#6366f1] to-[#a855f7] h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-card border border-border rounded-xl p-8 hover:shadow-lg transition-all">
        <div className="flex items-start gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-[#6366f1] to-[#a855f7] rounded-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-foreground mb-2">Question {currentQuestion + 1}</h2>
            <p className="text-lg text-foreground leading-relaxed">{question.question}</p>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => setSelectedAnswer(index)}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                selectedAnswer === index
                  ? "border-[#6366f1] bg-[#6366f1]/10 shadow-md"
                  : "border-border bg-secondary hover:border-[#6366f1]/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    selectedAnswer === index
                      ? "border-[#6366f1] bg-[#6366f1]"
                      : "border-muted-foreground"
                  }`}
                >
                  {selectedAnswer === index && <div className="w-2 h-2 bg-white rounded-full"></div>}
                </div>
                <span className="font-medium text-foreground">{option}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Confidence Selector */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-foreground mb-3">How confident are you?</p>
          <div className="grid grid-cols-3 gap-3">
            {(["sure", "unsure", "guessing"] as const).map((conf) => (
              <button
                key={conf}
                onClick={() => setConfidence(conf)}
                className={`px-4 py-3 rounded-lg border-2 font-medium transition-all capitalize ${
                  confidence === conf
                    ? getConfidenceColor(conf)
                    : "bg-secondary border-border text-foreground hover:border-muted-foreground"
                }`}
              >
                {conf}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="px-6 py-3 bg-secondary border border-border text-foreground rounded-lg hover:bg-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={selectedAnswer === null || confidence === null}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {currentQuestion === quizQuestions.length - 1 ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Submit Quiz
              </>
            ) : (
              <>
                Next Question
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-[#6366f1]/10 border border-[#6366f1]/20 rounded-xl p-4">
        <p className="text-sm text-foreground">
          💡 <span className="font-semibold">Adaptive Learning:</span> Your confidence level helps us understand your knowledge gaps and adjust future questions accordingly.
        </p>
      </div>
    </div>
  );
}
