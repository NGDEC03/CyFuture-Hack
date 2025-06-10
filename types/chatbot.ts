export type MessageSender = 'user' | 'assistant' | 'system';

export type MessageType = 'symptoms' | 'report' | 'general' | null;

export interface ChatMessage {
  id: string; // Unique ID for React keys
  sender: MessageSender;
  content: string;
  messageType?: MessageType;
}

export interface Doctor {
  name: string;
  specialization: string;
  location: string;
  rating: number;
}

export interface DoctorRecommendationMessage extends ChatMessage {
  recommended_doctors: Doctor[];
  specialization_type: string;
}

export interface FileInfo {
  name: string;
  length: number;
}