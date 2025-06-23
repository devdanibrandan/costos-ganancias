import './style.css';
import { actualizarInventario, actualizarSelectArticulos, actualizarRecetasGuardadas } from './modules/ui.js';
import { setupEventListeners } from './modules/eventos.js';
import { state } from './state.js';

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    // Cargar datos del localStorage si existen
    state.inventario = JSON.parse(localStorage.getItem('inventario')) || [];
    state.recetas = JSON.parse(localStorage.getItem('recetas')) || [];
    
    // Cargar UI inicial
    actualizarInventario();
    actualizarSelectArticulos();
    actualizarRecetasGuardadas();
    
    // Configurar eventos
    setupEventListeners();
    setupTabs();
});

// Controlador de pestañas principal
function setupTabs() {
    // Pestañas principales
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Desactivar todos
            document.querySelectorAll('.tab-btn, .tab-content').forEach(el => {
                el.classList.remove('active');
            });
            
            // Activar el seleccionado
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
            
            // Guardar en localStorage
            localStorage.setItem('activeTab', tabId);
        });
    });
    
    // Pestañas secundarias (solo para recetas)
    const subTabButtons = document.querySelectorAll('.sub-tab-btn');
    
    subTabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Desactivar todos los subtabs en esta sección
            const parent = button.closest('.tab-content');
            if (!parent) return;
            parent.querySelectorAll('.sub-tab-btn, .sub-tab-content').forEach(el => {
                el.classList.remove('active');
            });
            
            // Activar el seleccionado
            button.classList.add('active');
            const subTabId = button.getAttribute('data-subtab');
            const subTabContent = parent.querySelector(`#${subTabId}`);
            if (subTabContent) {
                subTabContent.classList.add('active');
            }
        });
    });
    
    // Cargar última pestaña activa
    const savedTab = localStorage.getItem('activeTab');
    if (savedTab) {
        document.querySelector(`.tab-btn[data-tab="${savedTab}"]`)?.click();
    }
}