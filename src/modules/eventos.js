import { 
    agregarArticuloAlInventario, 
    eliminarArticuloDelInventario, 
    agregarIngredienteAReceta, 
    calcularCostos, 
    cargarRecetasGuardadas, 
    guardarReceta, 
    abrirModalEdicion, 
    clonarReceta, 
    guardarCambiosReceta, 
    cerrarModalEdicion,
    prepararEdicionInventario
} from './acciones.js';

import { state } from '../state.js';
import { actualizarInventario } from './ui.js';

export function setupEventListeners() {

    document.getElementById('btn-add-inv').addEventListener('click', agregarArticuloAlInventario);

    document.addEventListener('click', eliminarArticuloDelInventario);

    document.getElementById('btn-add-rec').addEventListener('click', agregarIngredienteAReceta);

    document.getElementById('btn-guardar').addEventListener('click', guardarReceta);

    document.getElementById('btn-guardar-cambios').addEventListener('click', guardarCambiosReceta);

    document.querySelector('.close').addEventListener('click', cerrarModalEdicion);

    document.getElementById('btn-calcular').addEventListener('click', calcularCostos);

    
    document.querySelector('#tabla-inventario tbody').addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-editInv')) {
            e.preventDefault();
            const index = parseInt(e.target.dataset.idx);
            prepararEdicionInventario(index);
        }
    });

    document.querySelectorAll('btn-save-inv').forEach(btn => {
        btn.addEventListener('click', (e) => {
            actualizarInventario();
        });
    });


    // Agregar eventos a los botones
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            /* alert('Editar receta'); */
            abrirModalEdicion(e.target.getAttribute('data-idx'));
        });
    });

    document.getElementById('porcentaje').addEventListener('input', () => {
        calcularCostos();
        cargarRecetasGuardadas(); // Actualiza la lista con nuevos precios
    });
    
    //Eliminar receta
    document.querySelectorAll('.btn-delete').forEach(btn => {

        btn.addEventListener('click', (e) => {
            
            const index = e.target.getAttribute('data-idx');
            if (confirm('¿Estás seguro de que quieres eliminar esta receta?')) {
                state.recetas.splice(index, 1);
                localStorage.setItem('recetas', JSON.stringify(state.recetas));
                cargarRecetasGuardadas(); // Actualiza la lista
            }
        });
    });

    // Clonar receta
    document.querySelectorAll('.btn-clone').forEach(btn => {
        btn.addEventListener('click', (e) => {
            clonarReceta(e.target.getAttribute('data-idx'));
        });
        // Evento para actualizar costos al cambiar el porcentaje en Recetas Guardadas
        document.getElementById('porcentaje').addEventListener('input', () => {
            calcularCostos();
            cargarRecetasGuardadas(); // Actualiza la lista con nuevos precios
        });
    });

    document.querySelector('#tabla-inventario tbody').addEventListener('click', (e) => {
        const row = e.target.closest('tr');
        if (!row) return;
        
        if (e.target.classList.contains('btn-edit')) {
            e.preventDefault();
            const index = parseInt(e.target.dataset.idx);
            prepararEdicionInventario(index);
        }
        
        if (e.target.classList.contains('btn-delete')) {
            e.preventDefault();
            const index = parseInt(e.target.dataset.idx);
            eliminarArticuloDelInventario(index);
        }
    });

}