# 📘 Manual de Usuario - Sistema de Gestión de Taller Automotriz

Bienvenido al manual de usuario del Sistema de Gestión de Taller Automotriz. Este documento le guiará paso a paso en el uso de la plataforma, desde la instalación inicial hasta la gestión diaria de operaciones.

## 📋 Tabla de Contenidos

1.  [Introducción](#1-introducción)
2.  [Requisitos del Sistema](#2-requisitos-del-sistema)
3.  [Instalación y Configuración](#3-instalación-y-configuración)
4.  [Acceso al Sistema](#4-acceso-al-sistema)
5.  [Navegación General](#5-navegación-general)
6.  [Módulos del Sistema](#6-módulos-del-sistema)
    - [Dashboard](#61-dashboard)
    - [Gestión de Clientes](#62-gestión-de-clientes)
    - [Órdenes de Servicio](#63-órdenes-de-servicio)
    - [Inventario](#64-inventario)
    - [Pagos](#65-pagos)
7.  [Solución de Problemas Comunes](#7-solución-de-problemas-comunes)

---

## 1. Introducción

El **Sistema de Gestión de Taller Automotriz** es una herramienta integral diseñada para optimizar las operaciones de talleres mecánicos. Permite administrar clientes, vehículos, órdenes de trabajo, inventario de repuestos y facturación en una sola plataforma intuitiva.

---

## 2. Requisitos del Sistema

Antes de comenzar, asegúrese de que su equipo cumpla con los siguientes requisitos:

- **Sistema Operativo:** Windows 10/11, macOS, o Linux.
- **Navegador Web:** Google Chrome, Mozilla Firefox, o Microsoft Edge (versiones recientes).
- **Conexión a Internet:** Requerida para la base de datos en la nube (Supabase).
- **Software Adicional (para instalación local):**
  - Python 3.8 o superior.
  - Node.js 14 o superior.

---

## 3. Instalación y Configuración

### Paso 1: Descargar el Proyecto

Si recibió el código fuente, descomprímalo en una carpeta de su elección. O clone el repositorio si tiene acceso a Git.

### Paso 2: Configurar el Backend (Servidor)

1.  Abra una terminal (PowerShell o CMD en Windows).
2.  Navegue a la carpeta del proyecto y luego a `backend`:
    ```powershell
    cd ruta/al/proyecto/backend
    ```
3.  Cree un entorno virtual (solo la primera vez):
    ```powershell
    python -m venv venv
    ```
4.  Active el entorno virtual:
    ```powershell
    .\venv\Scripts\activate
    ```
5.  Instale las dependencias necesarias:
    ```powershell
    pip install -r requirements.txt
    ```
6.  Inicie el servidor:
    ```powershell
    python run.py
    ```
    _Debe ver un mensaje indicando que el servidor corre en `http://127.0.0.1:5000`._

### Paso 3: Configurar el Frontend (Interfaz)

1.  Abra una **nueva** terminal.
2.  Navegue a la carpeta `frontend`:
    ```powershell
    cd ruta/al/proyecto/frontend
    ```
3.  Instale las dependencias (solo la primera vez):
    ```powershell
    npm install
    ```
4.  Inicie la aplicación:
    ```powershell
    npm run dev
    ```
    _Esto abrirá la aplicación en su navegador, generalmente en `http://localhost:3000`._

---

## 4. Acceso al Sistema

Una vez iniciados ambos servidores, abra su navegador en `http://localhost:3000`.

- **Pantalla de Login:** Ingrese sus credenciales.
- **Credenciales por defecto:**
  - **Usuario:** `admin@taller.com`
  - **Contraseña:** `admin123`

> ⚠️ **Nota:** Se recomienda cambiar la contraseña del administrador inmediatamente después del primer ingreso.

---

## 5. Navegación General

El sistema cuenta con una **Barra Lateral (Sidebar)** a la izquierda que permite acceder a los diferentes módulos:

- 📊 **Dashboard:** Vista general del estado del taller.
- 👥 **Clientes:** Administración de la base de datos de clientes y sus vehículos.
- 🛠️ **Órdenes:** Gestión del flujo de trabajo de reparaciones.
- 📦 **Inventario:** Control de stock de repuestos.
- 💰 **Pagos:** Registro de ingresos y facturación.
- ⚙️ **Configuración:** Ajustes del sistema y usuarios (solo Admin).

El botón **"Cerrar Sesión"** se encuentra en la parte inferior de la barra lateral.

---

## 6. Módulos del Sistema

### 6.1 Dashboard

El panel de control principal muestra métricas clave en tiempo real:

- **Total de Órdenes:** Órdenes activas este mes.
- **Ingresos Mensuales:** Facturación total del mes en curso.
- **Gráficos:** Visualización de tendencias de ingresos y estado de órdenes.

### 6.2 Gestión de Clientes

- **Agregar Cliente:** Haga clic en el botón "+ Nuevo Cliente". Complete los datos personales y, opcionalmente, registre un vehículo de inmediato.
- **Buscar:** Use la barra de búsqueda para encontrar clientes por nombre, teléfono o placa.
- **Ver Detalles:** Haga clic en el ícono de "ojo" en la lista para ver el perfil completo del cliente y su historial de vehículos.
- **Agregar Vehículo:** Dentro del perfil de un cliente, puede añadir múltiples vehículos.

### 6.3 Órdenes de Servicio

Este es el núcleo operativo del taller.

1.  **Crear Orden:** Desde el módulo de Órdenes o el perfil del cliente. Seleccione el vehículo y describa el problema.
2.  **Asignar Técnico:** Asigne un mecánico responsable para la orden.
3.  **Gestión de Estados:**
    - `Pendiente`: Orden creada, vehículo en espera.
    - `En Proceso`: Reparación en curso.
    - `Completada`: Trabajo terminado, listo para entrega.
    - `Entregado`: Vehículo devuelto al cliente.
4.  **Agregar Servicios/Repuestos:** Dentro de la orden, añada los servicios realizados y repuestos utilizados. El sistema calculará automáticamente el total.

### 6.4 Inventario

Mantenga el control de sus repuestos.

- **Nuevos Ítems:** Registre repuestos con su costo, precio de venta y stock actual.
- **Control de Stock:** El sistema descontará automáticamente del inventario cuando se usen repuestos en una orden.
- **Alertas:** Los ítems con stock bajo aparecerán resaltados.

### 6.5 Pagos

Gestión financiera de las órdenes.

- **Registrar Pago:** Asocie un pago a una orden específica.
- **Métodos:** Efectivo, Tarjeta, Transferencia.
- **Historial:** Vea todos los pagos recibidos y filtre por fecha.

---

## 7. Solución de Problemas Comunes

| Problema                      | Causa Probable                                       | Solución                                                                                         |
| :---------------------------- | :--------------------------------------------------- | :----------------------------------------------------------------------------------------------- |
| **No puedo iniciar sesión**   | Servidor backend apagado o credenciales incorrectas. | Verifique que la terminal del backend no tenga errores y esté corriendo.                         |
| **"Error de Red" al guardar** | El frontend no conecta con el backend.               | Asegúrese de que el backend corre en el puerto 5000.                                             |
| **La página se ve en blanco** | Error de carga del Frontend.                         | Abra la consola del navegador (F12) para ver errores específicos. Reinicie `npm run dev`.        |
| **No cargan los datos**       | Base de datos desconectada.                          | Verifique su conexión a internet (si usa base de datos en la nube) o la configuración en `.env`. |

---

_Manual generado para la versión 1.0 del Sistema._
