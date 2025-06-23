import { Inventario } from './inventario.js';
import { state } from '/src/state.js';
import { Recetas } from './recetas.js';
import { 
    actualizarInventario, 
    actualizarSelectArticulos, 
    actualizarRecetaActual, 
    actualizarResultados 
} from './ui.js';

const agregarArticuloAlInventario = () => {
    const index = parseInt(document.getElementById('item-index').value);
    const nombre = document.getElementById('inv-nombre').value.trim();
    const cantidad = parseFloat(document.getElementById('inv-cantidad').value);
    const unidad = document.getElementById('inv-unidad').value;
    const precio = parseFloat(document.getElementById('inv-precio').value);

    if (!nombre || isNaN(cantidad) || !unidad || isNaN(precio)) {
        alert("Por favor completa todos los campos correctamente");
        return;
    }

    const item = { nombre, cantidad, unidad, precio };

    if (index >= 0 && index < state.inventario.length) {
        // Modo edición
        state.inventario[index] = item;
    } else {
        // Modo agregar nuevo
        state.inventario.push(item);
    }

    localStorage.setItem('inventario', JSON.stringify(state.inventario));
    actualizarInventario();
    actualizarSelectArticulos();
    limpiarFormularioInventario();
}

const limpiarFormularioInventario = () => {
    document.getElementById('item-index').value = -1;
    document.getElementById('inv-nombre').value = '';
    document.getElementById('inv-cantidad').value = '';
    document.getElementById('inv-unidad').selectedIndex = 0;
    document.getElementById('inv-precio').value = '';
    document.getElementById('btn-add-inv').textContent = "➕ Agregar";
    /* document.getElementById('btn-cancel-inv').style.display = 'none'; */
}

const eliminarArticuloDelInventario = (index) => {
    if (index >= 0 && index < state.inventario.length) {
        const nombreArticulo = state.inventario[index].nombre;
        
        // Verificar si el artículo está siendo usado en alguna receta
        const enUso = state.recetas.some(receta => 
            receta.items.some(item => item.nombre === nombreArticulo)
        );
        
        if (enUso) {
            alert(`No se puede eliminar "${nombreArticulo}" porque está siendo usado en una o más recetas`);
            return;
        }
        
        if (confirm(`¿Eliminar "${nombreArticulo}" del inventario?`)) {
            state.inventario.splice(index, 1);
            localStorage.setItem('inventario', JSON.stringify(state.inventario));
            actualizarInventario();
            
            // Si estábamos editando este artículo, cancelar edición
            if (parseInt(document.getElementById('item-index').value) === index) {
                limpiarFormularioInventario();
            }
        }
    }
};

const prepararEdicionInventario = (index) => {
    if (index >= 0 && index < state.inventario.length) {
        const item = state.inventario[index];
        document.getElementById('item-index').value = index;
        document.getElementById('inv-nombre').value = item.nombre;
        document.getElementById('inv-cantidad').value = item.cantidad;
        document.getElementById('inv-unidad').value = item.unidad;
        document.getElementById('inv-precio').value = item.precio;
        
        // Cambiar texto del botón y mostrar guardar
        document.getElementById('btn-add-inv').textContent = "💾 Guardar Cambios";
        
        // Resaltar el formulario
        document.getElementById('form-inventario').classList.add('editing');
        
        // Enfocar el primer campo
        document.getElementById('inv-nombre').focus();
    }
};


const agregarIngredienteAReceta = () => {

    const nombre = document.getElementById('select-articulo').value;
    const cantidad = parseFloat(document.getElementById('rec-cantidad').value);
    let precio = document.getElementById('inv-precio').value;
    
    if (!nombre || !cantidad) return;
    
    precio = precio ? parseFloat(precio) : Inventario.getPrecioUnitario(nombre);
    const unidad = state.inventario.find(item => item.nombre === nombre)?.unidad || '';
    
    Recetas.agregarIngrediente(nombre, cantidad, precio, unidad);
    actualizarRecetaActual();
    actualizarResultados();
    
    // Limpiar campos
    document.getElementById('rec-cantidad').value = '';
    document.getElementById('inv-precio').value = '';

}

const calcularCostos = () => {

    const porcentaje = parseFloat(document.getElementById('porcentaje').value) || 0;
    state.recetaActual.costoTotal = state.recetaActual.items.reduce((sum, item) => sum + item.costo, 0);
    const precioVenta = state.recetaActual.costoTotal * (1 + porcentaje / 100);

    document.getElementById('costo-total').textContent = state.recetaActual.costoTotal.toFixed(2);
    document.getElementById('precio-venta').textContent = precioVenta.toFixed(2);
}

const cargarRecetasGuardadas = () => {
        
    const listaRecetas = document.getElementById('lista-recetas');
    listaRecetas.innerHTML = '';
    const porcentaje = parseFloat(document.getElementById('porcentaje').value) || 0;
    
    state.recetas.forEach((receta, index) => {
        const precioVenta = receta.costoTotal * (1 + porcentaje / 100);
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="receta-info">
                <span class="receta-nombre">${receta.nombre}</span>
                <div class="receta-detalle">
                    <span>Costo: $${receta.costoTotal.toFixed(2)}</span>
                    <span>Venta: $${precioVenta.toFixed(2)}</span>
                    <span>Margen: ${porcentaje}%</span>
                </div>
            </div>
            <div class="receta-acciones">
                <button class="btn-action btn-edit" data-idx="${index}">✏️ Editar</button>
                <button class="btn-action btn-clone" data-idx="${index}">⎘ Clonar</button>
                <button class="btn-delete" data-idx="${index}">🗑️ Eliminar</button>
            </div>
        `;
        listaRecetas.appendChild(li);
    });

    // Agregar eventos a los botones

    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            alert('Editar receta');
            abrirModalEdicion(e.target.getAttribute('data-idx'));
        });
    });

    document.querySelectorAll('.btn-clone').forEach(btn => {
        btn.addEventListener('click', (e) => {

            clonarReceta(e.target.getAttribute('data-idx'));
        });
    });

    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            alert('Eliminar receta');
            eliminarReceta(e.target.getAttribute('data-idx'));
        });
    });
}

const guardarReceta = () => {
    const nombre = document.getElementById('nombre-receta').value.trim();
    if (!nombre || state.recetaActual.items.length === 0) {
        alert("Por favor ingresa un nombre para la receta y añade al menos un ingrediente");
        return;
    }

    // Verificar si ya existe una receta con ese nombre
    const recetaExistente = state.recetas.find(r => r.nombre.toLowerCase() === nombre.toLowerCase());
    
    if (recetaExistente) {
        if (!confirm(`Ya existe una receta llamada "${nombre}". ¿Deseas reemplazarla?`)) {
            return;
        }
        // Eliminar la receta existente
        const index = state.recetas.indexOf(recetaExistente);
        state.recetas.splice(index, 1);
    }

    state.recetaActual.nombre = nombre;
    state.recetas.push({...state.recetaActual});
    localStorage.setItem('recetas', JSON.stringify(state.recetas));
    
    cargarRecetasGuardadas();
    resetRecetaActual();
    
    // Mostrar notificación de éxito
    alert(`Receta "${nombre}" guardada correctamente`);
}

const resetRecetaActual = () => {
    state.recetaActual = { nombre: "", items: [], costoTotal: 0 };
    document.getElementById('nombre-receta').value = '';
    const tablaReceta = document.querySelector('#tabla-receta tbody');
    tablaReceta.innerHTML = '';
    calcularCostos();
}

const abrirModalEdicion = (index) => {
    // Convertir index a número para evitar errores de tipo
    index = Number(index);
    // 1. Validación inicial del índice
    if (index === null || index === undefined || isNaN(index) || index < 0 || index >= state.recetas.length) {
        console.error("Índice de receta inválido:", index);
        alert("Error: Receta no encontrada");
        return;
    }

    const receta = state.recetas[index];
    if (!receta) {
        console.error("Receta no existe en el índice:", index);
        alert("Error: Datos de receta corruptos");
        return;
    }

    // 2. Inicialización segura de items
    if (!Array.isArray(receta.items)) {
        console.warn("Receta.items no es array, inicializando...");
        receta.items = [];
    }

    const modal = document.getElementById('modal-editar');
    if (!modal) {
        console.error("Modal no encontrado en el DOM");
        return;
    }

    // 3. Cálculos con valores por defecto
    const porcentaje = parseFloat(document.getElementById('porcentaje')?.value) || 0;
    const precioVenta = (receta.costoTotal || 0) * (1 + porcentaje / 100);

    // 4. Construcción del HTML con botones para agregar/eliminar
    document.getElementById('modal-titulo').textContent = receta.nombre || "Receta sin nombre";
    
    const contenido = document.getElementById('modal-contenido');
    contenido.innerHTML = `
        <div class="modal-header">
            <input type="text" id="edit-nombre" value="${escapeHTML(receta.nombre)}" class="full-width">
            <div class="modal-totales">
                <span>Costo Total: $${(receta.costoTotal || 0).toFixed(2)}</span>
                <span>Precio Venta (${porcentaje}%): $${precioVenta.toFixed(2)}</span>
            </div>
        </div>
        <div class="modal-controls">
            <select id="select-ingrediente-modal" class="select-ingrediente">
                <option value="">Seleccionar Ingrediente</option>
                ${state.inventario.map(item => 
                    `<option value="${item.nombre}" data-precio="${item.precio}">
                        ${escapeHTML(item.nombre)} ($${item.precio.toFixed(2)})
                    </option>`
                ).join('')}
            </select>
            <input type="number" id="cantidad-ingrediente" placeholder="Cantidad" step="0.01" min="0" value="1">
            <button id="agregar-ingrediente-modal" class="btn-agregar">➕ Agregar</button>
        </div>
        <table class="edit-table">
            <thead>
                <tr>
                    <th>Ingrediente</th>
                    <th>Cantidad</th>
                    <th>Precio/U</th>
                    <th>Costo</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody id="items-receta">
                ${receta.items.map((item, i) => {
                    if (!item) {
                        console.warn(`Ítem ${i} es nulo, omitiendo`);
                        return '';
                    }
                    return `
                    <tr data-index="${i}">
                        <td>${escapeHTML(item.nombre)}</td>
                        <td><input type="number" value="${item.cantidad || 0}" 
                            data-index="${i}" 
                            data-field="cantidad" 
                            step="0.01"></td>
                        <td><input type="number" value="${(item.precioUnitario || 0).toFixed(2)}" 
                            data-index="${i}" 
                            data-field="precioUnitario" 
                            step="0.01"></td>
                        <td>$${((item.cantidad || 0) * (item.precioUnitario || 0)).toFixed(2)}</td>
                        <td><button class="btn-eliminar" data-index="${i}">🗑️Eliminar</button></td>
                    </tr>`;
                }).join('')}
            </tbody>
        </table>
        `;
        

    // 5. Event listeners para edición de campos
    contenido.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('input', (e) => {
            const row = e.target.closest('tr');
            if (!row) return;
            
            const idx = parseInt(row.getAttribute('data-index'));
            const field = e.target.getAttribute('data-field');
            const value = parseFloat(e.target.value) || 0;

            // Validación
            if (isNaN(idx) || idx < 0 || idx >= receta.items.length || !receta.items[idx]) {
                console.error("Índice de item no válido durante edición:", idx);
                return;
            }

            // Actualización del item
            receta.items[idx][field] = value;
            
            // Recalcular costo
            const item = receta.items[idx];
            const costo = (item.cantidad || 0) * (item.precioUnitario || 0);
            const costoCell = row.querySelector('td:nth-child(4)');
            if (costoCell) {
                costoCell.textContent = `$${costo.toFixed(2)}`;
            }

            // Actualizar totales
            receta.costoTotal = receta.items.reduce((sum, item) => sum + (item.cantidad * item.precioUnitario), 0);
            document.querySelector('.modal-totales span:first-child').textContent = 
                `Costo Total: $${receta.costoTotal.toFixed(2)}`;
            
            const nuevoPorcentaje = parseFloat(document.getElementById('porcentaje')?.value) || 0;
            const nuevoPrecioVenta = receta.costoTotal * (1 + nuevoPorcentaje / 100);
            document.querySelector('.modal-totales span:last-child').textContent = 
                `Precio Venta (${nuevoPorcentaje}%): $${nuevoPrecioVenta.toFixed(2)}`;
        });
    });

    // 6. Event listener para agregar ingredientes
    document.getElementById('agregar-ingrediente-modal').addEventListener('click', () => {
        const select = document.getElementById('select-ingrediente-modal');
        const selectedOption = select.options[select.selectedIndex];
        const cantidad = parseFloat(document.getElementById('cantidad-ingrediente').value) || 0;
        
        if (!selectedOption.value) {
            alert("Por favor selecciona un ingrediente");
            return;
        }
        
        if (cantidad <= 0) {
            alert("La cantidad debe ser mayor que cero");
            return;
        }
        
        const precioUnitario = parseFloat(selectedOption.getAttribute('data-precio')) || 0;
        const nombreIngrediente = selectedOption.value;
        
        // Verificar si el ingrediente ya existe en la receta
        const ingredienteExistenteIndex = receta.items.findIndex(item => item.nombre === nombreIngrediente);
        
        if (ingredienteExistenteIndex >= 0) {
            // Si existe, preguntar si queremos sumar la cantidad
            if (confirm("Este ingrediente ya está en la receta. ¿Deseas sumar esta cantidad a la existente?")) {
                receta.items[ingredienteExistenteIndex].cantidad += cantidad;
                
                // Actualizar la fila en la tabla
                const existingRow = document.querySelector(`tr[data-index="${ingredienteExistenteIndex}"]`);
                if (existingRow) {
                    existingRow.querySelector('input[data-field="cantidad"]').value = 
                        receta.items[ingredienteExistenteIndex].cantidad;
                    const costo = receta.items[ingredienteExistenteIndex].cantidad * 
                        receta.items[ingredienteExistenteIndex].precioUnitario;
                        existingRow.querySelector('td:nth-child(4)').textContent = `$${costo.toFixed(2)}`;
                }
            }
        } else {
            // Si no existe, agregar nuevo ingrediente
            const nuevoItem = {
                nombre: nombreIngrediente,
                cantidad: cantidad,
                precioUnitario: precioUnitario
            };
            
            receta.items.push(nuevoItem);
            const newIndex = receta.items.length - 1;
            
            const tbody = document.getElementById('items-receta');
            const newRow = document.createElement('tr');
            newRow.setAttribute('data-index', newIndex);
            newRow.innerHTML = `
                <td>${escapeHTML(nuevoItem.nombre)}</td>
                <td><input type="number" value="${nuevoItem.cantidad}" 
                    data-index="${newIndex}" 
                    data-field="cantidad" 
                    step="0.01"></td>
                <td><input type="number" value="${nuevoItem.precioUnitario.toFixed(2)}" 
                    data-index="${newIndex}" 
                    data-field="precioUnitario" 
                    step="0.01"></td>
                <td>$${(nuevoItem.cantidad * nuevoItem.precioUnitario).toFixed(2)}</td>
                <td><button class="btn-eliminar" data-index="${newIndex}">Eliminar</button></td>
            `;
            
            tbody.appendChild(newRow);
            
            // Agregar event listeners a los nuevos inputs
            newRow.querySelectorAll('input').forEach(input => {
                input.addEventListener('input', (e) => {
                    const row = e.target.closest('tr');
                    const idx = parseInt(row.getAttribute('data-index'));
                    const field = e.target.getAttribute('data-field');
                    const value = parseFloat(e.target.value) || 0;

                    receta.items[idx][field] = value;
                    
                    const item = receta.items[idx];
                    const costo = (item.cantidad || 0) * (item.precioUnitario || 0);
                    const costoCell = row.querySelector('td:nth-child(4)');
                    if (costoCell) {
                        costoCell.textContent = `$${costo.toFixed(2)}`;
                    }

                    // Actualizar totales
                    receta.costoTotal = receta.items.reduce((sum, item) => sum + (item.cantidad * item.precioUnitario), 0);
                    document.querySelector('.modal-totales span:first-child').textContent = 
                        `Costo Total: $${receta.costoTotal.toFixed(2)}`;
                    
                    const nuevoPorcentaje = parseFloat(document.getElementById('porcentaje')?.value) || 0;
                    const nuevoPrecioVenta = receta.costoTotal * (1 + nuevoPorcentaje / 100);
                    document.querySelector('.modal-totales span:last-child').textContent = 
                        `Precio Venta (${nuevoPorcentaje}%): $${nuevoPrecioVenta.toFixed(2)}`;
                });
            });
            
            // Agregar event listener al botón eliminar
            newRow.querySelector('.btn-eliminar').addEventListener('click', (e) => {
                const idx = parseInt(e.target.getAttribute('data-index'));
                if (confirm("¿Estás seguro de eliminar este ingrediente de la receta?")) {
                    receta.items.splice(idx, 1);
                    row.remove();
                    
                    // Actualizar índices de las filas restantes
                    document.querySelectorAll('#items-receta tr').forEach((tr, i) => {
                        tr.setAttribute('data-index', i);
                        tr.querySelector('.btn-eliminar').setAttribute('data-index', i);
                    });
                    
                    // Actualizar totales
                    receta.costoTotal = receta.items.reduce((sum, item) => sum + (item.cantidad * item.precioUnitario), 0);
                    document.querySelector('.modal-totales span:first-child').textContent = 
                        `Costo Total: $${receta.costoTotal.toFixed(2)}`;
                    
                    const nuevoPorcentaje = parseFloat(document.getElementById('porcentaje')?.value) || 0;
                    const nuevoPrecioVenta = receta.costoTotal * (1 + nuevoPorcentaje / 100);
                    document.querySelector('.modal-totales span:last-child').textContent = 
                        `Precio Venta (${nuevoPorcentaje}%): $${nuevoPrecioVenta.toFixed(2)}`;
                }
            });
        }
        
        // Resetear controles de agregar
        select.selectedIndex = 0;
        document.getElementById('cantidad-ingrediente').value = '1';
    });

    // 7. Event listeners para botones eliminar existentes
    contenido.querySelectorAll('.btn-eliminar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(e.target.getAttribute('data-index'));
            const row = e.target.closest('tr');
            
            if (confirm("¿Estás seguro de eliminar este ingrediente de la receta?")) {
                receta.items.splice(idx, 1);
                row.remove();
                
                // Actualizar índices de las filas restantes
                document.querySelectorAll('#items-receta tr').forEach((tr, i) => {
                    tr.setAttribute('data-index', i);
                    tr.querySelector('.btn-eliminar').setAttribute('data-index', i);
                });
                
                // Actualizar totales
                receta.costoTotal = receta.items.reduce((sum, item) => sum + (item.cantidad * item.precioUnitario), 0);
                document.querySelector('.modal-totales span:first-child').textContent = 
                    `Costo Total: $${receta.costoTotal.toFixed(2)}`;
                
                const nuevoPorcentaje = parseFloat(document.getElementById('porcentaje')?.value) || 0;
                const nuevoPrecioVenta = receta.costoTotal * (1 + nuevoPorcentaje / 100);
                document.querySelector('.modal-totales span:last-child').textContent = 
                    `Precio Venta (${nuevoPorcentaje}%): $${nuevoPrecioVenta.toFixed(2)}`;
            }
        });
    });

    modal.style.display = 'block';
};

const escapeHTML = (str) => {
    if (!str) return '';
    return str.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

const guardarCambiosReceta =() => {

    const modal = document.getElementById('modal-editar');
    const nombre = document.getElementById('edit-nombre').value;
    
    // Actualizar receta
    const recetaIndex = state.recetas.findIndex(r => r.nombre === modal.querySelector('#modal-titulo').textContent);
    state.recetas[recetaIndex].nombre = nombre;
    state.recetas[recetaIndex].costoTotal = state.recetas[recetaIndex].items.reduce((sum, item) => sum + (item.cantidad * item.precioUnitario), 0);
    
    localStorage.setItem('recetas', JSON.stringify(state.recetas));
    modal.style.display = 'none';
    cargarRecetasGuardadas();
}

const clonarReceta = (index) => {
    const recetaOriginal = state.recetas[index];
    const nuevaReceta = JSON.parse(JSON.stringify(recetaOriginal));
    nuevaReceta.nombre = `${recetaOriginal.nombre} (Copia)`;
    state.recetas.push(nuevaReceta);
    localStorage.setItem('recetas', JSON.stringify(state.recetas));
    cargarRecetasGuardadas();
}

const eliminarReceta = (index) => {
    if (index >= 0 && index < state.recetas.length) {
        if (confirm(`¿Estás seguro de eliminar la receta "${state.recetas[index].nombre}"?`)) {
            state.recetas.splice(index, 1);
            localStorage.setItem('recetas', JSON.stringify(state.recetas));
            cargarRecetasGuardadas();
        }
    }
}

const cerrarModalEdicion = () => {
    document.getElementById('modal-editar').style.display = 'none';
}

export {
    agregarArticuloAlInventario,
    eliminarArticuloDelInventario,
    agregarIngredienteAReceta,
    calcularCostos,
    cargarRecetasGuardadas,
    guardarReceta,
    abrirModalEdicion,
    guardarCambiosReceta,
    clonarReceta,
    cerrarModalEdicion,
    prepararEdicionInventario
}