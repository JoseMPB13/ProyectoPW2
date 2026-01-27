# 🚗 Sistema de Gestión de Taller Automotriz

Sistema web completo para la gestión integral de un taller automotriz, incluyendo administración de clientes, órdenes de servicio, inventario, pagos, técnicos y reportes analíticos.

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Arquitectura](#-arquitectura)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [API Endpoints](#-api-endpoints)
- [Base de Datos](#-base-de-datos)
- [Roles y Permisos](#-roles-y-permisos)

## ✨ Características

### Gestión de Usuarios

- ✅ Sistema de autenticación con JWT
- ✅ Roles diferenciados (Admin, Técnico, Recepcionista)
- ✅ Gestión completa de usuarios (CRUD)
- ✅ Permisos basados en roles

### Gestión de Clientes

- ✅ Registro completo de clientes
- ✅ Historial de vehículos por cliente
- ✅ Búsqueda y filtrado avanzado

### Órdenes de Servicio

- ✅ Creación y seguimiento de órdenes
- ✅ Estados: Pendiente, En Proceso, Completada, Cancelada
- ✅ Asignación de técnicos
- ✅ Gestión de servicios por orden
- ✅ Cálculo automático de totales

### Inventario

- ✅ Control de repuestos y materiales
- ✅ Alertas de stock bajo
- ✅ Historial de movimientos

### Pagos

- ✅ Registro de pagos parciales y totales
- ✅ Múltiples métodos de pago
- ✅ Reportes de ingresos

### Reportes y Dashboard

- ✅ Dashboard analítico con métricas clave
- ✅ Gráficos de ingresos mensuales
- ✅ Estadísticas de órdenes
- ✅ Análisis de inventario

### Asistente IA

- ✅ Chat flotante con asistente virtual
- ✅ Ayuda contextual
- ✅ Respuestas automatizadas

## 🛠 Tecnologías

### Backend

- **Python 3.8+**
- **Flask** - Framework web
- **Flask-SQLAlchemy** - ORM para base de datos
- **Flask-JWT-Extended** - Autenticación JWT
- **Flask-CORS** - Manejo de CORS
- **PostgreSQL** - Base de datos (Supabase)
- **psycopg2** - Driver de PostgreSQL

### Frontend

- **HTML5** - Estructura
- **CSS3** - Estilos
- **JavaScript (ES6+)** - Lógica del cliente
- **Arquitectura MVC** - Patrón de diseño
- **Fetch API** - Comunicación con backend
- **Lucide Icons** - Iconografía

### Infraestructura

- **Supabase** - Base de datos PostgreSQL en la nube
- **Vite** - Servidor de desarrollo (frontend)

## 🏗 Arquitectura

### Backend (Flask)

```
Arquitectura en Capas:
┌─────────────────────────────────┐
│   Routes (Controladores)        │  ← Endpoints HTTP
├─────────────────────────────────┤
│   Services (Lógica de Negocio)  │  ← Validaciones y reglas
├─────────────────────────────────┤
│   Models (SQLAlchemy)           │  ← Modelos de datos
├─────────────────────────────────┤
│   Database (PostgreSQL)         │  ← Persistencia
└─────────────────────────────────┘
```

### Frontend (Vanilla JS)

```
Patrón MVC:
┌─────────────────────────────────┐
│   Views (HTML/CSS)              │  ← Interfaz de usuario
├─────────────────────────────────┤
│   Controllers (JS)              │  ← Lógica de presentación
├─────────────────────────────────┤
│   Models (JS)                   │  ← Comunicación con API
├─────────────────────────────────┤
│   API Service                   │  ← Fetch requests
└─────────────────────────────────┘
```

## 📦 Requisitos Previos

- **Python 3.8 o superior**
- **Node.js 14 o superior** (para el servidor de desarrollo)
- **PostgreSQL** (o cuenta de Supabase)
- **Git** (opcional)

## 🚀 Instalación

### 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd proyecto2
```

### 2. Configurar el Backend

```bash
# Navegar a la carpeta backend
cd backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# En Windows:
.\venv\Scripts\activate
# En Linux/Mac:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt
```

### 3. Configurar el Frontend

```bash
# Navegar a la carpeta frontend
cd frontend

# Instalar dependencias
npm install
```

## ⚙️ Configuración

### Backend - Archivo `.env`

Crear un archivo `.env` en la carpeta `backend/` con las siguientes variables:

```env
# Base de Datos (Supabase)
SQLALCHEMY_DATABASE_URI=postgresql+psycopg2://usuario:password@host:puerto/database?prepared_statements=false

# Claves de Seguridad
SECRET_KEY=tu-clave-secreta-super-segura
JWT_SECRET_KEY=tu-clave-jwt-super-segura
```

**Ejemplo con Supabase:**

```env
SQLALCHEMY_DATABASE_URI=postgresql+psycopg2://postgres.xxxxx:password@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?prepared_statements=false
SECRET_KEY=super-secret-key-cambiar-en-produccion
JWT_SECRET_KEY=jwt-secret-key-cambiar-en-produccion
```

### Frontend - Configuración de API

El frontend está configurado para conectarse a `http://127.0.0.1:5000` por defecto.

Para cambiar la URL del API, editar `frontend/js/utils/api.js`:

```javascript
const API_BASE_URL = "http://127.0.0.1:5000";
```

## 🎯 Uso

### Iniciar el Backend

```bash
cd backend
.\venv\Scripts\activate  # Windows
python run.py
```

El servidor estará disponible en: `http://127.0.0.1:5000`

### Iniciar el Frontend

```bash
cd frontend
npm run dev
```

El frontend estará disponible en: `http://localhost:3000`

### Acceso al Sistema

1. Abrir el navegador en `http://localhost:3000`
2. Usar las credenciales por defecto (si se creó un usuario admin):
   - **Usuario:** admin@taller.com
   - **Contraseña:** admin123

## 📁 Estructura del Proyecto

```
proyecto2/
├── backend/                      # Backend Flask
│   ├── app/
│   │   ├── __init__.py          # Inicialización de Flask y CORS
│   │   ├── models.py            # Modelos SQLAlchemy
│   │   ├── config/
│   │   │   └── config.py        # Configuración de la app
│   │   ├── routes/              # Endpoints HTTP
│   │   │   ├── auth.py          # Autenticación y usuarios
│   │   │   ├── clients.py       # Gestión de clientes
│   │   │   ├── orders.py        # Órdenes de servicio
│   │   │   ├── payments.py      # Pagos
│   │   │   ├── services.py      # Servicios del taller
│   │   │   ├── inventory.py     # Inventario
│   │   │   ├── reports.py       # Reportes y métricas
│   │   │   ├── ai.py            # Asistente IA
│   │   │   └── health.py        # Health check
│   │   └── services/            # Lógica de negocio
│   │       ├── auth_service.py
│   │       ├── client_service.py
│   │       ├── order_service.py
│   │       └── report_service.py
│   ├── venv/                    # Entorno virtual
│   ├── .env                     # Variables de entorno
│   ├── .gitignore
│   ├── requirements.txt         # Dependencias Python
│   └── run.py                   # Punto de entrada
│
├── frontend/                    # Frontend Vanilla JS
│   ├── css/
│   │   └── styles.css           # Estilos personalizados
│   ├── js/
│   │   ├── app.js               # Aplicación principal
│   │   ├── controllers/         # Controladores MVC
│   │   │   ├── DashboardController.js
│   │   │   ├── ClientsController.js
│   │   │   ├── OrdersController.js
│   │   │   ├── PaymentsController.js
│   │   │   ├── InventoryController.js
│   │   │   └── UsersController.js
│   │   ├── models/              # Modelos MVC
│   │   │   ├── DashboardModel.js
│   │   │   ├── ClientModel.js
│   │   │   ├── OrderModel.js
│   │   │   └── ...
│   │   ├── views/               # Vistas MVC
│   │   │   ├── DashboardView.js
│   │   │   ├── ClientsView.js
│   │   │   └── ...
│   │   └── utils/
│   │       └── api.js           # Cliente HTTP
│   ├── index.html               # Página de login
│   └── package.json
│
├── .gitignore
└── README.md                    # Este archivo
```

## 🔌 API Endpoints

### Autenticación

- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registrar usuario
- `GET /auth/users` - Listar usuarios (Admin)
- `PUT /auth/users/<id>` - Actualizar usuario (Admin)
- `DELETE /auth/users/<id>` - Eliminar usuario (Admin)

### Clientes

- `GET /clients` - Listar clientes
- `POST /clients` - Crear cliente
- `GET /clients/<id>` - Obtener cliente
- `PUT /clients/<id>` - Actualizar cliente
- `DELETE /clients/<id>` - Eliminar cliente

### Órdenes de Servicio

- `GET /orders` - Listar órdenes
- `POST /orders` - Crear orden
- `GET /orders/<id>` - Obtener orden
- `PUT /orders/<id>` - Actualizar orden
- `DELETE /orders/<id>` - Eliminar orden
- `PUT /orders/<id>/status` - Cambiar estado

### Pagos

- `GET /payments` - Listar pagos
- `POST /payments` - Registrar pago
- `GET /payments/revenue` - Obtener ingresos

### Inventario

- `GET /inventory` - Listar items
- `POST /inventory` - Crear item
- `PUT /inventory/<id>` - Actualizar item
- `DELETE /inventory/<id>` - Eliminar item

### Servicios

- `GET /services` - Listar servicios
- `POST /services` - Crear servicio
- `PUT /services/<id>` - Actualizar servicio
- `DELETE /services/<id>` - Eliminar servicio

### Reportes

- `GET /reports/dashboard` - Métricas del dashboard (Admin)

### Health Check

- `GET /health` - Estado del servidor

## 🗄 Base de Datos

### Modelos Principales

#### Usuario

- id, nombre, email, password_hash, rol_id, activo, fecha_creacion

#### Cliente

- id, nombre, apellido, telefono, email, direccion, fecha_registro

#### Vehiculo

- id, cliente_id, marca, modelo, año, placa, vin

#### OrdenServicio

- id, vehiculo_id, tecnico_id, fecha_ingreso, fecha_estimada, estado, total

#### Pago

- id, orden_id, monto, metodo_pago, fecha_pago

#### ItemInventario

- id, nombre, descripcion, cantidad, precio_unitario, stock_minimo

### Relaciones

- Cliente → Vehículos (1:N)
- Vehículo → Órdenes (1:N)
- Orden → Pagos (1:N)
- Orden → Servicios (N:N)
- Usuario → Órdenes como técnico (1:N)

## 👥 Roles y Permisos

### Admin

- ✅ Acceso completo al sistema
- ✅ Gestión de usuarios
- ✅ Visualización de reportes
- ✅ Todas las operaciones CRUD

### Técnico

- ✅ Ver órdenes asignadas
- ✅ Actualizar estado de órdenes
- ✅ Gestionar inventario
- ❌ No puede gestionar usuarios

### Recepcionista

- ✅ Gestionar clientes
- ✅ Crear órdenes de servicio
- ✅ Registrar pagos
- ❌ No puede ver reportes financieros
- ❌ No puede gestionar usuarios

## 🔒 Seguridad

- **Autenticación JWT**: Tokens seguros con expiración
- **Hashing de contraseñas**: Bcrypt para almacenamiento seguro
- **CORS configurado**: Solo orígenes permitidos
- **Validación de entrada**: En backend y frontend
- **Roles y permisos**: Control de acceso basado en roles

## 🐛 Troubleshooting

### Error de conexión a la base de datos

```
psycopg2.ProgrammingError: invalid dsn
```

**Solución**: Verificar que la cadena de conexión en `.env` no tenga parámetros inválidos como `pgbouncer=true`.

### Error de CORS

```
Access to fetch has been blocked by CORS policy
```

**Solución**: Verificar que el backend esté corriendo y que CORS esté configurado en `app/__init__.py`.

### Puerto ocupado

```
Address already in use
```

**Solución**: Cambiar el puerto en `run.py` o matar el proceso que está usando el puerto.

## 📝 Licencia

Este proyecto es privado y de uso interno.

## 👨‍💻 Autor

Desarrollado para la gestión de talleres automotrices.

---

**Última actualización:** Enero 2026
