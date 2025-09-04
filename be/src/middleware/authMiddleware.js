/**
 * 🛡️ MIDDLEWARE DE AUTENTICACIÓN - GUÍA EDUCATIVA
 *
 * ¿Qué es un middleware?
 * - Función que se ejecuta entre la petición y la respuesta
 * - Puede modificar req, res o terminar la petición
 * - Debe llamar next() para continuar al siguiente middleware
 *
 * ¿Por qué usamos middlewares?
 * - Reutilización: una vez escrito, se usa en múltiples rutas
 * - Separación de responsabilidades: autenticación separada de lógica de negocio
 * - Orden de ejecución: se ejecutan en el orden que se definen
 *
 * Este middleware implementa RF-003: Validación de Token JWT
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * 🔐 RF-003: VALIDACIÓN DE TOKEN JWT
 *
 * Este middleware protege rutas que requieren autenticación.
 * Se ejecuta ANTES de los controladores de rutas protegidas.
 *
 * Flujo de validación:
 * 1. Extraer token del header Authorization
 * 2. Verificar formato Bearer
 * 3. Validar token con JWT
 * 4. Buscar usuario en BD
 * 5. Adjuntar usuario a req para uso posterior
 *
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 * @param {Function} next - Función para continuar al siguiente middleware
 */
const authMiddleware = async (req, res, next) => {
  try {
    // 📥 EXTRAER TOKEN DEL HEADER
    // El header Authorization debe tener formato: "Bearer <token>"
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      // Status 401: Unauthorized - credenciales faltantes o inválidas
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido',
      });
    }

    // 🔍 VERIFICAR FORMATO BEARER
    // Estándar RFC 6750 para tokens de portador
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Formato de token inválido. Use: Bearer <token>',
      });
    }

    // ✂️ EXTRAER EL TOKEN
    // Remover "Bearer " (7 caracteres) del inicio
    const token = authHeader.substring(7);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado',
      });
    }

    // 🔓 VERIFICAR Y DECODIFICAR EL TOKEN
    let decoded;
    try {
      // jwt.verify() valida la firma y la expiración automáticamente
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      // 🚨 MANEJO ESPECÍFICO DE ERRORES JWT
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expirado',
        });
      } else if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Token inválido',
        });
      } else {
        return res.status(401).json({
          success: false,
          message: 'Error al verificar token',
        });
      }
    }

    // Verificar que el usuario existe
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    // Adjuntar información del usuario a la request
    req.userId = decoded.userId;
    req.user = user;

    next();
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
};

// Middleware opcional - no requiere autenticación pero la procesa si está presente
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (user) {
          req.userId = decoded.userId;
          req.user = user;
        }
      } catch (jwtError) {
        // En middleware opcional, ignoramos errores de JWT
        console.log('Token opcional inválido:', jwtError.message);
      }
    }

    next();
  } catch (error) {
    console.error('Error en middleware opcional:', error);
    next(); // Continuar sin autenticación
  }
};

module.exports = {
  authMiddleware,
  optionalAuth,
};
