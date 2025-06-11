'use client';
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import axios from "axios";
import { SessionContextType, User } from "@/types/session";

const SessionContext = createContext<SessionContextType>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    logout: () => { },
    refresh: () => { }
});

export function SessionProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchUserProfile();
    }, [user]);

    const fetchUserProfile = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/profile`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setUser(response.data);
        } catch (error) {
            console.log(error);
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                localStorage.removeItem("token");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const refresh = async () => {
        fetchUserProfile();
    }

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    return (
        <SessionContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                logout,
                refresh
            }}
        >
            {children}
        </SessionContext.Provider>
    );
}

export const useSession = () => {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error('useSession must be used within a SessionProvider');
    }
    return context;
};