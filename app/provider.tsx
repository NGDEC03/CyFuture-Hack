'use client';
import { SessionProvider } from '@/context/sessionProvider';
import { ThemeProvider } from '@/context/themeProvider';
import ReactQueryProvider from "@/context/queryProvider"

import Navbar from '@/components/layout/navbar';
import MobileNavbar from '@/components/layout/mobile-navbar';
import { ServiceProvider } from '@/context/serviceProvider';
import { useState } from 'react';
import Chatbot from '@/components/chatbot/ChatBot';
import ChatbotIcon from '@/components/chatbot/ChatBotIcon';

export default function Provider({ children }: { children: React.ReactNode }) {

    const [isChatbotOpen, setIsChatbotOpen] = useState(false);

    const toggleChatbot = () => {
        setIsChatbotOpen(!isChatbotOpen);
    };

    return (
        <ReactQueryProvider >
            <SessionProvider>
                <ServiceProvider>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="light"
                        disableTransitionOnChange
                    >
                        <div className="flex flex-col min-h-screen w-full overflow-x-hidden">

                            <div className="block lg:hidden sticky top-0 z-30 bg-white">
                                <MobileNavbar />
                            </div>
                            <div className="hidden lg:block">
                                <Navbar />
                            </div>
                            {children}

                            {isChatbotOpen && <Chatbot onClose={() => setIsChatbotOpen(false)} />}
                            <ChatbotIcon onClick={toggleChatbot} />
                        </div>
                    </ThemeProvider>
                </ServiceProvider>
            </SessionProvider >
        </ReactQueryProvider>
    );
}