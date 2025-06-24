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

}