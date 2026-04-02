import { Heart, MessageCircle, Share2, Trophy, Flame, Award, TrendingUp, Target } from "lucide-react";

const feedPosts = [
  {
    id: 1,
    user: { name: "Sarah Chen", avatar: "S", level: 12 },
    action: "achievement",
    content: "Completed 100-day learning streak! 🔥",
    description: "Consistency is key! Studied every single day for 100 days straight.",
    time: "2 hours ago",
    likes: 45,
    comments: 12,
    icon: Flame,
    iconColor: "text-[#ef4444]",
  },
  {
    id: 2,
    user: { name: "Mike Johnson", avatar: "M", level: 10 },
    action: "badge",
    content: "Unlocked 'Algorithm Master' Badge",
    description: "Solved 500+ algorithmic problems across all difficulty levels.",
    time: "5 hours ago",
    likes: 78,
    comments: 23,
    icon: Award,
    iconColor: "text-[#f59e0b]",
  },
  {
    id: 3,
    user: { name: "Priya Patel", avatar: "P", level: 14 },
    action: "milestone",
    content: "Reached Level 14 with 3,500 XP!",
    description: "Another milestone achieved! Thank you squad for the support 💜",
    time: "1 day ago",
    likes: 92,
    comments: 18,
    icon: TrendingUp,
    iconColor: "text-[#22c55e]",
  },
  {
    id: 4,
    user: { name: "Alex Wong", avatar: "A", level: 9 },
    action: "quiz",
    content: "Scored 95% on Dynamic Programming Quiz",
    description: "Finally conquered DP! Practice makes perfect.",
    time: "1 day ago",
    likes: 56,
    comments: 9,
    icon: Target,
    iconColor: "text-[#6366f1]",
  },
  {
    id: 5,
    user: { name: "Emma Wilson", avatar: "E", level: 11 },
    action: "competition",
    content: "Won 1st place in Squad Challenge",
    description: "Our squad 'The Algorithm Wizards' topped the weekly leaderboard!",
    time: "2 days ago",
    likes: 134,
    comments: 31,
    icon: Trophy,
    iconColor: "text-[#f59e0b]",
  },
];

export function Feed() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Learning Feed</h1>
        <p className="text-muted-foreground">Celebrate achievements and stay motivated together</p>
      </div>

      {/* Create Post */}
      <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6366f1] to-[#a855f7] flex items-center justify-center">
            <span className="text-white font-semibold text-lg">H</span>
          </div>
          <input
            type="text"
            placeholder="Share your learning achievement..."
            className="flex-1 px-4 py-3 bg-secondary border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Feed Posts */}
      <div className="space-y-6">
        {feedPosts.map((post) => {
          const Icon = post.icon;
          return (
            <div
              key={post.id}
              className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all"
            >
              {/* User Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6366f1] to-[#a855f7] flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">{post.user.avatar}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{post.user.name}</h3>
                      <span className="px-2 py-0.5 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white text-xs font-semibold rounded">
                        Level {post.user.level}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{post.time}</p>
                  </div>
                </div>
              </div>

              {/* Achievement Card */}
              <div className="mb-4 p-4 bg-gradient-to-br from-secondary to-accent/30 rounded-lg border border-border">
                <div className="flex items-start gap-3">
                  <div className="p-3 bg-card rounded-lg">
                    <Icon className={`w-6 h-6 ${post.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">{post.content}</h4>
                    <p className="text-sm text-muted-foreground">{post.description}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-6 pt-4 border-t border-border">
                <button className="flex items-center gap-2 text-muted-foreground hover:text-[#ef4444] transition-all group">
                  <Heart className="w-5 h-5 group-hover:fill-[#ef4444]" />
                  <span className="text-sm font-medium">{post.likes}</span>
                </button>
                <button className="flex items-center gap-2 text-muted-foreground hover:text-[#6366f1] transition-all">
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">{post.comments}</span>
                </button>
                <button className="flex items-center gap-2 text-muted-foreground hover:text-[#22c55e] transition-all">
                  <Share2 className="w-5 h-5" />
                  <span className="text-sm font-medium">Share</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Load More */}
      <button className="w-full py-3 bg-secondary border border-border text-foreground rounded-lg hover:bg-accent hover:text-accent-foreground transition-all">
        Load More Posts
      </button>
    </div>
  );
}
