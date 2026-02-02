# 📘 Manual de Usuario - Sistema Taller Automotriz

**Versión:** 2.0 (Verificada)  
**Dirigido a:** Personal Operativo y Administrativo

---

## 1. Conceptos Básicos

Este sistema permite controlar el flujo de trabajo del taller desde cualquier dispositivo con navegador web.

### Reglas de Oro del Sistema

1.  **No hay Orden sin Cliente:** Primero debe existir el cliente y el vehículo en el sistema.
2.  **Roles Estrictos:** Si usted es Mecánico, _no podrá ver_ el inventario ni la caja. Si es Recepcionista, _no podrá ver_ la gestión de personal. Esto es por seguridad.
3.  **Automatización:** El sistema cerrará la orden automáticamente cuando se registre el pago total.

---

## 2. Guía por Roles

### 👤 Rol: Recepcionista

_Su función: Ingreso de vehículos y Cobranza._

#### A. Recepción de Vehículo (Paso a Paso)

1.  Ingrese al módulo **Clientes**. Busque si el cliente ya existe (por Nombre o CI).
2.  Si no existe, clic en **"Nuevo Cliente"**.
3.  En el perfil del cliente, asegúrese de que el auto esté registrado en la sección "Vehículos".
4.  Vaya a **Órdenes** > **Nueva Orden**.
5.  Seleccione Cliente y Vehículo. Escriba la **falla reportada** por el cliente.
6.  Asigne un Técnico inicial (opcional).

#### B. Cobro y Facturación

1.  Cuando el auto esté listo, vaya a **Pagos**.
2.  Verá las órdenes con saldo pendiente. Clic en **"Registrar Pago"**.
3.  Puede aceptar pagos parciales (ej. 50% anticipo).
4.  **Importante:** Si el cliente paga el 100% de la deuda, el sistema cambiará el estado de la orden a **"Entregado"** por usted.
5.  **Factura:** En el detalle de la orden, use el botón **"Descargar Factura"** para generar un PDF al instante.

### � Rol: Mecánico

_Su función: Diagnóstico y Reparación._

1.  Inicie sesión. El sistema lo llevará directamente a su lista de **Órdenes Asignadas**.
2.  Abra una orden en estado "Pendiente" o "En Proceso".
3.  **Diagnóstico:** Clic en "Editar".
4.  **Agregar Materiales:**
    - Pestaña "Servicios": Agregue su mano de obra.
    - Pestaña "Repuestos": Seleccione piezas del inventario.
    - _Nota:_ No podrá agregar piezas si el Inventario marca "Sin Stock". Avise al bodeguero.
5.  Actualice el estado a **"Terminado"** cuando finalice.

### �️ Rol: Administrador

_Su función: Control y Gestión._

- **Inventario:** Solo usted puede crear nuevos "Repuestos" y ajustar precios.
- **Usuarios:** Puede crear cuentas para nuevos empleados en el módulo "Recursos Humanos".
  - _Atención:_ Al crear un usuario, el nombre de usuario debe ser único.
- **Dashboard:** Revise los gráficos diarios para ver cuánto dinero ha ingresado hoy.

---

## 3. Solución de Problemas Frecuentes

| Problema                                   | Causa Explicada                                   | Solución                                                                     |
| :----------------------------------------- | :------------------------------------------------ | :--------------------------------------------------------------------------- |
| **"No puedo ver el módulo de Inventario"** | Su usuario tiene rol de Recepcionista o Mecánico. | Solicite al Admin que cambie su rol si es necesario.                         |
| **"Error al crear Orden: Falta stock"**    | Intenta agregar un repuesto que tiene 0 unidades. | Vaya a Inventario y actualice el stock del ítem.                             |
| **"La orden se cerró sola"**               | Se registró un pago por el total de la deuda.     | Es el comportamiento normal. Puede reabrirla editando el estado manualmente. |
| **Página en blanco o error de red**        | El servidor backend (pantalla negra) se cerró.    | Reinicie el archivo `run.py` en el servidor principal.                       |

---

## 4. Atajos de Teclado y Trucos

- **Búsqueda Rápida:** En Inventario, escriba parte del nombre para filtrar al instante (sin dar Enter).
- **Descarga PDF:** Las facturas se generan en tiempo real; no ocupan espacio en el servidor.

---

<center>Sistema Taller v1.2 - Documentación Confidencial Interna</center>
