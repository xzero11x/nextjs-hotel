"use client";

import { useState } from 'react';
import {
    Search,
    Filter,
    User,
    Phone,
    Mail,
    Star,
    Clock,
    Eye,
    History,
    Edit,
    X
} from 'lucide-react';
import { huespedes, habitaciones, historialEstadias } from '@/data/mockData';
import './Huespedes.css';

function Huespedes() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEstado, setFilterEstado] = useState('todos');
    const [selectedHuesped, setSelectedHuesped] = useState(null);

    const filteredHuespedes = huespedes.filter(h => {
        const matchesSearch =
            h.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            h.dni.includes(searchTerm);
        const matchesEstado = filterEstado === 'todos' || h.estado === filterEstado;
        return matchesSearch && matchesEstado;
    });

    const getHabitacion = (habitacionId) => {
        return habitaciones.find(h => h.id === habitacionId);
    };

    const getHistorial = (huespedId) => {
        return historialEstadias.filter(h => h.huespedId === huespedId);
    };

    return (
        <div className="huespedes-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Gestión de Huéspedes</h1>
                    <p className="page-subtitle">Administra la información de los huéspedes</p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="quick-stats">
                <div className="quick-stat">
                    <span className="quick-stat-dot disponible"></span>
                    <span className="quick-stat-value">{huespedes.filter(h => h.estado === 'dentro').length}</span>
                    <span className="quick-stat-label">Dentro</span>
                </div>
                <div className="quick-stat">
                    <span className="quick-stat-dot" style={{ background: 'var(--info-500)' }}></span>
                    <span className="quick-stat-value">{huespedes.filter(h => h.estado === 'fuera').length}</span>
                    <span className="quick-stat-label">Fuera</span>
                </div>
                <div className="quick-stat">
                    <span className="quick-stat-dot limpieza"></span>
                    <span className="quick-stat-value">{huespedes.filter(h => h.estado === 'esperando').length}</span>
                    <span className="quick-stat-label">Esperando</span>
                </div>
                <div className="quick-stat">
                    <span className="quick-stat-dot" style={{ background: 'var(--accent-gold)' }}></span>
                    <span className="quick-stat-value">{huespedes.filter(h => h.esFrecuente).length}</span>
                    <span className="quick-stat-label">Frecuentes</span>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="filter-bar">
                <div className="search-input-wrapper" style={{ flex: 1, maxWidth: '400px' }}>
                    <Search className="search-icon" size={18} />
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Buscar por nombre o DNI..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <select
                    className="form-select"
                    value={filterEstado}
                    onChange={(e) => setFilterEstado(e.target.value)}
                >
                    <option value="todos">Todos los estados</option>
                    <option value="dentro">Dentro</option>
                    <option value="fuera">Fuera</option>
                    <option value="esperando">Esperando</option>
                </select>
            </div>

            {/* Huespedes List */}
            <div className="huespedes-grid">
                {filteredHuespedes.map((huesped) => {
                    const habitacion = getHabitacion(huesped.habitacionId);
                    return (
                        <div
                            key={huesped.id}
                            className="huesped-card"
                            onClick={() => setSelectedHuesped(huesped)}
                        >
                            <div className="huesped-card-header">
                                <div className="huesped-avatar">
                                    {huesped.nombre.charAt(0)}
                                    {huesped.esFrecuente && (
                                        <span className="frecuente-badge" title="Cliente frecuente">
                                            <Star size={12} fill="currentColor" />
                                        </span>
                                    )}
                                </div>
                                <div className="huesped-main-info">
                                    <h3 className="huesped-nombre">{huesped.nombre}</h3>
                                    <span className="huesped-dni">DNI: {huesped.dni}</span>
                                </div>
                                <span className={`badge badge-${huesped.estado}`}>
                                    {huesped.estado}
                                </span>
                            </div>
                            <div className="huesped-card-body">
                                <div className="huesped-detail">
                                    <Phone size={14} />
                                    <span>{huesped.telefono}</span>
                                </div>
                                <div className="huesped-detail">
                                    <Mail size={14} />
                                    <span>{huesped.email}</span>
                                </div>
                                {habitacion && (
                                    <div className="huesped-detail">
                                        <Clock size={14} />
                                        <span>Hab. {habitacion.numero} - {habitacion.tipo}</span>
                                    </div>
                                )}
                            </div>
                            <div className="huesped-card-footer">
                                <span className="huesped-procedencia">{huesped.procedencia}</span>
                                <button className="btn btn-ghost btn-sm">
                                    <Eye size={16} />
                                    Ver más
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal de Detalle */}
            {selectedHuesped && (
                <div className="modal-overlay" onClick={() => setSelectedHuesped(null)}>
                    <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Perfil del Huésped</h2>
                            <button className="modal-close" onClick={() => setSelectedHuesped(null)}>
                                <X size={24} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="huesped-profile">
                                <div className="profile-header">
                                    <div className="profile-avatar">
                                        {selectedHuesped.nombre.charAt(0)}
                                        {selectedHuesped.esFrecuente && (
                                            <span className="frecuente-badge-lg">
                                                <Star size={16} fill="currentColor" />
                                            </span>
                                        )}
                                    </div>
                                    <div className="profile-info">
                                        <h2>{selectedHuesped.nombre}</h2>
                                        <p>DNI: {selectedHuesped.dni}</p>
                                        <span className={`badge badge-${selectedHuesped.estado}`}>
                                            {selectedHuesped.estado}
                                        </span>
                                    </div>
                                </div>

                                <div className="profile-details-grid">
                                    <div className="profile-detail">
                                        <Phone size={16} />
                                        <div>
                                            <span className="detail-label">Teléfono</span>
                                            <span className="detail-value">{selectedHuesped.telefono}</span>
                                        </div>
                                    </div>
                                    <div className="profile-detail">
                                        <Mail size={16} />
                                        <div>
                                            <span className="detail-label">Email</span>
                                            <span className="detail-value">{selectedHuesped.email}</span>
                                        </div>
                                    </div>
                                </div>

                                {selectedHuesped.notas && (
                                    <div className="profile-notes">
                                        <h4>Notas</h4>
                                        <p>{selectedHuesped.notas}</p>
                                    </div>
                                )}

                                <div className="profile-historial">
                                    <h4>
                                        <History size={16} />
                                        Historial de Estadías
                                    </h4>
                                    <div className="historial-list">
                                        {getHistorial(selectedHuesped.id).length > 0 ? (
                                            getHistorial(selectedHuesped.id).map((estadia) => {
                                                const hab = getHabitacion(estadia.habitacionId);
                                                return (
                                                    <div key={estadia.id} className="historial-item">
                                                        <div className="historial-info">
                                                            <span className="historial-hab">Hab. {hab?.numero}</span>
                                                            <span className="historial-fechas">
                                                                {new Date(estadia.fechaInicio).toLocaleDateString('es-PE')} -
                                                                {new Date(estadia.fechaFin).toLocaleDateString('es-PE')}
                                                            </span>
                                                        </div>
                                                        <span className="historial-total">S/ {estadia.total}</span>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p className="no-historial">Primera estadía</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setSelectedHuesped(null)}>
                                Cerrar
                            </button>
                            <button className="btn btn-primary">
                                <Edit size={16} />
                                Editar Perfil
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Huespedes;

