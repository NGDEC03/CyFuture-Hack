import { createContext, useContext, useState } from 'react';
import type { ReactNode } from'react';

type ServiceType = 'hospitals' | 'labs';

interface ServiceContextType {
    serviceType: ServiceType;
    toggleService: () => void;
}

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

export const ServiceProvider = ({ children }: { children: ReactNode }) => {
    const [serviceType, setServiceType] = useState<ServiceType>('hospitals');

    const toggleService = () => {
        setServiceType(prev => prev === 'hospitals' ? 'labs' : 'hospitals');
    };

    return (
        <ServiceContext.Provider value={{ serviceType, toggleService }}>
            {children}
        </ServiceContext.Provider>
    );
};

export const useService = () => {
    const context = useContext(ServiceContext);
    if (!context) {
        throw new Error('useService must be used within a ServiceProvider');
    }
    return context;
};