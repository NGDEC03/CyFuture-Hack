import type { FC } from 'react'

interface SuccessPopupProps {
    isVisible: boolean;
    type?: 'doctor' | 'test';
}

const SuccessPopup: FC<SuccessPopupProps> = ({ isVisible, type = 'doctor' }) => {
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-white/30">
            <div className="bg-white rounded-lg p-6 flex flex-col items-center max-w-sm mx-4 shadow-xl">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Booking Confirmed!</h3>
                <p className="text-gray-600 text-center">
                    Your {type === 'doctor' ? 'appointment' : 'test'} has been scheduled successfully.
                </p>
            </div>
        </div>
    )
}

export default SuccessPopup