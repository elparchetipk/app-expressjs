// src/pages/RegisterPage.jsx - Página de registro de nuevos usuarios
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/AuthPages.css';

/**
 * PÁGINA DE REGISTRO
 *
 * Similar a LoginPage pero con validaciones más complejas y campos adicionales.
 * Incluye validación de confirmación de contraseña y campos de nombres/apellidos.
 *
 * DIFERENCIAS CON LOGIN:
 * - Más campos de entrada (nombres, apellidos, confirmación de password)
 * - Validaciones más estrictas para el password
 * - Verificación de que las contraseñas coincidan
 * - Después del registro exitoso, hace login automático
 */

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, loading, isAuthenticated } = useAuth();

  /**
   * ESTADO DEL FORMULARIO DE REGISTRO
   *
   * Incluye todos los campos requeridos según los RF's:
   * - email, nombres, apellidos, password
   * - passwordConfirm para validación adicional
   */
  const [formData, setFormData] = useState({
    email: '',
    nombres: '',
    apellidos: '',
    password: '',
    passwordConfirm: '',
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  /**
   * MANEJO DE CAMBIOS EN INPUTS
   * Igual que en LoginPage pero con más campos
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar errores relacionados
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }

    if (submitError) {
      setSubmitError('');
    }
  };

  /**
   * VALIDACIÓN EXTENDIDA DEL FORMULARIO
   *
   * Incluye validaciones específicas para cada campo según los RF's:
   * - Email: formato válido
   * - Nombres/Apellidos: solo letras y espacios, longitud mínima/máxima
   * - Password: criterios de seguridad
   * - Confirmación: debe coincidir con password
   */
  const validateForm = () => {
    const newErrors = {};

    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El formato del email no es válido';
    }

    // Validar nombres
    if (!formData.nombres.trim()) {
      newErrors.nombres = 'Los nombres son requeridos';
    } else if (formData.nombres.trim().length < 2) {
      newErrors.nombres = 'Los nombres deben tener al menos 2 caracteres';
    } else if (formData.nombres.trim().length > 100) {
      newErrors.nombres = 'Los nombres no pueden exceder 100 caracteres';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.nombres.trim())) {
      newErrors.nombres = 'Los nombres solo pueden contener letras y espacios';
    }

    // Validar apellidos
    if (!formData.apellidos.trim()) {
      newErrors.apellidos = 'Los apellidos son requeridos';
    } else if (formData.apellidos.trim().length < 2) {
      newErrors.apellidos = 'Los apellidos deben tener al menos 2 caracteres';
    } else if (formData.apellidos.trim().length > 100) {
      newErrors.apellidos = 'Los apellidos no pueden exceder 100 caracteres';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.apellidos.trim())) {
      newErrors.apellidos =
        'Los apellidos solo pueden contener letras y espacios';
    }

    // Validar password (criterios de los RF's)
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else {
      const password = formData.password;
      const errors_pass = [];

      if (password.length < 8) {
        errors_pass.push('mínimo 8 caracteres');
      }
      if (!/[A-Z]/.test(password)) {
        errors_pass.push('al menos 1 mayúscula');
      }
      if (!/[a-z]/.test(password)) {
        errors_pass.push('al menos 1 minúscula');
      }
      if (!/\d/.test(password)) {
        errors_pass.push('al menos 1 número');
      }

      if (errors_pass.length > 0) {
        newErrors.password = `La contraseña debe tener: ${errors_pass.join(
          ', '
        )}`;
      }
    }

    // Validar confirmación de password
    if (!formData.passwordConfirm) {
      newErrors.passwordConfirm = 'Confirma tu contraseña';
    } else if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * MANEJO DEL ENVÍO DEL FORMULARIO
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError('');

      // Preparar datos para enviar (sin passwordConfirm)
      const userData = {
        email: formData.email.trim(),
        nombres: formData.nombres.trim(),
        apellidos: formData.apellidos.trim(),
        password: formData.password,
      };

      // Intentar registro
      const result = await register(userData);

      if (result.success) {
        console.log('✅ Registro exitoso, redirigiendo...');
        // El useEffect se encargará de la redirección
      } else {
        setSubmitError(result.message || 'Error al registrar usuario');
      }
    } catch (error) {
      console.error('❌ Error en registro:', error);
      setSubmitError('Error de conexión. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
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
        {/* Header */}
        <div className="auth-header">
          <h1>Crear Cuenta</h1>
          <p>Completa el formulario para registrarte</p>
        </div>

        {/* Formulario */}
        <form
          onSubmit={handleSubmit}
          className="auth-form"
          noValidate>
          {/* Error general */}
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
              Email *
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

          {/* Nombres y apellidos en una fila */}
          <div className="form-row">
            <div className="form-group">
              <label
                htmlFor="nombres"
                className="form-label">
                Nombres *
              </label>
              <input
                type="text"
                id="nombres"
                name="nombres"
                value={formData.nombres}
                onChange={handleInputChange}
                className={`form-input ${
                  errors.nombres ? 'form-input--error' : ''
                }`}
                placeholder="Juan Carlos"
                autoComplete="given-name"
                disabled={isSubmitting}
              />
              {errors.nombres && (
                <span className="error-message">{errors.nombres}</span>
              )}
            </div>

            <div className="form-group">
              <label
                htmlFor="apellidos"
                className="form-label">
                Apellidos *
              </label>
              <input
                type="text"
                id="apellidos"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleInputChange}
                className={`form-input ${
                  errors.apellidos ? 'form-input--error' : ''
                }`}
                placeholder="García López"
                autoComplete="family-name"
                disabled={isSubmitting}
              />
              {errors.apellidos && (
                <span className="error-message">{errors.apellidos}</span>
              )}
            </div>
          </div>

          {/* Campo de password */}
          <div className="form-group">
            <label
              htmlFor="password"
              className="form-label">
              Contraseña *
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
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              disabled={isSubmitting}
            />
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
            <small className="form-help">
              Debe contener: mayúscula, minúscula, número y mínimo 8 caracteres
            </small>
          </div>

          {/* Confirmación de password */}
          <div className="form-group">
            <label
              htmlFor="passwordConfirm"
              className="form-label">
              Confirmar Contraseña *
            </label>
            <input
              type="password"
              id="passwordConfirm"
              name="passwordConfirm"
              value={formData.passwordConfirm}
              onChange={handleInputChange}
              className={`form-input ${
                errors.passwordConfirm ? 'form-input--error' : ''
              }`}
              placeholder="Repite tu contraseña"
              autoComplete="new-password"
              disabled={isSubmitting}
            />
            {errors.passwordConfirm && (
              <span className="error-message">{errors.passwordConfirm}</span>
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
                Creando cuenta...
              </>
            ) : (
              'Crear Cuenta'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          <p>
            ¿Ya tienes una cuenta?{' '}
            <Link
              to="/login"
              className="auth-link">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
