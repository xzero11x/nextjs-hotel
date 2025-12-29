"use client";

import { useState } from 'react';
import {
    LogOut,
    Clock,
    DollarSign,
    CreditCard,
    FileText,
    Check,
    X,
    Calculator,
    User,
    BedDouble,
    Calendar
} from 'lucide-react';
import { huespedes, habitaciones, pagos } from '@/data/mockData';
import './Checkout.css';

function Checkout() {
    const [selectedHuesped, setSelectedHuesped] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Obtener huéspedes con checkout pendiente (ocupan habitación)
    const huespedesActivos = huespedes.filter(h =>
        h.estado === 'dentro' || h.estado === 'fuera'
    );

    const getHabitacion = (habitacionId) => {
        return habitaciones.find(h => h.id === habitacionId);
    };

    const getPagosPendientes = (huespedId) => {
        return pagos.filter(p => p.huespedId === huespedId && p.estado === 'pendiente');
    };

    const getTotalPendiente = (huespedId) => {
        return getPagosPendientes(huespedId).reduce((acc, p) => acc + p.monto, 0);
    };

    const calcularDias = (checkIn, checkOut) => {
        const inicio = new Date(checkIn);
        const fin = new Date(checkOut);
        return Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24));
    };

    const handleCheckout = (huesped) => {
        setSelectedHuesped(huesped);
        setShowModal(true);
    };

    return (
        <div className="checkout-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Check-out y Salidas</h1>
                    <p className="page-subtitle">Gestiona las salidas de los huéspedes</p>
                </div>
            </div>

            {/* Estadísticas rápidas */}
            <div className="grid grid-cols-4 mb-6">
                <div className="stat-card primary">
                    <div className="stat-card-icon">
                        <LogOut size={24} />
                    </div>
                    <div className="stat-value">{huespedesActivos.length}</div>
                    <div className="stat-label">Check-outs Pendientes</div>
                </div>
                <div className="stat-card gold">
                    <div className="stat-card-icon">
                        <Clock size={24} />
                    </div>
                    <div className="stat-value">2</div>
                    <div className="stat-label">Salidas Hoy</div>
                </div>
                <div className="stat-card danger">
                    <div className="stat-card-icon">
                        <DollarSign size={24} />
                    </div>
                    <div className="stat-value">S/ {huespedes.reduce((acc, h) => acc + getTotalPendiente(h.id), 0)}</div>
                    <div className="stat-label">Pagos Pendientes</div>
                </div>
                <div className="stat-card success">
                    <div className="stat-card-icon">
                        <Check size={24} />
                    </div>
                    <div className="stat-value">3</div>
                    <div className="stat-label">Completados Hoy</div>
                </div>
            </div>

            {/* Lista de huéspedes con checkout pendiente */}
            <div className="card">
                <div className="card-header">
                    <div>
                        <h3 className="card-title">Huéspedes con Check-out Pendiente</h3>
                        <p className="card-subtitle">Selecciona un huésped para procesar su salida</p>
                    </div>
                </div>
                <div className="checkout-list">
                    {huespedesActivos.map((huesped) => {
                        const habitacion = getHabitacion(huesped.habitacionId);
                        const pendiente = getTotalPendiente(huesped.id);
                        const dias = calcularDias(huesped.checkInDate, huesped.checkOutDate);

                        return (
                            <div key={huesped.id} className="checkout-item">
                                <div className="checkout-guest">
                                    <div className="avatar">{huesped.nombre.charAt(0)}</div>
                                    <div className="checkout-guest-info">
                                        <h4>{huesped.nombre}</h4>
                                        <p>DNI: {huesped.dni}</p>
                                    </div>
                                </div>
                                <div className="checkout-room">
                                    <BedDouble size={16} />
                                    <span>Hab. {habitacion?.numero} - {habitacion?.tipo}</span>
                                </div>
                                <div className="checkout-dates">
                                    <Calendar size={16} />
                                    <span>{dias} {dias === 1 ? 'noche' : 'noches'}</span>
                                </div>
                                <div className="checkout-status">
                                    {pendiente > 0 ? (
                                        <span className="badge badge-pendiente">S/ {pendiente} pendiente</span>
                                    ) : (
                                        <span className="badge badge-pagado">Pagado</span>
                                    )}
                                </div>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => handleCheckout(huesped)}
                                >
                                    <LogOut size={16} />
                                    Checkout
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Modal de Checkout */}
            {showModal && selectedHuesped && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Confirmar Check-out</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <div className="modal-body">
                            {(() => {
                                const habitacion = getHabitacion(selectedHuesped.habitacionId);
                                const pendiente = getTotalPendiente(selectedHuesped.id);
                                const dias = calcularDias(selectedHuesped.checkInDate, selectedHuesped.checkOutDate);
                                const total = dias * (habitacion?.precioActual || 0);

                                return (
                                    <>
                                        <div className="checkout-summary">
                                            <div className="summary-header">
                                                <div className="avatar avatar-lg">{selectedHuesped.nombre.charAt(0)}</div>
                                                <div>
                                                    <h3>{selectedHuesped.nombre}</h3>
                                                    <p>Habitación {habitacion?.numero} - {habitacion?.tipo}</p>
                                                </div>
                                            </div>

                                            <div className="summary-grid">
                                                <div className="summary-item">
                                                    <span className="summary-label">Check-in</span>
                                                    <span className="summary-value">
                                                        {new Date(selectedHuesped.checkInDate).toLocaleDateString('es-PE')}
                                                    </span>
                                                </div>
                                                <div className="summary-item">
                                                    <span className="summary-label">Check-out</span>
                                                    <span className="summary-value">
                                                        {new Date(selectedHuesped.checkOutDate).toLocaleDateString('es-PE')}
                                                    </span>
                                                </div>
                                                <div className="summary-item">
                                                    <span className="summary-label">Noches</span>
                                                    <span className="summary-value">{dias}</span>
                                                </div>
                                                <div className="summary-item">
                                                    <span className="summary-label">Tarifa/noche</span>
                                                    <span className="summary-value">S/ {habitacion?.precioActual}</span>
                                                </div>
                                            </div>

                                            <div className="summary-totals">
                                                <div className="total-row">
                                                    <span>Subtotal</span>
                                                    <span>S/ {total}</span>
                                                </div>
                                                <div className="total-row paid">
                                                    <span>Pagado</span>
                                                    <span>S/ {total - pendiente}</span>
                                                </div>
                                                <div className="total-row pending">
                                                    <span>Pendiente</span>
                                                    <span>S/ {pendiente}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {pendiente > 0 && (
                                            <div className="pending-payment-alert">
                                                <DollarSign size={20} />
                                                <div>
                                                    <strong>Pago pendiente</strong>
                                                    <p>El huésped tiene S/ {pendiente} pendiente de pago</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="checkout-options">
                                            <h4>Opciones de Salida</h4>
                                            <div className="option-buttons">
                                                <button className="btn btn-secondary">
                                                    <FileText size={16} />
                                                    Generar Boleta
                                                </button>
                                                <button className="btn btn-secondary">
                                                    <FileText size={16} />
                                                    Generar Factura
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                Cancelar
                            </button>
                            <button className="btn btn-success">
                                <Check size={16} />
                                Confirmar Check-out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Checkout;

