/**
 * 🎓 CONTROLADOR DE AUTENTICACIÓN - GUÍA EDUCATIVA
 *
 * Este archivo contiene toda la lógica de negocio para manejar autenticación.
 * Implementa los RF-001 (Registro) y RF-002 (Login) definidos en la documentación.
 *
 * ¿Por qué separamos en controladores?
 * - Principio de Responsabilidad Única: cada archivo tiene una función específica
 * - Facilita el mantenimiento y testing
 * - Hace el código más legible y reutilizable
 */

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

/**
 * 🔐 GENERACIÓN DE JWT TOKEN
 *
 * ¿Qué es JWT?
 * JSON Web Token - Un estándar para transmitir información de forma segura.
 * Se compone de: Header.Payload.Signature
 *
 * ¿Por qué usamos JWT?
 * - Stateless: no necesitamos guardar sesiones en el servidor
 * - Escalable: funciona en múltiples servidores
 * - Seguro: firmado criptográficamente
 *
 * @param {number} userId - ID del usuario para incluir en el token
 * @returns {string} Token JWT firmado
 */
const generateToken = (userId) => {
  return jwt.sign(
    { userId }, // Payload: información que queremos incluir
    process.env.JWT_SECRET, // Clave secreta para firmar (¡NUNCA exponerla!)
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h', // Token expira en 24h por seguridad
    }
  );
};

/**
 * 📝 RF-001: REGISTRO DE USUARIO
 *
 * Endpoint: POST /api/auth/register
 *
 * Flujo del registro:
 * 1. Validar datos de entrada (express-validator)
 * 2. Verificar que el email no exista (unicidad)
 * 3. Crear usuario con password encriptado (bcrypt en el modelo)
 * 4. Retornar datos del usuario (sin password por seguridad)
 *
 * ¿Por qué async/await?
 * - Las operaciones de BD son asíncronas
 * - Evita "callback hell"
 * - Código más legible y mantenible
 */
const register = async (req, res) => {
  try {
    // 🔍 VALIDACIÓN DE DATOS
    // express-validator ya ejecutó las validaciones en el middleware
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array().map((error) => error.msg),
      });
    }

    // 📊 EXTRACCIÓN DE DATOS
    // Destructuring: forma elegante de extraer propiedades de un objeto
    const { email, nombres, apellidos, password } = req.body;

    // 🔎 VERIFICAR UNICIDAD DEL EMAIL
    // Importante: verificar antes de crear para evitar duplicados
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      // Status 409: Conflict - el recurso ya existe
      return res.status(409).json({
        success: false,
        message: 'El email ya está registrado',
      });
    }

    // 👤 CREAR NUEVO USUARIO
    // El modelo User se encarga de encriptar el password automáticamente
    const userData = await User.create({
      email,
      nombres,
      apellidos,
      password, // Se encriptará en el modelo
    });

    // ✅ RESPUESTA EXITOSA (RF-001)
    // Status 201: Created - recurso creado exitosamente
    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      user: {
        id: userData.id,
        email: userData.email,
        nombres: userData.nombres,
        apellidos: userData.apellidos,
        created_at: userData.created_at,
      },
    });
  } catch (error) {
    // 🚨 MANEJO DE ERRORES
    // Importante: loggear errores para debugging pero no exponerlos al cliente
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
};

/**
 * 🔑 RF-002: LOGIN DE USUARIO
 *
 * Endpoint: POST /api/auth/login
 *
 * Flujo del login:
 * 1. Validar formato de datos (express-validator)
 * 2. Buscar usuario por email
 * 3. Verificar password (bcrypt compare)
 * 4. Generar JWT token
 * 5. Retornar token y datos del usuario
 *
 * ¿Por qué no decimos si el error es email o password?
 * - Seguridad: evitamos dar pistas a atacantes
 * - Principio de mínima información
 */
const login = async (req, res) => {
  try {
    // 🔍 VALIDACIÓN DE DATOS
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array().map((error) => error.msg),
      });
    }

    const { email, password } = req.body;

    // Buscar usuario por email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
      });
    }

    // Verificar password
    const isPasswordValid = await user.verifyPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
      });
    }

    // Generar token JWT
    const token = generateToken(user.id);

    // Respuesta exitosa (RF-002)
    res.status(200).json({
      success: true,
      message: 'Login exitoso',
      token,
      user: user.toPublicJSON(),
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
};

// RF-004: Logout de Usuario
const logout = async (req, res) => {
  try {
    // En una implementación JWT stateless, el logout se maneja en el frontend
    // eliminando el token del localStorage/sessionStorage
    res.status(200).json({
      success: true,
      message: 'Logout exitoso',
    });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
};

// Obtener perfil del usuario autenticado
const getProfile = async (req, res) => {
  try {
    // El usuario viene del middleware de autenticación
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    res.status(200).json({
      success: true,
      user: user.toPublicJSON(),
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  getProfile,
};
