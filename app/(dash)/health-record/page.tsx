'use client';
import { useState, useEffect, useRef } from 'react';
import type { FC } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@/services/api';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';

interface MedicalRecord {
    id: string;
    userId: string;
    history: string[];
    documents: string[];
}

const HealthRecordsList: FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [records, setRecords] = useState<MedicalRecord[]>([]);
    const [loading, setLoading] = useState(false)
    const [selectedRecord, setSelectedRecord] = useState<string>('');
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchMedicalRecords = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const res = await axios.get(`${API_BASE_URL}/auth/documents`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log(res.data);

            setRecords(res.data.medicalRecord || []);
        } catch (error) {
            console.error('Error fetching medical records:', error);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0 || !selectedRecord) return;

        for (let i = 0; i < files.length; i++) {
            const formData = new FormData();
            formData.append('file', files[i]);
            formData.append('recordId', selectedRecord);

            try {
                setLoading(true)
                await axios.post(
                    `${API_BASE_URL}/file-upload/upload`,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            Authorization: `Bearer ${localStorage.getItem('token')}`,
                        },
                    }
                );

                // Refresh records after upload
                fetchMedicalRecords();
            } catch (err) {
                console.error(`Upload failed for ${files[i].name}:`, err);
                toast.error('Failed to upload file');
            }
            finally {
                setLoading(false)
            }
        }

        if (fileInputRef.current) fileInputRef.current.value = '';
        setIsUploadModalOpen(false);
        setSelectedRecord('');
    };

    // const formatFileSize = (bytes: number): string => {
    //     if (bytes === 0) return '0 Bytes';
    //     const k = 1024;
    //     const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    //     const i = Math.floor(Math.log(bytes) / Math.log(k));
    //     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    // };

    const handleDelete = async (recordId: string, fileUrl: string) => {
        try {
            console.log('', recordId);
            const token = localStorage.getItem('token');
            if (!token) return;

            await axios.delete(
                `${API_BASE_URL}/auth/documents/${encodeURIComponent(fileUrl)}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            // Refresh records after deletion
            fetchMedicalRecords();
        } catch (error) {
            console.error('Error deleting document:', error);
            toast.error('Failed to delete document');
        }
    };

    const filteredRecords = records.filter(record =>
        record.history.some(entry => entry.toLowerCase().includes(searchQuery.toLowerCase())) ||
        record.documents.some(doc => doc.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    useEffect(() => {
        fetchMedicalRecords();
    }, []);
    if (loading) return (
        <Loader2 className='animate-spin text-blue-800 scale-150 absolute top-1/3 left-1/2'></Loader2>
    )
    return (
        <div className="w-[97%] mx-auto mt-6 mb-8">
            <div className="bg-white rounded-lg p-4 md:p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800">Medical Records</h2>

                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <input
                                type="text"
                                placeholder="Search records..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-2 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                            />
                            <svg className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        <div className="flex-shrink-0">
                            <button
                                onClick={() => setIsUploadModalOpen(true)}
                                className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Upload Files
                            </button>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {filteredRecords.map((record) => (
                        <div key={record.id} className="border border-gray-100 rounded-lg p-4 hover:border-gray-200">
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">Medical Record #{record.id.slice(0, 8)}</h3>
                                {record.history.length > 0 && (
                                    <div className="mt-2">
                                        <h4 className="text-sm font-medium text-gray-700">History</h4>
                                        <ul className="mt-1 space-y-1">
                                            {record.history.map((entry, index) => (
                                                <li key={index} className="text-sm text-gray-600">{entry}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                {record.documents.map((docUrl, index) => {
                                    const fileName = decodeURIComponent(docUrl.split('/').pop() || `Document-${index + 1}`);
                                    return (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-800">{fileName}</h4>
                                                <p className="text-xs text-gray-500">
                                                    Uploaded on {new Date().toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => window.open(docUrl, '_blank')}
                                                    className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 rounded hover:bg-blue-50"
                                                >
                                                    View
                                                </button>
                                                <a
                                                    href={docUrl}
                                                    download={fileName}
                                                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-700 border border-gray-200 rounded hover:bg-gray-50"
                                                >
                                                    Download
                                                </a>
                                                <button
                                                    onClick={() => handleDelete(record.id, docUrl)}
                                                    className="px-3 py-1 text-sm text-red-600 hover:text-red-700 border border-red-200 rounded hover:bg-red-50"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {filteredRecords.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No medical records found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Upload Modal */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Upload Files</h3>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Medical Record
                            </label>
                            <select
                                value={selectedRecord}
                                onChange={(e) => setSelectedRecord(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                                <option value="">Select a record</option>
                                {records.map((record) => (
                                    <option key={record.id} value={record.id}>
                                        Record #{record.id.slice(0, 8)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setIsUploadModalOpen(false);
                                    setSelectedRecord('');
                                }}
                                className="px-4 py-2 text-gray-600 hover:text-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={!selectedRecord}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
                            >
                                Choose Files
                            </button>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            onChange={handleFileUpload}
                            className="hidden"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default HealthRecordsList;
