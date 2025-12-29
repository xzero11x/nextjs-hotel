"use client";

import { useState } from 'react';
import {
    DollarSign,
    Edit,
    Save,
    Calendar,
    TrendingUp,
    Plus,
    History,
    Percent,
    Bed,
    BedDouble,
    Heart,
    Crown,
    CloudRain,
    CloudSun,
    Sun
} from 'lucide-react';
import { tarifas, temporadas } from '@/data/mockData';
import './Precios.css';

function Precios() {
    const [activeTab, setActiveTab] = useState('tarifas');

    return (
        <div className="precios-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Gestión de Precios y Tarifas</h1>
                    <p className="page-subtitle">Configura precios base, temporadas y descuentos</p>
                </div>
                <div className="page-header-actions">
                    <button className="btn btn-primary">
                        <Plus size={18} />
                        Nueva Tarifa
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'tarifas' ? 'active' : ''}`}
                    onClick={() => setActiveTab('tarifas')}
                >
                    <DollarSign size={16} />
                    Tarifas por Tipo
                </button>
                <button
                    className={`tab ${activeTab === 'temporadas' ? 'active' : ''}`}
                    onClick={() => setActiveTab('temporadas')}
                >
                    <Calendar size={16} />
                    Temporadas
                </button>
                <button
                    className={`tab ${activeTab === 'descuentos' ? 'active' : ''}`}
                    onClick={() => setActiveTab('descuentos')}
                >
                    <Percent size={16} />
                    Descuentos
                </button>
                <button
                    className={`tab ${activeTab === 'historial' ? 'active' : ''}`}
                    onClick={() => setActiveTab('historial')}
                >
                    <History size={16} />
                    Historial
                </button>
            </div>

            {/* Tarifas Tab */}
            {activeTab === 'tarifas' && (
                <div className="grid grid-cols-2">
                    {tarifas.map((tarifa) => (
                        <div key={tarifa.id} className="card tarifa-card">
                            <div className="tarifa-header">
                                <div className="tarifa-tipo">
                                    <span className="tarifa-icon">
                                        {tarifa.tipo === 'simple' && <Bed size={20} />}
                                        {tarifa.tipo === 'doble' && <BedDouble size={20} />}
                                        {tarifa.tipo === 'matrimonial' && <Heart size={20} />}
                                        {tarifa.tipo === 'suite' && <Crown size={20} />}
                                    </span>
                                    <h3 className="tarifa-nombre">{tarifa.tipo}</h3>
                                </div>
                                <button className="btn btn-ghost btn-icon">
                                    <Edit size={18} />
                                </button>
                            </div>
                            <div className="tarifa-precios">
                                <div className="precio-item precio-base">
                                    <span className="precio-label">Precio Base</span>
                                    <span className="precio-value">S/ {tarifa.precioBase}</span>
                                </div>
                                <div className="precio-grid">
                                    <div className="precio-item">
                                        <span className="precio-label">Temporada Baja</span>
                                        <span className="precio-value baja">S/ {tarifa.temporadaBaja}</span>
                                    </div>
                                    <div className="precio-item">
                                        <span className="precio-label">Temporada Media</span>
                                        <span className="precio-value media">S/ {tarifa.temporadaMedia}</span>
                                    </div>
                                    <div className="precio-item">
                                        <span className="precio-label">Temporada Alta</span>
                                        <span className="precio-value alta">S/ {tarifa.temporadaAlta}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Temporadas Tab */}
            {activeTab === 'temporadas' && (
                <div className="grid grid-cols-3">
                    {temporadas.map((temp) => (
                        <div key={temp.id} className={`card temporada-card ${temp.nombre.toLowerCase().includes('baja') ? 'baja' : temp.nombre.toLowerCase().includes('alta') ? 'alta' : 'media'}`}>
                            <div className="temporada-header">
                                <span className="temporada-icon">
                                    {temp.nombre.includes('Baja') && <CloudRain size={24} />}
                                    {temp.nombre.includes('Media') && <CloudSun size={24} />}
                                    {temp.nombre.includes('Alta') && <Sun size={24} />}
                                </span>
                                <h3 className="temporada-nombre">{temp.nombre}</h3>
                            </div>
                            <div className="temporada-dates">
                                <div className="date-item">
                                    <span className="date-label">Inicio</span>
                                    <span className="date-value">{new Date(temp.inicio).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}</span>
                                </div>
                                <div className="date-item">
                                    <span className="date-label">Fin</span>
                                    <span className="date-value">{new Date(temp.fin).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}</span>
                                </div>
                            </div>
                            <div className="temporada-multiplicador">
                                <TrendingUp size={16} />
                                <span>Multiplicador: <strong>{temp.multiplicador}x</strong></span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Descuentos Tab */}
            {activeTab === 'descuentos' && (
                <div className="card">
                    <div className="card-header">
                        <div>
                            <h3 className="card-title">Reglas de Descuento</h3>
                            <p className="card-subtitle">Configura descuentos automáticos</p>
                        </div>
                        <button className="btn btn-primary btn-sm">
                            <Plus size={16} />
                            Nueva Regla
                        </button>
                    </div>
                    <div className="descuentos-list">
                        <div className="descuento-item">
                            <div className="descuento-info">
                                <span className="descuento-nombre">Estadía prolongada (7+ días)</span>
                                <span className="descuento-desc">10% de descuento para estadías de 7 o más días</span>
                            </div>
                            <div className="descuento-valor">
                                <span className="badge badge-disponible">-10%</span>
                            </div>
                            <button className="btn btn-ghost btn-icon">
                                <Edit size={16} />
                            </button>
                        </div>
                        <div className="descuento-item">
                            <div className="descuento-info">
                                <span className="descuento-nombre">Cliente frecuente</span>
                                <span className="descuento-desc">5% de descuento para clientes frecuentes</span>
                            </div>
                            <div className="descuento-valor">
                                <span className="badge badge-disponible">-5%</span>
                            </div>
                            <button className="btn btn-ghost btn-icon">
                                <Edit size={16} />
                            </button>
                        </div>
                        <div className="descuento-item">
                            <div className="descuento-info">
                                <span className="descuento-nombre">Tarifa por horas (máx. 6h)</span>
                                <span className="descuento-desc">50% del precio diario para uso por horas</span>
                            </div>
                            <div className="descuento-valor">
                                <span className="badge badge-limpieza">50%</span>
                            </div>
                            <button className="btn btn-ghost btn-icon">
                                <Edit size={16} />
                            </button>
                        </div>
                        <div className="descuento-item">
                            <div className="descuento-info">
                                <span className="descuento-nombre">Descuento fin de semana</span>
                                <span className="descuento-desc">15% extra en fines de semana de temporada baja</span>
                            </div>
                            <div className="descuento-valor">
                                <span className="badge badge-disponible">-15%</span>
                            </div>
                            <button className="btn btn-ghost btn-icon">
                                <Edit size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Historial Tab */}
            {activeTab === 'historial' && (
                <div className="card">
                    <div className="card-header">
                        <div>
                            <h3 className="card-title">Historial de Cambios</h3>
                            <p className="card-subtitle">Registro de modificaciones de precios</p>
                        </div>
                    </div>
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Tipo Habitación</th>
                                    <th>Cambio</th>
                                    <th>Usuario</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>21/12/2024 10:30</td>
                                    <td>Suite</td>
                                    <td>Precio base: S/ 170 → S/ 180</td>
                                    <td>Admin Principal</td>
                                </tr>
                                <tr>
                                    <td>15/12/2024 14:15</td>
                                    <td>Doble</td>
                                    <td>Temporada alta: S/ 95 → S/ 100</td>
                                    <td>Admin Principal</td>
                                </tr>
                                <tr>
                                    <td>01/12/2024 09:00</td>
                                    <td>Todas</td>
                                    <td>Actualización temporada alta</td>
                                    <td>Admin Principal</td>
                                </tr>
                                <tr>
                                    <td>20/11/2024 16:45</td>
                                    <td>Simple</td>
                                    <td>Precio base: S/ 45 → S/ 50</td>
                                    <td>Admin Principal</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Precios;

