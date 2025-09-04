// src/main.jsx - Punto de entrada principal de la aplicación React
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/index.css';

/**
 * PUNTO DE ENTRADA DE LA APLICACIÓN REACT
 *
 * Este archivo es el punto de entrada principal de nuestra aplicación React.
 * Aquí se renderiza el componente App dentro del elemento HTML con id='root'
 *
 * ¿Por qué se usa React.StrictMode?
 * - Activa verificaciones adicionales y advertencias durante el desarrollo
 * - Ayuda a identificar componentes con efectos secundarios inseguros
 * - Detecta patrones de código deprecados o problemáticos
 * - Solo funciona en modo desarrollo, no afecta la producción
 */

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
