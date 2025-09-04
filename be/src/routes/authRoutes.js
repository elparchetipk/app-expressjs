// src/routes/authRoutes.js - Definición de rutas de autenticación
const express = require('express');
const router = express.Router();

// Importar controladores y middlewares
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  validateRegister,
  validateLogin,
} = require('../middleware/validationMiddleware');

/**
 * ROUTER DE EXPRESS
 *
 * express.Router() crea un "mini-app" que puede manejar rutas y middleware.
 * Es como una aplicación Express modular y montable.
 *
 * ¿Por qué usar Router en lugar de app directamente?
 * - Modularidad: separa rutas por funcionalidad
 * - Reutilización: puede montarse en diferentes paths
 * - Mantenibilidad: código más organizado y legible
 * - Testing: más fácil testear rutas específicas
 */

/**
 * RF-001: RUTA DE REGISTRO DE USUARIO
 *
 * POST /api/auth/register
 *
 * Middleware Stack (se ejecutan en orden):
 * 1. validateRegister: valida datos de entrada
 * 2. authController.register: lógica de negocio
 *
 * ¿Por qué validar primero?
 * - Detener requests inválidos temprano
 * - Ahorrar recursos de procesamiento
 * - Respuestas consistentes de errores
 */
router.post('/register', validateRegister, authController.register);

/**
 * RF-002: RUTA DE LOGIN DE USUARIO
 *
 * POST /api/auth/login
 *
 * Middleware Stack:
 * 1. validateLogin: valida email y password
 * 2. authController.login: autentica y genera JWT
 */
router.post('/login', validateLogin, authController.login);

/**
 * RF-004: RUTA DE LOGOUT DE USUARIO
 *
 * POST /api/auth/logout
 *
 * Nota: No requiere authMiddleware porque:
 * - El logout es principalmente del lado cliente
 * - Elimina el token del localStorage
 * - No necesita validar token para hacer logout
 */
router.post('/logout', authController.logout);

/**
 * RUTA PROTEGIDA: OBTENER PERFIL
 *
 * GET /api/auth/profile
 *
 * Middleware Stack:
 * 1. authMiddleware: verifica JWT y obtiene usuario
 * 2. authController.getProfile: retorna datos del usuario
 *
 * Esta ruta demuestra cómo proteger endpoints que requieren autenticación.
 */
router.get('/profile', authMiddleware, authController.getProfile);

/**
 * RUTA DE VERIFICACIÓN DE TOKEN
 *
 * GET /api/auth/verify
 *
 * Útil para que el frontend verifique si un token sigue siendo válido
 * sin necesidad de hacer una request completa al perfil.
 */
router.get('/verify', authMiddleware, (req, res) => {
  /**
   * CONTROLADOR INLINE PARA VERIFICACIÓN
   *
   * En lugar de crear un método separado en authController,
   * usamos una función inline porque es muy simple.
   *
   * Si authMiddleware llegó hasta aquí, significa que:
   * - El token es válido
   * - req.user contiene los datos del usuario
   * - Solo necesitamos confirmar que todo está OK
   */
  res.json({
    success: true,
    message: 'Token válido',
    user: req.user.toPublicJSON(), // Datos públicos del usuario
  });
});

/**
 * EXPORTACIÓN DEL ROUTER
 *
 * module.exports permite que app.js importe estas rutas:
 *
 * const authRoutes = require('./routes/authRoutes');
 * app.use('/api/auth', authRoutes);
 *
 * Esto hace que todas las rutas definidas aquí estén disponibles
 * bajo el prefijo /api/auth
 */
module.exports = router;
