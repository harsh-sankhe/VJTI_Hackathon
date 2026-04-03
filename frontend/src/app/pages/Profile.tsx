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
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-lg transition-all">
        {/* Cover + Avatar wrapper */}
        <div className="relative">
          {/* Cover */}
          <div className="h-40 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-t-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
          </div>
          {/* Avatar — absolutely positioned to straddle the cover/content boundary */}
          <div className="absolute left-8 bottom-0 translate-y-1/2">
            <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-[#6366f1] to-[#a855f7] flex items-center justify-center border-4 border-card shadow-2xl">
              <span className="text-white font-bold text-4xl">H</span>
            </div>
          </div>
        </div>

        <div className="px-8 pb-8">
          {/* Avatar & Info */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 pt-6">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              {/* Spacer that matches the avatar width so content doesn't overlap */}
              <div className="w-28 h-14 flex-shrink-0" />
              <div className="flex-1">
                <h1 className="mb-2">Harsh Kumar</h1>
                <p className="text-muted-foreground text-lg mb-4">@harshkumar</p>

                {/* Bio */}
                <p className="text-foreground leading-relaxed mb-4">
                  Computer Science student passionate about algorithms and system design. Always learning! 🚀
                </p>

                {/* Links */}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    San Francisco, CA
                  </div>
                  <div className="flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" />
                    <a href="#" className="text-[#6366f1] hover:underline font-medium">
                      harshkumar.dev
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    harsh@example.com
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Joined January 2025
                  </div>
                </div>
              </div>
            </div>

            <button className="px-6 py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all font-medium">
              Edit Profile
            </button>
          </div>

          {/* Level & XP */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-foreground text-lg">Level 8 - Advanced Learner</span>
              <span className="text-sm text-muted-foreground">1,440 / 2,000 XP</span>
            </div>
            <div className="w-full bg-muted rounded-full h-4">
              <div
                className="bg-gradient-to-r from-[#6366f1] to-[#a855f7] h-4 rounded-full transition-all shadow-sm"
                style={{ width: "72%" }}
              ></div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="p-6 bg-secondary/50 rounded-xl border border-border hover:border-[#6366f1] hover:shadow-md transition-all"
                >
                  <div className="p-2 bg-card rounded-lg w-fit mb-3">
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-2">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Skill Activity Heatmap */}
      <div className="bg-card border border-border rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h2 className="mb-2">Activity Heatmap</h2>
            <p className="text-sm text-muted-foreground">Your learning pattern over the past weeks</p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">Less</span>
            <div className="flex gap-1.5">
              {[0, 1, 2, 3, 4].map((level) => (
                <div key={level} className={`w-5 h-5 rounded ${getHeatmapColor(level)}`}></div>
              ))}
            </div>
            <span className="text-muted-foreground">More</span>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {skillActivity.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-2">
              {week.map((activity, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`w-5 h-5 rounded ${getHeatmapColor(activity)} hover:ring-2 hover:ring-[#6366f1] transition-all cursor-pointer`}
                  title={`${activity} activities`}
                ></div>
              ))}
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-6 text-sm text-muted-foreground">
          <span>12 weeks ago</span>
          <span>Today</span>
        </div>
      </div>

      {/* Badges */}
      <div className="bg-card border border-border rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-[#f59e0b]/10 rounded-lg">
            <Award className="w-7 h-7 text-[#f59e0b]" />
          </div>
          <h2>Badges & Achievements</h2>
          <span className="ml-auto text-sm text-muted-foreground bg-secondary px-3 py-1.5 rounded-lg">
            {badges.filter((b) => b.earned).length} / {badges.length} unlocked
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-6 rounded-xl border transition-all cursor-pointer ${
                badge.earned
                  ? "bg-gradient-to-br from-[#6366f1]/10 to-[#a855f7]/10 border-[#6366f1]/30 hover:shadow-lg hover:scale-105"
                  : "bg-secondary/50 border-border opacity-50 grayscale"
              }`}
            >
              <div className="text-5xl mb-3 text-center">{badge.icon}</div>
              <p className="text-sm font-medium text-foreground text-center">{badge.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-card border border-border rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all">
        <h2 className="mb-8">Recent Activity</h2>
        <div className="space-y-4">
          {[
            { action: "Completed", item: "Graph Algorithms Quiz", score: "92%", time: "2 hours ago" },
            { action: "Solved", item: "50 Dynamic Programming problems", score: "", time: "Yesterday" },
            { action: "Earned", item: "Algorithm Master Badge", score: "", time: "2 days ago" },
            { action: "Joined", item: "Study Squad: Algorithm Wizards", score: "", time: "1 week ago" },
          ].map((activity, index) => (
            <div
              key={index}
              className="flex items-center gap-5 p-5 bg-secondary/30 rounded-xl hover:bg-secondary/60 transition-all border border-transparent hover:border-border"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#a855f7] flex items-center justify-center shadow-sm">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-foreground font-medium mb-1">
                  <span className="font-bold">{activity.action}</span> {activity.item}
                </p>
                <p className="text-sm text-muted-foreground">{activity.time}</p>
              </div>
              {activity.score && (
                <div className="px-4 py-2 bg-[#22c55e]/20 text-[#22c55e] rounded-lg font-bold">
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
