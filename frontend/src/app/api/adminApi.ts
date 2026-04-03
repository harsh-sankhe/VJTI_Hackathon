const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const userStr = localStorage.getItem('auth_user');
  let token = null;
  if(userStr) {
    try { token = JSON.parse(userStr).token; } catch(e){}
  }
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export interface AdminTask {
  task_title: string;
  external_link?: string;
  platform?: string;
}

export interface AdminChallenge {
  title: string;
  type: string;
  description: string;
  xp_reward: number;
  squad_xp_bonus: number;
  duration_days: number;
  badge_reward: string;
  tasks: AdminTask[];
}

export const adminApi = {
  getChallenges: async () => {
    const res = await fetch(`${API_URL}/admin/challenges`, {
      headers: getAuthHeaders(),
    });
    if(!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to fetch global challenges');
    }
    return res.json();
  },
  createChallenge: async (challenge: AdminChallenge) => {
    const res = await fetch(`${API_URL}/admin/challenges`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(challenge)
    });
    if(!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create challenge');
    }
    return res.json();
  }
};
