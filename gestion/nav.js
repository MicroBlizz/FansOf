// Fans Of · /gestion: la NAVEGACIÓN (tarea #162, ADR 161). Una barra con cuatro botones (abajo y fija en el móvil, arriba en el ordenador): Tablero, Juegos,
// Jugadores y Ajustes. Cada uno tiene sus pestañas debajo (Tablero: Tablero, Flujo, Cola, SQL y Recursos; Jugadores: Cuentas, Métricas, Comentarios, Roles y Rendimiento;
// Ajustes: Flags, Config y lo que no diga su grupo). «Juegos» enseña la lista de todos los juegos de la biblioteca con buscador (catalogo.js); al elegir uno
// salen sus pestañas y «Todos los juegos» para volver.
// Cada archivo de sección se apunta con GESTION_NAV.seccion({ id, pan, etiqueta, orden, juego?, grupo?, cargar?, filtra?, enlace? }) (filtra(juego): la deja filtrada por
// ese juego antes de enseñarla; el Tablero la usa para el contador de tareas de la lista de juegos): sin `juego` es una pestaña común (su grupo,
// de GRUPO_DE o de `grupo`); con `juego: '<id>'` es solo de ese juego, y con `juego: '*'` sale en todos (cargar recibe el id del juego).
// Quien cambia la etiqueta de una pestaña (por ejemplo, con un contador) usa GESTION_NAV.etiqueta(id, texto, juego?). Esto solo muestra y oculta: no sabe de datos.
// Las marcas de cada juego en la lista (portada.js: «alfa cambiada»…) y su sección en la alfa las da quien se apunte con
// GESTION_NAV.marcador(async () => ({ marcas: { id: [{ texto, clase }] }, secciones: { id: 'favoritos' | 'prototipos' | 'archivo' } })):
// se piden cada vez que se enseña la lista (también al volver con atrás); si lanza, la lista dice en una línea que no se han podido traer.
// Atrás (tarea #322, ADR 201): cada cambio de grupo, pestaña o juego hecho con un toque se anota en el historial del navegador (historial.js e
// historial-navegador.js), y GESTION_NAV.capa(abierta) anota lo que se abre o cierra encima (el Tablero). Al volver a una entrada se cierra lo abierto
// (`cierraCapa` de cada sección) y se enseña esa pestaña; sin sesión (pantalla de entrar), atrás no hace nada. Al recargar manda la pestaña guardada.
// Enlace directo (tarea #338, ADR 211): la dirección dice siempre dónde se está (enlace.js, GESTION_ENLACE) y lo seleccionado en la pestaña que se ve, que da
// su `enlace()` (pares [clave, valor]) y avisa con GESTION_NAV.enlaceCambia() cuando cambia. Un enlace así abre ese sitio; el botón «Enlace» de arriba lo comparte.
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
  let grupo = 'tablero', juego = null, catalogo = [], abiertas = {}, marcas = {}, secciones = {}, avisoMarcas = '', filtroJuegos = '', textoJuegos = '';
  let mostrada = null, historial = null, pedidoCatalogo = 0, marcador = null, pedidoMarcas = 0;   // la pestaña que se ve, el adaptador del historial, la última petición del catálogo, quien da las marcas y su última petición
  const seccion = s => { S.push(s); };
  const grupoDe = s => s.grupo || GRUPO_DE[s.id] || 'ajustes';
  const ambito = () => (juego ? juego : grupo);
  // Los juegos con herramientas propias en /gestion: los que tienen alguna pestaña solo suya (no las de todos, `juego: '*'`)
  const propias = () => [...new Set(S.filter(s => s.juego && s.juego !== '*').map(s => s.juego))];
  const de = () => S.filter(s => (juego ? s.juego === juego || s.juego === '*' : !s.juego && grupoDe(s) === grupo)).sort((x, y) => (x.orden || 0) - (y.orden || 0));
  const buscar = (id, j) => S.find(s => s.id === id && (j ? s.juego === j || s.juego === '*' : !s.juego));
  const nombreDe = id => ((catalogo.find(j => j.id === id) || {}).nombre || (JUEGOS.find(([j]) => j === id) || [])[1] || id);
  const boton = ([id, t]) => `<button type="button" data-g="${id}"${id === grupo ? ' class="activa" aria-current="page"' : ''}><svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${ICONO[id]}</svg>${t}</button>`;
  const pestana = (s, id) => `<button type="button" data-s="${s.id}"${s.id === id ? ' class="activa"' : ''}>${s.etiqueta}</button>`;
  const opcionesJuegos = () => ({ texto: textoJuegos, filtro: filtroJuegos, secciones, propias: propias(), abiertas, marcas, avisoMarcas });
  function pintaJuegos() {
    el('pan-juegos').innerHTML = GESTION_CATALOGO.html(catalogo, opcionesJuegos(), esc);
  }
  function pinta() {
    el('menu').innerHTML = GRUPOS.map(boton).join('');
    S.forEach(s => { el(s.pan).hidden = true; });
    el('pan-juegos').hidden = !(grupo === 'juegos' && !juego);
    mostrada = null;
    if (grupo === 'juegos' && !juego) { el('tabs').hidden = true; pintaJuegos(); if (!catalogo.length) cargaCatalogo(); refrescaMarcas(); return; }   // la lista, aunque se llegue sin el menú o con atrás
    const L = de(), a = ambito(), id = recuerda[a] && L.some(s => s.id === recuerda[a]) ? recuerda[a] : (L[0] || {}).id;
    const volver = juego ? `<button type="button" class="nav-volver" data-volver>Todos los juegos</button><b class="nav-juego">${esc(nombreDe(juego))}</b>` : '';
    el('tabs').innerHTML = volver + L.map(s => pestana(s, id)).join('');
    el('tabs').hidden = !juego && L.length < 2;
    const s = L.find(x => x.id === id); if (!s) return;
    el(s.pan).hidden = false; recuerda[a] = id; mostrada = id;
    if (s.cargar) s.cargar(juego, nombreDe(juego));
  }
  // ve('global', id) abre una pestaña común (en su grupo); ve('<juego>', id?) abre ese juego dentro de «Juegos». ir() hace lo mismo y lo anota en el historial
  function ve(donde, id) {
    if (!donde || donde === 'global') { const s = id && buscar(id); juego = null; if (s) { grupo = grupoDe(s); recuerda[grupo] = id; } }
    else { grupo = 'juegos'; juego = donde; if (id) recuerda[donde] = id; }
    pinta();
  }
  const sitio = () => ({ grupo, juego, seccion: mostrada });
  // La dirección de donde se está, con lo seleccionado en la pestaña que se ve
  function direccion() {
    const s = mostrada && buscar(mostrada, juego);
    return GESTION_ENLACE.arma(location, sitio(), s && s.enlace ? s.enlace() : []);
  }
  const hist = () => historial || (historial = GESTION_HISTORIAL_NAVEGADOR.crea({ historia: history, ventana: window, direccion }));
  let arrancada = false;
  // Lo seleccionado en una pestaña ha cambiado: la dirección lo dice (antes de arrancar no se toca: arranca() la pone)
  const enlaceCambia = () => { if (arrancada) hist().direccion(); };
  const anota = () => { hist().anota(sitio()); };
  const ir = (donde, id) => { ve(donde, id); anota(); };
  // Abre una pestaña común ya filtrada por un juego (el contador de tareas de la lista → el Tablero de ese juego): la sección lo hace con su `filtra(juego)`
  function abreFiltrada(id, juegoDelFiltro) {
    const s = buscar(id);
    if (s && s.filtra) s.filtra(juegoDelFiltro);
    ir('global', id);
  }
  const enSesion = () => { const p = el('vista-panel'); return !p || !p.hidden; };
  const cierraCapas = () => S.forEach(s => { if (s.cierraCapa) s.cierraCapa(); });
  // Dónde se estaba, como lo guarda una entrada del historial; la pestaña solo si sigue existiendo (pinta() lo comprueba)
  function ponSitio(v) {
    grupo = GRUPOS.some(([g]) => g === v.grupo) ? v.grupo : 'tablero';
    juego = grupo === 'juegos' ? v.juego : null;
    if (v.seccion) recuerda[ambito()] = v.seccion;
    pinta();
  }
  // Atrás o adelante: se enseña esa pestaña (si es otra: si no, no se vuelve a cargar) y se cierra lo abierto si se viene de una capa o se vuelve a la
  // sección que la tiene (el Tablero); entre otras pestañas, lo abierto detrás se queda como está. Sin sesión no hace nada (false)
  function vuelve(destino, desde) {
    if (!enSesion()) return false;
    const conCapa = buscar(destino.seccion, destino.juego);
    if ((desde && desde.capa) || (conCapa && conCapa.cierraCapa)) cierraCapas();
    if (!GESTION_HISTORIAL.mismoSitio(sitio(), destino)) ponSitio(destino);
    return true;
  }
  // Algo se ha abierto (con un toque) o cerrado encima de la pestaña: el Tablero lo dice aquí
  const capa = abierta => { hist().capa(abierta); };
  // «Salir»: se cierra lo abierto y se vuelve al Tablero sin añadir entradas (la de arriba pasa a decirlo)
  function sal() {
    hist().sinAnotar(cierraCapas);
    Object.keys(recuerda).forEach(k => { delete recuerda[k]; });
    grupo = 'tablero'; juego = null; pinta();
    hist().corrige(sitio());
  }
  function etiqueta(id, texto, j) {
    const s = buscar(id, j); if (!s) return;
    s.etiqueta = texto; const b = el('tabs').querySelector(`button[data-s="${id}"]`); if (b && (!j || j === juego)) b.textContent = texto;
  }
  // La lista de juegos sale de la biblioteca y el número de tareas, del tablero; si algo falla, se ven los juegos de siempre sin cifras
  // Si se pide otra vez antes de acabar (al abrirse la sesión), solo cuentan las cifras de la última petición: las de antes pueden ser de sin sesión
  async function cargaCatalogo() {
    const esta = ++pedidoCatalogo;
    try { const r = await fetch('../index.html', { cache: 'no-store' }); catalogo = GESTION_CATALOGO.leer(await r.text()); }
    catch (e) { catalogo = JUEGOS.map(([id, nombre]) => ({ id, nombre, tipo: 'Prototipo', color: '#56ccf2' })); }
    let cifras = {};
    try { cifras = GESTION_CATALOGO.abiertasPorJuego((await rpc('gestion_tareas', { p_token: leerToken() })).tareas); } catch (e) { cifras = {}; }
    if (esta !== pedidoCatalogo) return;
    abiertas = cifras;
    if (grupo === 'juegos' && !juego) pintaJuegos();
  }
  // Las marcas de la lista, de nuevo cada vez que se enseña; solo cuenta la última petición y se repinta si la lista sigue a la vista
  async function refrescaMarcas() {
    if (!marcador) return;
    const esta = ++pedidoMarcas;
    let nuevas = {}, aviso = '';
    try { nuevas = (await marcador()) || {}; } catch (e) { aviso = 'No se han podido traer los cambios de la portada (alfa y web).'; }
    if (esta !== pedidoMarcas) return;
    marcas = nuevas.marcas || {}; secciones = nuevas.secciones || {}; avisoMarcas = aviso;
    if (grupo === 'juegos' && !juego) pintaJuegos();
  }
  function conectaJuegos() {
    el('pan-juegos').onclick = ev => {
      const j = ev.target.closest('[data-juego]'), f = ev.target.closest('[data-filtro-juegos]'), t = ev.target.closest('[data-tablero-juego]');
      if (t) abreFiltrada('tablero', t.dataset.tableroJuego);
      else if (j) ir(j.dataset.juego);
      else if (f) { filtroJuegos = f.dataset.filtroJuegos; pintaJuegos(); }
    };
    el('pan-juegos').oninput = ev => {   // solo se repinta la lista, para no perder el foco del buscador
      if (!ev.target.closest('[data-buscar-juego]')) return;
      textoJuegos = ev.target.value;
      const caja = document.createElement('div'); caja.innerHTML = GESTION_CATALOGO.html(catalogo, opcionesJuegos(), esc);
      el('pan-juegos').querySelector('[data-lista-juegos]').replaceWith(caja.querySelector('[data-lista-juegos]'));
    };
  }
  // Enlace directo (con la sesión abierta): ?seccion=cola, ?juego=pop&seccion=resumen, ?grupo=juegos. Lo que no existe se ignora y se ve lo de siempre
  function abreEnlace(p) {
    if (p.juego) ve(p.juego, p.seccion && buscar(p.seccion, p.juego) ? p.seccion : undefined);
    else if (p.seccion && buscar(p.seccion)) ve('global', p.seccion);
    else { if (GRUPOS.some(([g]) => g === p.grupo)) grupo = p.grupo; pinta(); }
  }
  // El botón «Enlace» de arriba: comparte la dirección de donde se está (la hoja del móvil o, si no hay, el portapapeles)
  function conectaEnlace() {
    const b = el('enlace'); if (!b) return;
    b.innerHTML = GESTION_COMPARTIR_ENLACE.ICONO + '<span>Enlace</span>';
    b.addEventListener('click', () => GESTION_COMPARTIR_ENLACE.comparte(b, { titulo: 'Fans Of Gestión', enlace: direccion() }, { navegador: navigator }));
  }
  function arranca() {
    el('menu').onclick = ev => {
      const b = ev.target.closest('button[data-g]'); if (!b) return;
      const refresca = b.dataset.g === 'juegos' && catalogo.length > 0;   // sin catálogo lo pide pinta(); con él, se refrescan las cifras
      grupo = b.dataset.g; juego = null; pinta(); anota();
      if (refresca) cargaCatalogo();
    };
    el('tabs').onclick = ev => {
      if (ev.target.closest('[data-volver]')) { juego = null; pinta(); anota(); return; }
      const b = ev.target.closest('button[data-s]'); if (b) { recuerda[ambito()] = b.dataset.s; pinta(); anota(); }
    };
    conectaJuegos();
    conectaEnlace();
    $('estilo-nav').textContent = GESTION_CATALOGO.ESTILO;
    el('salir').addEventListener('click', sal);
    // al abrir la sesión, la lista de Juegos (si se ve) pide otra vez sus cifras: las pedidas antes de entrar fallan sin sesión
    document.addEventListener('gestion-abierta', () => { if (grupo === 'juegos' && !juego) { cargaCatalogo(); refrescaMarcas(); } });
    const guardado = hist().inicial();
    if (guardado) ponSitio(guardado);   // al recargar o volver de otra página, manda la pestaña que guardaba la entrada del historial
    else abreEnlace(GESTION_ENLACE.lee(location.search));
    arrancada = true;
    hist().empieza(sitio());
    hist().direccion();
    hist().escucha(vuelve);
  }
  const ponMarcador = f => { marcador = f; };
  return { JUEGOS, seccion, etiqueta, ir, arranca, nombreDe, capa, enlaceCambia, marcador: ponMarcador, actual: () => juego || 'global' };
})();
