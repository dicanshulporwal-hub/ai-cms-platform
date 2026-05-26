import { apiClient } from '@/lib/api-client';
import type {
  ChatbotAnalytics,
  ChatbotConversationDetail,
  ChatbotConversationSummary,
  ChatbotLead,
  ChatbotListResponse,
  ChatbotSettings,
} from '@/types/chatbot';

function toQueryString(query?: { search?: string }) {
  const params = new URLSearchParams();

  if (query?.search?.trim()) {
    params.set('search', query.search.trim());
  }

  const value = params.toString();

  return value ? `?${value}` : '';
}

export function getChatbotAnalytics() {
  return apiClient<ChatbotAnalytics>('/api/chatbot/analytics');
}

export function listChatbotConversations(query?: { search?: string }) {
  return apiClient<ChatbotListResponse<ChatbotConversationSummary>>(
    `/api/chatbot/conversations${toQueryString(query)}`,
  );
}

export function getChatbotConversation(id: string) {
  return apiClient<ChatbotConversationDetail>(`/api/chatbot/conversations/${id}`);
}

export function listChatbotLeads(query?: { search?: string }) {
  return apiClient<ChatbotListResponse<ChatbotLead>>(
    `/api/chatbot/leads${toQueryString(query)}`,
  );
}

export function getChatbotSettings() {
  return apiClient<ChatbotSettings>('/api/chatbot/settings');
}

export function updateChatbotSettings(input: Partial<ChatbotSettings>) {
  return apiClient<ChatbotSettings>('/api/chatbot/settings', {
    body: JSON.stringify({
      fallbackMessage: input.fallbackMessage,
      greetingMessage: input.greetingMessage,
      isEnabled: input.isEnabled,
      leadCaptureEnabled: input.leadCaptureEnabled,
      supportEmail: input.supportEmail || undefined,
    }),
    method: 'PUT',
  });
}
