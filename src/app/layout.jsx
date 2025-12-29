import { ThemeProvider } from '@/context/ThemeContext';
import AppShell from '@/components/layout/AppShell';
import './globals.css';

export const metadata = {
    title: 'Hotel Management System',
    description: 'Sistema de gestión hotelera profesional',
    keywords: ['hotel', 'gestión', 'reservas', 'check-in', 'check-out'],
};

export default function RootLayout({ children }) {
    return (
        <html lang="es" suppressHydrationWarning>
            <body>
                <ThemeProvider>
                    <AppShell>{children}</AppShell>
                </ThemeProvider>
            </body>
        </html>
    );
}
