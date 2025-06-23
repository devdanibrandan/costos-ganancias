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
        if (!state.recetaActual.nombre || state.recetaActual.items.length === 0) {
            alert("Debes ingresar un nombre para la receta y agregar al menos un ingrediente");
            return false;
        }
        
        // Verificar si ya existe una receta con el mismo nombre
        const recetaExistenteIndex = state.recetas.findIndex(
            r => r.nombre.toLowerCase() === state.recetaActual.nombre.toLowerCase()
        );
        
        if (recetaExistenteIndex >= 0) {
            if (!confirm(`Ya existe una receta llamada "${state.recetaActual.nombre}". ¿Deseas reemplazarla?`)) {
                return false;
            }
            state.recetas.splice(recetaExistenteIndex, 1);
        }
        
        state.recetas.push({...state.recetaActual});
        localStorage.setItem('recetas', JSON.stringify(state.recetas));
        
        this.resetearRecetaActual();
        return true;
    }

    static clonarReceta(index) {
        if (index < 0 || index >= state.recetas.length) {
            console.error("Índice de receta inválido para clonación:", index);
            return false;
        }
        
        const receta = JSON.parse(JSON.stringify(state.recetas[index]));
        receta.nombre = `${receta.nombre} (Copia)`;
        state.recetas.push(receta);
        localStorage.setItem('recetas', JSON.stringify(state.recetas));
        return true;
    }

    static eliminarReceta(index) {
        if (index < 0 || index >= state.recetas.length) {
            console.error("Índice de receta inválido para eliminación:", index);
            return false;
        }
        
        state.recetas.splice(index, 1);
        localStorage.setItem('recetas', JSON.stringify(state.recetas));
        return true;
    }

    static abrirModalEdicion(index) {
        if (index < 0 || index >= state.recetas.length) {
            console.error("Índice de receta inválido para edición:", index);
            alert("Receta no encontrada");
            return null;
        }

        const recetaOriginal = state.recetas[index];
        if (!recetaOriginal) {
            console.error("Receta no encontrada en el índice:", index);
            alert("Receta no encontrada");
            return null;
        }
        const receta = JSON.parse(JSON.stringify(recetaOriginal));
        
        // Validar estructura de la receta
        if (!receta.items || !Array.isArray(receta.items)) {
            console.warn("Receta con estructura inválida, inicializando items");
            receta.items = [];
        }
        
        return receta;
    }

    static guardarRecetaEditada(recetaEditada, indexOriginal) {
        if (indexOriginal < 0 || indexOriginal >= state.recetas.length) {
            console.error("Índice de receta inválido para guardar edición:", indexOriginal);
            return false;
        }
        
        // Validar la receta editada
        if (!recetaEditada.nombre || !Array.isArray(recetaEditada.items)) {
            console.error("Receta editada inválida:", recetaEditada);
            alert("La receta no tiene un nombre válido o ingredientes");
            return false;
        }
        
        // Actualizar costo total
        recetaEditada.costoTotal = recetaEditada.items.reduce(
            (sum, item) => sum + (item.cantidad * item.precioUnitario), 0
        );
        
        state.recetas[indexOriginal] = recetaEditada;
        localStorage.setItem('recetas', JSON.stringify(state.recetas));
        return true;
    }

    static resetearRecetaActual() {
        state.recetaActual = { 
            nombre: "", 
            items: [], 
            costoTotal: 0 
        };
    }

    // Nueva función para verificar uso en recetas
    static articuloEnUso(nombreArticulo) {
        return state.recetas.some(receta => 
            receta.items.some(item => item.nombre === nombreArticulo)
        );
    }
}