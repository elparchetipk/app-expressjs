// src/components/ProtectedRoute.jsx - Componente para proteger rutas que requieren autenticación
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

/**
 * COMPONENTE DE RUTA PROTEGIDA
 *
 * Este es un patrón muy común en aplicaciones web con autenticación.
 * Actúa como un "guardián" que verifica si el usuario está autenticado
 * antes de permitir el acceso a ciertas páginas.
 *
 * ¿Cómo funciona?
 * 1. Recibe componentes hijos (children) que representan la página protegida
 * 2. Verifica el estado de autenticación usando el contexto
 * 3. Si está autenticado: renderiza los children (la página)
 * 4. Si no está autenticado: redirige al login
 * 5. Si está cargando: muestra un spinner
 *
 * ¿Por qué es importante?
 * - Seguridad: evita que usuarios no autenticados accedan a páginas privadas
 * - UX: proporciona feedback visual durante la verificación
 * - Mantenibilidad: centraliza la lógica de protección de rutas
 */

const ProtectedRoute = ({ children }) => {
  // Obtener estado de autenticación del contexto
  const { isAuthenticated, loading } = useAuth();

  /**
   * ESTADOS POSIBLES:
   *
   * 1. LOADING (cargando):
   *    - Se está verificando la autenticación
   *    - Mostrar spinner para mejor UX
   *
   * 2. NOT AUTHENTICATED (no autenticado):
   *    - Usuario no tiene sesión válida
   *    - Redirigir al login
   *
   * 3. AUTHENTICATED (autenticado):
   *    - Usuario tiene sesión válida
   *    - Renderizar la página solicitada
   */

  // Estado de carga: mostrar spinner
  if (loading) {
    return (
      <div className="protected-route-loading">
        <LoadingSpinner />
        <p>Verificando autenticación...</p>
      </div>
    );
  }

  // No autenticado: redirigir al login
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // Autenticado: renderizar la página protegida
  return children;
};

/**
 * VARIACIÓN AVANZADA: ProtectedRoute con roles
 *
 * En aplicaciones más complejas, puedes extender este componente
 * para verificar también roles o permisos específicos:
 *
 * const ProtectedRoute = ({ children, requiredRole = null }) => {
 *   const { user, isAuthenticated, loading } = useAuth()
 *
 *   if (loading) return <LoadingSpinner />
 *   if (!isAuthenticated) return <Navigate to="/login" />
 *   if (requiredRole && user.role !== requiredRole) {
 *     return <Navigate to="/unauthorized" />
 *   }
 *
 *   return children
 * }
 *
 * Uso:
 * <ProtectedRoute requiredRole="admin">
 *   <AdminPage />
 * </ProtectedRoute>
 */

export default ProtectedRoute;
