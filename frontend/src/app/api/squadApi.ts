import { getAuthToken } from '../code_grind/api';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

const authHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const squadApi = {
  createSquad: async (name: string, goal_problems: number = 25) => {
    const res = await fetch(`${API_URL}/squad/create`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ name, goal_problems })
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to create squad');
    return res.json();
  },

  joinSquad: async (invite_code: string) => {
    const res = await fetch(`${API_URL}/squad/join`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ invite_code })
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to join squad');
    return res.json();
  },

  leaveSquad: async () => {
    const res = await fetch(`${API_URL}/squad/leave`, {
      method: 'POST',
      headers: authHeaders()
    });
    if (!res.ok) throw new Error('Failed to leave squad');
    return res.json();
  },

  getDashboard: async () => {
    const res = await fetch(`${API_URL}/squad/dashboard`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch dashboard');
    return res.json();
  },

  getChallenges: async () => {
    const res = await fetch(`${API_URL}/squad/challenges`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch challenges');
    return res.json();
  },

  completeTask: async (challengeId: string, taskId: string, approachText: string) => {
    const res = await fetch(`${API_URL}/squad/challenge/${challengeId}/task/${taskId}/complete`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ approach_text: approachText })
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to complete task');
    return res.json();
  },

  getChatHistory: async () => {
    const res = await fetch(`${API_URL}/squad/chat`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch chat history');
    return res.json();
  },

  editGoal: async (goal_problems?: number, goal_days?: number) => {
    const res = await fetch(`${API_URL}/squad/goal`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ goal_problems, goal_days })
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to edit goal');
    return res.json();
  },

  kickMember: async (target_user_id: number) => {
    const res = await fetch(`${API_URL}/squad/kick`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ target_user_id })
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to kick member');
    return res.json();
  },

  disbandSquad: async () => {
    const res = await fetch(`${API_URL}/squad/disband`, {
      method: 'POST',
      headers: authHeaders()
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to disband squad');
    return res.json();
  }
};
