"use client";

import { useState } from 'react';
import {
    Settings,
    Hotel,
    DollarSign,
    Clock,
    FileText,
    Mail,
    MessageCircle,
    Save,
    Building2,
    Globe,
    Receipt
} from 'lucide-react';
import { configuracionHotel } from '@/data/mockData';
import './Configuracion.css';

function Configuracion() {
    const [activeSection, setActiveSection] = useState('general');
    const [config, setConfig] = useState(configuracionHotel);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setConfig(prev => ({ ...prev, [name]: value }));
    };

    const sections = [
        { id: 'general', label: 'Datos del Hotel', icon: Hotel },
        { id: 'tarifas', label: 'Tarifas y Moneda', icon: DollarSign },
        { id: 'horarios', label: 'Horarios', icon: Clock },
        { id: 'facturacion', label: 'Facturación', icon: Receipt },
        { id: 'integraciones', label: 'Integraciones', icon: Globe },
    ];

    return (
        <div className="configuracion-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Configuración General</h1>
                    <p className="page-subtitle">Ajustes y preferencias del sistema</p>
                </div>
                <div className="page-header-actions">
                    <button className="btn btn-primary">
                        <Save size={18} />
                        Guardar Cambios
                    </button>
                </div>
            </div>

            <div className="config-layout">
                {/* Sidebar */}
                <div className="config-sidebar">
                    {sections.map((section) => (
                        <button
                            key={section.id}
                            className={`config-nav-item ${activeSection === section.id ? 'active' : ''}`}
                            onClick={() => setActiveSection(section.id)}
                        >
                            <section.icon size={18} />
                            <span>{section.label}</span>
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="config-content">
                    {/* General */}
                    {activeSection === 'general' && (
                        <div className="card config-section">
                            <div className="card-header">
                                <div>
                                    <h3 className="card-title">
                                        <Hotel size={20} />
                                        Datos del Hotel
                                    </h3>
                                    <p className="card-subtitle">Información básica del establecimiento</p>
                                </div>
                            </div>
                            <div className="config-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Nombre del Hotel</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            name="nombre"
                                            value={config.nombre}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">RUC</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            name="ruc"
                                            value={config.ruc}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Dirección</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        name="direccion"
                                        value={config.direccion}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Teléfono</label>
                                        <input
                                            type="tel"
                                            className="form-input"
                                            name="telefono"
                                            value={config.telefono}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Email</label>
                                        <input
                                            type="email"
                                            className="form-input"
                                            name="email"
                                            value={config.email}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tarifas */}
                    {activeSection === 'tarifas' && (
                        <div className="card config-section">
                            <div className="card-header">
                                <div>
                                    <h3 className="card-title">
                                        <DollarSign size={20} />
                                        Tarifas y Moneda
                                    </h3>
                                    <p className="card-subtitle">Configuración de moneda e impuestos</p>
                                </div>
                            </div>
                            <div className="config-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Moneda</label>
                                        <select className="form-select" name="moneda" value={config.moneda} onChange={handleChange}>
                                            <option value="S/">Soles (S/)</option>
                                            <option value="$">Dólares ($)</option>
                                            <option value="€">Euros (€)</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">IGV (%)</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            name="impuesto"
                                            value={config.impuesto}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div className="config-info">
                                    <p>El IGV se aplicará automáticamente a todas las facturas y boletas generadas.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Horarios */}
                    {activeSection === 'horarios' && (
                        <div className="card config-section">
                            <div className="card-header">
                                <div>
                                    <h3 className="card-title">
                                        <Clock size={20} />
                                        Horarios
                                    </h3>
                                    <p className="card-subtitle">Horarios de check-in y check-out</p>
                                </div>
                            </div>
                            <div className="config-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Hora de Check-in</label>
                                        <input
                                            type="time"
                                            className="form-input"
                                            name="horaCheckIn"
                                            value={config.horaCheckIn}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Hora de Check-out</label>
                                        <input
                                            type="time"
                                            className="form-input"
                                            name="horaCheckOut"
                                            value={config.horaCheckOut}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div className="config-info">
                                    <p>Estos horarios se mostrarán a los huéspedes y se usarán como referencia para cálculos.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Facturación */}
                    {activeSection === 'facturacion' && (
                        <div className="card config-section">
                            <div className="card-header">
                                <div>
                                    <h3 className="card-title">
                                        <Receipt size={20} />
                                        Facturación Electrónica
                                    </h3>
                                    <p className="card-subtitle">Configuración de SUNAT y comprobantes</p>
                                </div>
                            </div>
                            <div className="config-form">
                                <div className="config-toggle">
                                    <div className="toggle-info">
                                        <span className="toggle-label">Facturación Electrónica SUNAT</span>
                                        <span className="toggle-desc">Emitir comprobantes electrónicos</span>
                                    </div>
                                    <label className="toggle">
                                        <input type="checkbox" defaultChecked />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Serie de Boleta</label>
                                        <input type="text" className="form-input" defaultValue="B001" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Serie de Factura</label>
                                        <input type="text" className="form-input" defaultValue="F001" />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Certificado Digital</label>
                                    <div className="file-upload">
                                        <input type="file" id="certificado" hidden />
                                        <label htmlFor="certificado" className="btn btn-secondary">
                                            Subir Certificado
                                        </label>
                                        <span className="file-name">certificado_sunat.pfx</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Integraciones */}
                    {activeSection === 'integraciones' && (
                        <div className="card config-section">
                            <div className="card-header">
                                <div>
                                    <h3 className="card-title">
                                        <Globe size={20} />
                                        Integraciones
                                    </h3>
                                    <p className="card-subtitle">Conexiones con servicios externos</p>
                                </div>
                            </div>
                            <div className="config-form">
                                <div className="integration-item">
                                    <div className="integration-icon sunat">
                                        <Building2 size={24} />
                                    </div>
                                    <div className="integration-info">
                                        <span className="integration-name">SUNAT</span>
                                        <span className="integration-desc">Facturación electrónica</span>
                                    </div>
                                    <span className="badge badge-disponible">Conectado</span>
                                </div>
                                <div className="integration-item">
                                    <div className="integration-icon email">
                                        <Mail size={24} />
                                    </div>
                                    <div className="integration-info">
                                        <span className="integration-name">Correo Electrónico</span>
                                        <span className="integration-desc">Envío de comprobantes</span>
                                    </div>
                                    <span className="badge badge-disponible">Configurado</span>
                                </div>
                                <div className="integration-item">
                                    <div className="integration-icon whatsapp">
                                        <MessageCircle size={24} />
                                    </div>
                                    <div className="integration-info">
                                        <span className="integration-name">WhatsApp Business</span>
                                        <span className="integration-desc">Notificaciones a huéspedes</span>
                                    </div>
                                    <button className="btn btn-secondary btn-sm">Configurar</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Configuracion;

