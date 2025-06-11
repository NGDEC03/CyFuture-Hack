'use client';
import React, { useState, useRef, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation'

// import Image from 'next/image';

interface ChatbotProps {
    onClose: () => void;
}

interface ChatMessage {
    id: string;
    sender: 'user' | 'assistant' | 'system';
    content: string;
    messageType?: 'symptoms' | 'report' | 'general';
    timestamp: Date;
}

interface FileInfo {
    name: string;
    length: number;
}

interface Doctor {
    "Doctor ID": string;
    "Doctor Name": string;
    "Rating": number;
}

// interface SymptomsResponse {
//     response: string;
//     recommended_doctors?: Doctor[];
//     specialization?: string;
// }

const parseMarkdown = (text: string): string => {
    if (!text) return '';

    // Escape HTML special chars to prevent injection
    text = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    // Simple markdown parsing
    text = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/^(.*)$/gm, '<p>$1</p>')
        .replace(/• /g, '<li>')
        .replace(/<p><li>/g, '<ul><li>')
        .replace(/<\/li><\/p>/g, '</li></ul>');

    return text;
};

const Chatbot: React.FC<ChatbotProps> = ({ onClose }) => {
    const router = useRouter();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [recommendedDoctors, setRecommendedDoctors] = useState<Doctor[]>([]);

    const chatContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const CHAT_URL = process.env.NEXT_PUBLIC_CHAT_URL || 'http://localhost:8000';

    // Initialize with welcome message
    useEffect(() => {
        const welcomeMessage: ChatMessage = {
            id: 'welcome',
            sender: 'assistant',
            content: `Hello! I'm your intelligent medical assistant. I can automatically detect and help with:
• **Symptoms** - Describe how you feel and get doctor recommendations
• **Lab Reports** - Upload PDFs for instant analysis
• **General Questions** - Ask about health conditions, medications, etc.

**Smart Detection:** Just type your message naturally - I'll automatically understand what type of help you need!

**Important:** I provide educational information only. Always consult your healthcare provider for medical advice.`,
            timestamp: new Date()
        };
        setMessages([welcomeMessage]);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    };

    const showError = (message: string) => {
        const errorMessage: ChatMessage = {
            id: Date.now().toString(),
            sender: 'system',
            content: `❌ Error: ${message}`,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
    };

    const addMessage = (sender: 'user' | 'assistant' | 'system', content: string, messageType?: 'symptoms' | 'report' | 'general') => {
        const message: ChatMessage = {
            id: Date.now().toString(),
            sender,
            content,
            messageType,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, message]);
    };

    const detectMessageType = (query: string): 'symptoms' | 'report' | 'general' => {
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
    };

    const handleFileUpload = async (file: File) => {
        if (file.size > 16 * 1024 * 1024) {
            showError('File size must be less than 16MB.');
            return;
        }

        const formData = new FormData();
        formData.append('pdf', file);

        try {
            setIsProcessing(true);
            addMessage('system', `📤 Uploading "<strong>${file.name}</strong>"...`);

            const response = await fetch(`${CHAT_URL}/upload`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                setCurrentSessionId(result.session_id);
                setFileInfo({
                    name: result.filename,
                    length: result.text_length
                });
                addMessage('system', `✅ PDF "<strong>${result.filename}</strong>" uploaded successfully! You can now ask questions about your lab report.`);
            } else {
                showError(result.error || 'Upload failed');
            }
        } catch (error) {
            showError('Upload failed: ' + (error as Error).message);
        } finally {
            setIsProcessing(false);
        }
    };

    const addDoctorRecommendations = (doctors: Doctor[], specialization: string) => {
        if (doctors.length === 0) {
            addMessage('system', `No doctors found for ${specialization} specialization.`);
            return;
        }

        let doctorContent = `**Recommended Doctors (${specialization.charAt(0).toUpperCase() + specialization.slice(1)})**\n\n`;
        setRecommendedDoctors(doctors);
        doctors.forEach((doctor) => {
            const stars = '⭐'.repeat(Math.floor(doctor.Rating));
            doctorContent += `**${doctor["Doctor Name"]}**\n`;
            doctorContent += `Rating: ${stars} ${doctor.Rating.toFixed(1)}/5\n`;
            doctorContent += `Specialization: ${specialization}\n\n`;
            doctorContent += `Id: ${doctor['Doctor ID']}\n\n`;
        });

        addMessage('system', doctorContent);
    };

    const sendMessage = async (query: string) => {
        if (!query.trim() || isProcessing) return;

        const messageType = detectMessageType(query);
        addMessage('user', query, messageType);

        try {
            setIsProcessing(true);

            let endpoint;
            let requestBody;

            if (messageType === 'symptoms') {
                endpoint = '/symptoms';
                requestBody = { symptoms: query };
            } else if (messageType === 'report' && currentSessionId) {
                endpoint = '/ask';
                requestBody = { query, session_id: currentSessionId };
            } else {
                endpoint = '/ask_general';
                requestBody = { query };
            }

            const response = await fetch(`${CHAT_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            const result = await response.json();
            console.log(result)

            if (response.ok) {
                addMessage('assistant', result.response, messageType);

                // Handle doctor recommendations for symptoms
                if (messageType === 'symptoms' && result.recommended_doctors && Array.isArray(result.recommended_doctors) && result.recommended_doctors.length > 0) {
                    addDoctorRecommendations(result.recommended_doctors, result.specialization || 'General');
                }
            } else {
                showError(result.error || 'Failed to get response');
            }
        } catch (error) {
            showError('Failed to send message: ' + (error as Error).message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (inputRef.current) {
            sendMessage(inputRef.current.value);
            inputRef.current.value = '';
        }
    };

    const handleQuickFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileUpload(file);
            e.target.value = '';
        }
    };

    const askSampleQuestion = (question: string) => {
        if (inputRef.current) {
            inputRef.current.value = question;
            sendMessage(question);
        }
    };

    const clearFile = () => {
        setCurrentSessionId(null);
        setFileInfo(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const clearChat = () => {
        const welcomeMessage: ChatMessage = {
            id: 'welcome',
            sender: 'assistant',
            content: `Hello! I'm your intelligent medical assistant. I can automatically detect and help with:
• **Symptoms** - Describe how you feel and get doctor recommendations
• **Lab Reports** - Upload PDFs for instant analysis
• **General Questions** - Ask about health conditions, medications, etc.

**Smart Detection:** Just type your message naturally - I'll automatically understand what type of help you need!

**Important:** I provide educational information only. Always consult your healthcare provider for medical advice.`,
            timestamp: new Date()
        };
        setMessages([welcomeMessage]);
        clearFile();
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    // Drag and Drop Handlers
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type === 'application/pdf') {
            handleFileUpload(file);
        } else {
            showError('Only PDF files are supported.');
        }
    };

    // Global drag and drop handlers
    useEffect(() => {
        const handleGlobalDragOver = (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragOver(true);
        };

        const handleGlobalDragLeave = (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragOver(false);
        };

        const handleGlobalDrop = (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragOver(false);
            const file = e.dataTransfer?.files?.[0];
            if (file && file.type === 'application/pdf') {
                handleFileUpload(file);
            }
        };

        document.addEventListener('dragover', handleGlobalDragOver);
        document.addEventListener('dragleave', handleGlobalDragLeave);
        document.addEventListener('drop', handleGlobalDrop);

        return () => {
            document.removeEventListener('dragover', handleGlobalDragOver);
            document.removeEventListener('dragleave', handleGlobalDragLeave);
            document.removeEventListener('drop', handleGlobalDrop);
        };
    }, []);

    const getMessageTypeIcon = (messageType?: string) => {
        switch (messageType) {
            case 'symptoms': return '🩺 Symptoms Analysis';
            case 'report': return '📊 Report Question';
            case 'general': return '❓ General Question';
            default: return '';
        }
    };

    return (
        <div
            className="fixed bottom-4 right-20 z-40 bg-white/95 backdrop-blur-lg border border-purple-300 rounded-3xl shadow-2xl flex flex-col h-[calc(100vh-96px)] max-h-[800px] w-[calc(100vw-32px)] max-w-2xl overflow-hidden"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {/* Header */}
            <header className="bg-white/20 backdrop-blur-md border-b border-white/30 p-5 shadow-lg sticky top-0 z-30">
                <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4 flex-shrink-0">
                        <div aria-hidden="true" className="text-4xl select-none">
                            🏥
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold text-purple-900 tracking-tight select-text">
                                Smart Medical Assistant
                            </h1>
                            <p className="text-purple-700/90 text-sm mt-1 flex items-center gap-2 select-none">
                                <span className="animate-pulse text-green-500">●</span>
                                Auto-detects symptoms, reports, and general questions
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="quick-upload">
                            <input
                                accept=".pdf"
                                aria-label="Upload PDF lab report"
                                id="quickPdfFile"
                                type="file"
                                onChange={handleQuickFileSelect}
                                ref={fileInputRef}
                                className="hidden"
                            />
                            <label
                                className="bg-purple-200 hover:bg-purple-300 text-purple-800 px-5 py-2 rounded-xl transition-all duration-200 flex items-center gap-3 cursor-pointer select-none shadow-md"
                                htmlFor="quickPdfFile"
                            >
                                <i className="fas fa-upload fa-lg"></i>
                                <span className="font-semibold">Quick Upload</span>
                            </label>
                        </div>
                        <button
                            aria-label="Clear chat"
                            className="bg-red-200 hover:bg-red-300 text-red-800 px-5 py-2 rounded-xl transition-all duration-200 flex items-center gap-3 select-none shadow-md"
                            onClick={clearChat}
                            type="button"
                        >
                            <i className="fas fa-trash-alt fa-lg"></i>
                            <span className="font-semibold">Clear</span>
                        </button>
                        <button
                            aria-label="Close chatbot"
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded-xl transition-all duration-200 flex items-center justify-center select-none shadow-md"
                            onClick={onClose}
                            type="button"
                        >
                            <i className="fas fa-times fa-lg"></i>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto p-5 flex-1 flex flex-col h-[calc(100vh-96px)]">
                {/* File Info */}
                {fileInfo && (
                    <div className="bg-purple-700/90 border border-purple-500 rounded-xl p-5 mb-5 text-white shadow-lg flex items-center gap-4 select-text">
                        <i className="fas fa-file-pdf fa-2x"></i>
                        <div className="flex flex-col">
                            <div className="font-semibold text-lg">{fileInfo.name}</div>
                            <div className="text-sm opacity-90">{fileInfo.length.toLocaleString()} characters extracted</div>
                        </div>
                        <button
                            aria-label="Remove uploaded file"
                            className="ml-auto text-white/70 hover:text-white transition-colors"
                            onClick={clearFile}
                            type="button"
                        >
                            <i className="fas fa-times fa-lg"></i>
                        </button>
                    </div>
                )}

                {/* Chat Container */}
                <section className="flex-1 bg-white/90 rounded-3xl border border-purple-300 flex flex-col overflow-hidden shadow-2xl">
                    {/* Chat Messages */}
                    <div
                        aria-live="polite"
                        aria-relevant="additions"
                        className="flex-1 p-6 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-purple-400 scrollbar-track-purple-100"
                        role="log"
                        ref={chatContainerRef}
                    >
                        {messages.map((message) => (
                            <div key={message.id} className={`flex items-start gap-4 max-w-3xl ${message.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mx-auto'}`}>
                                <div className={`w-12 h-12 ${message.sender === 'user' ? 'bg-purple-700' : message.sender === 'system' ? 'bg-purple-700' : 'bg-white'} rounded-full flex items-center justify-center text-white text-2xl select-none shadow-lg`} aria-hidden="true">
                                    {message.sender === 'user' ? '👤' : message.sender === 'system' ? '💡' : '🤖'}
                                </div>
                                <div className={`${message.sender === 'user' ? 'bg-purple-700 text-white' : 'bg-purple-50 text-purple-900'} rounded-3xl p-6 max-w-[80%] shadow-lg border border-purple-300 break-words`}>
                                    <div className={`font-semibold ${message.sender === 'user' ? 'text-white' : 'text-purple-900'} mb-4 text-lg select-text`}>
                                        {message.sender === 'user' ? 'You' : message.sender === 'system' ? 'System' : 'Medical Assistant'}
                                    </div>
                                    {message.messageType && message.sender === 'user' && (
                                        <div className={`message-type-indicator mb-3 px-3 py-1 rounded-full text-xs font-semibold ${message.messageType === 'symptoms' ? 'bg-orange-100 text-orange-800' :
                                            message.messageType === 'report' ? 'bg-blue-100 text-blue-800' :
                                                'bg-purple-100 text-purple-800'
                                            }`}>
                                            {getMessageTypeIcon(message.messageType)}
                                        </div>
                                    )}
                                    <div
                                        className={`message-content ${message.sender === 'user' ? 'text-white' : 'text-purple-900'} select-text`}
                                        dangerouslySetInnerHTML={{ __html: parseMarkdown(message.content) }}
                                    />
                                </div>
                            </div>
                        ))}

                        {recommendedDoctors.length > 0 && (
                            <div className="p-4">
                                <h2 className="text-lg font-bold text-purple-700 mb-2">Recommended Doctors</h2>
                                <div className="grid gap-4">
                                    {recommendedDoctors.map((doc) => (
                                        <div
                                            key={doc["Doctor ID"]}
                                            className="cursor-pointer border border-purple-300 p-4 rounded-xl shadow-sm hover:bg-purple-50 transition"
                                            onClick={() => router.push(`/hospital/${doc["Doctor ID"]}`)}
                                        >
                                            <div className="text-xl font-semibold">{doc["Doctor Name"]}</div>
                                            <div className="text-sm text-gray-600">⭐ {doc.Rating.toFixed(1)} / 5</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {isProcessing && (
                            <div className="flex items-start gap-4 max-w-3xl mx-auto">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-white text-2xl select-none shadow-lg" aria-hidden="true">
                                    🤖
                                </div>
                                <div className="bg-purple-50 text-purple-900 rounded-3xl p-6 max-w-[80%] shadow-lg border border-purple-300 break-words">
                                    <div className="font-semibold text-purple-900 mb-4 text-lg select-text">
                                        Medical Assistant
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="animate-bounce w-2 h-2 bg-purple-500 rounded-full"></div>
                                        <div className="animate-bounce w-2 h-2 bg-purple-500 rounded-full" style={{ animationDelay: '0.1s' }}></div>
                                        <div className="animate-bounce w-2 h-2 bg-purple-500 rounded-full" style={{ animationDelay: '0.2s' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <form className="p-6 border-t border-purple-300 bg-purple-50 rounded-b-3xl flex flex-col gap-5" onSubmit={handleSubmit}>
                        <label className="sr-only" htmlFor="questionInput">
                            Type your message
                        </label>
                        <div className="flex gap-4">
                            <input
                                aria-autocomplete="list"
                                aria-describedby="sampleQuestions"
                                aria-label="Type your message here"
                                autoComplete="off"
                                className="flex-1 bg-white border border-purple-300 rounded-2xl px-6 py-4 text-purple-900 placeholder-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-transparent shadow-md transition"
                                id="questionInput"
                                name="questionInput"
                                placeholder="Type anything: symptoms, questions, or drag & drop a PDF report..."
                                type="text"
                                ref={inputRef}
                                disabled={isProcessing}
                            />
                            <button
                                aria-label="Send message"
                                className="bg-purple-700 hover:bg-purple-800 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-200 disabled:bg-purple-300 disabled:cursor-not-allowed shadow-lg flex items-center justify-center"
                                type="submit"
                                disabled={isProcessing}
                            >
                                <i className="fas fa-paper-plane fa-lg"></i>
                            </button>
                        </div>

                        {/* Sample Questions */}
                        <div className="text-purple-700 text-sm select-none" id="sampleQuestions">
                            <div className="mb-2 font-semibold">
                                Try these examples:
                            </div>
                            <div className="flex flex-wrap gap-3 max-w-3xl">
                                <button
                                    aria-label="Symptom example"
                                    className="bg-orange-400/30 hover:bg-orange-400/50 text-orange-900 text-xs px-4 py-1 rounded-full transition-all duration-200 border border-orange-400/50 shadow-sm flex items-center gap-2 select-none"
                                    onClick={() => askSampleQuestion('I have severe headache and nausea for 2 days')}
                                    type="button"
                                    disabled={isProcessing}
                                >
                                    <span className="text-lg">🩺</span>
                                    Symptom example
                                </button>
                                <button
                                    aria-label="General question example"
                                    className="bg-purple-600/30 hover:bg-purple-600/50 text-purple-900 text-xs px-4 py-1 rounded-full transition-all duration-200 border border-purple-600/50 shadow-sm flex items-center gap-2 select-none"
                                    onClick={() => askSampleQuestion('What causes high blood pressure?')}
                                    type="button"
                                    disabled={isProcessing}
                                >
                                    <span className="text-lg">❓</span>
                                    General question
                                </button>
                                <button
                                    aria-label="Report question example"
                                    className="bg-blue-500/30 hover:bg-blue-500/50 text-blue-900 text-xs px-4 py-1 rounded-full transition-all duration-200 border border-blue-500/50 shadow-sm flex items-center gap-2 select-none"
                                    onClick={() => askSampleQuestion('Explain my cholesterol levels')}
                                    type="button"
                                    disabled={isProcessing}
                                >
                                    <span className="text-lg">📊</span>
                                    Report question
                                </button>
                                <button
                                    aria-label="Doctor recommendation example"
                                    className="bg-green-500/30 hover:bg-green-500/50 text-green-900 text-xs px-4 py-1 rounded-full transition-all duration-200 border border-green-500/50 shadow-sm flex items-center gap-2 select-none"
                                    onClick={() => askSampleQuestion('feeling dizzy and tired, what specialist should I see?')}
                                    type="button"
                                    disabled={isProcessing}
                                >
                                    <span className="text-lg">👨‍⚕️</span>
                                    Doctor recommendation
                                </button>
                            </div>
                        </div>
                    </form>
                </section>
            </main>

            {/* Drag & Drop Overlay */}
            {isDragOver && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <div className="bg-white rounded-3xl p-10 text-center max-w-sm mx-4 shadow-2xl select-none">
                        <div className="mx-auto mb-6 text-6xl">📄</div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                            Drop PDF Report Here
                        </h3>
                        <p className="text-gray-700 text-base leading-relaxed">
                            Release to upload your lab report for instant analysis and recommendations.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chatbot;