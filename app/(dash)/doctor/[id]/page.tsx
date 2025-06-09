'use client';

import { useParams } from 'next/navigation';
import { type FC, useEffect, useState } from 'react';
import { DoctorBanner } from "@/components/dash/doctor/DoctorBanner"
import DoctorInfo from '@/components/dash/doctor/DoctorInfo';
import { API_BASE_URL } from '@/services/api';

const DoctorDetails: FC = () => {
    const { id } = useParams();
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        const fetchDoctor = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/doctors/get/${id}`);
                const data = await res.json();
                console.log(data);

                setDoctor(data);
            } catch (err) {
                console.error('Error fetching doctor data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDoctor();
    }, [id]);

    if (loading) return <div className="text-center mt-10">Loading...</div>;
    if (!doctor) return <div className="text-center mt-10">Doctor not found</div>;

    return (
        <div className="min-h-screen flex flex-col">
            <DoctorBanner doctor={doctor} />
            <DoctorInfo doctor={doctor} />
        </div>
    );
};

export default DoctorDetails;
