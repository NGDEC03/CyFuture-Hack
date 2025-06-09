'use client';
import type { FC } from 'react'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useService } from '@/context/serviceProvider'
import Link from 'next/link'
import Image from 'next/image'

// Remove MobileNavbarProps as we'll use context instead
const MobileNavbar: FC = () => {
    const { serviceType, toggleService } = useService()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const location = window.location;
    const isHomePage = location.pathname === '/'

    // Add click outside handler
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (isMobileMenuOpen && !target.closest('.mobile-menu-content')) {
                setIsMobileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMobileMenuOpen]);

    return (
        <>
            <nav className="block lg:hidden px-3 py-2 w-full bg-white">
                <div className="flex flex-col gap-3">
                    {/* Top Bar */}
                    <div className="flex items-center justify-between">
                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-600 p-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        <div className="flex items-center">
                            <span className="text-gray-700 text-xs">Good Evening, </span>
                            <span className="text-blue-600 font-semibold text-xs ml-0.5">Rachana!</span>
                        </div>

                        <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden">
                            <Image
                                src="/profile-placeholder.png"
                                alt="Profile"
                                width={100}
                                unoptimized
                                height={100}
                                className="w-full h-full object-cover" />
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 w-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 100 4z" clipRule="evenodd" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Gachibowli, Hyderabad"
                            className="bg-transparent outline-none w-full text-sm text-gray-600 placeholder-gray-400"
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
            </nav>

            {/* Floating Toggle Buttons - only show on home page */}
            {isHomePage && (
                <div className="fixed bottom-6 right-6 lg:hidden z-30">
                    <div className="flex items-center bg-white rounded-full shadow-sm">
                        <motion.div className="relative flex items-center rounded-full">
                            <button
                                onClick={toggleService}
                                className="flex items-center gap-1 px-4 pr-2 py-2 z-10 h-12"
                            >
                                <motion.div
                                    className={`flex items-center justify-center ${serviceType === 'hospitals' ? 'bg-blue-500' : ''}`}
                                    initial={false}
                                    animate={{
                                        padding: serviceType === 'hospitals' ? 8 : 0,
                                        borderRadius: serviceType === 'hospitals' ? 9999 : 0
                                    }}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                >
                                    <motion.img
                                        src={serviceType === 'hospitals' ? '/icons/hospital-white.png' : '/icons/hospital-gray.png'}
                                        alt="Hospital"
                                        className="w-5 h-5"
                                        animate={{ scale: serviceType === 'hospitals' ? 1.1 : 1 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                </motion.div>
                                <motion.span
                                    className="text-gray-600"
                                    initial={false}
                                    animate={{
                                        opacity: serviceType !== 'hospitals' ? 1 : 0,
                                        width: serviceType !== 'hospitals' ? 'auto' : 0
                                    }}
                                    transition={{ duration: 0.2 }}
                                >
                                    Hospitals
                                </motion.span>
                            </button>
                            <button
                                onClick={toggleService}
                                className="flex items-center gap-1 px-4 pl-0 py-2 z-10 h-12"
                            >
                                <motion.div
                                    className={`flex items-center justify-center ${serviceType === 'labs' ? 'bg-blue-500' : ''}`}
                                    initial={false}
                                    animate={{
                                        padding: serviceType === 'labs' ? 8 : 0,
                                        borderRadius: serviceType === 'labs' ? 9999 : 0
                                    }}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                >
                                    <motion.img
                                        src={serviceType === 'labs' ? '/icons/lab-white.png' : '/icons/lab-gray.png'}
                                        alt="Lab"
                                        className="w-5 h-5"
                                        animate={{ scale: serviceType === 'labs' ? 1.1 : 1 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                </motion.div>
                                <motion.span
                                    className="text-gray-600"
                                    initial={false}
                                    animate={{
                                        opacity: serviceType !== 'labs' ? 1 : 0,
                                        width: serviceType !== 'labs' ? 'auto' : 0
                                    }}
                                    transition={{ duration: 0.2 }}
                                >
                                    Labs
                                </motion.span>
                            </button>
                        </motion.div>
                    </div>
                </div>
            )}

            {/* Mobile Menu Slide-out */}
            {isMobileMenuOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
                >
                    <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="mobile-menu-content bg-white w-[80%] max-w-[280px] h-full p-4"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <motion.h2
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-lg font-semibold text-gray-800"
                            >
                                Menu
                            </motion.h2>
                            <motion.button
                                initial={{ opacity: 0, rotate: -90 }}
                                animate={{ opacity: 1, rotate: 0 }}
                                transition={{ delay: 0.3 }}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </motion.button>
                        </div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="flex flex-col space-y-4"
                        >
                            <Link
                                href="/profile"
                                className="text-gray-700 hover:text-blue-600 transition-colors"
                            >
                                Profile Settings
                            </Link>
                            <Link
                                href="/bookings"
                                className="text-gray-700 hover:text-blue-600 transition-colors"
                            >
                                Recent Bookings
                            </Link>
                            <Link
                                href="/health-records"
                                className="text-gray-700 hover:text-blue-600 transition-colors"
                            >
                                My Health Records
                            </Link>
                            <Link
                                href="/help"
                                className="text-gray-700 hover:text-blue-600 transition-colors"
                            >
                                Help & Support
                            </Link>
                            <div className="h-px bg-gray-200 my-2" />
                            <button
                                className="text-left text-red-600 hover:text-red-700 transition-colors"
                                onClick={() => {/* Add logout logic */ }}
                            >
                                Sign Out
                            </button>
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </>
    )
}

export default MobileNavbar