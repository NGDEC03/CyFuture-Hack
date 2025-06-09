import type { FC } from 'react'
import { useState } from 'react'
import { useService } from '@/context/serviceProvider'
import Image from 'next/image';
import { FacilityBannerProps } from '@/types/dash';

export const FacilityBanner: FC<FacilityBannerProps> = ({ name, description, metrics }) => {
    const { serviceType } = useService()
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className={`relative transition-all duration-300 w-full px-3 sm:px-4 lg:px-6 ${isExpanded
                ? 'h-[240px] sm:h-[260px] md:h-[300px] lg:h-[340px]'
                : 'h-[180px] sm:h-[200px] md:h-[240px] lg:h-[280px]'
            }`}>
            <div className="absolute inset-0 mx-3 sm:mx-4 lg:mx-6">
                <Image
                    width={1920}
                    height={1080}
                    unoptimized
                    src={serviceType === 'hospitals' ? '/banners/hospital-banner.jpg' : '/banners/lab-banner.jpg'}
                    alt={`${serviceType === 'hospitals' ? 'Hospital' : 'Lab'} Banner`}
                    className="w-full h-full object-cover rounded-xl sm:rounded-2xl lg:rounded-3xl"
                />
                <div className="absolute inset-0 bg-black/40 rounded-xl sm:rounded-2xl lg:rounded-3xl" />
            </div>

            <div className="relative h-full max-w-7xl mx-auto flex flex-col justify-center py-3 sm:py-4 lg:py-6 px-6 sm:px-8 lg:px-10">
                <div className="space-y-2 sm:space-y-3 lg:space-y-4">
                    <h1 className="text-xl sm:text-2xl lg:text-4xl font-semibold text-white">
                        {name}
                    </h1>
                </div>

                <div className="max-w-3xl">
                    <p className={`text-white/90 text-xs sm:text-sm lg:text-base mb-1 sm:mb-2 relative ${isExpanded ? '' : 'line-clamp-2'
                        }`}>
                        {description}
                    </p>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-blue-300 hover:text-blue-200 text-xs sm:text-sm lg:text-base font-medium"
                    >
                        {isExpanded ? 'Show less' : 'See more'}
                    </button>
                </div>

                <div className="flex flex-wrap gap-1.5 sm:gap-3 lg:gap-4 mt-2 sm:mt-3 lg:mt-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-1.5 sm:p-3 lg:p-4 min-w-[70px] sm:min-w-[90px] lg:min-w-[100px]">
                        <div className="text-base sm:text-2xl lg:text-3xl font-semibold text-white">{metrics.rating}</div>
                        <div className="text-[9px] sm:text-xs lg:text-sm text-white/80">Rating</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-1.5 sm:p-3 lg:p-4 min-w-[70px] sm:min-w-[90px] lg:min-w-[100px]">
                        <div className="text-base sm:text-2xl lg:text-3xl font-semibold text-white">{metrics.patientsCount}</div>
                        <div className="text-[9px] sm:text-xs lg:text-sm text-white/80">Patients served</div>
                    </div>
                    {serviceType === 'hospitals' ? (
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-1.5 sm:p-3 lg:p-4 min-w-[70px] sm:min-w-[90px] lg:min-w-[100px]">
                            <div className="text-base sm:text-2xl lg:text-3xl font-semibold text-white">{metrics.doctorsCount}</div>
                            <div className="text-[9px] sm:text-xs lg:text-sm text-white/80">Doctors</div>
                        </div>
                    ) : (
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-1.5 sm:p-3 lg:p-4 min-w-[70px] sm:min-w-[90px] lg:min-w-[100px]">
                            <div className="text-base sm:text-2xl lg:text-3xl font-semibold text-white">{metrics.testsCount}</div>
                            <div className="text-[9px] sm:text-xs lg:text-sm text-white/80">Tests Available</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}