"use client";

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

// Routes that should NOT show the sidebar
const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password'];

export default function AppShell({ children }) {
    const pathname = usePathname();

    // Check if current route is a public route (without sidebar)
    const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));

    if (isPublicRoute) {
        // Render without sidebar for public routes
        return <>{children}</>;
    }

    // Render with sidebar for protected routes
    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">{children}</main>
        </div>
    );
}
