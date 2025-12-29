"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    LogOut,
    Search,
    BedDouble,
    User,
    Phone,
    Calendar,
    Clock,
    DollarSign,
    Check,
    Loader2,
    AlertCircle,
    FileText,
    CreditCard,
    UserMinus,
    RefreshCw
} from 'lucide-react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import './Checkout.css';

function Checkout({ initialEstadias = [] }) {
    const router = useRouter();
    const [estadias, setEstadias] = useState(initialEstadias);
    const [selectedEstadia, setSelectedEstadia] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Checkout form
    const [notasCheckout, setNotasCheckout] = useState('');
    const [cobrosAdicionales, setCobrosAdicionales] = useState(0);

    // Confirm dialog
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        title: '',
        message: '',
        variant: 'warning',
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

    const fetchEstadias = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/estadias?estado=activa');
            const data = await response.json();
            if (data.estadias) {
                setEstadias(data.estadias);
            }
        } catch (err) {
            console.error('Error fetching estadias:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredEstadias = estadias.filter(e => {
        const searchLower = searchTerm.toLowerCase();
        return (
            e.huesped?.nombre?.toLowerCase().includes(searchLower) ||
            e.huesped?.apellidos?.toLowerCase().includes(searchLower) ||
            e.huesped?.numero_documento?.includes(searchTerm) ||
            e.habitacion?.numero?.includes(searchTerm)
        );
    });

    const calculateStayDays = (estadia) => {
        const checkin = new Date(estadia.fecha_checkin);
        const now = new Date();
        return Math.ceil((now - checkin) / (1000 * 60 * 60 * 24));
    };

    const calculateTotal = (estadia) => {
        const dias = calculateStayDays(estadia);
        const subtotal = estadia.precio_noche * dias;
        const igv = subtotal * (estadia.igv_porcentaje / 100);
        return subtotal + igv + cobrosAdicionales;
    };

    const handleSelectEstadia = (estadia) => {
        setSelectedEstadia(estadia);
        setNotasCheckout('');
        setCobrosAdicionales(0);
    };

    const handleCheckout = () => {
        if (!selectedEstadia) return;

        const diasReales = calculateStayDays(selectedEstadia);
        const totalFinal = calculateTotal(selectedEstadia);

        setConfirmDialog({
            isOpen: true,
            title: 'Confirmar Check-out',
            message: `¿Confirmar salida de ${selectedEstadia.huesped?.nombre} de la habitación ${selectedEstadia.habitacion?.numero}? 
            
Días: ${diasReales} noches
Total: S/ ${totalFinal.toFixed(2)}

La habitación pasará automáticamente a estado "Limpieza".`,
            variant: 'warning',
            confirmText: 'Realizar Check-out',
            loading: false,
            onConfirm: async () => {
                try {
                    setConfirmDialog(prev => ({ ...prev, loading: true }));

                    const response = await fetch('/api/estadias/checkout', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            estadia_id: selectedEstadia.id,
                            notas_checkout: notasCheckout,
                            cobros_adicionales: cobrosAdicionales
                        })
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(data.error || 'Error en el checkout');
                    }

                    setSuccessMessage(`Check-out exitoso! ${data.message}`);
                    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                    setSelectedEstadia(null);

                    // Refresh data
                    router.refresh();
                    fetchEstadias();

                } catch (err) {
                    setError(err.message);
                    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                }
            }
        });
    };

    return (
        <div className="checkout-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Check-out</h1>
                    <p className="page-subtitle">Registro de salida de huéspedes</p>
                </div>
                <div className="page-header-actions">
                    <button className="btn btn-secondary" onClick={fetchEstadias} disabled={loading}>
                        <RefreshCw size={18} className={loading ? 'spinner' : ''} />
                        Actualizar
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
            <div className="checkout-stats">
                <div className="checkout-stat">
                    <BedDouble size={24} />
                    <div>
                        <span className="stat-value">{estadias.length}</span>
                        <span className="stat-label">Habitaciones Ocupadas</span>
                    </div>
                </div>
            </div>

            <div className="checkout-content">
                {/* Stays List */}
                <div className="checkout-panel">
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Huéspedes Activos</h3>
                            <div className="search-input-wrapper">
                                <Search className="search-icon" size={16} />
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Buscar huésped o habitación..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {filteredEstadias.length === 0 ? (
                            <div className="empty-state">
                                <UserMinus size={48} style={{ opacity: 0.3 }} />
                                <p>{searchTerm ? 'No se encontraron resultados' : 'No hay huéspedes activos'}</p>
                            </div>
                        ) : (
                            <div className="estadias-list">
                                {filteredEstadias.map(estadia => (
                                    <div
                                        key={estadia.id}
                                        className={`estadia-item ${selectedEstadia?.id === estadia.id ? 'selected' : ''}`}
                                        onClick={() => handleSelectEstadia(estadia)}
                                    >
                                        <div className="estadia-room">
                                            <span className="room-number">{estadia.habitacion?.numero}</span>
                                            <span className="room-type">{estadia.habitacion?.tipo}</span>
                                        </div>
                                        <div className="estadia-guest">
                                            <span className="guest-name">
                                                {estadia.huesped?.nombre} {estadia.huesped?.apellidos || ''}
                                            </span>
                                            <span className="guest-doc">
                                                {estadia.huesped?.tipo_documento}: {estadia.huesped?.numero_documento}
                                            </span>
                                        </div>
                                        <div className="estadia-dates">
                                            <span className="checkin-date">
                                                <Calendar size={12} />
                                                {new Date(estadia.fecha_checkin).toLocaleDateString('es-PE')}
                                            </span>
                                            <span className="nights">
                                                <Clock size={12} />
                                                {calculateStayDays(estadia)} noches
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Checkout Details */}
                <div className="checkout-details-panel">
                    {selectedEstadia ? (
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">Detalles de Estadía</h3>
                            </div>
                            <div className="card-body">
                                {/* Guest Info */}
                                <div className="detail-section">
                                    <h4><User size={16} /> Huésped</h4>
                                    <div className="detail-grid">
                                        <div className="detail-item">
                                            <span className="label">Nombre:</span>
                                            <span className="value">
                                                {selectedEstadia.huesped?.nombre} {selectedEstadia.huesped?.apellidos || ''}
                                            </span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="label">Documento:</span>
                                            <span className="value">{selectedEstadia.huesped?.numero_documento}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="label">Teléfono:</span>
                                            <span className="value">{selectedEstadia.huesped?.telefono || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Room Info */}
                                <div className="detail-section">
                                    <h4><BedDouble size={16} /> Habitación</h4>
                                    <div className="detail-grid">
                                        <div className="detail-item">
                                            <span className="label">Número:</span>
                                            <span className="value">{selectedEstadia.habitacion?.numero}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="label">Tipo:</span>
                                            <span className="value">{selectedEstadia.habitacion?.tipo}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="label">Precio/noche:</span>
                                            <span className="value">S/ {selectedEstadia.precio_noche?.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Stay Info */}
                                <div className="detail-section">
                                    <h4><Calendar size={16} /> Estadía</h4>
                                    <div className="detail-grid">
                                        <div className="detail-item">
                                            <span className="label">Check-in:</span>
                                            <span className="value">
                                                {new Date(selectedEstadia.fecha_checkin).toLocaleString('es-PE')}
                                            </span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="label">Previsto:</span>
                                            <span className="value">
                                                {new Date(selectedEstadia.fecha_checkout_prevista).toLocaleDateString('es-PE')}
                                            </span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="label">Días reales:</span>
                                            <span className="value">{calculateStayDays(selectedEstadia)} noches</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Notes/Charges */}
                                <div className="detail-section">
                                    <div className="form-group">
                                        <label className="form-label">
                                            <DollarSign size={14} /> Cobros Adicionales (S/)
                                        </label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={cobrosAdicionales}
                                            onChange={(e) => setCobrosAdicionales(parseFloat(e.target.value) || 0)}
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">
                                            <FileText size={14} /> Notas de Checkout
                                        </label>
                                        <textarea
                                            className="form-input"
                                            value={notasCheckout}
                                            onChange={(e) => setNotasCheckout(e.target.value)}
                                            rows="2"
                                            placeholder="Observaciones de salida..."
                                        />
                                    </div>
                                </div>

                                {/* Totals */}
                                <div className="checkout-totals">
                                    <div className="total-row">
                                        <span>Subtotal ({calculateStayDays(selectedEstadia)} noches):</span>
                                        <span>S/ {(selectedEstadia.precio_noche * calculateStayDays(selectedEstadia)).toFixed(2)}</span>
                                    </div>
                                    <div className="total-row">
                                        <span>IGV ({selectedEstadia.igv_porcentaje}%):</span>
                                        <span>S/ {(selectedEstadia.precio_noche * calculateStayDays(selectedEstadia) * (selectedEstadia.igv_porcentaje / 100)).toFixed(2)}</span>
                                    </div>
                                    {cobrosAdicionales > 0 && (
                                        <div className="total-row">
                                            <span>Adicionales:</span>
                                            <span>S/ {cobrosAdicionales.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="total-row final">
                                        <span>TOTAL:</span>
                                        <span>S/ {calculateTotal(selectedEstadia).toFixed(2)}</span>
                                    </div>
                                </div>

                                <button
                                    className="btn btn-warning btn-lg btn-block"
                                    onClick={handleCheckout}
                                >
                                    <LogOut size={20} />
                                    Realizar Check-out
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="card">
                            <div className="empty-state">
                                <LogOut size={48} style={{ opacity: 0.3 }} />
                                <p>Selecciona un huésped para realizar check-out</p>
                            </div>
                        </div>
                    )}
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

export default Checkout;
