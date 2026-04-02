import { Award, Calendar, Flame, Zap, TrendingUp, MapPin, Link as LinkIcon, Mail } from "lucide-react";

const badges = [
  { id: 1, name: "100 Day Streak", icon: "🔥", earned: true },
  { id: 2, name: "Algorithm Master", icon: "🧠", earned: true },
  { id: 3, name: "Quiz Champion", icon: "🏆", earned: true },
  { id: 4, name: "Fast Learner", icon: "⚡", earned: true },
  { id: 5, name: "Team Player", icon: "🤝", earned: true },
  { id: 6, name: "Code Mentor", icon: "👨‍🏫", earned: false },
  { id: 7, name: "Problem Solver", icon: "🎯", earned: false },
  { id: 8, name: "Night Owl", icon: "🦉", earned: false },
];

const skillActivity = [
  [0, 1, 2, 1, 3, 2, 1, 0, 1, 2, 3, 4],
  [1, 2, 3, 2, 1, 3, 2, 1, 2, 3, 2, 1],
  [2, 3, 1, 2, 3, 4, 3, 2, 3, 2, 1, 2],
  [1, 2, 3, 4, 2, 1, 2, 3, 2, 1, 2, 3],
  [3, 2, 1, 2, 3, 2, 4, 3, 2, 3, 2, 1],
  [2, 1, 2, 3, 2, 1, 2, 3, 4, 2, 1, 2],
  [1, 2, 3, 2, 1, 2, 3, 2, 1, 2, 3, 2],
];

const stats = [
  { label: "Problems Solved", value: "358", icon: TrendingUp, color: "text-[#6366f1]" },
  { label: "Current Streak", value: "12 days", icon: Flame, color: "text-[#ef4444]" },
  { label: "Total XP", value: "1,440", icon: Zap, color: "text-[#f59e0b]" },
  { label: "Study Hours", value: "127h", icon: Calendar, color: "text-[#22c55e]" },
];

export function Profile() {
  const getHeatmapColor = (level: number) => {
    if (level === 0) return "bg-secondary";
    if (level === 1) return "bg-[#6366f1]/20";
    if (level === 2) return "bg-[#6366f1]/40";
    if (level === 3) return "bg-[#6366f1]/60";
    return "bg-[#6366f1]/80";
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all">
        {/* Cover */}
        <div className="h-32 bg-gradient-to-r from-[#6366f1] to-[#a855f7] relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
        </div>

        <div className="px-6 pb-6">
          {/* Avatar & Info */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-16 mb-6">
            <div className="flex items-end gap-4">
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-[#6366f1] to-[#a855f7] flex items-center justify-center border-4 border-card shadow-xl">
                <span className="text-white font-bold text-5xl">H</span>
              </div>
              <div className="mb-2">
                <h1 className="text-2xl font-bold text-foreground mb-1">Harsh Kumar</h1>
                <p className="text-muted-foreground">@harshkumar</p>
              </div>
            </div>

            <button className="px-6 py-2 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-lg hover:shadow-lg transition-all">
              Edit Profile
            </button>
          </div>

          {/* Level & XP */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-foreground">Level 8 - Advanced Learner</span>
              <span className="text-sm text-muted-foreground">1,440 / 2,000 XP</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-3">
              <div
                className="bg-gradient-to-r from-[#6366f1] to-[#a855f7] h-3 rounded-full transition-all"
                style={{ width: "72%" }}
              ></div>
            </div>
          </div>

          {/* Bio & Links */}
          <div className="space-y-3 mb-6">
            <p className="text-foreground">
              Computer Science student passionate about algorithms and system design. Always learning! 🚀
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                San Francisco, CA
              </div>
              <div className="flex items-center gap-1">
                <LinkIcon className="w-4 h-4" />
                <a href="#" className="text-[#6366f1] hover:underline">
                  harshkumar.dev
                </a>
              </div>
              <div className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                harsh@example.com
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Joined January 2025
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="p-4 bg-secondary rounded-lg border border-border hover:border-[#6366f1] transition-all"
                >
                  <Icon className={`w-5 h-5 ${stat.color} mb-2`} />
                  <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Skill Activity Heatmap */}
      <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-1">Activity Heatmap</h2>
            <p className="text-sm text-muted-foreground">Your learning pattern over the past weeks</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Less</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((level) => (
                <div key={level} className={`w-4 h-4 rounded ${getHeatmapColor(level)}`}></div>
              ))}
            </div>
            <span className="text-muted-foreground">More</span>
          </div>
        </div>

        <div className="flex gap-1 overflow-x-auto pb-2">
          {skillActivity.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((activity, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`w-4 h-4 rounded ${getHeatmapColor(activity)} hover:ring-2 hover:ring-[#6366f1] transition-all cursor-pointer`}
                  title={`${activity} activities`}
                ></div>
              ))}
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-4 text-xs text-muted-foreground">
          <span>12 weeks ago</span>
          <span>Today</span>
        </div>
      </div>

      {/* Badges */}
      <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all">
        <div className="flex items-center gap-2 mb-6">
          <Award className="w-6 h-6 text-[#f59e0b]" />
          <h2 className="text-xl font-semibold text-foreground">Badges & Achievements</h2>
          <span className="ml-auto text-sm text-muted-foreground">
            {badges.filter((b) => b.earned).length} / {badges.length} unlocked
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 rounded-lg border transition-all cursor-pointer ${
                badge.earned
                  ? "bg-gradient-to-br from-[#6366f1]/10 to-[#a855f7]/10 border-[#6366f1]/30 hover:shadow-md"
                  : "bg-secondary border-border opacity-50 grayscale"
              }`}
            >
              <div className="text-4xl mb-2 text-center">{badge.icon}</div>
              <p className="text-sm font-medium text-foreground text-center">{badge.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all">
        <h2 className="text-xl font-semibold text-foreground mb-6">Recent Activity</h2>
        <div className="space-y-4">
          {[
            { action: "Completed", item: "Graph Algorithms Quiz", score: "92%", time: "2 hours ago" },
            { action: "Solved", item: "50 Dynamic Programming problems", score: "", time: "Yesterday" },
            { action: "Earned", item: "Algorithm Master Badge", score: "", time: "2 days ago" },
            { action: "Joined", item: "Study Squad: Algorithm Wizards", score: "", time: "1 week ago" },
          ].map((activity, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-4 bg-secondary rounded-lg hover:bg-accent/50 transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#6366f1] to-[#a855f7] flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-foreground">
                  <span className="font-semibold">{activity.action}</span> {activity.item}
                </p>
                <p className="text-sm text-muted-foreground">{activity.time}</p>
              </div>
              {activity.score && (
                <div className="px-3 py-1 bg-[#22c55e]/20 text-[#22c55e] rounded-lg font-semibold">
                  {activity.score}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
