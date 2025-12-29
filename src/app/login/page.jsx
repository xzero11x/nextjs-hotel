"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, Building2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import './login.css';

export default function LoginPage() {
    const router = useRouter();
    const supabase = createClient();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) {
                if (authError.message === 'Invalid login credentials') {
                    setError('Email o contraseña incorrectos');
                } else {
                    setError(authError.message);
                }
                return;
            }

            // Redirect to dashboard on success
            router.push('/');
            router.refresh();
        } catch (err) {
            setError('Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                {/* Left side - Branding */}
                <div className="login-branding">
                    <div className="branding-content">
                        <div className="brand-logo">
                            <Building2 size={48} />
                        </div>
                        <h1 className="brand-title">Hotel Management</h1>
                        <p className="brand-subtitle">
                            Sistema integral de gestión hotelera
                        </p>
                        <div className="brand-features">
                            <div className="feature">
                                <span className="feature-dot"></span>
                                <span>Gestión de habitaciones</span>
                            </div>
                            <div className="feature">
                                <span className="feature-dot"></span>
                                <span>Check-in / Check-out</span>
                            </div>
                            <div className="feature">
                                <span className="feature-dot"></span>
                                <span>Facturación electrónica</span>
                            </div>
                            <div className="feature">
                                <span className="feature-dot"></span>
                                <span>Reportes en tiempo real</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right side - Login form */}
                <div className="login-form-container">
                    <div className="login-form-wrapper">
                        <div className="login-header">
                            <h2>Bienvenido</h2>
                            <p>Ingresa tus credenciales para continuar</p>
                        </div>

                        <form onSubmit={handleLogin} className="login-form">
                            {error && (
                                <div className="login-error">
                                    {error}
                                </div>
                            )}

                            <div className="form-group">
                                <label htmlFor="email" className="form-label">
                                    Correo electrónico
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    className="form-input"
                                    placeholder="usuario@hotel.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="password" className="form-label">
                                    Contraseña
                                </label>
                                <div className="password-input-wrapper">
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        className="form-input"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-login"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={18} className="spinner" />
                                        Ingresando...
                                    </>
                                ) : (
                                    <>
                                        <LogIn size={18} />
                                        Iniciar Sesión
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="login-footer">
                            <p>Sistema de uso exclusivo para personal autorizado</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
