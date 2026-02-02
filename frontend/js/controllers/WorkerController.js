import WorkerModel from '../models/WorkerModel.js';
import WorkerView from '../views/WorkerView.js';

/**
 * ============================================================================
 * ENCABEZADO DEL ARCHIVO (Controlador de RRHH)
 * ============================================================================
 * Propósito:
 *   Gestiona el personal (Trabajadores) del taller.
 *   
 * Flujo Lógico:
 *   1. Inicialización: Carga listado de trabajadores.
 *   2. Filtros: Por Rol (Mecánico/Recepción) y Búsqueda de Texto.
 *   3. CRUD: Gestión de usuarios del sistema.
 *
 * Interacciones:
 *   - WorkerModel: Datos de usuarios/roles.
 *   - WorkerView: Interfaz de gestión.
 * ============================================================================
 */

export default class WorkerController {
    constructor() {
        this.model = new WorkerModel();
        this.view = new WorkerView();
        
        // Estado interno del controlador
        this.currentRoleFilter = null;
        this.currentSearch = null;
        this.allWorkers = [];

        // Binding de eventos
        this.view.bindNewWorker(this.handleNewWorker.bind(this));
        this.view.bindSubmitWorker(this.handleSubmitWorker.bind(this));
        this.view.bindCloseModal();
        this.view.bindWorkerActions(this.handleWorkerAction.bind(this));
        this.view.bindSearch(this.handleSearch.bind(this));
        this.view.bindFilterRole(this.handleFilterRole.bind(this));
    }

    /**
     * Inicializa la vista cargando los trabajadores.
     */
    async init() {
        await this.loadWorkers();
    }

    /**
     * Carga los trabajadores desde el servidor.
     * Soporta filtrado por rol en el backend (optimización).
     */
    async loadWorkers() {
        try {
            const workers = await this.model.getWorkers(this.currentRoleFilter);
            this.allWorkers = workers;
            this.filterAndRender();
        } catch (error) {
            console.error('Error al cargar trabajadores:', error);
            this.view.showError('No se pudieron cargar los trabajadores');
            this.view.render([]);
        }
    }

    /**
     * Aplica filtros locales (Búsqueda) y renderiza.
     */
    filterAndRender() {
        let filtered = this.allWorkers;

        // Aplicar búsqueda de texto
        if (this.currentSearch) {
            const search = this.currentSearch.toLowerCase();
            filtered = filtered.filter(w => 
                (w.nombre && w.nombre.toLowerCase().includes(search)) ||
                (w.apellido_p && w.apellido_p.toLowerCase().includes(search)) ||
                (w.correo && w.correo.toLowerCase().includes(search))
            );
        }

        this.view.render(filtered, {
            search: this.currentSearch,
            role: this.currentRoleFilter
        });
    }

    /**
     * Abre el modal para crear nuevo trabajador.
     */
    handleNewWorker() {
        this.view.renderWorkerModal();
    }

    /**
     * Maneja el envío del formulario de trabajador (Crear/Editar).
     * @param {Object} formData - Datos del formulario.
     */
    async handleSubmitWorker(formData) {
        try {
            if (formData.id) {
                // Actualizar existente
                const updateData = { ...formData };
                // Seguridad: Si password está vacío, no lo enviamos para no sobrescribir/resetear
                if (!updateData.password) {
                    delete updateData.password;
                }
                
                await this.model.updateWorker(formData.id, updateData);
                this.view.showSuccess('Trabajador actualizado exitosamente');
            } else {
                // Crear nuevo
                await this.model.createWorker(formData);
                this.view.showSuccess('Trabajador creado exitosamente');
            }
            
            this.view.closeModal();
            await this.loadWorkers();
        } catch (error) {
            console.error('Error al guardar trabajador:', error);
            this.view.showError('No se pudo guardar el trabajador: ' + (error.message || 'Error desconocido'));
        }
    }

    /**
     * Router de acciones de la tabla.
     */
    async handleWorkerAction(action, id) {
        if (action === 'view') {
            try {
                const worker = await this.model.getWorkerById(id);
                // TODO: Implementar modal de detalles real
                alert(JSON.stringify(worker, null, 2)); 
            } catch (error) {
                this.view.showError('No se pudo cargar el trabajador');
            }
        } else if (action === 'edit') {
            try {
                const worker = await this.model.getWorkerById(id);
                this.view.renderWorkerModal(worker);
            } catch (error) {
                this.view.showError('No se pudo cargar el trabajador para editar');
            }
        } else if (action === 'delete') {
            if (confirm('¿Está seguro de eliminar este trabajador?')) {
                try {
                    await this.model.deleteWorker(id);
                    this.view.showSuccess('Trabajador eliminado exitosamente');
                    await this.loadWorkers();
                } catch (error) {
                    this.view.showError('No se pudo eliminar el trabajador');
                }
            }
        }
    }

    /**
     * Handler de búsqueda (input search).
     */
    handleSearch(searchTerm) {
        this.currentSearch = searchTerm || null;
        this.filterAndRender();
    }

    /**
     * Handler de filtro por rol (dropdown).
     */
    async handleFilterRole(role) {
        this.currentRoleFilter = role || null;
        await this.loadWorkers();
    }
}
