"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    BedDouble,
    Search,
    Grid3X3,
    List,
    Plus,
    Users,
    DollarSign,
    Eye,
    Edit,
    Trash2,
    X,
    Bed,
    Crown,
    Heart,
    Loader2,
    AlertCircle,
    Check,
    RefreshCw,
    Save,
    Wrench
} from 'lucide-react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import './Habitaciones.css';

function Habitaciones({ initialHabitaciones = [], initialTarifas = [], initialEstadias = [] }) {
    const router = useRouter();
    const [habitaciones, setHabitaciones] = useState(initialHabitaciones);
    const [tarifas, setTarifas] = useState(initialTarifas);
    const [estadiasActivas, setEstadiasActivas] = useState(initialEstadias);

    const [viewMode, setViewMode] = useState('grid');
    const [filterEstado, setFilterEstado] = useState('todos');
    const [filterTipo, setFilterTipo] = useState('todos');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRoom, setSelectedRoom] = useState(null);

    // Modal states
    const [showNewRoomModal, setShowNewRoomModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');

    // Messages
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // Form data
    const [formData, setFormData] = useState({
        numero: '',
        tipo: 'simple',
        capacidad: 1,
        piso: 1,
        precio_base: '',
        descripcion: '',
        amenidades: []
    });

    // Confirm dialog
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        title: '',
        message: '',
        variant: 'danger',
        onConfirm: () => { },
        loading: false
    });

    // Clear messages
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(''), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    // Get guest for occupied room
    const getHuespedForRoom = (roomId) => {
        const estadia = estadiasActivas.find(e => e.habitacion_id === roomId);
        return estadia?.huesped || null;
    };

    const fetchHabitaciones = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/habitaciones');
            const data = await response.json();
            if (data.habitaciones) {
                setHabitaciones(data.habitaciones);
            }
        } catch (err) {
            setError('Error al cargar habitaciones');
        } finally {
            setLoading(false);
        }
    };

    const filteredRooms = habitaciones.filter(room => {
        const matchesEstado = filterEstado === 'todos' || room.estado === filterEstado;
        const matchesTipo = filterTipo === 'todos' || room.tipo === filterTipo;
        const matchesSearch = room.numero?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesEstado && matchesTipo && matchesSearch;
    });

    const roomCounts = {
        todos: habitaciones.length,
        disponible: habitaciones.filter(r => r.estado === 'disponible').length,
        ocupada: habitaciones.filter(r => r.estado === 'ocupada').length,
        limpieza: habitaciones.filter(r => r.estado === 'limpieza').length,
        mantenimiento: habitaciones.filter(r => r.estado === 'mantenimiento').length,
    };

    const getTipoIcon = (tipo) => {
        switch (tipo) {
            case 'simple': return <Bed size={18} />;
            case 'doble': return <BedDouble size={18} />;
            case 'matrimonial': return <Heart size={18} />;
            case 'suite': return <Crown size={18} />;
            default: return <Bed size={18} />;
        }
    };

    const getEstadoColor = (estado) => {
        switch (estado) {
            case 'disponible': return 'success';
            case 'ocupada': return 'danger';
            case 'limpieza': return 'warning';
            case 'mantenimiento': return 'secondary';
            default: return 'secondary';
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || '' : value
        }));
    };

    const openCreateModal = () => {
        setModalMode('create');
        setFormData({
            numero: '',
            tipo: 'simple',
            capacidad: 1,
            piso: 1,
            precio_base: '',
            descripcion: '',
            amenidades: []
        });
        setFormError('');
        setShowNewRoomModal(true);
    };

    const openEditModal = (room) => {
        setModalMode('edit');
        setSelectedRoom(room);
        setFormData({
            numero: room.numero,
            tipo: room.tipo,
            capacidad: room.capacidad,
            piso: room.piso,
            precio_base: room.precio_base,
            descripcion: room.descripcion || '',
            amenidades: room.amenidades || []
        });
        setFormError('');
        setShowEditModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError('');

        try {
            if (modalMode === 'create') {
                const response = await fetch('/api/habitaciones', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.error);

                setSuccessMessage(`Habitación ${formData.numero} creada exitosamente`);
                setShowNewRoomModal(false);
            } else {
                const response = await fetch(`/api/habitaciones/${selectedRoom.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        tipo: formData.tipo,
                        precio_base: formData.precio_base,
                        descripcion: formData.descripcion,
                        amenidades: formData.amenidades
                    })
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.error);

                setSuccessMessage(`Habitación ${formData.numero} actualizada`);
                setShowEditModal(false);
            }

            router.refresh();
            fetchHabitaciones();
        } catch (err) {
            setFormError(err.message);
        } finally {
            setFormLoading(false);
        }
    };

    const handleSetMantenimiento = (room) => {
        if (room.estado === 'ocupada') {
            setError('No se puede poner en mantenimiento una habitación ocupada');
            return;
        }

        setConfirmDialog({
            isOpen: true,
            title: room.estado === 'mantenimiento' ? 'Quitar de Mantenimiento' : 'Poner en Mantenimiento',
            message: room.estado === 'mantenimiento'
                ? `¿Marcar habitación ${room.numero} como disponible?`
                : `¿Poner habitación ${room.numero} en mantenimiento?`,
            variant: room.estado === 'mantenimiento' ? 'success' : 'warning',
            confirmText: room.estado === 'mantenimiento' ? 'Marcar Disponible' : 'Confirmar',
            loading: false,
            onConfirm: async () => {
                try {
                    setConfirmDialog(prev => ({ ...prev, loading: true }));

                    const newEstado = room.estado === 'mantenimiento' ? 'disponible' : 'mantenimiento';

                    const response = await fetch(`/api/habitaciones/${room.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ estado: newEstado })
                    });

                    if (!response.ok) throw new Error('Error al cambiar estado');

                    setSuccessMessage(`Habitación ${room.numero} ahora está en ${newEstado}`);
                    router.refresh();
                    fetchHabitaciones();
                    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                } catch (err) {
                    setError(err.message);
                    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                }
            }
        });
    };

    const handleDelete = (room) => {
        if (room.estado === 'ocupada') {
            setError('No se puede eliminar una habitación ocupada');
            return;
        }

        setConfirmDialog({
            isOpen: true,
            title: 'Eliminar Habitación',
            message: `¿Estás seguro de eliminar la habitación ${room.numero}? Esta acción la desactivará del sistema.`,
            variant: 'danger',
            confirmText: 'Eliminar',
            loading: false,
            onConfirm: async () => {
                try {
                    setConfirmDialog(prev => ({ ...prev, loading: true }));

                    const response = await fetch(`/api/habitaciones/${room.id}`, {
                        method: 'DELETE'
                    });

                    if (!response.ok) {
                        const data = await response.json();
                        throw new Error(data.error);
                    }

                    setSuccessMessage(`Habitación ${room.numero} eliminada`);
                    router.refresh();
                    fetchHabitaciones();
                    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                } catch (err) {
                    setError(err.message);
                    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                }
            }
        });
    };

    return (
        <div className="habitaciones-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Gestión de Habitaciones</h1>
                    <p className="page-subtitle">Administra el estado y disponibilidad de las habitaciones</p>
                </div>
                <div className="page-header-actions">
                    <button className="btn btn-secondary" onClick={fetchHabitaciones} disabled={loading}>
                        <RefreshCw size={18} className={loading ? 'spinner' : ''} />
                    </button>
                    <button className="btn btn-primary" onClick={openCreateModal}>
                        <Plus size={18} />
                        Nueva Habitación
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

            {/* Quick Stats */}
            <div className="quick-stats">
                <div className="quick-stat">
                    <span className="quick-stat-dot disponible"></span>
                    <span className="quick-stat-value">{roomCounts.disponible}</span>
                    <span className="quick-stat-label">Disponibles</span>
                </div>
                <div className="quick-stat">
                    <span className="quick-stat-dot ocupada"></span>
                    <span className="quick-stat-value">{roomCounts.ocupada}</span>
                    <span className="quick-stat-label">Ocupadas</span>
                </div>
                <div className="quick-stat">
                    <span className="quick-stat-dot limpieza"></span>
                    <span className="quick-stat-value">{roomCounts.limpieza}</span>
                    <span className="quick-stat-label">Limpieza</span>
                </div>
                <div className="quick-stat">
                    <span className="quick-stat-dot mantenimiento"></span>
                    <span className="quick-stat-value">{roomCounts.mantenimiento}</span>
                    <span className="quick-stat-label">Mantenimiento</span>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="filter-bar">
                <div className="search-input-wrapper">
                    <Search className="search-icon" size={18} />
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Buscar habitación..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <select
                    className="form-select"
                    value={filterEstado}
                    onChange={(e) => setFilterEstado(e.target.value)}
                >
                    <option value="todos">Todos los estados</option>
                    <option value="disponible">Disponible</option>
                    <option value="ocupada">Ocupada</option>
                    <option value="limpieza">En limpieza</option>
                    <option value="mantenimiento">En mantenimiento</option>
                </select>

                <select
                    className="form-select"
                    value={filterTipo}
                    onChange={(e) => setFilterTipo(e.target.value)}
                >
                    <option value="todos">Todos los tipos</option>
                    <option value="simple">Simple</option>
                    <option value="doble">Doble</option>
                    <option value="matrimonial">Matrimonial</option>
                    <option value="suite">Suite</option>
                </select>

                <div className="view-toggle">
                    <button
                        className={`btn btn-icon ${viewMode === 'grid' ? 'active' : ''}`}
                        onClick={() => setViewMode('grid')}
                    >
                        <Grid3X3 size={18} />
                    </button>
                    <button
                        className={`btn btn-icon ${viewMode === 'list' ? 'active' : ''}`}
                        onClick={() => setViewMode('list')}
                    >
                        <List size={18} />
                    </button>
                </div>
            </div>

            {/* Room Grid View */}
            {viewMode === 'grid' && (
                <div className="rooms-grid">
                    {filteredRooms.map((room) => {
                        const huesped = getHuespedForRoom(room.id);
                        return (
                            <div
                                key={room.id}
                                className={`room-card ${room.estado}`}
                            >
                                <div className="room-card-header">
                                    <span className="room-number">{room.numero}</span>
                                    <span className={`badge badge-${getEstadoColor(room.estado)}`}>{room.estado}</span>
                                </div>
                                <div className="room-card-body">
                                    <div className="room-type-display">
                                        <span className="room-type-icon">{getTipoIcon(room.tipo)}</span>
                                        <span className="room-type">{room.tipo}</span>
                                    </div>
                                    <div className="room-details">
                                        <div className="room-detail">
                                            <Users size={14} />
                                            <span>Capacidad: {room.capacidad}</span>
                                        </div>
                                        <div className="room-detail">
                                            <DollarSign size={14} />
                                            <span className="room-price">S/ {room.precio_base}</span>
                                        </div>
                                    </div>
                                    {huesped && (
                                        <div className="room-guest">
                                            <div className="avatar avatar-sm">{huesped.nombre?.charAt(0)}</div>
                                            <span className="guest-name">{huesped.nombre} {huesped.apellidos || ''}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="room-card-footer">
                                    <span className="room-floor">Piso {room.piso}</span>
                                    <div className="room-actions">
                                        <button
                                            className="btn btn-ghost btn-icon"
                                            title="Editar"
                                            onClick={() => openEditModal(room)}
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            className="btn btn-ghost btn-icon"
                                            title={room.estado === 'mantenimiento' ? 'Quitar mantenimiento' : 'Mantenimiento'}
                                            onClick={() => handleSetMantenimiento(room)}
                                        >
                                            <Wrench size={16} />
                                        </button>
                                        <button
                                            className="btn btn-ghost btn-icon text-danger"
                                            title="Eliminar"
                                            onClick={() => handleDelete(room)}
                                            disabled={room.estado === 'ocupada'}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Room List View */}
            {viewMode === 'list' && (
                <div className="card">
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Número</th>
                                    <th>Tipo</th>
                                    <th>Piso</th>
                                    <th>Capacidad</th>
                                    <th>Precio</th>
                                    <th>Estado</th>
                                    <th>Huésped</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRooms.map((room) => {
                                    const huesped = getHuespedForRoom(room.id);
                                    return (
                                        <tr key={room.id}>
                                            <td><strong>{room.numero}</strong></td>
                                            <td>
                                                <span className="room-type-inline">
                                                    {getTipoIcon(room.tipo)}
                                                    {room.tipo}
                                                </span>
                                            </td>
                                            <td>{room.piso}</td>
                                            <td>{room.capacidad}</td>
                                            <td>S/ {room.precio_base}</td>
                                            <td>
                                                <span className={`badge badge-${getEstadoColor(room.estado)}`}>
                                                    {room.estado}
                                                </span>
                                            </td>
                                            <td>
                                                {huesped ? (
                                                    <span>{huesped.nombre} {huesped.apellidos || ''}</span>
                                                ) : (
                                                    <span className="text-muted">-</span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="table-actions">
                                                    <button
                                                        className="btn btn-ghost btn-sm"
                                                        onClick={() => openEditModal(room)}
                                                    >
                                                        <Edit size={14} />
                                                    </button>
                                                    <button
                                                        className="btn btn-ghost btn-sm"
                                                        onClick={() => handleSetMantenimiento(room)}
                                                    >
                                                        <Wrench size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal Nueva/Editar Habitación */}
            {(showNewRoomModal || showEditModal) && (
                <div className="modal-overlay" onClick={() => { setShowNewRoomModal(false); setShowEditModal(false); }}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">
                                {modalMode === 'create' ? 'Nueva Habitación' : `Editar Habitación ${formData.numero}`}
                            </h2>
                            <button className="modal-close" onClick={() => { setShowNewRoomModal(false); setShowEditModal(false); }}>
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                {formError && (
                                    <div className="alert alert-error mb-4">
                                        <AlertCircle size={18} />
                                        <span>{formError}</span>
                                    </div>
                                )}

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Número *</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            name="numero"
                                            value={formData.numero}
                                            onChange={handleInputChange}
                                            placeholder="Ej: 101"
                                            required
                                            disabled={modalMode === 'edit'}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Piso</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            name="piso"
                                            value={formData.piso}
                                            onChange={handleInputChange}
                                            min="1"
                                            disabled={modalMode === 'edit'}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Tipo *</label>
                                        <select
                                            className="form-select"
                                            name="tipo"
                                            value={formData.tipo}
                                            onChange={handleInputChange}
                                        >
                                            <option value="simple">Simple</option>
                                            <option value="doble">Doble</option>
                                            <option value="matrimonial">Matrimonial</option>
                                            <option value="suite">Suite</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Capacidad</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            name="capacidad"
                                            value={formData.capacidad}
                                            onChange={handleInputChange}
                                            min="1"
                                            max="10"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Precio Base (S/) *</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        name="precio_base"
                                        value={formData.precio_base}
                                        onChange={handleInputChange}
                                        step="0.01"
                                        min="0"
                                        placeholder="Ej: 80.00"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Descripción</label>
                                    <textarea
                                        className="form-input"
                                        name="descripcion"
                                        value={formData.descripcion}
                                        onChange={handleInputChange}
                                        rows="2"
                                        placeholder="Descripción de la habitación..."
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => { setShowNewRoomModal(false); setShowEditModal(false); }}
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={formLoading}>
                                    {formLoading ? (
                                        <>
                                            <Loader2 size={16} className="spinner" />
                                            {modalMode === 'create' ? 'Creando...' : 'Guardando...'}
                                        </>
                                    ) : (
                                        <>
                                            {modalMode === 'create' ? <Plus size={16} /> : <Save size={16} />}
                                            {modalMode === 'create' ? 'Crear Habitación' : 'Guardar Cambios'}
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

export default Habitaciones;
