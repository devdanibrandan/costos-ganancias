// localhost para simular almaceniamiento de datos

export const state = {
    inventario: JSON.parse(localStorage.getItem('inventario')) || [],
    recetas: JSON.parse(localStorage.getItem('recetas')) || [],
    recetaActual: {
        nombre: "",
        items: [],
        costoTotal: 0
    }
};