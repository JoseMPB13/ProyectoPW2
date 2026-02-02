# 🚗 Sistema Integral de Gestión de Taller (SaaS)

![Estado](https://img.shields.io/badge/Estado-Producción-success)
![Versión](https://img.shields.io/badge/Versión-1.2.1-blue)
![API](https://img.shields.io/badge/API-RESTful-green)

**Plataforma de alta ingeniería para la administración de centros automotrices.**
Este sistema no es solo un CRUD; es un orquestador de procesos que vincula la recepción, el área técnica y la caja en un flujo único y automatizado.

---

## 🏛️ Arquitectura del Sistema

El proyecto implementa una arquitectura **Cliente-Servidor Desacoplada**, optimizada para escalabilidad y mantenibilidad.

### 1. Backend (API RESTful)

- **Núcleo:** Python 3.10 + Flask.
- **Patrón de Diseño:** **Factory Application Pattern** (`create_app`) para un ciclo de vida limpio.
- **Persistencia:** SQL Alchemy (ORM) sobre PostgreSQL.
- **Seguridad:**
  - Endpoints protegidos con decoradores custom (`@jwt_required`).
  - Inyección de dependencias en Servicios (`OrderService`, `AuthService`).
- **Documentación:** Especificación OpenAPI 3.0 nativa (`/apidocs`).

### 2. Frontend (Single Page Application)

- **Tecnología:** Vanilla JS (ES Modules) para máximo rendimiento sin bloqueo del Main Thread.
- **Patrón UI:** MVC (Modelo-Vista-Controlador) estricto.
  - _Controladores:_ (`OrderController.js`) Gestionan la lógica de negocio y estados.
  - _Vistas:_ (`OrderView.js`) Manipulación aislada del DOM.
  - _Modelos:_ (`OrderModel.js`) Capa de abstracción de red (Fetch API).
- **Enrutamiento:** Router hash-based ligero implementado en `App.js`.

---

## 🧩 Lógica de Negocio y Reglas Automatizadas

Tras un análisis profundo del código, estas son las reglas críticas que gobiernan el sistema:

### 🔄 1. Sincronización de Estados de Orden

El sistema implementa una **Máquina de Estados Finita** para las órdenes:

1.  **Pendiente:** Estado inicial al crear.
2.  **Diagnóstico / En Proceso:** Al asignar técnicos o repuestos.
3.  **Terminado:** Trabajo técnico finalizado.
4.  **Entregado:** Vehículo devuelto al cliente.

> **🤖 Automatización Detectada:**
> En `OrderController.js`, al procesar un pago (`processPayment`), si el saldo pendiente llega a cero, el sistema **automáticamente cambia el estado de la orden a 'Entregado'**. Esto elimina un paso manual para el cajero.

### 🛡️ 2. Sistema de Permisos (RBAC)

La seguridad no es solo visual. El archivo `App.js` aplica un filtro estricto (Deny by Exception):

| Módulo               | Admin | Recepcionista |          Mecánico          |
| :------------------- | :---: | :-----------: | :------------------------: |
| **Dashboard (KPIs)** |  ✅   |      ✅       |  ❌ (Redirige a Órdenes)   |
| **Clientes/Autos**   |  ✅   |      ✅       |             ✅             |
| **Órdenes**          |  ✅   |      ✅       |    ✅ (Solo asignadas)     |
| **Inventario**       |  ✅   |      ❌       | ❌ (Solo lectura en Orden) |
| **RRHH (Usuarios)**  |  ✅   |      ❌       |             ❌             |
| **Pagos/Caja**       |  ✅   |      ✅       |             ❌             |

### 3. Gestión de Inventario

- **Descuento Atómico:** Al agregar un repuesto a una orden, el stock NO se descuenta inmediatamente en la vista, sino transacciónalmente en el backend al guardar la orden.
- **Validación:** El backend (`OrderService`) rechaza cualquier petición si `cantidad > stock_actual`.

---

## 🚀 Guía de Despliegue (Instalación)

### Requisitos Técnicos

- **Python:** 3.8 o superior.
- **Node.js:** v14+.
- **PostgreSQL:** Opcional (por defecto usa SQLite para desarrollo).

### 1. Backend (Servidor)

```bash
# Navegar a la carpeta
cd backend

# Crear entorno virtual (Aislamiento de dependencias)
python -m venv venv
# Activar:
# Windows: .\venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

# Instalar librerías congeladas
pip install -r requirements.txt

# Iniciar
python run.py
```

_Puerto:_ `5000`

### 2. Frontend (Cliente)

```bash
cd frontend

# Instalar dependencias de desarrollo
npm install

# Iniciar servidor de assets
npm run dev
```

_Puerto:_ `3000`

---

## 🧪 Calidad y Pruebas (QA)

El sistema incluye una suite profesional de herramientas de prueba.

### A. Documentación Viva (Swagger UI)

El backend autogenera su documentación.

1.  Vaya a: `http://localhost:5000/apidocs`
2.  Despliegue cualquier endpoint (ej. `POST /orders`).
3.  Haga clic en **Try it out** para enviar peticiones reales al servidor.

### B. Pruebas Automatizadas (Postman)

Se incluye el archivo `backend/postman_collection.json`.

- **Variable Automática:** El script de "Login" guarda automáticamente el `access_token` en la variable de entorno `{{token}}`, permitiendo ejecutar pruebas de secuencia (Crear -> Editar -> Pagar) sin copiar/pegar tokens manualmente.

---

## 📂 Estructura del Código Fuente

```
root/
├── backend/
│   ├── app/
│   │   ├── routes/          # API Endpoints (Gateway)
│   │   ├── services/        # Reglas de Negocio (Core Logic)
│   │   └── models/          # Esquemas de Base de Datos
│   ├── openapi.yaml         # Definición API Estandarizada
│   └── run.py               # Entry Point
│
├── frontend/
│   ├── js/
│   │   ├── controllers/     # Lógica de Interacción (Eventos)
│   │   ├── models/          # Clientes HTTP (Fetch Wrappers)
│   │   └── views/           # Componentes UI
│   └── css/                 # Estilos (Sass/CSS Modules)
```

---

<div align="center">
  <sub>Documentación generada tras análisis estático de código v1.2</sub>
</div>
