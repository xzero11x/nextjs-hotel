"use client";

import { useState } from 'react';
import {
    BedDouble,
    Search,
    Filter,
    Grid3X3,
    List,
    Plus,
    Users,
    DollarSign,
    Clock,
    Eye,
    Edit,
    Trash2,
    X,
    Bed,
    Crown,
    Heart
} from 'lucide-react';
import { habitaciones, huespedes, tarifas } from '@/data/mockData';
import './Habitaciones.css';

function Habitaciones() {
    const [viewMode, setViewMode] = useState('grid');
    const [filterEstado, setFilterEstado] = useState('todos');
    const [filterTipo, setFilterTipo] = useState('todos');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [showNewRoomModal, setShowNewRoomModal] = useState(false);

    const filteredRooms = habitaciones.filter(room => {
        const matchesEstado = filterEstado === 'todos' || room.estado === filterEstado;
        const matchesTipo = filterTipo === 'todos' || room.tipo === filterTipo;
        const matchesSearch = room.numero.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesEstado && matchesTipo && matchesSearch;
    });

    const getHuesped = (huespedId) => {
        return huespedes.find(h => h.id === huespedId);
    };

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

    return (
        <div className="habitaciones-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Gestión de Habitaciones</h1>
                    <p className="page-subtitle">Administra el estado y disponibilidad de las habitaciones</p>
                </div>
                <div className="page-header-actions">
                    <button className="btn btn-primary" onClick={() => setShowNewRoomModal(true)}>
                        <Plus size={18} />
                        Nueva Habitación
                    </button>
                </div>
            </div>

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
                        const huesped = room.huespedId ? getHuesped(room.huespedId) : null;
                        return (
                            <div
                                key={room.id}
                                className={`room-card ${room.estado}`}
                                onClick={() => setSelectedRoom(room)}
                            >
                                <div className="room-card-header">
                                    <span className="room-number">{room.numero}</span>
                                    <span className={`badge badge-${room.estado}`}>{room.estado}</span>
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
                                            <span className="room-price">S/ {room.precioActual}</span>
                                        </div>
                                    </div>
                                    {huesped && (
                                        <div className="room-guest">
                                            <div className="avatar avatar-sm">{huesped.nombre.charAt(0)}</div>
                                            <span className="guest-name">{huesped.nombre}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="room-card-footer">
                                    <span className="room-floor">Piso {room.piso}</span>
                                    <div className="room-actions">
                                        <button className="btn btn-ghost btn-icon" title="Ver detalles">
                                            <Eye size={16} />
                                        </button>
                                        <button className="btn btn-ghost btn-icon" title="Editar">
                                            <Edit size={16} />
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
                                    <th>Habitación</th>
                                    <th>Tipo</th>
                                    <th>Capacidad</th>
                                    <th>Piso</th>
                                    <th>Estado</th>
                                    <th>Precio</th>
                                    <th>Huésped</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRooms.map((room) => {
                                    const huesped = room.huespedId ? getHuesped(room.huespedId) : null;
                                    return (
                                        <tr key={room.id}>
                                            <td>
                                                <div className="room-number-cell">
                                                    <BedDouble size={18} />
                                                    <span className="room-number-text">{room.numero}</span>
                                                </div>
                                            </td>
                                            <td className="capitalize">{room.tipo}</td>
                                            <td>{room.capacidad} personas</td>
                                            <td>Piso {room.piso}</td>
                                            <td>
                                                <span className={`badge badge-${room.estado}`}>{room.estado}</span>
                                            </td>
                                            <td className="room-price-cell">S/ {room.precioActual}</td>
                                            <td>
                                                {huesped ? (
                                                    <div className="guest-cell">
                                                        <div className="avatar avatar-sm">{huesped.nombre.charAt(0)}</div>
                                                        <span>{huesped.nombre}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted">-</span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="table-actions">
                                                    <button className="btn btn-ghost btn-sm" title="Ver">
                                                        <Eye size={16} />
                                                    </button>
                                                    <button className="btn btn-ghost btn-sm" title="Editar">
                                                        <Edit size={16} />
                                                    </button>
                                                    <button className="btn btn-ghost btn-sm text-danger" title="Eliminar">
                                                        <Trash2 size={16} />
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

            {/* Room Detail Modal */}
            {selectedRoom && (
                <div className="modal-overlay" onClick={() => setSelectedRoom(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Habitación {selectedRoom.numero}</h2>
                            <button className="modal-close" onClick={() => setSelectedRoom(null)}>
                                <X size={24} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="room-detail-grid">
                                <div className="detail-item">
                                    <span className="detail-label">Tipo</span>
                                    <span className="detail-value capitalize">{selectedRoom.tipo}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Capacidad</span>
                                    <span className="detail-value">{selectedRoom.capacidad} personas</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Piso</span>
                                    <span className="detail-value">{selectedRoom.piso}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Estado</span>
                                    <span className={`badge badge-${selectedRoom.estado}`}>{selectedRoom.estado}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Precio Base</span>
                                    <span className="detail-value">S/ {selectedRoom.precioBase}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Precio Actual</span>
                                    <span className="detail-value highlight">S/ {selectedRoom.precioActual}</span>
                                </div>
                            </div>
                            {selectedRoom.huespedId && (
                                <div className="current-guest-section">
                                    <h4>Huésped Actual</h4>
                                    <div className="guest-info-card">
                                        {(() => {
                                            const huesped = getHuesped(selectedRoom.huespedId);
                                            return huesped ? (
                                                <>
                                                    <div className="avatar avatar-lg">{huesped.nombre.charAt(0)}</div>
                                                    <div className="guest-details">
                                                        <p className="guest-name-lg">{huesped.nombre}</p>
                                                        <p className="guest-dni">DNI: {huesped.dni}</p>
                                                        <p className="guest-dates">
                                                            Check-in: {new Date(huesped.checkInDate).toLocaleDateString('es-PE')} |
                                                            Check-out: {new Date(huesped.checkOutDate).toLocaleDateString('es-PE')}
                                                        </p>
                                                    </div>
                                                </>
                                            ) : null;
                                        })()}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setSelectedRoom(null)}>
                                Cerrar
                            </button>
                            <button className="btn btn-primary">
                                <Edit size={16} />
                                Editar Habitación
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* New Room Modal */}
            {showNewRoomModal && (
                <div className="modal-overlay" onClick={() => setShowNewRoomModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Nueva Habitación</h2>
                            <button className="modal-close" onClick={() => setShowNewRoomModal(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <form className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Número de Habitación</label>
                                    <input type="text" className="form-input" placeholder="Ej: 101" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Piso</label>
                                    <select className="form-select">
                                        <option value="">Seleccionar piso</option>
                                        <option value="1">Piso 1</option>
                                        <option value="2">Piso 2</option>
                                        <option value="3">Piso 3</option>
                                        <option value="4">Piso 4</option>
                                        <option value="5">Piso 5</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Tipo de Habitación</label>
                                    <select className="form-select">
                                        <option value="">Seleccionar tipo</option>
                                        <option value="simple">Simple</option>
                                        <option value="doble">Doble</option>
                                        <option value="matrimonial">Matrimonial</option>
                                        <option value="suite">Suite</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Capacidad</label>
                                    <select className="form-select">
                                        <option value="">Seleccionar capacidad</option>
                                        <option value="1">1 persona</option>
                                        <option value="2">2 personas</option>
                                        <option value="3">3 personas</option>
                                        <option value="4">4 personas</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Precio Base (S/)</label>
                                    <input type="number" className="form-input" placeholder="Ej: 150" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Estado Inicial</label>
                                    <select className="form-select">
                                        <option value="disponible">Disponible</option>
                                        <option value="mantenimiento">En Mantenimiento</option>
                                    </select>
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowNewRoomModal(false)}>
                                Cancelar
                            </button>
                            <button className="btn btn-primary" onClick={() => setShowNewRoomModal(false)}>
                                <Plus size={16} />
                                Crear Habitación
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Habitaciones;

