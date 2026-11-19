// Fans Of · /gestion: la NAVEGACIÓN (tarea #162, ADR 161). Una barra con cuatro botones (abajo y fija en el móvil, arriba en el ordenador): Tablero, Juegos,
// Jugadores y Ajustes. Cada uno tiene sus pestañas debajo (Tablero: Tablero, Cola y SQL; Jugadores: Cuentas, Métricas, Comentarios, Roles y Rendimiento;
// Ajustes: Flags, Config y lo que no diga su grupo). «Juegos» enseña la lista de todos los juegos de la biblioteca con buscador (catalogo.js); al elegir uno
// salen sus pestañas y «Todos los juegos» para volver.
// Cada archivo de sección se apunta con GESTION_NAV.seccion({ id, pan, etiqueta, orden, juego?, grupo?, cargar? }): sin `juego` es una pestaña común (su grupo,
// de GRUPO_DE o de `grupo`); con `juego: '<id>'` es solo de ese juego, y con `juego: '*'` sale en todos (cargar recibe el id del juego).
// Quien cambia la etiqueta de una pestaña (por ejemplo, con un contador) usa GESTION_NAV.etiqueta(id, texto, juego?). Esto solo muestra y oculta: no sabe de datos.
'use strict';
const GESTION_NAV = (() => {
  // Los juegos de antes de la tarea #162 (los que tenían botón): los usan los tests de las secciones; la lista de verdad es el catálogo
  const JUEGOS = [['rumble', 'Rumble'], ['td', 'TD'], ['survivors', 'Survivors'], ['decks', 'Decks'], ['tacticas', 'Tácticas'], ['nova', 'Nova'], ['crush', 'Crush'], ['ratkov', 'Ratkov'], ['rouflage', 'Rouflage'], ['taxi', 'Taxi'], ['paperwork', 'Paperwork']];
  const ICONO = {
    tablero: '<rect x="3" y="4" width="5" height="16" rx="1"/><rect x="10" y="4" width="5" height="11" rx="1"/><rect x="17" y="4" width="4" height="7" rx="1"/>',
    juegos: '<rect x="2" y="7" width="20" height="11" rx="5"/><path d="M7 11v3M5.5 12.5h3"/><circle cx="16" cy="11.5" r=".8"/><circle cx="18" cy="13.5" r=".8"/>',
    jugadores: '<circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.5 3-5.5 6-5.5s6 2 6 5.5"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.5c3 0 5 1.8 5 4.5"/>',
    ajustes: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
  };
  const GRUPOS = [['tablero', 'Tablero'], ['juegos', 'Juegos'], ['jugadores', 'Jugadores'], ['ajustes', 'Ajustes']];
  const GRUPO_DE = { tablero: 'tablero', cola: 'tablero', sql: 'tablero', cuentas: 'jugadores', metricas: 'jugadores', votos: 'jugadores', roles: 'jugadores', rend: 'jugadores' };
  const S = [], el = id => document.getElementById(id);
  const recuerda = {};   // la pestaña abierta en cada grupo o juego
  let grupo = 'tablero', juego = null, catalogo = [], abiertas = {}, filtroJuegos = '', textoJuegos = '';
  const seccion = s => { S.push(s); };
  const grupoDe = s => s.grupo || GRUPO_DE[s.id] || 'ajustes';
  const ambito = () => (juego ? juego : grupo);
  const de = () => S.filter(s => (juego ? s.juego === juego || s.juego === '*' : !s.juego && grupoDe(s) === grupo)).sort((x, y) => (x.orden || 0) - (y.orden || 0));
  const buscar = (id, j) => S.find(s => s.id === id && (j ? s.juego === j || s.juego === '*' : !s.juego));
  const nombreDe = id => ((catalogo.find(j => j.id === id) || {}).nombre || (JUEGOS.find(([j]) => j === id) || [])[1] || id);
  // Los juegos con pestañas propias en /gestion (más allá de Resumen y Reportes de prueba): una sección solo suya o su sección en el Resumen (GESTION_JUEGOS)
  const propias = () => [...new Set([...S.filter(s => s.juego && s.juego !== '*').map(s => s.juego), ...Object.keys(typeof GESTION_JUEGOS === 'object' ? GESTION_JUEGOS : {})])];
  const boton = ([id, t]) => `<button type="button" data-g="${id}"${id === grupo ? ' class="activa" aria-current="page"' : ''}><svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${ICONO[id]}</svg>${t}</button>`;
  const pestana = (s, id) => `<button type="button" data-s="${s.id}"${s.id === id ? ' class="activa"' : ''}>${s.etiqueta}</button>`;
  function pintaJuegos() {
    el('pan-juegos').innerHTML = GESTION_CATALOGO.html(catalogo, { texto: textoJuegos, filtro: filtroJuegos, propias: propias(), abiertas }, esc);
  }
  function pinta() {
    el('menu').innerHTML = GRUPOS.map(boton).join('');
    S.forEach(s => { el(s.pan).hidden = true; });
    el('pan-juegos').hidden = !(grupo === 'juegos' && !juego);
    if (grupo === 'juegos' && !juego) { el('tabs').hidden = true; pintaJuegos(); return; }
    const L = de(), a = ambito(), id = recuerda[a] && L.some(s => s.id === recuerda[a]) ? recuerda[a] : (L[0] || {}).id;
    const volver = juego ? `<button type="button" class="nav-volver" data-volver>Todos los juegos</button><b class="nav-juego">${esc(nombreDe(juego))}</b>` : '';
    el('tabs').innerHTML = volver + L.map(s => pestana(s, id)).join('');
    el('tabs').hidden = !juego && L.length < 2;
    const s = L.find(x => x.id === id); if (!s) return;
    el(s.pan).hidden = false; recuerda[a] = id;
    if (s.cargar) s.cargar(juego, nombreDe(juego));
  }
  // ir('global', id) abre una pestaña común (en su grupo); ir('<juego>', id?) abre ese juego dentro de «Juegos»
  function ir(donde, id) {
    if (!donde || donde === 'global') { const s = id && buscar(id); juego = null; if (s) { grupo = grupoDe(s); recuerda[grupo] = id; } }
    else { grupo = 'juegos'; juego = donde; if (id) recuerda[donde] = id; }
    pinta();
  }
  function etiqueta(id, texto, j) {
    const s = buscar(id, j); if (!s) return;
    s.etiqueta = texto; const b = el('tabs').querySelector(`button[data-s="${id}"]`); if (b && (!j || j === juego)) b.textContent = texto;
  }
  // La lista de juegos sale de la biblioteca y el número de tareas, del tablero; si algo falla, se ven los juegos de siempre sin cifras
  async function cargaCatalogo() {
    try { const r = await fetch('../index.html', { cache: 'no-store' }); catalogo = GESTION_CATALOGO.leer(await r.text()); }
    catch (e) { catalogo = JUEGOS.map(([id, nombre]) => ({ id, nombre, tipo: 'Prototipo', color: '#56ccf2' })); }
    try { abiertas = GESTION_CATALOGO.abiertasPorJuego((await rpc('gestion_tareas', { p_token: leerToken() })).tareas); } catch (e) { abiertas = {}; }
    if (grupo === 'juegos' && !juego) pintaJuegos();
  }
  function conectaJuegos() {
    el('pan-juegos').onclick = ev => {
      const j = ev.target.closest('[data-juego]'), f = ev.target.closest('[data-filtro-juegos]');
      if (j) ir(j.dataset.juego);
      else if (f) { filtroJuegos = f.dataset.filtroJuegos; pintaJuegos(); }
    };
    el('pan-juegos').oninput = ev => {   // solo se repinta la lista, para no perder el foco del buscador
      if (!ev.target.closest('[data-buscar-juego]')) return;
      textoJuegos = ev.target.value;
      const caja = document.createElement('div'); caja.innerHTML = GESTION_CATALOGO.html(catalogo, { texto: textoJuegos, filtro: filtroJuegos, propias: propias(), abiertas }, esc);
      el('pan-juegos').querySelector('[data-lista-juegos]').replaceWith(caja.querySelector('[data-lista-juegos]'));
    };
  }
  function arranca() {
    el('menu').onclick = ev => { const b = ev.target.closest('button[data-g]'); if (b) { grupo = b.dataset.g; juego = null; pinta(); if (grupo === 'juegos') cargaCatalogo(); } };
    el('tabs').onclick = ev => {
      if (ev.target.closest('[data-volver]')) { juego = null; pinta(); return; }
      const b = ev.target.closest('button[data-s]'); if (b) { recuerda[ambito()] = b.dataset.s; pinta(); }
    };
    conectaJuegos();
    $('estilo-nav').textContent = GESTION_CATALOGO.ESTILO;
    el('salir').addEventListener('click', () => { Object.keys(recuerda).forEach(k => { delete recuerda[k]; }); grupo = 'tablero'; juego = null; pinta(); });
    const dir = new URLSearchParams(location.search).get('seccion');   // enlace directo: /gestion/?seccion=cola abre esa pestaña (con la sesión abierta)
    if (dir && buscar(dir)) ir('global', dir); else pinta();
  }
  return { JUEGOS, seccion, etiqueta, ir, arranca, nombreDe, actual: () => juego || 'global' };
})();
