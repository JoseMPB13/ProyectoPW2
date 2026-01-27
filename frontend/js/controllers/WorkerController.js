import WorkerModel from '../models/WorkerModel.js';
import WorkerView from '../views/WorkerView.js';

/**
 * Controlador de Trabajadores
 * Coordina la lógica de gestión de trabajadores entre vista y modelo.
 */
export default class WorkerController {
    constructor() {
        this.model = new WorkerModel();
        this.view = new WorkerView();
        
        // Estado interno
        this.currentRoleFilter = null;
        this.currentSearch = null;
        this.allWorkers = [];

        // Vincular eventos
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
     * Filtra y renderiza los trabajadores según búsqueda y filtros.
     */
    filterAndRender() {
        let filtered = this.allWorkers;

        // Aplicar búsqueda
        if (this.currentSearch) {
            const search = this.currentSearch.toLowerCase();
            filtered = filtered.filter(w => 
                (w.nombre && w.nombre.toLowerCase().includes(search)) ||
                (w.apellido_p && w.apellido_p.toLowerCase().includes(search)) ||
                (w.correo && w.correo.toLowerCase().includes(search))
            );
        }

        this.view.render(filtered);
    }

    /**
     * Maneja la creación de un nuevo trabajador.
     */
    handleNewWorker() {
        this.view.renderWorkerModal();
    }

    /**
     * Maneja el envío del formulario de trabajador.
     * @param {Object} formData - Datos del formulario.
     */
    async handleSubmitWorker(formData) {
        try {
            await this.model.createWorker(formData);
            this.view.closeModal();
            this.view.showSuccess('Trabajador creado exitosamente');
            await this.loadWorkers();
        } catch (error) {
            console.error('Error al crear trabajador:', error);
            this.view.showError('No se pudo crear el trabajador: ' + error.message);
        }
    }

    /**
     * Maneja las acciones de la tabla (ver, editar, eliminar).
     * @param {string} action - Acción a realizar.
     * @param {string} id - ID del trabajador.
     */
    async handleWorkerAction(action, id) {
        if (action === 'view') {
            try {
                const worker = await this.model.getWorkerById(id);
                alert(JSON.stringify(worker, null, 2)); // Temporal
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
     * Maneja la búsqueda de trabajadores.
     * @param {string} searchTerm - Término de búsqueda.
     */
    handleSearch(searchTerm) {
        this.currentSearch = searchTerm || null;
        this.filterAndRender();
    }

    /**
     * Maneja el filtro por rol.
     * @param {string} role - Rol seleccionado.
     */
    async handleFilterRole(role) {
        this.currentRoleFilter = role || null;
        await this.loadWorkers();
    }
}
