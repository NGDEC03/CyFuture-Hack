import { Doctor } from '@/types/doctor';
import Image from 'next/image';
import { useState } from 'react';
interface Props {
    doctors: Doctor[];
}

const DoctorsList = ({ doctors }: Props) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;
    const totalPages = Math.ceil(doctors.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const displayedDoctors = doctors.slice(startIndex, startIndex + itemsPerPage);

    const navigate = (path: string) => {
        window.location.href = path;
    }

    const handleDoctorClick = (doctorId: string) => {
        navigate(`/doctor/${doctorId}`);
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-4 lg:gap-6 px-2 lg:px-6 w-full lg:grid-cols-3">
                {displayedDoctors.map((doctor : Doctor) => (
                    <div
                        key={doctor.id}
                        onClick={() => handleDoctorClick(doctor.id)}
                        className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                    >
                        <div className="flex gap-3 lg:gap-4 items-start">
                            <Image
                                width={80}
                                height={80}
                                unoptimized
                                src={doctor.user?.profile || '/images/placeholder.png'}
                                alt={doctor.user?.name || 'Doctor Image'}
                                className="w-16 h-16 lg:w-20 lg:h-20 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                                <h3 className="text-gray-800 font-semibold text-base lg:text-lg">{doctor.user?.name}</h3>
                                <p className="text-gray-500 text-xs lg:text-sm mt-0.5">
                                    {doctor.qualifications}
                                </p>
                                <p className="text-gray-500 text-xs lg:text-sm">
                                    {doctor.specialization}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 mt-4 px-3 py-2.5 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-1.5">
                                <span className="text-gray-800 font-medium">{doctor.ratings}</span>
                                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span className="text-gray-500 text-sm">Rating</span>
                            </div>
                            <div>
                                <span className="text-gray-800 font-medium">{doctor.patientsCount}</span>
                                <span className="text-gray-500 text-sm ml-1.5">Patients</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center pb-4 items-center gap-2">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`w-8 h-8 text-sm rounded-lg flex items-center justify-center ${currentPage === page
                                    ? 'bg-blue-500 text-white'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default DoctorsList;