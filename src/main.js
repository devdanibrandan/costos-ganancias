
import './style.css';

import { UI } from './modules/ui.js';
import { setupEventListeners } from './modules/eventos.js';
import { state } from './state.js';

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    // Cargar UI inicial
    UI.actualizarInventario();
    UI.actualizarSelectArticulos();
    UI.actualizarRecetasGuardadas();
    
    // Configurar eventos
    setupEventListeners();
});