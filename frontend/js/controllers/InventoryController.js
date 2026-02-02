import API from '../utils/api.js';
import InventoryView from '../views/InventoryView.js';
import Toast from '../utils/toast.js';

/**
 * ============================================================================
 * ENCABEZADO DEL ARCHIVO (Controlador de Inventario)
 * ============================================================================
 * Propósito:
 *   Gestiona el stock de repuestos y partes.
 *
 * Flujo Lógico:
 *   1. Inicialización: Carga listado de inventario.
 *   2. Búsqueda: Filtrado local por ID/Nombre/Marca.
 *   3. CRUD: Creación, actualización y borrado lógico de items.
 *
 * Interacciones:
 *   - InventoryModel: Gestión de datos.
 *   - InventoryView: Interfaz de usuario.
 * ============================================================================
 */

export default class InventoryController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        
        this.parts = [];
        this.currentSearch = '';
    }

    /**
     * Inicialización del controlador.
     */
    async init() {
        this.bindEvents();
        await this.loadParts();
    }

    /**
     * Enlace de listeners de la vista.
     */
    bindEvents() {
        this.view.onAction = (action, id) => this.handleAction(action, id);
        this.view.onSubmit = (data) => this.handleSubmit(data);
        this.view.bindSearch((query) => this.handleSearch(query));
    }

    /**
     * Lógica de Búsqueda Local.
     */
    handleSearch(query) {
        this.currentSearch = query.toLowerCase().trim();
        const term = this.currentSearch;
        
        if (!term) {
            this.view.updatePartsList(this.parts);
            return;
        }

        const filtered = this.parts.filter(p => 
            (p.nombre && p.nombre.toLowerCase().includes(term)) ||
            (p.marca && p.marca.toLowerCase().includes(term)) ||
            (p.id && p.id.toString().includes(term))
        );
        this.view.updatePartsList(filtered);
    }

    /**
     * Carga de datos desde Backend.
     */
    async loadParts() {
        try {
            this.view.showLoading();
            this.parts = await this.model.getParts();
            
            // Persistencia del filtro actual al recargar
            let displayParts = this.parts;
            if(this.currentSearch) {
                const term = this.currentSearch;
                displayParts = this.parts.filter(p => 
                    (p.nombre && p.nombre.toLowerCase().includes(term)) ||
                    (p.marca && p.marca.toLowerCase().includes(term)) ||
                    (p.id && p.id.toString().includes(term))
                );
            }
            
            this.view.render(displayParts, this.currentSearch);
        } catch (error) {
            console.error('Error cargando inventario:', error);
            Toast.error('Error al cargar inventario');
        } finally {
            this.view.hideLoading();
        }
    }

    /**
     * Router de acciones de items.
     */
    async handleAction(action, id) {
        const part = this.parts.find(p => p.id == id);
        if (!part) return;

        if (action === 'edit') {
            this.view.showModal(part);
        } else if (action === 'delete') {
            this.view.showConfirmDelete(id, async (idToDelete) => {
                try {
                    this.view.showLoading();
                    await this.model.deletePart(idToDelete);
                    Toast.success('Repuesto eliminado correctamente');
                    this.loadParts();
                } catch (error) {
                    console.error('Error eliminando repuesto:', error);
                    Toast.error('Error al eliminar repuesto');
                } finally {
                    this.view.hideLoading();
                }
            });
        }
    }

    /**
     * Gestión del Formulario (Crear/Editar).
     */
    async handleSubmit(partData) {
        try {
            this.view.showLoading();
            if (partData.id) {
                await this.model.updatePart(partData.id, partData);
                Toast.success('Repuesto actualizado correctamente');
            } else {
                await this.model.createPart(partData);
                Toast.success('Repuesto creado correctamente');
            }
            this.view.closeModal();
            this.loadParts(); // Recarga para ver cambios y resetear filtros si se desea
        } catch (error) {
            console.error('Error guardando repuesto:', error);
            Toast.error('Error al guardar repuesto');
        } finally {
            this.view.hideLoading();
        }
    }
}
