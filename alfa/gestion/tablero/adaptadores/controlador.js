// Fans Of · /gestion · TABLERO · adaptador · CONTROLADOR: lo que pasa cuando se usa la pestaña. Pone el HTML de vista.js en la página, abre el formulario, lee lo
// escrito, arrastra las tarjetas y le pide cada cosa a los casos de uso (aplicación). Es el único archivo del tablero que toca el DOM. Recibe de principal.js
// los casos, los ids de sus huecos, `esc`, `fecha` y `textoError` de /gestion; no sabe nada del servidor.
'use strict';
TABLERO.controlador = ({ casos, hueco, esc, fecha, textoError }) => {
  const el = id => document.getElementById(id);
  const filtro = {};
  let tareas = [], pedido = 0, ocupado = false;
  const aviso = texto => { el(hueco.aviso).textContent = texto; };
  const avisaError = r => aviso(r.error === 'sin-servidor' ? TABLERO.vista.mensaje(r.error) + ' (' + textoError(r.datos.causa) + ')' : TABLERO.vista.mensaje(r.error, r.datos));
  const leeFormulario = f => Object.fromEntries([...new FormData(f).entries()]);
  const cierraFormulario = () => { el(hueco.formulario).innerHTML = ''; };
  const abreFormulario = valores => {
    el(hueco.formulario).innerHTML = TABLERO.vista.formulario(valores, esc);
    el(hueco.formulario).querySelector('input[name=titulo]').focus();
  };

  async function cargar() {
    aviso('');
    const este = ++pedido, r = await casos.cargar(filtro);
    if (este !== pedido) return;   // llegó otra carga después: esta ya es vieja
    if (!r.ok) { aviso(/does not exist|PGRST202|404/.test(String(r.datos.causa && r.datos.causa.message)) ? 'Falta aplicar servidor/117-tablero.sql en Supabase.' : textoError(r.datos.causa)); return; }
    tareas = r.valor.tareas;
    el(hueco.filtros).innerHTML = TABLERO.vista.filtros(r.valor.juegos, filtro, esc);
    el(hueco.lista).innerHTML = TABLERO.vista.html(r.valor.columnas, esc, fecha)
      + (r.valor.descartadas ? `<div class="meta">${r.valor.descartadas} tareas con datos raros no se han enseñado.</div>` : '');
    el(hueco.juegos).innerHTML = r.valor.juegos.map(j => `<option value="${esc(j)}">`).join('');
  }
  const tareaDe = id => tareas.find(t => t.id === Number(id));
  // Una acción a la vez (un doble clic no crea la tarea dos veces). Si no sale, el tablero se vuelve a pintar como estaba y se dice por qué
  async function aplica(promesa, alTerminar) {
    if (ocupado) return;
    ocupado = true;
    try {
      const r = await promesa;
      if (r.ok && alTerminar) alTerminar();
      await cargar();
      if (!r.ok) avisaError(r);
    } finally { ocupado = false; }
  }
  const mueve = (id, estado) => (tareaDe(id).estado === estado ? Promise.resolve() : aplica(casos.mover(tareaDe(id), estado)));
  const guarda = f => {
    const id = Number(f.dataset.id), form = leeFormulario(f);
    return aplica(id ? casos.editar(id, form) : casos.crear(form), cierraFormulario);
  };

  function conecta() {
    el(hueco.filtros).onclick = ev => { if (ev.target.closest('[data-nueva]')) abreFormulario({}); };
    el(hueco.filtros).onchange = ev => { const s = ev.target.closest('[data-filtro]'); if (s) { filtro[s.dataset.filtro] = s.value; cargar(); } };
    el(hueco.lista).onchange = ev => { const s = ev.target.closest('[data-mover]'); if (s) mueve(s.dataset.mover, s.value); };
    el(hueco.lista).onclick = ev => { const b = ev.target.closest('[data-editar]'); if (b) abreFormulario(tareaDe(b.dataset.editar)); };
    el(hueco.formulario).onclick = ev => { if (ev.target.closest('[data-cancelar]')) cierraFormulario(); };
    el(hueco.formulario).onsubmit = ev => { ev.preventDefault(); aviso(''); guarda(ev.target); };
    conectaArrastre();
  }
  // arrastrar una tarjeta a otra columna es lo mismo que elegirla en su lista
  function conectaArrastre() {
    const lista = el(hueco.lista), col = ev => ev.target.closest('[data-columna]');
    lista.ondragstart = ev => { const t = ev.target.closest('[data-id]'); if (t) ev.dataTransfer.setData('text/plain', t.dataset.id); };
    lista.ondragover = ev => { const c = col(ev); if (c) { ev.preventDefault(); c.classList.add('encima'); } };
    lista.ondragleave = ev => { const c = col(ev); if (c && !c.contains(ev.relatedTarget)) c.classList.remove('encima'); };
    lista.ondrop = ev => { const c = col(ev); if (!c) return; ev.preventDefault(); c.classList.remove('encima'); mueve(ev.dataTransfer.getData('text/plain'), c.dataset.columna); };
  }
  return { cargar, conecta };
};
