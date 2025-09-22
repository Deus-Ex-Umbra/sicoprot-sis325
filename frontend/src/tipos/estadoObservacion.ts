export const EstadoObservacion = {
    PENDIENTE: 'pendiente',
    CORREGIDO: 'corregido',
    APROBADO: 'aprobado',
    EN_REVISION: 'en_revision',
    RECHAZADO: 'rechazado'
} as const;

export type EstadoObservacion = typeof EstadoObservacion[keyof typeof EstadoObservacion];

// Configuración visual para cada estado
export const estadoConfig = {
    [EstadoObservacion.PENDIENTE]: {
        label: 'Pendiente',
        className: 'badge bg-warning text-dark',
        icon: 'clock'
    },
    [EstadoObservacion.EN_REVISION]: {
        label: 'En Revisión',
        className: 'badge bg-info text-white',
        icon: 'eye'
    },
    [EstadoObservacion.CORREGIDO]: {
        label: 'Corregido',
        className: 'badge bg-success text-white',
        icon: 'check-circle'
    },
    [EstadoObservacion.APROBADO]: {
        label: 'Aprobado',
        className: 'badge bg-primary text-white',
        icon: 'check-circle'
    },
    [EstadoObservacion.RECHAZADO]: {
        label: 'Rechazado',
        className: 'badge bg-danger text-white',
        icon: 'x-circle'
    }
};