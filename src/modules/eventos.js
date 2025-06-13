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
    cerrarModalEdicion
} from './acciones.js';

export function setupEventListeners() {

    document.getElementById('btn-add-inv').addEventListener('click', agregarArticuloAlInventario);

    document.addEventListener('click', eliminarArticuloDelInventario);

    document.getElementById('btn-add-rec').addEventListener('click', agregarIngredienteAReceta);

    document.getElementById('btn-guardar').addEventListener('click', guardarReceta);

    document.getElementById('btn-guardar-cambios').addEventListener('click', guardarCambiosReceta);

    document.querySelector('.close').addEventListener('click', cerrarModalEdicion);

    document.getElementById('btn-calcular').addEventListener('click', calcularCostos);

    // Agregar eventos a los botones
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            abrirModalEdicion(e.target.getAttribute('data-idx'));
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
}