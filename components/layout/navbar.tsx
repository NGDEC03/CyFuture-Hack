'use client';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import { type FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'
import { useService } from '@/context/serviceProvider';
import { useSession } from '@/context/sessionProvider';
import { API_BASE_URL } from '../../services/api';

import { toast } from 'react-toastify';
import { Location, SearchResult } from '@/types/data';

const Navbar: FC = () => {
    const { serviceType, toggleService } = useService()
    const { user, isAuthenticated, logout } = useSession()
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
    const [profilePicture, setProfilePicture] = useState('/profile-placeholder.png')
    const [searchQuery, setSearchQuery] = useState('')
    const [isSearchFocused, setIsSearchFocused] = useState(false)
    const [searchResults, setSearchResults] = useState<SearchResult[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [userLocation, setUserLocation] = useState<Location | null>(null)
    const [isGettingLocation, setIsGettingLocation] = useState(false)
    const location = window.location;
    const isHomePage = location.pathname === '/';

    const navigate = (path: string) => {
        window.location.href = path;
    }

    useEffect(() => {
        if (isAuthenticated) {
            fetchUserProfile();
        }
    }, [isAuthenticated]);

    const fetchUserProfile = async () => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/auth/profile`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            if (response.data.profile?.picture) {
                setProfilePicture(response.data.profile.picture);
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        }
    };

    const handleProfileClick = () => {
        if (!isAuthenticated) {
            navigate('/signin')
        } else {
            setIsProfileMenuOpen(!isProfileMenuOpen)
        }
    }

    const handleLogout = () => {
        logout()
        setIsProfileMenuOpen(false)
        navigate('/signin')
    }

    const getCurrentLocation = () => {
        setIsGettingLocation(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    // Store coordinates and use a simple format for display
                    const location = {
                        lat: latitude,
                        lng: longitude,
                        address: `Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`
                    };
                    setUserLocation(location);
                    setSearchQuery(location.address);
                    handleSearch(location.address);
                    setIsGettingLocation(false);
                },
                (error) => {
                    console.error('Error getting location:', error);
                    toast.error('Failed to get your location');
                    setIsGettingLocation(false);
                }
            );
        } else {
            toast.error('Geolocation is not supported by your browser');
            setIsGettingLocation(false);
        }
    };

    const handleSearch = async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        try {
            let endpoint = '';
            const params = new URLSearchParams();

            if (userLocation) {
                params.append('lat', userLocation.lat.toString());
                params.append('lng', userLocation.lng.toString());
                params.append('radius', '10'); // 10km radius
            }

            if (serviceType === 'hospitals') {
                endpoint = `${API_BASE_URL}/search/hospitals?${params.toString()}&location=${encodeURIComponent(query)}`;
            } else {
                endpoint = `${API_BASE_URL}/search/labs?${params.toString()}&location=${encodeURIComponent(query)}`;
            }

            const response = await axios.get(endpoint);

            const results = response.data.map((item: any) => ({
                id: item.id,
                name: item.name,
                type: serviceType === 'hospitals' ? 'hospital' : 'lab',
                location: item.location?.address || item.hospital?.location?.address
            }));
            setSearchResults(results);
        } catch (error) {
            console.error('Search error:', error);
            toast.error('Failed to perform search');
        } finally {
            setIsSearching(false);
        }
    };

    const handleResultClick = (result: SearchResult) => {
        setSearchQuery('');
        setSearchResults([]);
        navigate(`/${result.type}/${result.id}`);
    };

    return (
        <nav className="hidden lg:block px-6 py-3 w-full">
            <div className="flex items-center">
                {/* Logo and tagline */}
                <div className="flex flex-col mr-6">
                    <div className="text-blue-600 font-semibold">
                        <Link href="/" className="flex items-center">
                            Book My
                            <span className="text-gray-700">Appointments</span>
                        </Link>
                    </div>
                    <span className="text-xs text-gray-500">Making Medical Appointments made easy</span>
                </div>

                {/* Search box */}
                <div className="relative flex-1 max-w-2xl">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white">
                        <button
                            onClick={getCurrentLocation}
                            className="text-blue-500 hover:text-blue-600 transition-colors"
                            title="Use my current location"
                        >
                            {isGettingLocation ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 100 4z" clipRule="evenodd" />
                                </svg>
                            )}
                        </button>
                        <input
                            type="text"
                            placeholder={`Search ${serviceType} in your area...`}
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                handleSearch(e.target.value);
                            }}
                            onFocus={() => setIsSearchFocused(true)}
                            className="bg-transparent outline-none w-full text-gray-600 placeholder-gray-400"
                        />
                        {isSearching ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                        )}
                    </div>

                    {/* Search Results Dropdown */}
                    {isSearchFocused && searchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50">
                            {searchResults.map((result) => (
                                <button
                                    key={result.id}
                                    onClick={() => handleResultClick(result)}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex flex-col"
                                >
                                    <span className="font-medium text-gray-900">{result.name}</span>
                                    {result.location && (
                                        <span className="text-sm text-gray-500">{result.location}</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Toggle buttons - only show on home page */}
                {isHomePage && (
                    <div className="flex items-center bg-white rounded-full shadow-sm mr-6">
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
                )}

                {/* Profile Section */}
                <div className="relative ml-auto">
                    <button
                        onClick={handleProfileClick}
                        className="flex items-center gap-2 bg-[#F3F3F3] rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <div className="w-8 h-8 rounded-full bg-gray-200 m-1 overflow-hidden">
                            <Image
                                height={32}
                                width={32}
                                unoptimized
                                src={profilePicture}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <span className="text-black font-semibold mx-2">
                            {isAuthenticated ? user?.name : 'Sign In'}
                        </span>
                    </button>

                    <AnimatePresence>
                        {isProfileMenuOpen && isAuthenticated && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50"
                            >
                                <Link
                                    href="/profile"
                                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                    onClick={() => setIsProfileMenuOpen(false)}
                                >
                                    Profile Settings
                                </Link>
                                <Link
                                    href="/bookings"
                                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                    onClick={() => setIsProfileMenuOpen(false)}
                                >
                                    My Bookings
                                </Link>
                                <Link
                                    href="/health-records"
                                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                    onClick={() => setIsProfileMenuOpen(false)}
                                >
                                    Health Records
                                </Link>
                                <Link
                                    href="/help"
                                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                    onClick={() => setIsProfileMenuOpen(false)}
                                >
                                    Help & Support
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                                >
                                    Sign Out
                                </button>

                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;