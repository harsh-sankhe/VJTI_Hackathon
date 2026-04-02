import { Users, Brain, TrendingUp, FileText, Award, Plus, AlertCircle } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const classData = [
  { student: "Alex", accuracy: 85, completed: 45, weak: "DP" },
  { student: "Sarah", accuracy: 92, completed: 52, weak: "Graphs" },
  { student: "Mike", accuracy: 78, completed: 38, weak: "Trees" },
  { student: "Emma", accuracy: 88, completed: 48, weak: "Sorting" },
  { student: "John", accuracy: 74, completed: 35, weak: "DP" },
];

const weeklyEngagement = [
  { day: "Mon", students: 42, quizzes: 15 },
  { day: "Tue", students: 38, quizzes: 12 },
  { day: "Wed", students: 45, quizzes: 18 },
  { day: "Thu", students: 40, quizzes: 14 },
  { day: "Fri", students: 35, quizzes: 10 },
];

const topicWeakness = [
  { topic: "Dynamic Programming", students: 12, avg: 58 },
  { topic: "Graph Algorithms", students: 8, avg: 65 },
  { topic: "Binary Trees", students: 6, avg: 72 },
  { topic: "Recursion", students: 5, avg: 75 },
];

export function TeacherDashboard() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Teacher Dashboard</h1>
          <p className="text-muted-foreground">Monitor class performance and create quizzes</p>
        </div>
        <button className="px-4 py-2 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Quiz
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">Total Students</h3>
            <Users className="w-5 h-5 text-[#6366f1]" />
          </div>
          <div className="text-3xl font-bold text-foreground mb-1">48</div>
          <p className="text-xs text-muted-foreground">Active learners</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">Quizzes Created</h3>
            <Brain className="w-5 h-5 text-[#a855f7]" />
          </div>
          <div className="text-3xl font-bold text-foreground mb-1">24</div>
          <p className="text-xs text-muted-foreground">This semester</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">Avg Class Score</h3>
            <TrendingUp className="w-5 h-5 text-[#22c55e]" />
          </div>
          <div className="text-3xl font-bold text-foreground mb-1">82%</div>
          <p className="text-xs text-muted-foreground">+5% from last week</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">Completion Rate</h3>
            <Award className="w-5 h-5 text-[#f59e0b]" />
          </div>
          <div className="text-3xl font-bold text-foreground mb-1">91%</div>
          <p className="text-xs text-muted-foreground">Excellent!</p>
        </div>
      </div>

      {/* Quiz Creation Interface */}
      <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all">
        <h2 className="text-xl font-semibold text-foreground mb-6">Create New Quiz</h2>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Quiz Title</label>
              <input
                type="text"
                placeholder="e.g., Dynamic Programming Fundamentals"
                className="w-full px-4 py-2 bg-secondary border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Topic</label>
              <select className="w-full px-4 py-2 bg-secondary border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring">
                <option>Data Structures</option>
                <option>Algorithms</option>
                <option>System Design</option>
                <option>Frontend Development</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Difficulty</label>
              <select className="w-full px-4 py-2 bg-secondary border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring">
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Duration (minutes)</label>
              <input
                type="number"
                placeholder="30"
                className="w-full px-4 py-2 bg-secondary border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Total Questions</label>
              <input
                type="number"
                placeholder="10"
                className="w-full px-4 py-2 bg-secondary border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button className="px-6 py-2 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-lg hover:shadow-lg transition-all">
              Generate AI Quiz
            </button>
            <button className="px-6 py-2 bg-secondary border border-border text-foreground rounded-lg hover:bg-accent transition-all">
              Manual Entry
            </button>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Engagement */}
        <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all">
          <h2 className="text-xl font-semibold text-foreground mb-6">Weekly Engagement</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={weeklyEngagement}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" stroke="var(--muted-foreground)" />
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
                dataKey="students"
                stroke="#6366f1"
                strokeWidth={3}
                dot={{ fill: "#6366f1", r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Topic Weakness */}
        <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all">
          <h2 className="text-xl font-semibold text-foreground mb-6">Topics Needing Attention</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topicWeakness}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="topic" stroke="var(--muted-foreground)" hide />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="students" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {topicWeakness.map((topic) => (
              <div key={topic.topic} className="flex justify-between text-sm">
                <span className="text-foreground">{topic.topic}</span>
                <span className="text-muted-foreground">{topic.students} students struggling</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Student Performance Table */}
      <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Student Performance</h2>
          <button className="text-sm text-[#6366f1] hover:text-[#a855f7] font-medium">Export Report</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-foreground">Student</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Accuracy</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Completed</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Weak Topic</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {classData.map((student, index) => (
                <tr key={index} className="border-b border-border hover:bg-secondary transition-all">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6366f1] to-[#a855f7] flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">{student.student[0]}</span>
                      </div>
                      <span className="font-medium text-foreground">{student.student}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`font-semibold ${
                        student.accuracy >= 85
                          ? "text-[#22c55e]"
                          : student.accuracy >= 75
                          ? "text-[#f59e0b]"
                          : "text-[#ef4444]"
                      }`}
                    >
                      {student.accuracy}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-foreground">{student.completed} problems</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-[#ef4444]/10 text-[#ef4444] text-xs font-semibold rounded">
                      {student.weak}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button className="text-sm text-[#6366f1] hover:text-[#a855f7] font-medium">View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alerts */}
      <div className="bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-[#f59e0b] flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-foreground mb-1">Action Required</p>
          <p className="text-sm text-muted-foreground">
            12 students are struggling with Dynamic Programming. Consider creating additional practice materials or hosting a review session.
          </p>
        </div>
      </div>
    </div>
  );
}
