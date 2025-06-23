import { state } from '../state.js';
import { Recetas } from './recetas.js';

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

    static editarItem(index) {
        if (index < 0 || index >= state.inventario.length) {
            console.error("Índice de inventario inválido para edición:", index);
            return null;
        }

        return JSON.parse(JSON.stringify(state.inventario[index]));
    }

    static guardarItemEditado(itemEditado, indexOriginal) {
        if (indexOriginal < 0 || indexOriginal >= state.inventario.length) {
            console.error("Índice de inventario inválido para guardar edición:", indexOriginal);
            return false;
        }

        // Validar el item editado
        if (!itemEditado.nombre || !itemEditado.unidad || 
            isNaN(itemEditado.cantidad) || itemEditado.cantidad <= 0 || 
            isNaN(itemEditado.precio) || itemEditado.precio <= 0) {
            console.error("Artículo editado inválido:", itemEditado);
            alert("El artículo no tiene datos válidos");
            return false;
        }

        // Verificar si el nombre fue cambiado y ya existe
        const nombreOriginal = state.inventario[indexOriginal].nombre;
        if (nombreOriginal !== itemEditado.nombre) {
            const existeNuevoNombre = state.inventario.some(
                (item, idx) => idx !== indexOriginal && 
                item.nombre.toLowerCase() === itemEditado.nombre.toLowerCase()
            );

            if (existeNuevoNombre) {
                alert(`Ya existe un artículo llamado "${itemEditado.nombre}" en el inventario`);
                return false;
            }
        }

        state.inventario[indexOriginal] = itemEditado;
        localStorage.setItem('inventario', JSON.stringify(state.inventario));
        return true;
    }

    static eliminarItem(index) {
        if (index < 0 || index >= state.inventario.length) {
            console.error("Índice de inventario inválido para eliminación:", index);
            return false;
        }

        const nombreArticulo = state.inventario[index].nombre;

        // Verificar si el artículo está en uso en alguna receta
        if (Recetas.articuloEnUso(nombreArticulo)) {
            alert(`No se puede eliminar "${nombreArticulo}" porque está siendo usado en una o más recetas`);
            return false;
        }

        if (confirm(`¿Eliminar "${nombreArticulo}" del inventario?`)) {
            state.inventario.splice(index, 1);
            localStorage.setItem('inventario', JSON.stringify(state.inventario));
            return true;
        }

        return false;
    }

    static getPrecioUnitario(nombre) {
        const item = state.inventario.find(i => i.nombre === nombre);
        return item ? (item.precio / item.cantidad) : 0;
    }

    static getUnidad(nombre) {
        const item = state.inventario.find(i => i.nombre === nombre);
        return item ? item.unidad : '';
    }

    static buscarItem(nombre) {
        return state.inventario.find(item => 
            item.nombre.toLowerCase().includes(nombre.toLowerCase())
        );
    }

    static obtenerTodos() {
        return JSON.parse(JSON.stringify(state.inventario));
    }
}