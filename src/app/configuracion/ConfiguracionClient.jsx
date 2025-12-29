"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Settings,
    Hotel,
    DollarSign,
    Clock,
    FileText,
    Mail,
    Phone,
    Save,
    Building2,
    Globe,
    Receipt,
    MapPin,
    AlertCircle,
    Check,
    Loader2,
    X,
    Shield,
    Percent
} from 'lucide-react';
import './Configuracion.css';

function Configuracion({ initialHotel = {}, initialTributaria = {}, isAdmin = false }) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('hotel');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Hotel form
    const [hotelForm, setHotelForm] = useState({
        nombre: initialHotel.nombre || '',
        direccion: initialHotel.direccion || '',
        telefono: initialHotel.telefono || '',
        email: initialHotel.email || '',
        hora_checkin: initialHotel.hora_checkin || '14:00',
        hora_checkout: initialHotel.hora_checkout || '12:00',
        moneda: initialHotel.moneda || 'PEN'
    });

    // Tax form
    const [taxForm, setTaxForm] = useState({
        ruc: initialTributaria.ruc || '',
        razon_social: initialTributaria.razon_social || '',
        nombre_comercial: initialTributaria.nombre_comercial || '',
        direccion_fiscal: initialTributaria.direccion_fiscal || '',
        ubigeo: initialTributaria.ubigeo || '',
        igv_porcentaje: initialTributaria.igv_porcentaje || 18,
        es_zona_exonerada: initialTributaria.es_zona_exonerada || false,
        ley_exoneracion: initialTributaria.ley_exoneracion || '',
        serie_boleta: initialTributaria.serie_boleta || 'B001',
        serie_factura: initialTributaria.serie_factura || 'F001'
    });

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    const handleHotelChange = (e) => {
        const { name, value } = e.target;
        setHotelForm(prev => ({ ...prev, [name]: value }));
    };

    const handleTaxChange = (e) => {
        const { name, value, type, checked } = e.target;
        setTaxForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSaveHotel = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/configuracion', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tipo: 'hotel', ...hotelForm })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            setSuccessMessage(data.message || 'Configuración guardada');
            router.refresh();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveTax = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/configuracion', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tipo: 'tributaria', ...taxForm })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            setSuccessMessage(data.message || 'Configuración tributaria guardada');
            router.refresh();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="configuracion-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Configuración</h1>
                    <p className="page-subtitle">Datos del hotel y configuración tributaria</p>
                </div>
                {!isAdmin && (
                    <div className="admin-warning">
                        <Shield size={16} />
                        Solo lectura - Requiere rol administrador
                    </div>
                )}
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

            {/* Tabs */}
            <div className="tabs mb-4">
                <button
                    className={`tab ${activeTab === 'hotel' ? 'active' : ''}`}
                    onClick={() => setActiveTab('hotel')}
                >
                    <Hotel size={18} />
                    Datos del Hotel
                </button>
                <button
                    className={`tab ${activeTab === 'tributaria' ? 'active' : ''}`}
                    onClick={() => setActiveTab('tributaria')}
                >
                    <Receipt size={18} />
                    Configuración Tributaria
                </button>
            </div>

            {/* Hotel Tab */}
            {activeTab === 'hotel' && (
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">
                            <Hotel size={20} />
                            Información del Hotel
                        </h3>
                    </div>
                    <form onSubmit={handleSaveHotel}>
                        <div className="card-body">
                            <div className="form-group">
                                <label className="form-label">
                                    <Building2 size={14} /> Nombre del Hotel *
                                </label>
                                <input
                                    type="text"
                                    className="form-input"
                                    name="nombre"
                                    value={hotelForm.nombre}
                                    onChange={handleHotelChange}
                                    placeholder="Hotel XYZ"
                                    disabled={!isAdmin}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <MapPin size={14} /> Dirección
                                </label>
                                <input
                                    type="text"
                                    className="form-input"
                                    name="direccion"
                                    value={hotelForm.direccion}
                                    onChange={handleHotelChange}
                                    placeholder="Jr. Principal 123, Ciudad"
                                    disabled={!isAdmin}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">
                                        <Phone size={14} /> Teléfono
                                    </label>
                                    <input
                                        type="tel"
                                        className="form-input"
                                        name="telefono"
                                        value={hotelForm.telefono}
                                        onChange={handleHotelChange}
                                        placeholder="041-123456"
                                        disabled={!isAdmin}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">
                                        <Mail size={14} /> Email
                                    </label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        name="email"
                                        value={hotelForm.email}
                                        onChange={handleHotelChange}
                                        placeholder="contacto@hotel.com"
                                        disabled={!isAdmin}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">
                                        <Clock size={14} /> Hora Check-in
                                    </label>
                                    <input
                                        type="time"
                                        className="form-input"
                                        name="hora_checkin"
                                        value={hotelForm.hora_checkin}
                                        onChange={handleHotelChange}
                                        disabled={!isAdmin}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">
                                        <Clock size={14} /> Hora Check-out
                                    </label>
                                    <input
                                        type="time"
                                        className="form-input"
                                        name="hora_checkout"
                                        value={hotelForm.hora_checkout}
                                        onChange={handleHotelChange}
                                        disabled={!isAdmin}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">
                                        <Globe size={14} /> Moneda
                                    </label>
                                    <select
                                        className="form-select"
                                        name="moneda"
                                        value={hotelForm.moneda}
                                        onChange={handleHotelChange}
                                        disabled={!isAdmin}
                                    >
                                        <option value="PEN">PEN (Soles)</option>
                                        <option value="USD">USD (Dólares)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        {isAdmin && (
                            <div className="card-footer">
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? <Loader2 size={16} className="spinner" /> : <Save size={16} />}
                                    Guardar Cambios
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            )}

            {/* Tax Tab */}
            {activeTab === 'tributaria' && (
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">
                            <Receipt size={20} />
                            Datos Tributarios (SUNAT)
                        </h3>
                    </div>
                    <form onSubmit={handleSaveTax}>
                        <div className="card-body">
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">RUC *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        name="ruc"
                                        value={taxForm.ruc}
                                        onChange={handleTaxChange}
                                        placeholder="20123456789"
                                        maxLength={11}
                                        disabled={!isAdmin}
                                        required
                                    />
                                </div>
                                <div className="form-group flex-2">
                                    <label className="form-label">Razón Social *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        name="razon_social"
                                        value={taxForm.razon_social}
                                        onChange={handleTaxChange}
                                        placeholder="EMPRESA SAC"
                                        disabled={!isAdmin}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Nombre Comercial</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    name="nombre_comercial"
                                    value={taxForm.nombre_comercial}
                                    onChange={handleTaxChange}
                                    placeholder="Hotel Demo"
                                    disabled={!isAdmin}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group flex-2">
                                    <label className="form-label">Dirección Fiscal</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        name="direccion_fiscal"
                                        value={taxForm.direccion_fiscal}
                                        onChange={handleTaxChange}
                                        disabled={!isAdmin}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Ubigeo</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        name="ubigeo"
                                        value={taxForm.ubigeo}
                                        onChange={handleTaxChange}
                                        maxLength={6}
                                        placeholder="010101"
                                        disabled={!isAdmin}
                                    />
                                </div>
                            </div>

                            <div className="form-divider"></div>
                            <h4 className="form-section-title">
                                <Percent size={16} /> Impuestos
                            </h4>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">IGV (%)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        name="igv_porcentaje"
                                        value={taxForm.igv_porcentaje}
                                        onChange={handleTaxChange}
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        disabled={!isAdmin}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            name="es_zona_exonerada"
                                            checked={taxForm.es_zona_exonerada}
                                            onChange={handleTaxChange}
                                            disabled={!isAdmin}
                                        />
                                        Zona Exonerada (Amazonía)
                                    </label>
                                </div>
                            </div>

                            {taxForm.es_zona_exonerada && (
                                <div className="form-group">
                                    <label className="form-label">Ley de Exoneración</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        name="ley_exoneracion"
                                        value={taxForm.ley_exoneracion}
                                        onChange={handleTaxChange}
                                        placeholder="LEY_27037_AMAZONIA"
                                        disabled={!isAdmin}
                                    />
                                </div>
                            )}

                            <div className="form-divider"></div>
                            <h4 className="form-section-title">
                                <FileText size={16} /> Series de Comprobantes
                            </h4>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Serie Boleta</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        name="serie_boleta"
                                        value={taxForm.serie_boleta}
                                        onChange={handleTaxChange}
                                        maxLength={4}
                                        placeholder="B001"
                                        disabled={!isAdmin}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Serie Factura</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        name="serie_factura"
                                        value={taxForm.serie_factura}
                                        onChange={handleTaxChange}
                                        maxLength={4}
                                        placeholder="F001"
                                        disabled={!isAdmin}
                                    />
                                </div>
                            </div>

                            {taxForm.es_zona_exonerada && (
                                <div className="alert alert-info">
                                    <AlertCircle size={16} />
                                    <span>
                                        <strong>Zona Exonerada:</strong> Los comprobantes se emitirán sin IGV según la Ley de Amazonía.
                                    </span>
                                </div>
                            )}
                        </div>
                        {isAdmin && (
                            <div className="card-footer">
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? <Loader2 size={16} className="spinner" /> : <Save size={16} />}
                                    Guardar Configuración
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            )}
        </div>
    );
}

export default Configuracion;
