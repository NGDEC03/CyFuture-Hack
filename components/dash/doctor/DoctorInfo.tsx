import { useState } from 'react'
import type { FC } from 'react'
import BookingForm from '../booking/BookingForm';
import { Doctor } from '@/types/doctor';

interface DoctorInfoProps {
    doctor: Doctor
}

const DoctorInfo: FC<DoctorInfoProps> = ({ doctor }) => {
    console.log(doctor);

    const [activeTab, setActiveTab] = useState<'about' | 'reviews' | 'others'>('about');
    const [pageShow, setPageShow] = useState(false);
    if (pageShow) {
        return <BookingForm doctor={doctor} />
    }
    return (
        <div className="w-[97%] mx-auto mt-6">
            <div className="flex flex-col lg:flex-row gap-6 min-h-[600px]">
                {/* Left Section */}
                <div className="lg:w-[70%] bg-white rounded-lg p-4">
                    {/* Tabs */}
                    <div className="flex gap-4">
                        {['about', 'reviews', 'others'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`px-4 py-2 rounded-full ${activeTab === tab ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'
                                    }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>

                    <div className="mt-6">
                        {activeTab === 'about' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800">About Doctor</h3>
                                    <p className="mt-2 text-gray-600">{doctor.about}</p>
                                </div>

                                <div>
                                    <h4 className="text-md font-semibold text-gray-800">Specializations</h4>
                                    <ul className="mt-2 text-gray-600 list-disc list-inside">
                                        {doctor.specialization.map((spec: string) => <li key={spec}>{spec}</li>)}
                                    </ul>
                                </div>

                                <div>
                                    <h4 className="text-md font-semibold text-gray-800">Qualifications</h4>
                                    <ul className="mt-2 text-gray-600 list-disc list-inside">
                                        {doctor.qualifications.map((q: string) => <li key={q}>{q}</li>)}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {activeTab === 'reviews' && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-800">Patient Reviews</h3>
                                {doctor.reviews.map((review: any) => (
                                    <div key={review.id} className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <span className="text-yellow-400">{'★'.repeat(review.rating)}</span>
                                            <span className="font-medium">{review.comment}</span>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">- {review.user?.name || 'Anonymous'}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'others' && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-800">Availability</h3>
                                {doctor.availability.map((slot: any) => (
                                    <div key={slot.id} className="text-gray-600">
                                        {slot.day}: {slot.startTime} - {slot.endTime}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Section */}
                <div className="lg:w-[30%]">
                    <div className="bg-white rounded-lg p-4 sticky top-4">
                        <h3 className="text-lg font-semibold text-gray-800">Book Appointment</h3>
                        <p className="text-gray-600 mt-2">Consultation Fee</p>
                        <p className="text-2xl font-semibold text-blue-600">₹{doctor.price}</p>
                        <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700" onClick={() => setPageShow(true)}>
                            Book Appointment
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorInfo