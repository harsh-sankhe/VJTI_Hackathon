import { UserStats } from "./api";
import { Zap, Flame, Award, Target, Map } from "lucide-react";

interface ProgressProps {
  stats: UserStats | null;
}

export function ProgressDashboard({ stats }: ProgressProps) {
  if (!stats) return null;

  const ALL_BADGES = [
    { id: 'FIRST_BLOOD', icon: '🥇', name: 'First Blood', desc: 'Solve your first problem' },
    { id: 'ON_A_ROLL', icon: '🔥', name: 'On a Roll', desc: '7-day solving streak' },
    { id: 'CENTURY', icon: '💯', name: 'Century', desc: '100 problems solved' },
    { id: 'SPEED_DEMON', icon: '⚡', name: 'Speed Demon', desc: 'Solve 5 problems in one day' },
    { id: 'HARD_CRUSHER', icon: '🏔️', name: 'Hard Crusher', desc: 'Solve 25 Hard problems' },
    { id: 'HINT_HELPER', icon: '👥', name: 'Hint Helper', desc: 'Give 10 hints in squad chat' },
  ];

  // GitHub style heatmap mockup (since real daily data requires a complex timeseries query)
  // Generating a random visual rep for the hackathon
  const cells = Array.from({ length: 90 }, (_, i) => {
    // Make last few cells more active
    const isActive = i > 70 ? Math.random() > 0.3 : Math.random() > 0.8;
    const intensity = isActive ? Math.floor(Math.random() * 4) + 1 : 0;
    return intensity;
  });

  const getIntensityClass = (level: number) => {
    switch (level) {
      case 1: return "bg-primary/20";
      case 2: return "bg-primary/40";
      case 3: return "bg-primary/70";
      case 4: return "bg-primary";
      default: return "bg-secondary";
    }
  };

  const ringStyles = {
    easy: { strokeDasharray: `${(stats.breakdown.Easy / 100) * 100 * 2.8} 280`, stroke: "#22c55e" },
    med: { strokeDasharray: `${(stats.breakdown.Medium / 100) * 100 * 2.8} 280`, stroke: "#f59e0b" },
    hard: { strokeDasharray: `${(stats.breakdown.Hard / 100) * 100 * 2.8} 280`, stroke: "#ef4444" }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Solved Overview Card */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div className="w-1/2">
               <h3 className="text-xl font-bold mb-1">Total Solved</h3>
               <p className="text-muted-foreground mb-6">Problems completed</p>
               
               <div className="space-y-4">
                 <div className="flex items-center justify-between text-sm">
                   <span className="text-success font-medium">Easy</span>
                   <span>{stats.breakdown.Easy}</span>
                 </div>
                 <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                   <div className="h-full bg-success rounded-full" style={{ width: `${Math.min((stats.breakdown.Easy / 50)*100, 100)}%` }}></div>
                 </div>
                 
                 <div className="flex items-center justify-between text-sm">
                   <span className="text-warning font-medium">Medium</span>
                   <span>{stats.breakdown.Medium}</span>
                 </div>
                 <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                   <div className="h-full bg-warning rounded-full" style={{ width: `${Math.min((stats.breakdown.Medium / 150)*100, 100)}%` }}></div>
                 </div>

                 <div className="flex items-center justify-between text-sm">
                   <span className="text-destructive font-medium">Hard</span>
                   <span>{stats.breakdown.Hard}</span>
                 </div>
                 <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                   <div className="h-full bg-destructive rounded-full" style={{ width: `${Math.min((stats.breakdown.Hard / 50)*100, 100)}%` }}></div>
                 </div>
               </div>
            </div>

            <div className="w-1/2 flex justify-center items-center relative">
               {/* LeetCode style ring */}
               <svg className="w-40 h-40 transform -rotate-90">
                 <circle cx="80" cy="80" r="72" stroke="currentColor" strokeWidth="8" fill="none" className="text-secondary" />
                 {/* Easy Ring */}
                 <circle cx="80" cy="80" r="72" strokeWidth="8" fill="none" strokeDasharray={ringStyles.easy.strokeDasharray} stroke={ringStyles.easy.stroke} className="transition-all duration-1000" strokeLinecap="round" />
                 {/* Medium Ring */}
                 <circle cx="80" cy="80" r="60" stroke="currentColor" strokeWidth="8" fill="none" className="text-secondary" />
                 <circle cx="80" cy="80" r="60" strokeWidth="8" fill="none" strokeDasharray={ringStyles.med.strokeDasharray} stroke={ringStyles.med.stroke} className="transition-all duration-1000" strokeLinecap="round" />
                 {/* Hard Ring */}
                 <circle cx="80" cy="80" r="48" stroke="currentColor" strokeWidth="8" fill="none" className="text-secondary" />
                 <circle cx="80" cy="80" r="48" strokeWidth="8" fill="none" strokeDasharray={ringStyles.hard.strokeDasharray} stroke={ringStyles.hard.stroke} className="transition-all duration-1000" strokeLinecap="round" />
               </svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className="text-3xl font-bold">{stats.total_solved}</span>
                 <span className="text-xs text-muted-foreground mt-1 text-center leading-tight">Solved</span>
               </div>
            </div>
        </div>

        {/* XP Card */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:border-primary/50 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Total XP</h3>
            <div className="p-2 bg-accent/10 rounded-lg"><Zap className="w-5 h-5 text-accent" /></div>
          </div>
          <div>
            <div className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent mb-2">
              {stats.xp}
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
               <Target className="w-4 h-4" /> Top 15% of your squad
            </p>
          </div>
        </div>

        {/* Streak Card */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:border-[#f59e0b]/50 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Current Streak</h3>
            <div className="p-2 bg-warning/10 rounded-lg"><Flame className="w-5 h-5 text-warning" /></div>
          </div>
          <div>
            <div className="text-5xl font-bold text-foreground mb-2 flex items-center gap-2">
              {stats.streak} <span className="text-warning text-4xl">🔥</span>
            </div>
            <p className="text-sm text-muted-foreground">Keep it up! 7 days = +50 XP</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Heatmap */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
           <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold flex items-center gap-2"><Map className="w-4 h-4 text-muted-foreground"/> Activity Heatmap</h3>
              <span className="text-xs text-muted-foreground">Last 90 days</span>
           </div>
           
           <div className="flex flex-wrap gap-1.5 justify-end">
              {cells.map((intensity, i) => (
                 <div 
                   key={i} 
                   className={`w-[14px] h-[14px] rounded-sm ${getIntensityClass(intensity)}`}
                   title={intensity > 0 ? `${intensity} problems solved` : "No activity"}
                 />
              ))}
           </div>
           <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
             <span>Less</span>
             <div className="flex gap-1">
                <div className="w-3 h-3 rounded-sm bg-secondary"></div>
                <div className="w-3 h-3 rounded-sm bg-primary/20"></div>
                <div className="w-3 h-3 rounded-sm bg-primary/40"></div>
                <div className="w-3 h-3 rounded-sm bg-primary/70"></div>
                <div className="w-3 h-3 rounded-sm bg-primary"></div>
             </div>
             <span>More</span>
           </div>
        </div>

        {/* Badges */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
           <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold flex items-center gap-2"><Award className="w-4 h-4 text-muted-foreground"/> Earned Badges</h3>
              <span className="text-xs text-primary font-medium">{stats.badges.length} Unlocked</span>
           </div>
           
           <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {ALL_BADGES.map(badge => {
                const isUnlocked = stats.badges.includes(badge.id);
                return (
                  <div key={badge.id} className={`flex flex-col items-center gap-2 ${isUnlocked ? 'group cursor-pointer' : 'opacity-40'}`}>
                    {isUnlocked ? (
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#f59e0b]/20 to-[#ea580c]/20 border border-[#f59e0b]/30 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-sm">
                        {badge.icon}
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-secondary border border-border flex items-center justify-center text-3xl grayscale">
                        {badge.icon}
                      </div>
                    )}
                    <div className="text-center">
                      <span className={`text-xs block leading-tight ${isUnlocked ? 'font-semibold' : 'font-medium text-muted-foreground'}`}>
                        {badge.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground block leading-tight mt-0.5">
                        {badge.desc}
                      </span>
                    </div>
                  </div>
                );
              })}
           </div>
        </div>
      </div>
    </div>
  );
}
