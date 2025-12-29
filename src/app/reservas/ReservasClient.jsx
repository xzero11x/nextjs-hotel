"use client";

import { useState, useEffect } from 'react';
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
    Phone,
    Loader2,
    AlertCircle,
    RefreshCw,
    Calendar,
    Mail,
    FileText
} from 'lucide-react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import './Reservas.css';

function Reservas({ initialReservas = [], initialHabitaciones = [] }) {
    const [reservas, setReservas] = useState(initialReservas);
    const [habitaciones, setHabitaciones] = useState(initialHabitaciones);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const [currentDate, setCurrentDate] = useState(new Date());
    const [activeTab, setActiveTab] = useState('lista');
    const [selectedReserva, setSelectedReserva] = useState(null);
    const [showNewModal, setShowNewModal] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');

    // Confirm dialog
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        title: '',
        message: '',
        variant: 'danger',
        confirmText: 'Confirmar',
        onConfirm: () => { },
        loading: false
    });

    // New reservation form
    const [formData, setFormData] = useState({
        habitacion_id: '',
        nombre_cliente: '',
        documento_cliente: '',
        telefono_cliente: '',
        email_cliente: '',
        fecha_inicio: '',
        fecha_fin: '',
        precio_noche: '',
        adelanto: 0,
        origen: 'directo',
        notas: ''
    });

    // Available rooms for selected dates
    const [availableRooms, setAvailableRooms] = useState([]);
    const [checkingAvailability, setCheckingAvailability] = useState(false);

    // Clear success message after 3 seconds
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    const fetchReservas = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/reservas');
            const data = await response.json();

            if (!response.ok) throw new Error(data.error);

            setReservas(data.reservas || []);
            setError('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const checkAvailability = async () => {
        if (!formData.fecha_inicio || !formData.fecha_fin) return;

        try {
            setCheckingAvailability(true);
            const response = await fetch('/api/reservas/disponibilidad', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fecha_inicio: formData.fecha_inicio,
                    fecha_fin: formData.fecha_fin
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            setAvailableRooms(data.habitaciones.filter(h => h.disponible));
        } catch (err) {
            console.error('Error checking availability:', err);
        } finally {
            setCheckingAvailability(false);
        }
    };

    // Check availability when dates change
    useEffect(() => {
        if (formData.fecha_inicio && formData.fecha_fin && showNewModal) {
            checkAvailability();
        }
    }, [formData.fecha_inicio, formData.fecha_fin, showNewModal]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Auto-set price when room is selected
        if (name === 'habitacion_id' && value) {
            const room = availableRooms.find(r => r.id === value);
            if (room) {
                setFormData(prev => ({ ...prev, precio_noche: room.precio_base }));
            }
        }
    };

    const handleSubmitReserva = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError('');

        try {
            const response = await fetch('/api/reservas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            setSuccessMessage('Reserva creada exitosamente');
            setShowNewModal(false);
            setFormData({
                habitacion_id: '',
                nombre_cliente: '',
                documento_cliente: '',
                telefono_cliente: '',
                email_cliente: '',
                fecha_inicio: '',
                fecha_fin: '',
                precio_noche: '',
                adelanto: 0,
                origen: 'directo',
                notas: ''
            });
            fetchReservas();
        } catch (err) {
            setFormError(err.message);
        } finally {
            setFormLoading(false);
        }
    };

    const handleConfirmReserva = (reserva) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Confirmar Reserva',
            message: `¿Deseas confirmar la reserva de ${reserva.nombre_cliente} para la habitación ${reserva.habitacion?.numero}?`,
            variant: 'success',
            confirmText: 'Confirmar',
            loading: false,
            onConfirm: async () => {
                try {
                    setConfirmDialog(prev => ({ ...prev, loading: true }));
                    const response = await fetch(`/api/reservas/${reserva.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ estado: 'confirmada' })
                    });
                    if (!response.ok) throw new Error('Error al confirmar');
                    setSuccessMessage('Reserva confirmada');
                    fetchReservas();
                    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                } catch (err) {
                    setError(err.message);
                    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                }
            }
        });
    };

    const handleCancelReserva = (reserva) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Cancelar Reserva',
            message: `¿Estás seguro de cancelar la reserva de ${reserva.nombre_cliente}?`,
            variant: 'danger',
            confirmText: 'Cancelar Reserva',
            loading: false,
            onConfirm: async () => {
                try {
                    setConfirmDialog(prev => ({ ...prev, loading: true }));
                    const response = await fetch(`/api/reservas/${reserva.id}`, {
                        method: 'DELETE'
                    });
                    if (!response.ok) throw new Error('Error al cancelar');
                    setSuccessMessage('Reserva cancelada');
                    fetchReservas();
                    setSelectedReserva(null);
                    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                } catch (err) {
                    setError(err.message);
                    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                }
            }
        });
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        const days = [];

        for (let i = 0; i < startingDay; i++) {
            const prevDate = new Date(year, month, -startingDay + i + 1);
            days.push({ date: prevDate, isCurrentMonth: false });
        }

        for (let i = 1; i <= daysInMonth; i++) {
            days.push({ date: new Date(year, month, i), isCurrentMonth: true });
        }

        return days;
    };

    const getReservasForDate = (date) => {
        const dateStr = date.toISOString().split('T')[0];
        return reservas.filter(r => {
            const inicio = r.fecha_inicio;
            const fin = r.fecha_fin;
            return dateStr >= inicio && dateStr <= fin;
        });
    };

    const navigateMonth = (direction) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() + direction);
            return newDate;
        });
    };

    const getEstadoBadgeClass = (estado) => {
        switch (estado) {
            case 'confirmada': return 'success';
            case 'pendiente': return 'warning';
            case 'cancelada': return 'danger';
            case 'checkin': return 'primary';
            case 'no_show': return 'secondary';
            default: return 'secondary';
        }
    };

    const stats = {
        confirmadas: reservas.filter(r => r.estado === 'confirmada').length,
        pendientes: reservas.filter(r => r.estado === 'pendiente').length,
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
                    <button className="btn btn-secondary" onClick={fetchReservas} disabled={loading}>
                        <RefreshCw size={18} className={loading ? 'spinner' : ''} />
                        Actualizar
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowNewModal(true)}>
                        <Plus size={18} />
                        Nueva Reserva
                    </button>
                </div>
            </div>

            {/* Messages */}
            {error && (
                <div className="alert alert-error mb-4">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}
            {successMessage && (
                <div className="alert alert-success mb-4">
                    <Check size={20} />
                    <span>{successMessage}</span>
                </div>
            )}

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
                    <span className="stat-value">{stats.pendientes}</span>
                    <span className="stat-label">Pendientes</span>
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
                    {reservas.length === 0 ? (
                        <div className="empty-state">
                            <CalendarCheck size={48} style={{ opacity: 0.3 }} />
                            <p>No hay reservas registradas</p>
                            <button className="btn btn-primary" onClick={() => setShowNewModal(true)}>
                                <Plus size={16} />
                                Crear primera reserva
                            </button>
                        </div>
                    ) : (
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
                                    {reservas.map((reserva) => (
                                        <tr key={reserva.id}>
                                            <td>
                                                <div className="reserva-huesped">
                                                    <div className="avatar avatar-sm">
                                                        {reserva.nombre_cliente?.charAt(0) || '?'}
                                                    </div>
                                                    <div>
                                                        <span className="huesped-nombre">{reserva.nombre_cliente}</span>
                                                        <span className="huesped-telefono">{reserva.telefono_cliente}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="reserva-habitacion">
                                                    <BedDouble size={16} />
                                                    <span>
                                                        {reserva.habitacion?.numero || 'N/A'} - {reserva.habitacion?.tipo || ''}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>{new Date(reserva.fecha_inicio).toLocaleDateString('es-PE')}</td>
                                            <td>{new Date(reserva.fecha_fin).toLocaleDateString('es-PE')}</td>
                                            <td className="monto-cell">S/ {reserva.total_estimado?.toFixed(2) || '0.00'}</td>
                                            <td>
                                                <span className={`badge badge-${getEstadoBadgeClass(reserva.estado)}`}>
                                                    {reserva.estado?.replace('_', ' ')}
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
                                                    {reserva.estado === 'pendiente' && (
                                                        <button
                                                            className="btn btn-success btn-sm"
                                                            onClick={() => handleConfirmReserva(reserva)}
                                                        >
                                                            <Check size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
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
                                    className={`calendario-day ${!day.isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${dayReservas.length > 0 ? 'has-reservas' : ''}`}
                                >
                                    <span className="day-number">{day.date.getDate()}</span>
                                    {dayReservas.length > 0 && (
                                        <div className="day-reservas">
                                            {dayReservas.slice(0, 2).map(r => (
                                                <div key={r.id} className={`reserva-dot ${r.estado}`} title={r.nombre_cliente}></div>
                                            ))}
                                            {dayReservas.length > 2 && (
                                                <span className="more-reservas">+{dayReservas.length - 2}</span>
                                            )}
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
                            <span className="legend-dot pendiente"></span>
                            <span>Pendiente</span>
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
                                    <p><strong>Nombre:</strong> {selectedReserva.nombre_cliente}</p>
                                    <p><strong>Documento:</strong> {selectedReserva.documento_cliente || 'N/A'}</p>
                                    <p><strong>Teléfono:</strong> {selectedReserva.telefono_cliente || 'N/A'}</p>
                                    <p><strong>Email:</strong> {selectedReserva.email_cliente || 'N/A'}</p>
                                </div>
                                <div className="detail-section">
                                    <h4><BedDouble size={16} /> Habitación</h4>
                                    <p><strong>Número:</strong> {selectedReserva.habitacion?.numero}</p>
                                    <p><strong>Tipo:</strong> {selectedReserva.habitacion?.tipo}</p>
                                    <p><strong>Precio:</strong> S/ {selectedReserva.precio_noche}/noche</p>
                                </div>
                                <div className="detail-section">
                                    <h4><CalendarCheck size={16} /> Fechas</h4>
                                    <p><strong>Inicio:</strong> {new Date(selectedReserva.fecha_inicio).toLocaleDateString('es-PE')}</p>
                                    <p><strong>Fin:</strong> {new Date(selectedReserva.fecha_fin).toLocaleDateString('es-PE')}</p>
                                    <p><strong>Origen:</strong> {selectedReserva.origen}</p>
                                </div>
                                <div className="detail-section">
                                    <h4>Estado y Pago</h4>
                                    <span className={`badge badge-${getEstadoBadgeClass(selectedReserva.estado)}`}>
                                        {selectedReserva.estado?.replace('_', ' ')}
                                    </span>
                                    <p className="total-reserva"><strong>Adelanto:</strong> S/ {selectedReserva.adelanto?.toFixed(2) || '0.00'}</p>
                                    <p className="total-reserva"><strong>Total:</strong> S/ {selectedReserva.total_estimado?.toFixed(2) || '0.00'}</p>
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
                            {selectedReserva.estado !== 'cancelada' && (
                                <button
                                    className="btn btn-danger"
                                    onClick={() => handleCancelReserva(selectedReserva)}
                                >
                                    Cancelar Reserva
                                </button>
                            )}
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

            {/* Modal Nueva Reserva */}
            {showNewModal && (
                <div className="modal-overlay" onClick={() => setShowNewModal(false)}>
                    <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Nueva Reserva</h2>
                            <button className="modal-close" onClick={() => setShowNewModal(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmitReserva}>
                            <div className="modal-body">
                                {formError && (
                                    <div className="alert alert-error mb-4">
                                        <AlertCircle size={18} />
                                        <span>{formError}</span>
                                    </div>
                                )}

                                <div className="form-section">
                                    <h4><Calendar size={16} /> Fechas de Estadía</h4>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Fecha Inicio *</label>
                                            <input
                                                type="date"
                                                className="form-input"
                                                name="fecha_inicio"
                                                value={formData.fecha_inicio}
                                                onChange={handleInputChange}
                                                min={new Date().toISOString().split('T')[0]}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Fecha Fin *</label>
                                            <input
                                                type="date"
                                                className="form-input"
                                                name="fecha_fin"
                                                value={formData.fecha_fin}
                                                onChange={handleInputChange}
                                                min={formData.fecha_inicio || new Date().toISOString().split('T')[0]}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="form-section">
                                    <h4><BedDouble size={16} /> Habitación Disponible</h4>
                                    {checkingAvailability ? (
                                        <div className="checking-availability">
                                            <Loader2 size={20} className="spinner" />
                                            <span>Verificando disponibilidad...</span>
                                        </div>
                                    ) : availableRooms.length > 0 ? (
                                        <div className="form-group">
                                            <label className="form-label">Seleccionar Habitación *</label>
                                            <select
                                                className="form-select"
                                                name="habitacion_id"
                                                value={formData.habitacion_id}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="">-- Seleccionar --</option>
                                                {availableRooms.map(room => (
                                                    <option key={room.id} value={room.id}>
                                                        {room.numero} - {room.tipo} (S/ {room.precio_base}/noche)
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    ) : formData.fecha_inicio && formData.fecha_fin ? (
                                        <div className="no-rooms-available">
                                            <AlertCircle size={20} />
                                            <span>No hay habitaciones disponibles para las fechas seleccionadas</span>
                                        </div>
                                    ) : (
                                        <p className="form-hint">Selecciona las fechas para ver habitaciones disponibles</p>
                                    )}
                                </div>

                                <div className="form-section">
                                    <h4><User size={16} /> Datos del Cliente</h4>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Nombre Completo *</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                name="nombre_cliente"
                                                value={formData.nombre_cliente}
                                                onChange={handleInputChange}
                                                placeholder="Ej: Juan Pérez García"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">DNI / Documento</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                name="documento_cliente"
                                                value={formData.documento_cliente}
                                                onChange={handleInputChange}
                                                placeholder="Ej: 12345678"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Teléfono</label>
                                            <input
                                                type="tel"
                                                className="form-input"
                                                name="telefono_cliente"
                                                value={formData.telefono_cliente}
                                                onChange={handleInputChange}
                                                placeholder="Ej: 987654321"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Email</label>
                                            <input
                                                type="email"
                                                className="form-input"
                                                name="email_cliente"
                                                value={formData.email_cliente}
                                                onChange={handleInputChange}
                                                placeholder="Ej: correo@email.com"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="form-section">
                                    <h4><FileText size={16} /> Información Adicional</h4>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Precio por Noche (S/)</label>
                                            <input
                                                type="number"
                                                className="form-input"
                                                name="precio_noche"
                                                value={formData.precio_noche}
                                                onChange={handleInputChange}
                                                step="0.01"
                                                min="0"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Adelanto (S/)</label>
                                            <input
                                                type="number"
                                                className="form-input"
                                                name="adelanto"
                                                value={formData.adelanto}
                                                onChange={handleInputChange}
                                                step="0.01"
                                                min="0"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Origen</label>
                                            <select
                                                className="form-select"
                                                name="origen"
                                                value={formData.origen}
                                                onChange={handleInputChange}
                                            >
                                                <option value="directo">Directo</option>
                                                <option value="telefono">Teléfono</option>
                                                <option value="whatsapp">WhatsApp</option>
                                                <option value="booking">Booking.com</option>
                                                <option value="otro">Otro</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Notas</label>
                                        <textarea
                                            className="form-input"
                                            name="notas"
                                            value={formData.notas}
                                            onChange={handleInputChange}
                                            rows="2"
                                            placeholder="Observaciones adicionales..."
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowNewModal(false)}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={formLoading || !formData.habitacion_id}
                                >
                                    {formLoading ? (
                                        <>
                                            <Loader2 size={16} className="spinner" />
                                            Creando...
                                        </>
                                    ) : (
                                        <>
                                            <Plus size={16} />
                                            Crear Reserva
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirm Dialog */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                onClose={() => !confirmDialog.loading && setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmDialog.onConfirm}
                title={confirmDialog.title}
                message={confirmDialog.message}
                variant={confirmDialog.variant}
                confirmText={confirmDialog.confirmText}
                loading={confirmDialog.loading}
            />
        </div>
    );
}

export default Reservas;
