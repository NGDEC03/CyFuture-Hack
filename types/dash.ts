export interface FacilityBannerProps {
    name: string;
    description: string;
    metrics: {
        rating: number;
        patientsCount: string;
        doctorsCount: string;
        testsCount?: string;
    };
}
