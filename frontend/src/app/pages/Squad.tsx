import { Trophy, Users, TrendingUp, MessageCircle, Crown, Medal, Award, Flame, Zap } from "lucide-react";

const squadMembers = [
  { id: 1, name: "Harsh Kumar", avatar: "H", xp: 1440, progress: 85, rank: 1, streak: 12 },
  { id: 2, name: "Sarah Chen", avatar: "S", xp: 1380, progress: 82, rank: 2, streak: 10 },
  { id: 3, name: "Mike Johnson", avatar: "M", xp: 1250, progress: 78, rank: 3, streak: 8 },
  { id: 4, name: "Priya Patel", avatar: "P", xp: 1180, progress: 75, rank: 4, streak: 15 },
  { id: 5, name: "Alex Wong", avatar: "A", xp: 1120, progress: 72, rank: 5, streak: 6 },
];

const activities = [
  { user: "Sarah Chen", action: "completed", item: "Graph Algorithms Quiz", time: "2 hours ago", type: "achievement" },
  { user: "Mike Johnson", action: "unlocked", item: "Data Structures Master Badge", time: "5 hours ago", type: "badge" },
  { user: "Priya Patel", action: "reached", item: "15-day streak", time: "8 hours ago", type: "streak" },
  { user: "You", action: "solved", item: "50 Dynamic Programming problems", time: "Yesterday", type: "achievement" },
  { user: "Alex Wong", action: "joined", item: "the squad", time: "2 days ago", type: "join" },
];

export function Squad() {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-[#f59e0b]" />;
      case 2:
        return <Medal className="w-5 h-5 text-[#94a3b8]" />;
      case 3:
        return <Award className="w-5 h-5 text-[#ea580c]" />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="mb-2">Study Squad</h1>
          <p className="text-muted-foreground">Learn together, grow together</p>
        </div>
        <button className="px-6 py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2 font-medium">
          <Users className="w-5 h-5" />
          Invite Friends
        </button>
      </div>

      {/* Squad Info Card */}
      <div className="bg-gradient-to-br from-[#6366f1] to-[#a855f7] rounded-2xl p-8 text-white relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/4 translate-x-1/4"></div>
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm">
                <Trophy className="w-7 h-7" />
              </div>
              <div>
                <h2>The Algorithm Wizards</h2>
                <p className="text-white/90 mt-1">Squad Rank: #47 Global</p>
              </div>
            </div>
            <div className="text-right bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3">
              <div className="text-4xl font-bold">5</div>
              <div className="text-sm text-white/90 mt-1">Members</div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
              <div className="text-3xl font-bold mb-1">6,370</div>
              <div className="text-white/90">Total XP</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
              <div className="text-3xl font-bold mb-1">79%</div>
              <div className="text-white/90">Avg Accuracy</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
              <div className="text-3xl font-bold mb-1">12</div>
              <div className="text-white/90">Squad Streak</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Leaderboard */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-8">
            <h2>Squad Leaderboard</h2>
            <button className="text-sm text-[#6366f1] hover:text-[#a855f7] font-medium transition-colors">View All</button>
          </div>

          <div className="space-y-4">
            {squadMembers.map((member) => (
              <div
                key={member.id}
                className={`p-5 rounded-xl border transition-all hover:shadow-md cursor-pointer ${
                  member.rank === 1
                    ? "bg-gradient-to-r from-[#f59e0b]/10 to-[#f59e0b]/5 border-[#f59e0b]/30 shadow-sm"
                    : "bg-secondary/50 border-border hover:border-[#6366f1]/50"
                }`}
              >
                <div className="flex items-center gap-5">
                  {/* Rank */}
                  <div className="flex items-center justify-center w-10">
                    {member.rank <= 3 ? (
                      getRankIcon(member.rank)
                    ) : (
                      <span className="font-bold text-muted-foreground">#{member.rank}</span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#a855f7] flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-lg">{member.avatar}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-foreground truncate">{member.name}</h3>
                      {member.rank === 1 && (
                        <span className="px-2.5 py-1 bg-[#f59e0b]/20 text-[#f59e0b] text-xs font-bold rounded-md whitespace-nowrap">
                          Leader
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-[#f59e0b]" />
                        <span className="font-medium">{member.xp} XP</span>
                      </span>
                      <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <Flame className="w-4 h-4 text-[#ef4444]" />
                        <span className="font-medium">{member.streak} days</span>
                      </span>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="text-right">
                    <div className="text-3xl font-bold text-foreground mb-1">{member.progress}%</div>
                    <div className="text-xs text-muted-foreground">Progress</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div
                      className="bg-gradient-to-r from-[#6366f1] to-[#a855f7] h-2.5 rounded-full transition-all shadow-sm"
                      style={{ width: `${member.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all">
          <h2 className="mb-8">Recent Activity</h2>

          <div className="space-y-5">
            {activities.map((activity, index) => (
              <div key={index} className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#a855f7] flex items-center justify-center flex-shrink-0 shadow-md">
                  {activity.type === "achievement" && <TrendingUp className="w-5 h-5 text-white" />}
                  {activity.type === "badge" && <Award className="w-5 h-5 text-white" />}
                  {activity.type === "streak" && <Flame className="w-5 h-5 text-white" />}
                  {activity.type === "join" && <Users className="w-5 h-5 text-white" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground leading-relaxed">
                    <span className="font-semibold">{activity.user}</span> {activity.action}{" "}
                    <span className="font-semibold">{activity.item}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1.5">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-8 p-4 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2 font-medium">
            <MessageCircle className="w-5 h-5" />
            Open Squad Chat
          </button>
        </div>
      </div>

      {/* Squad Challenge */}
      <div className="bg-card border border-border rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all">
        <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
          <div>
            <h2 className="mb-2">Weekly Squad Challenge</h2>
            <p className="text-muted-foreground">Complete 100 problems as a squad to unlock rewards</p>
          </div>
          <div className="text-right bg-secondary/50 rounded-xl px-6 py-3 border border-border">
            <div className="text-4xl font-bold text-foreground">73/100</div>
            <div className="text-sm text-muted-foreground mt-1">Problems solved</div>
          </div>
        </div>
        <div className="w-full bg-muted rounded-full h-5 mb-5">
          <div
            className="bg-gradient-to-r from-[#6366f1] to-[#a855f7] h-5 rounded-full transition-all shadow-sm"
            style={{ width: "73%" }}
          ></div>
        </div>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <span className="text-sm text-muted-foreground">⏰ 3 days remaining</span>
          <span className="text-sm font-semibold text-[#6366f1] bg-[#6366f1]/10 px-3 py-1.5 rounded-lg">🎁 Reward: 500 XP each</span>
        </div>
      </div>
    </div>
  );
}
