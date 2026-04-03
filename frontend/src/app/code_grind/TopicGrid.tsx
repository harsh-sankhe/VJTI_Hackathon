import { TopicProgress } from "./api";
import { CheckCircle2, Hash, Database, Link, Share2, GitMerge, Search } from "lucide-react";

interface TopicGridProps {
  topics: TopicProgress[];
  selectedTopics: string[];
  onTopicSelect: (topic: string) => void;
}

const getTopicIcon = (topicName: string) => {
  switch (topicName.toLowerCase()) {
    case 'arrays': return <Hash className="w-6 h-6 text-primary" />;
    case 'strings': return <Hash className="w-6 h-6 text-primary" />;
    case 'linked list': return <Link className="w-6 h-6 text-chart-2" />;
    case 'dynamic programming': return <GitMerge className="w-6 h-6 text-chart-4" />;
    case 'graphs': return <Share2 className="w-6 h-6 text-chart-5" />;
    case 'binary search': return <Search className="w-6 h-6 text-chart-3" />;
    default: return <Database className="w-6 h-6 text-muted-foreground" />;
  }
};

export function TopicGrid({ topics, selectedTopics, onTopicSelect }: TopicGridProps) {
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">DSA Topics</h2>
        {selectedTopics.length > 0 && (
          <button 
            className="text-sm font-medium text-destructive hover:text-destructive/80 transition-colors"
            onClick={() => selectedTopics.forEach(t => onTopicSelect(t))} // toggles all off if they are in the array
          >
            Clear selection
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {topics.map((t, idx) => {
          const isSelected = selectedTopics.includes(t.topic);
          const total = parseInt(t.total_problems);
          const solved = parseInt(t.solved_problems);
          const progress = total > 0 ? (solved / total) * 100 : 0;
          
          let statusColor = "bg-muted";
          let borderStyle = "border-border";
          
          if (progress > 0 && progress < 100) {
            statusColor = "bg-[#3b82f6]"; // pending/in-progress
          } else if (progress === 100) {
            statusColor = "bg-success"; 
            borderStyle = "border-success/30 bg-success/5";
          }
          
          if (isSelected) {
            borderStyle = "border-primary ring-2 ring-primary/20 bg-primary/5 shadow-md";
          }

          return (
            <div 
              key={idx}
              className={`relative bg-card border rounded-2xl p-5 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg ${borderStyle}`}
              onClick={() => onTopicSelect(t.topic)}
            >
              {isSelected && (
                <div className="absolute top-4 right-4 text-primary animate-in zoom-in duration-200">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              )}
              
              <div className="flex items-center gap-4 mb-5">
                <div className="p-3 bg-secondary rounded-xl shadow-sm border border-border">
                   {getTopicIcon(t.topic)}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{t.topic}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 whitespace-nowrap">
                    {total} Problems
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Progress</span>
                  <span className={`font-semibold ${progress === 100 ? 'text-success' : 'text-foreground'}`}>
                    {solved} / {total}
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden border border-border/50">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${statusColor}`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
