import { useState } from "react";
import { Problem } from "./api";
import { ExternalLink, CheckCircle2, Circle, AlertCircle, PlayCircle, Zap, List } from "lucide-react";

interface ProblemListProps {
  problems: Problem[];
  onAction: (problem: Problem) => void;
}

export function ProblemList({ problems, onAction }: ProblemListProps) {
  const [diffFilter, setDiffFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const filtered = problems.filter(p => {
    if (diffFilter !== "All" && p.difficulty !== diffFilter) return false;
    if (statusFilter !== "All" && p.status !== statusFilter) return false;
    return true;
  });

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Easy': return 'bg-success/10 text-success border-success/20';
      case 'Medium': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'Hard': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === 'Completed') return <span title="Completed"><CheckCircle2 className="w-5 h-5 text-success" /></span>;
    if (status === 'Partially Done') return <span title="Partially Done"><AlertCircle className="w-5 h-5 text-warning" /></span>;
    return <span title="Unsolved"><Circle className="w-5 h-5 text-muted-foreground" /></span>;
  };

  return (
    <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col animate-in fade-in duration-300">
      
      {/* Filters Bar */}
      <div className="p-4 border-b border-border bg-secondary/50 flex flex-wrap items-center gap-4 justify-between">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <List className="w-4 h-4" /> 
          {filtered.length} Problems
        </h3>
        <div className="flex gap-3 text-sm">
          <select 
            className="bg-card border border-border rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-primary focus:outline-none"
            value={diffFilter}
            onChange={(e) => setDiffFilter(e.target.value)}
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
          <select 
            className="bg-card border border-border rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-primary focus:outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Unsolved">Unsolved</option>
            <option value="Partially Done">Partially Done</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-card text-muted-foreground text-sm border-b border-border">
              <th className="p-4 font-medium w-16 text-center">Status</th>
              <th className="p-4 font-medium">Title</th>
              <th className="p-4 font-medium">Topic / Subtopic</th>
              <th className="p-4 font-medium">Difficulty</th>
              <th className="p-4 font-medium text-center">XP</th>
              <th className="p-4 font-medium text-right pr-6">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  No problems found matching your filters.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr 
                  key={p.problem_id} 
                  className={`border-b border-border hover:bg-secondary/30 transition-colors ${
                    p.status === 'Completed' ? 'bg-success/5' : ''
                  }`}
                >
                  <td className="p-4 text-center">
                    <div className="flex justify-center">{getStatusIcon(p.status)}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-foreground">{p.title}</div>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground/80">{p.topic}</span>
                    <span className="mx-2 opacity-50">•</span>
                    {p.subtopic}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getDifficultyColor(p.difficulty)}`}>
                      {p.difficulty}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-accent">
                      <Zap className="w-3.5 h-3.5" />
                      {p.xp_value}
                    </span>
                  </td>
                  <td className="p-4 text-right pr-6 space-x-2 whitespace-nowrap">
                    <a 
                      href={p.leetcode_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border rounded-lg text-sm font-medium hover:bg-secondary transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      LeetCode <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button 
                      onClick={() => onAction(p)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        p.status === 'Completed' 
                          ? 'bg-secondary text-foreground hover:bg-border border border-transparent'
                          : 'bg-primary text-white hover:bg-primary/90 shadow-sm'
                      }`}
                    >
                      {p.status === 'Completed' ? 'Review' : 'Solve'} <PlayCircle className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

