import { useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle2, Clock, Video, FileText, Code, Calendar, AlertCircle } from "lucide-react";

interface Resource {
  type: "video" | "article" | "practice";
  title: string;
  duration: string;
}

interface Topic {
  id: number;
  title: string;
  completed: boolean;
  resources: Resource[];
  timeEstimate: string;
}

interface DayPlan {
  date: string;
  day: string;
  topics: Topic[];
  totalTime: string;
}

const studyPlanData: DayPlan[] = [
  {
    date: "April 2",
    day: "Today",
    topics: [
      {
        id: 1,
        title: "Binary Search Trees - Fundamentals",
        completed: false,
        timeEstimate: "45 min",
        resources: [
          { type: "video", title: "BST Introduction", duration: "15 min" },
          { type: "article", title: "BST Operations Guide", duration: "20 min" },
          { type: "practice", title: "Practice Problems", duration: "10 min" },
        ],
      },
      {
        id: 2,
        title: "React Hooks Deep Dive",
        completed: false,
        timeEstimate: "60 min",
        resources: [
          { type: "video", title: "useState & useEffect", duration: "25 min" },
          { type: "video", title: "Custom Hooks", duration: "20 min" },
          { type: "practice", title: "Build a Counter App", duration: "15 min" },
        ],
      },
    ],
    totalTime: "1h 45min",
  },
  {
    date: "April 3",
    day: "Tomorrow",
    topics: [
      {
        id: 3,
        title: "Graph Algorithms - BFS & DFS",
        completed: false,
        timeEstimate: "90 min",
        resources: [
          { type: "video", title: "Graph Traversal Basics", duration: "30 min" },
          { type: "article", title: "BFS vs DFS Comparison", duration: "25 min" },
          { type: "practice", title: "Leetcode Graph Problems", duration: "35 min" },
        ],
      },
    ],
    totalTime: "1h 30min",
  },
  {
    date: "April 4",
    day: "Friday",
    topics: [
      {
        id: 4,
        title: "Dynamic Programming Patterns",
        completed: false,
        timeEstimate: "120 min",
        resources: [
          { type: "video", title: "DP Introduction", duration: "40 min" },
          { type: "article", title: "Common DP Patterns", duration: "30 min" },
          { type: "practice", title: "Solve 5 DP Problems", duration: "50 min" },
        ],
      },
      {
        id: 5,
        title: "CSS Grid & Flexbox Mastery",
        completed: false,
        timeEstimate: "45 min",
        resources: [
          { type: "video", title: "Grid Layout Tutorial", duration: "20 min" },
          { type: "practice", title: "Build Responsive Layouts", duration: "25 min" },
        ],
      },
    ],
    totalTime: "2h 45min",
  },
];

export function StudyPlan() {
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set(["April 2"]));

  const toggleDay = (date: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedDays(newExpanded);
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="w-4 h-4" />;
      case "article":
        return <FileText className="w-4 h-4" />;
      case "practice":
        return <Code className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Study Plan</h1>
          <p className="text-muted-foreground">Your personalized learning roadmap</p>
        </div>
        <button className="px-4 py-2 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-lg hover:shadow-lg transition-all">
          Regenerate Plan
        </button>
      </div>

      {/* Alert Banner */}
      <div className="bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-[#f59e0b] flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-foreground mb-1">Workload Alert</p>
          <p className="text-sm text-muted-foreground">
            You have 6+ hours scheduled this week. Consider rescheduling some topics to avoid burnout.
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {studyPlanData.map((dayPlan) => {
          const isExpanded = expandedDays.has(dayPlan.date);
          const completedTopics = dayPlan.topics.filter((t) => t.completed).length;
          const totalTopics = dayPlan.topics.length;

          return (
            <div key={dayPlan.date} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all">
              {/* Day Header */}
              <button
                onClick={() => toggleDay(dayPlan.date)}
                className="w-full p-6 flex items-center justify-between hover:bg-secondary transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center">
                    <Calendar className="w-6 h-6 text-[#6366f1] mb-1" />
                    <span className="text-xs text-muted-foreground">{dayPlan.day}</span>
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-foreground">{dayPlan.date}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {dayPlan.totalTime}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {completedTopics}/{totalTopics} topics
                      </span>
                    </div>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </button>

              {/* Topics */}
              {isExpanded && (
                <div className="px-6 pb-6 space-y-4">
                  {dayPlan.topics.map((topic, index) => (
                    <div
                      key={topic.id}
                      className="p-4 bg-secondary rounded-lg border border-border hover:border-[#6366f1] transition-all"
                    >
                      {/* Topic Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3 flex-1">
                          <CheckCircle2
                            className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                              topic.completed ? "text-[#22c55e]" : "text-muted-foreground"
                            }`}
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground mb-1">{topic.title}</h4>
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {topic.timeEstimate}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Resources */}
                      <div className="space-y-2 mb-4">
                        {topic.resources.map((resource, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 p-3 bg-card rounded-lg hover:bg-accent/50 transition-all cursor-pointer"
                          >
                            <div className="p-2 bg-secondary rounded-lg">
                              {getResourceIcon(resource.type)}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">{resource.title}</p>
                              <p className="text-xs text-muted-foreground">{resource.duration}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button className="flex-1 px-4 py-2 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-lg hover:shadow-md transition-all">
                          Mark Done
                        </button>
                        <button className="px-4 py-2 bg-card border border-border text-foreground rounded-lg hover:bg-secondary transition-all">
                          Skip
                        </button>
                        <button className="px-4 py-2 bg-card border border-border text-foreground rounded-lg hover:bg-secondary transition-all">
                          Reschedule
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
