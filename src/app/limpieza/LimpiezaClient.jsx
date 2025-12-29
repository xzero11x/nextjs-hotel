"use client";

import { useState } from 'react';
import {
    Sparkles,
    Wrench,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Plus,
    User,
    BedDouble,
    Calendar,
    Check
} from 'lucide-react';
import { habitaciones, ordenesLimpieza } from '@/data/mockData';
import './Limpieza.css';

function Limpieza() {
    const [activeTab, setActiveTab] = useState('limpieza');

    const habitacionesLimpieza = habitaciones.filter(h => h.estado === 'limpieza');
    const habitacionesMantenimiento = habitaciones.filter(h => h.estado === 'mantenimiento');

    return (
        <div className="limpieza-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Limpieza y Mantenimiento</h1>
                    <p className="page-subtitle">Gestiona el estado de limpieza y órdenes de mantenimiento</p>
                </div>
                <div className="page-header-actions">
                    <button className="btn btn-primary">
                        <Plus size={18} />
                        Nueva Orden
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 mb-6">
                <div className="stat-card gold">
                    <div className="stat-card-icon">
                        <Sparkles size={24} />
                    </div>
                    <div className="stat-value">{habitacionesLimpieza.length}</div>
                    <div className="stat-label">En Limpieza</div>
                </div>
                <div className="stat-card purple">
                    <div className="stat-card-icon">
                        <Wrench size={24} />
                    </div>
                    <div className="stat-value">{habitacionesMantenimiento.length}</div>
                    <div className="stat-label">En Mantenimiento</div>
                </div>
                <div className="stat-card success">
                    <div className="stat-card-icon">
                        <CheckCircle2 size={24} />
                    </div>
                    <div className="stat-value">{habitaciones.filter(h => h.estado === 'disponible').length}</div>
                    <div className="stat-label">Listas</div>
                </div>
                <div className="stat-card danger">
                    <div className="stat-card-icon">
                        <Clock size={24} />
                    </div>
                    <div className="stat-value">{ordenesLimpieza.filter(o => o.estado === 'pendiente').length}</div>
                    <div className="stat-label">Órdenes Pendientes</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'limpieza' ? 'active' : ''}`}
                    onClick={() => setActiveTab('limpieza')}
                >
                    <Sparkles size={16} />
                    Limpieza
                </button>
                <button
                    className={`tab ${activeTab === 'mantenimiento' ? 'active' : ''}`}
                    onClick={() => setActiveTab('mantenimiento')}
                >
                    <Wrench size={16} />
                    Mantenimiento
                </button>
                <button
                    className={`tab ${activeTab === 'ordenes' ? 'active' : ''}`}
                    onClick={() => setActiveTab('ordenes')}
                >
                    <Clock size={16} />
                    Órdenes Activas
                </button>
            </div>

            {/* Limpieza Tab */}
            {activeTab === 'limpieza' && (
                <div className="rooms-status-grid">
                    <div className="card status-section">
                        <h3 className="section-title">
                            <span className="status-indicator limpieza"></span>
                            En Limpieza
                        </h3>
                        <div className="status-rooms">
                            {habitacionesLimpieza.length > 0 ? (
                                habitacionesLimpieza.map((hab) => (
                                    <div key={hab.id} className="status-room-card limpieza">
                                        <div className="room-header">
                                            <span className="room-number">{hab.numero}</span>
                                            <span className="room-type">{hab.tipo}</span>
                                        </div>
                                        <div className="room-floor">Piso {hab.piso}</div>
                                        <button className="btn btn-success btn-sm w-full">
                                            <Check size={14} />
                                            Marcar Limpia
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="no-rooms">No hay habitaciones en limpieza</p>
                            )}
                        </div>
                    </div>

                    <div className="card status-section">
                        <h3 className="section-title">
                            <span className="status-indicator disponible"></span>
                            Listas para Ocupar
                        </h3>
                        <div className="status-rooms">
                            {habitaciones.filter(h => h.estado === 'disponible').map((hab) => (
                                <div key={hab.id} className="status-room-card disponible">
                                    <div className="room-header">
                                        <span className="room-number">{hab.numero}</span>
                                        <span className="room-type">{hab.tipo}</span>
                                    </div>
                                    <div className="room-floor">Piso {hab.piso}</div>
                                    <span className="badge badge-disponible">Disponible</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Mantenimiento Tab */}
            {activeTab === 'mantenimiento' && (
                <div className="card">
                    <div className="card-header">
                        <div>
                            <h3 className="card-title">Habitaciones en Mantenimiento</h3>
                            <p className="card-subtitle">Requieren reparación o inspección</p>
                        </div>
                    </div>
                    <div className="mantenimiento-list">
                        {habitacionesMantenimiento.length > 0 ? (
                            habitacionesMantenimiento.map((hab) => {
                                const orden = ordenesLimpieza.find(
                                    o => o.habitacionId === hab.id && o.tipo === 'mantenimiento'
                                );
                                return (
                                    <div key={hab.id} className="mantenimiento-item">
                                        <div className="mantenimiento-room">
                                            <BedDouble size={20} />
                                            <div>
                                                <span className="room-num">Habitación {hab.numero}</span>
                                                <span className="room-tipo">{hab.tipo} - Piso {hab.piso}</span>
                                            </div>
                                        </div>
                                        <div className="mantenimiento-issue">
                                            <AlertTriangle size={16} />
                                            <span>{orden?.notas || 'Sin descripción'}</span>
                                        </div>
                                        <div className="mantenimiento-assigned">
                                            <User size={16} />
                                            <span>{orden?.asignadoA || 'Sin asignar'}</span>
                                        </div>
                                        <span className={`badge badge-${orden?.estado || 'pendiente'}`}>
                                            {orden?.estado || 'pendiente'}
                                        </span>
                                        <button className="btn btn-primary btn-sm">
                                            Completar
                                        </button>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="empty-state">
                                <CheckCircle2 size={48} />
                                <h4>¡Todo en orden!</h4>
                                <p>No hay habitaciones en mantenimiento</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Órdenes Tab */}
            {activeTab === 'ordenes' && (
                <div className="card">
                    <div className="card-header">
                        <div>
                            <h3 className="card-title">Órdenes Activas</h3>
                            <p className="card-subtitle">Tareas de limpieza y mantenimiento</p>
                        </div>
                    </div>
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Habitación</th>
                                    <th>Tipo</th>
                                    <th>Asignado a</th>
                                    <th>Fecha</th>
                                    <th>Notas</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ordenesLimpieza.map((orden) => {
                                    const hab = habitaciones.find(h => h.id === orden.habitacionId);
                                    return (
                                        <tr key={orden.id}>
                                            <td>
                                                <div className="orden-habitacion">
                                                    <BedDouble size={16} />
                                                    <span>{hab?.numero}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`badge badge-${orden.tipo === 'limpieza' ? 'limpieza' : 'mantenimiento'}`}>
                                                    {orden.tipo}
                                                </span>
                                            </td>
                                            <td>{orden.asignadoA}</td>
                                            <td>{new Date(orden.fecha).toLocaleDateString('es-PE')}</td>
                                            <td className="notas-cell">{orden.notas}</td>
                                            <td>
                                                <span className={`badge badge-${orden.estado === 'en_proceso' ? 'limpieza' : 'pendiente'}`}>
                                                    {orden.estado.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td>
                                                <button className="btn btn-success btn-sm">
                                                    <Check size={14} />
                                                    Completar
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Limpieza;

