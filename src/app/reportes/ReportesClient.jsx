"use client";

import { useState, useEffect } from 'react';
import {
    BarChart3,
    TrendingUp,
    Download,
    Calendar,
    DollarSign,
    BedDouble,
    Users,
    Percent,
    Loader2,
    RefreshCw,
    Banknote,
    Smartphone,
    CreditCard,
    Building2,
    Globe,
    MapPin,
    Crown
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
import './Reportes.css';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

function Reportes() {
    const [activeTab, setActiveTab] = useState('ocupacion');
    const [periodo, setPeriodo] = useState(30);
    const [loading, setLoading] = useState(true);

    const [ocupacionData, setOcupacionData] = useState(null);
    const [ingresosData, setIngresosData] = useState(null);
    const [huespedesData, setHuespedesData] = useState(null);

    useEffect(() => {
        fetchReports();
    }, [periodo]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const [ocupacion, ingresos, huespedes] = await Promise.all([
                fetch(`/api/reportes/ocupacion?dias=${periodo}`).then(r => r.json()),
                fetch(`/api/reportes/ingresos?dias=${periodo}`).then(r => r.json()),
                fetch(`/api/reportes/huespedes?dias=${periodo}`).then(r => r.json())
            ]);

            setOcupacionData(ocupacion);
            setIngresosData(ingresos);
            setHuespedesData(huespedes);
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const getMetodoIcon = (metodo) => {
        switch (metodo) {
            case 'efectivo': return <Banknote size={14} />;
            case 'yape': case 'plin': return <Smartphone size={14} />;
            case 'tarjeta': return <CreditCard size={14} />;
            default: return <Building2 size={14} />;
        }
    };

    const metodosPieData = ingresosData?.por_metodo
        ? Object.entries(ingresosData.por_metodo)
            .filter(([_, v]) => v > 0)
            .map(([name, value]) => ({ name, value }))
        : [];

    return (
        <div className="reportes-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Reportes y Estadísticas</h1>
                    <p className="page-subtitle">Análisis de rendimiento del hotel</p>
                </div>
                <div className="page-header-actions">
                    <select
                        className="form-select"
                        value={periodo}
                        onChange={(e) => setPeriodo(parseInt(e.target.value))}
                    >
                        <option value={7}>Últimos 7 días</option>
                        <option value={14}>Últimos 14 días</option>
                        <option value={30}>Últimos 30 días</option>
                        <option value={90}>Últimos 90 días</option>
                    </select>
                    <button className="btn btn-secondary" onClick={fetchReports} disabled={loading}>
                        <RefreshCw size={18} className={loading ? 'spinner' : ''} />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="loading-state">
                    <Loader2 size={48} className="spinner" />
                    <p>Generando reportes...</p>
                </div>
            ) : (
                <>
                    {/* Tabs */}
                    <div className="tabs mb-4">
                        <button
                            className={`tab ${activeTab === 'ocupacion' ? 'active' : ''}`}
                            onClick={() => setActiveTab('ocupacion')}
                        >
                            <BedDouble size={18} />
                            Ocupación
                        </button>
                        <button
                            className={`tab ${activeTab === 'ingresos' ? 'active' : ''}`}
                            onClick={() => setActiveTab('ingresos')}
                        >
                            <DollarSign size={18} />
                            Ingresos
                        </button>
                        <button
                            className={`tab ${activeTab === 'huespedes' ? 'active' : ''}`}
                            onClick={() => setActiveTab('huespedes')}
                        >
                            <Users size={18} />
                            Huéspedes
                        </button>
                    </div>

                    {/* Ocupación Tab */}
                    {activeTab === 'ocupacion' && ocupacionData && (
                        <div className="report-content">
                            <div className="stats-row">
                                <div className="stat-card primary">
                                    <Percent size={24} />
                                    <div className="stat-content">
                                        <span className="stat-value">{ocupacionData.promedio_ocupacion}%</span>
                                        <span className="stat-label">Ocupación Promedio</span>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <BedDouble size={24} />
                                    <div className="stat-content">
                                        <span className="stat-value">{ocupacionData.total_habitaciones}</span>
                                        <span className="stat-label">Total Habitaciones</span>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <Calendar size={24} />
                                    <div className="stat-content">
                                        <span className="stat-value">{ocupacionData.dias_analizados}</span>
                                        <span className="stat-label">Días Analizados</span>
                                    </div>
                                </div>
                            </div>

                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">Ocupación Diaria</h3>
                                </div>
                                <div className="chart-container">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <AreaChart data={ocupacionData.ocupacion_diaria}>
                                            <defs>
                                                <linearGradient id="colorOcupacion" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                            <XAxis dataKey="dia" stroke="var(--text-muted)" fontSize={12} />
                                            <YAxis stroke="var(--text-muted)" fontSize={12} unit="%" />
                                            <Tooltip
                                                formatter={(value) => [`${value}%`, 'Ocupación']}
                                                contentStyle={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                                            />
                                            <Area type="monotone" dataKey="porcentaje" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorOcupacion)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Ingresos Tab */}
                    {activeTab === 'ingresos' && ingresosData && (
                        <div className="report-content">
                            <div className="stats-row">
                                <div className="stat-card success">
                                    <DollarSign size={24} />
                                    <div className="stat-content">
                                        <span className="stat-value">S/ {ingresosData.total_ingresos?.toFixed(2)}</span>
                                        <span className="stat-label">Total Ingresos</span>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <TrendingUp size={24} />
                                    <div className="stat-content">
                                        <span className="stat-value">S/ {ingresosData.promedio_diario?.toFixed(2)}</span>
                                        <span className="stat-label">Promedio Diario</span>
                                    </div>
                                </div>
                            </div>

                            <div className="reports-grid">
                                <div className="card">
                                    <div className="card-header">
                                        <h3 className="card-title">Ingresos Diarios</h3>
                                    </div>
                                    <div className="chart-container">
                                        <ResponsiveContainer width="100%" height={250}>
                                            <BarChart data={ingresosData.ingresos_diarios}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                                <XAxis dataKey="dia" stroke="var(--text-muted)" fontSize={10} />
                                                <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={(v) => `S/${v}`} />
                                                <Tooltip
                                                    formatter={(value) => [`S/ ${value.toFixed(2)}`, 'Ingreso']}
                                                    contentStyle={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                                                />
                                                <Bar dataKey="ingreso" fill="#10b981" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="card">
                                    <div className="card-header">
                                        <h3 className="card-title">Por Método de Pago</h3>
                                    </div>
                                    <div className="chart-container-sm">
                                        <ResponsiveContainer width="100%" height={200}>
                                            <PieChart>
                                                <Pie
                                                    data={metodosPieData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={40}
                                                    outerRadius={70}
                                                    paddingAngle={2}
                                                    dataKey="value"
                                                >
                                                    {metodosPieData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(value) => `S/ ${value.toFixed(2)}`} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="pie-legend">
                                        {metodosPieData.map((item, i) => (
                                            <div key={i} className="legend-item">
                                                <span className="legend-dot" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                                                {getMetodoIcon(item.name)}
                                                <span className="legend-label">{item.name}</span>
                                                <span className="legend-value">S/ {item.value.toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {ingresosData.top_dias?.length > 0 && (
                                <div className="card">
                                    <div className="card-header">
                                        <h3 className="card-title">Mejores Días</h3>
                                    </div>
                                    <div className="top-list">
                                        {ingresosData.top_dias.map((dia, i) => (
                                            <div key={i} className="top-item">
                                                <span className="top-rank">#{i + 1}</span>
                                                <span className="top-name">{new Date(dia.fecha).toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'short' })}</span>
                                                <span className="top-value">S/ {dia.ingreso.toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Huéspedes Tab */}
                    {activeTab === 'huespedes' && huespedesData && (
                        <div className="report-content">
                            <div className="stats-row">
                                <div className="stat-card">
                                    <Users size={24} />
                                    <div className="stat-content">
                                        <span className="stat-value">{huespedesData.total_huespedes}</span>
                                        <span className="stat-label">Total Huéspedes</span>
                                    </div>
                                </div>
                                <div className="stat-card success">
                                    <DollarSign size={24} />
                                    <div className="stat-content">
                                        <span className="stat-value">S/ {huespedesData.gasto_promedio}</span>
                                        <span className="stat-label">Gasto Promedio</span>
                                    </div>
                                </div>
                                <div className="stat-card warning">
                                    <Crown size={24} />
                                    <div className="stat-content">
                                        <span className="stat-value">{huespedesData.huespedes_frecuentes}</span>
                                        <span className="stat-label">Huéspedes VIP</span>
                                    </div>
                                </div>
                            </div>

                            <div className="reports-grid">
                                <div className="card">
                                    <div className="card-header">
                                        <h3 className="card-title">
                                            <Globe size={18} /> Por Nacionalidad
                                        </h3>
                                    </div>
                                    <div className="distribution-list">
                                        {huespedesData.por_nacionalidad?.map((item, i) => (
                                            <div key={i} className="distribution-item">
                                                <span className="distribution-name">{item.name}</span>
                                                <div className="distribution-bar">
                                                    <div
                                                        className="distribution-fill"
                                                        style={{
                                                            width: `${(item.value / huespedesData.total_huespedes) * 100}%`,
                                                            backgroundColor: COLORS[i % COLORS.length]
                                                        }}
                                                    ></div>
                                                </div>
                                                <span className="distribution-value">{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="card">
                                    <div className="card-header">
                                        <h3 className="card-title">
                                            <MapPin size={18} /> Por Procedencia
                                        </h3>
                                    </div>
                                    <div className="distribution-list">
                                        {huespedesData.por_procedencia?.map((item, i) => (
                                            <div key={i} className="distribution-item">
                                                <span className="distribution-name">{item.name}</span>
                                                <div className="distribution-bar">
                                                    <div
                                                        className="distribution-fill"
                                                        style={{
                                                            width: `${(item.value / huespedesData.total_huespedes) * 100}%`,
                                                            backgroundColor: COLORS[(i + 3) % COLORS.length]
                                                        }}
                                                    ></div>
                                                </div>
                                                <span className="distribution-value">{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {huespedesData.top_huespedes?.length > 0 && (
                                <div className="card">
                                    <div className="card-header">
                                        <h3 className="card-title">
                                            <Crown size={18} /> Top Huéspedes por Gasto
                                        </h3>
                                    </div>
                                    <div className="top-list">
                                        {huespedesData.top_huespedes.map((h, i) => (
                                            <div key={i} className="top-item">
                                                <span className="top-rank">#{i + 1}</span>
                                                <span className="top-name">{h.nombre}</span>
                                                <span className="top-value">S/ {h.total.toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default Reportes;
