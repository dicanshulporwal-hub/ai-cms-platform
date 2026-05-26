export interface ChatbotSettings {
  id: string;
  isEnabled: boolean;
  greetingMessage: string;
  fallbackMessage: string;
  leadCaptureEnabled: boolean;
  supportEmail?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChatbotLead {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  message?: string | null;
  sourcePage?: string | null;
  status: string;
  conversationId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChatbotConversationSummary {
  id: string;
  sourcePage?: string | null;
  startedAt: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  preview: string;
  lead?: ChatbotLead | null;
}

export interface ChatbotConversationMessage {
  id: string;
  senderType: 'ADMIN' | 'BOT' | 'VISITOR';
  message: string;
  metadata?: unknown;
  createdAt: string;
}

export interface ChatbotConversationDetail
  extends Omit<ChatbotConversationSummary, 'messageCount' | 'preview'> {
  messages: ChatbotConversationMessage[];
}

export interface ChatbotAnalytics {
  totalConversations: number;
  totalMessages: number;
  totalLeads: number;
  topSourcePages: Array<{
    sourcePage?: string | null;
    count: number;
  }>;
  recentConversations: Array<{
    id: string;
    sourcePage?: string | null;
    createdAt: string;
  }>;
}

export interface ChatbotListResponse<T> {
  data: T[];
}
