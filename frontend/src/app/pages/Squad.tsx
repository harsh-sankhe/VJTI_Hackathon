import { useState, useEffect, useRef } from "react";
import { Trophy, Users, TrendingUp, MessageCircle, Crown, Medal, Award, Flame, Zap, Plus, LogIn, ArrowRight, X, Send, Brain, ExternalLink, CheckCircle2 } from "lucide-react";
import { io } from 'socket.io-client';
import { squadApi } from "../api/squadApi";
import { toast } from "sonner";
import { getAuthToken } from "../code_grind/api";

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';
let socket: any = null;

export function Squad() {
  const [loading, setLoading] = useState(true);
  const [hasSquad, setHasSquad] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard'|'chat'>('dashboard');
  
  // Squad Data
  const [info, setInfo] = useState<any>(null);
  const [userRole, setUserRole] = useState<'leader'|'member'>('member');
  const [members, setMembers] = useState<any[]>([]);
  const [feed, setFeed] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  
  // Chat Data
  const [messages, setMessages] = useState<any[]>([]);
  const [chatMsg, setChatMsg] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Auth/Join states
  const [joinCode, setJoinCode] = useState("");
  const [squadName, setSquadName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Leader controls state
  const [editingGoal, setEditingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState("");
  const [newDays, setNewDays] = useState("");
  const [showDisbandConfirm, setShowDisbandConfirm] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [kickingId, setKickingId] = useState<number|null>(null);

  // Task completion modal
  const [taskModal, setTaskModal] = useState<{challengeId: string; taskId: string; taskTitle: string} | null>(null);
  const [approachText, setApproachText] = useState("");
  const [submittingTask, setSubmittingTask] = useState(false);

  // View Peer Approach Modal
  const [viewingApproach, setViewingApproach] = useState<{userName: string; approach: string; taskTitle: string} | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('auth_user');
    if(stored) setCurrentUser(JSON.parse(stored));
    
    // Connect Socket ONLY IF TOKEN EXISTS
    const token = getAuthToken();
    if(token) {
        if(!socket) {
           socket = io(API_URL.replace('/api', ''), {
             auth: { token },
             withCredentials: true
           });
        }
    }
    
    loadDashboard();

    return () => {
      // Don't arbitrarily disconnect here because React 18 strict mode unmounts/remounts immediately
      // Just let it persist or cleanup properly
    };
  }, []);

  useEffect(() => {
    if (activeTab === 'chat' && hasSquad) {
      loadChatHistory();
      chatEndRef.current?.scrollIntoView();
    }
  }, [activeTab, hasSquad]);

  useEffect(() => {
    if(socket && hasSquad && info?.id) {
        socket.emit('join_squad', info.id);
        
        socket.on('receive_message', (msg: any) => {
            setMessages(prev => [...prev, msg]);
            setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        });
        
        socket.on('squad_removed', () => {
            toast.error("You have been removed from the squad.");
            loadDashboard();
        });

        socket.on('squad_disbanded', () => {
            toast.error("This squad has been disbanded by the leader.");
            loadDashboard();
        });

        return () => {
            socket.off('receive_message');
            socket.off('squad_removed');
            socket.off('squad_disbanded');
        };
    }
  }, [socket, hasSquad, info?.id]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const data = await squadApi.getDashboard();
      if (data.hasSquad) {
        setHasSquad(true);
        setInfo(data.info);
        setUserRole(data.userRole);
        setMembers(data.members);
        setFeed(data.feed);
        try {
          const fullChallenges = await squadApi.getChallenges();
          setChallenges(fullChallenges);
        } catch (e) {
          setChallenges(data.challenges || []);
        }
      } else {
        setHasSquad(false);
      }
    } catch (e: any) {
      console.error(e);
      // If auth fails (401), silently show no-squad state rather than crash
      setHasSquad(false);
    } finally {
      setLoading(false);
    }
  };

  const loadChatHistory = async () => {
    try {
      const data = await squadApi.getChatHistory();
      setMessages(data);
      setTimeout(() => chatEndRef.current?.scrollIntoView(), 100);
    } catch(e) {
      console.error('Chat error', e);
    }
  };

  const handleCreateSquad = async () => {
    if(!squadName.trim()) return toast.error("Enter a squad name");
    try {
      await squadApi.createSquad(squadName);
      toast.success("Squad Created!");
      loadDashboard();
    } catch(e:any) {
      toast.error(e.message);
    }
  };

  const handleJoinSquad = async () => {
    if(!joinCode.trim()) return toast.error("Enter join code");
    try {
      await squadApi.joinSquad(joinCode);
      toast.success("Joined Squad!");
      loadDashboard();
    } catch(e:any) {
      toast.error(e.message);
    }
  };

  const handleLeaveSquad = async () => {
    try {
      await squadApi.leaveSquad();
      toast.success("You have left the squad.");
      setShowLeaveConfirm(false);
      setHasSquad(false);
      loadDashboard();
    } catch(e:any) {
      toast.error(e.message);
    }
  };

  const handleDisbandSquad = async () => {
    try {
      await squadApi.disbandSquad();
      toast.success("Squad disbanded.");
      setShowDisbandConfirm(false);
      setHasSquad(false);
      loadDashboard();
    } catch(e:any) {
      toast.error(e.message);
    }
  };

  const handleKick = async (target_user_id: number) => {
    try {
      setKickingId(target_user_id);
      await squadApi.kickMember(target_user_id);
      toast.success("Member removed from squad.");
      loadDashboard();
    } catch(e:any) {
      toast.error(e.message);
    } finally {
      setKickingId(null);
    }
  };

  const handleCompleteTask = async () => {
    if (!taskModal) return;
    const wordCount = approachText.trim().split(/\s+/).filter(w => w.length > 0).length;
    if (wordCount < 30) return toast.error(`Approach needs at least 30 words. (${wordCount}/30)`);
    try {
      setSubmittingTask(true);
      await squadApi.completeTask(taskModal.challengeId, taskModal.taskId, approachText);
      toast.success('Task completed! XP awarded!');
      setTaskModal(null);
      setApproachText("");
      loadDashboard();
    } catch(e: any) {
      toast.error(e.message);
    } finally {
      setSubmittingTask(false);
    }
  };

  const handleEditGoal = async () => {
    const g = newGoal ? parseInt(newGoal) : undefined;
    const d = newDays ? parseInt(newDays) : undefined;
    if (!g && !d) return toast.error("Enter at least one value to update");
    if (g !== undefined && g < 1) return toast.error("Enter a valid problem count");
    if (d !== undefined && d < 1) return toast.error("Enter a valid number of days");
    try {
      await squadApi.editGoal(g, d);
      toast.success("Goal updated!");
      setEditingGoal(false);
      setNewGoal(""); setNewDays("");
      loadDashboard();
    } catch(e:any) {
      toast.error(e.message);
    }
  };

  const sendMessage = () => {
    if(!chatMsg.trim() || !socket || !info) return;
    const msgData = {
        squad_id: info.id,
        user_id: currentUser?.id,
        user_name: currentUser?.name,
        message: chatMsg
    };
    socket.emit('send_message', msgData);
    setChatMsg("");
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-5 h-5 text-[#f59e0b]" />;
      case 2: return <Medal className="w-5 h-5 text-[#94a3b8]" />;
      case 3: return <Award className="w-5 h-5 text-[#ea580c]" />;
      default: return null;
    }
  };

  if (loading) {
    return <div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  // ============== NO SQUAD VIEW ==============
  if (!hasSquad) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-12">
          <div className="inline-flex p-4 bg-primary/10 rounded-full mb-4">
            <Users className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Study Squads</h1>
          <p className="text-xl text-muted-foreground">Learn, compete, and grow together with your peers.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
           {/* Join Squad */}
           <div className="bg-card border border-border p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
               <h3 className="text-2xl font-bold mb-2 flex items-center gap-2"><LogIn className="text-primary"/> Join a Squad</h3>
               <p className="text-muted-foreground mb-6">Got an invite code from a friend? Enter it below to join their squad.</p>
               <input 
                 type="text" 
                 placeholder="Enter 6-char Invite Code" 
                 className="w-full bg-secondary border border-border rounded-xl p-4 font-mono text-center text-lg uppercase tracking-widest mb-4"
                 maxLength={6}
                 value={joinCode}
                 onChange={e => setJoinCode(e.target.value.toUpperCase())}
               />
               <button onClick={handleJoinSquad} className="w-full py-4 rounded-xl bg-foreground text-background font-bold text-lg hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2">
                 Join Squad <ArrowRight className="w-5 h-5" />
               </button>
           </div>

           {/* Create Squad */}
           <div className="bg-gradient-to-br from-[#6366f1] to-[#a855f7] p-8 rounded-2xl shadow-lg border border-border/10 text-white relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700"></div>
               <div className="relative z-10">
                 <h3 className="text-2xl font-bold mb-2 flex items-center gap-2 text-white"><Plus /> Create a Squad</h3>
                 <p className="text-white/80 mb-6">Be the leader. Create a squad, invite up to 9 friends, and crush your weekly goals.</p>
                 {isCreating ? (
                    <div className="space-y-4 animate-in fade-in">
                       <input 
                         type="text" 
                         placeholder="Enter Squad Name" 
                         className="w-full bg-black/20 border border-white/20 rounded-xl p-4 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                         value={squadName}
                         onChange={e => setSquadName(e.target.value)}
                         autoFocus
                       />
                       <div className="flex gap-2">
                         <button onClick={() => setIsCreating(false)} className="px-4 py-4 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
                           <X />
                         </button>
                         <button onClick={handleCreateSquad} className="flex-1 py-4 rounded-xl bg-white text-[#6366f1] font-bold text-lg hover:bg-white/90 transition-colors shadow-md">
                           Launch Squad 🚀
                         </button>
                       </div>
                    </div>
                 ) : (
                    <button onClick={() => setIsCreating(true)} className="w-full py-4 mt-16 rounded-xl bg-white text-[#6366f1] font-bold text-lg hover:shadow-lg hover:scale-105 transition-all shadow-md">
                      Start Your Squad
                    </button>
                 )}
               </div>
           </div>
        </div>
      </div>
    );
  }

  // ============== SQUAD DASHBOARD VIEW ==============
  
  // Process squad XP to determine Rank
  const xp = info.total_xp || 0;
  let rankName = "Bronze Squad"; let rankColor = "from-amber-600 to-yellow-600";
  if(xp > 1000) { rankName = "Diamond Squad"; rankColor = "from-cyan-400 to-blue-600"; }
  else if(xp > 500) { rankName = "Gold Squad"; rankColor = "from-yellow-400 to-yellow-600"; }
  else if(xp > 200) { rankName = "Silver Squad"; rankColor = "from-slate-400 to-slate-500"; }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Disband Confirm Modal */}
      {showDisbandConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl animate-in fade-in zoom-in-90">
            <h3 className="text-xl font-bold mb-3 text-destructive">Disband Squad?</h3>
            <p className="text-muted-foreground mb-6">This will permanently disband the squad and remove all members. This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDisbandConfirm(false)} className="flex-1 py-3 rounded-xl border border-border hover:bg-secondary transition-colors font-medium">Cancel</button>
              <button onClick={handleDisbandSquad} className="flex-1 py-3 rounded-xl bg-destructive text-white font-bold hover:bg-destructive/90 transition-colors">Yes, Disband</button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Confirm Modal */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl animate-in fade-in zoom-in-90">
            <h3 className="text-xl font-bold mb-3">Leave Squad?</h3>
            <p className="text-muted-foreground mb-6">You will lose your squad progress and will need an invite code to rejoin.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLeaveConfirm(false)} className="flex-1 py-3 rounded-xl border border-border hover:bg-secondary transition-colors font-medium">Cancel</button>
              <button onClick={handleLeaveSquad} className="flex-1 py-3 rounded-xl bg-foreground text-background font-bold hover:bg-foreground/90 transition-colors">Leave Squad</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="mb-2">Study Squad</h1>
          {userRole === 'leader' ? (
            <p className="text-muted-foreground border bg-secondary rounded px-3 py-1 inline-flex uppercase tracking-wider text-xs font-bold items-center gap-2">
              INVITE CODE: <span className="font-mono text-primary text-sm select-all">{info.invite_code}</span>
              <button
                onClick={() => { navigator.clipboard.writeText(info.invite_code); toast.success('Invite code copied!'); }}
                className="ml-1 text-primary hover:text-primary/70 transition-colors"
                title="Copy invite code"
              >
                📋
              </button>
            </p>
          ) : (
            <p className="text-muted-foreground text-sm">Member of <span className="font-semibold text-foreground">{info.name}</span></p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-secondary p-1 rounded-xl shadow-sm border border-border">
            <button onClick={() => setActiveTab('dashboard')} className={`px-6 py-2.5 rounded-lg font-medium transition-all ${activeTab === 'dashboard' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>
              Dashboard
            </button>
            <button onClick={() => setActiveTab('chat')} className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${activeTab === 'chat' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>
              <MessageCircle className="w-4 h-4"/> Squad Chat
            </button>
          </div>
          {userRole === 'leader' ? (
            <button onClick={() => setShowDisbandConfirm(true)} className="px-4 py-2.5 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 font-medium hover:bg-destructive/20 transition-colors text-sm flex items-center gap-1.5">
              <X className="w-4 h-4"/> Disband Squad
            </button>
          ) : (
            <button onClick={() => setShowLeaveConfirm(true)} className="px-4 py-2.5 rounded-xl bg-secondary border border-border font-medium hover:bg-secondary/80 transition-colors text-sm text-muted-foreground">
              Leave Squad
            </button>
          )}
        </div>
      </div>

      {activeTab === 'dashboard' ? (
        <>
          {/* Squad Info Card */}
          <div className="bg-gradient-to-br from-[#6366f1] to-[#a855f7] rounded-2xl p-8 text-white relative overflow-hidden shadow-lg">
            <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-br ${rankColor} rounded-full blur-3xl -translate-y-1/4 translate-x-1/4 opacity-60`}></div>
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Trophy className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{info.name}</h2>
                    <p className="inline-flex mt-2 items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white shadow-sm border border-white/20">
                      {rankName}
                    </p>
                  </div>
                </div>
                <div className="text-right bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/10">
                  <div className="text-4xl font-bold">{members.length} / 10</div>
                  <div className="text-sm text-white/90 mt-1">Members</div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                  <div className="text-3xl font-bold mb-1">{info.total_xp}</div>
                  <div className="text-white/90">Total Squad XP</div>
                </div>
                <div className="col-span-1 sm:col-span-2 bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                  <div className="flex justify-between items-end mb-2">
                     <div>
                        <div className="text-sm text-white/80 uppercase font-bold tracking-wider">Weekly Goal Progress</div>
                     </div>
                     <div className="text-xl font-bold">🎯 {info.goal_problems} problems</div>
                  </div>
                  {userRole === 'leader' && (
                     editingGoal ? (
                       <div className="flex gap-2 mb-3 flex-wrap">
                         <div className="flex flex-col gap-1">
                           <label className="text-xs text-white/60">Problems Target</label>
                           <input type="number" min={1} max={500} value={newGoal}
                             onChange={e => setNewGoal(e.target.value)}
                             className="w-24 bg-black/20 border border-white/30 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/50"
                             placeholder={String(info.goal_problems)}
                           />
                         </div>
                         <div className="flex flex-col gap-1">
                           <label className="text-xs text-white/60">Duration (days)</label>
                           <input type="number" min={1} max={30} value={newDays}
                             onChange={e => setNewDays(e.target.value)}
                             className="w-24 bg-black/20 border border-white/30 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/50"
                             placeholder="7"
                           />
                         </div>
                         <div className="flex gap-2 items-end">
                           <button onClick={handleEditGoal} className="px-3 py-1.5 bg-white text-[#6366f1] rounded-lg text-sm font-bold hover:bg-white/90 transition-colors">Save</button>
                           <button onClick={() => { setEditingGoal(false); setNewGoal(""); setNewDays(""); }} className="px-3 py-1.5 bg-white/10 rounded-lg text-sm hover:bg-white/20 transition-colors"><X className="w-4 h-4"/></button>
                         </div>
                       </div>
                     ) : (
                       <button onClick={() => { setEditingGoal(true); }} className="text-xs text-white/60 hover:text-white/90 underline underline-offset-2 transition-colors mb-2">
                         ✏️ Edit Goal / Duration
                       </button>
                     )
                   )}
                  {(() => {
                    // Calculate real progress: total solved by all members in this period
                    const totalSolved = members.reduce((sum: number, m: any) => sum + (parseInt(m.total_solved) || 0), 0);
                    const pct = info.goal_problems > 0 ? Math.min(100, Math.round((totalSolved / info.goal_problems) * 100)) : 0;
                    return (
                      <>
                        <div className="w-full bg-black/20 rounded-full h-3">
                          <div className="bg-white h-3 rounded-full shadow-sm transition-all duration-500" style={{ width: `${pct}%` }}></div>
                        </div>
                        <div className="mt-2 flex justify-between text-xs text-white/70">
                          <span>{totalSolved} / {info.goal_problems} solved</span>
                          <span>Resets: {info.goal_period_end ? new Date(info.goal_period_end).toLocaleDateString() : 'Sunday'}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Leaderboard */}
            <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all">
              <h2 className="mb-8">XP Leaderboard (This Week)</h2>

              <div className="space-y-4">
                {members.map((member, index) => {
                  const rank = index + 1;
                  return (
                  <div
                    key={member.user_id}
                    className={`p-4 rounded-xl border transition-all hover:shadow-md ${
                      rank === 1
                        ? "bg-gradient-to-r from-[#f59e0b]/10 to-[#f59e0b]/5 border-[#f59e0b]/30 shadow-sm"
                        : "bg-secondary/50 border-border hover:border-primary/30"
                    } ${member.user_id === currentUser?.id ? "ring-2 ring-primary/50" : ""}`}
                  >
                    <div className="flex items-center gap-5">
                      {/* Rank */}
                      <div className="flex items-center justify-center w-8">
                        {rank <= 3 ? getRankIcon(rank) : <span className="font-bold text-muted-foreground">#{rank}</span>}
                      </div>

                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#a855f7] flex items-center justify-center shadow-md shrink-0">
                        <span className="text-white font-bold">{member.name.charAt(0).toUpperCase()}</span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground truncate">{member.name}</h3>
                          {member.role === 'leader' && <span className="px-2 py-0.5 bg-[#f59e0b]/20 text-[#f59e0b] text-[10px] font-bold rounded uppercase tracking-wider">Leader</span>}
                        </div>
                        <div className="flex items-center gap-4 flex-wrap">
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Zap className="w-3 h-3 text-[#f59e0b]" /> <span className="font-medium">{member.xp_this_week} this week</span>
                          </span>
                          <span className={`text-sm flex items-center gap-1 ${member.streak > 3 ? 'text-[#ef4444] font-medium' : 'text-muted-foreground'}`}>
                            <Flame className={`w-3 h-3 ${member.streak > 3 ? 'text-[#ef4444]' : 'text-muted-foreground'}`} /> {member.streak} streak
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xl font-bold text-foreground mb-0.5">{member.total_solved}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Solved</div>
                      </div>

                      {/* Kick button — leader only, not self */}
                      {userRole === 'leader' && member.user_id !== currentUser?.id && (
                        <button
                          onClick={() => handleKick(member.user_id)}
                          disabled={kickingId === member.user_id}
                          className="ml-2 p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors flex-shrink-0 disabled:opacity-50"
                          title={`Kick ${member.name}`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                )})}
              </div>
            </div>

            {/* Activity Feed */}
            <div className="bg-card border border-border rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all">
              <h2 className="mb-6">Live Feed</h2>

              {feed.length === 0 ? (
                <div className="text-center text-muted-foreground py-10 opacity-60">
                   <Users className="w-10 h-10 mx-auto mb-3" />
                   <p>No activity yet.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {feed.slice(0,10).map((activity, index) => (
                    <div key={activity.id || index} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6366f1] to-[#a855f7] flex items-center justify-center flex-shrink-0 shadow-sm">
                        {activity.type === "achievement" && <TrendingUp className="w-4 h-4 text-white" />}
                        {activity.type === "badge" && <Award className="w-4 h-4 text-white" />}
                        {activity.type === "streak" && <Flame className="w-4 h-4 text-white" />}
                        {(!activity.type || activity.type === "join") && <Users className="w-4 h-4 text-white" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-foreground leading-tight">
                          <span className="font-semibold">{activity.user_name}</span> {activity.action}{" "}
                          <span className="font-semibold text-primary">{activity.item}</span>
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">{new Date(activity.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Active Challenges */}
          {challenges.length > 0 && challenges.map(ch => (
            <div key={ch.challenge_id || ch.id} className="bg-card border border-border rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all mt-8">
              {/* Header */}
              <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
                <div>
                  <h2 className="mb-1 flex items-center gap-2">
                    <span className="p-1.5 bg-primary/10 rounded-lg"><Trophy className="w-5 h-5 text-primary" /></span>
                    {ch.title}
                  </h2>
                  <p className="text-muted-foreground text-sm">{ch.type?.toUpperCase()} CHALLENGE &bull; {ch.description}</p>
                </div>
                <div className="text-right bg-secondary/50 rounded-xl px-6 py-3 border border-border space-y-1">
                  <div className="text-2xl font-bold text-foreground">+{ch.xp_reward} XP</div>
                  <div className="text-xs text-muted-foreground">per member</div>
                  <div className="text-xs font-semibold text-primary">🎁 Squad Bonus: +{ch.squad_xp_bonus}</div>
                </div>
              </div>

              {/* Task List */}
              <div className="space-y-3">
                {(ch.tasks || []).map((task: any) => {
                  // Check if current user completed this task
                  const myProgress = (ch.progressGrid || []).find(
                    (p: any) => String(p.user_id) === String(currentUser?.id) && String(p.task_id) === String(task.id)
                  );
                  const isDone = myProgress?.status === 'completed';

                  // Who else completed it?
                  const completedPeers = (ch.progressGrid || [])
                    .filter((p: any) => String(p.task_id) === String(task.id) && p.status === 'completed')
                    .map((p: any) => {
                      const member = members.find((m: any) => String(m.user_id) === String(p.user_id));
                      return { name: member?.name || 'Unknown', approach: p.approach_text };
                    });

                  return (
                    <div key={task.id} className={`flex flex-col gap-3 p-4 rounded-xl border transition-all ${
                      isDone ? 'bg-green-500/5 border-green-500/30' : 'bg-secondary/40 border-border hover:border-primary/30'
                    }`}>
                      <div className="flex items-center gap-4">
                        {/* Status icon */}
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isDone ? 'bg-green-500 text-white' : 'bg-border text-muted-foreground'
                        }`}>
                          {isDone ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-xs font-bold">{task.task_order}</span>}
                        </div>

                        {/* Task info */}
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm text-foreground">{task.task_title}</div>
                          {completedPeers.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {completedPeers.map((p: any, pi: number) => (
                                <button 
                                  key={pi}
                                  onClick={() => setViewingApproach({ userName: p.name, approach: p.approach, taskTitle: task.task_title })}
                                  className="text-[10px] bg-primary/5 hover:bg-primary/10 text-primary px-2 py-0.5 rounded-md border border-primary/10 transition-colors flex items-center gap-1"
                                  title="Click to verify approach"
                                >
                                  <Brain className="w-2.5 h-2.5" /> {p.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Platform badge + link */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {task.platform && (
                            <span className="text-[10px] px-2 py-0.5 bg-secondary text-muted-foreground rounded-full border border-border font-mono uppercase font-bold">{task.platform}</span>
                          )}
                          {task.external_link && (
                            <a href={task.external_link} target="_blank" rel="noopener noreferrer"
                              className="text-xs p-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                              title="Open link"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          {!isDone ? (
                            <button
                              onClick={() => setTaskModal({ challengeId: String(ch.challenge_id || ch.id), taskId: String(task.id), taskTitle: task.task_title })}
                              className="text-xs px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-bold shadow-sm shadow-primary/20"
                            >
                              Mark Done
                            </button>
                          ) : (
                            <span className="text-xs font-bold text-green-600 bg-green-500/10 px-3 py-1.5 rounded-lg flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Done
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between flex-wrap gap-3 mt-6 pt-4 border-t border-border">
                <span className="text-sm text-muted-foreground">⏰ Expires: {new Date(ch.expires_at).toLocaleDateString()}</span>
                <span className="text-sm font-medium text-muted-foreground">
                  {(ch.progressGrid || []).filter((p: any) => p.status === 'completed').length} / {(ch.tasks || []).length * members.length} completions
                </span>
              </div>
            </div>
          ))}
        </>
      ) : (
        /* CHAT INTERFACE */
        <div className="bg-card border border-border rounded-2xl shadow-sm h-[70vh] flex overflow-hidden">
           {/* Sidebar */}
           <div className="w-48 sm:w-64 border-r border-border bg-secondary/30 flex flex-col hidden md:flex">
             <div className="p-4 border-b border-border">
               <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Members ({members.length})</h3>
             </div>
             <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {members.map(m => (
                  <div key={m.user_id} className="flex items-center gap-3">
                     <div className="relative">
                       <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white text-xs font-bold">{m.name.charAt(0)}</div>
                       <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-secondary/30"></div>
                     </div>
                     <span className="text-sm font-medium truncate">{m.name}</span>
                  </div>
                ))}
             </div>
           </div>
           
           {/* Main Chat Area */}
           <div className="flex-1 flex flex-col bg-background relative relative">
              <div className="p-4 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-10">
                 <h2 className="text-lg font-bold flex items-center gap-2"><MessageCircle className="w-5 h-5 text-primary"/> Squad Chat</h2>
                 <span className="text-xs px-2 py-1 bg-success/10 text-success rounded-full flex items-center gap-1.5 font-medium"><div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></div> Live Connection</span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                 {messages.length === 0 && (
                   <div className="h-full flex flex-col items-center justify-center opacity-50 space-y-4">
                     <MessageCircle className="w-16 h-16 text-muted-foreground" />
                     <p>Send a message to start the squad conversation.</p>
                   </div>
                 )}
                 {messages.map((m, i) => {
                    const isMe = m.user_id === currentUser?.id;
                    const showName = i === 0 || messages[i-1].user_id !== m.user_id;

                    return (
                    <div key={m.id || i} className={`max-w-[70%] ${isMe ? 'ml-auto text-right' : 'mr-auto text-left'}`}>
                       {!isMe && showName && <div className="text-xs font-bold text-muted-foreground mb-1 ml-11">{m.user_name}</div>}
                       <div className={`flex gap-3 items-end ${isMe ? 'flex-row-reverse' : ''}`}>
                         {(!isMe && showName) ? (
                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold shrink-0">{m.user_name?.charAt(0)}</div>
                         ) : (!isMe) ? <div className="w-8 shrink-0"></div> : null}
                         
                         <div className={`px-4 py-2.5 rounded-2xl text-sm ${isMe ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-secondary text-foreground rounded-bl-sm border border-border'}`}>
                            {m.message}
                         </div>
                       </div>
                       <div className={`text-[10px] text-muted-foreground mt-1 ${isMe ? 'mr-1' : 'ml-11'}`}>
                          {new Date(m.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                       </div>
                    </div>
                 )})}
                 <div ref={chatEndRef} />
              </div>
              
              <div className="p-4 border-t border-border bg-card">
                 <div className="relative">
                    <input 
                      type="text"
                      className="w-full bg-secondary border border-border rounded-full py-3.5 pl-5 pr-14 focus:outline-none focus:ring-2 focus:ring-primary text-sm shadow-inner"
                      placeholder="Type your message..."
                      value={chatMsg}
                      onChange={e => setChatMsg(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    />
                    <button 
                      onClick={sendMessage}
                      disabled={!chatMsg.trim()}
                      className="absolute right-1.5 top-1.5 bottom-1.5 w-10 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white rounded-full flex items-center justify-center transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Task Completion Modal */}
      {taskModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-card border border-border rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-border bg-secondary/30 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-foreground">Complete Task</h3>
                <p className="text-xs text-muted-foreground mt-1">Challenge Task: <span className="text-primary font-semibold">{taskModal.taskTitle}</span></p>
              </div>
              <button 
                onClick={() => setTaskModal(null)}
                className="p-2 hover:bg-secondary rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Brain className="w-4 h-4 text-primary" /> Explain Your Approach
                  </label>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                    approachText.trim().split(/\s+/).filter(w => w.length > 0).length >= 30 
                    ? 'bg-success/10 text-success' 
                    : 'bg-warning/10 text-warning'
                  }`}>
                    {approachText.trim().split(/\s+/).filter(w => w.length > 0).length} / 30 words
                  </span>
                </div>
                <textarea 
                  className="w-full bg-secondary/50 border border-border rounded-2xl p-5 text-sm min-h-[160px] focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50 resize-none"
                  placeholder="Describe how you solved this task. Be specific about the logic or steps you took to ensure correctness. (Minimum 30 words)"
                  value={approachText}
                  onChange={e => setApproachText(e.target.value)}
                />
                <p className="text-[10px] text-muted-foreground bg-secondary/30 p-3 rounded-lg border border-border/50">
                  ⚠️ <span className="font-bold">Correctness Check:</span> Your squad members will see this approach. Make sure it accurately reflects your solution to maintain squad integrity and earn rewards.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setTaskModal(null)}
                  className="flex-1 py-4 rounded-2xl border border-border hover:bg-secondary transition-all font-bold text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCompleteTask}
                  disabled={submittingTask || approachText.trim().split(/\s+/).filter(w => w.length > 0).length < 30}
                  className="flex-2 py-4 px-8 rounded-2xl bg-primary text-white font-bold text-sm hover:translate-y-[-2px] hover:shadow-lg disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none transition-all flex items-center justify-center gap-2"
                >
                  {submittingTask ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>Submit & Complete <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Peer Approach Viewer Modal */}
      {viewingApproach && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[70] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-card border border-border rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 transition-all">
            <div className="p-6 border-b border-border bg-secondary/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">{viewingApproach.userName.charAt(0)}</div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{viewingApproach.userName}'s Approach</h3>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">{viewingApproach.taskTitle}</p>
                </div>
              </div>
              <button 
                onClick={() => setViewingApproach(null)}
                className="p-2 hover:bg-secondary rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8">
              <div className="bg-secondary/50 rounded-2xl p-6 border border-border shadow-inner min-h-[200px] max-h-[400px] overflow-y-auto">
                <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap italic">
                  "{viewingApproach.approach}"
                </div>
              </div>
              
              <div className="mt-8 flex justify-end">
                <button 
                  onClick={() => setViewingApproach(null)}
                  className="px-8 py-3.5 bg-foreground text-background font-bold rounded-2xl hover:bg-foreground/90 transition-all shadow-lg"
                >
                  Close Viewer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
