"use client";

import { useState } from 'react';
import {
    CreditCard,
    DollarSign,
    FileText,
    Search,
    Filter,
    Download,
    Send,
    Eye,
    Plus,
    CheckCircle2,
    Clock,
    Banknote,
    Smartphone,
    Building2
} from 'lucide-react';
import { pagos, huespedes, habitaciones } from '@/data/mockData';
import './Pagos.css';

function Pagos() {
    const [activeTab, setActiveTab] = useState('pagos');
    const [filterEstado, setFilterEstado] = useState('todos');

    const getHuesped = (huespedId) => huespedes.find(h => h.id === huespedId);
    const getHabitacion = (huespedId) => {
        const huesped = getHuesped(huespedId);
        return habitaciones.find(h => h.id === huesped?.habitacionId);
    };

    const filteredPagos = pagos.filter(p => {
        if (filterEstado === 'todos') return true;
        return p.estado === filterEstado;
    });

    const totalPagado = pagos.filter(p => p.estado === 'pagado').reduce((acc, p) => acc + p.monto, 0);
    const totalPendiente = pagos.filter(p => p.estado === 'pendiente').reduce((acc, p) => acc + p.monto, 0);

    const getMetodoIcon = (metodo) => {
        switch (metodo) {
            case 'efectivo': return <Banknote size={16} />;
            case 'tarjeta': return <CreditCard size={16} />;
            case 'transferencia': return <Building2 size={16} />;
            case 'yape': case 'plin': return <Smartphone size={16} />;
            default: return <DollarSign size={16} />;
        }
    };

    return (
        <div className="pagos-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Pagos y Facturación</h1>
                    <p className="page-subtitle">Gestiona pagos y emite comprobantes electrónicos</p>
                </div>
                <div className="page-header-actions">
                    <button className="btn btn-primary">
                        <Plus size={18} />
                        Registrar Pago
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 mb-6">
                <div className="stat-card success">
                    <div className="stat-card-icon">
                        <CheckCircle2 size={24} />
                    </div>
                    <div className="stat-value">S/ {totalPagado.toLocaleString()}</div>
                    <div className="stat-label">Total Cobrado</div>
                </div>
                <div className="stat-card danger">
                    <div className="stat-card-icon">
                        <Clock size={24} />
                    </div>
                    <div className="stat-value">S/ {totalPendiente.toLocaleString()}</div>
                    <div className="stat-label">Pendiente</div>
                </div>
                <div className="stat-card primary">
                    <div className="stat-card-icon">
                        <FileText size={24} />
                    </div>
                    <div className="stat-value">{pagos.filter(p => p.comprobante === 'boleta').length}</div>
                    <div className="stat-label">Boletas Emitidas</div>
                </div>
                <div className="stat-card gold">
                    <div className="stat-card-icon">
                        <FileText size={24} />
                    </div>
                    <div className="stat-value">{pagos.filter(p => p.comprobante === 'factura').length}</div>
                    <div className="stat-label">Facturas Emitidas</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'pagos' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pagos')}
                >
                    <DollarSign size={16} />
                    Pagos
                </button>
                <button
                    className={`tab ${activeTab === 'comprobantes' ? 'active' : ''}`}
                    onClick={() => setActiveTab('comprobantes')}
                >
                    <FileText size={16} />
                    Comprobantes
                </button>
            </div>

            {/* Pagos Tab */}
            {activeTab === 'pagos' && (
                <>
                    <div className="filter-bar">
                        <div className="search-input-wrapper" style={{ flex: 1, maxWidth: '300px' }}>
                            <Search className="search-icon" size={18} />
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Buscar pago..."
                            />
                        </div>
                        <select
                            className="form-select"
                            value={filterEstado}
                            onChange={(e) => setFilterEstado(e.target.value)}
                        >
                            <option value="todos">Todos</option>
                            <option value="pagado">Pagados</option>
                            <option value="pendiente">Pendientes</option>
                        </select>
                    </div>

                    <div className="card">
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Huésped</th>
                                        <th>Habitación</th>
                                        <th>Concepto</th>
                                        <th>Método</th>
                                        <th>Monto</th>
                                        <th>Estado</th>
                                        <th>Comprobante</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPagos.map((pago) => {
                                        const huesped = getHuesped(pago.huespedId);
                                        const habitacion = getHabitacion(pago.huespedId);
                                        return (
                                            <tr key={pago.id}>
                                                <td>
                                                    <div className="pago-huesped">
                                                        <div className="avatar avatar-sm">{huesped?.nombre.charAt(0)}</div>
                                                        <span>{huesped?.nombre}</span>
                                                    </div>
                                                </td>
                                                <td>{habitacion?.numero || '-'}</td>
                                                <td>{pago.concepto}</td>
                                                <td>
                                                    <div className="metodo-pago">
                                                        {getMetodoIcon(pago.metodoPago)}
                                                        <span className="capitalize">{pago.metodoPago}</span>
                                                    </div>
                                                </td>
                                                <td className="monto-cell">S/ {pago.monto}</td>
                                                <td>
                                                    <span className={`badge badge-${pago.estado}`}>{pago.estado}</span>
                                                </td>
                                                <td>
                                                    {pago.numeroComprobante ? (
                                                        <span className="comprobante-num">{pago.numeroComprobante}</span>
                                                    ) : (
                                                        <span className="text-muted">-</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="table-actions">
                                                        {pago.estado === 'pendiente' && (
                                                            <button className="btn btn-success btn-sm">
                                                                <DollarSign size={14} />
                                                                Cobrar
                                                            </button>
                                                        )}
                                                        {pago.estado === 'pagado' && (
                                                            <>
                                                                <button className="btn btn-ghost btn-sm" title="Ver">
                                                                    <Eye size={16} />
                                                                </button>
                                                                <button className="btn btn-ghost btn-sm" title="Enviar">
                                                                    <Send size={16} />
                                                                </button>
                                                            </>
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
                </>
            )}

            {/* Comprobantes Tab */}
            {activeTab === 'comprobantes' && (
                <div className="card">
                    <div className="card-header">
                        <div>
                            <h3 className="card-title">Comprobantes Emitidos</h3>
                            <p className="card-subtitle">Últimos comprobantes electrónicos</p>
                        </div>
                        <button className="btn btn-secondary btn-sm">
                            <Download size={16} />
                            Exportar
                        </button>
                    </div>
                    <div className="comprobantes-list">
                        {pagos.filter(p => p.numeroComprobante).map((pago) => {
                            const huesped = getHuesped(pago.huespedId);
                            return (
                                <div key={pago.id} className="comprobante-item">
                                    <div className="comprobante-icon">
                                        <FileText size={20} />
                                    </div>
                                    <div className="comprobante-info">
                                        <span className="comprobante-numero">{pago.numeroComprobante}</span>
                                        <span className="comprobante-tipo">{pago.comprobante?.toUpperCase()}</span>
                                    </div>
                                    <div className="comprobante-cliente">
                                        <span className="cliente-nombre">{huesped?.nombre}</span>
                                        <span className="cliente-fecha">
                                            {pago.fecha ? new Date(pago.fecha).toLocaleDateString('es-PE') : '-'}
                                        </span>
                                    </div>
                                    <div className="comprobante-monto">
                                        S/ {pago.monto}
                                    </div>
                                    <div className="comprobante-actions">
                                        <button className="btn btn-ghost btn-icon" title="Ver PDF">
                                            <Eye size={16} />
                                        </button>
                                        <button className="btn btn-ghost btn-icon" title="Descargar">
                                            <Download size={16} />
                                        </button>
                                        <button className="btn btn-ghost btn-icon" title="Enviar">
                                            <Send size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Pagos;

