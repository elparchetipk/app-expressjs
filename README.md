# Sistema de Autenticación - Monorepo

Sistema completo de autenticación con API REST en Express.js y frontend en React, utilizando SQLite como base de datos.

## 📁 Estructura del Proyecto

```
proyecto-sena/
├── 📄 package.json          # Configuración del monorepo
├── 📄 README.md            # Documentación principal
├── 📄 RF_Sistema_Autenticacion.md  # Requerimientos funcionales
├── 📂 be/                  # Backend (Express.js)
│   ├── 📄 package.json
│   ├── 📄 .env
│   ├── 📂 config/
│   │   └── database.js     # Configuración SQLite
│   └── 📂 src/
│       ├── app.js          # Servidor principal
│       ├── 📂 controllers/ # Controladores
│       ├── 📂 models/      # Modelos de datos
│       ├── 📂 routes/      # Rutas de la API
│       ├── 📂 middleware/  # Middlewares
│       └── 📂 utils/       # Utilidades
└── 📂 fe/                  # Frontend (React + Vite)
    ├── 📄 package.json
    ├── 📂 public/
    └── 📂 src/
        ├── 📂 components/  # Componentes React
        ├── 📂 pages/       # Páginas
        ├── 📂 context/     # Context API
        ├── 📂 services/    # Servicios HTTP
        └── 📂 styles/      # Estilos CSS
```

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone <url-del-repo>
cd proyecto-sena
```

### 2. Instalar dependencias

```bash
# Instalar dependencias del monorepo y todos los workspaces
npm run install:all
```

### 3. Configurar variables de entorno

Copiar el archivo `.env.example` en `be/` y configurar:

```bash
cd be
cp .env.example .env
```

Variables de entorno requeridas:

```env
PORT=3001
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

## 🛠️ Scripts Disponibles

### Monorepo (raíz)

```bash
# Desarrollo - ejecutar backend y frontend simultáneamente
npm run dev

# Desarrollo individual
npm run dev:be    # Solo backend
npm run dev:fe    # Solo frontend

# Producción
npm run start:be  # Backend en producción
npm run build     # Build del frontend

# Instalar todas las dependencias
npm run install:all

# Ejecutar tests
npm test
```

### Backend (be/)

```bash
cd be
npm run dev       # Desarrollo con nodemon
npm start         # Producción
npm test          # Tests
```

### Frontend (fe/)

```bash
cd fe
npm run dev       # Servidor de desarrollo Vite
npm run build     # Build para producción
npm run preview   # Preview del build
```

## 📋 API Endpoints

### Autenticación

- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Login de usuario
- `POST /api/auth/logout` - Logout de usuario
- `GET /api/auth/profile` - Perfil del usuario (protegida)

### Utilidades

- `GET /api/health` - Health check del servidor

## 🗃️ Base de Datos

### Esquema de Usuario

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  nombres TEXT NOT NULL,
  apellidos TEXT NOT NULL,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🔐 Funcionalidades Implementadas

### RF-001: Registro de Usuario

- ✅ Validación de email único
- ✅ Validación de password seguro
- ✅ Encriptación de password con bcrypt
- ✅ Campos: email, nombres, apellidos, password

### RF-002: Login de Usuario

- ✅ Autenticación con email y password
- ✅ Generación de JWT token
- ✅ Tiempo de expiración configurable

### RF-003: Validación JWT

- ✅ Middleware de autenticación
- ✅ Protección de rutas privadas
- ✅ Validación de token y expiración

### RF-004: Logout

- ✅ Invalidación de token en cliente
- ✅ Limpieza de datos de sesión

### RF-005: Validaciones

- ✅ Validación de formato de email
- ✅ Validación de fortaleza de password
- ✅ Validación de nombres y apellidos
- ✅ Manejo de errores específicos

## 🌐 URLs de Desarrollo

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001
- **API Health**: http://localhost:3001/api/health
- **API Auth**: http://localhost:3001/api/auth

## 🧪 Testing

### Backend

```bash
cd be
npm test
```

### Frontend

```bash
cd fe
npm test
```

## 📦 Tecnologías

### Backend

- **Express.js** - Framework web
- **SQLite3** - Base de datos
- **bcryptjs** - Encriptación de passwords
- **jsonwebtoken** - Manejo de JWT
- **express-validator** - Validación de datos
- **cors** - Manejo de CORS
- **dotenv** - Variables de entorno

### Frontend

- **React 18** - Framework de UI
- **Vite** - Build tool y dev server
- **React Router** - Enrutamiento
- **Axios** - Cliente HTTP
- **Context API** - Manejo de estado

### DevOps

- **Concurrently** - Ejecutar scripts paralelos
- **Nodemon** - Auto-restart del servidor
- **Vitest** - Testing framework

## 🚀 Deployment

### Backend

1. Configurar variables de entorno de producción
2. Instalar dependencias: `npm install --production`
3. Ejecutar: `npm start`

### Frontend

1. Build: `npm run build`
2. Servir archivos estáticos desde `dist/`

## 📝 Requerimientos Funcionales

Consulta el archivo `RF_Sistema_Autenticacion.md` para ver los requerimientos funcionales completos y detallados.

## 🤝 Contribución

1. Fork del proyecto
2. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -m 'Agregar nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT - ver el archivo LICENSE para más detalles.
