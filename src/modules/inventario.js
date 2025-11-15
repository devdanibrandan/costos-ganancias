import { state } from '../state.js';

export class Inventario {
    static agregarItem(nombre, cantidad, unidad, precio) {
        // Validación de datos
        if (!nombre || !unidad || isNaN(cantidad) || cantidad <= 0 || isNaN(precio) || precio <= 0) {
            console.error("Datos inválidos para agregar artículo al inventario");
            return false;
        }

        // Verificar si el artículo ya existe
        const itemExistenteIndex = state.inventario.findIndex(
            item => item.nombre.toLowerCase() === nombre.toLowerCase()
        );

        if (itemExistenteIndex >= 0) {
            if (!confirm(`"${nombre}" ya existe en el inventario. ¿Deseas actualizarlo?`)) {
                return false;
            }
            // Modo actualización
            state.inventario[itemExistenteIndex] = { nombre, cantidad, unidad, precio };
        } else {
            // Modo creación
            state.inventario.push({ nombre, cantidad, unidad, precio });
        }

        localStorage.setItem('inventario', JSON.stringify(state.inventario));
        return true;
    }

    static getPrecioUnitario(nombre) {
        const item = state.inventario.find(i => i.nombre === nombre);
        return item ? (item.precio / item.cantidad) : 0;
    }

}