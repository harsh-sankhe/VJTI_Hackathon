import { useState, useEffect } from "react";
import { Problem, codeGrindApi } from "./api";
import { X, ExternalLink, Zap, CheckCircle2, MessageCircle, AlertCircle, Loader2, Send, Lock } from "lucide-react";
import { toast } from "sonner"; // Assuming sonner is used based on package.json

interface ModalProps {
  problem: Problem;
  onClose: () => void;
  onSuccess: (xp: number, badges: any[]) => void;
}

export function ProblemActionModal({ problem, onClose, onSuccess }: ModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'discussion'>('details');
  const [approach, setApproach] = useState("");
  const [discussionMsg, setDiscussionMsg] = useState("");
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);
  const [expandedApproaches, setExpandedApproaches] = useState<Record<number, boolean>>({});
  
  const wordCount = approach.trim().split(/\s+/).filter(w => w.length > 0).length;
  const isCompleted = problem.status === 'Completed';

  useEffect(() => {
    if (activeTab === 'discussion') {
      loadDiscussions();
    }
  }, [activeTab]);

  const loadDiscussions = async () => {
    setLoadingChats(true);
    try {
      const data = await codeGrindApi.getDiscussions(problem.problem_id);
      setDiscussions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingChats(false);
    }
  };

  const submitComment = async () => {
    if (!discussionMsg.trim()) return;
    try {
      const newChat = await codeGrindApi.postDiscussion(problem.problem_id, discussionMsg);
      setDiscussions(prev => [...prev, newChat]);
      setDiscussionMsg("");
    } catch (e) {
      toast.error("Failed to post message");
    }
  };

  const submitApproach = async () => {
    if (wordCount < 30) {
      toast.error("Please expand your approach (minimum 30 words).");
      return;
    }
    
    setLoading(true);
    try {
      const res = await codeGrindApi.submitApproach(problem.problem_id, approach);
      if (res.success) {
        toast.success(`Problem marked as completed! +${res.xp_earned} XP`);
        onSuccess(res.xp_earned, res.new_badges || []);
      } else {
        toast.error(res.error || "Failed to submit approach.");
      }
    } catch (e) {
      toast.error("Server error.");
    } finally {
      setLoading(false);
    }
  };

  const askForHint = async () => {
    setLoading(true);
    try {
      const res = await codeGrindApi.askForHint(problem.problem_id);
      if (res.success) {
        toast.success("Hint requested! Redirecting to Squad Chat...");
        // In a real app we would navigate /app/squad passing problem context
        setTimeout(() => onClose(), 1500); 
      }
    } catch (e) {
      toast.error("Failed to ask for hint.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-card w-full max-w-2xl border border-border rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-border bg-secondary/30">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                problem.difficulty === 'Easy' ? 'bg-success/10 text-success border-success/20' :
                problem.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' :
                'bg-destructive/10 text-destructive border-destructive/20'
              }`}>
                {problem.difficulty}
              </span>
              <span className="inline-flex items-center gap-1 text-sm font-bold text-accent">
                <Zap className="w-4 h-4" /> {problem.xp_value} XP
              </span>
            </div>
            <h2 className="text-2xl font-bold flex items-center gap-3 mt-2">
              {problem.title}
              {isCompleted && <CheckCircle2 className="w-6 h-6 text-success" />}
            </h2>
            <div className="flex items-center gap-4 mt-1">
              <p className="text-muted-foreground text-sm">{problem.topic} • {problem.subtopic}</p>
              <div className="flex bg-secondary p-0.5 rounded-lg border border-border">
                <button 
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${activeTab === 'details' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  onClick={() => setActiveTab('details')}
                >
                  Details
                </button>
                <button 
                  disabled={!isCompleted}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${activeTab === 'discussion' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  onClick={() => setActiveTab('discussion')}
                  title={!isCompleted ? "Complete problem first to join discussion" : ""}
                >
                  Discussions {!isCompleted && <Lock className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-secondary rounded-xl hover:bg-border transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {activeTab === 'details' ? (
          <div className="p-6 space-y-6">
            
            <div className="flex items-center gap-4 bg-secondary p-4 rounded-xl border border-border">
              <ExternalLink className="w-8 h-8 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-semibold">Solve on platform</p>
                <p className="text-sm text-muted-foreground">Open Leetcode and paste your approach back here once solved.</p>
              </div>
              <a 
                href={problem.leetcode_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-foreground text-background font-medium rounded-lg hover:bg-foreground/90 transition-colors shadow-sm"
              >
                Open Problem
              </a>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="font-semibold flex items-center gap-2">
                  Your Approach / Thought Process
                </label>
                <span className={`text-xs font-medium px-2 py-1 rounded-md ${wordCount >= 30 ? 'bg-success/20 text-success' : 'bg-secondary text-muted-foreground'}`}>
                  {wordCount}/30 words min
                </span>
              </div>
              
              {!isCompleted ? (
                <textarea
                  className="w-full h-40 bg-secondary/50 border border-border rounded-xl p-4 focus:ring-2 focus:ring-primary focus:outline-none transition-all resize-none text-sm placeholder:text-muted-foreground/60"
                  placeholder="Explain how you approached this problem. What data structures did you use? What is the time and space complexity? Minimum 30 words required to complete."
                  value={approach}
                  onChange={(e) => setApproach(e.target.value)}
                />
              ) : (
                <div className="w-full h-40 bg-success/5 border border-success/30 rounded-xl p-4 text-sm overflow-y-auto">
                  <div className="flex items-center gap-2 mb-2 text-success font-semibold">
                    <CheckCircle2 className="w-4 h-4" /> Approach successfully recorded
                  </div>
                  You have already completed this problem!
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-6 h-[400px] flex flex-col bg-secondary/10">
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
               {loadingChats ? (
                 <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
               ) : discussions.length === 0 ? (
                 <div className="text-center text-muted-foreground py-12">
                   <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                   <p>No discussion yet. Be the first to start!</p>
                 </div>
               ) : (
                 discussions.map(d => (
                   <div key={d.id} className="bg-card border border-border rounded-xl p-4 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {d.user_id.substring(0,2).toUpperCase()}
                        </div>
                        <div className="flex flex-col w-full">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm text-foreground">{d.user_id}</span>
                            <span className="text-xs text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</span>
                          </div>
                          
                          {d.approach_text && (
                            <div 
                              onClick={() => setExpandedApproaches(prev => ({...prev, [d.id]: !prev[d.id]}))}
                              className="mb-2 bg-primary/5 border-l-2 border-primary/30 pl-3 py-1.5 pr-2 rounded-r-lg text-xs text-muted-foreground italic cursor-pointer hover:bg-primary/10 transition-colors"
                            >
                              <span className="font-medium text-foreground/70 not-italic mr-1 block mb-0.5">My Approach:</span>
                              {expandedApproaches[d.id] || d.approach_text.length <= 100 
                                ? d.approach_text 
                                : `${d.approach_text.substring(0, 100)}...`}
                              {d.approach_text.length > 100 && (
                                <span className="text-primary not-italic font-medium ml-2">
                                  {expandedApproaches[d.id] ? "Show less" : "Read more"}
                                </span>
                              )}
                            </div>
                          )}
                          
                          <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">{d.message}</p>
                        </div>
                      </div>
                   </div>
                 ))
               )}
            </div>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Ask your squad or share an optimized approach..."
                value={discussionMsg}
                onChange={(e) => setDiscussionMsg(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitComment()}
                className="w-full bg-card border border-border rounded-xl py-3 pl-4 pr-12 focus:ring-2 focus:ring-primary focus:outline-none text-sm"
              />
              <button 
                onClick={submitComment}
                disabled={!discussionMsg.trim()}
                className="absolute right-2 top-2 p-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-colors disabled:opacity-50 disabled:hover:bg-primary/10 disabled:hover:text-primary"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="p-6 border-t border-border bg-secondary/30 flex items-center justify-between gap-4">
            {!isCompleted ? (
              <>
                <button 
                  onClick={askForHint}
                  disabled={loading || problem.status === 'Partially Done'}
                  className="flex items-center gap-2 px-5 py-2.5 bg-card border border-warning/50 text-warning hover:bg-warning/10 font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <AlertCircle className="w-4 h-4" /> Got Stuck? Ask for Hint 🟡
                </button>

                <button 
                  onClick={submitApproach}
                  disabled={loading || wordCount < 30}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary to-accent text-white font-medium rounded-xl hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed shadow-sm"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Mark as Completed ✅
                </button>
              </>
            ) : (
              <div className="w-full flex justify-between items-center">
                 <span className="text-sm font-medium text-success">This problem is fully checked off.</span>
                 <button 
                  onClick={() => setActiveTab('discussion')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 font-medium rounded-xl transition-all"
                >
                  <MessageCircle className="w-4 h-4" /> Join Discussion
                </button>
              </div>
            )}
        </div>

      </div>
    </div>
  );
}
