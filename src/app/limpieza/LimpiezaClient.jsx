"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Sparkles,
    BedDouble,
    Check,
    Clock,
    AlertCircle,
    RefreshCw,
    Loader2,
    CheckCircle,
    XCircle
} from 'lucide-react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import './Limpieza.css';

function Limpieza({ initialOrdenes = [], initialHabitacionesLimpieza = [] }) {
    const router = useRouter();
    const [ordenes, setOrdenes] = useState(initialOrdenes);
    const [habitacionesLimpieza, setHabitacionesLimpieza] = useState(initialHabitacionesLimpieza);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [filterEstado, setFilterEstado] = useState('pendiente');

    // Confirm dialog
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        title: '',
        message: '',
        variant: 'success',
        onConfirm: () => { },
        loading: false
    });

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(''), 4000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [ordenesRes, habRes] = await Promise.all([
                fetch('/api/limpieza'),
                fetch('/api/habitaciones?estado=limpieza')
            ]);

            const ordenesData = await ordenesRes.json();
            const habData = await habRes.json();

            if (ordenesData.ordenes) setOrdenes(ordenesData.ordenes);
            if (habData.habitaciones) setHabitacionesLimpieza(habData.habitaciones);
        } catch (err) {
            setError('Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    const filteredOrdenes = ordenes.filter(o => {
        if (filterEstado === 'todas') return true;
        return o.estado === filterEstado;
    });

    const pendingCount = ordenes.filter(o => o.estado === 'pendiente').length;
    const completedCount = ordenes.filter(o => o.estado === 'completada').length;

    const handleCompleteLimpieza = (orden) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Completar Limpieza',
            message: `¿Confirmar que la habitación ${orden.habitacion?.numero} está limpia? La habitación pasará a estado "Disponible".`,
            variant: 'success',
            confirmText: 'Marcar Limpia',
            loading: false,
            onConfirm: async () => {
                try {
                    setConfirmDialog(prev => ({ ...prev, loading: true }));

                    const response = await fetch(`/api/limpieza/${orden.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ estado: 'completada' })
                    });

                    const data = await response.json();
                    if (!response.ok) throw new Error(data.error);

                    setSuccessMessage(data.message || 'Limpieza completada');
                    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                    router.refresh();
                    fetchData();
                } catch (err) {
                    setError(err.message);
                    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                }
            }
        });
    };

    const handleQuickClean = (habitacion) => {
        // Quick clean for rooms without order
        setConfirmDialog({
            isOpen: true,
            title: 'Limpieza Rápida',
            message: `¿Marcar habitación ${habitacion.numero} como limpia y disponible?`,
            variant: 'success',
            confirmText: 'Marcar Disponible',
            loading: false,
            onConfirm: async () => {
                try {
                    setConfirmDialog(prev => ({ ...prev, loading: true }));

                    const response = await fetch(`/api/habitaciones/${habitacion.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ estado: 'disponible' })
                    });

                    if (!response.ok) throw new Error('Error al actualizar');

                    setSuccessMessage(`Habitación ${habitacion.numero} ahora disponible`);
                    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                    router.refresh();
                    fetchData();
                } catch (err) {
                    setError(err.message);
                    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                }
            }
        });
    };

    const getPrioridadColor = (prioridad) => {
        switch (prioridad) {
            case 'alta': return 'danger';
            case 'normal': return 'warning';
            case 'baja': return 'secondary';
            default: return 'secondary';
        }
    };

    const getEstadoIcon = (estado) => {
        switch (estado) {
            case 'completada': return <CheckCircle size={16} className="text-success" />;
            case 'cancelada': return <XCircle size={16} className="text-danger" />;
            default: return <Clock size={16} className="text-warning" />;
        }
    };

    return (
        <div className="limpieza-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Gestión de Limpieza</h1>
                    <p className="page-subtitle">Administra las órdenes de limpieza y estado de habitaciones</p>
                </div>
                <div className="page-header-actions">
                    <button className="btn btn-secondary" onClick={fetchData} disabled={loading}>
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
            <div className="limpieza-stats">
                <div className="stat-card warning">
                    <div className="stat-card-icon">
                        <BedDouble size={24} />
                    </div>
                    <div className="stat-value">{habitacionesLimpieza.length}</div>
                    <div className="stat-label">En Limpieza</div>
                </div>
                <div className="stat-card danger">
                    <div className="stat-card-icon">
                        <Clock size={24} />
                    </div>
                    <div className="stat-value">{pendingCount}</div>
                    <div className="stat-label">Órdenes Pendientes</div>
                </div>
                <div className="stat-card success">
                    <div className="stat-card-icon">
                        <CheckCircle size={24} />
                    </div>
                    <div className="stat-value">{completedCount}</div>
                    <div className="stat-label">Completadas Hoy</div>
                </div>
            </div>

            <div className="limpieza-content">
                {/* Habitaciones en Limpieza */}
                <div className="limpieza-panel">
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">
                                <Sparkles size={20} />
                                Habitaciones en Limpieza
                            </h3>
                        </div>
                        {habitacionesLimpieza.length === 0 ? (
                            <div className="empty-state-sm">
                                <CheckCircle size={32} style={{ opacity: 0.3 }} />
                                <p>Todas las habitaciones están limpias</p>
                            </div>
                        ) : (
                            <div className="habitaciones-limpieza-grid">
                                {habitacionesLimpieza.map(hab => {
                                    const orden = ordenes.find(o =>
                                        o.habitacion_id === hab.id && o.estado === 'pendiente'
                                    );
                                    return (
                                        <div key={hab.id} className="hab-limpieza-card">
                                            <div className="hab-number">{hab.numero}</div>
                                            <div className="hab-tipo">{hab.tipo}</div>
                                            <div className="hab-piso">Piso {hab.piso}</div>
                                            {orden && (
                                                <span className={`badge badge-${getPrioridadColor(orden.prioridad)}`}>
                                                    {orden.prioridad}
                                                </span>
                                            )}
                                            <button
                                                className="btn btn-success btn-sm btn-block"
                                                onClick={() => orden ? handleCompleteLimpieza(orden) : handleQuickClean(hab)}
                                            >
                                                <Check size={16} />
                                                Marcar Limpia
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Órdenes de Limpieza */}
                <div className="ordenes-panel">
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Órdenes de Servicio</h3>
                            <select
                                className="form-select form-select-sm"
                                value={filterEstado}
                                onChange={(e) => setFilterEstado(e.target.value)}
                            >
                                <option value="pendiente">Pendientes</option>
                                <option value="completada">Completadas</option>
                                <option value="todas">Todas</option>
                            </select>
                        </div>
                        {filteredOrdenes.length === 0 ? (
                            <div className="empty-state-sm">
                                <Clock size={32} style={{ opacity: 0.3 }} />
                                <p>No hay órdenes {filterEstado !== 'todas' ? filterEstado + 's' : ''}</p>
                            </div>
                        ) : (
                            <div className="ordenes-list">
                                {filteredOrdenes.map(orden => (
                                    <div key={orden.id} className={`orden-item ${orden.estado}`}>
                                        <div className="orden-hab">
                                            <BedDouble size={16} />
                                            <span>{orden.habitacion?.numero}</span>
                                        </div>
                                        <div className="orden-tipo">
                                            {orden.tipo_servicio.replace('_', ' ')}
                                        </div>
                                        <span className={`badge badge-${getPrioridadColor(orden.prioridad)}`}>
                                            {orden.prioridad}
                                        </span>
                                        <div className="orden-estado">
                                            {getEstadoIcon(orden.estado)}
                                            <span>{orden.estado}</span>
                                        </div>
                                        {orden.estado === 'pendiente' && (
                                            <button
                                                className="btn btn-success btn-sm"
                                                onClick={() => handleCompleteLimpieza(orden)}
                                            >
                                                <Check size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
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

export default Limpieza;
