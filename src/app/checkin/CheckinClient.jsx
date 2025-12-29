"use client";

import { useState } from 'react';
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
    CreditCard,
    Save,
    X,
    Check,
    Banknote,
    Building2,
    Smartphone,
    DollarSign
} from 'lucide-react';
import { habitaciones, tarifas } from '@/data/mockData';
import './Checkin.css';

function Checkin() {
    const [step, setStep] = useState(1);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [selectedTarifa, setSelectedTarifa] = useState('temporadaMedia'); // temporadaBaja, temporadaMedia, temporadaAlta
    const [formData, setFormData] = useState({
        nombre: '',
        dni: '',
        telefono: '',
        email: '',
        procedencia: '',
        numHuespedes: 1,
        fechaLlegada: new Date().toISOString().split('T')[0],
        horaLlegada: new Date().toTimeString().slice(0, 5),
        fechaSalida: '',
        horaSalida: '12:00',
        observaciones: '',
        metodoPago: 'efectivo'
    });

    const availableRooms = habitaciones.filter(r => r.estado === 'disponible');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const getPrecioByTarifa = (room) => {
        if (!room) return 0;
        const tarifa = tarifas.find(t => t.tipo === room.tipo);
        if (!tarifa) return room.precioActual;
        return tarifa[selectedTarifa] || tarifa.precioBase;
    };

    const calculateTotal = () => {
        if (!selectedRoom || !formData.fechaSalida) return 0;
        const llegada = new Date(formData.fechaLlegada);
        const salida = new Date(formData.fechaSalida);
        const dias = Math.ceil((salida - llegada) / (1000 * 60 * 60 * 24));
        const precioNoche = getPrecioByTarifa(selectedRoom);
        return dias * precioNoche;
    };

    return (
        <div className="checkin-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Nuevo Check-in</h1>
                    <p className="page-subtitle">Registra la entrada de un nuevo huésped</p>
                </div>
            </div>

            {/* Progress Steps */}
            <div className="progress-steps">
                <div className={`progress-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                    <div className="step-number">{step > 1 ? <Check size={16} /> : '1'}</div>
                    <span className="step-label">Seleccionar Habitación</span>
                </div>
                <div className="progress-line"></div>
                <div className={`progress-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                    <div className="step-number">{step > 2 ? <Check size={16} /> : '2'}</div>
                    <span className="step-label">Datos del Huésped</span>
                </div>
                <div className="progress-line"></div>
                <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
                    <div className="step-number">3</div>
                    <span className="step-label">Confirmar y Pagar</span>
                </div>
            </div>

            {/* Step 1: Select Room */}
            {step === 1 && (
                <div className="step-content">
                    <h2 className="step-title">Selecciona una habitación disponible</h2>

                    {/* Tarifa Selector */}
                    <div className="card" style={{ marginBottom: '1.5rem' }}>
                        <div className="card-header">
                            <div>
                                <h3 className="card-title">Tipo de Tarifa</h3>
                                <p className="card-subtitle">Selecciona la temporada para ver los precios correspondientes</p>
                            </div>
                        </div>
                        <div className="payment-methods" style={{ padding: '1rem' }}>
                            <label
                                className={`payment-method ${selectedTarifa === 'temporadaBaja' ? 'selected' : ''}`}
                                onClick={() => setSelectedTarifa('temporadaBaja')}
                            >
                                <input
                                    type="radio"
                                    name="tarifa"
                                    value="temporadaBaja"
                                    checked={selectedTarifa === 'temporadaBaja'}
                                    onChange={() => setSelectedTarifa('temporadaBaja')}
                                />
                                <span className="payment-icon">
                                    <DollarSign size={20} />
                                </span>
                                <span className="payment-name">Temporada Baja</span>
                            </label>
                            <label
                                className={`payment-method ${selectedTarifa === 'temporadaMedia' ? 'selected' : ''}`}
                                onClick={() => setSelectedTarifa('temporadaMedia')}
                            >
                                <input
                                    type="radio"
                                    name="tarifa"
                                    value="temporadaMedia"
                                    checked={selectedTarifa === 'temporadaMedia'}
                                    onChange={() => setSelectedTarifa('temporadaMedia')}
                                />
                                <span className="payment-icon">
                                    <DollarSign size={20} />
                                </span>
                                <span className="payment-name">Temporada Media</span>
                            </label>
                            <label
                                className={`payment-method ${selectedTarifa === 'temporadaAlta' ? 'selected' : ''}`}
                                onClick={() => setSelectedTarifa('temporadaAlta')}
                            >
                                <input
                                    type="radio"
                                    name="tarifa"
                                    value="temporadaAlta"
                                    checked={selectedTarifa === 'temporadaAlta'}
                                    onChange={() => setSelectedTarifa('temporadaAlta')}
                                />
                                <span className="payment-icon">
                                    <DollarSign size={20} />
                                </span>
                                <span className="payment-name">Temporada Alta</span>
                            </label>
                        </div>
                    </div>

                    <div className="available-rooms-grid">
                        {availableRooms.map((room) => (
                            <div
                                key={room.id}
                                className={`room-select-card ${selectedRoom?.id === room.id ? 'selected' : ''}`}
                                onClick={() => setSelectedRoom(room)}
                            >
                                <div className="room-select-header">
                                    <span className="room-number">{room.numero}</span>
                                    <span className="badge badge-disponible">Disponible</span>
                                </div>
                                <div className="room-select-body">
                                    <div className="room-select-type">{room.tipo}</div>
                                    <div className="room-select-details">
                                        <span><User size={14} /> {room.capacidad} personas</span>
                                        <span>Piso {room.piso}</span>
                                    </div>
                                    <div className="room-select-price">
                                        S/ {getPrecioByTarifa(room)}
                                        <span className="per-night">/ noche</span>
                                    </div>
                                </div>
                                {selectedRoom?.id === room.id && (
                                    <div className="room-selected-badge">
                                        <Check size={20} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="step-actions">
                        <button
                            className="btn btn-primary btn-lg"
                            disabled={!selectedRoom}
                            onClick={() => setStep(2)}
                        >
                            Continuar
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2: Guest Data */}
            {step === 2 && (
                <div className="step-content">
                    <h2 className="step-title">Datos del Huésped</h2>
                    <div className="checkin-form-grid">
                        <div className="card form-card">
                            <h3 className="form-section-title">
                                <User size={18} />
                                Información Personal
                            </h3>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Nombre Completo *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleInputChange}
                                        placeholder="Ej: Juan Pérez García"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">DNI / Pasaporte *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        name="dni"
                                        value={formData.dni}
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
                                        name="telefono"
                                        value={formData.telefono}
                                        onChange={handleInputChange}
                                        placeholder="Ej: 987654321"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="Ej: correo@ejemplo.com"
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Procedencia</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        name="procedencia"
                                        value={formData.procedencia}
                                        onChange={handleInputChange}
                                        placeholder="Ej: Lima, Perú"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Número de Huéspedes</label>
                                    <select
                                        className="form-select"
                                        name="numHuespedes"
                                        value={formData.numHuespedes}
                                        onChange={handleInputChange}
                                    >
                                        {[...Array(selectedRoom?.capacidad || 4)].map((_, i) => (
                                            <option key={i + 1} value={i + 1}>{i + 1} {i === 0 ? 'huésped' : 'huéspedes'}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="card form-card">
                            <h3 className="form-section-title">
                                <Calendar size={18} />
                                Fechas de Estadía
                            </h3>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Fecha de Llegada *</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        name="fechaLlegada"
                                        value={formData.fechaLlegada}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Hora de Llegada</label>
                                    <input
                                        type="time"
                                        className="form-input"
                                        name="horaLlegada"
                                        value={formData.horaLlegada}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Fecha de Salida *</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        name="fechaSalida"
                                        value={formData.fechaSalida}
                                        onChange={handleInputChange}
                                        min={formData.fechaLlegada}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Hora de Salida</label>
                                    <input
                                        type="time"
                                        className="form-input"
                                        name="horaSalida"
                                        value={formData.horaSalida}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Observaciones</label>
                                <textarea
                                    className="form-textarea"
                                    name="observaciones"
                                    value={formData.observaciones}
                                    onChange={handleInputChange}
                                    placeholder="Notas adicionales..."
                                    rows={3}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="step-actions">
                        <button className="btn btn-secondary" onClick={() => setStep(1)}>
                            Atrás
                        </button>
                        <button
                            className="btn btn-primary btn-lg"
                            disabled={!formData.nombre || !formData.dni || !formData.fechaSalida}
                            onClick={() => setStep(3)}
                        >
                            Continuar
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Confirm and Pay */}
            {step === 3 && (
                <div className="step-content">
                    <h2 className="step-title">Confirmar Check-in</h2>
                    <div className="confirm-grid">
                        <div className="card confirm-card">
                            <h3 className="confirm-section-title">Resumen de la Reserva</h3>
                            <div className="confirm-details">
                                <div className="confirm-item">
                                    <BedDouble size={18} />
                                    <div>
                                        <span className="confirm-label">Habitación</span>
                                        <span className="confirm-value">{selectedRoom?.numero} - {selectedRoom?.tipo}</span>
                                    </div>
                                </div>
                                <div className="confirm-item">
                                    <User size={18} />
                                    <div>
                                        <span className="confirm-label">Huésped</span>
                                        <span className="confirm-value">{formData.nombre}</span>
                                    </div>
                                </div>
                                <div className="confirm-item">
                                    <Calendar size={18} />
                                    <div>
                                        <span className="confirm-label">Fechas</span>
                                        <span className="confirm-value">
                                            {new Date(formData.fechaLlegada).toLocaleDateString('es-PE')} - {new Date(formData.fechaSalida).toLocaleDateString('es-PE')}
                                        </span>
                                    </div>
                                </div>
                                <div className="confirm-item">
                                    <User size={18} />
                                    <div>
                                        <span className="confirm-label">Huéspedes</span>
                                        <span className="confirm-value">{formData.numHuespedes} persona(s)</span>
                                    </div>
                                </div>
                            </div>
                            <div className="confirm-total">
                                <span>Total a Pagar</span>
                                <span className="total-amount">S/ {calculateTotal()}</span>
                            </div>
                        </div>

                        <div className="card confirm-card">
                            <h3 className="confirm-section-title">Método de Pago</h3>
                            <div className="payment-methods">
                                {['efectivo', 'tarjeta', 'transferencia', 'yape', 'plin'].map((method) => (
                                    <label
                                        key={method}
                                        className={`payment-method ${formData.metodoPago === method ? 'selected' : ''}`}
                                    >
                                        <input
                                            type="radio"
                                            name="metodoPago"
                                            value={method}
                                            checked={formData.metodoPago === method}
                                            onChange={handleInputChange}
                                        />
                                        <span className="payment-icon">
                                            {method === 'efectivo' && <Banknote size={20} />}
                                            {method === 'tarjeta' && <CreditCard size={20} />}
                                            {method === 'transferencia' && <Building2 size={20} />}
                                            {method === 'yape' && <Smartphone size={20} />}
                                            {method === 'plin' && <Smartphone size={20} />}
                                        </span>
                                        <span className="payment-name">{method.charAt(0).toUpperCase() + method.slice(1)}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="step-actions">
                        <button className="btn btn-secondary" onClick={() => setStep(2)}>
                            Atrás
                        </button>
                        <button className="btn btn-success btn-lg">
                            <Check size={18} />
                            Confirmar Check-in
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Checkin;

