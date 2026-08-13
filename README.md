# Trabajo-Final-Cloud · Sistema de Notificaciones

## Descripción

Este proyecto es un **sistema de notificaciones** desarrollado como Trabajo Final de la materia de Cloud Computing. Permite a un usuario registrar destinatarios y grupos, redactar y enviar mensajes (incluyendo archivos adjuntos), programar recordatorios de envío automático y recibir/leer correos entrantes mediante la integración con Gmail (Google APIs).

La aplicación está compuesta por:

- **Backend** (`backend_sistema_notificaciones`): API REST construida con Node.js y Express, que gestiona usuarios, cuentas, grupos, destinatarios, mensajes, archivos y recordatorios, persistiendo la información en una base de datos MySQL/MariaDB a través de Sequelize.
- **Frontend** (`frontend-sistema-notificaciones`): interfaz web construida con Next.js (React) para la gestión visual del sistema.

El proyecto incluye además pipelines de **Azure DevOps** (`azure-pipelines.yml` y `azure-pipelines-containers.yml`) para desplegar la aplicación tanto en **Azure App Service** como en **Azure Container Apps** mediante contenedores Docker.

## Funcionalidades principales

- Autenticación de cuentas mediante JWT (`token-api`).
- Gestión de usuarios, grupos y destinatarios.
- Envío de mensajes con adjuntos, integrado con Azure Logic Apps para el despacho de notificaciones.
- Recepción y lectura de mensajes entrantes vía Gmail API (OAuth2).
- Programación de recordatorios con ejecución automática (`node-schedule`).
- Envío de correos electrónicos mediante Nodemailer / Resend.
- Almacenamiento de archivos adjuntos (local y/o Azure Blob Storage).

## Tecnologías

**Backend**
- Node.js 20 + Express
- Sequelize (MySQL / MariaDB)
- JSON Web Token (JWT) para autenticación
- Google APIs (Gmail OAuth2)
- Node-schedule (tareas programadas)
- Nodemailer / Resend (envío de correos)
- Azure Storage Blob SDK

**Frontend**
- Next.js 15 + React 19
- Bootstrap / React-Bootstrap
- React Hook Form + Yup
- Chart.js
- CodeMirror, React PDF Viewer

**Infraestructura**
- Docker
- Azure DevOps Pipelines
- Azure App Service / Azure Container Apps
- Azure Container Registry (ACR)

## Estructura del repositorio

```
Trabajo-Final-Cloud/
├── backend_sistema_notificaciones/   # API REST (Node.js + Express + Sequelize)
├── frontend-sistema-notificaciones/  # Interfaz web (Next.js)
├── azure-pipelines.yml               # Pipeline de despliegue a Azure Web App
├── azure-pipelines-containers.yml    # Pipeline de despliegue con Docker/ACR/Container Apps
└── .github/workflows/                # Workflows de GitHub Actions
```

## Despliegue manual

### Requisitos

- Node.js 20.x
- npm
- Git
- Una base de datos MySQL/MariaDB accesible

### 1. Clonar el repositorio

```bash
git clone https://github.com/luisNarvaez20/Trabajo-Final-Cloud.git
cd Trabajo-Final-Cloud
```

### 2. Configurar y ejecutar el backend

```bash
cd backend_sistema_notificaciones
npm install
```

Crear un archivo `.env` dentro de `backend_sistema_notificaciones` con las siguientes variables:

```env
# Base de datos
DB_USERNAME=usuario_db
DB_PASSWORD=clave_db
DB_DATABASE=nombre_db
DB_HOST=host_db
DB_PORT=3306
DB_DIALECT=mysql
DB_OPERATOR_ALIASES=false

# Entorno
NODE_ENV=development
PORT=8000

# Autenticación
KEY_SQ=clave_secreta_para_jwt

# Azure Logic Apps (envío de notificaciones)
LOGIC_APPS_URL=url_logic_app_en_base64

# Integración con Gmail API
SCOPES=https://www.googleapis.com/auth/gmail.readonly
TOKEN_PATH=token_oauth_en_base64
CREDENTIALS_PATH=credenciales_oauth_en_base64
```

Iniciar el servidor:

```bash
npm start
```

El backend se ejecutará por defecto en el puerto `8000` (definido en el `Dockerfile`, configurable con `PORT`).

### 3. Configurar y ejecutar el frontend

En una nueva terminal:

```bash
cd frontend-sistema-notificaciones
npm install
```

Crear un archivo `.env.local` dentro de `frontend-sistema-notificaciones`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Iniciar la aplicación:

```bash
npm run dev
```

El frontend se ejecutará por defecto en `http://localhost:3000`.

## Despliegue con Docker

### Requisitos

- Docker

### Backend

```bash
cd backend_sistema_notificaciones
docker build -t backend-notificaciones \
  --build-arg DB_USERNAME=usuario_db \
  --build-arg DB_PASSWORD=clave_db \
  --build-arg DB_DATABASE=nombre_db \
  --build-arg DB_HOST=host_db \
  --build-arg DB_PORT=3306 \
  --build-arg DB_DIALECT=mysql \
  --build-arg DB_OPERATOR_ALIASES=false \
  --build-arg NODE_ENV=production \
  --build-arg KEY_SQ=clave_secreta_para_jwt \
  --build-arg LOGIC_APPS_URL=url_logic_app_en_base64 \
  --build-arg CREDENTIALS_PATH=credenciales_oauth_en_base64 \
  --build-arg TOKEN_PATH=token_oauth_en_base64 \
  --build-arg SCOPES=https://www.googleapis.com/auth/gmail.readonly \
  .

docker run -p 8000:8000 backend-notificaciones
```

### Frontend

```bash
cd frontend-sistema-notificaciones
docker build -t frontend-notificaciones \
  --build-arg NEXT_PUBLIC_API_URL=http://localhost:8000 \
  .

docker run -p 3000:3000 frontend-notificaciones
```

> El frontend incluye también un `nginx.conf`, por lo que puede servirse detrás de un proxy Nginx si se requiere en producción.

## Despliegue en Azure (CI/CD)

El repositorio incluye dos pipelines de Azure DevOps:

- **`azure-pipelines.yml`**: compila e instala dependencias de backend y frontend, genera artefactos `.zip` y los despliega directamente en **Azure App Service (Web App for Linux)** usando Node 20.
- **`azure-pipelines-containers.yml`**: construye las imágenes Docker de backend y frontend, las publica en **Azure Container Registry (ACR)** y las despliega en **Azure Container Apps**.

Ambos pipelines requieren configurar en Azure DevOps las variables de entorno/secretos correspondientes (credenciales de base de datos, `KEY_SQ`, `LOGIC_APPS_URL`, credenciales de Gmail API, credenciales del ACR, etc.).

## Notas adicionales

- El backend expone su API bajo el prefijo definido en `routes/users.js` (cuentas, personas, grupos, destinatarios, mensajes y recordatorios), protegida mediante un middleware que valida el header `token-api`.
- Los recordatorios se procesan mediante un job programado (`node-schedule`) que revisa periódicamente la base de datos y dispara el envío de mensajes a través de Azure Logic Apps.
- Antes de ejecutar el proyecto es necesario contar con credenciales válidas de OAuth2 de Google (para la recepción de correos) y con un flujo configurado en Azure Logic Apps (para el envío de notificaciones).
- Asegúrate de que los puertos utilizados por el backend (`8000`) y el frontend (`3000`) estén disponibles.
