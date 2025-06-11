import { state } from '../state.js';

export class Inventario {
    
    static agregarItem(nombre, cantidad, unidad, precio) {
        state.inventario.push({ nombre, cantidad, unidad, precio });
        localStorage.setItem('inventario', JSON.stringify(state.inventario));
    }

    static eliminarItem(index) {

        state.inventario.splice(index, 1);
        localStorage.setItem('inventario', JSON.stringify(state.inventario));
    }

    static getPrecioUnitario(nombre) {
        
        const item = state.inventario.find(i => i.nombre === nombre);
        return item ? item.precio / item.cantidad : 0;
    }
}