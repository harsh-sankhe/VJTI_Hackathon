import { useState, useEffect } from "react";
import { Brain, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router";
import { quizApi } from "../api/quizApi";

type Confidence = "sure" | "unsure" | "guessing" | null;

interface Question {
  id: number;
  question_text: string;
  options: string[];
  difficulty: number;
  subtopic: string;
}

export function Quiz() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const topicId = searchParams.get("topic_id") || "1"; // keep as string to support "1,2,3" multi-topic

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<string | null>(null);
  const [questionOrder, setQuestionOrder] = useState(1);
  const [question, setQuestion] = useState<Question | null>(null);

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<Confidence>(null);

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    initQuiz();
  }, []);

  const initQuiz = async () => {
    try {
      setLoading(true);
      const res = await quizApi.startSession(topicId as any);
      setSession(res.session_id);
      setQuestion(res.question);
      if (!res.question) {
        alert("No questions available for this topic. Please try another topic.");
        navigate("/app/quiz-select");
        return;
      }
      setQuestionOrder(res.question_order);
    } catch (err) {
      console.error(err);
      alert("Failed to start quiz session");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!session || !question || selectedAnswer === null || confidence === null) return;
    
    setSubmitting(true);
    try {
      const selectedOptionChar = ['a', 'b', 'c', 'd'][selectedAnswer];
      const res = await quizApi.answerQuestion(session, question.id, selectedOptionChar, confidence);
      setFeedback(res);
      setIsComplete(res.session_complete);
    } catch (err) {
      console.error(err);
      alert("Failed to submit answer");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (isComplete) {
      navigate(`/app/insights?session_id=${session}`);
      return;
    }
    // Load next question from feedback payload
    setQuestion(feedback.next_question);
    setQuestionOrder((prev) => prev + 1);
    setSelectedAnswer(null);
    setConfidence(null);
    setFeedback(null);
  };

  const getConfidenceColor = (conf: string) => {
    switch (conf) {
      case "sure": return "bg-[#22c55e] border-[#22c55e] text-white";
      case "unsure": return "bg-[#f59e0b] border-[#f59e0b] text-white";
      case "guessing": return "bg-[#ef4444] border-[#ef4444] text-white";
      default: return "bg-card border-border text-foreground";
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#6366f1]" />
        <span className="ml-3 text-lg font-medium">Starting Adaptive Quiz...</span>
      </div>
    );
  }

  if (!question) {
    return <div className="text-center text-red-500">Error loading question. Please try again.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Adaptive Quiz</h1>
          <div className="flex items-center gap-3">
             <span className="text-muted-foreground">{question.subtopic}</span>
             <span className="px-2 py-1 text-xs font-semibold rounded bg-muted">Difficulty: {question.difficulty}/5</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground">Progress</span>
          <span className="text-sm font-semibold text-foreground">
            Question {questionOrder}
          </span>
        </div>
        <div className="w-full bg-secondary rounded-full h-3">
          <div
            className="bg-gradient-to-r from-[#6366f1] to-[#a855f7] h-3 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(questionOrder * 10, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Question Card */}
      <div className={`bg-card border-2 rounded-xl p-8 transition-all ${feedback ? (feedback.is_correct ? "border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]" : "border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]") : "border-border hover:shadow-lg"}`}>
        <div className="flex items-start gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-[#6366f1] to-[#a855f7] rounded-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-foreground mb-2">Question {questionOrder}</h2>
            <p className="text-lg text-foreground leading-relaxed font-medium">{question.question_text}</p>
          </div>
        </div>

        {/* Confidence Selector - Must be selected before options are enabled */}
        {!feedback && (
           <div className="mb-6 p-4 rounded-lg bg-secondary/50 border border-border">
             <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
               <AlertCircle className="w-4 h-4 text-brand" />
               Select your confidence BEFORE picking an answer:
             </p>
             <div className="grid grid-cols-3 gap-3">
               {(["sure", "unsure", "guessing"] as const).map((conf) => (
                 <button
                   key={conf}
                   onClick={() => setConfidence(conf)}
                   className={`px-4 py-3 rounded-lg border-2 font-medium transition-all capitalize ${
                     confidence === conf
                       ? getConfidenceColor(conf)
                       : "bg-background border-border text-foreground hover:border-muted-foreground"
                   }`}
                 >
                   {conf === "sure" ? "🟢 Sure" : conf === "unsure" ? "🟡 Unsure" : "🎲 Guessing"}
                 </button>
               ))}
             </div>
           </div>
        )}

        {/* Options */}
        <div className="space-y-3 mb-6">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const optionChar = ['a', 'b', 'c', 'd'][index];
            const isCorrectOption = feedback?.correct_answer === optionChar;
            const isWrongSelection = feedback && !feedback.is_correct && isSelected;
            
            let btnClass = isSelected ? "border-[#6366f1] bg-[#6366f1]/10" : "border-border bg-background hover:border-[#6366f1]/50";
            
            if (feedback) {
               if (isCorrectOption) btnClass = "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400";
               else if (isWrongSelection) btnClass = "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400 opacity-60";
               else btnClass = "border-border bg-background opacity-50 cursor-not-allowed";
            } else if (confidence === null) {
               btnClass = "border-border bg-secondary/30 opacity-50 cursor-not-allowed grayscale";
            }

            return (
              <button
                key={index}
                disabled={confidence === null || feedback !== null}
                onClick={() => setSelectedAnswer(index)}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${btnClass}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      isSelected && !feedback ? "border-[#6366f1] bg-[#6366f1]" : "border-muted-foreground"
                    }`}
                  >
                    {isSelected && !feedback && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                  <span className="font-medium">{option}</span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Feedback Section */}
        {feedback && (
          <div className={`mb-6 p-4 rounded-lg border ${feedback.is_correct ? "bg-green-500/10 border-green-500/40" : "bg-red-500/10 border-red-500/40"}`}>
             <h3 className={`font-semibold text-lg flex items-center gap-2 ${feedback.is_correct ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                {feedback.is_correct ? "✅ Correct!" : "❌ Incorrect"}
                <span className="text-sm font-normal text-foreground ml-auto bg-background px-2 py-1 rounded">+{feedback.points_awarded} XP</span>
             </h3>
             
             {!feedback.is_correct && feedback.concept_gap && (
                <div className="mt-3">
                  <p className="text-sm font-semibold text-foreground">📌 Concept Review:</p>
                  <p className="text-sm text-foreground/80 mt-1">{feedback.concept_gap}</p>
                </div>
             )}

             {feedback.confidence_flag === 'lucky_guess' && (
                <p className="text-sm font-medium text-amber-500 mt-2">🎲 Lucky! This will be tested again.</p>
             )}
             
             {feedback.confidence_flag === 'critical_gap' && (
                <p className="text-sm font-medium text-red-500 mt-2">⚠️ Critical gap flagged for priority revision.</p>
             )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {!feedback ? (
            <button
              onClick={handleSubmit}
              disabled={selectedAnswer === null || confidence === null || submitting}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Answer"}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-brand to-[#a855f7] text-white font-semibold rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {isComplete ? (
                <>View My Results <ArrowRight className="w-5 h-5" /></>
              ) : (
                <>Next Question <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
