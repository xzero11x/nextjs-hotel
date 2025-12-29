"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    CreditCard,
    DollarSign,
    Search,
    Plus,
    CheckCircle2,
    Clock,
    Banknote,
    Smartphone,
    Building2,
    X,
    Loader2,
    AlertCircle,
    Check,
    RefreshCw,
    FileText,
    XCircle,
    BedDouble,
    User
} from 'lucide-react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import './Pagos.css';

function Pagos({ initialPagos = [], initialEstadias = [], resumenHoy = {} }) {
    const router = useRouter();
    const [pagos, setPagos] = useState(initialPagos);
    const [estadias, setEstadias] = useState(initialEstadias);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterMetodo, setFilterMetodo] = useState('todos');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // New payment modal
    const [showNewPaymentModal, setShowNewPaymentModal] = useState(false);
    const [selectedEstadia, setSelectedEstadia] = useState(null);
    const [paymentForm, setPaymentForm] = useState({
        monto: '',
        metodo_pago: 'efectivo',
        concepto: 'Pago de estadía',
        referencia: ''
    });
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [estadiaBalance, setEstadiaBalance] = useState(null);

    // Confirm dialog
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        title: '',
        message: '',
        variant: 'danger',
        onConfirm: () => { },
        loading: false
    });

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    const fetchPagos = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/pagos');
            const data = await response.json();
            if (data.pagos) setPagos(data.pagos);
        } catch (err) {
            setError('Error al cargar pagos');
        } finally {
            setLoading(false);
        }
    };

    const getMetodoIcon = (metodo) => {
        switch (metodo) {
            case 'efectivo': return <Banknote size={16} className="text-success" />;
            case 'yape': case 'plin': return <Smartphone size={16} className="text-primary" />;
            case 'tarjeta': return <CreditCard size={16} className="text-info" />;
            case 'transferencia': case 'deposito': return <Building2 size={16} className="text-secondary" />;
            default: return <DollarSign size={16} />;
        }
    };

    const getEstadoColor = (estado) => {
        switch (estado) {
            case 'pagado': return 'success';
            case 'pendiente': return 'warning';
            case 'anulado': return 'danger';
            default: return 'secondary';
        }
    };

    const filteredPagos = pagos.filter(pago => {
        const matchesSearch =
            pago.estadia?.huesped?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pago.estadia?.habitacion?.numero?.includes(searchTerm) ||
            pago.referencia?.includes(searchTerm);
        const matchesMetodo = filterMetodo === 'todos' || pago.metodo_pago === filterMetodo;
        return matchesSearch && matchesMetodo;
    });

    const openNewPaymentModal = (estadia = null) => {
        setSelectedEstadia(estadia);
        setPaymentForm({
            monto: '',
            metodo_pago: 'efectivo',
            concepto: 'Pago de estadía',
            referencia: ''
        });
        setEstadiaBalance(null);
        setShowNewPaymentModal(true);

        if (estadia) {
            loadEstadiaBalance(estadia.id);
        }
    };

    const loadEstadiaBalance = async (estadiaId) => {
        try {
            const response = await fetch(`/api/pagos?estadia_id=${estadiaId}`);
            const data = await response.json();

            const estadia = estadias.find(e => e.id === estadiaId);
            const totalPagado = data.pagos
                ?.filter(p => p.estado === 'pagado')
                .reduce((sum, p) => sum + p.monto, 0) || 0;

            setEstadiaBalance({
                total: estadia?.total || 0,
                pagado: totalPagado,
                pendiente: Math.max(0, (estadia?.total || 0) - totalPagado)
            });
        } catch (err) {
            console.error('Error loading balance:', err);
        }
    };

    const handleSelectEstadia = (estadia) => {
        setSelectedEstadia(estadia);
        loadEstadiaBalance(estadia.id);
    };

    const handleSubmitPayment = async (e) => {
        e.preventDefault();
        if (!selectedEstadia || !paymentForm.monto) return;

        setPaymentLoading(true);
        try {
            const response = await fetch('/api/pagos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    estadia_id: selectedEstadia.id,
                    ...paymentForm,
                    monto: parseFloat(paymentForm.monto)
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            setSuccessMessage(data.message || 'Pago registrado');
            setShowNewPaymentModal(false);
            router.refresh();
            fetchPagos();
        } catch (err) {
            setError(err.message);
        } finally {
            setPaymentLoading(false);
        }
    };

    const handleVoidPayment = (pago) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Anular Pago',
            message: `¿Anular el pago de S/ ${pago.monto} para la habitación ${pago.estadia?.habitacion?.numero}?`,
            variant: 'danger',
            confirmText: 'Anular',
            loading: false,
            onConfirm: async () => {
                try {
                    setConfirmDialog(prev => ({ ...prev, loading: true }));

                    const response = await fetch(`/api/pagos/${pago.id}`, {
                        method: 'DELETE'
                    });

                    if (!response.ok) throw new Error('Error al anular');

                    setSuccessMessage('Pago anulado');
                    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                    router.refresh();
                    fetchPagos();
                } catch (err) {
                    setError(err.message);
                    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                }
            }
        });
    };

    return (
        <div className="pagos-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Gestión de Pagos</h1>
                    <p className="page-subtitle">Registro y control de cobros</p>
                </div>
                <div className="page-header-actions">
                    <button className="btn btn-secondary" onClick={fetchPagos} disabled={loading}>
                        <RefreshCw size={18} className={loading ? 'spinner' : ''} />
                    </button>
                    <button className="btn btn-primary" onClick={() => openNewPaymentModal()}>
                        <Plus size={18} />
                        Nuevo Pago
                    </button>
                </div>
            </div>

            {/* Messages */}
            {error && (
                <div className="alert alert-error mb-4">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                    <button className="alert-close" onClick={() => setError('')}><X size={16} /></button>
                </div>
            )}
            {successMessage && (
                <div className="alert alert-success mb-4">
                    <Check size={20} />
                    <span>{successMessage}</span>
                </div>
            )}

            {/* Today's Summary */}
            <div className="pagos-stats">
                <div className="stat-card success">
                    <div className="stat-icon"><DollarSign size={24} /></div>
                    <div className="stat-content">
                        <span className="stat-value">S/ {resumenHoy.total?.toFixed(2) || '0.00'}</span>
                        <span className="stat-label">Cobrado Hoy</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon"><FileText size={24} /></div>
                    <div className="stat-content">
                        <span className="stat-value">{resumenHoy.cantidad || 0}</span>
                        <span className="stat-label">Transacciones</span>
                    </div>
                </div>
                <div className="stat-card warning">
                    <div className="stat-icon"><Banknote size={24} /></div>
                    <div className="stat-content">
                        <span className="stat-value">S/ {resumenHoy.efectivo?.toFixed(2) || '0.00'}</span>
                        <span className="stat-label">Efectivo</span>
                    </div>
                </div>
                <div className="stat-card info">
                    <div className="stat-icon"><Smartphone size={24} /></div>
                    <div className="stat-content">
                        <span className="stat-value">S/ {resumenHoy.digital?.toFixed(2) || '0.00'}</span>
                        <span className="stat-label">Digital</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="filter-bar">
                <div className="search-input-wrapper">
                    <Search className="search-icon" size={18} />
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Buscar por huésped, habitación..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="form-select"
                    value={filterMetodo}
                    onChange={(e) => setFilterMetodo(e.target.value)}
                >
                    <option value="todos">Todos los métodos</option>
                    <option value="efectivo">Efectivo</option>
                    <option value="yape">Yape</option>
                    <option value="plin">Plin</option>
                    <option value="tarjeta">Tarjeta</option>
                    <option value="transferencia">Transferencia</option>
                </select>
            </div>

            {/* Payments Table */}
            <div className="card">
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Huésped</th>
                                <th>Habitación</th>
                                <th>Monto</th>
                                <th>Método</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPagos.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center text-muted py-4">
                                        No hay pagos registrados
                                    </td>
                                </tr>
                            ) : (
                                filteredPagos.map(pago => (
                                    <tr key={pago.id} className={pago.estado === 'anulado' ? 'row-muted' : ''}>
                                        <td>
                                            {new Date(pago.fecha_pago).toLocaleString('es-PE', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </td>
                                        <td>
                                            <div className="cell-guest">
                                                <User size={14} />
                                                {pago.estadia?.huesped?.nombre} {pago.estadia?.huesped?.apellidos || ''}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="cell-room">
                                                <BedDouble size={14} />
                                                {pago.estadia?.habitacion?.numero}
                                            </div>
                                        </td>
                                        <td className="cell-amount">
                                            <strong>S/ {pago.monto?.toFixed(2)}</strong>
                                        </td>
                                        <td>
                                            <div className="cell-method">
                                                {getMetodoIcon(pago.metodo_pago)}
                                                <span>{pago.metodo_pago}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge badge-${getEstadoColor(pago.estado)}`}>
                                                {pago.estado}
                                            </span>
                                        </td>
                                        <td>
                                            {pago.estado === 'pagado' && (
                                                <button
                                                    className="btn btn-ghost btn-sm text-danger"
                                                    onClick={() => handleVoidPayment(pago)}
                                                    title="Anular pago"
                                                >
                                                    <XCircle size={16} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* New Payment Modal */}
            {showNewPaymentModal && (
                <div className="modal-overlay" onClick={() => setShowNewPaymentModal(false)}>
                    <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Registrar Pago</h2>
                            <button className="modal-close" onClick={() => setShowNewPaymentModal(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <div className="modal-body">
                            {/* Select Estadia */}
                            {!selectedEstadia ? (
                                <div className="estadia-selection">
                                    <h4>Selecciona la estadía</h4>
                                    {estadias.length === 0 ? (
                                        <p className="text-muted">No hay estadías activas</p>
                                    ) : (
                                        <div className="estadias-grid">
                                            {estadias.map(estadia => (
                                                <div
                                                    key={estadia.id}
                                                    className="estadia-select-card"
                                                    onClick={() => handleSelectEstadia(estadia)}
                                                >
                                                    <div className="estadia-room">
                                                        <BedDouble size={18} />
                                                        {estadia.habitacion?.numero}
                                                    </div>
                                                    <div className="estadia-guest">
                                                        {estadia.huesped?.nombre}
                                                    </div>
                                                    <div className="estadia-total">
                                                        Total: S/ {estadia.total?.toFixed(2)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <form onSubmit={handleSubmitPayment}>
                                    {/* Selected Estadia Info */}
                                    <div className="selected-estadia-info">
                                        <div className="info-row">
                                            <span>Habitación:</span>
                                            <strong>{selectedEstadia.habitacion?.numero}</strong>
                                        </div>
                                        <div className="info-row">
                                            <span>Huésped:</span>
                                            <strong>{selectedEstadia.huesped?.nombre}</strong>
                                        </div>
                                        <button
                                            type="button"
                                            className="btn btn-ghost btn-sm"
                                            onClick={() => setSelectedEstadia(null)}
                                        >
                                            Cambiar
                                        </button>
                                    </div>

                                    {/* Balance Info */}
                                    {estadiaBalance && (
                                        <div className="balance-info">
                                            <div className="balance-item">
                                                <span>Total estadía:</span>
                                                <strong>S/ {estadiaBalance.total?.toFixed(2)}</strong>
                                            </div>
                                            <div className="balance-item success">
                                                <span>Ya pagado:</span>
                                                <strong>S/ {estadiaBalance.pagado?.toFixed(2)}</strong>
                                            </div>
                                            <div className="balance-item warning">
                                                <span>Pendiente:</span>
                                                <strong>S/ {estadiaBalance.pendiente?.toFixed(2)}</strong>
                                            </div>
                                        </div>
                                    )}

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Monto *</label>
                                            <div className="input-with-prefix">
                                                <span className="input-prefix">S/</span>
                                                <input
                                                    type="number"
                                                    className="form-input"
                                                    value={paymentForm.monto}
                                                    onChange={(e) => setPaymentForm(prev => ({ ...prev, monto: e.target.value }))}
                                                    step="0.01"
                                                    min="0.01"
                                                    placeholder={estadiaBalance?.pendiente?.toFixed(2) || '0.00'}
                                                    required
                                                />
                                            </div>
                                            {estadiaBalance?.pendiente > 0 && (
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-ghost mt-1"
                                                    onClick={() => setPaymentForm(prev => ({ ...prev, monto: estadiaBalance.pendiente.toFixed(2) }))}
                                                >
                                                    Pagar todo (S/ {estadiaBalance.pendiente?.toFixed(2)})
                                                </button>
                                            )}
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Método de Pago *</label>
                                            <select
                                                className="form-select"
                                                value={paymentForm.metodo_pago}
                                                onChange={(e) => setPaymentForm(prev => ({ ...prev, metodo_pago: e.target.value }))}
                                            >
                                                <option value="efectivo">💵 Efectivo</option>
                                                <option value="yape">📱 Yape</option>
                                                <option value="plin">📱 Plin</option>
                                                <option value="tarjeta">💳 Tarjeta</option>
                                                <option value="transferencia">🏦 Transferencia</option>
                                                <option value="deposito">🏦 Depósito</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Concepto</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={paymentForm.concepto}
                                            onChange={(e) => setPaymentForm(prev => ({ ...prev, concepto: e.target.value }))}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Referencia (N° operación)</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={paymentForm.referencia}
                                            onChange={(e) => setPaymentForm(prev => ({ ...prev, referencia: e.target.value }))}
                                            placeholder="Opcional"
                                        />
                                    </div>

                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={() => setShowNewPaymentModal(false)}>
                                            Cancelar
                                        </button>
                                        <button type="submit" className="btn btn-success" disabled={paymentLoading || !paymentForm.monto}>
                                            {paymentLoading ? (
                                                <>
                                                    <Loader2 size={16} className="spinner" />
                                                    Procesando...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 size={16} />
                                                    Registrar Pago
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
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

export default Pagos;
