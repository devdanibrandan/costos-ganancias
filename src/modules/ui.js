import { state } from '../state.js';

const actualizarInventario = () => {        
    const tbody = document.querySelector('#tabla-inventario tbody');
    // Agrega solo nuevos elementos sin recrear toda la tabla
    const existingRows = Array.from(tbody.children);
    
    state.inventario.forEach((item, index) => {
        if (!existingRows[index]) {
            const tr = document.createElement('tr');
            tr.innerHTML = generarFilaInventario(item, index);
            tbody.appendChild(tr);
        }
    });
    
    // Elimina filas sobrantes (si las hay)
    while (tbody.children.length > state.inventario.length) {
        tbody.lastChild.remove();
    }
}

const generarFilaInventario = (item, index) => {
    console.log(item, index);
    return `
        <td>${item.nombre}</td>
        <td>${item.cantidad} ${item.unidad}</td>
        <td>$${(item.precio / item.cantidad).toFixed(2)}/${item.unidad}</td>
        <td><button class="btn-delete" data-idx="${index}">🗑️</button></td>
    `;
}

const actualizarSelectArticulos = () => {
    const select = document.getElementById('select-articulo');
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
            <td><button class="btn-delete" data-idx="${index}">🗑️</button></td>
        </tr>
    `).join('');
}

const actualizarRecetasGuardadas = () => {
    const lista = document.getElementById('lista-recetas');
    lista.innerHTML = state.recetas.map((receta, index) => `
        <li>
            <span>${receta.nombre} ($${receta.costoTotal.toFixed(2)})</span>
            <div>
                <button class="btn-edit" data-idx="${index}">✏️</button>
                <button class="btn-clone" data-idx="${index}">⎘</button>
                <button class="btn-delete" data-idx="${index}">🗑️</button>
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