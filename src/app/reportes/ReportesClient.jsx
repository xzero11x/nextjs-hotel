"use client";

import { useState } from 'react';
import {
    BarChart3,
    TrendingUp,
    Download,
    Calendar,
    FileSpreadsheet,
    FileText,
    DollarSign,
    BedDouble,
    Users,
    Percent
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
    Cell,
    LineChart,
    Line
} from 'recharts';
import { ocupacionSemanal, ingresosMensuales, habitaciones } from '@/data/mockData';
import InfoTooltip from '@/components/ui/InfoTooltip';
import './Reportes.css';

function Reportes() {
    const [selectedPeriod, setSelectedPeriod] = useState('mes');

    const ocupacionPorTipo = [
        { name: 'Simple', ocupacion: 75, ingresos: 3500 },
        { name: 'Doble', ocupacion: 82, ingresos: 5200 },
        { name: 'Matrimonial', ocupacion: 68, ingresos: 4800 },
        { name: 'Suite', ocupacion: 45, ingresos: 6500 },
    ];

    const COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#a855f7'];

    return (
        <div className="reportes-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Reportes y Estadísticas</h1>
                    <p className="page-subtitle">Análisis detallado del rendimiento del hotel</p>
                </div>
                <div className="page-header-actions">
                    <select
                        className="form-select"
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                    >
                        <option value="semana">Esta semana</option>
                        <option value="mes">Este mes</option>
                        <option value="trimestre">Este trimestre</option>
                        <option value="año">Este año</option>
                    </select>
                    <button className="btn btn-secondary">
                        <FileSpreadsheet size={18} />
                        Exportar Excel
                    </button>
                    <button className="btn btn-primary">
                        <FileText size={18} />
                        Exportar PDF
                    </button>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-4 mb-6">
                <div className="stat-card primary">
                    <div className="stat-card-header">
                        <div className="stat-card-icon">
                            <Percent size={24} />
                        </div>
                        <InfoTooltip text="Porcentaje promedio de habitaciones ocupadas durante el período seleccionado" />
                    </div>
                    <div className="stat-value">72%</div>
                    <div className="stat-label">Ocupación Promedio</div>
                    <div className="stat-change positive">
                        <TrendingUp size={14} />
                        <span>+5% vs mes anterior</span>
                    </div>
                </div>
                <div className="stat-card gold">
                    <div className="stat-card-header">
                        <div className="stat-card-icon">
                            <DollarSign size={24} />
                        </div>
                        <InfoTooltip text="Total de ingresos generados en el mes actual por todas las habitaciones y servicios" />
                    </div>
                    <div className="stat-value">S/ 12,450</div>
                    <div className="stat-label">Ingresos del Mes</div>
                    <div className="stat-change positive">
                        <TrendingUp size={14} />
                        <span>+8% vs mes anterior</span>
                    </div>
                </div>
                <div className="stat-card success">
                    <div className="stat-card-header">
                        <div className="stat-card-icon">
                            <Users size={24} />
                        </div>
                        <InfoTooltip text="Número total de huéspedes que se han alojado en el hotel durante el mes" />
                    </div>
                    <div className="stat-value">156</div>
                    <div className="stat-label">Huéspedes del Mes</div>
                    <div className="stat-change positive">
                        <TrendingUp size={14} />
                        <span>+12% vs mes anterior</span>
                    </div>
                </div>
                <div className="stat-card purple">
                    <div className="stat-card-header">
                        <div className="stat-card-icon">
                            <BedDouble size={24} />
                        </div>
                        <InfoTooltip text="Precio promedio por noche cobrado a los huéspedes durante el período (ADR - Average Daily Rate)" />
                    </div>
                    <div className="stat-value">S/ 85</div>
                    <div className="stat-label">Tarifa Promedio</div>
                    <div className="stat-change positive">
                        <TrendingUp size={14} />
                        <span>+3% vs mes anterior</span>
                    </div>
                </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-2 mb-6">
                <div className="card chart-card">
                    <div className="card-header">
                        <div>
                            <h3 className="card-title">Ingresos Mensuales</h3>
                            <p className="card-subtitle">Tendencia de ingresos por mes</p>
                        </div>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={ingresosMensuales}>
                                <defs>
                                    <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                                <XAxis dataKey="mes" stroke="#64748b" fontSize={12} />
                                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `S/${v / 1000}k`} />
                                <Tooltip
                                    contentStyle={{
                                        background: '#1e293b',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        color: '#f8fafc'
                                    }}
                                    formatter={(value) => [`S/ ${value.toLocaleString()}`, 'Ingresos']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="ingresos"
                                    stroke="#f59e0b"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorIngresos)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card chart-card">
                    <div className="card-header">
                        <div>
                            <h3 className="card-title">Ocupación Semanal</h3>
                            <p className="card-subtitle">Porcentaje de ocupación por día</p>
                        </div>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={ocupacionSemanal}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                                <XAxis dataKey="dia" stroke="#64748b" fontSize={12} />
                                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `${v}%`} />
                                <Tooltip
                                    contentStyle={{
                                        background: '#1e293b',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        color: '#f8fafc'
                                    }}
                                    formatter={(value) => [`${value}%`, 'Ocupación']}
                                />
                                <Bar dataKey="ocupacion" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-3 mb-6">
                <div className="card chart-card">
                    <div className="card-header">
                        <div>
                            <h3 className="card-title">Ingresos por Tipo</h3>
                            <p className="card-subtitle">Distribución de ingresos</p>
                        </div>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={ocupacionPorTipo}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={3}
                                    dataKey="ingresos"
                                >
                                    {ocupacionPorTipo.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        background: '#1e293b',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        color: '#f8fafc'
                                    }}
                                    formatter={(value) => [`S/ ${value}`, 'Ingresos']}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="pie-legend">
                            {ocupacionPorTipo.map((item, index) => (
                                <div key={item.name} className="pie-legend-item">
                                    <span className="pie-legend-dot" style={{ background: COLORS[index] }}></span>
                                    <span className="pie-legend-label">{item.name}</span>
                                    <span className="pie-legend-value">S/ {item.ingresos}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="card chart-card" style={{ gridColumn: 'span 2' }}>
                    <div className="card-header">
                        <div>
                            <h3 className="card-title">Ocupación por Tipo de Habitación</h3>
                            <p className="card-subtitle">Comparativa de ocupación</p>
                        </div>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={ocupacionPorTipo} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                                <XAxis type="number" stroke="#64748b" fontSize={12} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                                <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={12} width={80} />
                                <Tooltip
                                    contentStyle={{
                                        background: '#1e293b',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        color: '#f8fafc'
                                    }}
                                    formatter={(value) => [`${value}%`, 'Ocupación']}
                                />
                                <Bar dataKey="ocupacion" radius={[0, 4, 4, 0]}>
                                    {ocupacionPorTipo.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Reports Table */}
            <div className="card">
                <div className="card-header">
                    <div>
                        <h3 className="card-title">Reportes Disponibles</h3>
                        <p className="card-subtitle">Genera y descarga reportes detallados</p>
                    </div>
                </div>
                <div className="reports-list">
                    <div className="report-item">
                        <div className="report-icon">
                            <BarChart3 size={20} />
                        </div>
                        <div className="report-info">
                            <span className="report-name">Reporte de Ocupación</span>
                            <span className="report-desc">Análisis detallado de ocupación por período</span>
                        </div>
                        <button className="btn btn-secondary btn-sm">
                            <Download size={16} />
                            Descargar
                        </button>
                    </div>
                    <div className="report-item">
                        <div className="report-icon">
                            <DollarSign size={20} />
                        </div>
                        <div className="report-info">
                            <span className="report-name">Reporte de Ingresos</span>
                            <span className="report-desc">Desglose de ingresos y medios de pago</span>
                        </div>
                        <button className="btn btn-secondary btn-sm">
                            <Download size={16} />
                            Descargar
                        </button>
                    </div>
                    <div className="report-item">
                        <div className="report-icon">
                            <Users size={20} />
                        </div>
                        <div className="report-info">
                            <span className="report-name">Reporte de Huéspedes</span>
                            <span className="report-desc">Estadísticas de huéspedes y frecuencia</span>
                        </div>
                        <button className="btn btn-secondary btn-sm">
                            <Download size={16} />
                            Descargar
                        </button>
                    </div>
                    <div className="report-item">
                        <div className="report-icon">
                            <FileText size={20} />
                        </div>
                        <div className="report-info">
                            <span className="report-name">Reporte Tributario</span>
                            <span className="report-desc">Resumen para declaraciones SUNAT</span>
                        </div>
                        <button className="btn btn-secondary btn-sm">
                            <Download size={16} />
                            Descargar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Reportes;

