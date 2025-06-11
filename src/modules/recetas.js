import { state } from '../state.js';

export class Recetas {
    static agregarIngrediente(nombre, cantidad, precioUnitario, unidad) {
        state.recetaActual.items.push({
            nombre,
            cantidad,
            unidad,
            precioUnitario,
            costo: cantidad * precioUnitario
        });
        this.actualizarCostoTotal();
    }

    static actualizarCostoTotal() {
        state.recetaActual.costoTotal = state.recetaActual.items
            .reduce((sum, item) => sum + item.costo, 0);
    }

    static guardarReceta() {
        if (!state.recetaActual.nombre || state.recetaActual.items.length === 0) return false;
        
        state.recetas.push({...state.recetaActual});
        localStorage.setItem('recetas', JSON.stringify(state.recetas));
        
        // Resetear receta actual
        state.recetaActual = { nombre: "", items: [], costoTotal: 0 };
        return true;
    }

    static clonarReceta(index) {
        const receta = JSON.parse(JSON.stringify(state.recetas[index]));
        receta.nombre = `${receta.nombre} (Copia)`;
        state.recetas.push(receta);
        localStorage.setItem('recetas', JSON.stringify(state.recetas));
    }

    static eliminarReceta(index) {
        state.recetas.splice(index, 1);
        localStorage.setItem('recetas', JSON.stringify(state.recetas));
    }

    static editarReceta(index) {
        state.recetaActual = JSON.parse(JSON.stringify(state.recetas[index]));
        // Aquí podrías abrir un modal o actualizar la UI para editar la receta
        return state.recetaActual;
    }
}