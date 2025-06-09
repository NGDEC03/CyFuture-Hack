export type SearchType = 'doctor' | 'hospital' | 'lab';

export interface SearchResult {
    id: string;
    name: string;
    type: SearchType;
    specialization?: string;
    location?: string;
}

export interface Location {
    lat: number;
    lng: number;
    address: string;
}