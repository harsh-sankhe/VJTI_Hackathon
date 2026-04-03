import { TrendingUp, TrendingDown, Target, Brain, Award, AlertCircle } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const performanceData = [
  { topic: "Arrays", accuracy: 85, attempted: 45 },
  { topic: "Trees", accuracy: 72, attempted: 32 },
  { topic: "Graphs", accuracy: 68, attempted: 28 },
  { topic: "DP", accuracy: 55, attempted: 20 },
  { topic: "Sorting", accuracy: 90, attempted: 50 },
];

const weeklyProgress = [
  { week: "Week 1", accuracy: 65, xp: 850 },
  { week: "Week 2", accuracy: 70, xp: 920 },
  { week: "Week 3", accuracy: 68, xp: 880 },
  { week: "Week 4", accuracy: 75, xp: 1100 },
];

const topicDistribution = [
  { name: "Data Structures", value: 35, color: "#6366f1" },
  { name: "Algorithms", value: 30, color: "#a855f7" },
  { name: "Frontend", value: 20, color: "#22c55e" },
  { name: "System Design", value: 15, color: "#f59e0b" },
];

const weaknessHeatmap = [
  { topic: "Binary Trees", level: 3 },
  { topic: "Dynamic Programming", level: 5 },
  { topic: "Graph Algorithms", level: 4 },
  { topic: "Recursion", level: 2 },
  { topic: "Backtracking", level: 4 },
  { topic: "Greedy Algorithms", level: 3 },
];

export function Insights() {
  const getHeatmapColor = (level: number) => {
    const colors = [
      "bg-[#22c55e]/20",
      "bg-[#22c55e]/40",
      "bg-[#f59e0b]/40",
      "bg-[#f59e0b]/60",
      "bg-[#ef4444]/60",
      "bg-[#ef4444]/80",
    ];
    return colors[level - 1] || colors[0];
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Learning Insights</h1>
        <p className="text-muted-foreground">Track your progress and identify areas for improvement</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">Overall Accuracy</h3>
            <Target className="w-5 h-5 text-[#6366f1]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground">74%</span>
            <span className="text-sm text-[#22c55e] flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              +5%
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Last 30 days</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">Topics Mastered</h3>
            <Award className="w-5 h-5 text-[#f59e0b]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground">12/18</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">67% completion</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">Problems Solved</h3>
            <Brain className="w-5 h-5 text-[#22c55e]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground">175</span>
            <span className="text-sm text-[#22c55e] flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              +12
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">This week</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">Weak Topics</h3>
            <AlertCircle className="w-5 h-5 text-[#ef4444]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground">3</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Need attention</p>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance by Topic */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all">
          <h2 className="text-xl font-semibold text-foreground mb-6">Performance by Topic</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="topic" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="accuracy" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Topic Distribution */}
        <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all">
          <h2 className="text-xl font-semibold text-foreground mb-6">Study Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={topicDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {topicDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-4">
            {topicDistribution.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-foreground">{item.name}</span>
                </div>
                <span className="text-sm font-semibold text-foreground">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly Progress */}
      <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all">
        <h2 className="text-xl font-semibold text-foreground mb-6">Weekly Progress Trend</h2>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={weeklyProgress}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="week" stroke="var(--muted-foreground)" />
            <YAxis stroke="var(--muted-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
              }}
            />
            <Line
              type="monotone"
              dataKey="accuracy"
              stroke="#6366f1"
              strokeWidth={3}
              dot={{ fill: "#6366f1", r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Weakness Heatmap */}
      <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-1">Weakness Heatmap</h2>
            <p className="text-sm text-muted-foreground">Identify topics that need more practice</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Weak</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div key={level} className={`w-6 h-6 rounded ${getHeatmapColor(level)}`}></div>
              ))}
            </div>
            <span className="text-muted-foreground">Strong</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {weaknessHeatmap.map((item) => (
            <div
              key={item.topic}
              className={`p-4 rounded-lg border border-border ${getHeatmapColor(item.level)} hover:shadow-md transition-all cursor-pointer`}
            >
              <h3 className="font-semibold text-foreground mb-2">{item.topic}</h3>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Difficulty</span>
                <span className="text-xs font-semibold text-foreground">{item.level}/5</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-gradient-to-br from-[#6366f1]/10 to-[#a855f7]/10 border border-[#6366f1]/20 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">📊 Recommendations</h2>
        <ul className="space-y-2">
          <li className="flex items-start gap-2 text-foreground">
            <span className="text-[#6366f1] mt-1">•</span>
            <span>Focus on <strong>Dynamic Programming</strong> - Your accuracy is 55%, consider reviewing fundamentals</span>
          </li>
          <li className="flex items-start gap-2 text-foreground">
            <span className="text-[#6366f1] mt-1">•</span>
            <span>Great progress on <strong>Sorting Algorithms</strong> - Maintain this momentum!</span>
          </li>
          <li className="flex items-start gap-2 text-foreground">
            <span className="text-[#6366f1] mt-1">•</span>
            <span>Practice more <strong>Graph Traversal</strong> problems to strengthen weak areas</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
