// src/App.jsx - Componente principal de la aplicación
import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import './styles/App.css';

/**
 * COMPONENTE PRINCIPAL DE LA APLICACIÓN
 *
 * Este componente actúa como el punto central de nuestra aplicación React.
 * Aquí configuramos:
 *
 * 1. CONTEXTO DE AUTENTICACIÓN (AuthProvider):
 *    - Envuelve toda la aplicación para compartir el estado de autenticación
 *    - Permite que cualquier componente acceda a la información del usuario
 *    - Maneja el estado global de login/logout
 *
 * 2. ENRUTAMIENTO (React Router):
 *    - BrowserRouter: Habilita el enrutamiento en la aplicación
 *    - Routes: Contenedor para todas las rutas
 *    - Route: Define rutas individuales y sus componentes
 *
 * 3. RUTAS PROTEGIDAS:
 *    - Algunas rutas requieren autenticación (como Dashboard)
 *    - ProtectedRoute verifica si el usuario está autenticado
 *    - Si no está autenticado, redirige al login
 *
 * ¿Por qué usar React Router?
 * - Permite navegación entre páginas sin recargar la página (SPA - Single Page Application)
 * - Mantiene el estado de la aplicación entre navegaciones
 * - Proporciona URLs amigables y navegación por historial del navegador
 */

function App() {
  return (
    <div className="App">
      {/* AuthProvider envuelve toda la app para compartir estado de autenticación */}
      <AuthProvider>
        {/* Router habilita el enrutamiento en toda la aplicación */}
        <Router>
          <Routes>
            {/* Ruta raíz - redirige al login */}
            <Route
              path="/"
              element={
                <Navigate
                  to="/login"
                  replace
                />
              }
            />

            {/* Rutas públicas - accesibles sin autenticación */}
            <Route
              path="/login"
              element={<LoginPage />}
            />
            <Route
              path="/register"
              element={<RegisterPage />}
            />

            {/* Rutas protegidas - requieren autenticación */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Ruta catch-all para URLs no encontradas */}
            <Route
              path="*"
              element={
                <Navigate
                  to="/login"
                  replace
                />
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;
