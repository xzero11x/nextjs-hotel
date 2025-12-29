-- =====================================================
-- HOTEL MANAGEMENT SYSTEM - SUPABASE SCHEMA
-- Version: 1.0.0
-- Compatible with: Supabase + Next.js 15
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLES
-- =====================================================

-- 1. Hotel Configuration
CREATE TABLE hotel_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  direccion TEXT,
  telefono VARCHAR(50),
  email VARCHAR(255),
  moneda VARCHAR(3) DEFAULT 'PEN',
  hora_checkin TIME DEFAULT '14:00',
  hora_checkout TIME DEFAULT '12:00',
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tax Configuration (SUNAT compatible)
CREATE TABLE config_tributaria (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ruc VARCHAR(11) NOT NULL,
  razon_social VARCHAR(255) NOT NULL,
  nombre_comercial VARCHAR(255),
  direccion_fiscal TEXT,
  ubigeo VARCHAR(6),
  
  -- Tax settings
  igv_nombre VARCHAR(20) DEFAULT 'IGV',
  igv_porcentaje DECIMAL(5,2) DEFAULT 18.00,
  
  -- Special regimes
  es_zona_exonerada BOOLEAN DEFAULT FALSE,
  ley_exoneracion VARCHAR(50),
  es_agente_retencion BOOLEAN DEFAULT FALSE,
  porcentaje_retencion DECIMAL(5,2) DEFAULT 3.00,
  
  -- Invoice series
  serie_boleta VARCHAR(4) DEFAULT 'B001',
  serie_factura VARCHAR(4) DEFAULT 'F001',
  correlativo_boleta INTEGER DEFAULT 1,
  correlativo_factura INTEGER DEFAULT 1,
  
  -- Nubefact integration
  nubefact_token TEXT,
  nubefact_ruc_empresa VARCHAR(11),
  nubefact_modo VARCHAR(10) DEFAULT 'demo',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. IGV Affectation Types (SUNAT catalog)
CREATE TABLE tipos_afectacion_igv (
  codigo VARCHAR(2) PRIMARY KEY,
  descripcion VARCHAR(100) NOT NULL,
  tipo VARCHAR(20) NOT NULL,
  aplica_igv BOOLEAN DEFAULT FALSE,
  porcentaje_igv DECIMAL(5,2) DEFAULT 0
);

-- Insert SUNAT IGV affectation types
INSERT INTO tipos_afectacion_igv (codigo, descripcion, tipo, aplica_igv, porcentaje_igv) VALUES
('10', 'Gravado - Operación Onerosa', 'gravado', TRUE, 18.00),
('11', 'Gravado - Retiro por premio', 'gravado', TRUE, 18.00),
('12', 'Gravado - Retiro por donación', 'gravado', TRUE, 18.00),
('13', 'Gravado - Retiro', 'gravado', TRUE, 18.00),
('14', 'Gravado - Retiro por publicidad', 'gravado', TRUE, 18.00),
('15', 'Gravado - Bonificaciones', 'gravado', TRUE, 18.00),
('16', 'Gravado - Retiro por entrega a trabajadores', 'gravado', TRUE, 18.00),
('17', 'Gravado - IVAP', 'gravado', TRUE, 4.00),
('20', 'Exonerado - Operación Onerosa', 'exonerado', FALSE, 0),
('21', 'Exonerado - Transferencia Gratuita', 'exonerado', FALSE, 0),
('30', 'Inafecto - Operación Onerosa', 'inafecto', FALSE, 0),
('31', 'Inafecto - Retiro por Bonificación', 'inafecto', FALSE, 0),
('32', 'Inafecto - Retiro', 'inafecto', FALSE, 0),
('33', 'Inafecto - Retiro por Muestras Médicas', 'inafecto', FALSE, 0),
('34', 'Inafecto - Retiro por Convenio Colectivo', 'inafecto', FALSE, 0),
('35', 'Inafecto - Retiro por premio', 'inafecto', FALSE, 0),
('36', 'Inafecto - Retiro por publicidad', 'inafecto', FALSE, 0),
('40', 'Exportación de Bienes o Servicios', 'exportacion', FALSE, 0);

-- 4. Users (linked to Supabase Auth)
CREATE TABLE usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  nombre VARCHAR(255) NOT NULL,
  rol VARCHAR(20) NOT NULL DEFAULT 'recepcionista'
    CHECK (rol IN ('administrador', 'recepcionista', 'limpieza', 'contador')),
  telefono VARCHAR(20),
  activo BOOLEAN DEFAULT TRUE,
  ultimo_acceso TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Rooms
CREATE TABLE habitaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero VARCHAR(10) NOT NULL UNIQUE,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('simple', 'doble', 'matrimonial', 'triple', 'suite')),
  capacidad INTEGER NOT NULL DEFAULT 1,
  piso INTEGER NOT NULL DEFAULT 1,
  estado VARCHAR(20) NOT NULL DEFAULT 'disponible' 
    CHECK (estado IN ('disponible', 'ocupada', 'limpieza', 'mantenimiento', 'reservada')),
  precio_base DECIMAL(10,2) NOT NULL,
  afectacion_igv VARCHAR(2) DEFAULT '20' REFERENCES tipos_afectacion_igv(codigo),
  descripcion TEXT,
  amenidades TEXT[],
  activa BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Guests
CREATE TABLE huespedes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo_documento VARCHAR(10) DEFAULT 'DNI' 
    CHECK (tipo_documento IN ('DNI', 'CE', 'PASAPORTE', 'RUC')),
  numero_documento VARCHAR(20) NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  apellidos VARCHAR(255),
  telefono VARCHAR(20),
  email VARCHAR(255),
  procedencia VARCHAR(255),
  nacionalidad VARCHAR(100) DEFAULT 'Perú',
  es_extranjero BOOLEAN DEFAULT FALSE,
  fecha_nacimiento DATE,
  es_frecuente BOOLEAN DEFAULT FALSE,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tipo_documento, numero_documento)
);

-- 7. Rates by room type
CREATE TABLE tarifas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo_habitacion VARCHAR(20) NOT NULL UNIQUE,
  precio_base DECIMAL(10,2) NOT NULL,
  precio_temporada_baja DECIMAL(10,2),
  precio_temporada_media DECIMAL(10,2),
  precio_temporada_alta DECIMAL(10,2),
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Seasons
CREATE TABLE temporadas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(100) NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  tipo VARCHAR(20) DEFAULT 'media' CHECK (tipo IN ('baja', 'media', 'alta')),
  multiplicador DECIMAL(3,2) DEFAULT 1.00,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Reservations
CREATE TABLE reservas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habitacion_id UUID NOT NULL REFERENCES habitaciones(id),
  huesped_id UUID REFERENCES huespedes(id),
  nombre_cliente VARCHAR(255) NOT NULL,
  documento_cliente VARCHAR(20),
  telefono_cliente VARCHAR(20),
  email_cliente VARCHAR(255),
  
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  
  estado VARCHAR(20) NOT NULL DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente', 'confirmada', 'checkin', 'cancelada', 'no_show')),
  
  precio_noche DECIMAL(10,2) NOT NULL,
  total_estimado DECIMAL(10,2),
  adelanto DECIMAL(10,2) DEFAULT 0,
  
  origen VARCHAR(50) DEFAULT 'directo'
    CHECK (origen IN ('directo', 'telefono', 'booking', 'whatsapp', 'otro')),
  notas TEXT,
  
  registrado_por UUID REFERENCES usuarios(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Stays (Check-in / Check-out)
CREATE TABLE estadias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  huesped_id UUID NOT NULL REFERENCES huespedes(id),
  habitacion_id UUID NOT NULL REFERENCES habitaciones(id),
  reserva_id UUID REFERENCES reservas(id),
  
  fecha_checkin TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_checkout_prevista DATE NOT NULL,
  fecha_checkout_real TIMESTAMPTZ,
  
  estado VARCHAR(20) NOT NULL DEFAULT 'activa'
    CHECK (estado IN ('activa', 'finalizada', 'cancelada')),
  estado_huesped VARCHAR(20) DEFAULT 'dentro'
    CHECK (estado_huesped IN ('dentro', 'fuera', 'checkout')),
  
  precio_noche DECIMAL(10,2) NOT NULL,
  noches INTEGER NOT NULL DEFAULT 1,
  subtotal DECIMAL(10,2),
  
  afectacion_igv VARCHAR(2) DEFAULT '20' REFERENCES tipos_afectacion_igv(codigo),
  igv_porcentaje DECIMAL(5,2) DEFAULT 0,
  igv_monto DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2),
  
  adultos INTEGER DEFAULT 1,
  ninos INTEGER DEFAULT 0,
  notas TEXT,
  
  registrado_por UUID REFERENCES usuarios(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Payments
CREATE TABLE pagos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  estadia_id UUID NOT NULL REFERENCES estadias(id),
  
  monto DECIMAL(10,2) NOT NULL,
  metodo_pago VARCHAR(20) NOT NULL
    CHECK (metodo_pago IN ('efectivo', 'yape', 'plin', 'tarjeta', 'transferencia', 'deposito')),
  
  concepto VARCHAR(255) DEFAULT 'Pago de estadía',
  estado VARCHAR(20) DEFAULT 'pagado'
    CHECK (estado IN ('pagado', 'pendiente', 'anulado')),
  
  fecha_pago TIMESTAMPTZ DEFAULT NOW(),
  referencia VARCHAR(100),
  
  registrado_por UUID REFERENCES usuarios(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Electronic Invoices/Receipts (SUNAT)
CREATE TABLE comprobantes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  estadia_id UUID REFERENCES estadias(id),
  pago_id UUID REFERENCES pagos(id),
  
  tipo_comprobante VARCHAR(2) NOT NULL,
  serie VARCHAR(4) NOT NULL,
  numero INTEGER NOT NULL,
  
  cliente_tipo_doc VARCHAR(1) NOT NULL,
  cliente_num_doc VARCHAR(20) NOT NULL,
  cliente_nombre VARCHAR(255) NOT NULL,
  cliente_direccion TEXT,
  
  afectacion_igv VARCHAR(2) REFERENCES tipos_afectacion_igv(codigo),
  
  subtotal DECIMAL(10,2),
  igv DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2),
  
  items JSONB NOT NULL,
  
  estado_sunat VARCHAR(20) DEFAULT 'pendiente'
    CHECK (estado_sunat IN ('pendiente', 'aceptado', 'rechazado', 'anulado')),
  codigo_sunat VARCHAR(10),
  mensaje_sunat TEXT,
  hash_cdr VARCHAR(255),
  enlace_pdf TEXT,
  enlace_xml TEXT,
  
  emitido_por UUID REFERENCES usuarios(id),
  fecha_emision TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(serie, numero)
);

-- 13. Service Orders (Cleaning/Maintenance)
CREATE TABLE ordenes_servicio (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habitacion_id UUID NOT NULL REFERENCES habitaciones(id),
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('limpieza', 'mantenimiento', 'inspeccion')),
  estado VARCHAR(20) DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente', 'en_proceso', 'completada', 'cancelada')),
  prioridad VARCHAR(10) DEFAULT 'normal' CHECK (prioridad IN ('baja', 'normal', 'alta', 'urgente')),
  descripcion TEXT,
  asignado_a UUID REFERENCES usuarios(id),
  fecha_programada TIMESTAMPTZ,
  fecha_completada TIMESTAMPTZ,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_habitaciones_estado ON habitaciones(estado);
CREATE INDEX idx_habitaciones_tipo ON habitaciones(tipo);
CREATE INDEX idx_estadias_estado ON estadias(estado);
CREATE INDEX idx_estadias_fechas ON estadias(fecha_checkin, fecha_checkout_prevista);
CREATE INDEX idx_reservas_fechas ON reservas(fecha_inicio, fecha_fin);
CREATE INDEX idx_reservas_estado ON reservas(estado);
CREATE INDEX idx_huespedes_documento ON huespedes(tipo_documento, numero_documento);
CREATE INDEX idx_pagos_estadia ON pagos(estadia_id);
CREATE INDEX idx_comprobantes_serie ON comprobantes(serie, numero);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE hotel_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_tributaria ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE habitaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE huespedes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarifas ENABLE ROW LEVEL SECURITY;
ALTER TABLE temporadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE estadias ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE comprobantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes_servicio ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read all data
CREATE POLICY "Authenticated users can read" ON habitaciones FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read" ON huespedes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read" ON tarifas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read" ON temporadas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read" ON reservas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read" ON estadias FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read" ON pagos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read" ON comprobantes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read" ON ordenes_servicio FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read" ON hotel_config FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read" ON config_tributaria FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read" ON usuarios FOR SELECT TO authenticated USING (true);

-- Policy: Authenticated users can insert/update most tables
CREATE POLICY "Authenticated users can insert" ON habitaciones FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update" ON habitaciones FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert" ON huespedes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update" ON huespedes FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert" ON reservas FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update" ON reservas FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert" ON estadias FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update" ON estadias FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert" ON pagos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update" ON pagos FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert" ON comprobantes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update" ON comprobantes FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert" ON ordenes_servicio FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update" ON ordenes_servicio FOR UPDATE TO authenticated USING (true);

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Insert default hotel config
INSERT INTO hotel_config (nombre, direccion, telefono, email) VALUES
('Hotel Demo', 'Jr. Principal 123, Chachapoyas, Amazonas', '041-123456', 'contacto@hotelchachapoyas.com');

-- Insert default tax config for Amazon region (IGV exempt)
INSERT INTO config_tributaria (
  ruc, razon_social, nombre_comercial, direccion_fiscal, ubigeo,
  igv_porcentaje, es_zona_exonerada, ley_exoneracion
) VALUES (
  '20000000001', 'HOTEL CHACHAPOYAS S.A.C.', 'Hotel Demo',
  'Jr. Principal 123, Chachapoyas', '010101',
  0.00, TRUE, 'LEY_27037_AMAZONIA'
);

-- Insert default rates
INSERT INTO tarifas (tipo_habitacion, precio_base, precio_temporada_baja, precio_temporada_media, precio_temporada_alta) VALUES
('simple', 40.00, 30.00, 40.00, 50.00),
('doble', 70.00, 60.00, 70.00, 90.00),
('matrimonial', 60.00, 50.00, 60.00, 70.00),
('triple', 110.00, 100.00, 110.00, 120.00),
('suite', 150.00, 130.00, 150.00, 180.00);

-- Insert sample rooms
INSERT INTO habitaciones (numero, tipo, capacidad, piso, estado, precio_base) VALUES
('101', 'simple', 1, 1, 'disponible', 40.00),
('102', 'simple', 1, 1, 'disponible', 40.00),
('103', 'doble', 2, 1, 'disponible', 70.00),
('104', 'doble', 2, 1, 'disponible', 70.00),
('201', 'matrimonial', 2, 2, 'disponible', 60.00),
('202', 'matrimonial', 2, 2, 'disponible', 60.00),
('203', 'triple', 3, 2, 'disponible', 110.00),
('204', 'suite', 4, 2, 'disponible', 150.00);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to check room availability
CREATE OR REPLACE FUNCTION habitacion_disponible(
  p_habitacion_id UUID,
  p_fecha_inicio DATE,
  p_fecha_fin DATE
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM estadias
    WHERE habitacion_id = p_habitacion_id
      AND estado = 'activa'
      AND fecha_checkin::date <= p_fecha_fin
      AND fecha_checkout_prevista >= p_fecha_inicio
  ) AND NOT EXISTS (
    SELECT 1 FROM reservas
    WHERE habitacion_id = p_habitacion_id
      AND estado IN ('confirmada', 'pendiente')
      AND fecha_inicio <= p_fecha_fin
      AND fecha_fin >= p_fecha_inicio
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get current season type
CREATE OR REPLACE FUNCTION obtener_temporada_actual()
RETURNS VARCHAR AS $$
DECLARE
  v_tipo VARCHAR;
BEGIN
  SELECT tipo INTO v_tipo
  FROM temporadas
  WHERE CURRENT_DATE BETWEEN fecha_inicio AND fecha_fin
    AND activo = TRUE
  LIMIT 1;
  
  RETURN COALESCE(v_tipo, 'media');
END;
$$ LANGUAGE plpgsql;

-- Trigger to update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_habitaciones_updated_at BEFORE UPDATE ON habitaciones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_huespedes_updated_at BEFORE UPDATE ON huespedes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reservas_updated_at BEFORE UPDATE ON reservas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_estadias_updated_at BEFORE UPDATE ON estadias FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tarifas_updated_at BEFORE UPDATE ON tarifas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ordenes_servicio_updated_at BEFORE UPDATE ON ordenes_servicio FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hotel_config_updated_at BEFORE UPDATE ON hotel_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_config_tributaria_updated_at BEFORE UPDATE ON config_tributaria FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
