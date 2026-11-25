// Fans Of · /gestion, pestaña RECURSOS (grupo Tablero): revisar desde el móvil lo que genera Yoshi y marcarlo por etapas (propuestas → modelo 3D → lonchas).
// Lee `salida/` de la rama `recursos` con el token de GitHub de la pestaña Cola (Contents en solo lectura: recursos-github.js), agrupa por juego (y filtra por la tarea del nombre de las salidas) con las
// reglas de la galería local (recursos-datos.js) y abre cada encargo con sus salidas en paneles, con los mismos visores y mandos comunes que la galería
// (recursos/: visor-lonchas.html, visor-glb.html, mandos-comunes.js, miniaturas.js); zoom y pantalla completa, recursos-ampliar.js. Las marcas (Sirve, En el aire, Descartar, Relanzar y nota) van a Supabase
// con la sesión de /gestion (gestion_recurso_marcar y gestion_recurso_encargos; recursos-marcas.js). No lanza la siguiente etapa: eso irá con un workflow.
// Enlace directo (tarea #338, ADR 211): la dirección lleva el juego (&rjuego=) y cada salida abierta para comparar (&ver=, una por salida); un enlace así
// elige ese juego y abre esas salidas en cuanto se ha leído la rama.
// Las reglas de la lista (estado, resumen y filtros) están en recursos-lista.js.
// Usa lo de gestion/index.html: $(), esc(), rpc() y leerToken(); GESTION_NAV (nav.js) y GESTION_ENLACE (enlace.js). Guía: docs/guia/herramientas/galeria.md
'use strict';
(() => {
  const D = RECURSOS_DATOS, M = RECURSOS_MARCAS, G = RECURSOS_GITHUB, L = RECURSOS_ENLACE, LISTA = RECURSOS_LISTA;
  const TOKEN = 'fansof.gestion.githubToken', PENDIENTES = 'fansof.gestion.recursos.pendientes', JUEGO = 'fansof.gestion.recursos.juego';
  const POR_PAGINA = 24, VISORES = 'recursos/';
  const BOTONES = ['valido', 'pendiente', 'invalido', 'relanzar'];
  const e = { raiz: null, carpetas: {}, juego: '', fichas: [], rutas: [], shas: new Map(), guardadas: {}, pendientes: {}, vistos: POR_PAGINA, abiertos: [], paneles: new Map(), urls: new Map(), leidas: new Map(), cargando: false, aviso: '' };
  const pan = document.createElement('div'); pan.id = 'pan-recursos'; pan.hidden = true;
  $('pan-config').parentNode.appendChild(pan);

  const lee = (k, def) => { try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch (err) { return def; } };
  const apunta = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (err) { /* sin almacenamiento: las pendientes viven hasta recargar */ } };
  const token = () => { try { return localStorage.getItem(TOKEN) || ''; } catch (err) { return ''; } };
  const nodo = (tag, clase, texto) => { const n = document.createElement(tag); if (clase) n.className = clase; if (texto != null) n.textContent = texto; return n; };
  e.pendientes = lee(PENDIENTES, {});
  // Lo que pide el enlace directo, hasta que se abre (después de leer la rama); su juego manda sobre el último elegido
  let deEnlace = L.pedido(GESTION_ENLACE.lee(location.search));
  if (deEnlace && deEnlace.juego) e.juego = deEnlace.juego;
  const marcas = () => M.mezcla(e.guardadas, e.pendientes);

  // ---- la red: el envío y la lectura de las marcas, y los archivos de la rama como direcciones blob: (cada sha se pide una vez)
  const enviar = (salida, m) => rpc('gestion_recurso_marcar', M.argumentos(leerToken(), salida, m, D.marcas(salida).run));   // el run, del nombre de la salida
  const lector = async juego => (await rpc('gestion_recurso_encargos', { p_token: leerToken(), p_juego: juego })).filas;
  function url(ruta) {
    const sha = e.shas.get(ruta);
    if (!sha) return Promise.reject(new Error('no está en la rama: ' + ruta));
    if (!e.urls.has(sha)) e.urls.set(sha, G.blob(fetch, token(), sha, D.mime(ruta)).then(b => URL.createObjectURL(b)));
    return e.urls.get(sha);
  }
  const fallo = err => (err && err.consejo) || 'No pude leer GitHub: ' + ((err && err.message) || err);

  // ---- cargar: la raíz de salida/ (una vez), las subcarpetas del juego, sus encargos y sus marcas
  async function cargaRaiz(forzar) {
    if (e.raiz && !forzar) return;
    e.raiz = await G.raiz(fetch, token()); e.carpetas = {};
  }
  async function archivosDelJuego() {
    const lista = [...e.raiz.archivos];
    for (const c of G.carpetasDe(e.raiz.carpetas, e.juego)) {
      if (!e.carpetas[c.sha]) e.carpetas[c.sha] = await G.carpeta(fetch, token(), c);
      lista.push(...e.carpetas[c.sha].archivos);
    }
    return lista;
  }
  async function cadenas(rutas) {
    const leidas = {};
    await Promise.all(rutas.filter(r => D.esCadena(r) && D.esDelJuego(r, e.juego)).map(async r => {
      const sha = e.shas.get(r);   // una cadena no cambia con el mismo sha: se lee una vez
      try { if (!e.leidas.has(sha)) e.leidas.set(sha, await G.json(fetch, token(), sha)); leidas[r] = e.leidas.get(sha); } catch (err) { leidas[r] = null; }   // sale con su error en la ficha
    }));
    return leidas;
  }
  function eligeJuego() {
    const juegos = D.juegos(e.raiz.archivos.map(a => a.ruta).concat(e.raiz.carpetas.map(c => `salida/${c.nombre}/x`)));
    const quiero = e.juego || lee(JUEGO, '');
    e.juego = juegos.some(j => j.id === quiero) ? quiero : (juegos[0] || {}).id || '';
    return juegos;
  }
  async function cargar(forzar) {
    if (e.cargando) { e.otraVez = true; e.forzarOtraVez = e.forzarOtraVez || !!forzar; return null; }   // se cambió de juego mientras se leía: se vuelve a leer al acabar
    if (!token()) return pinta();
    e.cargando = true; e.otraVez = false; e.aviso = ''; pinta();
    try {
      await cargaRaiz(forzar);
      e.listaJuegos = eligeJuego();
      const archivos = await archivosDelJuego();
      e.shas = new Map(archivos.map(a => [a.ruta, a.sha])); e.rutas = archivos.map(a => a.ruta);
      e.fichas = D.inventario(e.rutas, e.juego, await cadenas(e.rutas));
      const l = await M.leer(e.juego, lector);
      e.guardadas = l.guardadas;
      const avisos = [];
      if (l.error) avisos.push('No pude leer las marcas guardadas (' + (l.motivo || l.error) + '): se ven solo las de este navegador.');
      if (e.raiz.cortada) avisos.push('GitHub ha cortado la lista de salida/: puede faltar algo.');
      e.aviso = avisos.join(' ');
      abreDelEnlace();
    } catch (err) { e.aviso = fallo(err); }
    e.cargando = false; pinta();
    const forzarOtra = e.forzarOtraVez; e.forzarOtraVez = false;
    return e.otraVez ? cargar(forzarOtra) : null;
  }

  // ---- el enlace directo (recursos-enlace.js): abre lo que pide una sola vez, ya leída la rama; la dirección dice el juego y lo abierto
  function abreDelEnlace() {
    if (!deEnlace) return;
    e.abiertos = L.abre(deEnlace, e.juego, e.fichas, e.abiertos, salidasDe);
    deEnlace = null;
    pintaPaneles();
  }
  const enlace = () => L.parametros(deEnlace, e.juego, e.abiertos);

  // ---- la lista
  // (las reglas, en recursos-lista.js)
  const salidasDe = LISTA.salidasDe;
  const estadoFicha = f => LISTA.estado(f, marcas());
  const resumen = f => LISTA.resumen(f, marcas());
  // la vista previa se pide al verse (cada archivo es una llamada a GitHub)
  const mira = 'IntersectionObserver' in window ? new IntersectionObserver(ents => ents.forEach(x => { if (x.isIntersecting) { mira.unobserve(x.target); x.target.carga(); } }), { rootMargin: '200px' }) : null;
  function vista(f) {
    const v = nodo('div', 'rec-vista'), ruta = f.miniatura || f.ruta;
    v.carga = () => {
      if (f.tipo === 'lonchas') return Promise.all([url(f.ruta), url(f.json)]).then(([png, json]) => v.prepend(MINIATURAS.lonchas(png, json))).catch(err => { v.title = fallo(err); });
      if (D.tipo(ruta) !== 'imagen') return null;
      return url(ruta).then(u => { const i = new Image(); i.src = u; i.alt = f.nombre; v.prepend(i); }).catch(err => { v.title = fallo(err); });
    };
    if (f.tipo !== 'lonchas' && D.tipo(ruta) !== 'imagen') v.append(nodo('span', 'rec-icono', f.tipo === '3d' ? '3D' : f.tipo.toUpperCase()));
    if (mira) mira.observe(v); else v.carga();
    if (f.etapa) v.append(nodo('span', 'rec-sello', f.etapa + (f.salidas ? ' · ' + f.salidas.length : '')));
    return v;
  }
  function ficha(f) {
    const el = nodo('button', 'rec-ficha rec-' + estadoFicha(f)); el.type = 'button'; el.onclick = () => abre(f);
    const problema = f.tipo === 'encargo' ? D.problemas(f) : '';
    el.append(vista(f), nodo('b', '', f.nombre), nodo('span', problema ? 'rec-fallo' : 'meta', problema || resumen(f)));
    if (D.origen(f)) el.append(nodo('span', 'meta', D.origen(f)));
    return el;
  }
  function pintaLista() {
    const filtro = { tipo: $('rec-tipo').value, estado: $('rec-estado').value, tarea: $('rec-tarea').value }, m = marcas();
    const lista = e.fichas.filter(f => LISTA.pasa(f, filtro, m));
    $('rec-lista').replaceChildren(...lista.slice(0, e.vistos).map(ficha));
    if (!lista.length) $('rec-lista').append(nodo('div', 'vacio', e.cargando ? 'Leyendo la rama recursos…' : 'Nada con ese filtro.'));
    $('rec-mas').hidden = lista.length <= e.vistos; $('rec-mas').textContent = `Ver más (${lista.length - e.vistos})`;
    pintaPendientes();
  }
  function pintaPendientes() {
    const n = Object.keys(e.pendientes).length;
    $('rec-pendientes').hidden = !n;
    $('rec-pendientes-n').textContent = n === 1 ? '1 marca sin guardar en el servidor' : n + ' marcas sin guardar en el servidor';
  }

  // ---- marcar: se ve al momento, queda pendiente en este navegador y se manda; lo que el servidor confirma deja de estar pendiente
  let cola = Promise.resolve();
  function marca(f, salida, estado, nota) {
    const r = M.pon(e.pendientes, salida, { estado, nota, juego: e.juego, nombre: M.nombreValido(f.nombre), etapa: D.etapa(f) }, new Date().toISOString());
    if (!r.ok) { $('rec-aviso').textContent = 'No se puede marcar así (' + r.error + ').'; return; }
    e.pendientes = r.pendientes; apunta(PENDIENTES, e.pendientes); refresca(salida);
    cola = cola.then(mandaPendientes);
  }
  async function mandaPendientes() {
    const mandadas = e.pendientes, r = await M.guardar(mandadas, enviar);
    for (const [salida, id] of Object.entries(r.enviadas || {})) { const m = mandadas[salida]; e.guardadas[salida] = { estado: m.estado, nota: m.nota, fecha: m.fecha, id }; }
    e.pendientes = M.confirmadas(e.pendientes, mandadas, r.enviadas); apunta(PENDIENTES, e.pendientes);   // lo marcado mientras se mandaba sigue pendiente
    $('rec-aviso').textContent = r.ok ? '' : 'No se han guardado ' + (r.fallidas || []).length + ' marcas (' + ((r.fallidas || [])[0] || {}).motivo + '). Siguen en este navegador: «Reintentar».';
    pintaLista();
  }
  // las marcas y la nota de una salida, en su panel
  function controles(f, salida) {
    const caja = nodo('div', 'rec-controles'), nota = nodo('input');
    nota.type = 'text'; nota.placeholder = 'Nota…'; nota.maxLength = 1000; nota.value = (marcas()[salida] || {}).nota || ''; nota.setAttribute('aria-label', 'Nota');
    for (const estado of BOTONES) {
      const b = nodo('button', 'rec-b-' + estado, M.TEXTOS[estado]); b.type = 'button'; b.dataset.estado = estado;
      b.onclick = () => marca(f, salida, estado, nota.value); caja.append(b);
    }
    nota.onchange = () => { const actual = M.estadoDe(marcas(), salida); marca(f, salida, actual === 'sin-mirar' ? 'pendiente' : actual, nota.value); };
    caja.append(nota);
    return pulsados(caja, salida);
  }
  // los controles no se rehacen (la nota puede estar escribiéndose): solo cambia qué botón está pulsado
  function pulsados(caja, salida) {
    const actual = M.estadoDe(marcas(), salida);
    caja.querySelectorAll('button[data-estado]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.estado === actual)));
    return caja;
  }
  function refresca(salida) {
    const p = e.paneles.get(salida);
    if (p) { p.className = 'rec-panel rec-' + M.estadoDe(marcas(), salida); pulsados(p.querySelector('.rec-controles'), salida); }
    pintaLista();
  }

  // ---- comparar: cada salida abierta es un panel (en el móvil, uno debajo de otro); los paneles no se rehacen para no recargar los visores
  function abre(f) {
    const grupo = f.tipo === 'encargo' || f.tipo === 'propuestas';
    $('rec-encargo').hidden = !grupo;
    $('rec-encargo').textContent = grupo ? [f.etapa, f.nombre, D.origen(f), D.problemas(f)].filter(Boolean).join(' · ') : '';
    for (const s of salidasDe(f)) if (!e.abiertos.some(a => a.salida === s)) e.abiertos.push({ salida: s, ficha: f });
    pintaPaneles();
    $('rec-comparar').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  async function contenido(dentro, que) {
    const t = que.tipo;
    if (t === 'imagen') { const i = new Image(); i.src = await url(que.ruta); i.alt = que.nombre; return dentro.replaceChildren(i); }
    if (t === 'video' || t === 'audio') { const m = nodo(t); m.src = await url(que.ruta); m.controls = true; return dentro.replaceChildren(m); }
    const i = nodo('iframe'); i.title = que.nombre; i.dataset.mandos = '1';
    if (t === '3d') i.src = VISORES + 'visor-glb.html?src=' + encodeURIComponent(await url(que.ruta));
    else if (t === 'lonchas') i.src = `${VISORES}visor-lonchas.html?nombre=${encodeURIComponent(que.nombre)}&png=${encodeURIComponent(await url(que.ruta))}&json=${encodeURIComponent(await url(que.json))}`;
    else return dentro.replaceChildren(nodo('p', 'meta', 'Sin vista previa.'));
    dentro.replaceChildren(i); MANDOS.actualiza();
  }
  function panel({ salida, ficha: f }) {
    const que = D.panel(salida, e.rutas), el = nodo('section', 'rec-panel rec-' + M.estadoDe(marcas(), salida)); el.ficha = f;
    const barra = nodo('div', 'rec-barra'), cerrar = nodo('button', '', 'Cerrar'); cerrar.type = 'button';
    cerrar.onclick = () => { e.abiertos = e.abiertos.filter(a => a.salida !== salida); pintaPaneles(); };
    barra.append(nodo('b', '', que.nombre), nodo('span', 'meta', D.origen(que)), cerrar); barra.title = salida;
    const dentro = nodo('div', 'rec-dentro rec-' + que.tipo, 'Cargando…');
    contenido(dentro, que).catch(err => { dentro.textContent = fallo(err); });
    el.append(barra, dentro, controles(f, salida));
    RECURSOS_AMPLIAR.panel(el);   // zoom, «Encajar» y «Ver grande» (doble clic: pantalla completa)
    return el;
  }
  function pintaPaneles() {
    for (const [s, el] of e.paneles) if (!e.abiertos.some(a => a.salida === s)) { el.remove(); e.paneles.delete(s); }
    for (const a of e.abiertos) if (!e.paneles.has(a.salida)) { e.paneles.set(a.salida, panel(a)); $('rec-paneles').append(e.paneles.get(a.salida)); }
    $('rec-comparar').hidden = !e.abiertos.length;
    $('rec-cuantos').textContent = e.abiertos.length === 1 ? '1 abierto' : e.abiertos.length + ' abiertos';
    MANDOS.actualiza();
    GESTION_NAV.enlaceCambia();
  }

  // ---- la pestaña
  function esqueleto() {
    pan.innerHTML = `<div class="caja ayuda"><b>Recursos.</b> Lo que genera Yoshi (rama <b>recursos</b>, carpeta salida/) para revisarlo por etapas: propuestas, modelo 3D y lonchas. Pulsa un encargo para abrir todas sus salidas; marca cada una con <b>Sirve</b>, <b>En el aire</b>, <b>Descartar</b> o <b>Relanzar</b> y una nota. Las marcas se guardan en el servidor. Lee GitHub con el token de la pestaña Cola, que para esto necesita <b>Contents</b> en solo lectura.</div>
      <div class="caja vacio" id="rec-sin-token" hidden><b>Falta el token de GitHub.</b> Pégalo en Tablero › Cola. Para esta pestaña necesita además el permiso Contents (solo lectura) del repo ${esc(G.REPO)}.</div>
      <div class="filtros"><select id="rec-juego" aria-label="Juego"></select>
        <select id="rec-tipo" aria-label="Qué"><option value="">Todo</option><option value="encargo">Encargos</option><option value="propuestas">Propuestas</option><option value="lonchas">Lonchas</option><option value="3d">3D</option><option value="imagen">Imágenes</option></select>
        <select id="rec-estado" aria-label="Marca"><option value="">Todo menos lo descartado</option><option value="sin-mirar">Sin mirar</option><option value="pendiente">En el aire</option><option value="valido">Sirve</option><option value="relanzar">Relanzar</option><option value="invalido">Descartado</option></select>
        <select id="rec-tarea" aria-label="Tarea"></select>
        <button type="button" id="rec-actualizar">Actualizar</button></div>
      <div class="filtros rec-pendientes" id="rec-pendientes" hidden><span id="rec-pendientes-n"></span><button type="button" id="rec-reintentar">Reintentar</button></div>
      <div class="aviso" id="rec-aviso" role="alert"></div>
      <section class="caja rec-comparar" id="rec-comparar" hidden aria-label="Abiertos"><div class="rec-cab"><b id="rec-cuantos"></b><span class="meta" id="rec-encargo" hidden></span><button type="button" id="rec-cerrar-todo">Cerrar todo</button></div>
        <div class="rec-mandos" id="rec-mandos" hidden aria-label="Mandos comunes"></div><div class="rec-paneles" id="rec-paneles"></div></section>
      <div class="rec-lista" id="rec-lista"></div><button type="button" id="rec-mas" hidden>Ver más</button>`;
    $('rec-juego').onchange = () => { e.juego = $('rec-juego').value; apunta(JUEGO, e.juego); e.vistos = POR_PAGINA; GESTION_NAV.enlaceCambia(); cargar(false); };
    $('rec-tipo').onchange = $('rec-estado').onchange = $('rec-tarea').onchange = () => { e.vistos = POR_PAGINA; pintaLista(); };
    $('rec-actualizar').onclick = () => cargar(true);
    $('rec-reintentar').onclick = () => { cola = cola.then(mandaPendientes); };
    $('rec-mas').onclick = () => { e.vistos += POR_PAGINA; pintaLista(); };
    $('rec-cerrar-todo').onclick = () => { e.abiertos = []; pintaPaneles(); };
    MANDOS.arranca($('rec-mandos'), () => [...pan.querySelectorAll('#rec-paneles iframe[data-mandos]')]);
    RECURSOS_AMPLIAR.arranca($('rec-paneles'));
  }
  function pinta() {
    if (!pan.firstChild) esqueleto();
    $('rec-sin-token').hidden = !!token();
    const juegos = e.listaJuegos || [];
    $('rec-juego').innerHTML = juegos.map(j => `<option value="${esc(j.id)}"${j.id === e.juego ? ' selected' : ''}>${esc(j.id)} (${j.n})</option>`).join('') || '<option value="">—</option>';
    $('rec-aviso').textContent = e.aviso;
    pintaTareas();
    pintaLista();
  }
  // el filtro de tarea: las tareas que salen en las fichas del juego (las del nombre de sus salidas); se guarda la elegida si sigue saliendo
  function pintaTareas() {
    const sel = $('rec-tarea'), quiero = sel.value, tareas = D.tareas(e.fichas);
    sel.innerHTML = '<option value="">Toda tarea</option><option value="sin">Sin tarea</option>' + tareas.map(t => `<option value="${t}">Tarea ${t}</option>`).join('');
    sel.value = quiero === 'sin' || tareas.some(t => String(t) === quiero) ? quiero : '';
  }
  GESTION_NAV.seccion({ id: 'recursos', pan: 'pan-recursos', etiqueta: 'Recursos', orden: 8, grupo: 'tablero', cargar: () => cargar(false), enlace });
})();
