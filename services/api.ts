import { Appointment, DoctorHospitalData, Lab } from "@/types/doctor";

export const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api/v1';

export const fetchDoctors = async (): Promise<DoctorHospitalData[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/search/doctors`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching doctors:', error);
        throw error;
    }
};

export const fetchDoctorsBySpecialization = async (specialization: string): Promise<DoctorHospitalData[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/search/doctors?specialization=${encodeURIComponent(specialization)}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching doctors:', error);
        throw error;
    }
};

export const fetchLabs = async (service?: string): Promise<Lab[]> => {
    try {
        const url = service
            ? `${API_BASE_URL}/labs/all?service=${encodeURIComponent(service)}`
            : `${API_BASE_URL}/labs/all`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching labs:', error);
        throw error;
    }
};

export const createAppointment = async (appointmentData: {
    doctorId: string;
    scheduledAt: string;
}): Promise<Appointment> => {

    try {
        console.log("reached here");

        const response = await fetch(`${API_BASE_URL}/appointments/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(appointmentData),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error creating appointment:', error);
        throw error;
    }
};