
import './style.css';

import { actualizarInventario, actualizarSelectArticulos, actualizarRecetasGuardadas } from './modules/ui.js';
import { setupEventListeners } from './modules/eventos.js';
import { state } from './state.js';

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    // Cargar UI inicial
    actualizarInventario();
    actualizarSelectArticulos();
    actualizarRecetasGuardadas();
    
    // Configurar eventos
    setupEventListeners();
});