"use client";

import { useState } from 'react';
import {
    CalendarCheck,
    Plus,
    ChevronLeft,
    ChevronRight,
    Search,
    Eye,
    Edit,
    X,
    Check,
    Clock,
    BedDouble,
    User,
    Phone
} from 'lucide-react';
import { reservas, habitaciones } from '@/data/mockData';
import './Reservas.css';

function Reservas() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [activeTab, setActiveTab] = useState('lista');
    const [selectedReserva, setSelectedReserva] = useState(null);

    const getHabitacion = (habitacionId) => habitaciones.find(h => h.id === habitacionId);

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        const days = [];

        // Previous month days
        for (let i = 0; i < startingDay; i++) {
            const prevDate = new Date(year, month, -startingDay + i + 1);
            days.push({ date: prevDate, isCurrentMonth: false });
        }

        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({ date: new Date(year, month, i), isCurrentMonth: true });
        }

        return days;
    };

    const getReservasForDate = (date) => {
        const dateStr = date.toISOString().split('T')[0];
        return reservas.filter(r => r.fechaInicio === dateStr || r.fechaFin === dateStr);
    };

    const navigateMonth = (direction) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() + direction);
            return newDate;
        });
    };

    const stats = {
        confirmadas: reservas.filter(r => r.estado === 'confirmada').length,
        enEspera: reservas.filter(r => r.estado === 'en_espera').length,
        canceladas: reservas.filter(r => r.estado === 'cancelada').length,
        total: reservas.length
    };

    return (
        <div className="reservas-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Gestión de Reservas</h1>
                    <p className="page-subtitle">Administra las reservaciones anticipadas</p>
                </div>
                <div className="page-header-actions">
                    <button className="btn btn-primary">
                        <Plus size={18} />
                        Nueva Reserva
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="reservas-stats">
                <div className="reserva-stat">
                    <span className="stat-value">{stats.total}</span>
                    <span className="stat-label">Total</span>
                </div>
                <div className="reserva-stat confirmada">
                    <span className="stat-value">{stats.confirmadas}</span>
                    <span className="stat-label">Confirmadas</span>
                </div>
                <div className="reserva-stat en_espera">
                    <span className="stat-value">{stats.enEspera}</span>
                    <span className="stat-label">En espera</span>
                </div>
                <div className="reserva-stat cancelada">
                    <span className="stat-value">{stats.canceladas}</span>
                    <span className="stat-label">Canceladas</span>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'lista' ? 'active' : ''}`}
                    onClick={() => setActiveTab('lista')}
                >
                    Lista de Reservas
                </button>
                <button
                    className={`tab ${activeTab === 'calendario' ? 'active' : ''}`}
                    onClick={() => setActiveTab('calendario')}
                >
                    Calendario
                </button>
            </div>

            {/* Lista Tab */}
            {activeTab === 'lista' && (
                <div className="card">
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Huésped</th>
                                    <th>Habitación</th>
                                    <th>Fecha Inicio</th>
                                    <th>Fecha Fin</th>
                                    <th>Total</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reservas.map((reserva) => {
                                    const habitacion = getHabitacion(reserva.habitacionId);
                                    return (
                                        <tr key={reserva.id}>
                                            <td>
                                                <div className="reserva-huesped">
                                                    <div className="avatar avatar-sm">{reserva.huespedNombre.charAt(0)}</div>
                                                    <div>
                                                        <span className="huesped-nombre">{reserva.huespedNombre}</span>
                                                        <span className="huesped-telefono">{reserva.telefono}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="reserva-habitacion">
                                                    <BedDouble size={16} />
                                                    <span>{habitacion?.numero} - {habitacion?.tipo}</span>
                                                </div>
                                            </td>
                                            <td>{new Date(reserva.fechaInicio).toLocaleDateString('es-PE')}</td>
                                            <td>{new Date(reserva.fechaFin).toLocaleDateString('es-PE')}</td>
                                            <td className="monto-cell">S/ {reserva.total}</td>
                                            <td>
                                                <span className={`badge badge-${reserva.estado}`}>
                                                    {reserva.estado.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="table-actions">
                                                    <button
                                                        className="btn btn-ghost btn-sm"
                                                        onClick={() => setSelectedReserva(reserva)}
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    {reserva.estado === 'confirmada' && (
                                                        <button className="btn btn-success btn-sm">
                                                            <Check size={16} />
                                                            Check-in
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Calendario Tab */}
            {activeTab === 'calendario' && (
                <div className="card calendario-card">
                    <div className="calendario-header">
                        <button className="btn btn-ghost btn-icon" onClick={() => navigateMonth(-1)}>
                            <ChevronLeft size={20} />
                        </button>
                        <h3 className="calendario-title">
                            {currentDate.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })}
                        </h3>
                        <button className="btn btn-ghost btn-icon" onClick={() => navigateMonth(1)}>
                            <ChevronRight size={20} />
                        </button>
                    </div>
                    <div className="calendario-grid">
                        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                            <div key={day} className="calendario-day-header">{day}</div>
                        ))}
                        {getDaysInMonth(currentDate).map((day, index) => {
                            const dayReservas = getReservasForDate(day.date);
                            const isToday = day.date.toDateString() === new Date().toDateString();
                            return (
                                <div
                                    key={index}
                                    className={`calendario-day ${!day.isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`}
                                >
                                    <span className="day-number">{day.date.getDate()}</span>
                                    {dayReservas.length > 0 && (
                                        <div className="day-reservas">
                                            {dayReservas.slice(0, 2).map(r => (
                                                <div key={r.id} className={`reserva-dot ${r.estado}`}></div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <div className="calendario-legend">
                        <div className="legend-item">
                            <span className="legend-dot confirmada"></span>
                            <span>Confirmada</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-dot en_espera"></span>
                            <span>En espera</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-dot cancelada"></span>
                            <span>Cancelada</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Detalle */}
            {selectedReserva && (
                <div className="modal-overlay" onClick={() => setSelectedReserva(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Detalle de Reserva</h2>
                            <button className="modal-close" onClick={() => setSelectedReserva(null)}>
                                <X size={24} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="reserva-detail-grid">
                                <div className="detail-section">
                                    <h4><User size={16} /> Datos del Huésped</h4>
                                    <p><strong>Nombre:</strong> {selectedReserva.huespedNombre}</p>
                                    <p><strong>DNI:</strong> {selectedReserva.dni}</p>
                                    <p><strong>Teléfono:</strong> {selectedReserva.telefono}</p>
                                </div>
                                <div className="detail-section">
                                    <h4><BedDouble size={16} /> Habitación</h4>
                                    {(() => {
                                        const hab = getHabitacion(selectedReserva.habitacionId);
                                        return (
                                            <>
                                                <p><strong>Número:</strong> {hab?.numero}</p>
                                                <p><strong>Tipo:</strong> {hab?.tipo}</p>
                                                <p><strong>Precio:</strong> S/ {hab?.precioActual}/noche</p>
                                            </>
                                        );
                                    })()}
                                </div>
                                <div className="detail-section">
                                    <h4><CalendarCheck size={16} /> Fechas</h4>
                                    <p><strong>Inicio:</strong> {new Date(selectedReserva.fechaInicio).toLocaleDateString('es-PE')}</p>
                                    <p><strong>Fin:</strong> {new Date(selectedReserva.fechaFin).toLocaleDateString('es-PE')}</p>
                                </div>
                                <div className="detail-section">
                                    <h4>Estado</h4>
                                    <span className={`badge badge-${selectedReserva.estado}`}>
                                        {selectedReserva.estado.replace('_', ' ')}
                                    </span>
                                    <p className="total-reserva"><strong>Total:</strong> S/ {selectedReserva.total}</p>
                                </div>
                            </div>
                            {selectedReserva.notas && (
                                <div className="reserva-notas">
                                    <h4>Notas</h4>
                                    <p>{selectedReserva.notas}</p>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setSelectedReserva(null)}>
                                Cerrar
                            </button>
                            {selectedReserva.estado === 'confirmada' && (
                                <button className="btn btn-success">
                                    <Check size={16} />
                                    Convertir a Check-in
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Reservas;

