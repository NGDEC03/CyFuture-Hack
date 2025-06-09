
export interface Profile {
    id: string;
    userId: string;
    gender: string;
    dob: string | null;
    address: string;
}

export interface User {
    id: string;
    email: string;
    name: string;
    phone: string;
    role: string;
    verified: boolean;
    profile: Profile;
}

export interface SessionContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    logout: () => void;
    refresh: () => void;
}