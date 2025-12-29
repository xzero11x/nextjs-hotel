"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    DollarSign,
    Calendar,
    Sun,
    Snowflake,
    TrendingUp,
    Plus,
    Edit,
    Save,
    X,
    Loader2,
    AlertCircle,
    Check,
    RefreshCw,
    BedDouble,
    Percent,
    CalendarRange
} from 'lucide-react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import './Precios.css';

function Precios({ initialTarifas = [], initialTemporadas = [], temporadaActual = 'media' }) {
    const router = useRouter();
    const [tarifas, setTarifas] = useState(initialTarifas);
    const [temporadas, setTemporadas] = useState(initialTemporadas);
    const [currentSeason, setCurrentSeason] = useState(temporadaActual);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [activeTab, setActiveTab] = useState('tarifas');

    // Price calculator
    const [calcForm, setCalcForm] = useState({
        tipo_habitacion: 'simple',
        fecha_inicio: new Date().toISOString().split('T')[0],
        fecha_fin: new Date(Date.now() + 86400000).toISOString().split('T')[0]
    });
    const [calculatedPrice, setCalculatedPrice] = useState(null);
    const [calculating, setCalculating] = useState(false);

    // Modal for new season
    const [showSeasonModal, setShowSeasonModal] = useState(false);
    const [seasonForm, setSeasonForm] = useState({
        nombre: '',
        fecha_inicio: '',
        fecha_fin: '',
        tipo: 'media',
        multiplicador: 1.00
    });
    const [seasonLoading, setSeasonLoading] = useState(false);

    // Edit tarifa
    const [editingTarifa, setEditingTarifa] = useState(null);
    const [tarifaForm, setTarifaForm] = useState({});

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    const getSeasonIcon = (tipo) => {
        switch (tipo) {
            case 'alta': return <Sun size={16} className="text-warning" />;
            case 'baja': return <Snowflake size={16} className="text-info" />;
            default: return <Calendar size={16} />;
        }
    };

    const getSeasonColor = (tipo) => {
        switch (tipo) {
            case 'alta': return 'danger';
            case 'baja': return 'info';
            default: return 'secondary';
        }
    };

    const calculatePrice = async () => {
        try {
            setCalculating(true);
            const response = await fetch('/api/precios/calcular', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(calcForm)
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            setCalculatedPrice(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setCalculating(false);
        }
    };

    const handleCreateSeason = async (e) => {
        e.preventDefault();
        setSeasonLoading(true);

        try {
            const response = await fetch('/api/temporadas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(seasonForm)
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            setSuccessMessage('Temporada creada');
            setShowSeasonModal(false);
            setSeasonForm({
                nombre: '',
                fecha_inicio: '',
                fecha_fin: '',
                tipo: 'media',
                multiplicador: 1.00
            });
            router.refresh();
        } catch (err) {
            setError(err.message);
        } finally {
            setSeasonLoading(false);
        }
    };

    const handleEditTarifa = (tarifa) => {
        setEditingTarifa(tarifa.id);
        setTarifaForm({
            precio_base: tarifa.precio_base,
            precio_temporada_baja: tarifa.precio_temporada_baja,
            precio_temporada_media: tarifa.precio_temporada_media,
            precio_temporada_alta: tarifa.precio_temporada_alta
        });
    };

    const handleSaveTarifa = async (tarifa) => {
        try {
            const response = await fetch(`/api/tarifas/${tarifa.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(tarifaForm)
            });

            if (!response.ok) throw new Error('Error al guardar');

            setSuccessMessage('Tarifa actualizada');
            setEditingTarifa(null);
            router.refresh();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="precios-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Precios y Tarifas</h1>
                    <p className="page-subtitle">Motor de precios dinámico por temporada</p>
                </div>
                <div className="season-indicator">
                    {getSeasonIcon(currentSeason)}
                    <span>Temporada actual: <strong>{currentSeason}</strong></span>
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

            {/* Price Calculator */}
            <div className="card calculator-card">
                <div className="card-header">
                    <h3 className="card-title">
                        <TrendingUp size={20} />
                        Calculadora de Precios
                    </h3>
                </div>
                <div className="card-body">
                    <div className="calculator-form">
                        <div className="form-group">
                            <label className="form-label">Tipo de Habitación</label>
                            <select
                                className="form-select"
                                value={calcForm.tipo_habitacion}
                                onChange={(e) => setCalcForm(prev => ({ ...prev, tipo_habitacion: e.target.value }))}
                            >
                                <option value="simple">Simple</option>
                                <option value="doble">Doble</option>
                                <option value="matrimonial">Matrimonial</option>
                                <option value="triple">Triple</option>
                                <option value="suite">Suite</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Fecha Inicio</label>
                            <input
                                type="date"
                                className="form-input"
                                value={calcForm.fecha_inicio}
                                onChange={(e) => setCalcForm(prev => ({ ...prev, fecha_inicio: e.target.value }))}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Fecha Fin</label>
                            <input
                                type="date"
                                className="form-input"
                                value={calcForm.fecha_fin}
                                onChange={(e) => setCalcForm(prev => ({ ...prev, fecha_fin: e.target.value }))}
                            />
                        </div>
                        <button className="btn btn-primary" onClick={calculatePrice} disabled={calculating}>
                            {calculating ? <Loader2 size={18} className="spinner" /> : <DollarSign size={18} />}
                            Calcular
                        </button>
                    </div>

                    {calculatedPrice && (
                        <div className="calculator-result">
                            <div className="result-header">
                                <span className={`badge badge-${getSeasonColor(calculatedPrice.temporada)}`}>
                                    {getSeasonIcon(calculatedPrice.temporada)}
                                    Temporada {calculatedPrice.temporada}
                                </span>
                                <span className="result-multiplier">
                                    Multiplicador: x{calculatedPrice.multiplicador}
                                </span>
                            </div>
                            <div className="result-details">
                                <div className="result-item">
                                    <span>Noches:</span>
                                    <strong>{calculatedPrice.noches}</strong>
                                </div>
                                <div className="result-item">
                                    <span>Precio base:</span>
                                    <strong>S/ {calculatedPrice.precio_base}</strong>
                                </div>
                                <div className="result-item">
                                    <span>Precio promedio/noche:</span>
                                    <strong>S/ {calculatedPrice.precio_promedio_noche}</strong>
                                </div>
                            </div>
                            <div className="result-total">
                                <span>TOTAL SUGERIDO:</span>
                                <strong>S/ {calculatedPrice.total_sugerido}</strong>
                            </div>
                            {calculatedPrice.detalle?.some(d => d.es_fin_semana) && (
                                <p className="result-note">* Incluye recargo de fin de semana (+10%)</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs mb-4">
                <button
                    className={`tab ${activeTab === 'tarifas' ? 'active' : ''}`}
                    onClick={() => setActiveTab('tarifas')}
                >
                    <DollarSign size={18} />
                    Tarifas por Tipo
                </button>
                <button
                    className={`tab ${activeTab === 'temporadas' ? 'active' : ''}`}
                    onClick={() => setActiveTab('temporadas')}
                >
                    <CalendarRange size={18} />
                    Temporadas
                </button>
            </div>

            {/* Tarifas Tab */}
            {activeTab === 'tarifas' && (
                <div className="card">
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Tipo Habitación</th>
                                    <th>Precio Base</th>
                                    <th>Temp. Baja</th>
                                    <th>Temp. Media</th>
                                    <th>Temp. Alta</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tarifas.map(tarifa => (
                                    <tr key={tarifa.id}>
                                        <td>
                                            <div className="room-type-cell">
                                                <BedDouble size={16} />
                                                <strong>{tarifa.tipo_habitacion}</strong>
                                            </div>
                                        </td>
                                        <td>
                                            {editingTarifa === tarifa.id ? (
                                                <input
                                                    type="number"
                                                    className="form-input form-input-sm"
                                                    value={tarifaForm.precio_base}
                                                    onChange={(e) => setTarifaForm(prev => ({ ...prev, precio_base: e.target.value }))}
                                                />
                                            ) : (
                                                `S/ ${tarifa.precio_base}`
                                            )}
                                        </td>
                                        <td className="temp-baja">
                                            {editingTarifa === tarifa.id ? (
                                                <input
                                                    type="number"
                                                    className="form-input form-input-sm"
                                                    value={tarifaForm.precio_temporada_baja}
                                                    onChange={(e) => setTarifaForm(prev => ({ ...prev, precio_temporada_baja: e.target.value }))}
                                                />
                                            ) : (
                                                `S/ ${tarifa.precio_temporada_baja || '-'}`
                                            )}
                                        </td>
                                        <td>
                                            {editingTarifa === tarifa.id ? (
                                                <input
                                                    type="number"
                                                    className="form-input form-input-sm"
                                                    value={tarifaForm.precio_temporada_media}
                                                    onChange={(e) => setTarifaForm(prev => ({ ...prev, precio_temporada_media: e.target.value }))}
                                                />
                                            ) : (
                                                `S/ ${tarifa.precio_temporada_media || '-'}`
                                            )}
                                        </td>
                                        <td className="temp-alta">
                                            {editingTarifa === tarifa.id ? (
                                                <input
                                                    type="number"
                                                    className="form-input form-input-sm"
                                                    value={tarifaForm.precio_temporada_alta}
                                                    onChange={(e) => setTarifaForm(prev => ({ ...prev, precio_temporada_alta: e.target.value }))}
                                                />
                                            ) : (
                                                `S/ ${tarifa.precio_temporada_alta || '-'}`
                                            )}
                                        </td>
                                        <td>
                                            {editingTarifa === tarifa.id ? (
                                                <div className="table-actions">
                                                    <button className="btn btn-success btn-sm" onClick={() => handleSaveTarifa(tarifa)}>
                                                        <Save size={14} />
                                                    </button>
                                                    <button className="btn btn-ghost btn-sm" onClick={() => setEditingTarifa(null)}>
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button className="btn btn-ghost btn-sm" onClick={() => handleEditTarifa(tarifa)}>
                                                    <Edit size={14} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Temporadas Tab */}
            {activeTab === 'temporadas' && (
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Configuración de Temporadas</h3>
                        <button className="btn btn-primary btn-sm" onClick={() => setShowSeasonModal(true)}>
                            <Plus size={16} />
                            Nueva Temporada
                        </button>
                    </div>
                    {temporadas.length === 0 ? (
                        <div className="empty-state">
                            <Calendar size={48} style={{ opacity: 0.3 }} />
                            <p>No hay temporadas configuradas</p>
                            <p className="text-muted">Se usará "temporada media" por defecto</p>
                        </div>
                    ) : (
                        <div className="temporadas-grid">
                            {temporadas.map(temp => (
                                <div key={temp.id} className={`temporada-card ${temp.tipo}`}>
                                    <div className="temporada-header">
                                        {getSeasonIcon(temp.tipo)}
                                        <h4>{temp.nombre}</h4>
                                        <span className={`badge badge-${getSeasonColor(temp.tipo)}`}>{temp.tipo}</span>
                                    </div>
                                    <div className="temporada-dates">
                                        <CalendarRange size={14} />
                                        {new Date(temp.fecha_inicio).toLocaleDateString('es-PE')} - {new Date(temp.fecha_fin).toLocaleDateString('es-PE')}
                                    </div>
                                    <div className="temporada-multiplier">
                                        <Percent size={14} />
                                        Multiplicador: <strong>x{temp.multiplicador}</strong>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Modal Nueva Temporada */}
            {showSeasonModal && (
                <div className="modal-overlay" onClick={() => setShowSeasonModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Nueva Temporada</h2>
                            <button className="modal-close" onClick={() => setShowSeasonModal(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateSeason}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Nombre *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={seasonForm.nombre}
                                        onChange={(e) => setSeasonForm(prev => ({ ...prev, nombre: e.target.value }))}
                                        placeholder="Ej: Fiestas Patrias 2025"
                                        required
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Fecha Inicio *</label>
                                        <input
                                            type="date"
                                            className="form-input"
                                            value={seasonForm.fecha_inicio}
                                            onChange={(e) => setSeasonForm(prev => ({ ...prev, fecha_inicio: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Fecha Fin *</label>
                                        <input
                                            type="date"
                                            className="form-input"
                                            value={seasonForm.fecha_fin}
                                            onChange={(e) => setSeasonForm(prev => ({ ...prev, fecha_fin: e.target.value }))}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Tipo</label>
                                        <select
                                            className="form-select"
                                            value={seasonForm.tipo}
                                            onChange={(e) => setSeasonForm(prev => ({ ...prev, tipo: e.target.value }))}
                                        >
                                            <option value="baja">Baja</option>
                                            <option value="media">Media</option>
                                            <option value="alta">Alta</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Multiplicador</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={seasonForm.multiplicador}
                                            onChange={(e) => setSeasonForm(prev => ({ ...prev, multiplicador: parseFloat(e.target.value) }))}
                                            step="0.01"
                                            min="0.50"
                                            max="3.00"
                                        />
                                        <span className="form-hint">1.00 = sin cambio, 1.20 = +20%, 0.80 = -20%</span>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowSeasonModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={seasonLoading}>
                                    {seasonLoading ? <Loader2 size={16} className="spinner" /> : <Plus size={16} />}
                                    Crear Temporada
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Precios;
