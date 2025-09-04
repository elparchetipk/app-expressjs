// src/pages/DashboardPage.jsx - Página principal después del login
import React from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/Dashboard.css';

/**
 * PÁGINA DEL DASHBOARD
 *
 * Esta página sirve como ejemplo de:
 * 1. RUTA PROTEGIDA: Solo usuarios autenticados pueden acceder
 * 2. USO DEL CONTEXTO: Acceso a la información del usuario desde useAuth()
 * 3. MANEJO DE LOGOUT: Función para cerrar sesión
 * 4. INTERFAZ POST-LOGIN: Página de bienvenida después de autenticarse
 *
 * En una aplicación real, aquí estarían:
 * - Resumen de datos del usuario
 * - Navegación a diferentes secciones
 * - Contenido específico según roles
 * - Estadísticas o métricas relevantes
 */

const DashboardPage = () => {
  // Acceso al contexto de autenticación para obtener datos del usuario
  const { user, logout, loading } = useAuth();

  /**
   * FUNCIÓN PARA MANEJAR EL LOGOUT
   *
   * Esta función llama al logout del contexto, que:
   * 1. Limpia el token del localStorage
   * 2. Resetea el estado global del usuario
   * 3. Redirige automáticamente al login (manejado por ProtectedRoute)
   */
  const handleLogout = async () => {
    try {
      await logout();
      // La redirección se maneja automáticamente por el contexto y ProtectedRoute
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Mostrar loading mientras se procesa alguna operación
  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header del dashboard */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1>🎯 Dashboard - Sistema de Autenticación</h1>
          <button
            onClick={handleLogout}
            className="logout-button"
            title="Cerrar sesión">
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="dashboard-main">
        {/* Tarjeta de bienvenida */}
        <section className="welcome-section">
          <div className="welcome-card">
            <h2>
              ¡Bienvenido/a, {user?.nombres} {user?.apellidos}! 🎉
            </h2>
            <p className="welcome-subtitle">
              Has iniciado sesión exitosamente en el sistema de autenticación
            </p>
          </div>
        </section>

        {/* Información del usuario */}
        <section className="user-info-section">
          <div className="info-card">
            <h3>📋 Información del Usuario</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>ID:</label>
                <span>{user?.id}</span>
              </div>
              <div className="info-item">
                <label>Email:</label>
                <span>{user?.email}</span>
              </div>
              <div className="info-item">
                <label>Nombres:</label>
                <span>{user?.nombres}</span>
              </div>
              <div className="info-item">
                <label>Apellidos:</label>
                <span>{user?.apellidos}</span>
              </div>
              <div className="info-item">
                <label>Registrado:</label>
                <span>
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString('es-ES')
                    : 'No disponible'}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Información educativa */}
        <section className="educational-section">
          <div className="educational-card">
            <h3>🎓 Conceptos Implementados</h3>
            <div className="concepts-grid">
              <div className="concept-item">
                <h4>🔐 Autenticación JWT</h4>
                <p>Token seguro para mantener la sesión del usuario</p>
              </div>
              <div className="concept-item">
                <h4>🛡️ Rutas Protegidas</h4>
                <p>Solo usuarios autenticados pueden acceder a esta página</p>
              </div>
              <div className="concept-item">
                <h4>🔄 Context API</h4>
                <p>Estado global compartido para la autenticación</p>
              </div>
              <div className="concept-item">
                <h4>🎨 React Router</h4>
                <p>Navegación SPA sin recargar la página</p>
              </div>
              <div className="concept-item">
                <h4>💾 LocalStorage</h4>
                <p>Persistencia del token para mantener sesiones</p>
              </div>
              <div className="concept-item">
                <h4>🔒 Validaciones</h4>
                <p>Frontend y backend validan datos de entrada</p>
              </div>
            </div>
          </div>
        </section>

        {/* Características técnicas */}
        <section className="technical-section">
          <div className="technical-card">
            <h3>⚙️ Características Técnicas</h3>
            <ul className="feature-list">
              <li>✅ Monorepo con pnpm workspaces</li>
              <li>✅ Backend Express.js con SQLite</li>
              <li>✅ Frontend React con Vite</li>
              <li>✅ Encriptación de passwords con bcrypt</li>
              <li>✅ Validación de datos con express-validator</li>
              <li>✅ Manejo de CORS para desarrollo</li>
              <li>✅ Variables de entorno para configuración</li>
              <li>✅ Comentarios educativos en todo el código</li>
            </ul>
          </div>
        </section>

        {/* Próximos pasos sugeridos */}
        <section className="next-steps-section">
          <div className="next-steps-card">
            <h3>🚀 Próximos Pasos Sugeridos</h3>
            <ul className="steps-list">
              <li>Agregar roles de usuario (admin, user)</li>
              <li>Implementar refresh tokens</li>
              <li>Añadir validación de email</li>
              <li>Crear funcionalidad de "olvidé mi contraseña"</li>
              <li>Implementar rate limiting</li>
              <li>Agregar logs de auditoría</li>
              <li>Implementar tests unitarios</li>
              <li>Añadir documentación de API con Swagger</li>
            </ul>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="dashboard-footer">
        <p>📚 Sistema de Autenticación - Herramienta de Aprendizaje SENA</p>
      </footer>
    </div>
  );
};

export default DashboardPage;
