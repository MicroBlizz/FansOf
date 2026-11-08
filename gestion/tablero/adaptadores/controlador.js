// Fans Of · /gestion · TABLERO · adaptador · CONTROLADOR: lo que pasa cuando se usa la pestaña. Pone el HTML de vista.js y vista-detalle.js en la página, abre
// el detalle de una tarea (o el formulario) en el panel de la derecha, filtra mientras se busca, avisa de las tareas parecidas al escribir un título,
// lee lo escrito, arrastra las tarjetas y le pide cada cosa a los casos de uso
// (aplicación). Es el único archivo del tablero que toca el DOM. Recibe de principal.js los casos, los ids de sus huecos, `esc`, `fecha` y `textoError`
// de /gestion; no sabe nada del servidor.
'use strict';
TABLERO.controlador = ({ casos, hueco, esc, fecha, textoError }) => {
  const el = id => document.getElementById(id);
  const filtro = {};
  // panel: lo que enseña el panel de la derecha. null (cerrado), { id } (el detalle de esa tarea) o { formulario: valores } (nueva o editar)
  let tareas = [], columnas = [], descartadas = 0, pedido = 0, ocupado = false, panel = null, pidoParecidas = 0, esperaParecidas = null;
  const aviso = texto => { el(hueco.aviso).textContent = texto; };
  const avisaError = r => aviso(r.error === 'sin-servidor' ? TABLERO.vista.mensaje(r.error) + ' (' + textoError(r.datos.causa) + ')' : TABLERO.vista.mensaje(r.error, r.datos));
  const leeFormulario = f => Object.fromEntries([...new FormData(f).entries()]);
  const tareaDe = id => tareas.find(t => t.id === Number(id));

  const pintaTablero = () => {
    el(hueco.lista).innerHTML = TABLERO.vista.html(columnas, esc, panel && panel.id) + (descartadas ? `<div class="meta">${descartadas} tareas con datos raros no se han enseñado.</div>` : '');
  };
  // El panel se pinta según `panel`; si la tarea abierta ya no está (filtro o borrada), se cierra. El formulario no se repinta al recargar, para no perder lo escrito
  function pintaPanel(conFormulario) {
    const caja = el(hueco.detalle), t = panel && panel.id ? tareaDe(panel.id) : null;
    if (panel && panel.id && !t) panel = null;
    el(hueco.vista).classList.toggle('abierto', !!panel);
    caja.hidden = !panel;
    if (t) caja.innerHTML = TABLERO.vistaDetalle.detalle(t, esc, fecha);
    else if (panel && conFormulario) { caja.innerHTML = TABLERO.vista.formulario(panel.formulario, esc); caja.querySelector('input[name=titulo]').focus(); }
    else if (!panel) caja.innerHTML = '';
  }
  const abre = nuevo => { clearTimeout(esperaParecidas); panel = nuevo; pintaTablero(); pintaPanel(true); };
  const cierra = () => abre(null);

  async function cargar() {
    aviso('');
    const este = ++pedido, r = await casos.cargar(filtro);
    if (este !== pedido) return;   // llegó otra carga después: esta ya es vieja
    if (!r.ok) { aviso(/does not exist|PGRST202|404/.test(String(r.datos.causa && r.datos.causa.message)) ? 'Faltan los SQL del tablero en Supabase (servidor/117 a 120).' : textoError(r.datos.causa)); return; }
    ({ tareas, columnas, descartadas } = r.valor);
    el(hueco.filtros).innerHTML = TABLERO.vista.filtros(r.valor.juegos, filtro, esc);
    pintaPanel(false);
    pintaTablero();
    el(hueco.juegos).innerHTML = r.valor.juegos.map(j => `<option value="${esc(j)}">`).join('');
  }
  // Una acción a la vez (un doble clic no crea la tarea dos veces). Si no sale, el tablero se vuelve a pintar como estaba y se dice por qué
  async function aplica(promesa, alTerminar) {
    if (ocupado) return;
    ocupado = true;
    try {
      const r = await promesa;
      if (r.ok && alTerminar) alTerminar(r.valor);
      await cargar();
      if (!r.ok) avisaError(r);
    } finally { ocupado = false; }
  }
  const mueve = (id, estado) => (tareaDe(id).estado === estado ? Promise.resolve() : aplica(casos.mover(tareaDe(id), estado)));
  // al guardar, el panel enseña el detalle de la tarea guardada
  const guarda = f => {
    const id = Number(f.dataset.id), form = leeFormulario(f);
    return aplica(id ? casos.editar(id, form) : casos.crear(form), r => { panel = { id: r.id || id }; });
  };

  function conecta() {
    el(hueco.filtros).onclick = ev => {
      if (ev.target.closest('[data-nueva]')) abre({ formulario: {} });
      if (ev.target.closest('[data-refrescar]')) cargar();
    };
    el(hueco.filtros).onchange = ev => { const s = ev.target.closest('[data-filtro]'); if (s) refiltra(s.dataset.filtro, s.value); };
    el(hueco.filtros).oninput = ev => { if (ev.target.closest('[data-buscar]')) refiltra('texto', ev.target.value); };
    conectaTarjetas();
    conectaPanel();
    conectaArrastre();
  }
  // filtrar (juego, responsable o lo buscado) reparte otra vez lo ya cargado, sin ir al servidor
  function refiltra(clave, valor) {
    filtro[clave] = valor;
    columnas = casos.repartir(tareas, filtro);
    pintaTablero();
  }
  // Al escribir el título en el formulario, tras una pausa, salen las tareas parecidas (también las hechas antiguas) para no duplicar
  // `form` es el formulario donde se escribe: si al volver la respuesta ya no está en la página (se cerró o se abrió otro), no se pinta
  function buscaParecidas(titulo, form) {
    clearTimeout(esperaParecidas);
    const excluir = Number(form.dataset.id) || null;
    esperaParecidas = setTimeout(async () => {
      const este = ++pidoParecidas, r = await casos.parecidas(titulo, excluir);
      const sitio = form.querySelector('[data-parecidas]');
      if (este !== pidoParecidas || !form.isConnected || !sitio) return;   // llegó otra búsqueda después, o el formulario ya se cerró
      sitio.innerHTML = r.ok ? TABLERO.vista.parecidas(r.valor, esc) : '<span class="meta">No se han podido buscar las parecidas.</span>';
    }, 400);
  }
  function abreParecida(id) {
    if (tareaDe(id)) abre({ id: Number(id) });
    else aviso('La #' + id + ' no está en el tablero: se hizo hace más de 14 días.');
  }
  // pulsar una tarjeta (o Intro sobre ella) abre su detalle; pulsar la que ya está abierta lo cierra
  function conectaTarjetas() {
    const elige = t => abre(panel && panel.id === Number(t.dataset.id) ? null : { id: Number(t.dataset.id) });
    el(hueco.lista).onclick = ev => { const t = ev.target.closest('[data-id]'); if (t) elige(t); };
    el(hueco.lista).onkeydown = ev => { const t = ev.target.closest('[data-id]'); if (t && ev.key === 'Enter') { ev.preventDefault(); elige(t); } };
  }
  function conectaPanel() {
    const caja = el(hueco.detalle);
    caja.onclick = ev => {
      if (ev.target.closest('[data-cerrar]')) cierra();
      const b = ev.target.closest('[data-editar]');
      if (b) abre({ formulario: tareaDe(b.dataset.editar) });
      if (ev.target.closest('[data-cancelar]')) abre(panel.formulario.id ? { id: panel.formulario.id } : null);
      const p = ev.target.closest('[data-abrir]');
      if (p) abreParecida(p.dataset.abrir);
    };
    caja.oninput = ev => { if (ev.target.name === 'titulo') buscaParecidas(ev.target.value, ev.target.form); };
    caja.onchange = ev => { const s = ev.target.closest('[data-mover]'); if (s) mueve(s.dataset.mover, s.value); };
    caja.onsubmit = ev => { ev.preventDefault(); aviso(''); guarda(ev.target); };
    el(hueco.vista).onkeydown = ev => { if (ev.key === 'Escape' && panel && panel.id) cierra(); };
  }
  // arrastrar una tarjeta a otra columna es lo mismo que elegirla en el desplegable del detalle
  function conectaArrastre() {
    const lista = el(hueco.lista), col = ev => ev.target.closest('[data-columna]');
    lista.ondragstart = ev => { const t = ev.target.closest('[data-id]'); if (t) ev.dataTransfer.setData('text/plain', t.dataset.id); };
    lista.ondragover = ev => { const c = col(ev); if (c) { ev.preventDefault(); c.classList.add('encima'); } };
    lista.ondragleave = ev => { const c = col(ev); if (c && !c.contains(ev.relatedTarget)) c.classList.remove('encima'); };
    lista.ondrop = ev => { const c = col(ev); if (!c) return; ev.preventDefault(); c.classList.remove('encima'); mueve(ev.dataTransfer.getData('text/plain'), c.dataset.columna); };
  }
  return { cargar, conecta };
};
