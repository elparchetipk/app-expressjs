// src/models/User.js - Modelo de datos para el usuario
const bcrypt = require('bcryptjs');
const { getDatabase } = require('../config/database');

/**
 * MODELO USER - PATRÓN ACTIVE RECORD
 *
 * Este modelo implementa el patrón Active Record, donde cada instancia
 * de la clase representa un registro en la base de datos y contiene
 * tanto los datos como los métodos para manipularlos.
 *
 * ¿Por qué usar clases en JavaScript?
 * - Organización: Agrupa datos y métodos relacionados
 * - Reutilización: Instancias múltiples con el mismo comportamiento
 * - Encapsulación: Métodos públicos y privados
 * - Herencia: Posibilidad de extender funcionalidad
 *
 * ¿Qué es bcryptjs?
 * - Biblioteca para encriptar passwords de forma segura
 * - Implementa el algoritmo bcrypt con "salt" automático
 * - Protege contra ataques de diccionario y rainbow tables
 * - Más seguro que MD5 o SHA porque es intencionalmente lento
 */

class User {
  /**
   * CONSTRUCTOR DE LA CLASE USER
   *
   * El constructor se ejecuta cada vez que creamos una nueva instancia
   * de User. Inicializa las propiedades del objeto con los datos recibidos.
   *
   * @param {Object} data - Objeto con los datos del usuario
   */
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.nombres = data.nombres;
    this.apellidos = data.apellidos;
    this.password = data.password;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  /**
   * MÉTODO ESTÁTICO PARA CREAR USUARIO
   *
   * Los métodos estáticos pertenecen a la clase, no a las instancias.
   * Se llaman directamente: User.create() en lugar de user.create()
   *
   * ¿Por qué es async/await?
   * - bcrypt.hash() es asíncrono para no bloquear el hilo principal
   * - Las operaciones de base de datos son asíncronas
   * - async/await hace el código más legible que callbacks anidados
   *
   * @param {Object} userData - Datos del nuevo usuario
   * @returns {Promise<Object>} - Datos del usuario creado
   */
  static async create(userData) {
    const { email, nombres, apellidos, password } = userData;
    const db = getDatabase();

    try {
      /**
       * ENCRIPTACIÓN DEL PASSWORD
       *
       * bcrypt.hash(password, saltRounds) donde saltRounds = 12:
       * - Más rounds = más seguro pero más lento
       * - 12 rounds es un buen balance para 2024
       * - El "salt" se genera automáticamente y se incluye en el hash
       * - Cada vez que encriptas la misma password, obtienes un hash diferente
       */
      const hashedPassword = await bcrypt.hash(password, 12);

      /**
       * PATRÓN PROMISE WRAPPER
       *
       * SQLite3 usa callbacks, pero preferimos Promises para consistency.
       * Envolvemos la operación en una Promise para poder usar async/await.
       *
       * ¿Por qué usar function() en lugar de arrow function?
       * - function() conserva el contexto 'this' del callback de SQLite
       * - 'this.lastID' contiene el ID del registro recién insertado
       * - Las arrow functions no tienen su propio 'this'
       */
      return new Promise((resolve, reject) => {
        const query = `
          INSERT INTO users (email, nombres, apellidos, password)
          VALUES (?, ?, ?, ?)
        `;

        db.run(
          query,
          [email, nombres, apellidos, hashedPassword],
          function (err) {
            if (err) {
              reject(err);
            } else {
              // 'this.lastID' es específico de SQLite y contiene el ID del nuevo registro
              resolve({
                id: this.lastID,
                email,
                nombres,
                apellidos,
                created_at: new Date().toISOString(),
              });
            }
          }
        );
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * MÉTODO ESTÁTICO PARA BUSCAR USUARIO POR EMAIL
   *
   * Este método es crucial para la autenticación porque:
   * - El email es único en nuestro sistema (campo UNIQUE en BD)
   * - Es lo que el usuario usa para hacer login
   * - Necesitamos verificar si un email ya existe al registrarse
   *
   * ¿Por qué db.get() en lugar de db.all()?
   * - db.get() retorna solo UNA fila (o null si no encuentra)
   * - db.all() retorna un array de filas
   * - Como email es único, esperamos máximo 1 resultado
   *
   * @param {string} email - Email del usuario a buscar
   * @returns {Promise<User|null>} - Instancia de User o null si no existe
   */
  static async findByEmail(email) {
    const db = getDatabase();

    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users WHERE email = ?';

      db.get(query, [email], (err, row) => {
        if (err) {
          reject(err);
        } else {
          // Si encontramos un registro, creamos una instancia de User
          // Si no encontramos nada (row = undefined), retornamos null
          resolve(row ? new User(row) : null);
        }
      });
    });
  }

  /**
   * MÉTODO ESTÁTICO PARA BUSCAR USUARIO POR ID
   *
   * Útil para:
   * - Verificar tokens JWT (que contienen el user ID)
   * - Obtener perfil de usuario
   * - Operaciones que requieren el usuario completo
   *
   * @param {number} id - ID del usuario a buscar
   * @returns {Promise<User|null>} - Instancia de User o null si no existe
   */
  static async findById(id) {
    const db = getDatabase();

    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users WHERE id = ?';

      db.get(query, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ? new User(row) : null);
        }
      });
    });
  }

  /**
   * MÉTODO DE INSTANCIA PARA VERIFICAR PASSWORD
   *
   * Este es un método de instancia (no estático) porque:
   * - Opera sobre un usuario específico ya cargado
   * - Compara contra el password encriptado de ESE usuario
   * - Se llama como: usuario.verifyPassword(password)
   *
   * ¿Cómo funciona bcrypt.compare()?
   * - Toma el password en texto plano y el hash almacenado
   * - Extrae el salt del hash almacenado
   * - Encripta el password plano con ese salt
   * - Compara los hashes resultantes
   * - Retorna true si coinciden, false si no
   *
   * @param {string} plainPassword - Password en texto plano
   * @returns {Promise<boolean>} - true si el password es correcto
   */
  async verifyPassword(plainPassword) {
    return await bcrypt.compare(plainPassword, this.password);
  }

  /**
   * MÉTODO PARA OBTENER DATOS PÚBLICOS DEL USUARIO
   *
   * ¿Por qué necesitamos este método?
   * - NUNCA debemos enviar el password al frontend
   * - Las respuestas de la API deben ser consistentes
   * - Facilita el control de qué campos son públicos
   * - Previene exposición accidental de datos sensibles
   *
   * Patrón de seguridad: Lista blanca (whitelist)
   * - Solo incluimos campos que SABEMOS que son seguros
   * - Es más seguro que lista negra (blacklist)
   * - Si agregamos nuevos campos sensibles, no se exponen automáticamente
   *
   * @returns {Object} - Objeto con solo los datos públicos del usuario
   */
  toPublicJSON() {
    return {
      id: this.id,
      email: this.email,
      nombres: this.nombres,
      apellidos: this.apellidos,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }

  /**
   * MÉTODO PARA ACTUALIZAR USUARIO
   *
   * Este método implementa una actualización dinámica:
   * - Solo actualiza los campos que se proporcionan
   * - Construye la query SQL dinámicamente
   * - Previene actualización del ID (por seguridad)
   * - Actualiza automáticamente el timestamp updated_at
   *
   * ¿Por qué construcción dinámica de query?
   * - Flexibilidad: podemos actualizar solo email, solo nombres, etc.
   * - Eficiencia: no actualizamos campos que no cambiaron
   * - Mantenibilidad: un solo método para todas las actualizaciones
   *
   * @param {Object} updateData - Objeto con los campos a actualizar
   * @returns {Promise<boolean>} - true si se actualizó algún registro
   */
  async update(updateData) {
    const db = getDatabase();
    const fields = [];
    const values = [];

    // Construir query dinámicamente - solo campos que existen en updateData
    Object.keys(updateData).forEach((key) => {
      if (key !== 'id' && updateData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(updateData[key]);
      }
    });

    if (fields.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    // Agregar timestamp de actualización automáticamente
    fields.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(this.id); // WHERE id = ?

    return new Promise((resolve, reject) => {
      const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;

      db.run(query, values, function (err) {
        if (err) {
          reject(err);
        } else {
          // this.changes indica cuántos registros fueron afectados
          // Retorna true si se actualizó al menos 1 registro
          resolve(this.changes > 0);
        }
      });
    });
  }

  /**
   * MÉTODO PARA ELIMINAR USUARIO
   *
   * ¿Cuándo usar este método?
   * - Cuando el usuario quiere eliminar su cuenta
   * - Funcionalidades de administración
   * - Cumplimiento de GDPR (derecho al olvido)
   *
   * Consideraciones de seguridad:
   * - Solo permite eliminar el usuario actual (this.id)
   * - No acepta ID como parámetro para prevenir eliminación accidental
   * - En aplicaciones reales, considerar "soft delete" en lugar de eliminación
   *
   * ¿Qué es "soft delete"?
   * - Marcar como eliminado en lugar de borrar físicamente
   * - Agregar campo deleted_at en lugar de DELETE
   * - Permite auditoría y recuperación de datos
   *
   * @returns {Promise<boolean>} - true si se eliminó el usuario
   */
  async delete() {
    const db = getDatabase();

    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM users WHERE id = ?';

      db.run(query, [this.id], function (err) {
        if (err) {
          reject(err);
        } else {
          // this.changes indica cuántos registros fueron eliminados
          resolve(this.changes > 0);
        }
      });
    });
  }
}

/**
 * EXPORTACIÓN DEL MODELO
 *
 * module.exports permite que otros archivos importen esta clase:
 *
 * const User = require('./models/User');
 * const usuario = await User.findByEmail('email@example.com');
 *
 * ¿Por qué no usar export default?
 * - Node.js usa CommonJS por defecto (require/module.exports)
 * - ES6 modules (import/export) requieren configuración adicional
 * - CommonJS es más compatible con versiones anteriores de Node.js
 */
module.exports = User;
