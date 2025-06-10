'use client';
import React from 'react';
import { FaRobot } from "react-icons/fa6";
interface ChatbotIconProps {
    onClick: () => void;
}

const ChatbotIcon: React.FC<ChatbotIconProps> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-8 right-8 z-50 bg-purple-700 hover:bg-purple-800 text-white p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-purple-400"
            aria-label="Open Chatbot"
        >
            <i className="fas fa-robot text-3xl"><FaRobot /></i>
        </button>
    );
};

export default ChatbotIcon;