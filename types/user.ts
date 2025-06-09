import { Review } from "./doctor";

enum Role {
    PATIENT = 'PATIENT',
    DOCTOR = 'DOCTOR',
    ADMIN = 'ADMIN'
}

export interface User {
    id: string;
    email: string;
    password: string;
    name: string;
    phone?: string;
    role: Role;
    verifyCode?: string;
    verified: boolean;
    reviews: Review[];
}