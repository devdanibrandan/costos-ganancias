import { Inventario } from './inventario.js';
import { Recetas } from './recetas.js';
import { UI } from './ui.js';
import { state } from '/src/state.js';

export function setupEventListeners() {

    // Agregar artículo al inventario
    document.getElementById('btn-add-inv').addEventListener('click', () => {
        const nombre = document.getElementById('inv-nombre').value.trim();
        const cantidad = parseFloat(document.getElementById('inv-cantidad').value);
        const unidad = document.getElementById('inv-unidad').value.trim();
        const precio = parseFloat(document.getElementById('inv-precio').value);

        if (nombre && !isNaN(cantidad) && unidad && !isNaN(precio)) {
            Inventario.agregarItem(nombre, cantidad, unidad, precio);
            UI.actualizarInventario();
            UI.actualizarSelectArticulos();
            // Limpiar campos
            document.getElementById('inv-nombre').value = '';
            document.getElementById('inv-cantidad').value = '';
            document.getElementById('inv-precio').value = '';
        }
    });

    // Eliminar artículo del inventario o receta
    document.addEventListener('click', (e) => {

        if (e.target.classList.contains('btn-delete')) {
            const index = e.target.dataset.idx;
            
            if (e.target.closest('#tabla-inventario')) {
                if (confirm(`¿Eliminar ${state.inventario[index].nombre} del inventario?`)) {
                    Inventario.eliminarItem(index);
                    UI.actualizarInventario();
                    UI.actualizarSelectArticulos();
                }
            }
            else if (e.target.closest('#tabla-receta')) {
            // Elimina solo la fila y actualiza cálculos
                const row = e.target.closest('tr');
                row.style.opacity = '0';
                setTimeout(() => {
                    row.remove();
                    state.recetaActual.items.splice(index, 1);
                    Recetas.actualizarCostoTotal();
                    UI.actualizarResultados();
                }, 300); // Animación de fade out
            }
            else if (e.target.closest('#lista-recetas')) {
            if (confirm(`¿Eliminar la receta "${state.recetas[index].nombre}"?`)) {
                // Animación de eliminación
                const li = e.target.closest('li');
                li.style.transform = 'translateX(-100%)';
                li.style.opacity = '0';
                setTimeout(() => {
                    Recetas.eliminarReceta(index);
                    li.remove();
                }, 300);
            }
        }
        }
    });

    // Agregar ingrediente a receta
    document.getElementById('btn-add-rec').addEventListener('click', () => {

        const nombre = document.getElementById('select-articulo').value;
        const cantidad = parseFloat(document.getElementById('rec-cantidad').value);
        let precio = document.getElementById('inv-precio').value;
        
        if (!nombre || !cantidad) return;
        
        precio = precio ? parseFloat(precio) : Inventario.getPrecioUnitario(nombre);
        const unidad = state.inventario.find(item => item.nombre === nombre)?.unidad || '';
        
        Recetas.agregarIngrediente(nombre, cantidad, precio, unidad);
        UI.actualizarRecetaActual();
        UI.actualizarResultados();
        
        // Limpiar campos
        document.getElementById('rec-cantidad').value = '';
        document.getElementById('inv-precio').value = '';

    });

    // Calcular costos
    function calcularCostos() {

        const porcentaje = parseFloat(document.getElementById('porcentaje').value) || 0;
        state.recetaActual.costoTotal = state.recetaActual.items.reduce((sum, item) => sum + item.costo, 0);
        const precioVenta = state.recetaActual.costoTotal * (1 + porcentaje / 100);

        document.getElementById('costo-total').textContent = state.recetaActual.costoTotal.toFixed(2);
        document.getElementById('precio-venta').textContent = precioVenta.toFixed(2);
    }

    // Cargar recetas guardadas
    function cargarRecetasGuardadas() {
        
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
                    <button class="btn-delete" data-idx="${index}">🗑️</button>
                </div>
            `;
            listaRecetas.appendChild(li);
        });

        // Agregar eventos a los botones
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                abrirModalEdicion(e.target.getAttribute('data-idx'));
            });
        });

        document.querySelectorAll('.btn-clone').forEach(btn => {
            btn.addEventListener('click', (e) => {
                clonarReceta(e.target.getAttribute('data-idx'));
            });
        });
    }

    // Guardar receta
    document.getElementById('btn-guardar').addEventListener('click', () => {
        const nombre = document.getElementById('nombre-receta').value.trim();
        if (!nombre || state.recetaActual.items.length === 0) return;

        state.recetaActual.nombre = nombre;
        state.recetas.push({...state.recetaActual});
        localStorage.setItem('recetas', JSON.stringify(state.recetas));
        
        cargarRecetasGuardadas();
        state.recetaActual = { nombre: "", items: [], costoTotal: 0 };
        document.getElementById('nombre-receta').value = '';
        const tablaReceta = document.querySelector('#tabla-receta tbody');
        tablaReceta.innerHTML = '';
        calcularCostos();
    });

        // Agregar eventos a los botones
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                abrirModalEdicion(e.target.getAttribute('data-idx'));
            });
        });
        // Clonar receta
        document.querySelectorAll('.btn-clone').forEach(btn => {

            btn.addEventListener('click', (e) => {
                clonarReceta(e.target.getAttribute('data-idx'));
            });
        // Evento para actualizar costos al cambiar el porcentaje en Recetas Guardadas
        document.getElementById('porcentaje').addEventListener('input', () => {
            calcularCostos();
            cargarRecetasGuardadas(); // Actualiza la lista con nuevos precios
        });
    });

    // Abrir modal de edición
    function abrirModalEdicion(index) {
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

        // 4. Construcción segura del HTML
        try {
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
                <table class="edit-table">
                    <thead>
                        <tr>
                            <th>Ingrediente</th>
                            <th>Cantidad</th>
                            <th>Precio/U</th>
                            <th>Costo</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${receta.items.map((item, i) => {
                            if (!item) {
                                console.warn(`Ítem ${i} es nulo, omitiendo`);
                                return '';
                            }
                            return `
                            <tr>
                                <td>${escapeHTML(item.nombre)}</td>
                                <td><input type="number" value="${item.cantidad || 0}" 
                                    data-index="${i}" 
                                    data-field="cantidad" 
                                    step="0.01"></td>
                            <td><input type="number" value="${(item.precioUnitario || 0).toFixed(2)}" 
                                    data-index="${i}" 
                                    data-field="precio" 
                                    step="0.01"></td>
                                <td>$${((item.cantidad || 0) * (item.precioUnitario || 0)).toFixed(2)}</td>
                            </tr>`;
                        }).join('')}
                    </tbody>
                </table>`;

        // 5. Event listeners con validación reforzada
        contenido.querySelectorAll('input[type="number"]').forEach(input => {
            input.addEventListener('input', () => {
                const idx = parseInt(input.getAttribute('data-index'));
                const field = input.getAttribute('data-field');
                const value = parseFloat(input.value) || 0;

                // Validación exhaustiva
                if (isNaN(idx) || idx < 0 || idx >= receta.items.length || !receta.items[idx]) {
                    console.error("Índice de item no válido durante edición:", idx);
                    return;
                }

                if (!['cantidad', 'precio'].includes(field)) {
                    console.error("Campo inválido:", field);
                    return;
                }

                // Actualización segura
                receta.items[idx][field] = value;
                
                // Recalcular costo
                const item = receta.items[idx];
                const costo = (item.cantidad || 0) * (item.precioUnitario || 0);
                const row = input.closest('tr');
                if (row) {
                    const costoCell = row.querySelector('td:last-child');
                    if (costoCell) {
                        costoCell.textContent = `$${costo.toFixed(2)}`;
                    }
                }

                // Actualizar totales (opcional)
                receta.costoTotal = receta.items.reduce((sum, i) => sum + (i.cantidad * i.precioUnitario), 0);
                document.querySelector('.modal-totales span:first-child').textContent = 
                    `Costo Total: $${receta.costoTotal.toFixed(2)}`;
            });
        });

        modal.style.display = 'block';

    } catch (error) {
        console.error("Error al abrir modal:", error);
        alert("Error al cargar la receta");
    }
}

    // Función auxiliar para seguridad (añadir al inicio del archivo)
    function escapeHTML(str) {
        if (!str) return '';
        return str.toString()
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }
    // Guardar cambios en modal
    document.getElementById('btn-guardar-cambios').addEventListener('click', () => {
        const modal = document.getElementById('modal-editar');
        const nombre = document.getElementById('edit-nombre').value;
        
        // Actualizar receta
        const recetaIndex = state.recetas.findIndex(r => r.nombre === modal.querySelector('#modal-titulo').textContent);
        state.recetas[recetaIndex].nombre = nombre;
        state.recetas[recetaIndex].costoTotal = state.recetas[recetaIndex].items.reduce((sum, item) => sum + (item.cantidad * item.precioUnitario), 0);
        
        localStorage.setItem('recetas', JSON.stringify(state.recetas));
        modal.style.display = 'none';
        cargarRecetasGuardadas();
    });

    // Clonar receta
    function clonarReceta(index) {
        const recetaOriginal = state.recetas[index];
        const nuevaReceta = JSON.parse(JSON.stringify(recetaOriginal));
        nuevaReceta.nombre = `${recetaOriginal.nombre} (Copia)`;
        state.recetas.push(nuevaReceta);
        localStorage.setItem('recetas', JSON.stringify(state.recetas));
        cargarRecetasGuardadas();
    }
    // Cerrar modal de edición Recetas
    document.querySelector('.close').addEventListener('click', () => {

        document.getElementById('modal-editar').style.display = 'none';

    });

    // Evento para calcular costos en Recetas
    document.getElementById('btn-calcular').addEventListener('click', calcularCostos);
    
    }
