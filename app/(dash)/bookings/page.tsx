
"use client"
import { useState, useEffect } from 'react'
import type { FC } from 'react'
import { API_BASE_URL } from '@/services/api'
import Image from 'next/image';

interface BaseBooking {
    id: string;
    date: string;
    time: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
    type: 'doctor' | 'test';
}

interface DoctorBooking extends BaseBooking {
    type: 'doctor';
    doctorName: string;
    doctorImage: string;
    qualification: string;
    specialization: string;
    hospital: string;
    location: string;
    coordinates: {
        lat: number;
        lng: number;
    };
}

interface TestBooking extends BaseBooking {
    type: 'test';
    testName: string;
    testIcon: string;
    labName: string;
    location: string;
    coordinates: {
        lat: number;
        lng: number;
    };
    sampleCollection: 'lab' | 'home';
}

type Booking = DoctorBooking | TestBooking;

interface RescheduleData {
    date: string;
    time: string;
}

const BookingsList: FC = () => {
    const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
    const [rescheduleData, setRescheduleData] = useState<RescheduleData>({
        date: '',
        time: ''
    });
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const statuses = activeTab === 'upcoming'
                ? ['PENDING', 'CONFIRMED', 'RESCHEDULED', 'CANCELLED']
                : ['COMPLETED'];

            const allAppointments = [];
            for (const status of statuses) {
                const response = await fetch(`${API_BASE_URL}/search/appointments?status=${status}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch bookings');
                }

                const data = await response.json();
                console.log(`Fetched ${status} appointments:`, data);
                allAppointments.push(...data);
            }
            console.log("appointments is", allAppointments);

            const transformedBookings: Booking[] = allAppointments
                .map((appointment: any): Booking | null => {
                    if (appointment.doctorId) {
                        const hospital = appointment.doctor.affiliations?.[0]?.hospital;

                        return {
                            id: appointment.id,
                            type: 'doctor',
                            doctorName: appointment.doctor.user.name,
                            doctorImage: appointment.doctor.user.profile?.picture || '/doctors/doctor1.png',
                            qualification: appointment.doctor.qualifications.join(', '),
                            specialization: appointment.doctor.specialization.join(', '),
                            hospital: hospital?.name || 'Hospital not assigned',
                            location: hospital?.location?.address || 'Location not assigned',
                            coordinates: {
                                lat: hospital?.location?.lat || 0,
                                lng: hospital?.location?.lng || 0
                            },
                            date: new Date(appointment.scheduledAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            }),
                            time: new Date(appointment.scheduledAt).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                            }),
                            status: appointment.status.toLowerCase()
                        };
                    } else {
                        return {
                            id: appointment.id,
                            type: 'test',
                            testName: appointment.test.name,
                            testIcon: '/icons/test-tube.png',
                            labName: appointment.lab.name,
                            location: appointment.lab.location.address,
                            coordinates: {
                                lat: appointment.lab.location.lat,
                                lng: appointment.lab.location.lng
                            },
                            date: new Date(appointment.scheduledAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            }),
                            time: new Date(appointment.scheduledAt).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                            }),
                            status: appointment.status.toLowerCase(),
                            sampleCollection: appointment.test.homeSample ? 'home' : 'lab'
                        };
                    }
                })
                .filter((booking): booking is Booking => booking !== null);

            setBookings(transformedBookings);
        } catch (err) {
            console.error('Error fetching bookings:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [activeTab]);

    const handleReschedule = async (booking: Booking) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const newDateTime = new Date(`${rescheduleData.date}T${rescheduleData.time}`);
            const response = await fetch(`${API_BASE_URL}/appointments/reschedule/${booking.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    newTime: newDateTime.toISOString()
                })
            });

            if (!response.ok) {
                throw new Error('Failed to reschedule booking');
            }

            // Refresh bookings after successful reschedule
            await fetchBookings();
            setIsRescheduleModalOpen(false);
        } catch (err) {
            console.error('Error rescheduling booking:', err);
            setError(err instanceof Error ? err.message : 'Failed to reschedule booking');
        }
    };

    const handleCancel = async (bookingId: string) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${API_BASE_URL}/appointments/cancel/${bookingId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to cancel booking');
            }

            // Refresh bookings after successful cancellation
            await fetchBookings();
        } catch (err) {
            console.error('Error cancelling booking:', err);
            setError(err instanceof Error ? err.message : 'Failed to cancel booking');
        }
    };

    const filteredBookings = bookings.filter(booking => {
        const isMatchingStatus = activeTab === 'upcoming'
            ? (booking.status === 'pending' || booking.status === 'confirmed' || booking.status === 'rescheduled')
            : booking.status === 'completed';
        const searchTerm = searchQuery.toLowerCase();

        if (booking.type === 'doctor') {
            return isMatchingStatus && (
                searchTerm === '' ||
                booking.doctorName.toLowerCase().includes(searchTerm) ||
                booking.hospital.toLowerCase().includes(searchTerm)
            );
        } else {
            return isMatchingStatus && (
                searchTerm === '' ||
                booking.testName.toLowerCase().includes(searchTerm) ||
                booking.labName.toLowerCase().includes(searchTerm)
            );
        }
    });

    const openGoogleMaps = (coordinates: { lat: number; lng: number }) => {
        const url = `https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`;
        window.open(url, '_blank');
    };



    if (loading) {
        return (
            <div className="w-[97%] mx-auto mt-6 mb-8">
                <div className="bg-white rounded-lg p-6">
                    <div className="flex justify-center items-center min-h-[200px]">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-[97%] mx-auto mt-6 mb-8">
                <div className="bg-white rounded-lg p-6">
                    <div className="text-center py-8">
                        <div className="text-red-500 text-lg mb-2">⚠️</div>
                        <p className="text-gray-600">{error}</p>
                        <button
                            onClick={fetchBookings}
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="w-[97%] mx-auto mt-6 mb-8">
                <div className="bg-white rounded-lg p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <h2 className="text-2xl font-semibold text-gray-800">Your Appointments</h2>

                        <div className="relative w-full sm:w-64">
                            <input
                                type="text"
                                placeholder="Search appointments..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-2 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                            />
                            <svg className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    <div className="flex gap-4 mb-6">
                        <button
                            onClick={() => setActiveTab('upcoming')}
                            className={`px-4 py-2 rounded-full ${activeTab === 'upcoming'
                                ? 'bg-blue-100 text-blue-600'
                                : 'text-gray-500 hover:bg-gray-100'
                                }`}
                        >
                            Upcoming Appointments
                        </button>
                        <button
                            onClick={() => setActiveTab('completed')}
                            className={`px-4 py-2 rounded-full ${activeTab === 'completed'
                                ? 'bg-blue-100 text-blue-600'
                                : 'text-gray-500 hover:bg-gray-100'
                                }`}
                        >
                            Completed Appointments
                        </button>
                    </div>

                    <div className="space-y-4">
                        {filteredBookings.map(booking => (
                            <div key={booking.id} className="border border-gray-100 rounded-lg p-4 hover:border-gray-200">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    {booking.type === 'doctor' ? (
                                        <>
                                            <Image
                                                width={80}
                                                height={80}
                                                unoptimized
                                                src={booking.doctorImage}
                                                alt={booking.doctorName}
                                                className="w-20 h-20 sm:w-16 sm:h-16 rounded-full object-cover mx-auto sm:mx-0"
                                            />
                                            <div className="flex-1 space-y-3">
                                                <div className="text-center sm:text-left">
                                                    <h3 className="text-lg font-semibold text-gray-800">{booking.doctorName}</h3>
                                                    <p className="text-gray-600">{booking.qualification}</p>
                                                    <p className="text-gray-500 text-sm">{booking.specialization}</p>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                    </svg>
                                                    <span>{booking.hospital}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <span>{booking.date}</span>
                                                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span>{booking.time}</span>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-20 h-20 sm:w-16 sm:h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto sm:mx-0">
                                                <Image src={booking.testIcon} alt={booking.testName} className="w-8 h-8" />
                                            </div>
                                            <div className="flex-1 space-y-3">
                                                <div className="text-center sm:text-left">
                                                    <h3 className="text-lg font-semibold text-gray-800">{booking.testName}</h3>
                                                    <p className="text-gray-600">{booking.labName}</p>
                                                    <p className="text-gray-500 text-sm">
                                                        Sample Collection: {booking.sampleCollection === 'home' ? 'Home' : 'Lab'}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <span>{booking.date}</span>
                                                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span>{booking.time}</span>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* Action buttons */}
                                    <div className="mt-4 flex flex-col sm:flex-row justify-center sm:justify-end gap-3">
                                        {booking.status === 'pending' || booking.status === 'confirmed' || booking.status === 'rescheduled' ? (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        setSelectedBooking(booking);
                                                        setRescheduleData({
                                                            date: booking.date,
                                                            time: booking.time
                                                        });
                                                        setIsRescheduleModalOpen(true);
                                                    }}
                                                    className="w-full sm:w-auto px-4 py-2 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50"
                                                >
                                                    Reschedule
                                                </button>
                                                <button
                                                    onClick={() => handleCancel(booking.id)}
                                                    className="w-full sm:w-auto px-4 py-2 text-sm text-red-600 hover:text-red-700 border border-red-200 rounded-lg hover:bg-red-50"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() => openGoogleMaps(booking.coordinates)}
                                                    className="w-full sm:w-auto px-4 py-2 text-sm text-gray-600 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
                                                >
                                                    View Location
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => openGoogleMaps(booking.coordinates)}
                                                className="w-full sm:w-auto px-4 py-2 text-sm text-gray-600 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
                                            >
                                                View Location
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredBookings.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No appointments found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Reschedule Modal */}
            {isRescheduleModalOpen && selectedBooking && (
                <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-semibold">Reschedule Appointment</h3>
                            <button onClick={() => setIsRescheduleModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-700 mb-2">Date</label>
                                <input
                                    type="date"
                                    value={rescheduleData.date}
                                    onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2">Time</label>
                                <input
                                    type="time"
                                    value={rescheduleData.time}
                                    onChange={(e) => setRescheduleData({ ...rescheduleData, time: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setIsRescheduleModalOpen(false)}
                                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleReschedule(selectedBooking)}
                                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Confirm Reschedule
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default BookingsList