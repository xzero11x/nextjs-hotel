"use client";

import { useState, useEffect } from 'react';
import {
    ShieldCheck,
    Plus,
    Edit,
    Trash2,
    User,
    Mail,
    Key,
    Check,
    X,
    UserPlus,
    Loader2,
    AlertCircle,
    Phone,
    ToggleLeft,
    ToggleRight,
    RefreshCw,
    Save
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import './Usuarios.css';

function Usuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [editingUser, setEditingUser] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');

    // Confirm dialog states
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        title: '',
        message: '',
        variant: 'danger',
        confirmText: 'Confirmar',
        onConfirm: () => { },
        loading: false
    });

    // Form state
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        password: '',
        rol: 'recepcionista',
        telefono: ''
    });

    // Get current authenticated user
    useEffect(() => {
        const getCurrentUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setCurrentUser(user);
            }
        };
        getCurrentUser();
    }, []);

    // Fetch users on mount
    useEffect(() => {
        fetchUsuarios();
    }, []);

    // Clear success message after 3 seconds
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    const fetchUsuarios = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/usuarios');
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al cargar usuarios');
            }

            setUsuarios(data.usuarios || []);
            setError('');
        } catch (err) {
            setError(err.message);
            setUsuarios([]);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const openCreateModal = () => {
        setModalMode('create');
        setEditingUser(null);
        setFormData({
            nombre: '',
            email: '',
            password: '',
            rol: 'recepcionista',
            telefono: ''
        });
        setFormError('');
        setShowModal(true);
    };

    const openEditModal = (usuario) => {
        setModalMode('edit');
        setEditingUser(usuario);
        setFormData({
            nombre: usuario.nombre,
            email: usuario.email,
            password: '',
            rol: usuario.rol,
            telefono: usuario.telefono || ''
        });
        setFormError('');
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError('');

        try {
            if (modalMode === 'create') {
                const response = await fetch('/api/usuarios', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Error al crear usuario');
                }

                setSuccessMessage(`Usuario ${formData.nombre} creado exitosamente`);
            } else {
                const updateData = {
                    nombre: formData.nombre,
                    rol: formData.rol,
                    telefono: formData.telefono,
                    activo: editingUser.activo
                };

                const response = await fetch(`/api/usuarios/${editingUser.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updateData)
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Error al actualizar usuario');
                }

                setSuccessMessage(`Usuario ${formData.nombre} actualizado exitosamente`);
            }

            await fetchUsuarios();
            setShowModal(false);
        } catch (err) {
            setFormError(err.message);
        } finally {
            setFormLoading(false);
        }
    };

    const handleToggleActive = (usuario) => {
        // Prevent self-deactivation
        if (currentUser && usuario.id === currentUser.id) {
            setError('No puedes desactivarte a ti mismo');
            setTimeout(() => setError(''), 3000);
            return;
        }

        const newStatus = !usuario.activo;
        setConfirmDialog({
            isOpen: true,
            title: newStatus ? 'Activar Usuario' : 'Desactivar Usuario',
            message: newStatus
                ? `¿Deseas activar a ${usuario.nombre}? Podrá acceder al sistema nuevamente.`
                : `¿Deseas desactivar a ${usuario.nombre}? No podrá acceder al sistema hasta que lo reactives.`,
            variant: newStatus ? 'success' : 'warning',
            confirmText: newStatus ? 'Activar' : 'Desactivar',
            loading: false,
            onConfirm: async () => {
                try {
                    setConfirmDialog(prev => ({ ...prev, loading: true }));

                    const response = await fetch(`/api/usuarios/${usuario.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            nombre: usuario.nombre,
                            rol: usuario.rol,
                            telefono: usuario.telefono,
                            activo: newStatus
                        })
                    });

                    if (!response.ok) {
                        const data = await response.json();
                        throw new Error(data.error);
                    }

                    setSuccessMessage(`Usuario ${newStatus ? 'activado' : 'desactivado'} exitosamente`);
                    await fetchUsuarios();
                    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                } catch (err) {
                    setError(err.message);
                    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                }
            }
        });
    };

    const handleDelete = (usuario) => {
        // Prevent self-deletion
        if (currentUser && usuario.id === currentUser.id) {
            setError('No puedes eliminarte a ti mismo');
            setTimeout(() => setError(''), 3000);
            return;
        }

        setConfirmDialog({
            isOpen: true,
            title: 'Eliminar Usuario',
            message: `¿Estás seguro de eliminar a ${usuario.nombre}? El usuario será desactivado y no podrá acceder al sistema.`,
            variant: 'danger',
            confirmText: 'Eliminar',
            loading: false,
            onConfirm: async () => {
                try {
                    setConfirmDialog(prev => ({ ...prev, loading: true }));

                    const response = await fetch(`/api/usuarios/${usuario.id}`, {
                        method: 'DELETE'
                    });

                    if (!response.ok) {
                        const data = await response.json();
                        throw new Error(data.error);
                    }

                    setSuccessMessage(`Usuario ${usuario.nombre} eliminado exitosamente`);
                    await fetchUsuarios();
                    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                } catch (err) {
                    setError(err.message);
                    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                }
            }
        });
    };

    const closeConfirmDialog = () => {
        if (!confirmDialog.loading) {
            setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
    };

    const isCurrentUser = (userId) => currentUser && userId === currentUser.id;

    const getRolColor = (rol) => {
        switch (rol) {
            case 'administrador': return 'primary';
            case 'recepcionista': return 'success';
            case 'limpieza': return 'gold';
            case 'contador': return 'purple';
            default: return 'secondary';
        }
    };

    const getRolIcon = (rol) => {
        switch (rol) {
            case 'administrador': return <ShieldCheck size={14} />;
            case 'recepcionista': return <User size={14} />;
            case 'limpieza': return <RefreshCw size={14} />;
            case 'contador': return <Key size={14} />;
            default: return <User size={14} />;
        }
    };

    const permisos = [
        { modulo: 'Dashboard', admin: true, recepcion: true, limpieza: true, contador: true },
        { modulo: 'Habitaciones', admin: true, recepcion: true, limpieza: true, contador: false },
        { modulo: 'Check-in / Check-out', admin: true, recepcion: true, limpieza: false, contador: false },
        { modulo: 'Huéspedes', admin: true, recepcion: true, limpieza: false, contador: false },
        { modulo: 'Reservas', admin: true, recepcion: true, limpieza: false, contador: false },
        { modulo: 'Pagos y Facturación', admin: true, recepcion: true, limpieza: false, contador: true },
        { modulo: 'Precios y Tarifas', admin: true, recepcion: false, limpieza: false, contador: false },
        { modulo: 'Limpieza', admin: true, recepcion: true, limpieza: true, contador: false },
        { modulo: 'Reportes', admin: true, recepcion: false, limpieza: false, contador: true },
        { modulo: 'Usuarios', admin: true, recepcion: false, limpieza: false, contador: false },
        { modulo: 'Configuración', admin: true, recepcion: false, limpieza: false, contador: false },
    ];

    if (loading) {
        return (
            <div className="usuarios-page">
                <div className="loading-container">
                    <Loader2 size={48} className="spinner" />
                    <p>Cargando usuarios...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="usuarios-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Usuarios y Roles</h1>
                    <p className="page-subtitle">Gestiona usuarios y permisos del sistema</p>
                </div>
                <div className="page-header-actions">
                    <button className="btn btn-secondary" onClick={fetchUsuarios}>
                        <RefreshCw size={18} />
                        Actualizar
                    </button>
                    <button className="btn btn-primary" onClick={openCreateModal}>
                        <UserPlus size={18} />
                        Nuevo Usuario
                    </button>
                </div>
            </div>

            {/* Messages */}
            {error && (
                <div className="alert alert-error mb-6">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            {successMessage && (
                <div className="alert alert-success mb-6">
                    <Check size={20} />
                    <span>{successMessage}</span>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-4 mb-6">
                <div className="stat-card primary">
                    <div className="stat-card-icon">
                        <User size={24} />
                    </div>
                    <div className="stat-value">{usuarios.length}</div>
                    <div className="stat-label">Total Usuarios</div>
                </div>
                <div className="stat-card success">
                    <div className="stat-card-icon">
                        <Check size={24} />
                    </div>
                    <div className="stat-value">{usuarios.filter(u => u.activo).length}</div>
                    <div className="stat-label">Activos</div>
                </div>
                <div className="stat-card gold">
                    <div className="stat-card-icon">
                        <ShieldCheck size={24} />
                    </div>
                    <div className="stat-value">{usuarios.filter(u => u.rol === 'administrador').length}</div>
                    <div className="stat-label">Administradores</div>
                </div>
                <div className="stat-card purple">
                    <div className="stat-card-icon">
                        <Key size={24} />
                    </div>
                    <div className="stat-value">4</div>
                    <div className="stat-label">Roles</div>
                </div>
            </div>

            <div className="grid grid-cols-2">
                {/* Usuarios List */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <h3 className="card-title">Lista de Usuarios</h3>
                            <p className="card-subtitle">{usuarios.length} usuarios registrados</p>
                        </div>
                    </div>
                    <div className="usuarios-list">
                        {usuarios.length === 0 ? (
                            <div className="empty-state">
                                <User size={48} style={{ opacity: 0.3 }} />
                                <p>No hay usuarios registrados</p>
                                <button className="btn btn-primary btn-sm" onClick={openCreateModal}>
                                    <Plus size={16} />
                                    Crear primer usuario
                                </button>
                            </div>
                        ) : (
                            usuarios.map((usuario) => (
                                <div key={usuario.id} className={`usuario-item ${!usuario.activo ? 'inactive' : ''} ${isCurrentUser(usuario.id) ? 'current' : ''}`}>
                                    <div className="usuario-avatar">
                                        {usuario.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                    </div>
                                    <div className="usuario-info">
                                        <span className="usuario-nombre">
                                            {usuario.nombre}
                                            {isCurrentUser(usuario.id) && <span className="badge-you">Tú</span>}
                                        </span>
                                        <span className="usuario-email">{usuario.email}</span>
                                        {usuario.telefono && (
                                            <span className="usuario-telefono">
                                                <Phone size={12} /> {usuario.telefono}
                                            </span>
                                        )}
                                    </div>
                                    <span className={`badge badge-rol ${getRolColor(usuario.rol)}`}>
                                        {getRolIcon(usuario.rol)}
                                        {usuario.rol}
                                    </span>
                                    <button
                                        className={`status-toggle ${usuario.activo ? 'active' : 'inactive'}`}
                                        onClick={() => handleToggleActive(usuario)}
                                        title={usuario.activo ? 'Desactivar' : 'Activar'}
                                        disabled={isCurrentUser(usuario.id)}
                                    >
                                        {usuario.activo ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                                    </button>
                                    <div className="usuario-actions">
                                        <button
                                            className="btn btn-ghost btn-icon"
                                            title="Editar"
                                            onClick={() => openEditModal(usuario)}
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            className="btn btn-ghost btn-icon text-danger"
                                            title="Eliminar"
                                            onClick={() => handleDelete(usuario)}
                                            disabled={isCurrentUser(usuario.id)}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Permisos Table */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <h3 className="card-title">Matriz de Permisos</h3>
                            <p className="card-subtitle">Permisos por rol del sistema</p>
                        </div>
                    </div>
                    <div className="table-container">
                        <table className="table permisos-table">
                            <thead>
                                <tr>
                                    <th>Módulo</th>
                                    <th>Admin</th>
                                    <th>Recepción</th>
                                    <th>Limpieza</th>
                                    <th>Contador</th>
                                </tr>
                            </thead>
                            <tbody>
                                {permisos.map((permiso) => (
                                    <tr key={permiso.modulo}>
                                        <td>{permiso.modulo}</td>
                                        <td className="text-center">
                                            {permiso.admin ? (
                                                <Check size={18} className="check-icon" />
                                            ) : (
                                                <X size={18} className="x-icon" />
                                            )}
                                        </td>
                                        <td className="text-center">
                                            {permiso.recepcion ? (
                                                <Check size={18} className="check-icon" />
                                            ) : (
                                                <X size={18} className="x-icon" />
                                            )}
                                        </td>
                                        <td className="text-center">
                                            {permiso.limpieza ? (
                                                <Check size={18} className="check-icon" />
                                            ) : (
                                                <X size={18} className="x-icon" />
                                            )}
                                        </td>
                                        <td className="text-center">
                                            {permiso.contador ? (
                                                <Check size={18} className="check-icon" />
                                            ) : (
                                                <X size={18} className="x-icon" />
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Create/Edit Usuario */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">
                                {modalMode === 'create' ? 'Nuevo Usuario' : 'Editar Usuario'}
                            </h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>
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
                                <div className="form-group">
                                    <label className="form-label">
                                        <User size={16} />
                                        Nombre Completo *
                                    </label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Ej: Juan Pérez García"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleInputChange}
                                        required
                                        disabled={formLoading}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">
                                        <Mail size={16} />
                                        Correo Electrónico *
                                    </label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        placeholder="Ej: juan@hotel.com"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        disabled={formLoading || modalMode === 'edit'}
                                    />
                                    {modalMode === 'edit' && (
                                        <small className="form-hint">El email no se puede modificar</small>
                                    )}
                                </div>
                                {modalMode === 'create' && (
                                    <div className="form-group">
                                        <label className="form-label">
                                            <Key size={16} />
                                            Contraseña *
                                        </label>
                                        <input
                                            type="password"
                                            className="form-input"
                                            placeholder="Mínimo 6 caracteres"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            required
                                            minLength={6}
                                            disabled={formLoading}
                                        />
                                    </div>
                                )}
                                <div className="form-group">
                                    <label className="form-label">
                                        <Phone size={16} />
                                        Teléfono
                                    </label>
                                    <input
                                        type="tel"
                                        className="form-input"
                                        placeholder="Ej: 987654321"
                                        name="telefono"
                                        value={formData.telefono}
                                        onChange={handleInputChange}
                                        disabled={formLoading}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">
                                        <ShieldCheck size={16} />
                                        Rol *
                                    </label>
                                    <select
                                        className="form-select"
                                        name="rol"
                                        value={formData.rol}
                                        onChange={handleInputChange}
                                        disabled={formLoading}
                                    >
                                        <option value="recepcionista">Recepcionista</option>
                                        <option value="limpieza">Limpieza</option>
                                        <option value="contador">Contador</option>
                                        <option value="administrador">Administrador</option>
                                    </select>
                                    <small className="form-hint">
                                        {formData.rol === 'administrador' && 'Acceso completo al sistema'}
                                        {formData.rol === 'recepcionista' && 'Check-in, reservas, pagos y huéspedes'}
                                        {formData.rol === 'limpieza' && 'Solo módulo de limpieza y habitaciones'}
                                        {formData.rol === 'contador' && 'Dashboard, pagos y reportes'}
                                    </small>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowModal(false)}
                                    disabled={formLoading}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={formLoading}
                                >
                                    {formLoading ? (
                                        <>
                                            <Loader2 size={16} className="spinner" />
                                            {modalMode === 'create' ? 'Creando...' : 'Guardando...'}
                                        </>
                                    ) : (
                                        <>
                                            {modalMode === 'create' ? (
                                                <>
                                                    <UserPlus size={16} />
                                                    Crear Usuario
                                                </>
                                            ) : (
                                                <>
                                                    <Save size={16} />
                                                    Guardar Cambios
                                                </>
                                            )}
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
                onClose={closeConfirmDialog}
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

export default Usuarios;
