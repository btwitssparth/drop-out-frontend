// services/chatbotService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

// Backend chatbot API base URL
const CHATBOT_API_BASE_URL = 'http://localhost:5003';

export interface ChatMessage {
  id: string;
  message: string;
  isUser: boolean;
  timestamp: Date;
}

export interface ChatResponse {
  reply: string;
}

class ChatbotService {
  private async makeRequest(endpoint: string, options: RequestInit) {
    try {
      const response = await fetch(`${CHATBOT_API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  async sendMessage(message: string): Promise<ChatResponse> {
    const response = await this.makeRequest('/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });

    return response;
  }

  // Store chat history locally
  async saveChatHistory(messages: ChatMessage[]): Promise<void> {
    try {
      await AsyncStorage.setItem('chatHistory', JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  }

  // Get stored chat history
  async getChatHistory(): Promise<ChatMessage[]> {
    try {
      const history = await AsyncStorage.getItem('chatHistory');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error getting chat history:', error);
      return [];
    }
  }

  // Clear chat history
  async clearChatHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem('chatHistory');
    } catch (error) {
      console.error('Error clearing chat history:', error);
    }
  }

  // Generate unique ID for messages
  generateMessageId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}

export default new ChatbotService();