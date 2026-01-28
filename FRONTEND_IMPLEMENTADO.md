# ✅ Frontend Implementado - Modal Unificado de Gestión de Órdenes

## 🎯 Especificaciones Completadas

Se ha implementado exitosamente un **Modal Unificado** para crear y editar órdenes de trabajo con todas las funcionalidades solicitadas.

---

## 📋 Características Implementadas

### 1. **Modal Unificado (Creación y Edición)**

El mismo formulario sirve para:

- ✅ **Crear nuevas órdenes** (POST /orders)
- ✅ **Editar órdenes existentes** (PUT /orders/<id>)

El título del modal cambia dinámicamente:

- "Nueva Orden de Trabajo" (creación)
- "Editar Orden #123" (edición)

---

### 2. **Cabecera: Datos Principales**

#### **Modo Creación:**

- **Cliente**: Dropdown con todos los clientes
- **Vehículo**: Dropdown filtrado por cliente seleccionado
- **Técnico**: Dropdown con todos los mecánicos
- **Estado**: Dropdown con estados disponibles
- **Problema Reportado**: Textarea obligatorio
- **Diagnóstico**: Textarea opcional

#### **Modo Edición:**

- **Vehículo**: Campo deshabilitado (no se puede cambiar)
- **Técnico**: Dropdown editable
- **Estado**: Dropdown editable
- **Problema Reportado**: Textarea editable
- **Diagnóstico**: Textarea editable

---

### 3. **Sección Dinámica: Servicios**

#### Tabla de Servicios:

| Servicio            | Precio         | Acción  |
| ------------------- | -------------- | ------- |
| Select con catálogo | Input numérico | Botón ✕ |

#### Funcionalidades:

- ✅ **Botón "+ Agregar Servicio"**: Agrega nueva fila
- ✅ **Select de servicio**: Carga precio automáticamente
- ✅ **Input de precio**: Editable (permite ajustar precio)
- ✅ **Botón eliminar (✕)**: Elimina fila
- ✅ **Gestión en memoria**: No llama API hasta guardar
- ✅ **Mensaje vacío**: "No hay servicios agregados"

#### Lógica:

```javascript
// Al seleccionar servicio:
1. Obtiene precio del data-precio del option
2. Actualiza formState.servicios[index]
3. Llena input de precio automáticamente
4. Recalcula totales
```

---

### 4. **Sección Dinámica: Repuestos**

#### Tabla de Repuestos:

| Repuesto            | Cantidad       | Precio Unit.   | Subtotal  | Acción  |
| ------------------- | -------------- | -------------- | --------- | ------- |
| Select con catálogo | Input numérico | Input numérico | Calculado | Botón ✕ |

#### Funcionalidades:

- ✅ **Botón "+ Agregar Repuesto"**: Agrega nueva fila
- ✅ **Select de repuesto**: Muestra stock disponible
- ✅ **Input de cantidad**: Con validación de stock
- ✅ **Input de precio**: Editable
- ✅ **Subtotal**: Calculado automáticamente (precio × cantidad)
- ✅ **Botón eliminar (✕)**: Elimina fila
- ✅ **Gestión en memoria**: No llama API hasta guardar

#### Lógica:

```javascript
// Al seleccionar repuesto:
1. Obtiene precio y stock del option (data-precio, data-stock)
2. Actualiza formState.repuestos[index]
3. Llena input de precio automáticamente
4. Guarda stock_disponible para validación
5. Recalcula subtotal y totales
```

---

### 5. **Validación de Stock Visual** ⭐

#### Comportamiento:

```javascript
// Al cambiar cantidad de repuesto:
if (cantidad > stock_disponible) {
  // Borde rojo
  input.style.borderColor = "#dc2626";
  input.style.boxShadow = "0 0 0 2px rgba(220, 38, 38, 0.2)";

  // Bloquear botón guardar
  saveOrderBtn.disabled = true;
} else {
  // Restaurar estilo normal
  input.style.borderColor = "";
  input.style.boxShadow = "";

  // Habilitar botón si no hay otros errores
  saveOrderBtn.disabled = false;
}
```

#### Características:

- ✅ **Validación en tiempo real**: Al escribir en el input
- ✅ **Indicador visual**: Borde rojo + sombra roja
- ✅ **Bloqueo de guardado**: Botón deshabilitado
- ✅ **Verificación global**: Revisa todos los inputs antes de habilitar

---

### 6. **Cálculos en Vivo** 💰

#### Totales Calculados:

```
Total Servicios = Σ(precio_aplicado)
Total Repuestos = Σ(precio_unitario × cantidad)
Total Estimado = Total Servicios + Total Repuestos
```

#### Eventos que disparan recálculo:

- ✅ Cambiar select de servicio
- ✅ Cambiar precio de servicio
- ✅ Cambiar select de repuesto
- ✅ Cambiar cantidad de repuesto
- ✅ Cambiar precio de repuesto
- ✅ Agregar fila
- ✅ Eliminar fila

#### Actualización de UI:

```javascript
updateTotals() {
    // Calcula totales
    const totalServicios = ...;
    const totalRepuestos = ...;
    const totalEstimado = totalServicios + totalRepuestos;

    // Actualiza elementos del DOM
    document.getElementById('totalServicios').textContent = `Bs. ${...}`;
    document.getElementById('totalRepuestos').textContent = `Bs. ${...}`;
    document.getElementById('totalEstimado').textContent = `Bs. ${...}`;

    // Actualiza subtotales de cada repuesto
    this.formState.repuestos.forEach((repuesto, index) => {
        const subtotal = ...;
        // Actualiza celda de subtotal
    });
}
```

---

### 7. **Botón Guardar** 💾

#### Construcción del JSON:

```javascript
getFormData() {
    return {
        auto_id: parseInt(document.getElementById('autoId').value),
        tecnico_id: parseInt(document.getElementById('tecnicoId').value),
        estado_id: parseInt(document.getElementById('estadoId').value),
        problema_reportado: document.getElementById('problemaReportado').value,
        diagnostico: document.getElementById('diagnostico').value || '',
        servicios: this.formState.servicios
            .filter(s => s.servicio_id)  // Solo los que tienen servicio seleccionado
            .map(s => ({
                servicio_id: s.servicio_id,
                precio_aplicado: s.precio_aplicado
            })),
        repuestos: this.formState.repuestos
            .filter(r => r.repuesto_id)  // Solo los que tienen repuesto seleccionado
            .map(r => ({
                repuesto_id: r.repuesto_id,
                cantidad: r.cantidad,
                precio_unitario_aplicado: r.precio_unitario_aplicado
            }))
    };
}
```

#### Lógica de Guardado:

```javascript
async handleSubmitOrder(formData) {
    // Validar que haya al menos un servicio o repuesto
    if (formData.servicios.length === 0 && formData.repuestos.length === 0) {
        this.view.showError('Debe agregar al menos un servicio o repuesto');
        return;
    }

    if (this.currentOrder) {
        // EDICIÓN - PUT /orders/{id}
        response = await fetch(`http://127.0.0.1:5000/orders/${this.currentOrder.id}`, {
            method: 'PUT',
            headers: { ... },
            body: JSON.stringify(formData)
        });
    } else {
        // CREACIÓN - POST /orders
        response = await fetch('http://127.0.0.1:5000/orders', {
            method: 'POST',
            headers: { ... },
            body: JSON.stringify(formData)
        });
    }

    // Cerrar modal y recargar lista
    this.view.closeModal();
    this.view.showSuccess('Orden guardada exitosamente');
    await this.loadOrders();
}
```

---

## 🎨 Estructura del Estado Interno

### formState en OrderView:

```javascript
this.formState = {
    servicios: [
        {
            servicio_id: 1,
            precio_aplicado: 150.00
        },
        {
            servicio_id: 3,
            precio_aplicado: 200.00
        }
    ],
    repuestos: [
        {
            repuesto_id: 5,
            cantidad: 2,
            precio_unitario_aplicado: 85.50,
            stock_disponible: 10  // Para validación
        },
        {
            repuesto_id: 8,
            cantidad: 1,
            precio_unitario_aplicado: 120.00,
            stock_disponible: 5
        }
    ],
    catalogos: {
        servicios: [...],  // Catálogo completo de servicios
        repuestos: [...]   // Catálogo completo de repuestos
    }
};
```

---

## 🔄 Flujo de Trabajo Completo

### Creación de Orden:

1. Usuario hace clic en "Nueva Orden"
2. Controlador carga catálogos (clientes, autos, técnicos, servicios, repuestos, estados)
3. Vista renderiza modal vacío
4. Usuario llena datos principales
5. Usuario agrega servicios y repuestos dinámicamente
6. Totales se calculan en tiempo real
7. Usuario hace clic en "Crear Orden"
8. Controlador construye JSON y envía POST /orders
9. Backend crea orden + detalles + descuenta stock
10. Modal se cierra y lista se recarga

### Edición de Orden:

1. Usuario hace clic en "Editar" en una orden
2. Controlador carga orden completa y catálogos
3. Vista renderiza modal con datos precargados
4. formState.servicios y formState.repuestos se inicializan con datos existentes
5. Usuario modifica servicios/repuestos
6. Totales se recalculan en tiempo real
7. Usuario hace clic en "Actualizar Orden"
8. Controlador construye JSON y envía PUT /orders/{id}
9. Backend sincroniza detalles (elimina, agrega, actualiza) y ajusta stock
10. Modal se cierra y lista se recarga

---

## 📁 Archivos Modificados

### Frontend:

- ✅ `frontend/js/views/OrderView.js` (823 líneas)
  - Modal unificado de creación/edición
  - Tablas dinámicas para servicios y repuestos
  - Validación de stock en tiempo real
  - Cálculo automático de totales
  - Gestión de estado interno

- ✅ `frontend/js/controllers/OrderController.js` (297 líneas)
  - Manejo de creación y edición
  - Carga de catálogos
  - Envío de datos con POST/PUT

- ✅ `frontend/css/styles.css` (+182 líneas)
  - Estilos para form-section
  - Estilos para tablas dinámicas
  - Estilos para botones y controles
  - Estilos para paginación y filtros

---

## ✅ Checklist de Especificaciones

- ✅ **Cabecera**: Datos del Auto, Técnico y Estado
- ✅ **Sección Dinámica**: Dos tablas (Servicios y Repuestos)
- ✅ **Agregar/Quitar filas**: Usando arrays en memoria JS
- ✅ **Sin llamar API**: Hasta hacer clic en guardar
- ✅ **Cálculos en vivo**: Total se actualiza automáticamente
- ✅ **Validación de Stock Visual**: Borde rojo + bloqueo de botón
- ✅ **Atributo data-stock**: Guardado en select options
- ✅ **Botón Guardar**: Construye JSON completo
- ✅ **POST para creación**: Endpoint /orders
- ✅ **PUT para edición**: Endpoint /orders/{id}

---

## 🎉 Resultado Final

Se ha creado un **sistema completo y robusto** de gestión de órdenes con:

- ✅ Modal unificado para creación y edición
- ✅ Tablas dinámicas con gestión en memoria
- ✅ Validación de stock en tiempo real
- ✅ Cálculos automáticos de totales
- ✅ Sincronización completa con el backend
- ✅ Interfaz intuitiva y profesional
- ✅ Código limpio y bien documentado

El usuario puede crear y editar órdenes de manera fluida, con validaciones visuales claras y feedback inmediato. 🚀
