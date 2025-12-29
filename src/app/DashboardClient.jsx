"use client";

import { useRouter } from 'next/navigation';
import {
    BedDouble,
    Users,
    DollarSign,
    TrendingUp,
    ArrowUpRight,
    AlertTriangle,
    Clock,
    UserCheck,
    UserX,
    CalendarCheck,
    Sparkles,
    RefreshCw
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import './Dashboard.css';

const COLORS = ['#22c55e', '#ef4444', '#f59e0b', '#a855f7'];

function Dashboard({ initialData = {} }) {
    const router = useRouter();

    const {
        habitaciones = {},
        ocupacion = 0,
        ingresos = {},
        estadisticas = {},
        acciones = {},
        grafico = []
    } = initialData;

    const roomPieData = [
        { name: 'Disponibles', value: habitaciones.disponibles || 0, color: '#22c55e' },
        { name: 'Ocupadas', value: habitaciones.ocupadas || 0, color: '#ef4444' },
        { name: 'Limpieza', value: habitaciones.limpieza || 0, color: '#f59e0b' },
        { name: 'Mantenimiento', value: habitaciones.mantenimiento || 0, color: '#a855f7' }
    ].filter(d => d.value > 0);

    const navigateTo = (path) => {
        router.push(path);
    };

    return (
        <div className="dashboard">
            {/* Header */}
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">Dashboard</h1>
                    <p className="dashboard-subtitle">
                        {new Date().toLocaleDateString('es-PE', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                </div>
                <button className="btn btn-secondary" onClick={() => router.refresh()}>
                    <RefreshCw size={18} />
                    Actualizar
                </button>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card" onClick={() => navigateTo('/habitaciones')}>
                    <div className="stat-icon blue">
                        <BedDouble size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{habitaciones.disponibles || 0}</span>
                        <span className="stat-label">Disponibles</span>
                    </div>
                    <div className="stat-trend neutral">
                        de {habitaciones.total || 0}
                    </div>
                </div>

                <div className="stat-card" onClick={() => navigateTo('/huespedes')}>
                    <div className="stat-icon green">
                        <Users size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{estadisticas.huespedes_activos || 0}</span>
                        <span className="stat-label">Huéspedes Activos</span>
                    </div>
                </div>

                <div className="stat-card" onClick={() => navigateTo('/pagos')}>
                    <div className="stat-icon emerald">
                        <DollarSign size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">S/ {(ingresos.hoy || 0).toFixed(0)}</span>
                        <span className="stat-label">Ingresos Hoy</span>
                    </div>
                    <div className="stat-trend positive">
                        <ArrowUpRight size={16} />
                        Semana: S/ {(ingresos.semana || 0).toFixed(0)}
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon purple">
                        <TrendingUp size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{ocupacion}%</span>
                        <span className="stat-label">Ocupación</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="dashboard-content">
                {/* Left Column */}
                <div className="dashboard-main">
                    {/* Revenue Chart */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Ingresos de la Semana</h3>
                        </div>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height={250}>
                                <AreaChart data={grafico}>
                                    <defs>
                                        <linearGradient id="colorIngreso" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                    <XAxis
                                        dataKey="dia"
                                        stroke="var(--text-muted)"
                                        fontSize={12}
                                    />
                                    <YAxis
                                        stroke="var(--text-muted)"
                                        fontSize={12}
                                        tickFormatter={(v) => `S/${v}`}
                                    />
                                    <Tooltip
                                        formatter={(value) => [`S/ ${value.toFixed(2)}`, 'Ingreso']}
                                        contentStyle={{
                                            backgroundColor: 'var(--card-bg)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="ingreso"
                                        stroke="#10b981"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorIngreso)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Pending Actions */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">
                                <AlertTriangle size={18} className="text-warning" />
                                Acciones Pendientes
                            </h3>
                        </div>
                        <div className="pending-actions">
                            {/* Check-ins */}
                            {estadisticas.checkins_hoy > 0 && (
                                <div className="action-item success" onClick={() => navigateTo('/checkin')}>
                                    <div className="action-icon">
                                        <UserCheck size={20} />
                                    </div>
                                    <div className="action-content">
                                        <span className="action-count">{estadisticas.checkins_hoy}</span>
                                        <span className="action-label">Check-ins esperados</span>
                                    </div>
                                    {acciones.checkins?.slice(0, 2).map((c, i) => (
                                        <span key={i} className="action-detail">
                                            Hab {c.habitacion?.numero} - {c.nombre_cliente}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Check-outs */}
                            {estadisticas.checkouts_hoy > 0 && (
                                <div className="action-item warning" onClick={() => navigateTo('/checkout')}>
                                    <div className="action-icon">
                                        <UserX size={20} />
                                    </div>
                                    <div className="action-content">
                                        <span className="action-count">{estadisticas.checkouts_hoy}</span>
                                        <span className="action-label">Check-outs hoy</span>
                                    </div>
                                    {acciones.checkouts?.slice(0, 2).map((c, i) => (
                                        <span key={i} className="action-detail">
                                            Hab {c.habitacion?.numero} - {c.huesped?.nombre}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Cleaning */}
                            {estadisticas.limpiezas_pendientes > 0 && (
                                <div className="action-item info" onClick={() => navigateTo('/limpieza')}>
                                    <div className="action-icon">
                                        <Sparkles size={20} />
                                    </div>
                                    <div className="action-content">
                                        <span className="action-count">{estadisticas.limpiezas_pendientes}</span>
                                        <span className="action-label">Limpiezas pendientes</span>
                                    </div>
                                </div>
                            )}

                            {estadisticas.checkins_hoy === 0 &&
                                estadisticas.checkouts_hoy === 0 &&
                                estadisticas.limpiezas_pendientes === 0 && (
                                    <div className="no-pending">
                                        <CalendarCheck size={32} className="text-success" />
                                        <p>¡Todo al día!</p>
                                    </div>
                                )}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="dashboard-sidebar">
                    {/* Room Distribution */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Estado de Habitaciones</h3>
                        </div>
                        <div className="pie-container">
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={roomPieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {roomPieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="pie-legend">
                            {roomPieData.map((item, i) => (
                                <div key={i} className="legend-item">
                                    <span className="legend-dot" style={{ backgroundColor: item.color }}></span>
                                    <span className="legend-label">{item.name}</span>
                                    <span className="legend-value">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Acciones Rápidas</h3>
                        </div>
                        <div className="quick-actions">
                            <button className="quick-action-btn" onClick={() => navigateTo('/checkin')}>
                                <UserCheck size={20} />
                                Check-in
                            </button>
                            <button className="quick-action-btn" onClick={() => navigateTo('/checkout')}>
                                <UserX size={20} />
                                Check-out
                            </button>
                            <button className="quick-action-btn" onClick={() => navigateTo('/reservas')}>
                                <CalendarCheck size={20} />
                                Nueva Reserva
                            </button>
                            <button className="quick-action-btn" onClick={() => navigateTo('/pagos')}>
                                <DollarSign size={20} />
                                Registrar Pago
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
