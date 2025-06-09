'use client';
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { API_BASE_URL } from '@/services/api';
import { ApiResponse, ResendRequest, VerifyRequest } from '@/types/auth';
import { BirdLogo } from '../icons/bird';

const Verify: React.FC = () => {
    const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
    const [email,] = useState<string>(localStorage.getItem('email') || '');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [resendLoading, setResendLoading] = useState<boolean>(false);
    const [resendCooldown, setResendCooldown] = useState<number>(0);
    const [success, setSuccess] = useState<string>('');

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (resendCooldown > 0) {
            timer = setTimeout(() => {
                setResendCooldown(resendCooldown - 1);
            }, 1000);
        }
        return () => clearTimeout(timer);
    }, [resendCooldown]);

    const handleInputChange = (index: number, value: string): void => {
        if (!/^\d*$/.test(value)) return; // Only allow digits

        const newCode = [...code];
        newCode[index] = value.slice(-1); // Only take the last character
        setCode(newCode);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Clear error when user starts typing
        if (error) {
            setError('');
        }
    };

    useEffect(() => {
        localStorage.setItem('email', email);
    })

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }

        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>): void => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('Text');
        const digits = pasteData.replace(/\D/g, '').slice(0, 6);

        if (digits.length > 0) {
            const newCode = [...code];
            for (let i = 0; i < digits.length && i < 6; i++) {
                newCode[i] = digits[i];
            }
            setCode(newCode);

            // Focus the next empty input or the last one
            const nextEmptyIndex = newCode.findIndex(digit => !digit);
            const focusIndex = nextEmptyIndex === -1 ? 5 : Math.min(nextEmptyIndex, 5);
            inputRefs.current[focusIndex]?.focus();
        }
    };

    const handleSubmit = async (): Promise<void> => {
        const verificationCode = code.join('');

        if (verificationCode.length !== 6) {
            setError('Please enter the complete 6-digit code');
            return;
        }

        setLoading(true);
        setError('');

        const email = localStorage.getItem('email') || '';

        try {
            const requestData: VerifyRequest = {
                email: email,
                code: verificationCode
            };

            const response: Response = await fetch(`${API_BASE_URL}/auth/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });

            const data: ApiResponse = await response.json();

            if (response.ok) {
                console.log('Verification successful:', data);
                setSuccess('Email verified successfully!');
                window.localStorage.removeItem('email');
                window.location.href = '/signin';
            } else {
                setError(data.message || 'Verification failed. Please try again.');
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Network error. Please try again.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async (): Promise<void> => {
        if (resendCooldown > 0) return;

        setResendLoading(true);
        setError('');
        setSuccess('');

        try {
            const requestData: ResendRequest = {
                email: email
            };

            // Assuming there's a resend endpoint - you may need to adjust this
            const response: Response = await fetch(`${API_BASE_URL}/auth/resend`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });

            const data: ApiResponse = await response.json();

            if (response.ok) {
                setSuccess('Verification code sent successfully!');
                setResendCooldown(60); // 60 second cooldown
                setCode(['', '', '', '', '', '']); // Clear existing code
                inputRefs.current[0]?.focus(); // Focus first input
            } else {
                setError(data.message || 'Failed to resend code. Please try again.');
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Network error. Please try again.';
            setError(errorMessage);
        } finally {
            setResendLoading(false);
        }
    };

    const maskEmail = (email: string): string => {
        const [localPart, domain] = email.split('@');
        if (localPart.length <= 2) return email;

        const maskedLocal = localPart[0] + '*'.repeat(localPart.length - 2) + localPart[localPart.length - 1];
        return `${maskedLocal}@${domain}`;
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-8">
                <div className="flex items-center mb-6">
                    <button
                        onClick={() => window.location.href = '/signup'}
                        type="button"
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5 text-gray-600" />
                    </button>
                </div>

                <BirdLogo />

                <h1 className="text-2xl font-semibold text-center text-gray-900 mb-2">
                    Verify Your Email
                </h1>
                <p className="text-center text-gray-600 mb-8">
                    We&apos;ve sent a 6-digit verification code to<br />
                    <span className="font-medium text-gray-900">{maskEmail(email)}</span>
                </p>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                        {success}
                    </div>
                )}

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                        Enter Verification Code
                    </label>
                    <div className="flex justify-center gap-3">
                        {code.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => { inputRefs.current[index] = el }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleInputChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onPaste={handlePaste}
                                className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                autoComplete="off"
                            />
                        ))}
                    </div>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={loading || code.join('').length !== 6}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                >
                    {loading ? 'Verifying...' : 'Verify Email'}
                </button>

                <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">
                        Did&apos;t receive the code?
                    </p>
                    <button
                        onClick={handleResendCode}
                        disabled={resendLoading || resendCooldown > 0}
                        type="button"
                        className="text-blue-600 hover:text-blue-500 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {resendLoading
                            ? 'Sending...'
                            : resendCooldown > 0
                                ? `Resend code in ${resendCooldown}s`
                                : 'Resend code'
                        }
                    </button>
                </div>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Wrong email?{' '}
                        <button
                            onClick={() => window.location.href = '/auth/signup'}
                            type="button"
                            className="text-blue-600 hover:text-blue-500 font-medium"
                        >
                            Change email
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Verify;