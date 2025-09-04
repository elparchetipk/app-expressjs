/**
 * CONFIGURACIÓN DE BASE DE DATOS SQLITE
 *
 * Este archivo maneja toda la configuración y conexión a la base de datos SQLite.
 *
 * ¿Por qué SQLite?
 * - Base de datos ligera y sin servidor
 * - Perfecta para desarrollo y aplicaciones pequeñas/medianas
 * - No requiere instalación de servidor de BD separado
 * - Almacena todo en un solo archivo
 * - Ideal para prototipado y aprendizaje
 *
 * ¿Cuándo NO usar SQLite?
 * - Aplicaciones con múltiples escritores concurrentes
 * - Aplicaciones que requieren alta escalabilidad
 * - Sistemas distribuidos
 *
 * Alternativas para producción: PostgreSQL, MySQL, MongoDB
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

/**
 * CONFIGURACIÓN DE RUTAS
 *
 * __dirname: Directorio actual donde se encuentra este archivo
 * path.join(): Une rutas de forma segura, independiente del SO
 * '..': Sube un nivel en la estructura de carpetas
 */
const DB_PATH = path.join(__dirname, '..', 'database.sqlite');

// Variable global para mantener la conexión a la base de datos
let db = null;

/**
 * FUNCIÓN PARA INICIALIZAR LA BASE DE DATOS
 *
 * Esta función:
 * 1. Crea/conecta a la base de datos SQLite
 * 2. Crea las tablas necesarias si no existen
 * 3. Retorna una Promise para manejo asíncrono
 *
 * ¿Por qué usar Promises?
 * - SQLite3 usa callbacks por defecto
 * - Las Promises son más fáciles de manejar con async/await
 * - Evita el "callback hell"
 * - Mejor control de errores
 */
const initDatabase = () => {
  return new Promise((resolve, reject) => {
    // Crear/conectar a la base de datos
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error(
          '❌ Error al conectar con la base de datos:',
          err.message
        );
        reject(err);
      } else {
        console.log('✅ Conectado a la base de datos SQLite');
        console.log(`📁 Ubicación de la BD: ${DB_PATH}`);

        // Después de conectar, crear las tablas
        createTables()
          .then(() => resolve())
          .catch(reject);
      }
    });
  });
};

/**
 * FUNCIÓN PARA CREAR TABLAS
 *
 * Define la estructura de la tabla 'users' según los RF's:
 * - id: Clave primaria auto-incremental
 * - email: Único y obligatorio
 * - nombres: Nombre(s) del usuario
 * - apellidos: Apellidos del usuario
 * - password: Contraseña encriptada
 * - created_at: Fecha de creación automática
 * - updated_at: Fecha de última actualización
 *
 * ¿Por qué estos campos específicos?
 * - Según RF-001, se requieren email, nombres, apellidos y password
 * - created_at/updated_at son buenas prácticas para auditoría
 * - id auto-incremental es estándar para claves primarias
 */
const createTables = () => {
  return new Promise((resolve, reject) => {
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        nombres TEXT NOT NULL,
        apellidos TEXT NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    /**
     * EXPLICACIÓN DE LA ESTRUCTURA DE LA TABLA:
     *
     * - INTEGER PRIMARY KEY AUTOINCREMENT:
     *   Clave primaria que se incrementa automáticamente
     *
     * - TEXT UNIQUE NOT NULL (email):
     *   Campo de texto único y obligatorio para evitar duplicados
     *
     * - TEXT NOT NULL (nombres, apellidos, password):
     *   Campos de texto obligatorios
     *
     * - DATETIME DEFAULT CURRENT_TIMESTAMP:
     *   Fecha/hora que se asigna automáticamente al crear/actualizar
     *
     * - CREATE TABLE IF NOT EXISTS:
     *   Solo crea la tabla si no existe, evita errores en múltiples ejecuciones
     */

    db.run(createUsersTable, (err) => {
      if (err) {
        console.error('❌ Error al crear tabla users:', err.message);
        reject(err);
      } else {
        console.log('✅ Tabla users creada o ya existe');

        // Opcional: Mostrar información sobre la tabla creada
        showTableInfo();
        resolve();
      }
    });
  });
};

/**
 * FUNCIÓN PARA MOSTRAR INFORMACIÓN DE LA TABLA (EDUCATIVA)
 *
 * Esta función es opcional y solo para fines educativos.
 * Muestra la estructura de la tabla en la consola.
 */
const showTableInfo = () => {
  db.all('PRAGMA table_info(users)', (err, rows) => {
    if (!err && rows.length > 0) {
      console.log('📋 Estructura de la tabla users:');
      rows.forEach((column) => {
        console.log(
          `   - ${column.name}: ${column.type} ${
            column.notnull ? '(NOT NULL)' : ''
          } ${column.pk ? '(PRIMARY KEY)' : ''}`
        );
      });
    }
  });
};

/**
 * FUNCIÓN PARA OBTENER LA INSTANCIA DE LA BASE DE DATOS
 *
 * Esta función permite que otros módulos accedan a la conexión de BD.
 * Incluye validación para asegurar que la BD esté inicializada.
 *
 * ¿Por qué no exportar 'db' directamente?
 * - Evita errores si se intenta usar antes de inicializar
 * - Proporciona un mensaje de error claro
 * - Mejor control del flujo de la aplicación
 */
const getDatabase = () => {
  if (!db) {
    throw new Error(
      '❌ Base de datos no inicializada. Llama a initDatabase() primero.'
    );
  }
  return db;
};

/**
 * FUNCIÓN PARA CERRAR LA CONEXIÓN DE BASE DE DATOS
 *
 * Importante para:
 * - Liberar recursos al cerrar la aplicación
 * - Asegurar que los datos se escriban correctamente
 * - Buenas prácticas de manejo de conexiones
 *
 * Se usa típicamente en:
 * - Señales de cierre de la aplicación (SIGINT, SIGTERM)
 * - Tests unitarios
 * - Scripts de migración
 */
const closeDatabase = () => {
  return new Promise((resolve) => {
    if (db) {
      db.close((err) => {
        if (err) {
          console.error('❌ Error al cerrar la base de datos:', err.message);
        } else {
          console.log('✅ Conexión a la base de datos cerrada correctamente');
        }
        resolve();
      });
    } else {
      resolve();
    }
  });
};

/**
 * FUNCIONES UTILITARIAS ADICIONALES PARA DESARROLLO
 */

/**
 * Función para ejecutar queries de desarrollo/debug
 * ¡NUNCA usar en producción!
 */
const executeQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    if (process.env.NODE_ENV === 'production') {
      reject(new Error('executeQuery no disponible en producción'));
      return;
    }

    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

/**
 * EXPORTACIÓN DE MÓDULOS
 *
 * Exportamos solo las funciones necesarias para el resto de la aplicación.
 * Esto es un ejemplo del patrón "Module Pattern" que encapsula
 * la implementación interna y expone solo la interfaz pública.
 */
module.exports = {
  initDatabase,
  getDatabase,
  closeDatabase,
  // Función de desarrollo (solo disponible en modo desarrollo)
  ...(process.env.NODE_ENV !== 'production' && { executeQuery }),
};
