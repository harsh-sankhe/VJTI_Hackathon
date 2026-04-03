import { GraduationCap, Star, MessageCircle, Video, Calendar, Award } from "lucide-react";

const mentors = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    avatar: "S",
    expertise: "Data Structures & Algorithms",
    rating: 4.9,
    sessions: 127,
    price: "Free",
    available: true,
  },
  {
    id: 2,
    name: "Mike Chen",
    avatar: "M",
    expertise: "React & Frontend Development",
    rating: 4.8,
    sessions: 93,
    price: "Free",
    available: true,
  },
  {
    id: 3,
    name: "Priya Kumar",
    avatar: "P",
    expertise: "System Design",
    rating: 4.7,
    sessions: 65,
    price: "Free",
    available: false,
  },
];

const upcomingSessions = [
  {
    id: 1,
    mentor: "Dr. Sarah Johnson",
    topic: "Binary Trees Deep Dive",
    date: "April 3, 2026",
    time: "3:00 PM",
  },
  {
    id: 2,
    mentor: "Mike Chen",
    topic: "React Hooks Masterclass",
    date: "April 5, 2026",
    time: "5:00 PM",
  },
];

export function Teaching() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Peer Teaching</h1>
          <p className="text-muted-foreground">Learn from experts and become a mentor yourself</p>
        </div>
        <button className="px-4 py-2 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2">
          <GraduationCap className="w-4 h-4" />
          Become a Mentor
        </button>
      </div>

      {/* Mentor Banner */}
      <div className="bg-gradient-to-br from-[#6366f1] to-[#a855f7] rounded-xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Want to share your knowledge?</h2>
            <p className="text-white/90 mb-4">
              Become a mentor and help fellow learners while earning recognition
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                <span className="text-sm">Earn Badges</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                <span className="text-sm">Build Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                <span className="text-sm">Share Expertise</span>
              </div>
            </div>
          </div>
          <div className="hidden md:block text-7xl">👨‍🏫</div>
        </div>
      </div>

      {/* Upcoming Sessions */}
      {upcomingSessions.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all">
          <h2 className="text-xl font-semibold text-foreground mb-6">Your Upcoming Sessions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingSessions.map((session) => (
              <div
                key={session.id}
                className="p-4 bg-secondary border border-border rounded-lg hover:border-[#6366f1] transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="p-3 bg-gradient-to-br from-[#6366f1] to-[#a855f7] rounded-lg">
                    <Video className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">{session.topic}</h3>
                    <p className="text-sm text-muted-foreground mb-2">with {session.mentor}</p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {session.date}
                      </span>
                      <span>{session.time}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button className="flex-1 px-4 py-2 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-lg hover:shadow-md transition-all">
                    Join Session
                  </button>
                  <button className="px-4 py-2 bg-card border border-border text-foreground rounded-lg hover:bg-secondary transition-all">
                    Reschedule
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Mentors */}
      <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all">
        <h2 className="text-xl font-semibold text-foreground mb-6">Available Mentors</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mentors.map((mentor) => (
            <div
              key={mentor.id}
              className="p-6 bg-secondary border border-border rounded-lg hover:border-[#6366f1] hover:shadow-md transition-all"
            >
              {/* Avatar & Status */}
              <div className="flex items-start justify-between mb-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#6366f1] to-[#a855f7] flex items-center justify-center">
                    <span className="text-white font-semibold text-2xl">{mentor.avatar}</span>
                  </div>
                  {mentor.available && (
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#22c55e] border-2 border-secondary rounded-full"></div>
                  )}
                </div>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded ${
                    mentor.available
                      ? "bg-[#22c55e]/20 text-[#22c55e]"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {mentor.available ? "Available" : "Offline"}
                </span>
              </div>

              {/* Info */}
              <h3 className="font-semibold text-foreground mb-1">{mentor.name}</h3>
              <p className="text-sm text-muted-foreground mb-3">{mentor.expertise}</p>

              {/* Stats */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-[#f59e0b] fill-[#f59e0b]" />
                  <span className="text-sm font-semibold text-foreground">{mentor.rating}</span>
                </div>
                <div className="text-sm text-muted-foreground">{mentor.sessions} sessions</div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button className="flex-1 px-4 py-2 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-lg hover:shadow-md transition-all">
                  Book Session
                </button>
                <button className="px-4 py-2 bg-card border border-border text-foreground rounded-lg hover:bg-accent transition-all">
                  <MessageCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Session Interface Preview */}
      <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all">
        <h2 className="text-xl font-semibold text-foreground mb-6">Live Session Tools</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chat Panel */}
          <div className="p-6 bg-secondary border border-border rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="w-5 h-5 text-[#6366f1]" />
              <h3 className="font-semibold text-foreground">Live Chat</h3>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-card rounded-lg">
                <p className="text-sm font-semibold text-foreground mb-1">Mentor</p>
                <p className="text-sm text-muted-foreground">
                  Let's start with the basics of binary search trees...
                </p>
              </div>
              <div className="p-3 bg-[#6366f1]/10 rounded-lg">
                <p className="text-sm font-semibold text-foreground mb-1">You</p>
                <p className="text-sm text-muted-foreground">
                  Can you explain the difference between BST and binary tree?
                </p>
              </div>
            </div>
            <div className="mt-4">
              <input
                type="text"
                placeholder="Type your message..."
                className="w-full px-4 py-2 bg-card border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Whiteboard */}
          <div className="p-6 bg-secondary border border-border rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="w-5 h-5 text-[#6366f1]" />
              <h3 className="font-semibold text-foreground">Collaborative Whiteboard</h3>
            </div>
            <div className="h-48 bg-card border border-border rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground text-sm">Whiteboard area (drawing tools, code editor)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
