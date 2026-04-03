import { Users, Brain, TrendingUp, FileText, Award, Plus } from "lucide-react";
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
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="mb-2">Teacher Dashboard</h1>
          <p className="text-muted-foreground text-lg">Monitor class performance and manage quizzes</p>
        </div>
        <button className="px-6 py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2 font-medium">
          <Plus className="w-5 h-5" />
          Create New Quiz
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-foreground">Total Students</h3>
            <div className="p-2 bg-[#6366f1]/10 rounded-lg">
              <Users className="w-5 h-5 text-[#6366f1]" />
            </div>
          </div>
          <div className="text-4xl font-bold text-foreground mb-2">48</div>
          <p className="text-sm text-muted-foreground">Active learners</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-foreground">Quizzes Created</h3>
            <div className="p-2 bg-[#a855f7]/10 rounded-lg">
              <Brain className="w-5 h-5 text-[#a855f7]" />
            </div>
          </div>
          <div className="text-4xl font-bold text-foreground mb-2">24</div>
          <p className="text-sm text-muted-foreground">This semester</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-foreground">Avg Class Score</h3>
            <div className="p-2 bg-[#22c55e]/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-[#22c55e]" />
            </div>
          </div>
          <div className="text-4xl font-bold text-foreground mb-2">82%</div>
          <p className="text-sm text-[#22c55e]">+5% from last week ↑</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-foreground">Completion Rate</h3>
            <div className="p-2 bg-[#f59e0b]/10 rounded-lg">
              <Award className="w-5 h-5 text-[#f59e0b]" />
            </div>
          </div>
          <div className="text-4xl font-bold text-foreground mb-2">91%</div>
          <p className="text-sm text-muted-foreground">Excellent!</p>
        </div>
      </div>

      {/* Quiz Creation Interface */}
      <div className="bg-card border border-border rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-[#6366f1]/10 rounded-lg">
            <FileText className="w-6 h-6 text-[#6366f1]" />
          </div>
          <h2>Manual Quiz Builder</h2>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-medium text-foreground mb-3">Quiz Title</label>
              <input
                type="text"
                placeholder="e.g., Dynamic Programming Fundamentals"
                className="w-full px-4 py-3 bg-secondary border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
            </div>
            <div>
              <label className="block font-medium text-foreground mb-3">Topic</label>
              <select className="w-full px-4 py-3 bg-secondary border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring transition-all">
                <option>Data Structures</option>
                <option>Algorithms</option>
                <option>System Design</option>
                <option>Frontend Development</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block font-medium text-foreground mb-3">Difficulty</label>
              <select className="w-full px-4 py-3 bg-secondary border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring transition-all">
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-foreground mb-3">Duration (minutes)</label>
              <input
                type="number"
                placeholder="30"
                className="w-full px-4 py-3 bg-secondary border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
            </div>
            <div>
              <label className="block font-medium text-foreground mb-3">Total Questions</label>
              <input
                type="number"
                placeholder="10"
                className="w-full px-4 py-3 bg-secondary border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button className="px-8 py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all font-medium">
              Add Questions
            </button>
            <button className="px-8 py-3 bg-secondary border border-border text-foreground rounded-xl hover:bg-accent hover:scale-105 transition-all font-medium">
              Save as Draft
            </button>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly Engagement */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all">
          <h2 className="mb-8">Weekly Engagement</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={weeklyEngagement}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
              <XAxis dataKey="day" stroke="var(--muted-foreground)" style={{ fontSize: '14px' }} />
              <YAxis stroke="var(--muted-foreground)" style={{ fontSize: '14px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Line
                type="monotone"
                dataKey="students"
                stroke="#6366f1"
                strokeWidth={4}
                dot={{ fill: "#6366f1", r: 6, strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Topic Weakness */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all">
          <h2 className="mb-8">Topics Needing Attention</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topicWeakness}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
              <XAxis dataKey="topic" stroke="var(--muted-foreground)" hide />
              <YAxis stroke="var(--muted-foreground)" style={{ fontSize: '14px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Bar dataKey="students" fill="url(#barGradient)" radius={[10, 10, 0, 0]} />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-6 space-y-3">
            {topicWeakness.map((topic) => (
              <div key={topic.topic} className="flex justify-between p-3 bg-secondary/50 rounded-lg">
                <span className="font-medium text-foreground">{topic.topic}</span>
                <span className="text-sm text-muted-foreground">{topic.students} students struggling</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Student Performance Table */}
      <div className="bg-card border border-border rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all">
        <h2 className="mb-8">Student Performance</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-4 px-4 font-semibold text-foreground">Student</th>
                <th className="text-left py-4 px-4 font-semibold text-foreground">Accuracy</th>
                <th className="text-left py-4 px-4 font-semibold text-foreground">Completed</th>
                <th className="text-left py-4 px-4 font-semibold text-foreground">Weak Topic</th>
              </tr>
            </thead>
            <tbody>
              {classData.map((student, index) => (
                <tr key={index} className="border-b border-border hover:bg-secondary/30 transition-all">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6366f1] to-[#a855f7] flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">{student.student[0]}</span>
                      </div>
                      <span className="font-medium text-foreground">{student.student}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-3 py-1.5 rounded-lg font-semibold ${
                        student.accuracy >= 90
                          ? "bg-[#22c55e]/20 text-[#22c55e]"
                          : student.accuracy >= 80
                          ? "bg-[#f59e0b]/20 text-[#f59e0b]"
                          : "bg-[#ef4444]/20 text-[#ef4444]"
                      }`}
                    >
                      {student.accuracy}%
                    </span>
                  </td>
                  <td className="py-4 px-4 font-medium text-foreground">{student.completed} problems</td>
                  <td className="py-4 px-4">
                    <span className="px-3 py-1.5 bg-secondary rounded-lg text-muted-foreground font-medium">
                      {student.weak}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
