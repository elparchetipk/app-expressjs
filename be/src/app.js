// src/app.js - Servidor principal de Express.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const { initDatabase } = require('./config/database');

/**
 * CONFIGURACIÓN DE VARIABLES DE ENTORNO
 *
 * dotenv.config() carga las variables del archivo .env
 * y las hace disponibles en process.env
 *
 * ¿Por qué usar variables de entorno?
 * - Separar configuración del código
 * - Diferentes valores para desarrollo/producción
 * - Mantener secretos fuera del código fuente
 * - Facilitar deployment en diferentes ambientes
 */
dotenv.config();

/**
 * CREACIÓN DE LA APLICACIÓN EXPRESS
 *
 * express() crea una instancia de la aplicación Express
 * que será nuestro servidor web.
 */
const app = express();
const PORT = process.env.PORT || 3001; // Puerto del servidor, 3001 por defecto

/**
 * CONFIGURACIÓN DE MIDDLEWARES
 *
 * Los middlewares son funciones que se ejecutan en cada request
 * antes de llegar a las rutas. Se ejecutan en el orden definido.
 */

/**
 * MIDDLEWARE CORS (Cross-Origin Resource Sharing)
 *
 * ¿Qué problema resuelve CORS?
 * - Los navegadores bloquean requests entre diferentes dominios por seguridad
 * - Nuestro frontend (localhost:5173) necesita acceder al backend (localhost:3001)
 * - Sin CORS, obtendrías errores de "blocked by CORS policy"
 *
 * Configuración:
 * - origin: dominios permitidos para hacer requests
 * - credentials: permite envío de cookies/tokens
 */
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

/**
 * MIDDLEWARE PARA PARSEAR JSON
 *
 * express.json() permite que Express entienda el contenido JSON
 * de los requests POST/PUT/PATCH
 *
 * Sin este middleware:
 * - req.body sería undefined
 * - No podrías recibir datos JSON del frontend
 */
app.use(express.json());

/**
 * MIDDLEWARE PARA PARSEAR URL-ENCODED
 *
 * express.urlencoded() permite parsear datos de formularios
 * Extended: true permite objetos anidados y arrays
 */
app.use(express.urlencoded({ extended: true }));

/**
 * CONFIGURACIÓN DE RUTAS
 *
 * Todas las rutas que empiecen con /api/auth
 * serán manejadas por authRoutes
 */
app.use('/api/auth', authRoutes);

/**
 * RUTA DE HEALTH CHECK
 *
 * Endpoint útil para:
 * - Verificar que el servidor está funcionando
 * - Monitoring y alertas en producción
 * - Debugging durante desarrollo
 */
app.get('/api/health', (req, res) => {
  res.json({
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
    status: 'OK',
  });
});

/**
 * MIDDLEWARE PARA RUTAS NO ENCONTRADAS (404)
 *
 * Este middleware se ejecuta cuando ninguna ruta anterior
 * coincide con el request. El asterisco (*) captura todas las rutas.
 */
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
  });
});

/**
 * MIDDLEWARE GLOBAL DE MANEJO DE ERRORES
 *
 * Este middleware especial maneja todos los errores de la aplicación.
 * Se reconoce porque recibe 4 parámetros: (err, req, res, next)
 *
 * ¿Cuándo se ejecuta?
 * - Cuando algún middleware llama next(error)
 * - Cuando ocurre una excepción no manejada
 * - Cuando se lanza un error en cualquier parte de la app
 */
app.use((err, req, res, next) => {
  console.error('Error:', err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    // Solo mostrar stack trace en desarrollo por seguridad
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

/**
 * FUNCIÓN PARA INICIALIZAR EL SERVIDOR
 *
 * Esta función async maneja la secuencia de inicio:
 * 1. Inicializar la base de datos
 * 2. Crear las tablas si no existen
 * 3. Iniciar el servidor HTTP
 *
 * ¿Por qué async/await aquí?
 * - La inicialización de la BD es asíncrona
 * - Queremos asegurar que la BD esté lista antes de recibir requests
 * - Si falla la BD, no iniciamos el servidor
 */
const startServer = async () => {
  try {
    // Inicializar base de datos primero
    await initDatabase();
    console.log('✅ Base de datos inicializada correctamente');

    // Solo si la BD se inicializa correctamente, iniciamos el servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
      console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
    });
  } catch (error) {
    console.error('❌ Error al inicializar el servidor:', error);
    // Si algo falla, salimos del proceso con código de error
    process.exit(1);
  }
};

/**
 * MANEJO DE SEÑALES DEL SISTEMA (GRACEFUL SHUTDOWN)
 *
 * Estas funciones manejan el cierre elegante del servidor:
 *
 * SIGINT: Se envía cuando presionas Ctrl+C
 * SIGTERM: Se envía por sistemas de deployment para terminar el proceso
 *
 * ¿Por qué es importante el graceful shutdown?
 * - Permite completar requests en progreso
 * - Cierra conexiones de BD correctamente
 * - Evita corrupción de datos
 * - Libera recursos del sistema
 *
 * En aplicaciones reales incluirías:
 * - Cerrar conexiones de BD
 * - Cancelar jobs en progreso
 * - Notificar a load balancers
 */
process.on('SIGINT', () => {
  console.log('\n🛑 Cerrando servidor...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Cerrando servidor...');
  process.exit(0);
});

// Iniciar el servidor
startServer();

/**
 * EXPORTACIÓN DE LA APP
 *
 * Exportamos la instancia de Express para:
 * - Testing: importar la app en tests unitarios
 * - Modularidad: usar la app en otros archivos
 * - Deployment: algunos servicios requieren importar la app
 */
module.exports = app;
