"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    Users,
    Search,
    Plus,
    Eye,
    Edit,
    X,
    Phone,
    Mail,
    MapPin,
    Globe,
    Calendar,
    DollarSign,
    Star,
    Loader2,
    AlertCircle,
    Check,
    RefreshCw,
    Save,
    BedDouble,
    Clock,
    Crown
} from 'lucide-react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import './Huespedes.css';

function Huespedes({ initialHuespedes = [] }) {
    const router = useRouter();
    const [huespedes, setHuespedes] = useState(initialHuespedes);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Selected guest for detail
    const [selectedHuesped, setSelectedHuesped] = useState(null);
    const [huespedDetail, setHuespedDetail] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    // Edit modal
    const [showEditModal, setShowEditModal] = useState(false);
    const [formData, setFormData] = useState({});
    const [formLoading, setFormLoading] = useState(false);

    // Clear messages
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    // Debounced search
    useEffect(() => {
        const searchGuests = async () => {
            if (searchTerm.length < 2) {
                setSearchResults([]);
                return;
            }

            try {
                setSearching(true);
                const response = await fetch(`/api/huespedes/search?q=${encodeURIComponent(searchTerm)}`);
                const data = await response.json();
                setSearchResults(data.huespedes || []);
            } catch (err) {
                console.error('Search error:', err);
            } finally {
                setSearching(false);
            }
        };

        const timer = setTimeout(searchGuests, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchHuespedes = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/huespedes');
            const data = await response.json();
            if (data.huespedes) {
                setHuespedes(data.huespedes);
            }
        } catch (err) {
            setError('Error al cargar huéspedes');
        } finally {
            setLoading(false);
        }
    };

    const loadHuespedDetail = async (huesped) => {
        setSelectedHuesped(huesped);
        setHuespedDetail(null);
        setLoadingDetail(true);

        try {
            const response = await fetch(`/api/huespedes/${huesped.id}`);
            const data = await response.json();
            setHuespedDetail(data);
        } catch (err) {
            setError('Error al cargar detalles');
        } finally {
            setLoadingDetail(false);
        }
    };

    const openEditModal = () => {
        if (!selectedHuesped) return;
        setFormData({
            nombre: selectedHuesped.nombre || '',
            apellidos: selectedHuesped.apellidos || '',
            telefono: selectedHuesped.telefono || '',
            email: selectedHuesped.email || '',
            procedencia: selectedHuesped.procedencia || '',
            nacionalidad: selectedHuesped.nacionalidad || 'Perú',
            es_frecuente: selectedHuesped.es_frecuente || false,
            notas: selectedHuesped.notas || ''
        });
        setShowEditModal(true);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmitEdit = async (e) => {
        e.preventDefault();
        setFormLoading(true);

        try {
            const response = await fetch(`/api/huespedes/${selectedHuesped.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            setSuccessMessage('Huésped actualizado');
            setShowEditModal(false);
            setSelectedHuesped({ ...selectedHuesped, ...formData });
            router.refresh();
            fetchHuespedes();
        } catch (err) {
            setError(err.message);
        } finally {
            setFormLoading(false);
        }
    };

    const displayedGuests = searchTerm.length >= 2 ? searchResults : huespedes;

    return (
        <div className="huespedes-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Gestión de Huéspedes</h1>
                    <p className="page-subtitle">CRM - Base de datos de clientes</p>
                </div>
                <div className="page-header-actions">
                    <button className="btn btn-secondary" onClick={fetchHuespedes} disabled={loading}>
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
                    <button className="alert-close" onClick={() => setError('')}><X size={16} /></button>
                </div>
            )}
            {successMessage && (
                <div className="alert alert-success mb-4">
                    <Check size={20} />
                    <span>{successMessage}</span>
                </div>
            )}

            {/* Search Bar */}
            <div className="search-section">
                <div className="search-input-wrapper search-lg">
                    <Search className="search-icon" size={20} />
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Buscar por DNI, nombre o apellidos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searching && <Loader2 size={18} className="search-spinner spinner" />}
                </div>
                <p className="search-hint">
                    {searchTerm.length > 0 && searchTerm.length < 2
                        ? 'Escribe al menos 2 caracteres para buscar'
                        : `${displayedGuests.length} huéspedes encontrados`}
                </p>
            </div>

            <div className="huespedes-content">
                {/* Guests List */}
                <div className="huespedes-list-panel">
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">
                                <Users size={20} />
                                Lista de Huéspedes
                            </h3>
                        </div>
                        {displayedGuests.length === 0 ? (
                            <div className="empty-state">
                                <Users size={48} style={{ opacity: 0.3 }} />
                                <p>{searchTerm ? 'No se encontraron huéspedes' : 'No hay huéspedes registrados'}</p>
                            </div>
                        ) : (
                            <div className="huespedes-list">
                                {displayedGuests.map(huesped => (
                                    <div
                                        key={huesped.id}
                                        className={`huesped-item ${selectedHuesped?.id === huesped.id ? 'selected' : ''}`}
                                        onClick={() => loadHuespedDetail(huesped)}
                                    >
                                        <div className="huesped-avatar">
                                            {huesped.nombre?.charAt(0)}
                                            {huesped.es_frecuente && (
                                                <span className="vip-badge" title="Huésped Frecuente">
                                                    <Crown size={10} />
                                                </span>
                                            )}
                                        </div>
                                        <div className="huesped-info">
                                            <span className="huesped-nombre">
                                                {huesped.nombre} {huesped.apellidos || ''}
                                            </span>
                                            <span className="huesped-documento">
                                                {huesped.tipo_documento}: {huesped.numero_documento}
                                            </span>
                                        </div>
                                        <div className="huesped-contact">
                                            {huesped.telefono && (
                                                <span><Phone size={12} /> {huesped.telefono}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Guest Detail */}
                <div className="huesped-detail-panel">
                    {selectedHuesped ? (
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">Detalle del Huésped</h3>
                                <button className="btn btn-ghost btn-icon" onClick={openEditModal}>
                                    <Edit size={18} />
                                </button>
                            </div>

                            {loadingDetail ? (
                                <div className="loading-state">
                                    <Loader2 size={32} className="spinner" />
                                    <p>Cargando historial...</p>
                                </div>
                            ) : huespedDetail ? (
                                <div className="card-body">
                                    {/* Guest Info */}
                                    <div className="detail-header">
                                        <div className="detail-avatar">
                                            {selectedHuesped.nombre?.charAt(0)}
                                            {(huespedDetail.resumen?.es_vip || selectedHuesped.es_frecuente) && (
                                                <span className="vip-crown"><Crown size={16} /></span>
                                            )}
                                        </div>
                                        <div className="detail-title">
                                            <h2>{selectedHuesped.nombre} {selectedHuesped.apellidos || ''}</h2>
                                            <span className="detail-doc">
                                                {selectedHuesped.tipo_documento}: {selectedHuesped.numero_documento}
                                            </span>
                                            {(huespedDetail.resumen?.es_vip || selectedHuesped.es_frecuente) && (
                                                <span className="badge badge-vip">
                                                    <Star size={12} /> VIP
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Contact Info */}
                                    <div className="detail-section">
                                        <h4>Información de Contacto</h4>
                                        <div className="detail-grid">
                                            <div className="detail-item">
                                                <Phone size={14} />
                                                <span>{selectedHuesped.telefono || 'No registrado'}</span>
                                            </div>
                                            <div className="detail-item">
                                                <Mail size={14} />
                                                <span>{selectedHuesped.email || 'No registrado'}</span>
                                            </div>
                                            <div className="detail-item">
                                                <MapPin size={14} />
                                                <span>{selectedHuesped.procedencia || 'No registrado'}</span>
                                            </div>
                                            <div className="detail-item">
                                                <Globe size={14} />
                                                <span>{selectedHuesped.nacionalidad || 'Perú'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Summary Stats */}
                                    <div className="detail-section">
                                        <h4>Resumen Histórico</h4>
                                        <div className="stats-grid">
                                            <div className="stat-box">
                                                <BedDouble size={20} />
                                                <div className="stat-value">{huespedDetail.resumen?.total_estadias || 0}</div>
                                                <div className="stat-label">Estadías</div>
                                            </div>
                                            <div className="stat-box">
                                                <Clock size={20} />
                                                <div className="stat-value">{huespedDetail.resumen?.total_noches || 0}</div>
                                                <div className="stat-label">Noches</div>
                                            </div>
                                            <div className="stat-box primary">
                                                <DollarSign size={20} />
                                                <div className="stat-value">S/ {(huespedDetail.resumen?.total_gastado || 0).toFixed(2)}</div>
                                                <div className="stat-label">Total Gastado</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stay History */}
                                    <div className="detail-section">
                                        <h4>Historial de Estadías</h4>
                                        {huespedDetail.estadias?.length === 0 ? (
                                            <p className="text-muted">Sin estadías registradas</p>
                                        ) : (
                                            <div className="history-list">
                                                {huespedDetail.estadias?.map(estadia => (
                                                    <div key={estadia.id} className="history-item">
                                                        <div className="history-date">
                                                            <Calendar size={14} />
                                                            {new Date(estadia.fecha_checkin).toLocaleDateString('es-PE')}
                                                        </div>
                                                        <div className="history-room">
                                                            <BedDouble size={14} />
                                                            {estadia.habitacion?.numero} - {estadia.habitacion?.tipo}
                                                        </div>
                                                        <div className="history-nights">
                                                            {estadia.noches} noches
                                                        </div>
                                                        <div className="history-total">
                                                            S/ {(estadia.total || 0).toFixed(2)}
                                                        </div>
                                                        <span className={`badge badge-${estadia.estado === 'checkout' ? 'secondary' : 'success'}`}>
                                                            {estadia.estado}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    ) : (
                        <div className="card">
                            <div className="empty-state">
                                <Eye size={48} style={{ opacity: 0.3 }} />
                                <p>Selecciona un huésped para ver sus detalles</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Editar Huésped</h2>
                            <button className="modal-close" onClick={() => setShowEditModal(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmitEdit}>
                            <div className="modal-body">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Nombres</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            name="nombre"
                                            value={formData.nombre}
                                            onChange={handleInputChange}
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
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Nacionalidad</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            name="nacionalidad"
                                            value={formData.nacionalidad}
                                            onChange={handleInputChange}
                                        />
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
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            name="es_frecuente"
                                            checked={formData.es_frecuente}
                                            onChange={handleInputChange}
                                        />
                                        <Star size={16} />
                                        Marcar como huésped frecuente (VIP)
                                    </label>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={formLoading}>
                                    {formLoading ? (
                                        <>
                                            <Loader2 size={16} className="spinner" />
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={16} />
                                            Guardar Cambios
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Huespedes;
