export interface PublicChatbotSettings {
  isEnabled: boolean;
  greetingMessage: string;
  fallbackMessage: string;
  leadCaptureEnabled: boolean;
}

export interface ChatbotSource {
  id: string;
  type: 'BLOG' | 'PAGE';
  title: string;
  slug: string;
}

export interface ChatbotMessageResponse {
  conversationId: string;
  answer: string;
  sources: ChatbotSource[];
  leadCaptureSuggested: boolean;
}

export interface LeadInput {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  sourcePage?: string;
  conversationId?: string;
}
