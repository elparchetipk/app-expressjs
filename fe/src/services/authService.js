// src/services/authService.js - Servicio para manejar peticiones HTTP de autenticación
import axios from 'axios';

/**
 * SERVICIO DE AUTENTICACIÓN
 *
 * Este archivo centraliza todas las peticiones HTTP relacionadas con autenticación.
 * Usar un servicio separado tiene varias ventajas:
 *
 * 1. SEPARACIÓN DE RESPONSABILIDADES:
 *    - Los componentes se enfocan en la UI
 *    - La lógica de API está centralizada
 *    - Fácil mantenimiento y testing
 *
 * 2. REUTILIZACIÓN:
 *    - Múltiples componentes pueden usar las mismas funciones
 *    - Evita duplicación de código
 *
 * 3. CONFIGURACIÓN CENTRALIZADA:
 *    - URLs base, headers, interceptors en un solo lugar
 *    - Fácil cambio entre entornos (dev, prod)
 */

// Configuración base de axios
const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * INSTANCIA PERSONALIZADA DE AXIOS
 *
 * Crear una instancia permite configuraciones específicas:
 * - URL base para todas las peticiones
 * - Headers por defecto
 * - Interceptors para manejo automático de tokens y errores
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Timeout de 10 segundos para evitar peticiones colgadas
  timeout: 10000,
});

/**
 * INTERCEPTOR DE PETICIONES
 *
 * Los interceptors permiten modificar automáticamente las peticiones
 * antes de que se envíen. Aquí agregamos el token JWT automáticamente.
 *
 * ¿Por qué usar interceptors?
 * - Evita tener que agregar el token manualmente en cada petición
 * - Manejo centralizado de autenticación
 * - Consistencia en todas las peticiones
 */
apiClient.interceptors.request.use(
  (config) => {
    // Obtener token del localStorage
    const token = localStorage.getItem('token');

    if (token) {
      // Agregar token al header Authorization
      // Formato estándar: "Bearer <token>"
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log para debugging en desarrollo
    if (import.meta.env.DEV) {
      console.log('🚀 Petición enviada:', {
        method: config.method.toUpperCase(),
        url: config.url,
        hasToken: !!token,
      });
    }

    return config;
  },
  (error) => {
    console.error('❌ Error en interceptor de petición:', error);
    return Promise.reject(error);
  }
);

/**
 * INTERCEPTOR DE RESPUESTAS
 *
 * Los interceptors de respuesta permiten manejar automáticamente
 * errores comunes como tokens expirados.
 */
apiClient.interceptors.response.use(
  (response) => {
    // Log para debugging en desarrollo
    if (import.meta.env.DEV) {
      console.log('✅ Respuesta recibida:', {
        status: response.status,
        url: response.config.url,
      });
    }
    return response;
  },
  (error) => {
    // Manejo automático de token expirado
    if (error.response?.status === 401) {
      console.warn('🔒 Token expirado o inválido');
      // Limpiar token inválido
      localStorage.removeItem('token');
      // Redirigir al login (se puede mejorar con React Router)
      window.location.href = '/login';
    }

    console.error('❌ Error en respuesta:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
    });

    return Promise.reject(error);
  }
);

/**
 * SERVICIO DE AUTENTICACIÓN
 *
 * Objeto que agrupa todas las funciones relacionadas con autenticación.
 * Cada función maneja una operación específica de la API.
 */
const authService = {
  /**
   * REGISTRO DE USUARIO
   *
   * @param {Object} userData - Datos del usuario a registrar
   * @param {string} userData.email - Email del usuario
   * @param {string} userData.nombres - Nombres del usuario
   * @param {string} userData.apellidos - Apellidos del usuario
   * @param {string} userData.password - Password del usuario
   * @returns {Promise} Respuesta de la API
   */
  async register(userData) {
    try {
      const response = await apiClient.post('/auth/register', userData);

      // Log de éxito
      console.log(
        '✅ Usuario registrado exitosamente:',
        response.data.user?.email
      );

      return response.data;
    } catch (error) {
      console.error(
        '❌ Error en registro:',
        error.response?.data || error.message
      );
      throw error;
    }
  },

  /**
   * LOGIN DE USUARIO
   *
   * @param {string} email - Email del usuario
   * @param {string} password - Password del usuario
   * @returns {Promise} Respuesta con token y datos del usuario
   */
  async login(email, password) {
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });

      // Log de éxito
      console.log('✅ Login exitoso:', response.data.user?.email);

      return response.data;
    } catch (error) {
      console.error(
        '❌ Error en login:',
        error.response?.data || error.message
      );
      throw error;
    }
  },

  /**
   * LOGOUT DE USUARIO
   *
   * Cierra la sesión del usuario en el servidor.
   * Nota: La limpieza del localStorage se hace en el AuthContext.
   */
  async logout() {
    try {
      await apiClient.post('/auth/logout');
      console.log('✅ Logout exitoso');
    } catch (error) {
      // El logout en el cliente debe funcionar aunque falle en el servidor
      console.warn(
        '⚠️ Error en logout del servidor:',
        error.response?.data || error.message
      );
    }
  },

  /**
   * OBTENER PERFIL DEL USUARIO
   *
   * Obtiene los datos del usuario autenticado actual.
   * Se usa para verificar si el token sigue siendo válido.
   */
  async getProfile() {
    try {
      const response = await apiClient.get('/auth/profile');
      return response.data.user;
    } catch (error) {
      console.error(
        '❌ Error al obtener perfil:',
        error.response?.data || error.message
      );
      throw error;
    }
  },

  /**
   * VERIFICAR SALUD DE LA API
   *
   * Endpoint útil para verificar que la API esté funcionando.
   * Útil para debugging y monitoreo.
   */
  async healthCheck() {
    try {
      const response = await apiClient.get('/health');
      return response.data;
    } catch (error) {
      console.error(
        '❌ Error en health check:',
        error.response?.data || error.message
      );
      throw error;
    }
  },
};

export default authService;
