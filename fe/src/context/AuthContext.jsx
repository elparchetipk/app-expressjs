// src/context/AuthContext.jsx - Contexto global para manejo de autenticación
import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

/**
 * CONTEXTO DE AUTENTICACIÓN
 *
 * El Context API de React nos permite compartir estado entre componentes
 * sin necesidad de pasar props a través de múltiples niveles (prop drilling).
 *
 * ¿Qué resuelve este contexto?
 * - Compartir información del usuario autenticado en toda la app
 * - Mantener el estado de autenticación persistente
 * - Proporcionar funciones para login/logout/register desde cualquier componente
 * - Verificar automáticamente si el usuario tiene una sesión válida al cargar la app
 *
 * ¿Por qué usar Context en lugar de Redux?
 * - Para aplicaciones pequeñas/medianas, Context es más simple
 * - Menos configuración y boilerplate
 * - Integrado nativamente en React
 * - Suficiente para manejar estado de autenticación
 */

// Crear el contexto de autenticación
const AuthContext = createContext();

/**
 * HOOK PERSONALIZADO useAuth
 *
 * Este hook personalizado facilita el acceso al contexto de autenticación.
 * En lugar de usar useContext(AuthContext) en cada componente,
 * podemos usar useAuth() que es más limpio y legible.
 *
 * También incluye validación para asegurar que se use dentro del Provider.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

/**
 * COMPONENTE PROVIDER DE AUTENTICACIÓN
 *
 * Este componente envuelve la aplicación y proporciona:
 * - Estado del usuario actual
 * - Estado de carga para mostrar spinners durante operaciones
 * - Funciones para login, logout, register
 * - Verificación automática de sesión al cargar la app
 */
export const AuthProvider = ({ children }) => {
  // Estados para el manejo de la autenticación
  const [user, setUser] = useState(null); // Usuario actual autenticado
  const [loading, setLoading] = useState(true); // Estado de carga inicial
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Bandera de autenticación

  /**
   * EFECTO PARA VERIFICAR SESIÓN AL CARGAR LA APP
   *
   * useEffect con array de dependencias vacío [] se ejecuta solo una vez
   * cuando el componente se monta (equivalente a componentDidMount).
   *
   * Aquí verificamos si existe un token guardado en localStorage
   * y si es válido, restauramos la sesión del usuario.
   */
  useEffect(() => {
    checkAuthStatus();
  }, []);

  /**
   * FUNCIÓN PARA VERIFICAR EL ESTADO DE AUTENTICACIÓN
   *
   * Esta función se ejecuta al cargar la app para verificar
   * si el usuario tiene una sesión válida guardada.
   */
  const checkAuthStatus = async () => {
    try {
      setLoading(true);

      // Verificar si existe un token en localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      // Verificar si el token es válido obteniendo el perfil del usuario
      const userData = await authService.getProfile();
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
      // Si el token no es válido, limpiamos el localStorage
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  /**
   * FUNCIÓN DE LOGIN
   *
   * Maneja el proceso de autenticación del usuario.
   * Si es exitoso, guarda el token y los datos del usuario.
   */
  const login = async (email, password) => {
    try {
      setLoading(true);

      // Llamar al servicio de autenticación
      const response = await authService.login(email, password);

      // Guardar token en localStorage para persistencia
      localStorage.setItem('token', response.token);

      // Actualizar estado global
      setUser(response.user);
      setIsAuthenticated(true);

      return { success: true, user: response.user };
    } catch (error) {
      console.error('Error en login:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al iniciar sesión',
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * FUNCIÓN DE REGISTRO
   *
   * Maneja el registro de nuevos usuarios.
   * Después del registro exitoso, automáticamente autentica al usuario.
   */
  const register = async (userData) => {
    try {
      setLoading(true);

      // Registrar usuario
      const response = await authService.register(userData);

      // Después del registro exitoso, hacer login automático
      if (response.success) {
        const loginResult = await login(userData.email, userData.password);
        return loginResult;
      }

      return response;
    } catch (error) {
      console.error('Error en registro:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al registrar usuario',
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * FUNCIÓN DE LOGOUT
   *
   * Limpia toda la información de sesión y redirige al login.
   */
  const logout = async () => {
    try {
      // Llamar al endpoint de logout (opcional)
      await authService.logout();
    } catch (error) {
      console.error('Error al hacer logout:', error);
    } finally {
      // Limpiar estado local siempre, independientemente del resultado
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  /**
   * VALOR DEL CONTEXTO
   *
   * Estos son todos los valores y funciones que estarán disponibles
   * para cualquier componente que use el hook useAuth().
   */
  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
