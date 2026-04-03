import { useState, useEffect } from "react";
import { codeGrindApi, TopicProgress, Problem, UserStats } from "./api";
import { TopicGrid } from "./TopicGrid";
import { ProblemList } from "./ProblemList";
import { ProgressDashboard } from "./ProgressDashboard";
import { ProblemActionModal } from "./ProblemActionModal";
import confetti from "canvas-confetti";
import { Code } from "lucide-react";

export function CodeGrind() {
  const [activeTab, setActiveTab] = useState<"topics" | "stats">("topics");
  
  // Data
  const [topics, setTopics] = useState<TopicProgress[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Selection state
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [t, p, s] = await Promise.all([
        codeGrindApi.getTopics(),
        codeGrindApi.getProblems(selectedTopics.length > 0 ? selectedTopics : undefined),
        codeGrindApi.getStats()
      ]);
      setTopics(t);
      setProblems(p);
      setStats(s);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedTopics]);

  const handleTopicSelect = (topicName: string) => {
    setSelectedTopics(prev => 
      prev.includes(topicName) ? prev.filter(t => t !== topicName) : [...prev, topicName]
    );
  };

  const handleCompleteSuccess = async (_xp_earned: number, _new_badges: any[]) => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    // Refresh data
    await loadData();
    setSelectedProblem(null);
  };

  if (loading && topics.length === 0) {
    return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-xl shadow-md">
              <Code className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold">Code Grind</h1>
          </div>
          <p className="text-muted-foreground">Master DSA with curated top-tier problems</p>
        </div>
        <div className="flex bg-secondary p-1 rounded-xl shadow-sm border border-border">
          <button
            onClick={() => setActiveTab("topics")}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === "topics"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Practice
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === "stats"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            My Stats
          </button>
        </div>
      </div>

      {/* Content Area */}
      {activeTab === "topics" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <TopicGrid 
            topics={topics} 
            selectedTopics={selectedTopics} 
            onTopicSelect={handleTopicSelect} 
          />
          
          {selectedTopics.length > 0 ? (
             <ProblemList 
               problems={problems} 
               onAction={(val: Problem) => setSelectedProblem(val)} 
             />
          ) : (
             <div className="bg-secondary/50 border border-border rounded-2xl p-12 text-center">
               <div className="mx-auto w-16 h-16 bg-card rounded-full flex items-center justify-center mb-4 shadow-sm border border-border">
                 <Code className="w-8 h-8 text-muted-foreground" />
               </div>
               <h3 className="text-lg font-semibold text-foreground mb-2">Select a topic</h3>
               <p className="text-muted-foreground max-w-md mx-auto">
                 Choose one or multiple topics from the grid above to start practicing curated problems.
               </p>
             </div>
          )}
        </div>
      )}

      {activeTab === "stats" && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <ProgressDashboard stats={stats} />
        </div>
      )}

      {/* Modal */}
      {selectedProblem && (
        <ProblemActionModal 
          problem={selectedProblem} 
          onClose={() => setSelectedProblem(null)}
          onSuccess={handleCompleteSuccess}
        />
      )}
    </div>
  );
}
