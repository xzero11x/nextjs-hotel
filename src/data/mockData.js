// Mock Data for Hotel Management System

// Habitaciones
export const habitaciones = [
    { id: 1, numero: '101', tipo: 'simple', capacidad: 1, piso: 1, estado: 'disponible', precioBase: 50, precioActual: 50, huespedId: null },
    { id: 2, numero: '102', tipo: 'simple', capacidad: 1, piso: 1, estado: 'ocupada', precioBase: 50, precioActual: 45, huespedId: 1 },
    { id: 3, numero: '103', tipo: 'doble', capacidad: 2, piso: 1, estado: 'limpieza', precioBase: 80, precioActual: 80, huespedId: null },
    { id: 4, numero: '104', tipo: 'doble', capacidad: 2, piso: 1, estado: 'disponible', precioBase: 80, precioActual: 80, huespedId: null },
    { id: 5, numero: '201', tipo: 'matrimonial', capacidad: 2, piso: 2, estado: 'ocupada', precioBase: 100, precioActual: 100, huespedId: 2 },
    { id: 6, numero: '202', tipo: 'matrimonial', capacidad: 2, piso: 2, estado: 'disponible', precioBase: 100, precioActual: 100, huespedId: null },
    { id: 7, numero: '203', tipo: 'suite', capacidad: 4, piso: 2, estado: 'mantenimiento', precioBase: 180, precioActual: 180, huespedId: null },
    { id: 8, numero: '204', tipo: 'suite', capacidad: 4, piso: 2, estado: 'ocupada', precioBase: 180, precioActual: 160, huespedId: 3 },
    { id: 9, numero: '301', tipo: 'simple', capacidad: 1, piso: 3, estado: 'disponible', precioBase: 55, precioActual: 55, huespedId: null },
    { id: 10, numero: '302', tipo: 'doble', capacidad: 2, piso: 3, estado: 'ocupada', precioBase: 85, precioActual: 85, huespedId: 4 },
    { id: 11, numero: '303', tipo: 'matrimonial', capacidad: 2, piso: 3, estado: 'disponible', precioBase: 110, precioActual: 110, huespedId: null },
    { id: 12, numero: '304', tipo: 'suite', capacidad: 4, piso: 3, estado: 'ocupada', precioBase: 200, precioActual: 200, huespedId: 5 },
];

// Huéspedes
export const huespedes = [
    {
        id: 1,
        nombre: 'Carlos Mendoza García',
        dni: '45678912',
        procedencia: 'Lima, Perú',
        telefono: '987654321',
        email: 'carlos.mendoza@email.com',
        estado: 'dentro',
        esFrecuente: true,
        notas: 'Prefiere habitación con vista a la calle',
        checkInDate: '2024-12-20T14:00:00',
        checkOutDate: '2024-12-22T12:00:00',
        habitacionId: 2,
    },
    {
        id: 2,
        nombre: 'María Elena Torres',
        dni: '32165498',
        procedencia: 'Arequipa, Perú',
        telefono: '912345678',
        email: 'maria.torres@email.com',
        estado: 'fuera',
        esFrecuente: false,
        notas: '',
        checkInDate: '2024-12-19T16:00:00',
        checkOutDate: '2024-12-21T12:00:00',
        habitacionId: 5,
    },
    {
        id: 3,
        nombre: 'Roberto Fernández Lima',
        dni: '78945612',
        procedencia: 'Cusco, Perú',
        telefono: '945612378',
        email: 'roberto.fernandez@email.com',
        estado: 'dentro',
        esFrecuente: true,
        notas: 'Cliente VIP - Ofrecer desayuno cortesía',
        checkInDate: '2024-12-18T10:00:00',
        checkOutDate: '2024-12-23T12:00:00',
        habitacionId: 8,
    },
    {
        id: 4,
        nombre: 'Ana Lucía Vargas',
        dni: '15975348',
        procedencia: 'Trujillo, Perú',
        telefono: '978456123',
        email: 'ana.vargas@email.com',
        estado: 'dentro',
        esFrecuente: false,
        notas: '',
        checkInDate: '2024-12-21T09:00:00',
        checkOutDate: '2024-12-22T12:00:00',
        habitacionId: 10,
    },
    {
        id: 5,
        nombre: 'Juan Pablo Ríos',
        dni: '35795148',
        procedencia: 'Piura, Perú',
        telefono: '956321478',
        email: 'juanpablo.rios@email.com',
        estado: 'esperando',
        esFrecuente: false,
        notas: 'Llegará tarde, después de las 20:00',
        checkInDate: '2024-12-21T20:00:00',
        checkOutDate: '2024-12-25T12:00:00',
        habitacionId: 12,
    },
];

// Historial de huéspedes (estadías anteriores)
export const historialEstadias = [
    { id: 1, huespedId: 1, habitacionId: 3, fechaInicio: '2024-11-15', fechaFin: '2024-11-17', total: 160 },
    { id: 2, huespedId: 1, habitacionId: 2, fechaInicio: '2024-10-05', fechaFin: '2024-10-07', total: 100 },
    { id: 3, huespedId: 3, habitacionId: 8, fechaInicio: '2024-11-20', fechaFin: '2024-11-25', total: 800 },
    { id: 4, huespedId: 3, habitacionId: 6, fechaInicio: '2024-09-10', fechaFin: '2024-09-12', total: 200 },
];

// Tarifas por tipo de habitación
export const tarifas = [
    { id: 1, tipo: 'simple', precioBase: 50, temporadaBaja: 45, temporadaMedia: 50, temporadaAlta: 65 },
    { id: 2, tipo: 'doble', precioBase: 80, temporadaBaja: 70, temporadaMedia: 80, temporadaAlta: 100 },
    { id: 3, tipo: 'matrimonial', precioBase: 100, temporadaBaja: 90, temporadaMedia: 100, temporadaAlta: 130 },
    { id: 4, tipo: 'suite', precioBase: 180, temporadaBaja: 160, temporadaMedia: 180, temporadaAlta: 220 },
];

// Temporadas
export const temporadas = [
    { id: 1, nombre: 'Temporada Baja', inicio: '2024-03-01', fin: '2024-06-30', multiplicador: 0.9 },
    { id: 2, nombre: 'Temporada Media', inicio: '2024-07-01', fin: '2024-11-30', multiplicador: 1.0 },
    { id: 3, nombre: 'Temporada Alta', inicio: '2024-12-01', fin: '2025-02-28', multiplicador: 1.3 },
];

// Reservas
export const reservas = [
    {
        id: 1,
        huespedNombre: 'Pedro Sánchez',
        dni: '45612378',
        telefono: '987123456',
        habitacionId: 4,
        fechaInicio: '2024-12-24',
        fechaFin: '2024-12-26',
        estado: 'confirmada',
        notas: 'Llegada aproximada 15:00',
        total: 160,
    },
    {
        id: 2,
        huespedNombre: 'Laura Martínez',
        dni: '78912345',
        telefono: '945678123',
        habitacionId: 6,
        fechaInicio: '2024-12-23',
        fechaFin: '2024-12-25',
        estado: 'en_espera',
        notas: '',
        total: 200,
    },
    {
        id: 3,
        huespedNombre: 'Diego Ramírez',
        dni: '32145698',
        telefono: '912378456',
        habitacionId: 11,
        fechaInicio: '2024-12-28',
        fechaFin: '2024-12-31',
        estado: 'confirmada',
        notas: 'Celebración de año nuevo',
        total: 390,
    },
    {
        id: 4,
        huespedNombre: 'Carmen López',
        dni: '65478912',
        telefono: '978123654',
        habitacionId: 9,
        fechaInicio: '2024-12-22',
        fechaFin: '2024-12-23',
        estado: 'cancelada',
        notas: 'Cancelado por el cliente',
        total: 0,
    },
];

// Pagos
export const pagos = [
    {
        id: 1,
        huespedId: 1,
        monto: 90,
        metodoPago: 'efectivo',
        fecha: '2024-12-20T14:30:00',
        concepto: 'Pago de estadía',
        comprobante: 'boleta',
        numeroComprobante: 'B001-00245',
        estado: 'pagado',
    },
    {
        id: 2,
        huespedId: 2,
        monto: 100,
        metodoPago: 'yape',
        fecha: '2024-12-19T16:15:00',
        concepto: 'Adelanto de estadía',
        comprobante: 'boleta',
        numeroComprobante: 'B001-00244',
        estado: 'pagado',
    },
    {
        id: 3,
        huespedId: 2,
        monto: 100,
        metodoPago: 'pendiente',
        fecha: null,
        concepto: 'Saldo pendiente',
        comprobante: null,
        numeroComprobante: null,
        estado: 'pendiente',
    },
    {
        id: 4,
        huespedId: 3,
        monto: 800,
        metodoPago: 'tarjeta',
        fecha: '2024-12-18T10:30:00',
        concepto: 'Pago completo de estadía',
        comprobante: 'factura',
        numeroComprobante: 'F001-00089',
        estado: 'pagado',
    },
    {
        id: 5,
        huespedId: 4,
        monto: 85,
        metodoPago: 'transferencia',
        fecha: '2024-12-21T09:15:00',
        concepto: 'Pago de estadía',
        comprobante: 'boleta',
        numeroComprobante: 'B001-00246',
        estado: 'pagado',
    },
    {
        id: 6,
        huespedId: 5,
        monto: 200,
        metodoPago: 'plin',
        fecha: '2024-12-21T20:30:00',
        concepto: 'Adelanto de estadía',
        comprobante: 'boleta',
        numeroComprobante: 'B001-00247',
        estado: 'pagado',
    },
    {
        id: 7,
        huespedId: 5,
        monto: 600,
        metodoPago: 'pendiente',
        fecha: null,
        concepto: 'Saldo pendiente',
        comprobante: null,
        numeroComprobante: null,
        estado: 'pendiente',
    },
];

// Órdenes de limpieza y mantenimiento
export const ordenesLimpieza = [
    { id: 1, habitacionId: 3, tipo: 'limpieza', estado: 'en_proceso', asignadoA: 'María Pérez', fecha: '2024-12-21T10:00:00', notas: 'Limpieza profunda' },
    { id: 2, habitacionId: 7, tipo: 'mantenimiento', estado: 'pendiente', asignadoA: 'José García', fecha: '2024-12-21T08:00:00', notas: 'Reparar aire acondicionado' },
];

// Usuarios del sistema
export const usuarios = [
    { id: 1, nombre: 'Admin Principal', email: 'admin@hoteldellago.com', rol: 'administrador', activo: true },
    { id: 2, nombre: 'Juan Recepcionista', email: 'juan@hoteldellago.com', rol: 'recepcionista', activo: true },
    { id: 3, nombre: 'María Limpieza', email: 'maria@hoteldellago.com', rol: 'limpieza', activo: true },
    { id: 4, nombre: 'Pedro Torres', email: 'pedro@hoteldellago.com', rol: 'recepcionista', activo: false },
];

// Configuración del hotel
export const configuracionHotel = {
    nombre: 'Hotel Nombre',
    direccion: 'Av. Principal 123, Lima, Perú',
    telefono: '01-555-0123',
    email: 'contacto@hoteldellago.com',
    ruc: '20123456789',
    moneda: 'S/',
    impuesto: 18,
    horaCheckIn: '14:00',
    horaCheckOut: '12:00',
};

// Estadísticas del día (para dashboard)
export const estadisticasDia = {
    fecha: '2024-12-21',
    totalHabitaciones: 12,
    disponibles: 4,
    ocupadas: 5,
    enLimpieza: 1,
    enMantenimiento: 1,
    checkInsHoy: 2,
    checkOutsHoy: 1,
    huespedsDentro: 3,
    huespedesFuera: 1,
    huespedesEsperando: 1,
    ingresosHoy: 375,
    ingresosMes: 12450,
    ocupacionPorcentaje: 42,
};

// Alertas
export const alertas = [
    { id: 1, tipo: 'salida_proxima', mensaje: 'María Elena Torres - Checkout en 2 horas', habitacion: '201', urgencia: 'media' },
    { id: 2, tipo: 'pago_pendiente', mensaje: 'María Elena Torres - S/ 100 pendiente', habitacion: '201', urgencia: 'alta' },
    { id: 3, tipo: 'pago_pendiente', mensaje: 'Juan Pablo Ríos - S/ 600 pendiente', habitacion: '304', urgencia: 'media' },
    { id: 4, tipo: 'mantenimiento', mensaje: 'Suite 203 - Aire acondicionado averiado', habitacion: '203', urgencia: 'alta' },
];

// Datos para gráficos
export const ocupacionSemanal = [
    { dia: 'Lun', ocupacion: 58 },
    { dia: 'Mar', ocupacion: 65 },
    { dia: 'Mié', ocupacion: 72 },
    { dia: 'Jue', ocupacion: 68 },
    { dia: 'Vie', ocupacion: 85 },
    { dia: 'Sáb', ocupacion: 92 },
    { dia: 'Dom', ocupacion: 78 },
];

export const ingresosMensuales = [
    { mes: 'Jul', ingresos: 9800 },
    { mes: 'Ago', ingresos: 11200 },
    { mes: 'Sep', ingresos: 10500 },
    { mes: 'Oct', ingresos: 12800 },
    { mes: 'Nov', ingresos: 11900 },
    { mes: 'Dic', ingresos: 12450 },
];
