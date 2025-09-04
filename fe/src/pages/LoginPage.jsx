// src/pages/LoginPage.jsx - Página de inicio de sesión
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/AuthPages.css';

/**
 * PÁGINA DE LOGIN
 *
 * Esta página maneja el formulario de inicio de sesión y la autenticación.
 * Incluye validaciones del lado del cliente y manejo de estados de carga/error.
 *
 * CONCEPTOS IMPORTANTES:
 *
 * 1. ESTADO LOCAL vs ESTADO GLOBAL:
 *    - Estado local (useState): datos del formulario, errores, carga
 *    - Estado global (useAuth): información del usuario autenticado
 *
 * 2. VALIDACIÓN DEL CLIENTE:
 *    - Mejora la UX proporcionando feedback inmediato
 *    - No reemplaza la validación del servidor (solo es complementaria)
 *    - Reduce peticiones innecesarias al servidor
 *
 * 3. MANEJO DE FORMULARIOS:
 *    - Controlled components: el estado de React controla los inputs
 *    - Prevención del comportamiento por defecto del formulario
 *    - Validación en tiempo real vs al enviar
 */

const LoginPage = () => {
  // Hook de navegación para redirecciones programáticas
  const navigate = useNavigate();

  // Contexto de autenticación
  const { login, loading, isAuthenticated } = useAuth();

  /**
   * ESTADOS LOCALES DEL COMPONENTE
   *
   * Cada estado maneja una responsabilidad específica:
   */
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({}); // Errores de validación
  const [submitError, setSubmitError] = useState(''); // Error del servidor
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado de envío

  /**
   * EFECTO PARA REDIRIGIR USUARIOS YA AUTENTICADOS
   *
   * Si un usuario ya está autenticado, no debería ver la página de login.
   * Este efecto los redirige automáticamente al dashboard.
   */
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  /**
   * MANEJO DE CAMBIOS EN INPUTS
   *
   * Esta función se ejecuta cada vez que el usuario escribe en un input.
   * Actualiza el estado del formulario y limpia errores relacionados.
   *
   * ¿Por qué limpiar errores al escribir?
   * - Mejora la UX: el usuario ve que está corrigiendo el problema
   * - Evita confusión con mensajes de error obsoletos
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Actualizar datos del formulario
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar errores relacionados con este campo
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }

    // Limpiar error general si existe
    if (submitError) {
      setSubmitError('');
    }
  };

  /**
   * VALIDACIÓN DEL FORMULARIO
   *
   * Valida los datos antes de enviarlos al servidor.
   * Devuelve true si todo es válido, false si hay errores.
   */
  const validateForm = () => {
    const newErrors = {};

    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El formato del email no es válido';
    }

    // Validar password
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);

    // Retornar true si no hay errores
    return Object.keys(newErrors).length === 0;
  };

  /**
   * MANEJO DEL ENVÍO DEL FORMULARIO
   *
   * Esta función se ejecuta cuando el usuario envía el formulario.
   * Incluye validación, llamada a la API y manejo de respuestas.
   */
  const handleSubmit = async (e) => {
    // Prevenir comportamiento por defecto del formulario (recarga de página)
    e.preventDefault();

    // No procesar si ya se está enviando (evita envíos múltiples)
    if (isSubmitting) return;

    // Validar formulario
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError('');

      // Intentar login
      const result = await login(formData.email, formData.password);

      if (result.success) {
        // Login exitoso: el useEffect se encargará de la redirección
        console.log('✅ Login exitoso, redirigiendo...');
      } else {
        // Login fallido: mostrar error
        setSubmitError(result.message || 'Error al iniciar sesión');
      }
    } catch (error) {
      console.error('❌ Error en login:', error);
      setSubmitError('Error de conexión. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * RENDERIZADO CONDICIONAL DURANTE CARGA INICIAL
   *
   * Si la aplicación está verificando la autenticación,
   * mostrar un spinner en lugar del formulario.
   */
  if (loading) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <LoadingSpinner message="Verificando sesión..." />
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Header de la página */}
        <div className="auth-header">
          <h1>Iniciar Sesión</h1>
          <p>Ingresa tus credenciales para acceder</p>
        </div>

        {/* Formulario de login */}
        <form
          onSubmit={handleSubmit}
          className="auth-form"
          noValidate>
          {/* 
            noValidate: desactiva la validación nativa del navegador
            para usar nuestra validación personalizada
          */}

          {/* Error general del servidor */}
          {submitError && (
            <div className="error-message error-message--general">
              {submitError}
            </div>
          )}

          {/* Campo de email */}
          <div className="form-group">
            <label
              htmlFor="email"
              className="form-label">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`form-input ${
                errors.email ? 'form-input--error' : ''
              }`}
              placeholder="tu@email.com"
              autoComplete="email"
              disabled={isSubmitting}
            />
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          {/* Campo de password */}
          <div className="form-group">
            <label
              htmlFor="password"
              className="form-label">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`form-input ${
                errors.password ? 'form-input--error' : ''
              }`}
              placeholder="Tu contraseña"
              autoComplete="current-password"
              disabled={isSubmitting}
            />
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          {/* Botón de envío */}
          <button
            type="submit"
            className="auth-button"
            disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <LoadingSpinner size="small" />
                Iniciando sesión...
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        {/* Enlaces adicionales */}
        <div className="auth-footer">
          <p>
            ¿No tienes una cuenta?{' '}
            <Link
              to="/register"
              className="auth-link">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
