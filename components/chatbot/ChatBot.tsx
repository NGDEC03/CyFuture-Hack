'use client';
import React, { useState, useRef, useEffect, ChangeEvent, FormEvent } from 'react';
import { useChatbot } from '@/context/useChatBot';
import { Doctor, ChatMessage } from "@/types/chatbot"
import Image from 'next/image';

interface ChatbotProps {
    onClose: () => void;
}

const parseMarkdown = (markdownText: string): string => {
    // Basic markdown to HTML conversion
    let htmlText = markdownText
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
        .replace(/\*(.*?)\*/g, '<em>$1</em>')     // Italic
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" class="text-blue-400 hover:underline">$1</a>') // Links
        .replace(/^- (.*)$/gm, '<li>$1</li>') // List items
        .replace(/`([^`]+)`/g, '<code class="bg-gray-200 p-1 rounded">$1</code>'); // Inline code

    if (htmlText.includes('<li>')) {
        htmlText = `<ul>${htmlText}</ul>`;
    }

    // Handle newlines as paragraphs or breaks
    htmlText = htmlText.split('\n').map(line => line.trim() ? `<p>${line}</p>` : '').join('');

    return htmlText;
};

const renderMessageContent = (message: ChatMessage) => {
    if (message.sender === 'system' && message.content.startsWith('{"doctors":')) {
        try {
            const { doctors, specialization } = JSON.parse(message.content) as { doctors: Doctor[], specialization: string };
            return (
                <div className="mb-8 max-w-3xl mx-auto select-text">
                    <h4 className="font-extrabold text-purple-800 mb-6 flex items-center gap-3 text-xl">
                        <i className="fas fa-user-md text-purple-600"></i> Recommended Doctors ({specialization.charAt(0).toUpperCase() + specialization.slice(1)})
                    </h4>
                    {doctors.map((doctor, index) => (
                        <div key={index} className="doctor-card mb-4 p-4 bg-white rounded-xl shadow-sm border border-purple-200">
                            <div className="doctor-info text-purple-800">
                                <div className="doctor-name font-bold text-lg">{doctor.name}</div>
                                <div className="doctor-specialization text-sm opacity-90">{doctor.specialization}</div>
                                <div className="doctor-location text-sm opacity-70">{doctor.location}</div>
                            </div>
                            <div className="doctor-rating mt-2 flex items-center text-purple-600">
                                {Array.from({ length: 5 }).map((_, i) => {
                                    const starType = i < Math.floor(doctor.rating) ? 'fas fa-star' :
                                        i === Math.floor(doctor.rating) && doctor.rating % 1 >= 0.5 ? 'fas fa-star-half-alt' :
                                            'far fa-star';
                                    return <i key={i} className={`${starType} doctor-rating-stars mr-1`} style={{ color: starType.includes('fas') ? '#8B5CF6' : '#d8b4fe' }}></i>;
                                })}
                                <span aria-label={`Rating: ${doctor.rating.toFixed(1)} stars`} className="ml-1 text-purple-700 text-sm">
                                    {doctor.rating.toFixed(1)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            );
        } catch (e) {
            console.error("Failed to parse doctor recommendations:", e);
            return <div dangerouslySetInnerHTML={{ __html: parseMarkdown(message.content) }} />;
        }
    }
    return <div dangerouslySetInnerHTML={{ __html: parseMarkdown(message.content) }} />;
};


const Chatbot: React.FC<ChatbotProps> = ({ onClose }) => {
    const {
        messages,
        currentSessionId,
        isProcessing,
        fileInfo,
        chatContainerRef,
        clearChat,
        clearFile,
        handleFileUpload,
        sendMessage,
        scrollToBottom,
    } = useChatbot();

    const inputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const handleQuickFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileUpload(file);
            e.target.value = ''; // Clear the input so same file can be uploaded again
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (inputRef.current) {
            sendMessage(inputRef.current.value);
            inputRef.current.value = '';
        }
    };

    const askSampleQuestion = (question: string) => {
        if (inputRef.current) {
            inputRef.current.value = question;
            sendMessage(question); // Send directly or let user edit and send
        }
    };

    // Drag and Drop Handlers
    const [isDragOver, setIsDragOver] = useState(false);

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
            // Optional: show an error for non-PDF files
            // showError('Only PDF files are supported.');
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
                                <span className="pulse-dot">
                                    ●
                                </span>
                                Auto-detects symptoms, reports, and general questions
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="quick-upload">
                            <input accept=".pdf" aria-label="Upload PDF lab report" id="quickPdfFile" type="file" onChange={handleQuickFileSelect} ref={fileInputRef} className="hidden" />
                            <label
                                className="bg-purple-200 hover:bg-purple-300 text-purple-800 px-5 py-2 rounded-xl transition-all duration-200 flex items-center gap-3 cursor-pointer select-none shadow-md"
                                htmlFor="quickPdfFile">
                                <i className="fas fa-upload fa-lg">
                                </i>
                                <span className="font-semibold">
                                    Quick Upload
                                </span>
                            </label>
                        </div>
                        <button aria-label="Clear chat"
                            className="bg-red-200 hover:bg-red-300 text-red-800 px-5 py-2 rounded-xl transition-all duration-200 flex items-center gap-3 select-none shadow-md"
                            id="clearBtn" onClick={clearChat} type="button">
                            <i className="fas fa-trash-alt fa-lg">
                            </i>
                            <span className="font-semibold">
                                Clear
                            </span>
                        </button>
                        <button aria-label="Close chatbot"
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded-xl transition-all duration-200 flex items-center justify-center select-none shadow-md"
                            onClick={onClose} type="button">
                            <i className="fas fa-times fa-lg"></i>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto p-5 flex-1 flex flex-col h-[calc(100vh-96px)]">
                {/* File Info (Hidden by default) */}
                {fileInfo && (
                    <div
                        className="bg-purple-700/90 border border-purple-500 rounded-xl p-5 mb-5 text-white shadow-lg flex items-center gap-4 select-text"
                        id="fileInfo">
                        <i className="fas fa-file-pdf fa-2x">
                        </i>
                        <div className="flex flex-col">
                            <div className="font-semibold text-lg" id="fileInfoName">
                                {fileInfo.name}
                            </div>
                            <div className="text-sm opacity-90" id="fileInfoLength">
                                {fileInfo.length} characters
                            </div>
                        </div>
                        <button aria-label="Remove uploaded file" className="ml-auto text-white/70 hover:text-white transition-colors"
                            onClick={clearFile} type="button">
                            <i className="fas fa-times fa-lg">
                            </i>
                        </button>
                    </div>
                )}
                {/* Chat Container */}
                <section className="flex-1 bg-white/90 rounded-3xl border border-purple-300 flex flex-col overflow-hidden shadow-2xl">
                    {/* Chat Messages */}
                    <div aria-live="polite" aria-relevant="additions"
                        className="flex-1 p-6 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-purple-400 scrollbar-track-purple-100"
                        id="chatContainer" role="log" ref={chatContainerRef}>
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
                                        <div className={`message-type-indicator ${message.messageType === 'symptoms' ? 'type-symptoms' :
                                            message.messageType === 'report' ? 'type-report' :
                                                'type-general'
                                            }`}>
                                            {message.messageType === 'symptoms' && '🩺 Symptoms Analysis'}
                                            {message.messageType === 'report' && '📊 Report Question'}
                                            {message.messageType === 'general' && '❓ General Question'}
                                        </div>
                                    )}
                                    <div className={`message-content ${message.sender === 'user' ? 'text-white' : 'text-purple-900'} select-text`}>
                                        {renderMessageContent(message)}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isProcessing && (
                            <div className="flex items-start gap-4 max-w-3xl mx-auto">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-white text-2xl select-none shadow-lg" aria-hidden="true">
                                    🤖
                                </div>
                                <div className="bg-purple-50 text-purple-900 rounded-3xl p-6 max-w-[80%] shadow-lg border border-purple-300 break-words">
                                    <div className="font-semibold text-purple-900 mb-4 text-lg select-text">
                                        Medical Assistant
                                    </div>
                                    <div className="dot-flashing"></div>
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
                            <input aria-autocomplete="list" aria-describedby="sampleQuestions" aria-label="Type your message here"
                                autoComplete="off"
                                className="flex-1 bg-white border border-purple-300 rounded-2xl px-6 py-4 text-purple-900 placeholder-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-transparent shadow-md transition"
                                id="questionInput" name="questionInput"
                                placeholder="Type anything: symptoms, questions, or drag &amp; drop a PDF report..." type="text" ref={inputRef} disabled={isProcessing} />
                            <button aria-label="Send message"
                                className="bg-purple-700 hover:bg-purple-800 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-200 disabled:bg-purple-300 disabled:cursor-not-allowed shadow-lg flex items-center justify-center"
                                id="sendBtn" type="submit" disabled={isProcessing}>
                                <i className="fas fa-paper-plane fa-lg">
                                </i>
                            </button>
                        </div>
                        {/* Sample Questions */}
                        <div className="text-purple-700 text-sm select-none" id="sampleQuestions">
                            <div className="mb-2 font-semibold">
                                Try these examples:
                            </div>
                            <div className="flex flex-wrap gap-3 max-w-3xl">
                                <button aria-label="Symptom example"
                                    className="bg-orange-400/30 hover:bg-orange-400/50 text-orange-900 text-xs px-4 py-1 rounded-full transition-all duration-200 border border-orange-400/50 shadow-sm flex items-center gap-2 select-none"
                                    onClick={() => askSampleQuestion('I have severe headache and nausea for 2 days')} type="button" disabled={isProcessing}>
                                    <span className="text-lg">
                                        🩺
                                    </span>
                                    Symptom example
                                </button>
                                <button aria-label="General question example"
                                    className="bg-purple-600/30 hover:bg-purple-600/50 text-purple-900 text-xs px-4 py-1 rounded-full transition-all duration-200 border border-purple-600/50 shadow-sm flex items-center gap-2 select-none"
                                    onClick={() => askSampleQuestion('What causes high blood pressure?')} type="button" disabled={isProcessing}>
                                    <span className="text-lg">
                                        ❓
                                    </span>
                                    General question
                                </button>
                                {currentSessionId && ( // Only show report question if a file is uploaded
                                    <button aria-label="Report question example"
                                        className="bg-blue-500/30 hover:bg-blue-500/50 text-blue-900 text-xs px-4 py-1 rounded-full transition-all duration-200 border border-blue-500/50 shadow-sm flex items-center gap-2 select-none"
                                        onClick={() => askSampleQuestion('Explain my cholesterol levels')} type="button" disabled={isProcessing}>
                                        <span className="text-lg">
                                            📊
                                        </span>
                                        Report question
                                    </button>
                                )}
                                <button aria-label="Doctor recommendation example"
                                    className="bg-green-500/30 hover:bg-green-500/50 text-green-900 text-xs px-4 py-1 rounded-full transition-all duration-200 border border-green-500/50 shadow-sm flex items-center gap-2 select-none"
                                    onClick={() => askSampleQuestion('feeling dizzy and tired, what specialist should I see?')} type="button" disabled={isProcessing}>
                                    <span className="text-lg">
                                        👨‍⚕️
                                    </span>
                                    Doctor recommendation
                                </button>
                            </div>
                        </div>
                    </form>
                </section>
            </main>

            {/* Drag & Drop Overlay */}
            {isDragOver && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6 pointer-events-none"> {/* pointer-events-none to allow drop on underlying div */}
                    <div className="bg-white rounded-3xl p-10 text-center max-w-sm mx-4 shadow-2xl select-none pointer-events-auto"> {/* pointer-events-auto for this div */}
                        <Image
                            unoptimized
                            alt="Icon of a PDF document with a folded corner and text lines" className="mx-auto mb-6" height="96"
                            src="https://storage.googleapis.com/a1aa/image/29cf4c76-d9bb-4ac4-fce4-3cc0d6232a57.jpg" width="96" />
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