"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    BedDouble,
    DollarSign,
    UserPlus,
    Users,
    LogOut,
    CreditCard,
    CalendarCheck,
    Sparkles,
    BarChart3,
    Settings,
    User,
    Menu,
    X,
    Hotel,
    Sun,
    Moon
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import './Sidebar.css';

function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const pathname = usePathname();

    const menuItems = [
        {
            section: 'Principal', items: [
                { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
                { path: '/habitaciones', icon: BedDouble, label: 'Habitaciones' },
                { path: '/precios', icon: DollarSign, label: 'Precios' },
            ]
        },
        {
            section: 'Operaciones', items: [
                { path: '/checkin', icon: UserPlus, label: 'Check-in' },
                { path: '/checkout', icon: LogOut, label: 'Check-out' },
                { path: '/huespedes', icon: Users, label: 'Huéspedes' },
                { path: '/pagos', icon: CreditCard, label: 'Pagos' },
                { path: '/reservas', icon: CalendarCheck, label: 'Reservas' },
                { path: '/limpieza', icon: Sparkles, label: 'Limpieza' },
                { path: '/reportes', icon: BarChart3, label: 'Reportes' },
            ]
        },
        {
            section: 'Sistema', items: [
                { path: '/usuarios', icon: User, label: 'Usuarios' },
                { path: '/configuracion', icon: Settings, label: 'Configuración' },
            ]
        },
    ];

    const isActive = (path) => {
        if (path === '/') {
            return pathname === '/';
        }
        return pathname.startsWith(path);
    };

    return (
        <>
            <button
                className="mobile-menu-btn"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {isOpen && (
                <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />
            )}

            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-logo">
                    <div className="logo-icon">
                        <Hotel size={22} />
                    </div>
                    <div className="logo-text">
                        <span className="logo-title">Hotel Demo</span>
                        <span className="logo-subtitle">Management System</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((section) => (
                        <div key={section.section} className="nav-section">
                            <span className="nav-section-title">{section.section}</span>
                            {section.items.map((item) => (
                                <Link
                                    key={item.path}
                                    href={item.path}
                                    className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                                    onClick={() => setIsOpen(false)}
                                >
                                    <span className="nav-icon">
                                        <item.icon size={18} />
                                    </span>
                                    <span className="nav-label">{item.label}</span>
                                </Link>
                            ))}
                        </div>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="theme-section">
                        <button
                            className="theme-toggle"
                            onClick={toggleTheme}
                            title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                        >
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        <span className="theme-label">
                            {theme === 'dark' ? 'Modo Oscuro' : 'Modo Claro'}
                        </span>
                    </div>
                    <div className="user-profile">
                        <div className="avatar">
                            AD
                        </div>
                        <div className="user-info">
                            <span className="user-name">Admin</span>
                            <span className="user-role">Administrador</span>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;
