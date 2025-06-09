import { useState, useEffect, useMemo, type FC } from 'react';
import { useService } from '@/context/serviceProvider';
import { fetchDoctorsBySpecialization } from '@/services/api';
import { useInfiniteQuery } from '@tanstack/react-query';
import { type DoctorHospitalData } from '@/types/doctor';
import Image from 'next/image';
import Link from 'next/link';

interface HospitalListProps {
    selectedCategory?: string;
}

interface PageData {
    items: DoctorHospitalData[];
    nextPage: number | undefined;
}

const HospitalList: FC<HospitalListProps> = ({ selectedCategory = 'Cardiology' }) => {
    const { serviceType } = useService()
    const [userLocation, setUserLocation] = useState({ lat: 0, long: 0 })
    const [distances, setDistances] = useState<{ [key: string]: string }>({})
    const itemsPerPage = 6;

    useEffect(() => {
        const fetchLocation = () => navigator.geolocation.getCurrentPosition((position) => {
            setUserLocation({
                lat: position.coords.latitude,
                long: position.coords.longitude
            })
        })
        fetchLocation()
    }, [])

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        error
    } = useInfiniteQuery<PageData>({
        queryKey: ['doctors', selectedCategory],
        queryFn: async ({ pageParam = 1 }) => {
            const data = await fetchDoctorsBySpecialization(selectedCategory);
            const start = ((pageParam as number) - 1) * itemsPerPage;
            const end = start + itemsPerPage;

            return {
                items: data.slice(start, end),
                nextPage: end < data.length ? (pageParam as number) + 1 : undefined
            };
        },
        getNextPageParam: (lastPage) => lastPage.nextPage,
        enabled: serviceType === 'hospitals' && !!selectedCategory,
        initialPageParam: 1
    });

    // Calculate distances whenever data or userLocation changes
    useEffect(() => {
        if (!data?.pages || !userLocation.lat || !userLocation.long) return;

        const newDistances: { [key: string]: string } = {};
        data.pages.forEach(page => {
            page.items.forEach(item => {
                const distance = calculateDistance(
                    userLocation.lat,
                    userLocation.long,
                    item.hospital.location.lat,
                    item.hospital.location.lng
                );
                newDistances[item.hospital.id] = distance;
            });
        });
        setDistances(newDistances);
    }, [data, userLocation]);

    const staticLabs = [
        {
            id: '1',
            name: 'LifeCare Diagnostics',
            logo: '/logos/lifecare.png',
            description: 'Advanced diagnostic center with state-of-the-art equipment.',
            specialties: ['Blood Tests', 'Imaging', 'Pathology'],
            distance: '2.8 Kms',
            isTopRated: true,
            departmentsCount: 5
        },
        // ... other static labs
    ];

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): string => {
        const R = 6371; // Radius of the earth in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return `${distance.toFixed(1)} Kms`;
    };

    const transformedHospitals = useMemo(() =>
        data?.pages.flatMap(page =>
            page.items.map((item: DoctorHospitalData) => ({
                id: item.hospital.id,
                name: item.hospital.name,
                logo: '/logos/default.png',
                description: `Located at ${item.hospital.location.address}`,
                specialties: item.hospital.departments.slice(0, 4),
                distance: distances[item.hospital.id] || 'Calculating...',
                isTopRated: item.doctor.ratings >= 4,
                departmentsCount: item.hospital.departments.length,
                doctor: {
                    name: item.doctor.user.name,
                    specialization: item.doctor.specialization,
                    price: item.doctor.price,
                    rating: item.doctor.ratings
                }
            }))
        ) || [], [data, distances]);

    const facilities = serviceType === 'hospitals' ? transformedHospitals : staticLabs;

    if (isLoading) {
        return (
            <div className="w-full p-3 lg:p-6 flex justify-center items-center min-h-[200px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading Hospitals...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full p-3 lg:p-6 flex justify-center items-center min-h-[200px]">
                <div className="text-center">
                    <p className="text-red-600">Failed to fetch hospitals. Please try again.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full p-3 lg:p-6">
            <div className="flex flex-col items-center gap-4 lg:gap-6">
                {facilities.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-600">No {serviceType} found for the selected category.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-4 lg:gap-6 w-full max-w-[400px] lg:max-w-none lg:grid-cols-3">
                            {facilities.map((facility) => (
                                <div key={facility.id} className="bg-white rounded-xl lg:rounded-2xl p-3 lg:p-4 shadow-sm border border-gray-100 w-full">
                                    <div className="flex gap-2 lg:gap-3">
                                        <Image
                                            width={64}
                                            height={64}
                                            unoptimized
                                            src={facility.logo}
                                            alt={facility.name}
                                            className="w-14 h-14 lg:w-16 lg:h-16 object-contain"
                                        />
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-800 text-sm lg:text-base line-clamp-1">{facility.name}</h3>
                                            <p className="text-gray-500 text-xs lg:text-sm line-clamp-2">{facility.description}</p>

                                        </div>
                                    </div>

                                    <div className="mt-3 lg:mt-4 flex flex-wrap items-center gap-1 lg:gap-1.5">
                                        {facility.specialties.slice(0, 3).map((specialty: string, index: number) => (
                                            <span key={index} className="px-1.5 lg:px-2 py-0.5 bg-gray-50 rounded-full text-xs text-gray-600 whitespace-nowrap">
                                                {specialty}
                                            </span>
                                        ))}
                                        {facility.specialties.length > 3 && (
                                            <span className="px-1.5 lg:px-2 py-0.5 bg-gray-50 rounded-full text-xs text-blue-600 whitespace-nowrap">
                                                +{facility.specialties.length - 3} more
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-3 lg:mt-4 pb-2 flex flex-wrap items-center gap-2 lg:gap-4 text-xs lg:text-sm">
                                        <div className="flex items-center gap-1">
                                            <svg className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            {facility.distance}
                                        </div>
                                        {facility.isTopRated && (
                                            <div className="flex items-center gap-1">
                                                <svg className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                                Top Rated
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1">
                                            <svg className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                                            </svg>
                                            {facility.departmentsCount}+ {serviceType === 'hospitals' ? 'Departments' : 'Services'}
                                        </div>
                                    </div>

                                    <Link
                                        href={`/${serviceType === 'hospitals' ? 'hospital' : 'lab'}/${facility.id}`}
                                        className="inline-block w-full text-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-xs lg:text-sm"
                                    >
                                        Explore
                                    </Link>
                                </div>
                            ))}
                        </div>

                        {hasNextPage && (
                            <button
                                onClick={() => fetchNextPage()}
                                disabled={isFetchingNextPage}
                                className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isFetchingNextPage ? 'Loading more...' : 'Load More'}
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default HospitalList