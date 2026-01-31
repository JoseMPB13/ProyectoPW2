# 🚗 Sistema de Gestión de Taller Automotriz

![Estado del Proyecto](https://img.shields.io/badge/Estado-Activo-success)
![Versión](https://img.shields.io/badge/Versión-1.0.0-blue)
![Licencia](https://img.shields.io/badge/Licencia-Privada-red)

Sistema web profesional para la gestión integral de talleres automotrices. Diseñado para optimizar el flujo de trabajo, desde la recepción del vehículo hasta la entrega y facturación, proporcionando herramientas analíticas para la toma de decisiones.

> **📘 Documentación:** Para una guía detallada de uso, consulte el [Manual de Usuario](MANUAL_DE_USUARIO.md).

## 📋 Tabla de Contenidos

- [Características Principales](#-características-principales)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [Arquitectura del Sistema](#-arquitectura-del-sistema)
- [Instalación y Despliegue](#-instalación-y-despliegue)
- [Configuración](#-configuración)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [API Endpoints](#-api-endpoints)

---

## ✨ Características Principales

### 👥 Gestión de Usuarios y Roles

- **Autenticación Segura:** Login protegido con JWT.
- **Control de Acceso (RBAC):** Roles definidos para Administradores, Técnicos y Recepcionistas.
- **Auditoría:** Registro de acciones por usuario.

### 🚘 Taller y Clientes

- **Expedientes de Clientes:** Historial completo de reparaciones y vehículos asociados.
- **Flujo de Órdenes:** Seguimiento de estados (Pendiente → En Diagnóstico → En Proceso → Terminado).
- **Asignación Inteligente:** Distribución de carga de trabajo a técnicos disponibles.

### 📦 Inventario y Facturación

- **Control de Stock:** Deducción automática de repuestos utilizados en órdenes.
- **Alertas de Stock:** Notificaciones de bajo inventario.
- **Pagos Flexibles:** Soporte para múltiples métodos de pago y pagos parciales.

### 📊 Inteligencia de Negocios

- **Dashboard en Tiempo Real:** KPIs de ingresos, órdenes activas y productividad.
- **Asistente IA:** Chatbot integrado para consultas rápidas sobre el sistema.

---

## 🛠 Tecnologías Utilizadas

### Backend

- **Python 3.8+**
- **Flask:** Microframework robusto y ligero.
- **SQLAlchemy:** ORM para manejo eficiente de base de datos.
- **PostgreSQL:** Base de datos relacional de alto rendimiento (vía Supabase).

### Frontend

- **Vanilla JavaScript (ES6+):** Rendimiento nativo sin overhead de frameworks pesados.
- **CSS3 Moderno:** Diseño responsivo y profesional.
- **Arquitectura MVC:** Separación clara de responsabilidades en el cliente.

---

## 🏗 Arquitectura del Sistema

El sistema sigue una arquitectura cliente-servidor desacoplada:

```mermaid
graph LR
    A[Frontend (SPA)] -- JSON/REST --> B[Backend API (Flask)]
    B -- SQL --> C[(PostgreSQL DB)]
    B -- Auth --> D[JWT Service]
```

---

## 🚀 Instalación y Despliegue

### Requisitos Previos

- **Python 3.8+**
- **Node.js 14+**
- **Git**

### 1. Configuración del Backend

```bash
# Navegar al directorio del backend
cd backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# Windows:
.\venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instalar dependencias exactas
pip install -r requirements.txt

# Iniciar servidor
python run.py
```

### 2. Configuración del Frontend

```bash
# Navegar al directorio del frontend
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El sistema estará accesible en: `http://localhost:3000`

---

## ⚙️ Configuración

### Variables de Entorno (`backend/.env`)

Cree un archivo `.env` en la raíz de `backend/` con la siguiente configuración:

```env
# Base de Datos
SQLALCHEMY_DATABASE_URI=postgresql+psycopg2://usuario:password@host:port/dbname

# Seguridad
SECRET_KEY=clave-secreta-larga-y-aleatoria
JWT_SECRET_KEY=clave-jwt-super-segura
```

---

## 📁 Estructura del Proyecto

```
proyecto2/
├── backend/                  # API RESTful en Flask
│   ├── app/
│   │   ├── routes/          # Endpoints de la API
│   │   ├── models/          # Modelos de base de datos
│   │   └── services/        # Lógica de negocio
│   └── requirements.txt     # Dependencias del servidor
│
├── frontend/                 # Cliente Web
│   ├── js/
│   │   ├── controllers/     # Lógica de interacción
│   │   ├── views/           # Renderizado de UI
│   │   └── models/          # Gestión de datos
│   └── css/                 # Estilos globales
│
└── MANUAL_DE_USUARIO.md      # Guía detallada de uso
```

---

## 🔌 API Endpoints Principales

| Método | Endpoint             | Descripción                    | Acceso  |
| :----- | :------------------- | :----------------------------- | :------ |
| `POST` | `/auth/login`        | Iniciar sesión y obtener token | Público |
| `GET`  | `/orders`            | Listar órdenes de servicio     | Auth    |
| `POST` | `/orders`            | Crear nueva orden              | Auth    |
| `GET`  | `/clients`           | Buscar clientes                | Auth    |
| `GET`  | `/inventory`         | Consultar stock                | Auth    |
| `GET`  | `/reports/dashboard` | Obtener métricas               | Admin   |

---

<div align="center">
  <p>Desarrollado con ❤️ para la eficiencia de su taller.</p>
</div>
