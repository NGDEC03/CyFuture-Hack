import { Doctor } from '@/types/doctor';
import { type FC, useState } from 'react';

export const DoctorBanner: FC<{ doctor: Doctor }> = ({ doctor }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="relative w-[97%] mx-auto h-[400px] bg-[#EEF4FF] rounded-lg py-4 px-4">
            <div className="flex flex-col sm:flex-row h-full sm:items-center">
                <div className="flex-1 sm:pr-[300px] z-10">
                    <span className="text-gray-500 text-sm">{doctor.specialization?.join(', ')}</span>
                    <h1 className="text-2xl font-semibold text-gray-800 mt-1">
                        Dr. {doctor?.user?.name}
                    </h1>
                    <p className="text-gray-600 mt-1">{doctor.qualifications?.join(', ')}</p>

                    <p className="text-gray-500 mt-4 text-sm">
                        {isExpanded ? doctor.about : `${doctor.about?.slice(0, 100)}...`}
                        <button onClick={() => setIsExpanded(!isExpanded)} className="text-blue-500 ml-1">
                            {isExpanded ? 'see less' : 'see more'}
                        </button>
                    </p>

                    <div className="text-xl font-semibold text-blue-600 mt-4">
                        ₹ {doctor.price} <span className="text-sm text-gray-500">/session</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
