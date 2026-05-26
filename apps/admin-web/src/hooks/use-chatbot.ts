import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getChatbotAnalytics,
  getChatbotConversation,
  getChatbotSettings,
  listChatbotConversations,
  listChatbotLeads,
  updateChatbotSettings,
} from '@/lib/chatbot-api';

export function useChatbotAnalytics() {
  return useQuery({
    queryFn: getChatbotAnalytics,
    queryKey: ['chatbot', 'analytics'],
  });
}

export function useChatbotConversations(search?: string) {
  return useQuery({
    queryFn: () => listChatbotConversations({ search }),
    queryKey: ['chatbot', 'conversations', search ?? ''],
  });
}

export function useChatbotConversation(id: string) {
  return useQuery({
    enabled: Boolean(id),
    queryFn: () => getChatbotConversation(id),
    queryKey: ['chatbot', 'conversations', id],
  });
}

export function useChatbotLeads(search?: string) {
  return useQuery({
    queryFn: () => listChatbotLeads({ search }),
    queryKey: ['chatbot', 'leads', search ?? ''],
  });
}

export function useChatbotSettings() {
  return useQuery({
    queryFn: getChatbotSettings,
    queryKey: ['chatbot', 'settings'],
  });
}

export function useUpdateChatbotSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateChatbotSettings,
    onSuccess: (settings) => {
      queryClient.setQueryData(['chatbot', 'settings'], settings);
      queryClient.invalidateQueries({ queryKey: ['chatbot', 'analytics'] });
    },
  });
}
