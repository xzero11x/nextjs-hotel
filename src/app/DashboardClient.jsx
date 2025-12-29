"use client";

import { useRouter } from 'next/navigation';
import {
    BedDouble,
    Users,
    DollarSign,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    AlertTriangle,
    Clock,
    UserCheck,
    UserX,
    Loader,
    CalendarCheck,
    LogIn,
    LogOut,
    UserPlus,
    User
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { estadisticasDia, alertas, ocupacionSemanal, ingresosMensuales, habitaciones, huespedes } from '@/data/mockData';
import InfoTooltip from '@/components/ui/InfoTooltip';
import './Dashboard.css';

const COLORS = ['#22c55e', '#ef4444', '#f59e0b', '#a855f7'];

function Dashboard() {
    const router = useRouter();
    const roomsByStatus = [
        { name: 'Disponibles', value: estadisticasDia.disponibles, color: '#22c55e' },
        { name: 'Ocupadas', value: estadisticasDia.ocupadas, color: '#ef4444' },
        { name: 'Limpieza', value: estadisticasDia.enLimpieza, color: '#f59e0b' },
        { name: 'Mantenimiento', value: estadisticasDia.enMantenimiento, color: '#a855f7' },
    ];

    const todayCheckIns = huespedes.filter(h =>
        h.checkInDate.startsWith('2024-12-21')
    );

    const todayCheckOuts = huespedes.filter(h =>
        h.checkOutDate.startsWith('2024-12-21')
    );

    return (
        <div className="dashboard">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-subtitle">Bienvenido al sistema de gestión hotelera - {new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="page-header-actions">
                    <button className="btn btn-primary" onClick={() => router.push('/checkin')}>
                        <LogIn size={18} />
                        Nuevo Check-in
                    </button>
                </div>
            </div>

            {/* Quick Stats Row */}
            <div className="quick-stats">
                <div className="quick-stat">
                    <span className="quick-stat-dot disponible"></span>
                    <span className="quick-stat-value">{estadisticasDia.disponibles}</span>
                    <span className="quick-stat-label">Disponibles</span>
                </div>
                <div className="quick-stat">
                    <span className="quick-stat-dot ocupada"></span>
                    <span className="quick-stat-value">{estadisticasDia.ocupadas}</span>
                    <span className="quick-stat-label">Ocupadas</span>
                </div>
                <div className="quick-stat">
                    <span className="quick-stat-dot limpieza"></span>
                    <span className="quick-stat-value">{estadisticasDia.enLimpieza}</span>
                    <span className="quick-stat-label">Limpieza</span>
                </div>
                <div className="quick-stat">
                    <span className="quick-stat-dot mantenimiento"></span>
                    <span className="quick-stat-value">{estadisticasDia.enMantenimiento}</span>
                    <span className="quick-stat-label">Mantenimiento</span>
                </div>
            </div>

            {/* Main Stats Cards */}
            <div className="grid grid-cols-4 mb-6">
                <div className="stat-card primary">
                    <div className="stat-card-header">
                        <div className="stat-card-icon">
                            <BedDouble size={24} />
                        </div>
                        <InfoTooltip text="Número total de habitaciones del hotel y porcentaje de ocupación actual" />
                    </div>
                    <div className="stat-value">{estadisticasDia.totalHabitaciones}</div>
                    <div className="stat-label">Total Habitaciones</div>
                    <div className="stat-change positive">
                        <ArrowUpRight size={14} />
                        <span>{estadisticasDia.ocupacionPorcentaje}% ocupación</span>
                    </div>
                </div>

                <div className="stat-card success">
                    <div className="stat-card-header">
                        <div className="stat-card-icon">
                            <Users size={24} />
                        </div>
                        <InfoTooltip text="Huéspedes con reservas activas, incluyendo los que están dentro y fuera del hotel" />
                    </div>
                    <div className="stat-value">{estadisticasDia.huespedsDentro + estadisticasDia.huespedesFuera}</div>
                    <div className="stat-label">Huéspedes Activos</div>
                    <div className="stat-change positive">
                        <UserCheck size={14} />
                        <span>{estadisticasDia.huespedsDentro} dentro</span>
                    </div>
                </div>

                <div className="stat-card gold">
                    <div className="stat-card-header">
                        <div className="stat-card-icon">
                            <DollarSign size={24} />
                        </div>
                        <InfoTooltip text="Total de ingresos generados el día de hoy por pagos de habitaciones y servicios" />
                    </div>
                    <div className="stat-value">S/ {estadisticasDia.ingresosHoy.toLocaleString()}</div>
                    <div className="stat-label">Ingresos de Hoy</div>
                    <div className="stat-change positive">
                        <TrendingUp size={14} />
                        <span>+12% vs ayer</span>
                    </div>
                </div>

                <div className="stat-card purple">
                    <div className="stat-card-header">
                        <div className="stat-card-icon">
                            <CalendarCheck size={24} />
                        </div>
                        <InfoTooltip text="Número de check-ins y check-outs programados para el día de hoy" />
                    </div>
                    <div className="stat-value">{estadisticasDia.checkInsHoy}</div>
                    <div className="stat-label">Check-ins Hoy</div>
                    <div className="stat-change">
                        <LogOut size={14} />
                        <span>{estadisticasDia.checkOutsHoy} check-outs</span>
                    </div>
                </div>
            </div>

            {/* Quick Access Section - Habitaciones Disponibles y Alertas */}
            <div className="grid grid-cols-3 mb-6">
                {/* Habitaciones Disponibles HOY */}
                <div className="card" style={{ gridColumn: 'span 2' }}>
                    <div className="card-header">
                        <div>
                            <h3 className="card-title">Habitaciones Disponibles Ahora</h3>
                            <p className="card-subtitle">Listas para check-in inmediato</p>
                        </div>
                        <button className="btn btn-primary" onClick={() => router.push('/checkin')}>
                            <UserPlus size={16} />
                            Nuevo Check-in
                        </button>
                    </div>
                    <div className="available-rooms-quick">
                        {habitaciones.filter(h => h.estado === 'disponible').slice(0, 6).map((room) => (
                            <div key={room.id} className="quick-room-card" onClick={() => router.push('/checkin')}>
                                <div className="quick-room-header">
                                    <span className="quick-room-number">{room.numero}</span>
                                    <span className="badge badge-disponible">Disponible</span>
                                </div>
                                <div className="quick-room-info">
                                    <span className="quick-room-type">{room.tipo}</span>
                                    <span className="quick-room-price">S/ {room.precioActual}/noche</span>
                                </div>
                                <div className="quick-room-details">
                                    <span><User size={12} /> {room.capacidad}</span>
                                    <span>Piso {room.piso}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Alertas de Huéspedes Fuera */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <h3 className="card-title">Huéspedes Fuera</h3>
                            <p className="card-subtitle">Requieren atención</p>
                        </div>
                        <span className="alert-count">{huespedes.filter(h => h.estado === 'fuera').length}</span>
                    </div>
                    <div className="guests-out-list">
                        {huespedes.filter(h => h.estado === 'fuera').slice(0, 4).map((guest) => {
                            const habitacion = habitaciones.find(hab => hab.id === guest.habitacionId);
                            return (
                                <div key={guest.id} className="guest-out-item">
                                    <div className="guest-out-avatar">
                                        {guest.nombre.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div className="guest-out-info">
                                        <span className="guest-out-name">{guest.nombre}</span>
                                        <span className="guest-out-room">Hab. {habitacion?.numero || 'N/A'}</span>
                                    </div>
                                    <span className="badge badge-fuera">Fuera</span>
                                </div>
                            );
                        })}
                        {huespedes.filter(h => h.estado === 'fuera').length === 0 && (
                            <div className="no-activity">
                                <UserCheck size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                                <p>Todos los huéspedes están dentro</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Alertas, Actividad y Estado Actual */}
            <div className="grid grid-cols-3 mb-6">
                {/* Alertas */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <h3 className="card-title">Alertas</h3>
                            <p className="card-subtitle">Requieren atención</p>
                        </div>
                        <span className="alert-count">{alertas.length}</span>
                    </div>
                    <div className="alerts-list">
                        {alertas.map((alerta) => (
                            <div key={alerta.id} className={`alert-card urgencia-${alerta.urgencia}`}>
                                <div className="alert-icon">
                                    {alerta.tipo === 'pago_pendiente' && <DollarSign size={16} />}
                                    {alerta.tipo === 'salida_proxima' && <Clock size={16} />}
                                    {alerta.tipo === 'mantenimiento' && <AlertTriangle size={16} />}
                                </div>
                                <div className="alert-content">
                                    <div className="alert-message">{alerta.mensaje}</div>
                                    <div className="alert-room">Habitación {alerta.habitacion}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actividad de Hoy */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <h3 className="card-title">Actividad de Hoy</h3>
                            <p className="card-subtitle">Check-ins y check-outs</p>
                        </div>
                    </div>
                    <div className="activity-list">
                        <div className="activity-section">
                            <h4 className="activity-section-title">
                                <LogIn size={16} />
                                Check-ins
                            </h4>
                            {todayCheckIns.length > 0 ? (
                                todayCheckIns.map((huesped) => {
                                    const hab = habitaciones.find(h => h.id === huesped.habitacionId);
                                    return (
                                        <div key={huesped.id} className="activity-item">
                                            <div className="avatar avatar-sm">{huesped.nombre.charAt(0)}</div>
                                            <div className="activity-info">
                                                <span className="activity-name">{huesped.nombre}</span>
                                                <span className="activity-room">Hab. {hab?.numero}</span>
                                            </div>
                                            <span className={`badge badge-${huesped.estado}`}>{huesped.estado}</span>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="no-activity">Sin check-ins programados</p>
                            )}
                        </div>
                        <div className="activity-section">
                            <h4 className="activity-section-title">
                                <LogOut size={16} />
                                Check-outs
                            </h4>
                            {todayCheckOuts.length > 0 ? (
                                todayCheckOuts.map((huesped) => {
                                    const hab = habitaciones.find(h => h.id === huesped.habitacionId);
                                    return (
                                        <div key={huesped.id} className="activity-item">
                                            <div className="avatar avatar-sm">{huesped.nombre.charAt(0)}</div>
                                            <div className="activity-info">
                                                <span className="activity-name">{huesped.nombre}</span>
                                                <span className="activity-room">Hab. {hab?.numero}</span>
                                            </div>
                                            <span className="badge badge-salida">Salida</span>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="no-activity">Sin check-outs programados</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Estado de Habitaciones Pie */}
                <div className="card chart-card">
                    <div className="card-header">
                        <div>
                            <h3 className="card-title">Estado Actual</h3>
                            <p className="card-subtitle">Distribución de habitaciones</p>
                        </div>
                    </div>
                    <div className="chart-container pie-chart-container">
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={roomsByStatus}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {roomsByStatus.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        background: '#1e293b',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        color: '#f8fafc'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="pie-legend">
                            {roomsByStatus.map((item) => (
                                <div key={item.name} className="pie-legend-item">
                                    <span className="pie-legend-dot" style={{ background: item.color }}></span>
                                    <span className="pie-legend-label">{item.name}</span>
                                    <span className="pie-legend-value">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Gráficos de Tendencias */}
            <div className="grid grid-cols-2">
                {/* Ocupación Semanal */}
                <div className="card chart-card">
                    <div className="card-header">
                        <div>
                            <h3 className="card-title">Ocupación Semanal</h3>
                            <p className="card-subtitle">Porcentaje de ocupación por día</p>
                        </div>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={ocupacionSemanal}>
                                <defs>
                                    <linearGradient id="colorOcupacion" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                                <XAxis dataKey="dia" stroke="#64748b" fontSize={12} />
                                <YAxis stroke="#64748b" fontSize={12} />
                                <Tooltip
                                    contentStyle={{
                                        background: '#1e293b',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        color: '#f8fafc'
                                    }}
                                    formatter={(value) => [`${value}%`, 'Ocupación']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="ocupacion"
                                    stroke="#0ea5e9"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorOcupacion)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Ingresos Mensuales */}
                <div className="card chart-card">
                    <div className="card-header">
                        <div>
                            <h3 className="card-title">Ingresos Mensuales</h3>
                            <p className="card-subtitle">Últimos 6 meses</p>
                        </div>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={ingresosMensuales}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                                <XAxis dataKey="mes" stroke="#64748b" fontSize={12} />
                                <YAxis stroke="#64748b" fontSize={12} />
                                <Tooltip
                                    contentStyle={{
                                        background: '#1e293b',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        color: '#f8fafc'
                                    }}
                                    formatter={(value) => [`S/ ${value.toLocaleString()}`, 'Ingresos']}
                                />
                                <Bar dataKey="ingresos" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
