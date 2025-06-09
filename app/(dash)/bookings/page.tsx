'use client';
import Image from 'next/image'
import type { FC } from 'react'
import { useState, useEffect } from 'react'
import BookingForm from '@/components/dash/booking/BookingForm';
import { DoctorHospitalData } from '@/types/doctor';
import { fetchDoctors } from '@/services/api';

const Booking: FC = () => {
    const [doctors, setDoctors] = useState<DoctorHospitalData[]>([]);
    const [selectedDoctor, setSelectedDoctor] = useState<DoctorHospitalData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDoctors = async () => {
            try {
                const data = await fetchDoctors();
                console.log(data);
                setDoctors(data);
            } catch (error) {
                console.error('Error loading doctors:', error);
            } finally {
                setLoading(false);
            }
        };

        loadDoctors();
    }, []);

    const handleDoctorSelect = (doctor: DoctorHospitalData) => {
        setSelectedDoctor(doctor);
    };

    return (
        <div className="min-h-screen flex flex-col">

            <div className="flex-1 container mx-auto px-4 py-8">
                {!selectedDoctor ? (
                    <div className="space-y-6">
                        <h1 className="text-2xl font-semibold text-gray-800">Select a Doctor</h1>
                        {loading ? (
                            <div className="text-center">Loading doctors...</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {doctors.map((doctor) => (
                                    <div
                                        key={doctor.id}
                                        onClick={() => handleDoctorSelect(doctor)}
                                        className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                                    >
                                        <div className="flex gap-4 items-start">
                                            <Image
                                                width={64}
                                                height={64}
                                                unoptimized
                                                src={doctor.doctor.user.profile || '/default-doctor.png'}
                                                alt={doctor.doctor.user.name}
                                                className="w-16 h-16 rounded-lg object-cover"
                                            />
                                            <div className="flex-1">
                                                <h3 className="text-gray-800 font-semibold">{doctor.doctor.user.name}</h3>
                                                <p className="text-gray-500 text-sm mt-1">
                                                    {doctor.doctor.qualifications.join(', ')}
                                                </p>
                                                <p className="text-gray-500 text-sm">
                                                    {doctor.doctor.specialization.join(', ')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-gray-800 font-medium">{doctor.doctor.ratings}</span>
                                                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            </div>
                                            <span className="text-gray-800 font-medium">₹{doctor.doctor.price}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 mb-6">
                            <button
                                onClick={() => setSelectedDoctor(null)}
                                className="text-gray-600 hover:text-gray-800"
                            >
                                ← Back to doctors
                            </button>
                            <h1 className="text-2xl font-semibold text-gray-800">
                                Book Appointment with Dr. {selectedDoctor.doctor.user.name}
                            </h1>
                        </div>
                        <BookingForm doctor={selectedDoctor} />
                    </div>
                )}
            </div>

        </div>
    );
}

export default Booking