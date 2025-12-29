"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    UserPlus,
    Search,
    BedDouble,
    User,
    Phone,
    Mail,
    MapPin,
    Calendar,
    Clock,
    Save,
    X,
    Check,
    DollarSign,
    FileText,
    Users,
    Globe,
    Loader2,
    AlertCircle,
    CalendarCheck
} from 'lucide-react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import './Checkin.css';

function Checkin({ initialHabitaciones = [], initialReservas = [], initialTarifas = [] }) {
    const router = useRouter();
    const [habitaciones, setHabitaciones] = useState(initialHabitaciones);
    const [reservas, setReservas] = useState(initialReservas);
    const [tarifas, setTarifas] = useState(initialTarifas);

    const [selectedRoom, setSelectedRoom] = useState(null);
    const [selectedReserva, setSelectedReserva] = useState(null);
    const [activeTab, setActiveTab] = useState('directo'); // 'directo' or 'reserva'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [searchingGuest, setSearchingGuest] = useState(false);

    // Form data
    const [formData, setFormData] = useState({
        tipo_documento: 'DNI',
        numero_documento: '',
        nombre: '',
        apellidos: '',
        telefono: '',
        email: '',
        procedencia: '',
        nacionalidad: 'Perú',
        es_extranjero: false,
        noches: 1,
        adultos: 1,
        ninos: 0,
        notas: ''
    });

    const [fechaSalida, setFechaSalida] = useState(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    });

    // Confirm dialog
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        title: '',
        message: '',
        variant: 'success',
        onConfirm: () => { },
        loading: false
    });

    // Clear messages
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(''), 4000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(''), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    // Update nights when date changes
    useEffect(() => {
        const today = new Date();
        const salida = new Date(fechaSalida);
        const noches = Math.ceil((salida - today) / (1000 * 60 * 60 * 24));
        setFormData(prev => ({ ...prev, noches: Math.max(1, noches) }));
    }, [fechaSalida]);

    // Search guest by document
    const searchGuest = async () => {
        if (!formData.numero_documento || formData.numero_documento.length < 6) return;

        try {
            setSearchingGuest(true);
            const response = await fetch(`/api/huespedes?documento=${formData.numero_documento}`);
            const data = await response.json();

            if (data.huespedes && data.huespedes.length > 0) {
                const guest = data.huespedes[0];
                setFormData(prev => ({
                    ...prev,
                    nombre: guest.nombre || '',
                    apellidos: guest.apellidos || '',
                    telefono: guest.telefono || '',
                    email: guest.email || '',
                    procedencia: guest.procedencia || '',
                    nacionalidad: guest.nacionalidad || 'Perú',
                    es_extranjero: guest.es_extranjero || false
                }));
                setSuccessMessage('Huésped encontrado - datos cargados');
            }
        } catch (err) {
            console.error('Error searching guest:', err);
        } finally {
            setSearchingGuest(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const getPrecio = () => {
        if (selectedRoom) {
            return selectedRoom.precio_base || 0;
        }
        return 0;
    };

    const calculateTotal = () => {
        const precio = getPrecio();
        return precio * formData.noches;
    };

    const handleSelectReserva = (reserva) => {
        setSelectedReserva(reserva);
        setSelectedRoom(reserva.habitacion);

        // Pre-fill form with reservation data
        setFormData(prev => ({
            ...prev,
            nombre: reserva.nombre_cliente || '',
            telefono: reserva.telefono_cliente || '',
            email: reserva.email_cliente || '',
            numero_documento: reserva.documento_cliente || ''
        }));

        // Calculate nights from reservation
        const inicio = new Date(reserva.fecha_inicio);
        const fin = new Date(reserva.fecha_fin);
        const noches = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24));
        setFormData(prev => ({ ...prev, noches }));
        setFechaSalida(reserva.fecha_fin);
    };

    const handleSubmitCheckin = async () => {
        // Validation
        if (!formData.numero_documento || !formData.nombre) {
            setError('DNI/Documento y nombre son obligatorios');
            return;
        }

        if (!selectedRoom) {
            setError('Debes seleccionar una habitación');
            return;
        }

        setConfirmDialog({
            isOpen: true,
            title: 'Confirmar Check-in',
            message: `¿Confirmar check-in de ${formData.nombre} en la habitación ${selectedRoom.numero}?`,
            variant: 'success',
            confirmText: 'Confirmar Check-in',
            loading: false,
            onConfirm: async () => {
                try {
                    setConfirmDialog(prev => ({ ...prev, loading: true }));

                    const response = await fetch('/api/estadias/checkin', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            ...formData,
                            habitacion_id: selectedRoom.id,
                            reserva_id: selectedReserva?.id || null,
                            fecha_checkout_prevista: fechaSalida,
                            precio_noche: getPrecio()
                        })
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(data.error || 'Error en el check-in');
                    }

                    setSuccessMessage(`Check-in exitoso! Habitación ${selectedRoom.numero} ocupada.`);
                    setConfirmDialog(prev => ({ ...prev, isOpen: false }));

                    // Reset form
                    setFormData({
                        tipo_documento: 'DNI',
                        numero_documento: '',
                        nombre: '',
                        apellidos: '',
                        telefono: '',
                        email: '',
                        procedencia: '',
                        nacionalidad: 'Perú',
                        es_extranjero: false,
                        noches: 1,
                        adultos: 1,
                        ninos: 0,
                        notas: ''
                    });
                    setSelectedRoom(null);
                    setSelectedReserva(null);

                    // Refresh data
                    router.refresh();

                } catch (err) {
                    setError(err.message);
                    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                }
            }
        });
    };

    const habitacionesDisponibles = habitaciones.filter(h => h.estado === 'disponible');

    return (
        <div className="checkin-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Check-in</h1>
                    <p className="page-subtitle">Registro de entrada de huéspedes</p>
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

            {/* Tabs */}
            <div className="tabs mb-4">
                <button
                    className={`tab ${activeTab === 'directo' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('directo'); setSelectedReserva(null); }}
                >
                    <UserPlus size={18} />
                    Check-in Directo
                </button>
                <button
                    className={`tab ${activeTab === 'reserva' ? 'active' : ''}`}
                    onClick={() => setActiveTab('reserva')}
                >
                    <CalendarCheck size={18} />
                    Desde Reserva ({reservas.length})
                </button>
            </div>

            <div className="checkin-content">
                {/* Left Panel - Room Selection / Reservations */}
                <div className="checkin-panel">
                    {activeTab === 'reserva' ? (
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">Reservas Pendientes</h3>
                            </div>
                            {reservas.length === 0 ? (
                                <div className="empty-state-sm">
                                    <CalendarCheck size={32} style={{ opacity: 0.3 }} />
                                    <p>No hay reservas pendientes</p>
                                </div>
                            ) : (
                                <div className="reservas-list">
                                    {reservas.map(reserva => (
                                        <div
                                            key={reserva.id}
                                            className={`reserva-item ${selectedReserva?.id === reserva.id ? 'selected' : ''}`}
                                            onClick={() => handleSelectReserva(reserva)}
                                        >
                                            <div className="reserva-info">
                                                <span className="reserva-nombre">{reserva.nombre_cliente}</span>
                                                <span className="reserva-fechas">
                                                    {new Date(reserva.fecha_inicio).toLocaleDateString('es-PE')} - {new Date(reserva.fecha_fin).toLocaleDateString('es-PE')}
                                                </span>
                                            </div>
                                            <div className="reserva-hab">
                                                <BedDouble size={16} />
                                                <span>{reserva.habitacion?.numero}</span>
                                            </div>
                                            <span className={`badge badge-${reserva.estado === 'confirmada' ? 'success' : 'warning'}`}>
                                                {reserva.estado}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">Habitaciones Disponibles</h3>
                                <span className="card-subtitle">{habitacionesDisponibles.length} disponibles</span>
                            </div>
                            {habitacionesDisponibles.length === 0 ? (
                                <div className="empty-state-sm">
                                    <BedDouble size={32} style={{ opacity: 0.3 }} />
                                    <p>No hay habitaciones disponibles</p>
                                </div>
                            ) : (
                                <div className="rooms-selection">
                                    {habitacionesDisponibles.map(room => (
                                        <div
                                            key={room.id}
                                            className={`room-select-card ${selectedRoom?.id === room.id ? 'selected' : ''}`}
                                            onClick={() => setSelectedRoom(room)}
                                        >
                                            <div className="room-number">{room.numero}</div>
                                            <div className="room-type">{room.tipo}</div>
                                            <div className="room-price">S/ {room.precio_base}</div>
                                            <div className="room-capacity">
                                                <Users size={14} />
                                                {room.capacidad}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Panel - Guest Form */}
                <div className="checkin-form-panel">
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Datos del Huésped</h3>
                        </div>
                        <div className="card-body">
                            {/* Document Search */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Tipo Documento</label>
                                    <select
                                        className="form-select"
                                        name="tipo_documento"
                                        value={formData.tipo_documento}
                                        onChange={handleInputChange}
                                    >
                                        <option value="DNI">DNI</option>
                                        <option value="PASAPORTE">Pasaporte</option>
                                        <option value="CE">Carnet Extranjería</option>
                                    </select>
                                </div>
                                <div className="form-group flex-2">
                                    <label className="form-label">Número Documento *</label>
                                    <div className="input-with-button">
                                        <input
                                            type="text"
                                            className="form-input"
                                            name="numero_documento"
                                            value={formData.numero_documento}
                                            onChange={handleInputChange}
                                            placeholder="Ingresa el documento"
                                            onBlur={searchGuest}
                                        />
                                        <button
                                            className="btn btn-icon"
                                            onClick={searchGuest}
                                            disabled={searchingGuest}
                                        >
                                            {searchingGuest ? <Loader2 size={18} className="spinner" /> : <Search size={18} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Nombres *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleInputChange}
                                        placeholder="Nombres"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Apellidos</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        name="apellidos"
                                        value={formData.apellidos}
                                        onChange={handleInputChange}
                                        placeholder="Apellidos"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label"><Phone size={14} /> Teléfono</label>
                                    <input
                                        type="tel"
                                        className="form-input"
                                        name="telefono"
                                        value={formData.telefono}
                                        onChange={handleInputChange}
                                        placeholder="987654321"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label"><Mail size={14} /> Email</label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="correo@email.com"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label"><MapPin size={14} /> Procedencia</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        name="procedencia"
                                        value={formData.procedencia}
                                        onChange={handleInputChange}
                                        placeholder="Ciudad de origen"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label"><Globe size={14} /> Nacionalidad</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        name="nacionalidad"
                                        value={formData.nacionalidad}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="form-divider"></div>

                            <h4 className="form-section-title"><Calendar size={16} /> Estadía</h4>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Fecha Salida</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={fechaSalida}
                                        onChange={(e) => setFechaSalida(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Noches</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        name="noches"
                                        value={formData.noches}
                                        onChange={handleInputChange}
                                        min="1"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Adultos</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        name="adultos"
                                        value={formData.adultos}
                                        onChange={handleInputChange}
                                        min="1"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Niños</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        name="ninos"
                                        value={formData.ninos}
                                        onChange={handleInputChange}
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label"><FileText size={14} /> Notas</label>
                                <textarea
                                    className="form-input"
                                    name="notas"
                                    value={formData.notas}
                                    onChange={handleInputChange}
                                    rows="2"
                                    placeholder="Observaciones..."
                                />
                            </div>

                            {/* Summary */}
                            {selectedRoom && (
                                <div className="checkin-summary">
                                    <div className="summary-row">
                                        <span>Habitación:</span>
                                        <span><strong>{selectedRoom.numero}</strong> - {selectedRoom.tipo}</span>
                                    </div>
                                    <div className="summary-row">
                                        <span>Precio/noche:</span>
                                        <span>S/ {getPrecio().toFixed(2)}</span>
                                    </div>
                                    <div className="summary-row">
                                        <span>Noches:</span>
                                        <span>{formData.noches}</span>
                                    </div>
                                    <div className="summary-row total">
                                        <span>Total Estimado:</span>
                                        <span>S/ {calculateTotal().toFixed(2)}</span>
                                    </div>
                                </div>
                            )}

                            <button
                                className="btn btn-primary btn-lg btn-block"
                                onClick={handleSubmitCheckin}
                                disabled={!selectedRoom || !formData.numero_documento || !formData.nombre || loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={20} className="spinner" />
                                        Procesando...
                                    </>
                                ) : (
                                    <>
                                        <Check size={20} />
                                        Confirmar Check-in
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

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

export default Checkin;
