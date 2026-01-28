/**
 * Clase API
 * Maneja las peticiones HTTP al backend y la gestión del token JWT.
 */
export default class API {
    constructor(baseURL = 'http://127.0.0.1:5000') {
        this.baseURL = baseURL;
    }

    /**
     * Obtiene el token de autenticación del almacenamiento local.
     * @returns {string|null} El token JWT o null si no existe.
     */
    getToken() {
        return localStorage.getItem('token');
    }

    /**
     * Construye los headers para la petición, incluyendo Content-Type y Authorization.
     * @param {Object} customHeaders - Headers adicionales opcionales.
     * @returns {Headers} Objeto Headers configurado.
     */
    _getHeaders(customHeaders = {}) {
        const headers = new Headers({
            'Content-Type': 'application/json',
            ...customHeaders
        });

        const token = this.getToken();
        if (token) {
            headers.append('Authorization', `Bearer ${token}`);
        }

        return headers;
    }

    /**
     * Maneja la respuesta del fetch, lanzando errores si la respuesta no es OK.
     * @param {Response} response - Objeto Response del fetch.
     * @returns {Promise<any>} Promesa con los datos JSON casteados.
     */
    async _handleResponse(response) {
        if (!response.ok) {
            // Intenta obtener el mensaje de error del backend
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { message: response.statusText };
            }
            
            // Si es error de autenticación (401), podriamos redirigir al login aquí
            if (response.status === 401) {
                console.warn('No autorizado o sesión expirada. Cerrando sesión...');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                // Si tienes acceso a la instancia de la app o AuthController, úsala.
                // Como esto es una utilidad, podemos forzar recarga o despacho de evento.
                window.location.reload(); 
            }

            throw new Error(errorData.message || 'Error en la petición');
        }
        
        // Retornar null si no hay contenido (ej 204 No Content)
        if (response.status === 204) return null;

        return response.json();
    }

    /**
     * Realiza una petición GET.
     * @param {string} endpoint - Endpoint relativo (ej: '/api/clients').
     * @returns {Promise<any>} Datos de la respuesta.
     */
    async get(endpoint) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'GET',
                headers: this._getHeaders()
            });
            return this._handleResponse(response);
        } catch (error) {
            console.error(`Error en GET ${endpoint}:`, error);
            throw error;
        }
    }

    /**
     * Realiza una petición POST.
     * @param {string} endpoint - Endpoint relativo.
     * @param {Object} data - Datos a enviar en el cuerpo.
     * @returns {Promise<any>} Respuesta del servidor.
     */
    async post(endpoint, data) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'POST',
                headers: this._getHeaders(),
                body: JSON.stringify(data)
            });
            return this._handleResponse(response);
        } catch (error) {
            console.error(`Error en POST ${endpoint}:`, error);
            throw error;
        }
    }

    /**
     * Realiza una petición PUT.
     * @param {string} endpoint - Endpoint relativo.
     * @param {Object} data - Datos a actualizar.
     * @returns {Promise<any>} Respuesta del servidor.
     */
    async put(endpoint, data) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'PUT',
                headers: this._getHeaders(),
                body: JSON.stringify(data)
            });
            return this._handleResponse(response);
        } catch (error) {
            console.error(`Error en PUT ${endpoint}:`, error);
            throw error;
        }
    }

    /**
     * Realiza una petición DELETE.
     * @param {string} endpoint - Endpoint relativo.
     * @returns {Promise<any>} Respuesta del servidor.
     */
    async delete(endpoint) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'DELETE',
                headers: this._getHeaders()
            });
            return this._handleResponse(response);
        } catch (error) {
            console.error(`Error en DELETE ${endpoint}:`, error);
            throw error;
        }
    }
}
