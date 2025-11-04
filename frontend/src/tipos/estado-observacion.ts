export const EstadoObservacion = {
    PENDIENTE: 'pendiente',
    CORREGIDA: 'corregida',
    EN_REVISION: 'en_revision',
    RECHAZADO: 'rechazado'
} as const;

export type EstadoObservacion = typeof EstadoObservacion[keyof typeof EstadoObservacion];

export const estadoConfig = {
    [EstadoObservacion.PENDIENTE]: {
        label: 'Pendiente',
        variant: 'outline',
        className: 'text-yellow-600 border-yellow-500/50 bg-yellow-500/10',
        icon: 'clock'
    },
    [EstadoObservacion.EN_REVISION]: {
        label: 'En Revisión',
        variant: 'outline',
        className: 'text-blue-600 border-blue-500/50 bg-blue-500/10',
        icon: 'eye'
    },
    [EstadoObservacion.CORREGIDA]: {
        label: 'Corregida',
        variant: 'default',
        className: 'bg-green-600/10 text-green-700 border-green-500/20',
        icon: 'check-circle'
    },
    [EstadoObservacion.RECHAZADO]: {
        label: 'Rechazado',
        variant: 'destructive',
        className: 'bg-destructive/10 text-destructive border-destructive/20',
        icon: 'x-circle'
    }
};