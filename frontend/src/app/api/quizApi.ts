import { getAuthToken } from '../code_grind/api';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

const authHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const quizApi = {
  startSession: async (topic_id: number) => {
    const res = await fetch(`${API_URL}/quiz/start`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ topic_id })
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to start quiz');
    return res.json();
  },

  answerQuestion: async (session_id: string, question_id: number, selected_option: string, confidence: string) => {
    const res = await fetch(`${API_URL}/quiz/answer`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ session_id, question_id, selected_option, confidence })
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to submit answer');
    return res.json();
  },

  getInsights: async (session_id: string) => {
    const res = await fetch(`${API_URL}/quiz/results/${session_id}`, { headers: authHeaders() });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to fetch insights');
    return res.json();
  },

  getHistory: async () => {
    const res = await fetch(`${API_URL}/quiz/history`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch history');
    return res.json();
  },

  getRevisionDue: async () => {
    const res = await fetch(`${API_URL}/quiz/revision-due`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch revision queue');
    return res.json();
  },

  scheduleRevision: async (topic_id: number, subtopic: string) => {
    const res = await fetch(`${API_URL}/quiz/revision-schedule`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ topic_id, subtopic })
    });
    if (!res.ok) throw new Error('Failed to schedule revision');
    return res.json();
  },

  getTopicPerformance: async (topic_id: number) => {
    const res = await fetch(`${API_URL}/quiz/topic-performance/${topic_id}`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch topic performance');
    return res.json();
  }
};
