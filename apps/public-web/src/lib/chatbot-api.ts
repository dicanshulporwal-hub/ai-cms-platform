import type {
  ChatbotMessageResponse,
  LeadInput,
  PublicChatbotSettings,
} from '@/types/chatbot';

async function parseJson(response: Response) {
  return response.json().catch(() => null);
}

async function request<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });
  const data = await parseJson(response);

  if (!response.ok) {
    throw new Error(data?.message ?? 'Request failed.');
  }

  return data as T;
}

export function getPublicChatbotSettings() {
  return request<PublicChatbotSettings>('/api/chatbot/settings');
}

export function sendChatbotMessage(input: {
  conversationId?: string;
  message: string;
  sourcePage?: string;
}) {
  return request<ChatbotMessageResponse>('/api/chatbot/message', {
    body: JSON.stringify(input),
    method: 'POST',
  });
}

export function submitChatbotLead(input: LeadInput) {
  return request('/api/chatbot/lead', {
    body: JSON.stringify(input),
    method: 'POST',
  });
}
