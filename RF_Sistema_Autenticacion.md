# Requerimientos Funcionales - Sistema de Autenticación

**Proyecto**: API REST (Express.js / Flask / FastAPI) + Frontend React(vite) tailwindcss - Monorepo  
**Base de Datos**: SQLite  
**Fecha**: 4 de septiembre de 2025  
**Funcionalidad**: Login y Registro de Usuarios  
**Compatibilidad**: Genérico para implementación en Express.js, Flask y FastAPI  
**Backend**: En la carpeta `be`  
**Frontend**: En la carpeta `fe`  
**Gestor de paquetes**: Siempre usar **pnpm**  
**🎓 Propósito Educativo**: Este proyecto está diseñado como herramienta de aprendizaje con documentación exhaustiva y comentarios explicativos en el código

---

## RF-001: Registro de Usuario

- **ID**: RF-001
- **Nombre**: Registro de nuevo usuario
- **Descripción**: El sistema debe permitir el registro de nuevos usuarios en la aplicación
- **Actor**: Usuario no registrado
- **Prioridad**: Alta
- **Precondiciones**:
  - El usuario no debe estar registrado previamente
  - La aplicación debe estar funcionando

### Entradas

- **Email** (obligatorio)
  - Formato válido de email
  - Único en el sistema
- **Nombres** (obligatorio)
  - Texto libre, máximo 100 caracteres
  - Solo letras y espacios
- **Apellidos** (obligatorio)
  - Texto libre, máximo 100 caracteres
  - Solo letras y espacios
- **Password** (obligatorio)
  - Mínimo 8 caracteres
  - Al menos 1 mayúscula
  - Al menos 1 minúscula
  - Al menos 1 número

### Proceso

1. Validar formato de email
2. Verificar que el email no exista en la BD
3. Validar fortaleza del password según criterios
4. Encriptar password usando bcrypt
5. Guardar usuario en BD SQLite
6. Generar respuesta de éxito

### Salidas

- **Éxito (201)**:
  ```json
  {
    "success": true,
    "message": "Usuario registrado exitosamente",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "nombres": "Juan Carlos",
      "apellidos": "García López"
    }
  }
  ```
- **Error (400/409)**:
  ```json
  {
    "success": false,
    "message": "Error específico",
    "errors": ["Lista de errores de validación"]
  }
  ```

### Postcondiciones

- Usuario creado en la base de datos
- Password encriptado almacenado

---

## RF-002: Autenticación de Usuario (Login)

- **ID**: RF-002
- **Nombre**: Inicio de sesión de usuario
- **Descripción**: El sistema debe permitir la autenticación de usuarios registrados
- **Actor**: Usuario registrado
- **Prioridad**: Alta
- **Precondiciones**:
  - Usuario debe estar registrado en el sistema
  - Credenciales válidas

### Entradas

- **Email** (obligatorio)
  - Formato válido de email
- **Password** (obligatorio)
  - Texto plano para verificación

### Proceso

1. Verificar existencia del usuario por email
2. Comparar password con hash almacenado usando bcrypt
3. Generar JWT token con tiempo de expiración (24h)
4. Incluir información del usuario en el payload
5. Retornar token y datos del usuario

### Salidas

- **Éxito (200)**:
  ```json
  {
    "success": true,
    "message": "Login exitoso",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "nombres": "Juan Carlos",
      "apellidos": "García López"
    }
  }
  ```
- **Error (401)**:
  ```json
  {
    "success": false,
    "message": "Credenciales inválidas"
  }
  ```

### Postcondiciones

- Usuario autenticado con sesión activa
- Token JWT generado y válido

---

## RF-003: Validación de Token JWT

- **ID**: RF-003
- **Nombre**: Verificación de autenticación
- **Descripción**: El sistema debe validar tokens JWT para proteger rutas
- **Actor**: Usuario autenticado
- **Prioridad**: Alta
- **Precondiciones**:
  - Usuario debe tener un token JWT válido
  - Token debe enviarse en header Authorization

### Entradas

- **JWT Token**
  - Formato: `Bearer <token>`
  - En header `Authorization`

### Proceso

1. Extraer token del header Authorization
2. Verificar formato Bearer
3. Verificar validez y firma del token
4. Verificar tiempo de expiración
5. Extraer información del usuario del payload
6. Adjuntar datos del usuario a la request

### Salidas

- **Éxito**: Acceso autorizado a la ruta protegida
- **Error (401)**:
  ```json
  {
    "success": false,
    "message": "Token inválido o expirado"
  }
  ```

### Postcondiciones

- Acceso controlado a recursos protegidos
- Usuario identificado en rutas protegidas

---

## RF-004: Cierre de Sesión

- **ID**: RF-004
- **Nombre**: Logout de usuario
- **Descripción**: El sistema debe permitir cerrar la sesión del usuario
- **Actor**: Usuario autenticado
- **Prioridad**: Media
- **Precondiciones**: Usuario debe estar autenticado

### Entradas

- **JWT Token** (para referencia)

### Proceso

1. Invalidar token en el cliente (remover del localStorage)
2. Limpiar datos de sesión en el frontend
3. Redireccionar a página de login

### Salidas

- **Éxito (200)**:
  ```json
  {
    "success": true,
    "message": "Logout exitoso"
  }
  ```

### Postcondiciones

- Usuario sin sesión activa
- Token removido del cliente

---

## RF-005: Validación de Datos de Entrada

- **ID**: RF-005
- **Nombre**: Validación de formularios
- **Descripción**: El sistema debe validar todos los datos de entrada antes del procesamiento
- **Actor**: Sistema
- **Prioridad**: Alta
- **Precondiciones**: Recepción de datos del cliente

### Validaciones

#### Email

- Formato válido según RFC 5322
- Único en el sistema (solo para registro)
- Campo obligatorio

#### Password

- Mínimo 8 caracteres
- Al menos 1 letra mayúscula
- Al menos 1 letra minúscula
- Al menos 1 número
- Sin espacios en blanco

#### Nombres y Apellidos

- Solo letras y espacios
- Mínimo 2 caracteres
- Máximo 100 caracteres
- Campos obligatorios

#### Campos Generales

- Campos obligatorios no vacíos
- Longitud máxima según especificación
- Caracteres válidos

### Salidas

- **Error de validación (400)**:
  ```json
  {
    "success": false,
    "message": "Errores de validación",
    "errors": [
      "El email no tiene un formato válido",
      "El password debe tener al menos 8 caracteres"
    ]
  }
  ```

### Postcondiciones

- Datos validados antes del procesamiento
- Errores específicos reportados al cliente

---

## RF-006: Documentación Educativa

- **ID**: RF-006
- **Nombre**: Código educativo y documentado
- **Descripción**: Todo el código debe incluir comentarios explicativos para facilitar el aprendizaje
- **Actor**: Desarrollador/Estudiante
- **Prioridad**: Alta
- **Precondiciones**: Implementación de funcionalidades

### Requerimientos de Documentación

#### Comentarios en el Código

- Explicar **qué** hace cada función/método
- Explicar **por qué** se eligió una tecnología específica
- Explicar **cómo** funciona la lógica compleja
- Incluir ejemplos de uso cuando sea necesario

#### Estructura de Comentarios

- Comentarios de bloque para funciones principales
- Comentarios inline para lógica específica
- Documentación JSDoc para funciones exportadas
- README detallado en cada módulo

#### Tecnologías Educativas

- Justificar elección de cada dependencia
- Explicar patrones de diseño utilizados
- Documentar mejores prácticas implementadas
- Incluir recursos de aprendizaje adicionales

### Salidas

- Código completamente documentado
- Guías de aprendizaje integradas
- Explicaciones de decisiones técnicas

### Postcondiciones

- Estudiantes pueden entender el código sin ayuda externa
- Código sirve como material de referencia
- Facilita el mantenimiento y extensión del proyecto

---

## Especificaciones Técnicas

### Base de Datos (SQLite)

#### Tabla: users

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

### API Endpoints

- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Login de usuario
- `POST /api/auth/logout` - Logout de usuario
- `GET /api/auth/profile` - Perfil del usuario (protegida)

### Tecnologías Compatibles

Estos RF's son genéricos y pueden implementarse en múltiples frameworks:

#### Backend - Express.js

- **Express.js** - Framework web
- **SQLite3** - Base de datos
- **bcryptjs** - Encriptación de passwords
- **jsonwebtoken** - Manejo de JWT tokens
- **express-validator** - Validación de datos

#### Backend - Flask

- **Flask** - Framework web
- **SQLite3** - Base de datos
- **bcrypt** - Encriptación de passwords
- **PyJWT** - Manejo de JWT tokens
- **Flask-WTF** o **marshmallow** - Validación de datos

#### Backend - FastAPI

- **FastAPI** - Framework web
- **SQLite3** con **SQLAlchemy** - ORM y base de datos
- **passlib** con **bcrypt** - Encriptación de passwords
- **python-jose** - Manejo de JWT tokens
- **Pydantic** - Validación de datos

#### Frontend

- **React** - Framework de UI
- **Axios** - Cliente HTTP
- **React Router** - Enrutamiento
- **Context API** - Manejo de estado global

### Códigos de Estado HTTP

- `200` - OK (Login exitoso, logout, perfil)
- `201` - Created (Usuario registrado)
- `400` - Bad Request (Errores de validación)
- `401` - Unauthorized (Credenciales inválidas, token inválido)
- `409` - Conflict (Email ya existe)
- `500` - Internal Server Error (Errores del servidor)

---

## Casos de Uso Adicionales

### Flujo de Registro

1. Usuario accede a página de registro
2. Completa formulario (email, nombres, apellidos, password)
3. Frontend valida datos básicos
4. Envía datos a API
5. API valida y crea usuario
6. Retorna confirmación
7. Usuario es redirigido a login

### Flujo de Login

1. Usuario accede a página de login
2. Ingresa email y password
3. Frontend envía credenciales a API
4. API valida credenciales
5. Genera y retorna JWT token
6. Frontend guarda token en localStorage
7. Usuario es redirigido a dashboard/home

### Flujo de Acceso a Rutas Protegidas

1. Usuario intenta acceder a ruta protegida
2. Frontend verifica token en localStorage
3. Incluye token en header Authorization
4. API valida token
5. Si es válido, permite acceso
6. Si no es válido, retorna 401 y redirige a login
