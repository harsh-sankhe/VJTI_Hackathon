import { CheckCircle2, Circle, Flame, Zap, TrendingUp, Calendar, Brain, Target, RefreshCw } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { codeGrindApi } from "../code_grind/api";
import { quizApi } from "../api/quizApi";

const weeklyData = [
  { day: "Mon", hours: 2.5, xp: 150 },
  { day: "Tue", hours: 3, xp: 200 },
  { day: "Wed", hours: 1.5, xp: 100 },
  { day: "Thu", hours: 4, xp: 280 },
  { day: "Fri", hours: 2, xp: 140 },
  { day: "Sat", hours: 5, xp: 350 },
  { day: "Sun", hours: 3.5, xp: 220 },
];

const todayTasks = [
  { id: 1, title: "Complete Data Structures Module", completed: true },
  { id: 2, title: "Practice 10 Algorithm Problems", completed: true },
  { id: 3, title: "Review Binary Trees Concepts", completed: false },
  { id: 4, title: "Take Adaptive Quiz on Arrays", completed: false },
  { id: 5, title: "Watch React Hooks Tutorial", completed: false },
];

export function Dashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('Student');
  const [userStats, setUserStats] = useState<{ xp: number; streak: number; total_solved: number } | null>(null);
  
  const [quizStats, setQuizStats] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('auth_user');
    if(stored) {
      try {
        const u = JSON.parse(stored);
        if(u.role === 'admin') { navigate('/app/admin'); return; }
        if(u.name) setUserName(u.name);
      } catch(e) {}
    }
    // Fetch live stats
    codeGrindApi.getStats().then(s => setUserStats(s)).catch(() => {});
    
    // Fetch Quiz stats quickly via available endpoints
    Promise.all([
       quizApi.getHistory(),
       quizApi.getRevisionDue()
    ]).then(([historyRows, revisionRows]) => {
         const lastQuiz = historyRows[0] || null;
         setQuizStats({
            lastQuiz,
            revisionDueCount: revisionRows.length,
            weakestTopic: "Loading..." // Requires aggregate endpoint, default for now
         });
    }).catch(() => {});

  }, [navigate]);

  const completedTasks = todayTasks.filter((t) => t.completed).length;
  const totalTasks = todayTasks.length;
  const progressPercentage = (completedTasks / totalTasks) * 100;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="mb-2">Welcome back, {userName} 👋</h1>
          <p className="text-muted-foreground">Let's continue your learning journey today</p>
        </div>
        <div className="hidden md:flex gap-3">
          <button onClick={() => navigate('/app/quiz-select')} className="px-6 py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all font-medium">
            Start Quiz
          </button>
          <button className="px-6 py-3 bg-card border border-border text-foreground rounded-xl hover:bg-secondary hover:scale-105 transition-all font-medium">
            View Roadmap
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Progress Circle */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-foreground">Today's Progress</h3>
            <div className="p-2 bg-[#6366f1]/10 rounded-lg">
              <Target className="w-5 h-5 text-[#6366f1]" />
            </div>
          </div>
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-36 h-36">
              <svg className="transform -rotate-90 w-36 h-36">
                <circle cx="72" cy="72" r="64" stroke="currentColor" strokeWidth="10" fill="none" className="text-muted" />
                <circle cx="72" cy="72" r="64" stroke="url(#gradient)" strokeWidth="10" fill="none" strokeDasharray={`${progressPercentage * 4.02} 402`} strokeLinecap="round" className="transition-all duration-500 drop-shadow-md" />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-3xl font-bold text-foreground">{completedTasks}/{totalTasks}</span>
                <span className="text-sm text-muted-foreground mt-1">Tasks</span>
              </div>
            </div>
          </div>
        </div>

        {/* Streak Counter */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-foreground">Current Streak</h3>
            <div className="p-2 bg-[#f59e0b]/10 rounded-lg">
              <Flame className="w-5 h-5 text-[#f59e0b]" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-6xl">🔥</div>
            <div>
              <div className="text-4xl font-bold text-foreground">{userStats?.streak ?? '—'}</div>
              <div className="text-sm text-muted-foreground mt-1">days in a row</div>
            </div>
          </div>
        </div>

        {/* XP & Level */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-foreground">XP & Level</h3>
            <div className="p-2 bg-[#f59e0b]/10 rounded-lg">
              <Zap className="w-5 h-5 text-[#f59e0b]" />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-foreground">{userStats ? userStats.xp.toLocaleString() : '—'}</span>
                <span className="text-sm text-muted-foreground">XP</span>
              </div>
              <p className="text-sm text-[#22c55e] mt-1">+220 this week ↑</p>
            </div>
          </div>
        </div>

        {/* Quiz Performance Widget (New) */}
        <div className="bg-gradient-to-br from-[#6366f1]/10 to-[#a855f7]/10 border border-[#6366f1]/20 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Quiz Performance</h3>
            <div className="p-2 bg-white/20 dark:bg-black/20 rounded-lg backdrop-blur">
              <Brain className="w-5 h-5 text-brand" />
            </div>
          </div>
          <div className="space-y-3 z-10 relative">
             <div className="flex justify-between items-center bg-card/50 p-2 rounded">
                 <span className="text-sm text-muted-foreground">Due for revision</span>
                 <span className={`font-semibold ${quizStats?.revisionDueCount > 0 ? "text-red-500" : "text-green-500"}`}>{quizStats?.revisionDueCount ?? '-'} modules</span>
             </div>
             <div className="flex flex-col bg-card/50 p-2 rounded">
                 <span className="text-xs text-muted-foreground">Last Quiz</span>
                 <span className="font-semibold text-sm truncate">Topic #{quizStats?.lastQuiz?.topic_id || 'N/A'}</span>
                 <span className="text-xs font-semibold text-brand">{(quizStats?.lastQuiz?.final_score || 0).toFixed(1)} Pts</span>
             </div>
             <button onClick={() => navigate('/app/quiz-select')} className="w-full py-2 bg-brand text-white rounded-lg text-sm font-semibold shadow hover:shadow-lg transition-all flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4" /> Start a Quiz
             </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Tasks */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-8">
            <h2>Today's Tasks</h2>
            <span className="text-sm text-muted-foreground bg-secondary px-3 py-1.5 rounded-lg">
              {completedTasks} of {totalTasks} completed
            </span>
          </div>
          <div className="space-y-3">
            {todayTasks.map((task) => (
              <div key={task.id} className="flex items-center gap-4 p-5 rounded-xl hover:bg-secondary/50 transition-all cursor-pointer group border border-transparent hover:border-border">
                {task.completed ? <CheckCircle2 className="w-6 h-6 text-[#22c55e] flex-shrink-0" /> : <Circle className="w-6 h-6 text-muted-foreground flex-shrink-0 group-hover:text-[#6366f1] transition-colors" />}
                <span className={`flex-1 ${task.completed ? "text-muted-foreground line-through" : "text-foreground font-medium"}`}>{task.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all">
          <h2 className="mb-8">Quick Actions</h2>
          <div className="space-y-4">
            <button onClick={() => navigate('/app/quiz-select')} className="w-full p-5 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-3 font-medium">
              <Brain className="w-5 h-5" />
              Take Adaptive Quiz
            </button>
            <button className="w-full p-5 bg-secondary text-foreground rounded-xl hover:bg-accent hover:text-accent-foreground hover:scale-105 transition-all flex items-center justify-center gap-3 font-medium">
              <Calendar className="w-5 h-5" />
              View Study Plan
            </button>
            <button onClick={() => navigate('/app/insights')} className="w-full p-5 bg-secondary text-foreground rounded-xl hover:bg-accent hover:text-accent-foreground hover:scale-105 transition-all flex items-center justify-center gap-3 font-medium">
              <TrendingUp className="w-5 h-5" />
              Check Insights
            </button>
          </div>
        </div>
      </div>
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly Study Hours */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all">
          <h2 className="mb-8">Weekly Study Hours</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
              <XAxis dataKey="day" stroke="var(--muted-foreground)" style={{ fontSize: '14px' }} />
              <YAxis stroke="var(--muted-foreground)" style={{ fontSize: '14px' }} />
              <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
              <Bar dataKey="hours" fill="url(#barGradientx)" radius={[10, 10, 0, 0]} />
              <defs>
                <linearGradient id="barGradientx" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* XP Progress */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all">
          <h2 className="mb-8">XP Progress</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
              <XAxis dataKey="day" stroke="var(--muted-foreground)" style={{ fontSize: '14px' }} />
              <YAxis stroke="var(--muted-foreground)" style={{ fontSize: '14px' }} />
              <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
              <Line type="monotone" dataKey="xp" stroke="#6366f1" strokeWidth={4} dot={{ fill: "#6366f1", r: 6, strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
