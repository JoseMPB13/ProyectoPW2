import API from '../utils/api.js';

/**
 * Modelo de Autenticación
 * Gestiona la lógica de datos relacionada con el login y usuarios.
 */
export default class AuthModel {
    constructor() {
        this.api = new API();
    }

    /**
     * Realiza la petición de login al servidor.
     * @param {string} email - Correo del usuario.
     * @param {string} password - Contraseña del usuario.
     * @returns {Promise<Object>} Promesa con la respuesta del servidor (token y user).
     */
    async login(email, password) {
        // Enpoint esperado: /auth/login
        // Body esperado: { email, password }
        return this.api.post('/auth/login', { email, password });
    }
}
