import React, { useState, useEffect } from 'react';
import { Shield, Plus, ListPlus, Trash2, Rocket } from 'lucide-react';
import { adminApi, AdminChallenge, AdminTask } from '../api/adminApi';
import { toast } from 'sonner';

export function AdminDashboard() {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New Challenge Form State
  const [title, setTitle] = useState('');
  const [type, setType] = useState('coding');
  const [desc, setDesc] = useState('');
  const [xp, setXp] = useState(100);
  const [squadXp, setSquadXp] = useState(200);
  const [duration, setDuration] = useState(7);
  const [badge, setBadge] = useState('Global Challenger');
  const [tasks, setTasks] = useState<AdminTask[]>([{ task_title: '', external_link: '', platform: 'leetcode' }]);

  const [authRole, setAuthRole] = useState('user');

  useEffect(() => {
    const userStr = localStorage.getItem('auth_user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setAuthRole(u.role || 'user');
      } catch(e){}
    }
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      const data = await adminApi.getChallenges();
      setChallenges(data);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = () => {
    setTasks([...tasks, { task_title: '', external_link: '', platform: 'leetcode' }]);
  };

  const handleRemoveTask = (i: number) => {
    setTasks(tasks.filter((_, idx) => idx !== i));
  };

  const handleTaskChange = (i: number, field: keyof AdminTask, value: string) => {
    const updated = [...tasks];
    updated[i][field] = value;
    setTasks(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tasks.some(t => !t.task_title)) {
      return toast.error("All tasks must have a title");
    }
    
    const payload: AdminChallenge = {
      title,
      type,
      description: desc,
      xp_reward: xp,
      squad_xp_bonus: squadXp,
      duration_days: duration,
      badge_reward: badge,
      tasks
    };

    try {
      await adminApi.createChallenge(payload);
      toast.success("Global Challenge Created!");
      loadChallenges();
      // Reset form
      setTitle(''); setDesc(''); setTasks([{ task_title: '', external_link: '', platform: 'leetcode' }]);
    } catch(e: any) {
      toast.error(e.message);
    }
  };

  if (authRole !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] space-y-4">
        <Shield className="w-16 h-16 text-red-500 opacity-80" />
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground">You do not have administrative privileges to view this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-red-500/20 text-red-500 rounded-xl">
          <Shield className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-black">Admin Command Center</h1>
          <p className="text-muted-foreground">Manage global challenges and platform configurations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CREATE CHALLENGE FORM */}
        <div className="lg:col-span-2 bg-card rounded-2xl p-6 border shadow-sm">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
            <Plus className="text-primary"/> Create Global Challenge
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                 <label className="block text-sm font-medium mb-1">Challenge Title <span className="text-red-500">*</span></label>
                 <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-secondary border-none rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary" placeholder="e.g. DP Mastery" />
              </div>
              <div>
                 <label className="block text-sm font-medium mb-1">Type</label>
                 <select value={type} onChange={e => setType(e.target.value)} className="w-full bg-secondary border-none rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary">
                    <option value="coding">Coding / DSA</option>
                    <option value="system_design">System Design</option>
                    <option value="quiz">Quiz / Core subjects</option>
                 </select>
              </div>
            </div>

            <div>
               <label className="block text-sm font-medium mb-1">Description</label>
               <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2} className="w-full bg-secondary border-none rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary" placeholder="Describe the challenge goals..." />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <div>
                 <label className="block text-sm font-medium mb-1">XP Reward</label>
                 <input type="number" value={xp} onChange={e => setXp(Number(e.target.value))} required className="w-full bg-secondary border-none rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary" />
               </div>
               <div>
                 <label className="block text-sm font-medium mb-1">Squad XP Bonus</label>
                 <input type="number" value={squadXp} onChange={e => setSquadXp(Number(e.target.value))} required className="w-full bg-secondary border-none rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary" />
               </div>
               <div>
                 <label className="block text-sm font-medium mb-1">Duration (Days)</label>
                 <input type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} required className="w-full bg-secondary border-none rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary" />
               </div>
               <div>
                 <label className="block text-sm font-medium mb-1">Badge ID</label>
                 <input type="text" value={badge} onChange={e => setBadge(e.target.value)} className="w-full bg-secondary border-none rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary" />
               </div>
            </div>

            <hr className="border-border my-6" />

            <div>
               <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2"><ListPlus className="w-4 h-4"/> Tasks</h3>
                  <button type="button" onClick={handleAddTask} className="text-sm font-medium text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"><Plus className="w-4 h-4"/> Add Task</button>
               </div>
               
               <div className="space-y-3">
                 {tasks.map((t, idx) => (
                    <div key={idx} className="flex gap-3 items-start bg-secondary/50 p-4 rounded-xl border border-border">
                       <div className="flex-1 space-y-3">
                          <input type="text" value={t.task_title} onChange={e => handleTaskChange(idx, 'task_title', e.target.value)} placeholder="Task Title (e.g. Solve Two Sum)" required className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary" />
                          <div className="flex gap-3">
                             <input type="text" value={t.external_link} onChange={e => handleTaskChange(idx, 'external_link', e.target.value)} placeholder="External Link (Optional)" className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary" />
                             <select value={t.platform} onChange={e => handleTaskChange(idx, 'platform', e.target.value)} className="w-32 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary">
                                <option value="leetcode">LeetCode</option>
                                <option value="gfg">GFG</option>
                                <option value="youtube">YouTube</option>
                                <option value="internal">Internal</option>
                                <option value="custom">Custom</option>
                             </select>
                          </div>
                       </div>
                       <button type="button" onClick={() => handleRemoveTask(idx)} disabled={tasks.length === 1} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50">
                          <Trash2 className="w-5 h-5" />
                       </button>
                    </div>
                 ))}
               </div>
            </div>

            <button type="submit" className="w-full py-3.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
               <Rocket className="w-5 h-5"/> Launch Global Challenge
            </button>
          </form>
        </div>

        {/* ACTIVE GLOBAL CHALLENGES */}
        <div className="bg-card rounded-2xl p-6 border shadow-sm">
          <h2 className="text-xl font-bold mb-6">Global Challenge Pool</h2>
          {loading ? (
             <div className="animate-pulse space-y-4">
                <div className="h-20 bg-secondary rounded-xl"></div>
                <div className="h-20 bg-secondary rounded-xl"></div>
             </div>
          ) : (
             <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {challenges.map(c => (
                   <div key={c.id} className="p-4 bg-secondary/50 rounded-xl border border-secondary hover:border-primary/50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                         <span className="text-xs font-bold uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-full">{c.type}</span>
                         <span className={c.is_active ? 'text-green-500 text-xs font-bold' : 'text-red-500 text-xs font-bold'}>
                           {c.is_active ? 'ACTIVE' : 'INACTIVE'}
                         </span>
                      </div>
                      <h3 className="font-bold text-sm mb-1">{c.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">{c.description}</p>
                      <div className="mt-3 flex items-center gap-4 text-xs font-medium text-slate-500">
                         <span>🏆 {c.xp_reward} XP</span>
                         <span>👥 +{c.squad_xp_bonus} Squad XP</span>
                      </div>
                   </div>
                ))}
                {challenges.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No global challenges found.</p>}
             </div>
          )}
        </div>

      </div>
    </div>
  );
}
