/**
 * 🔍 MIDDLEWARE DE VALIDACIÓN - GUÍA EDUCATIVA
 *
 * ¿Qué es express-validator?
 * - Biblioteca basada en validator.js
 * - Proporciona middlewares para validar datos de entrada
 * - Sanitiza (limpia) los datos automáticamente
 *
 * ¿Por qué validar en el servidor?
 * - Seguridad: nunca confiar en validaciones del cliente
 * - Integridad: asegurar que los datos cumplan nuestras reglas
 * - Experiencia: proporcionar mensajes de error claros
 *
 * Este archivo implementa RF-005: Validación de Datos de Entrada
 */

const { body } = require('express-validator');

/**
 * 📝 RF-005: VALIDACIONES DE DATOS DE ENTRADA
 *
 * Principios de validación aplicados:
 * 1. Validar tipo y formato
 * 2. Sanitizar datos (trim, normalizeEmail)
 * 3. Verificar longitudes mínimas/máximas
 * 4. Usar regex para patrones específicos
 * 5. Mensajes de error descriptivos
 */

/**
 * 🔐 VALIDACIONES PARA REGISTRO DE USUARIO
 *
 * Array de middlewares que se ejecutan secuencialmente.
 * Cada validación agrega errores a un array que luego se procesa.
 *
 * ¿Por qué usamos un array?
 * - Express permite múltiples middlewares en una ruta
 * - Cada validación es independiente
 * - Fácil de mantener y extender
 */
const validateRegister = [
  // 📧 VALIDACIÓN DE EMAIL
  body('email')
    .isEmail() // Verifica formato RFC 5322
    .withMessage('El email debe tener un formato válido')
    .normalizeEmail() // Sanitiza: convierte a minúsculas, remueve puntos de Gmail
    .isLength({ max: 255 }) // Límite de BD estándar
    .withMessage('El email no debe exceder 255 caracteres'),

  // 👤 VALIDACIÓN DE NOMBRES
  body('nombres')
    .trim() // Sanitiza: remueve espacios al inicio/final
    .notEmpty() // No puede estar vacío después del trim
    .withMessage('Los nombres son obligatorios')
    .isLength({ min: 2, max: 100 }) // Longitudes razonables
    .withMessage('Los nombres deben tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/) // Solo letras, acentos y espacios
    .withMessage('Los nombres solo pueden contener letras y espacios'),

  // 👤 VALIDACIÓN DE APELLIDOS
  body('apellidos')
    .trim()
    .notEmpty()
    .withMessage('Los apellidos son obligatorios')
    .isLength({ min: 2, max: 100 })
    .withMessage('Los apellidos deben tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('Los apellidos solo pueden contener letras y espacios'),

  body('password')
    .isLength({ min: 8 })
    .withMessage('El password debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'El password debe contener al menos una mayúscula, una minúscula y un número'
    )
    .not()
    .contains(' ')
    .withMessage('El password no puede contener espacios'),
];

// Validaciones para login de usuario
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('El email debe tener un formato válido')
    .normalizeEmail(),

  body('password').notEmpty().withMessage('El password es obligatorio'),
];

// Validaciones para actualizar perfil
const validateUpdateProfile = [
  body('nombres')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Los nombres deben tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('Los nombres solo pueden contener letras y espacios'),

  body('apellidos')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Los apellidos deben tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('Los apellidos solo pueden contener letras y espacios'),

  body('email')
    .optional()
    .isEmail()
    .withMessage('El email debe tener un formato válido')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('El email no debe exceder 255 caracteres'),
];

// Validaciones para cambio de password
const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('El password actual es obligatorio'),

  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('El nuevo password debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'El nuevo password debe contener al menos una mayúscula, una minúscula y un número'
    )
    .not()
    .contains(' ')
    .withMessage('El nuevo password no puede contener espacios'),

  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('La confirmación del password no coincide');
    }
    return true;
  }),
];

module.exports = {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword,
};
