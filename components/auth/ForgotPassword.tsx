import React, { useState } from 'react';
import ResetVerify from './ResetVerify';
import { API_BASE_URL } from '@/services/api';
import { BirdLogo } from '../icons/bird';
import { ApiResponse } from '@/types/auth';

const ForgotPassword: React.FC = () => {
    const [formData, setFormData] = useState<{ email: string }>({
        email: ''
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<boolean>(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;
        setFormData((prev: { email: string }) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const response: Response = await fetch(`${API_BASE_URL}/auth/reset-password/request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data: ApiResponse = await response.json();

            if (response.ok) {

                setSuccess(true);
            } else {
                setError(data.message || 'Failed to process request');
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Network error. Please try again.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };
    if (success) return (
        <ResetVerify email={formData.email} />
    )
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-8">
                <BirdLogo />

                <h1 className="text-2xl font-semibold text-center text-gray-900 mb-2">
                    Forgot Password
                </h1>
                <p className="text-center text-gray-600 mb-8">
                    Enter your email address and we&apos;ll send you a link to reset your password.
                </p>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                        Password reset link has been sent to your email address.
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="johndoe@gmail.com"
                            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-600">
                    Remember your password?{' '}
                    <button
                        onClick={() => window.location.href = '/auth/signin'}
                        type="button"
                        className="text-blue-600 hover:text-blue-500 font-medium"
                    >
                        Back to Sign In
                    </button>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;