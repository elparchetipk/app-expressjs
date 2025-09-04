// src/components/LoadingSpinner.jsx - Componente de spinner de carga reutilizable
import React from 'react';
import '../styles/LoadingSpinner.css';

/**
 * COMPONENTE LOADING SPINNER
 *
 * Un spinner es esencial para una buena experiencia de usuario (UX).
 * Indica al usuario que algo está sucediendo en segundo plano.
 *
 * ¿Cuándo usar spinners?
 * - Peticiones HTTP que pueden tardar
 * - Verificación de autenticación
 * - Carga de datos pesados
 * - Cualquier operación asíncrona visible para el usuario
 *
 * ¿Por qué crear un componente reutilizable?
 * - Consistencia visual en toda la aplicación
 * - Fácil mantenimiento y cambios de diseño
 * - Reduce duplicación de código
 * - Permite personalización sin afectar otros usos
 */

const LoadingSpinner = ({ size = 'medium', message = '', className = '' }) => {
  /**
   * PROPS EXPLICADAS:
   *
   * @param {string} size - Tamaño del spinner ('small', 'medium', 'large')
   * @param {string} message - Mensaje opcional para mostrar debajo del spinner
   * @param {string} className - Clases CSS adicionales para personalización
   */

  // Determinar clases CSS basadas en el tamaño
  const sizeClass =
    {
      small: 'spinner--small',
      medium: 'spinner--medium',
      large: 'spinner--large',
    }[size] || 'spinner--medium';

  return (
    <div className={`loading-spinner ${className}`}>
      {/* 
        Spinner CSS puro usando border y animation
        Alternativas: usar bibliotecas como react-spinners o iconos SVG
      */}
      <div className={`spinner ${sizeClass}`}></div>

      {/* Mensaje opcional */}
      {message && <p className="spinner-message">{message}</p>}
    </div>
  );
};

/**
 * VARIACIONES DEL COMPONENTE:
 *
 * 1. Con overlay completo:
 * const LoadingOverlay = ({ children, loading }) => {
 *   if (!loading) return children
 *
 *   return (
 *     <div className="loading-overlay">
 *       <div className="overlay-backdrop" />
 *       <LoadingSpinner size="large" message="Cargando..." />
 *     </div>
 *   )
 * }
 *
 * 2. Con skeleton loading:
 * const SkeletonLoader = () => (
 *   <div className="skeleton">
 *     <div className="skeleton-line" />
 *     <div className="skeleton-line" />
 *     <div className="skeleton-line short" />
 *   </div>
 * )
 */

export default LoadingSpinner;
