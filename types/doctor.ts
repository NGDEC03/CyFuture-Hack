
export interface Doctor {
    id: string;
    userId: string;
    specialization: string[];
    qualifications: string[];
    noOfPatients: number
    ratings: number;
    about: string;
    price: number;
    user: {
        id: string;
        name: string;
        email: string;
        profile: string | null;
    };
    availability: Array<{
        id: string;
        doctorId: string;
        day: string;
        startTime: string;
        endTime: string;
        labId: string | null;
    }>;
    reviews: Array<{
        id: string;
        doctorId: string;
        userId: string;
        rating: number;
        comment: string;
        createdAt: string;
    }>;
}

export interface Hospital {
    id: string;
    name: string;
    departments: string[];
    facilities: string[];
    services: string[];
    hours: string;
    locationId: string;
    location: {
        id: string;
        lat: number;
        lng: number;
        address: string;
    };
}

export interface Lab {
    id: string;
    hospitalId: string;
    name: string;
    services: string[];
    locationId: string;
    location: {
        id: string;
        lat: number;
        lng: number;
        address: string;
    };
    hospital: Hospital;
}

export interface DoctorHospitalData {
    id: string;
    doctorId: string;
    hospitalId: string;
    doctor: Doctor;
    hospital: Hospital;

}

export interface Appointment {
    id: string;
    doctorId: string;
    userId: string;
    date: string;
    time: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    createdAt: string;
}