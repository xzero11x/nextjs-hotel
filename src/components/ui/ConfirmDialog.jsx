"use client";

import { useEffect, useRef } from 'react';
import { AlertTriangle, Info, CheckCircle, XCircle, X } from 'lucide-react';
import './ConfirmDialog.css';

/**
 * ConfirmDialog - Componente de diálogo de confirmación profesional
 * 
 * @param {boolean} isOpen - Si el diálogo está abierto
 * @param {function} onClose - Función para cerrar el diálogo
 * @param {function} onConfirm - Función cuando se confirma
 * @param {string} title - Título del diálogo
 * @param {string} message - Mensaje descriptivo
 * @param {string} confirmText - Texto del botón de confirmar
 * @param {string} cancelText - Texto del botón de cancelar
 * @param {string} variant - Variante: 'danger', 'warning', 'info', 'success'
 * @param {boolean} loading - Estado de carga
 */
export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title = '¿Estás seguro?',
    message = 'Esta acción no se puede deshacer.',
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'danger',
    loading = false
}) {
    const dialogRef = useRef(null);

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen && !loading) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose, loading]);

    // Focus trap
    useEffect(() => {
        if (isOpen && dialogRef.current) {
            dialogRef.current.focus();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const getIcon = () => {
        switch (variant) {
            case 'danger':
                return <XCircle size={28} />;
            case 'warning':
                return <AlertTriangle size={28} />;
            case 'success':
                return <CheckCircle size={28} />;
            case 'info':
            default:
                return <Info size={28} />;
        }
    };

    const handleConfirm = async () => {
        await onConfirm();
    };

    return (
        <div className="confirm-overlay" onClick={!loading ? onClose : undefined}>
            <div
                ref={dialogRef}
                className={`confirm-dialog ${variant}`}
                onClick={(e) => e.stopPropagation()}
                tabIndex={-1}
            >
                <button
                    className="confirm-close"
                    onClick={onClose}
                    disabled={loading}
                >
                    <X size={20} />
                </button>

                <div className={`confirm-icon ${variant}`}>
                    {getIcon()}
                </div>

                <h3 className="confirm-title">{title}</h3>

                <p className="confirm-message">{message}</p>

                <div className="confirm-actions">
                    <button
                        className="btn btn-secondary"
                        onClick={onClose}
                        disabled={loading}
                    >
                        {cancelText}
                    </button>
                    <button
                        className={`btn btn-${variant === 'danger' ? 'danger' : variant === 'warning' ? 'warning' : 'primary'}`}
                        onClick={handleConfirm}
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="btn-loading">
                                <span className="spinner-sm"></span>
                                Procesando...
                            </span>
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
