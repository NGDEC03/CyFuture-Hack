import type { FC } from 'react';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useService } from '@/context/serviceProvider';

type PreventScrollHandlers = {
    preventScroll: (e: Event) => void;
    preventScrollKeys: (e: KeyboardEvent) => void;
};

// Extend the window object
declare global {
    interface Window {
        _preventScroll?: PreventScrollHandlers;
    }
}

interface Category {
    id: string;
    name: string;
    icon: string;
    description: string;
}

interface CategoriesProps {
    onCategoryChange?: (category: string) => void;
    initialCategory?: string;
}

const Categories: FC<CategoriesProps> = ({ onCategoryChange, initialCategory }) => {
    const { serviceType } = useService()
    const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'Blood Test');
    const scrollRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        const onWheel = (e: WheelEvent) => {
            if (e.deltaY !== 0) {
                e.preventDefault();
                el.scrollLeft += e.deltaY * 2;
            }
        };

        el.addEventListener('wheel', onWheel, { passive: false });

        return () => {
            el.removeEventListener('wheel', onWheel);
        };
    }, []);

    useEffect(() => {
        // Update default category based on service type
        if (serviceType === 'labs') {
            setSelectedCategory(initialCategory || 'Blood Test');
        } else {
            setSelectedCategory(initialCategory || 'Cardiology');
        }
    }, [serviceType, initialCategory]);

    const handleCategorySelect = (categoryId: string) => {
        setSelectedCategory(categoryId);
        if (onCategoryChange) {
            onCategoryChange(categoryId);
        }
    };

    const hospitalCategories: Category[] = [
        {
            id: 'Cardiology',
            name: 'Cardiology',
            icon: '/icons/cat.png',
            description: 'Heart & Cardiovascular Care'
        },
        {
            id: 'Orthopedics',
            name: 'Orthopedics',
            icon: '/icons/cat.png',
            description: 'Bone & Joint Care'
        },
        {
            id: 'Neurology',
            name: 'Neurology',
            icon: '/icons/cat.png',
            description: 'Brain & Nervous System'
        },
        {
            id: 'Dermatology',
            name: 'Dermatology',
            icon: '/icons/cat.png',
            description: 'Skin & Hair Care'
        },
        {
            id: 'Pediatrics',
            name: 'Pediatrics',
            icon: '/icons/cat.png',
            description: 'Child Healthcare'
        },
        {
            id: 'Dentistry',
            name: 'Dentistry',
            icon: '/icons/cat.png',
            description: 'Dental Care'
        },
        {
            id: 'Gastroenterology',
            name: 'Gastroenterology',
            icon: '/icons/cat.png',
            description: 'Digestive System Care'
        },
        {
            id: 'Urology',
            name: 'Urology',
            icon: '/icons/cat.png',
            description: 'Urinary & Reproductive Health'
        }
    ];

    const labCategories: Category[] = [
        {
            id: 'Blood Test',
            name: 'Blood Tests',
            icon: '/icons/cat.png',
            description: 'Complete Blood Analysis'
        },
        {
            id: 'X-Ray',
            name: 'X-Ray',
            icon: '/icons/cat.png',
            description: 'X-Ray Imaging'
        },
        {
            id: 'MRI',
            name: 'MRI',
            icon: '/icons/cat.png',
            description: 'Magnetic Resonance Imaging'
        },
        {
            id: 'CT Scan',
            name: 'CT Scan',
            icon: '/icons/cat.png',
            description: 'Computed Tomography'
        },
        {
            id: 'Ultrasound',
            name: 'Ultrasound',
            icon: '/icons/cat.png',
            description: 'Ultrasound Imaging'
        },
        {
            id: 'ECG',
            name: 'ECG',
            icon: '/icons/cat.png',
            description: 'Electrocardiogram'
        }
    ];

    const categories = serviceType === 'hospitals' ? hospitalCategories : labCategories;

    return (
        <div className="w-full py-1.5 px-2 lg:py-3 lg:px-6">
            <div
                ref={scrollRef}
                className="flex overflow-x-auto gap-1.5 lg:gap-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth pb-1"
            >
                {categories.map((category) => (
                    <div
                        key={category.id}
                        onClick={() => handleCategorySelect(category.id)}
                        className={`flex items-center gap-1.5 lg:gap-2 p-1.5 lg:p-2 rounded-md lg:rounded-xl transition-all cursor-pointer shrink-0 w-[140px] lg:w-[200px]
                            ${selectedCategory === category.id
                                ? 'bg-[#0066FF] text-white'
                                : 'bg-[#F8F8F8] hover:bg-gray-100'
                            }`}
                    >
                        <div className={`w-5 h-5 lg:w-8 lg:h-8 flex items-center justify-center rounded-full p-1 lg:p-1.5
                            ${selectedCategory === category.id ? 'bg-white/20' : 'bg-white'}`}>
                            <Image
                                width={24}
                                height={24}
                                unoptimized
                                src={category.icon}
                                alt={category.name}
                                className={`w-2.5 h-2.5 lg:w-4 lg:h-4 object-contain ${selectedCategory === category.id ? 'brightness-0 invert' : ''}`}
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className={`text-xs lg:text-sm font-medium truncate ${selectedCategory === category.id ? 'text-white' : 'text-gray-800'}`}>
                                {category.name}
                            </h3>
                            <p className={`text-[8px] lg:text-[10px] truncate ${selectedCategory === category.id ? 'text-white/80' : 'text-gray-500'}`}>
                                {category.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Categories