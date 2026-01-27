import API from '../utils/api.js';

/**
 * Modelo de Trabajadores
 * Gestiona la lógica de datos relacionada con los trabajadores/usuarios del sistema.
 */
export default class WorkerModel {
    constructor() {
        this.api = new API();
    }

    /**
     * Obtiene todos los trabajadores/usuarios.
     * @param {string} role - Rol para filtrar (opcional: 'mecanico', 'recepcion', 'admin').
     * @returns {Promise<Array>} Promesa con la lista de trabajadores.
     */
    async getWorkers(role = null) {
        let endpoint = '/auth/users';
        if (role) endpoint += `?role=${role}`;
        return this.api.get(endpoint);
    }

    /**
     * Obtiene un trabajador específico por ID.
     * @param {number} workerId - ID del trabajador.
     * @returns {Promise<Object>} Promesa con los datos del trabajador.
     */
    async getWorkerById(workerId) {
        return this.api.get(`/auth/users/${workerId}`);
    }

    /**
     * Crea un nuevo trabajador/usuario.
     * @param {Object} workerData - Datos del trabajador (nombre, apellido_p, correo, password, rol_nombre, etc.).
     * @returns {Promise<Object>} Promesa con el trabajador creado.
     */
    async createWorker(workerData) {
        return this.api.post('/auth/register', workerData);
    }

    /**
     * Actualiza un trabajador existente.
     * @param {number} workerId - ID del trabajador.
     * @param {Object} workerData - Datos a actualizar.
     * @returns {Promise<Object>} Promesa con la respuesta.
     */
    async updateWorker(workerId, workerData) {
        return this.api.put(`/auth/users/${workerId}`, workerData);
    }

    /**
     * Elimina un trabajador.
     * @param {number} workerId - ID del trabajador.
     * @returns {Promise<Object>} Promesa con la respuesta.
     */
    async deleteWorker(workerId) {
        return this.api.delete(`/auth/users/${workerId}`);
    }
}
