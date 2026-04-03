import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { Target, Brain, AlertCircle, Calendar, Loader2, ArrowLeft, BookOpen } from "lucide-react";
import { quizApi } from "../api/quizApi";
import ForceGraph2D from "react-force-graph-2d";


export function Insights() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get("session_id");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [insights, setInsights] = useState<any>(null);

  useEffect(() => {
    if (sessionId) {
      fetchInsights();
    } else {
      setError("No session ID found. Please complete a quiz first.");
      setLoading(false);
    }
  }, [sessionId]);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const data = await quizApi.getInsights(sessionId!);
      setInsights(data);
    } catch (err: any) {
      console.error("Insights error:", err);
      setError(err?.message || "Failed to load insights. The quiz session may not be complete yet.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
        <span className="text-lg font-medium text-foreground">Loading your results...</span>
      </div>
    );
  }

  if (error || !insights) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-bold text-foreground">Results Unavailable</h2>
        <p className="text-muted-foreground max-w-sm">{error || "No insights data found."}</p>
        <button
          onClick={() => navigate("/app/quiz-select")}
          className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg font-medium hover:opacity-90 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Take a New Quiz
        </button>
      </div>
    );
  }

  const {
    summary = {},
    heatmap_data = [],
    concept_map = { nodes: [], links: [] },
    confidence_report = {},
    priority_list = [],
    spaced_repetition = [],
  } = insights;

  const totalScore = Math.max(0, Number(summary.total_score || 0));
  const maxScore = (summary.questions_answered || 1) * 3;
  const pct = Math.max(0, Math.min(100, ((totalScore / maxScore) * 100)));
  const breakdown = summary.breakdown || {};

  // Stabilize graph data reference — ForceGraph2D mutates this in place, so it MUST be stable
  const safeGraphData = useMemo(() => {
    const gNodes = Array.isArray(concept_map?.nodes) ? concept_map.nodes : [];
    const gLinks = Array.isArray(concept_map?.links) ? concept_map.links : [];
    const validIds = new Set(gNodes.map((n: any) => String(n.id)));
    const safeLinks = gLinks.filter(
      (l: any) => validIds.has(String(l.source)) && validIds.has(String(l.target))
    );
    return { nodes: gNodes.map((n: any) => ({ ...n })), links: safeLinks.map((l: any) => ({ ...l })) };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [insights]);

  const hasGraph = safeGraphData.nodes.length > 0;

  // Custom node renderer with visible labels
  const nodeCanvasObject = (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const label = node.label || node.id;
    const r = 6;
    const fontSize = Math.max(8, 11 / globalScale);

    // Node circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
    ctx.fillStyle = node.color || '#6366f1';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Label below
    ctx.font = `${fontSize}px Inter, sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    // Truncate long labels
    const maxLen = 18;
    const displayLabel = label.length > maxLen ? label.slice(0, maxLen - 1) + '…' : label;
    ctx.fillText(displayLabel, node.x, node.y + r + 2);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <button
            onClick={() => navigate("/app/quiz-select")}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Topics
          </button>
          <h1 className="text-3xl font-bold text-foreground">Quiz Results</h1>
          <p className="text-muted-foreground mt-1">Session-specific analysis of your performance</p>
        </div>
        <div className="bg-card border-2 border-brand rounded-xl p-5 text-center min-w-[160px]">
          <span className="block text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand to-purple-500">
            {totalScore.toFixed(1)} / {maxScore}
          </span>
          <span className="text-sm font-medium text-muted-foreground">Score ({pct.toFixed(0)}%)</span>
          <div className="w-full h-2 mt-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand to-purple-500 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Correct (Sure)", value: breakdown.correct_sure ?? 0, icon: <Target className="w-5 h-5 text-green-500" />, color: "text-green-500" },
          { label: "Lucky Guesses", value: breakdown.correct_guessing ?? 0, icon: <span className="text-xl">🎲</span>, color: "text-amber-500" },
          { label: "Critical Gaps", value: breakdown.wrong_sure ?? 0, icon: <AlertCircle className="w-5 h-5 text-red-500" />, color: "text-red-500", sub: "Wrong but confident" },
          { label: "Questions Answered", value: summary.questions_answered ?? 0, icon: <BookOpen className="w-5 h-5 text-brand" />, color: "text-brand" },
        ].map((stat, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-5 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-foreground text-sm">{stat.label}</h3>
              {stat.icon}
            </div>
            <span className={`text-3xl font-bold ${stat.color}`}>{stat.value}</span>
            {stat.sub && <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heatmap */}
        <div className="lg:col-span-1 bg-card border border-border rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-5">Subtopic Heatmap</h2>
          {heatmap_data.length === 0 ? (
            <p className="text-sm text-muted-foreground">No subtopic data for this session.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {heatmap_data.map((h: any, idx: number) => (
                <div key={idx} className="flex flex-col gap-1">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="truncate max-w-[70%]">{h.subtopic}</span>
                    <span>{Number(h.score).toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, h.score)}%`, backgroundColor: h.color }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground capitalize">
                    {h.weakness_flag} · {h.questions_attempted} question{h.questions_attempted !== 1 ? "s" : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Concept Map */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 h-[500px] flex flex-col overflow-hidden relative">
          <h2 className="text-xl font-semibold mb-3">Concept Prerequisite Map</h2>

          {/* Legend */}
          <div className="absolute top-12 right-4 bg-card/90 backdrop-blur p-2.5 rounded-lg text-xs border border-border space-y-1.5 z-10">
            {[
              ["#EF4444","Critical (wrong + confident)"],
              ["#F97316","Weak (wrong)"],
              ["#EAB308","Shaky (right but unsure)"],
              ["#22C55E","Strong (correct)"],
              ["#6366f1","Not yet tested"],
              ["#9CA3AF","Prerequisite only"]
            ].map(([c,l]) => (
              <p key={l} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: c }} />
                {l}
              </p>
            ))}
          </div>

          <div className="flex-1 rounded-lg border border-border overflow-hidden bg-background/50">
            {!hasGraph ? (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm gap-2">
                <Brain className="w-5 h-5 text-brand" />
                No concept map data for this session yet.
              </div>
            ) : (
              <ForceGraph2D
                graphData={safeGraphData}
                nodeCanvasObject={nodeCanvasObject}
                nodeCanvasObjectMode={() => 'replace'}
                nodeLabel={(node: any) => `${node.label} — ${node.performance}`}
                linkColor={(link: any) => {
                  const src = typeof link.source === 'object' ? link.source : safeGraphData.nodes.find((n:any) => n.id === link.source);
                  const tgt = typeof link.target === 'object' ? link.target : safeGraphData.nodes.find((n:any) => n.id === link.target);
                  if (src?.color === '#EF4444' || tgt?.color === '#EF4444') return '#EF444488';
                  if (src?.color === '#F97316' || tgt?.color === '#F97316') return '#F9731688';
                  return 'rgba(148,163,184,0.4)';
                }}
                linkDirectionalArrowLength={4}
                linkDirectionalArrowRelPos={1}
                linkWidth={1.5}
                d3AlphaDecay={0.02}
                d3VelocityDecay={0.3}
                width={640}
                height={360}
                backgroundColor="transparent"
                cooldownTicks={80}
              />
            )}
          </div>
        </div>
      </div>


      {/* Priority + Spaced Repetition */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            ⚠️ Priority Revision
          </h2>
          <div className="space-y-3">
            {priority_list.length === 0 ? (
              <p className="text-sm text-green-500 flex items-center gap-2">
                ✅ No critical gaps in this session!
              </p>
            ) : (
              priority_list.map((item: any, idx: number) => (
                <div key={idx} className="p-4 rounded-lg border border-red-500/20 bg-red-500/10">
                  <h4 className="font-semibold text-red-500 text-sm">{item.concept}</h4>
                  <p className="text-sm text-foreground/80 mt-1">{item.suggestion_text}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand" /> Confidence Report
          </h2>
          <div className="space-y-3">
            {[
              { label: "Sure Accuracy", value: confidence_report.sure_accuracy, color: "#22C55E" },
              { label: "Unsure Accuracy", value: confidence_report.unsure_accuracy, color: "#EAB308" },
              { label: "Guessing Accuracy", value: confidence_report.guessing_accuracy, color: "#F97316" },
            ].map((row, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm font-medium mb-1">
                  <span>{row.label}</span>
                  <span>{Number(row.value || 0).toFixed(0)}%</span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, row.value || 0)}%`, backgroundColor: row.color }}
                  />
                </div>
              </div>
            ))}
            <p className="text-xs text-muted-foreground mt-3 italic">
              {confidence_report.insight_text || "Keep calibrating your confidence!"}
            </p>
          </div>
        </div>
      </div>

      {spaced_repetition.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand" /> Revision Schedule
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {spaced_repetition.map((item: any, idx: number) => (
              <div key={idx} className="flex flex-col p-3 rounded-lg border border-border hover:border-brand/40 transition">
                <p className="font-semibold text-foreground text-sm">{item.subtopic}</p>
                <p className="text-xs text-brand mt-1 capitalize">{String(item.reason).replace(/_/g, ' ')}</p>
                <span className="text-xs text-muted-foreground mt-1">
                  Due {new Date(item.next_review_date).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
