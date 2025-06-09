import { SessionProvider } from '@/context/sessionProvider';
import { ThemeProvider } from '@/context/themeProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Navbar from '@/components/layout/navbar';
import MobileNavbar from '@/components/layout/mobile-navbar';

export default async function Provider({ children }: { children: React.ReactNode }) {
    const client = new QueryClient();
    return (
        <QueryClientProvider client={client}>
            <SessionProvider>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="light"
                    disableTransitionOnChange
                >
                    <div className="flex flex-col min-h-screen w-full overflow-x-hidden">

                        <div className="block lg:hidden sticky top-0 z-30 bg-white">
                            <MobileNavbar />
                        </div>
                        <div className="hidden lg:block">
                            <Navbar />
                        </div>
                        {children}
                    </div>
                </ThemeProvider>
            </SessionProvider >
        </QueryClientProvider>
    );
}