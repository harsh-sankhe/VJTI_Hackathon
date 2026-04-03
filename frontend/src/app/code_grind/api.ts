// In Vite, environment variables from .env starting with VITE_ are available on import.meta.env
// The fallback is used if the VITE_API_URL is not set in the environment.
export const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

export interface TopicProgress {
  topic: string;
  total_problems: string; // postgres COUNT returns string
  solved_problems: string;
}

export interface Problem {
  problem_id: string;
  title: string;
  topic: string;
  subtopic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  leetcode_link: string;
  gfg_link: string;
  xp_value: number;
  striver_sheet_order: number;
  status: 'Unsolved' | 'Partially Done' | 'Completed';
}

export interface UserStats {
  xp: number;
  streak: number;
  breakdown: { Easy: number; Medium: number; Hard: number };
  total_solved: number;
  badges: string[];
}

// --- Auth helpers ---
export const getAuthToken = (): string | null => {
  const stored = localStorage.getItem('auth_user');
  if (!stored) return null;
  try {
    return JSON.parse(stored).token || null;
  } catch {
    return null;
  }
};

const authHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// --- Auth API ---
export const authApi = {
  register: async (name: string, email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Registration failed');
    }
    return res.json();
  },

  login: async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    return res.json();
  },
};

// --- Code Grind API ---
export const codeGrindApi = {
  getTopics: async (): Promise<TopicProgress[]> => {
    const res = await fetch(`${API_URL}/code_grind/topics`, { headers: authHeaders() });
    return res.json();
  },
  
  getProblems: async (topics?: string[]): Promise<Problem[]> => {
    let url = `${API_URL}/code_grind/problems`;
    if (topics && topics.length > 0) {
      url += `?topics=${topics.join(',')}`;
    }
    const res = await fetch(url, { headers: authHeaders() });
    return res.json();
  },

  askForHint: async (problemId: string) => {
    const res = await fetch(`${API_URL}/code_grind/problems/${problemId}/hint`, {
      method: 'POST',
      headers: authHeaders(),
    });
    return res.json();
  },

  submitApproach: async (problemId: string, approachText: string) => {
    const res = await fetch(`${API_URL}/code_grind/problems/${problemId}/complete`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ approach_text: approachText }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Submission failed (Server error)' }));
      throw new Error(err.error || 'Failed to submit approach');
    }
    return res.json();
  },

  getStats: async (): Promise<UserStats> => {
    const res = await fetch(`${API_URL}/code_grind/stats`, { headers: authHeaders() });
    return res.json();
  },

  getDiscussions: async (problemId: string) => {
    const res = await fetch(`${API_URL}/code_grind/problems/${problemId}/discussions`, { headers: authHeaders() });
    return res.json();
  },

  postDiscussion: async (problemId: string, message: string) => {
    const res = await fetch(`${API_URL}/code_grind/problems/${problemId}/discussions`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ message }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Post failed' }));
      throw new Error(err.error || 'Failed to post message');
    }
    return res.json();
  }
};
