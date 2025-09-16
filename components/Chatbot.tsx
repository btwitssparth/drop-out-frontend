import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Send, MessageCircle, X, Bot, User } from 'lucide-react-native';
import chatbotService, { ChatMessage } from '../services/chatbotService';

interface ChatbotProps {
  isVisible: boolean;
  onToggle: () => void;
}

export function Chatbot({ isVisible, onToggle }: ChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadChatHistory();
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      chatbotService.saveChatHistory(messages);
    }
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      const history = await chatbotService.getChatHistory();
      if (history.length === 0) {
        // Add welcome message if no history
        const welcomeMessage: ChatMessage = {
          id: chatbotService.generateMessageId(),
          message: "Hi! I'm your counselling assistant. I'm here to help you with any concerns about your studies, stress management, or just to chat. How are you feeling today?",
          isUser: false,
          timestamp: new Date(),
        };
        setMessages([welcomeMessage]);
      } else {
        setMessages(history.map(msg => ({ ...msg, timestamp: new Date(msg.timestamp) })));
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: chatbotService.generateMessageId(),
      message: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await chatbotService.sendMessage(userMessage.message);
      
      const botMessage: ChatMessage = {
        id: chatbotService.generateMessageId(),
        message: response.reply,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: chatbotService.generateMessageId(),
        message: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    Alert.alert(
      'Clear Chat History',
      'Are you sure you want to clear all chat messages?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await chatbotService.clearChatHistory();
            const welcomeMessage: ChatMessage = {
              id: chatbotService.generateMessageId(),
              message: "Hi! I'm your counselling assistant. How can I help you today?",
              isUser: false,
              timestamp: new Date(),
            };
            setMessages([welcomeMessage]);
          },
        },
      ]
    );
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isVisible) {
    return (
      <TouchableOpacity
        onPress={onToggle}
        className="absolute bottom-6 right-6 w-16 h-16 bg-blue-600 rounded-full items-center justify-center shadow-lg z-50"
        style={{ elevation: 8 }}
      >
        <MessageCircle size={28} color="white" />
      </TouchableOpacity>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="absolute bottom-6 right-6 left-6 h-96 bg-white rounded-lg shadow-lg z-50"
      style={{ elevation: 10 }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 bg-blue-600 rounded-t-lg">
        <View className="flex-row items-center gap-2">
          <Bot size={20} color="white" />
          <Text className="text-white font-semibold">Counselling Assistant</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <TouchableOpacity onPress={clearHistory}>
            <Text className="text-white text-sm">Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onToggle}>
            <X size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 p-4"
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            className={`mb-4 flex-row ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <View className={`max-w-[80%] ${message.isUser ? 'order-2' : 'order-1'}`}>
              <View
                className={`p-3 rounded-2xl ${
                  message.isUser
                    ? 'bg-blue-600 rounded-br-sm'
                    : 'bg-gray-100 rounded-bl-sm'
                }`}
              >
                <Text
                  className={`${
                    message.isUser ? 'text-white' : 'text-gray-800'
                  }`}
                >
                  {message.message}
                </Text>
              </View>
              <Text className="text-xs text-gray-500 mt-1 px-1">
                {formatTime(message.timestamp)}
              </Text>
            </View>
            <View
              className={`w-8 h-8 rounded-full items-center justify-center mt-1 ${
                message.isUser ? 'order-1 mr-2 bg-blue-100' : 'order-2 ml-2 bg-gray-200'
              }`}
            >
              {message.isUser ? (
                <User size={16} color="#2563EB" />
              ) : (
                <Bot size={16} color="#6B7280" />
              )}
            </View>
          </View>
        ))}
        
        {isLoading && (
          <View className="mb-4 flex-row justify-start">
            <View className="bg-gray-100 p-3 rounded-2xl rounded-bl-sm flex-row items-center gap-2">
              <ActivityIndicator size="small" color="#6B7280" />
              <Text className="text-gray-600 text-sm">Typing...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View className="flex-row items-center p-4 border-t border-gray-200">
        <TextInput
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your message..."
          multiline
          maxLength={500}
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 mr-3 max-h-20"
          style={{ textAlignVertical: 'top' }}
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity
          onPress={sendMessage}
          disabled={!inputText.trim() || isLoading}
          className={`w-10 h-10 rounded-full items-center justify-center ${
            inputText.trim() && !isLoading ? 'bg-blue-600' : 'bg-gray-300'
          }`}
        >
          <Send 
            size={18} 
            color={inputText.trim() && !isLoading ? 'white' : '#9CA3AF'} 
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}