# Plan de Mejoras - Módulo de Gestión de Órdenes

## Análisis de la Estructura Actual

### Backend

- ✅ **Rutas**: `backend/app/routes/orders.py` - Endpoints bien estructurados
- ✅ **Servicios**: `backend/app/services/order_service.py` - Lógica de negocio separada
- ✅ **Modelos**: Esquema de base de datos correcto con tablas de detalle

### Frontend

- ✅ **Vista**: `frontend/js/views/OrderView.js` - Renderización de UI
- ✅ **Controlador**: `frontend/js/controllers/OrderController.js` - Coordinación MVC

## Mejoras Propuestas

### 🎯 Mejora 1: Vista Detallada de Orden con Gestión de Servicios y Repuestos

**Problema actual**: No existe una vista detallada donde se puedan ver y gestionar los servicios y repuestos de una orden específica.

**Solución**:

- Crear una vista modal detallada que muestre:
  - Información completa de la orden
  - Lista de servicios agregados con opción de eliminar
  - Lista de repuestos agregados con opción de eliminar
  - Formulario para agregar nuevos servicios
  - Formulario para agregar nuevos repuestos
  - Historial de pagos
  - Total calculado en tiempo real

**Archivos a modificar**:

- `frontend/js/views/OrderView.js` - Agregar método `renderOrderDetailModal()`
- `frontend/js/controllers/OrderController.js` - Agregar método `handleViewOrderDetail()`
- `backend/app/routes/orders.py` - Agregar endpoints para eliminar servicios/repuestos
- `backend/app/services/order_service.py` - Agregar métodos para eliminar detalles

---

### 🎯 Mejora 2: Endpoints para Eliminar Servicios y Repuestos

**Problema actual**: Solo se pueden agregar servicios y repuestos, pero no eliminarlos.

**Solución**:
Agregar nuevos endpoints:

- `DELETE /orders/<order_id>/services/<detail_id>` - Eliminar servicio de orden
- `DELETE /orders/<order_id>/parts/<detail_id>` - Eliminar repuesto de orden

**Archivos a modificar**:

- `backend/app/routes/orders.py`
- `backend/app/services/order_service.py`

---

### 🎯 Mejora 3: Actualización Automática del Total

**Problema actual**: El total se calcula pero no se refleja en tiempo real en la interfaz.

**Solución**:

- Después de agregar/eliminar servicios o repuestos, actualizar automáticamente el total en la vista
- Mostrar desglose del total (servicios + repuestos)

**Archivos a modificar**:

- `frontend/js/views/OrderView.js`
- `frontend/js/controllers/OrderController.js`

---

### 🎯 Mejora 4: Validación de Stock al Agregar Repuestos

**Problema actual**: Ya existe validación en el backend, pero no hay feedback visual en el frontend.

**Solución**:

- Mostrar stock disponible al seleccionar un repuesto
- Validar cantidad antes de enviar al servidor
- Mostrar mensajes de error claros

**Archivos a modificar**:

- `frontend/js/views/OrderView.js`
- `frontend/js/controllers/OrderController.js`

---

### 🎯 Mejora 5: Edición de Órdenes Existentes

**Problema actual**: El botón "Editar" existe pero no está implementado completamente.

**Solución**:

- Permitir editar información básica de la orden (técnico, estado, diagnóstico)
- Agregar endpoint `PUT /orders/<order_id>`

**Archivos a modificar**:

- `backend/app/routes/orders.py`
- `backend/app/services/order_service.py`
- `frontend/js/controllers/OrderController.js`

---

### 🎯 Mejora 6: Filtros Avanzados y Búsqueda

**Problema actual**: Los filtros son básicos.

**Solución**:

- Agregar filtro por rango de fechas
- Filtro por técnico asignado
- Filtro por cliente
- Búsqueda mejorada que incluya nombre del cliente

**Archivos a modificar**:

- `frontend/js/views/OrderView.js`
- `frontend/js/controllers/OrderController.js`
- `backend/app/services/order_service.py`

---

### 🎯 Mejora 7: Indicadores Visuales y Estadísticas

**Solución**:

- Agregar badges para estados
- Mostrar indicador de órdenes vencidas
- Calcular y mostrar total de órdenes por estado
- Mostrar promedio de tiempo de reparación

**Archivos a modificar**:

- `frontend/js/views/OrderView.js`
- `frontend/js/controllers/OrderController.js`
- `backend/app/routes/orders.py` - Agregar endpoint de estadísticas

---

### 🎯 Mejora 8: Impresión de Orden de Trabajo

**Solución**:

- Generar PDF o vista imprimible de la orden
- Incluir todos los detalles, servicios, repuestos y totales

**Archivos a modificar**:

- `backend/app/routes/orders.py` - Agregar endpoint para generar PDF
- `frontend/js/views/OrderView.js` - Agregar botón de impresión

---

## Priorización de Mejoras

### Alta Prioridad (Implementar primero)

1. ✅ **Mejora 1**: Vista Detallada de Orden
2. ✅ **Mejora 2**: Endpoints para Eliminar Servicios/Repuestos
3. ✅ **Mejora 3**: Actualización Automática del Total

### Prioridad Media

4. **Mejora 5**: Edición de Órdenes
5. **Mejora 4**: Validación de Stock

### Prioridad Baja (Mejoras futuras)

6. **Mejora 6**: Filtros Avanzados
7. **Mejora 7**: Indicadores Visuales
8. **Mejora 8**: Impresión de Orden

---

## Próximos Pasos

¿Qué mejora te gustaría que implemente primero? Te recomiendo empezar con las de **Alta Prioridad** para tener una gestión completa de órdenes funcional.

Puedo implementar:

- **Opción A**: Las 3 mejoras de alta prioridad (Vista detallada + Eliminar items + Total automático)
- **Opción B**: Una mejora específica que necesites urgentemente
- **Opción C**: Todas las mejoras en orden de prioridad

Por favor, indícame cuál prefieres y procedo con la implementación.
