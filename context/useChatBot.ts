// src/useChatbot.ts
import { useState, useCallback, useRef } from 'react';
import { ChatMessage, MessageType, Doctor, FileInfo, MessageSender } from "@/types/chatbot"
import { v4 as uuidv4 } from 'uuid';

export function useChatbot() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);

    const chatContainerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom of chat
    const scrollToBottom = useCallback(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, []);

    // Effect to scroll on message update
    // This will be called in the component using this hook

    const addMessage = useCallback((sender: MessageSender, content: string, messageType: MessageType = null) => {
        setMessages((prevMessages) => {
            const newMessage: ChatMessage = { id: uuidv4(), sender, content, messageType };
            return [...prevMessages, newMessage];
        });
        // Scroll happens after state update, in a useEffect in the component
    }, []);

    const addDoctorRecommendations = useCallback((doctors: Doctor[], specialization: string) => {
        setMessages((prevMessages) => {
            const doctorMessage: ChatMessage = {
                id: uuidv4(),
                sender: 'system',
                content: JSON.stringify({ doctors, specialization }), // Store as JSON string, parse in render
                messageType: 'symptoms', // Or a new type like 'recommendation' if preferred
            };
            return [...prevMessages, doctorMessage];
        });
    }, []);

    const showError = useCallback((message: string) => {
        addMessage('system', `<div class="text-red-500 font-semibold">Error: ${message}</div>`);
    }, [addMessage]);

    const clearChat = useCallback(() => {
        setMessages([]);
        setCurrentSessionId(null);
        setFileInfo(null);
        // Add the initial welcome message back
        addMessage('assistant', `Hello there! I'm your Smart Medical Assistant. I can help you with your symptoms, general medical questions, and analyze lab reports. How can I assist you today?`);
    }, [addMessage]);

    const clearFile = useCallback(() => {
        setCurrentSessionId(null);
        setFileInfo(null);
        addMessage('system', 'PDF report removed.');
    }, [addMessage]);

    const showFileInfo = useCallback((name: string, length: number) => {
        setFileInfo({ name, length });
    }, []);

    const setLoading = useCallback((loading: boolean) => {
        setIsProcessing(loading);
    }, []);

    const detectMessageType = useCallback((query: string): MessageType => {
        const lowerQuery = query.toLowerCase();

        const symptomKeywords = [
            'pain', 'ache', 'hurt', 'sore', 'burning', 'itching', 'swelling',
            'fever', 'headache', 'nausea', 'vomiting', 'diarrhea', 'constipation',
            'dizzy', 'tired', 'fatigue', 'weakness', 'shortness of breath',
            'cough', 'sneeze', 'runny nose', 'congestion', 'rash', 'bleeding',
            'cramps', 'spasms', 'stiffness', 'numbness', 'tingling',
            'feel', 'feeling', 'experiencing', 'having', 'suffering',
            'days', 'weeks', 'hours', 'since', 'ago', 'started',
            'doctor', 'specialist', 'recommend', 'see', 'visit'
        ];

        const reportKeywords = [
            'report', 'results', 'test', 'lab', 'blood', 'urine', 'levels',
            'cholesterol', 'glucose', 'hemoglobin', 'creatinine', 'bilirubin',
            'analysis', 'interpret', 'explain', 'mean', 'normal', 'abnormal',
            'high', 'low', 'elevated', 'decreased', 'values'
        ];

        const symptomCount = symptomKeywords.filter(keyword => lowerQuery.includes(keyword)).length;
        const reportCount = reportKeywords.filter(keyword => lowerQuery.includes(keyword)).length;

        if (currentSessionId && reportCount > 0) {
            return 'report';
        }

        if (symptomCount >= 2 ||
            /feel(ing)?\s+(sick|unwell|bad|terrible|awful)/i.test(query) ||
            /have\s+(been|a|an)\s+\w+ing/i.test(query) ||
            /\d+\s+(day|week|hour|month)s?\s+(ago|of|with)/i.test(query)) {
            return 'symptoms';
        }

        return 'general';
    }, [currentSessionId]);

    const handleFileUpload = useCallback(async (file: File) => {
        if (file.size > 16 * 1024 * 1024) {
            showError('File size must be less than 16MB.');
            return;
        }

        const formData = new FormData();
        formData.append('pdf', file);

        try {
            setLoading(true);
            addMessage('system', `📤 Uploading "<strong>${file.name}</strong>"...`);

            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                setCurrentSessionId(result.session_id);
                showFileInfo(result.filename, result.text_length);
                addMessage('system', `✅ PDF "<strong>${result.filename}</strong>" uploaded successfully! You can now ask questions about your lab report.`);
            } else {
                showError(result.error || 'Upload failed');
            }
        } catch (error: any) {
            showError('Upload failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    }, [addMessage, showError, setLoading, showFileInfo]);

    const sendMessage = useCallback(async (query: string) => {
        if (!query || isProcessing) return;

        const messageType = detectMessageType(query);

        addMessage('user', query, messageType);

        try {
            setLoading(true);

            let apiUrl;
            let requestBody: any = {};

            if (messageType === 'symptoms') {
                apiUrl = '/symptoms';
                requestBody = { symptoms: query };
            } else if (messageType === 'report' && currentSessionId) {
                apiUrl = '/ask';
                requestBody = { query: query, session_id: currentSessionId };
            } else {
                apiUrl = '/ask_general';
                requestBody = { query: query };
            }

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            const result = await response.json();

            if (response.ok) {
                addMessage('assistant', result.response, messageType);

                if (messageType === 'symptoms' && result.recommended_doctors && Array.isArray(result.recommended_doctors) && result.recommended_doctors.length > 0) {
                    addDoctorRecommendations(result.recommended_doctors, result.specialization || 'General');
                }
            } else {
                showError(result.error || 'Failed to get response');
            }
        } catch (error: any) {
            showError('Failed to send message: ' + error.message);
        } finally {
            setLoading(false);
        }
    }, [addMessage, addDoctorRecommendations, currentSessionId, detectMessageType, isProcessing, setLoading, showError]);

    // Initial welcome message
    useState(() => {
        addMessage('assistant', `Hello there! I'm your Smart Medical Assistant. I can help you with your symptoms, general medical questions, and analyze lab reports. How can I assist you today?`);
    }, []); // Empty dependency array means this runs once on mount


    return {
        messages,
        currentSessionId,
        isProcessing,
        fileInfo,
        chatContainerRef,
        addMessage,
        addDoctorRecommendations,
        showError,
        clearChat,
        clearFile,
        showFileInfo,
        setLoading,
        handleFileUpload,
        sendMessage,
        scrollToBottom,
    };
}