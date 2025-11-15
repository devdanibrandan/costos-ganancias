import { state } from '../state.js';

const actualizarInventario = () => {
    const tbody = document.querySelector('#tabla-inventario tbody');
    if (!tbody) return;
    
    tbody.innerHTML = state.inventario.map((item, index) => {
        const precioUnitario = (item.precio / item.cantidad).toFixed(2);
        return `
            <tr>
                <td>${item.nombre}</td>
                <td>${item.cantidad} ${item.unidad}</td>
                <td>$${precioUnitario}/${item.unidad}</td>
                <td class="acciones">
                    <button class="btn-editInv" data-idx="${index}">✏️ Editar</button>
                    <button class="btn-deleteInv" data-idx="${index}">🗑️ Eliminar</button>
                </td>
            </tr>
        `;
    }).join('');
};

//lista de articulos del select en la receta
const actualizarSelectArticulos = () => {
    const select = document.getElementById('select-articulo');
    if (!select) return;
    select.innerHTML = state.inventario.map(item => `
        <option value="${item.nombre}">
            ${item.nombre} ($${(item.precio / item.cantidad).toFixed(2)}/${item.unidad})
        </option>
    `).join('');
}

const actualizarRecetaActual = () => {
    const tabla = document.querySelector('#tabla-receta tbody');
    tabla.innerHTML = state.recetaActual.items.map((item, index) => `
        <tr>
            <td>${item.nombre}</td>
            <td>${item.cantidad} ${item.unidad}</td>
            <td>$${item.precioUnitario.toFixed(2)}</td>
            <td>$${item.costo.toFixed(2)}</td>
            <td><button class="btn-deleteRec" data-idx="${index}">🗑️Eliminar</button></td>
        </tr>
    `).join('');
}

const actualizarRecetasGuardadas = () => {
    const lista = document.getElementById('lista-recetas');
    lista.innerHTML = state.recetas.map((receta, index) => `
        <li>
            <span>${receta.nombre} ($${receta.costoTotal.toFixed(2)})</span>
            <div>
                <button class="btn-edit" data-idx="${index}">✏️Editar</button>
                <button class="btn-clone" data-idx="${index}">⎘Clonar</button>
                <button class="btn-delete" data-idx="${index}">🗑️Eliminar</button>
            </div>
        </li>
    `).join('');
}

const actualizarResultados = () => {
    document.getElementById('costo-total').textContent = 
        state.recetaActual.costoTotal.toFixed(2);
    document.getElementById('precio-venta').textContent = 
        (state.recetaActual.costoTotal * (1 + (parseFloat(document.getElementById('porcentaje').value) || 0) / 100)).toFixed(2);
}


export {
    actualizarInventario,
    actualizarSelectArticulos,
    actualizarRecetaActual,
    actualizarRecetasGuardadas,
    actualizarResultados
};