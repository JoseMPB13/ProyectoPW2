/**
 * Constantes de la aplicación y Helpers
 */

export const ORDER_STATES = {
    PENDIENTE: 1,
    EN_DIAGNOSTICO: 2,
    REPARANDO: 3,
    LISTO_ENTREGA: 4,
    ENTREGADO: 5
};

export const ORDER_STATES_LABELS = {
    'Pendiente': { label: 'Pendiente', class: 'badge-warning', dot: 'warning' },
    'En Diagnostico': { label: 'Diagnostico', class: 'badge-info', dot: 'info' },
    'Reparando': { label: 'Reparando', class: 'badge-primary', dot: 'primary' },
    'Listo para Entrega': { label: 'Listo', class: 'badge-success', dot: 'success' },
    'Entregado': { label: 'Entregado', class: 'badge-secondary', dot: 'secondary' }
};

/**
 * Retorna la configuración de UI para un estado dado (ID o Nombre)
 * @param {string|number} status 
 */
export function getStatusConfig(status) {
    // Si es un objeto completo de backend (ej. {id: 1, nombre_estado: 'Pendiente'})
    if (typeof status === 'object' && status !== null && status.nombre_estado) {
        return ORDER_STATES_LABELS[status.nombre_estado] || { label: status.nombre_estado, class: 'badge-default', dot: 'default' };
    }
    // Si es string directo k key
    return ORDER_STATES_LABELS[status] || { label: status, class: 'badge-default', dot: 'default' };
}
