// Fans Of · GUARDAR (favoritos, con un marcapáginas) y «¿LO RECOMIENDAS? SÍ / NO» de la librería (index.html de la raíz).
// En los de EN PAUSA el mismo voto pregunta «¿QUIERES QUE VUELVA?» (SÍ = que lo retomemos).
// Servidor: servidor/27-votos-de-juegos.sql y 28-recomendaciones.sql. Nada de emojis: los iconos se dibujan aquí (ICONO).
//   · El marcapáginas en cada tarjeta y en la ficha: tus guardados salen los primeros de la biblioteca. Sin cuenta se guardan solo en este navegador;
//     con cuenta, también en ella (así te siguen a otros aparatos). Junto a él se ve cuántas cuentas lo tienen guardado.
//   · En la ficha, SÍ / NO con una nota opcional y la barra de «% lo recomienda»: un voto por juego y día (el día cambia a las 00:00 de España) y otro al momento si el juego saca versión nueva.
//     Hace falta cuenta (no vale invitado). La nota la leemos solo nosotros: no se enseña a nadie.
// Usa lo que ya hay en la página: t(), esc(), TARJETAS, ENTRADAS, CUENTA, y de biblioteca/cuenta-web.js conCuenta(), abrirCuenta() y avisar().
'use strict';
(() => {
  const SERVIDOR = 'https://awivkedbmumwnkqlfixm.supabase.co', CLAVE = 'sb_publishable_iQ9OrvJmMx87u_uUMQ_uNw_UdBz78gn';   // públicos: las reglas las pone la base de datos
  const GUARDADO = 'fansof-favoritos';
  const slug = id => id.replace(/^g-/, '');
  const leer = () => { try { const l = JSON.parse(localStorage.getItem(GUARDADO) || '[]'); return Array.isArray(l) ? l.filter(x => typeof x === 'string') : []; } catch (e) { return []; } };
  let favs = leer(), totales = {}, avisado = false, listo = false;   // listo: el servidor ya tiene las funciones (si no, solo van los guardados de este navegador y no se ve ni cuenta ni voto)
  const guardar = () => { try { localStorage.setItem(GUARDADO, JSON.stringify(favs)); } catch (e) { /* sin almacenamiento: vale mientras la página esté abierta */ } };
  const original = TARJETAS.slice();
  // las tarjetas viven en grupos (JUEGOS, PROTOTIPOS y DEMOS de la BIBLIOTECA, y EN PAUSA): cada una se ordena dentro del suyo.
  // El grupo es lo que tiene justo antes de su tanda de tarjetas (el título o la nota) y su cola, lo que va justo después (null: el final de la sección).
  const vecino = (s, lado) => { let e = s[lado]; while (e && e.matches('section.game')) e = e[lado]; return e; };
  const grupo = new Map(), colas = new Map();
  for (const s of original) { const g = vecino(s, 'previousElementSibling'); grupo.set(s, g); colas.set(g, vecino(s, 'nextElementSibling')); }
  // EN PAUSA (data-pausa en index.html): el mismo SÍ / NO, pero la pregunta es si quieres que vuelva
  const pausado = id => { const s = document.getElementById(id); return !!(s && s.dataset.pausa); };
  const SI_TXT = id => (pausado(id) ? 'Quiero que vuelva' : 'Lo recomiendo'), NO_TXT = id => (pausado(id) ? 'Que siga en pausa' : 'No lo recomiendo');
  const es = id => favs.includes(id);
  // los iconos, dibujados con el contorno grueso de la serie
  const ICONO = {
    marca: on => `<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M10 5h20v30l-10-8-10 8z" fill="${on ? '#ffcb3d' : 'none'}" stroke="#20102c" stroke-width="${on ? 3.5 : 6}" stroke-linejoin="round"/>${on ? '' : '<path d="M10 5h20v30l-10-8-10 8z" fill="none" stroke="#cdb9ea" stroke-width="3" stroke-linejoin="round"/>'}</svg>`,
    arriba: '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 6L6 22h9v12h10V22h9z" fill="#fff6ea" stroke="#20102c" stroke-width="3.5" stroke-linejoin="round"/></svg>',
    abajo: '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 34L6 18h9V6h10v12h9z" fill="#fff6ea" stroke="#20102c" stroke-width="3.5" stroke-linejoin="round"/></svg>',
  };
  let recomiendan = {};   // juego → { si, total }: el último voto de cada cuenta (28-recomendaciones.sql)

  // ---------- el orden: los favoritos primero ----------
  function ordenar() {
    for (const s of [...original.filter(s => es(s.id)), ...original.filter(s => !es(s.id))]) s.parentNode.insertBefore(s, colas.get(grupo.get(s)));
  }
  const cuantos = id => totales[slug(id)] || 0;
  const etiqueta = id => `${ICONO.marca(es(id))}${cuantos(id) ? `<span>${cuantos(id)}</span>` : ''}`;
  function pintarCorazones() {
    for (const s of original) {
      const b = s.querySelector('.corazon'); if (!b) continue;
      b.innerHTML = etiqueta(s.id); b.classList.toggle('on', es(s.id)); b.setAttribute('aria-pressed', es(s.id));
      b.setAttribute('aria-label', es(s.id) ? t('Quitar de guardados') : t('Guardar'));
    }
    const f = document.getElementById('fi-fav');
    if (f && ficha.id) { f.innerHTML = `${ICONO.marca(es(ficha.id))}<span>${esc(es(ficha.id) ? t('GUARDADO') : t('GUARDAR'))}${cuantos(ficha.id) ? ' · ' + cuantos(ficha.id) : ''}</span>`; f.classList.toggle('on', es(ficha.id)); f.setAttribute('aria-pressed', es(ficha.id)); }
  }
  async function alternar(id) {
    const si = !es(id);
    favs = si ? [...favs, id] : favs.filter(x => x !== id);
    guardar(); pintarCorazones(); ordenar();
    if (listo && conCuenta()) {
      totales[slug(id)] = Math.max(0, cuantos(id) + (si ? 1 : -1)); pintarCorazones();
      try { const r = await CUENTA.rpc('poner_favorito', { p_juego: slug(id), p_si: si }); if (r && r.ok === false && r.motivo === 'tope') avisar(t('Ya tienes muchos guardados. Quita alguno.')); } catch (e) { /* se reintenta al sincronizar la próxima vez */ }
    } else if (listo && si && !avisado) { avisado = true; avisar(t('Guardado en este navegador. Entra con tu cuenta para llevarte tus guardados a otros aparatos.'), true); }
  }
  for (const s of original) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'corazon';
    b.onclick = e => { e.stopPropagation(); alternar(s.id); };
    s.appendChild(b);
  }
  document.getElementById('fi-fav').onclick = () => { if (ficha.id) alternar(ficha.id); };

  // con cuenta: los de la cuenta y los de este navegador se juntan (y los que solo estaban aquí suben)
  async function sincronizar() {
    if (!listo || !conCuenta()) return;
    try {
      const nube = (await CUENTA.rpc('mis_favoritos', {})) || [], ids = nube.map(n => 'g-' + n).filter(id => original.some(s => s.id === id));
      for (const id of favs) if (!ids.includes(id) && original.some(s => s.id === id)) CUENTA.rpc('poner_favorito', { p_juego: slug(id), p_si: true }).catch(() => {});
      favs = [...new Set([...favs, ...ids])]; guardar(); ordenar(); pintarCorazones();
    } catch (e) { /* sin conexión: se queda lo de este navegador */ }
  }
  // los totales son públicos: se piden sin sesión (así quien solo mira no crea una cuenta de invitado)
  fetch(SERVIDOR + '/rest/v1/rpc/favoritos_totales', { method: 'POST', headers: { apikey: CLAVE, 'Content-Type': 'application/json' }, body: '{}' })
    .then(r => (r.ok ? r.json() : Promise.reject())).then(d => {
      listo = true; totales = d && typeof d === 'object' ? d : {};
      caja.hidden = false; pintarCorazones(); pintarMinis(); sincronizar();
      if (!ficha.caja.hidden && ficha.id) { voto.clave = ''; cargarVoto(ficha.id); }
    }).catch(() => {});

  // ---------- SÍ / NO en la tarjeta: votar sin abrir la ficha (sin nota) ----------
  // Lo votado hoy se apunta en este navegador para marcar el botón; el servidor es quien manda (si ya habías votado, contesta ya_votado).
  const HOY = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid' }).format(new Date());
  const CACHE = 'fansof-votos-hoy';
  const leerCache = () => { try { const c = JSON.parse(localStorage.getItem(CACHE) || '{}'); return c.dia === HOY() ? c : { dia: HOY(), v: {} }; } catch (e) { return { dia: HOY(), v: {} }; } };
  const votoGuardado = (id, ver) => leerCache().v[id + '|' + ver] || 0;
  function apuntar(id, ver, v) { const c = leerCache(); c.v[id + '|' + ver] = v; try { localStorage.setItem(CACHE, JSON.stringify(c)); } catch (e) { /* solo vale mientras la página esté abierta */ } pintarMinis(); }
  const verDe = id => (ENTRADAS[id] && ENTRADAS[id].ver) || '';
  function pintarMinis() {
    for (const s of original) {
      const box = s.querySelector('.votos-tarjeta'); if (!box) continue;
      box.hidden = !listo; const v = votoGuardado(s.id, verDe(s.id));
      box.querySelectorAll('button').forEach(b => { b.setAttribute('aria-pressed', Number(b.dataset.v) === v); b.classList.toggle('apagado', !!v && Number(b.dataset.v) !== v); });
    }
  }
  for (const s of original) {
    const box = document.createElement('div'); box.className = 'votos-tarjeta'; box.hidden = true;
    box.innerHTML = `<button type="button" data-v="1" aria-label="${esc(t(SI_TXT(s.id)))}">${ICONO.arriba}</button><button type="button" data-v="-1" aria-label="${esc(t(NO_TXT(s.id)))}">${ICONO.abajo}</button>`;
    box.onclick = async e => {
      e.stopPropagation(); const b = e.target.closest('button'); if (!b) return;
      const v = Number(b.dataset.v), id = s.id, ver = verDe(id);
      if (!conCuenta()) { abrirCuenta(t('Entra con tu cuenta para votar.')); return; }
      if (!ENTRADAS[id]) { avisar(t('Cargando…')); return; }
      if (votoGuardado(id, ver)) { avisar(t('Hoy ya has votado este juego. Mañana puedes volver, o antes si sale una versión nueva.')); return; }
      try {
        const r = await CUENTA.rpc('votar_juego', { p_juego: slug(id), p_version: ver, p_voto: v, p_nota: '' });
        if (r && r.ok) { apuntar(id, ver, v); sumar(id, v); avisar(t('¡Voto enviado! Si quieres dejar una nota, abre la ficha del juego.'), true); }
        else if (r && r.motivo === 'ya_votado') { apuntar(id, ver, v); avisar(t('Hoy ya has votado este juego. Mañana puedes volver, o antes si sale una versión nueva.')); }
        else if (r && r.motivo === 'tope') avisar(t('Hoy has votado muchos juegos. Vuelve mañana.'));
        else if (r && r.motivo === 'sin_cuenta') abrirCuenta(t('Entra con tu cuenta para votar.'));
        else avisar(t('No se ha podido enviar el voto. Prueba otra vez.'));
      } catch (err) { avisar(t('No se ha podido enviar el voto. Prueba otra vez.')); }
    };
    (s.querySelector('.cap-img') || s).appendChild(box);   // sobre la captura, abajo a la derecha: así no tapa el nombre ni la versión
  }

  // ---------- el voto de la ficha ----------
  const caja = document.getElementById('fi-voto'); caja.hidden = true;
  const voto = { clave: '', id: '', ver: '', estado: 'cargando', hecho: 0, elegido: 0 };
  // la barra de «% lo recomienda» (sin votos todavía, no sale)
  function barra(id) {
    const r = recomiendan[slug(id)]; if (!r || !r.total) return '';
    const pc = Math.round(100 * r.si / r.total), txt = pausado(id) ? '{p} % quiere que vuelva' : '{p} % lo recomienda';
    return `<div class="reco-barra" role="img" aria-label="${esc(t(txt, { p: pc }))}"><i style="width:${pc}%"></i></div>`
      + `<div class="reco-datos"><span>${esc(t(txt, { p: pc }))}</span><span>${esc(t(r.total === 1 ? '1 voto' : '{n} votos', { n: r.total }))}</span></div>`;
  }
  // un voto nuevo se suma al momento (el recuento de verdad llega la próxima vez que se abre la web)
  function sumar(id, v) { const k = slug(id), r = recomiendan[k] || { si: 0, total: 0 }; recomiendan[k] = { si: r.si + (v > 0 ? 1 : 0), total: r.total + 1 }; }
  function pintarVoto() {
    const pausa = pausado(voto.id), cab = `<h4 class="ol">${esc(t(pausa ? '¿QUIERES QUE VUELVA?' : '¿LO RECOMIENDAS?'))}</h4>`;
    if (voto.estado === 'cargando') { caja.innerHTML = cab + `<p>${esc(t('Cargando…'))}</p>` + barra(voto.id); return; }
    if (voto.estado === 'hecho') {
      caja.innerHTML = cab + `<p class="voto-gracias">${esc(t(pausa ? (voto.hecho > 0 ? '¡Gracias! Hoy has pedido que vuelva.' : '¡Gracias! Hoy has votado que siga en pausa.') : (voto.hecho > 0 ? '¡Gracias! Hoy lo has recomendado.' : '¡Gracias! Hoy no lo has recomendado.')))}</p>` + barra(voto.id) + `<small>${esc(t('Mañana puedes volver a votar, o antes si sale una versión nueva.'))}</small>`;
      return;
    }
    const p = v => `aria-pressed="${voto.elegido === v}" aria-label="${esc(t(v > 0 ? SI_TXT(voto.id) : NO_TXT(voto.id)))}"`;
    caja.innerHTML = cab + `<p>${esc(t(pausa ? 'Un voto al día. Los prototipos con más votos para que vuelvan son los primeros que retomamos.' : 'Un voto al día por juego. Si sale una versión nueva, puedes votar otra vez.'))}</p>`
      + `<div class="voto-botones"><button type="button" class="voto si ol" data-v="1" ${p(1)}>${ICONO.arriba}${esc(t('SÍ'))}</button><button type="button" class="voto no ol" data-v="-1" ${p(-1)}>${ICONO.abajo}${esc(t('NO'))}</button></div>`
      + (voto.elegido ? `<textarea id="voto-nota" maxlength="500" placeholder="${esc(t('¿Por qué? (opcional)'))}" aria-label="${esc(t('Nota'))}"></textarea>`
        + `<button type="button" class="boton ol voto-enviar">${esc(t('ENVIAR'))}</button><small>${esc(t('Tu nota la leemos solo nosotros: no se enseña a nadie más.'))}</small>`
        : (conCuenta() ? '' : `<small>${esc(t('Para votar necesitas entrar con tu cuenta.'))}</small>`)) + barra(voto.id);
  }
  async function cargarVoto(id) {
    if (!listo) return;
    const e = ENTRADAS[id], ver = (e && e.ver) || '';
    const clave = id + '|' + ver;
    if (voto.clave === clave && voto.estado !== 'cargando') return;   // ya está pintado (la ficha se repinta cuando llegan las novedades)
    Object.assign(voto, { clave, id, ver, estado: conCuenta() ? 'cargando' : 'libre', hecho: 0, elegido: 0 });
    pintarVoto();
    if (!conCuenta()) return;
    try {
      const r = await CUENTA.rpc('mi_voto_de_hoy', { p_juego: slug(id), p_version: ver });
      if (voto.clave !== clave) return;
      if (r && r.voto) { Object.assign(voto, { estado: 'hecho', hecho: r.voto }); apuntar(id, ver, r.voto); } else voto.estado = 'libre';
    } catch (err) { if (voto.clave !== clave) return; voto.estado = 'libre'; }
    pintarVoto();
  }
  caja.addEventListener('click', async e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.classList.contains('voto')) {
      if (!conCuenta()) { abrirCuenta(t('Entra con tu cuenta para votar.')); return; }
      voto.elegido = Number(b.dataset.v); pintarVoto();
      const n = document.getElementById('voto-nota'); if (n) n.focus({ preventScroll: true });
    } else if (b.classList.contains('voto-enviar')) {
      const nota = (document.getElementById('voto-nota') || {}).value || '', v = voto.elegido, clave = voto.clave;
      b.disabled = true;
      try {
        const r = await CUENTA.rpc('votar_juego', { p_juego: slug(voto.id), p_version: voto.ver, p_voto: v, p_nota: nota });
        if (voto.clave !== clave) return;
        if (r && r.ok) { Object.assign(voto, { estado: 'hecho', hecho: v }); apuntar(voto.id, voto.ver, v); sumar(voto.id, v); pintarVoto(); }
        else if (r && r.motivo === 'ya_votado') { Object.assign(voto, { estado: 'hecho', hecho: v }); apuntar(voto.id, voto.ver, v); pintarVoto(); }
        else if (r && r.motivo === 'tope') { avisar(t('Hoy has votado muchos juegos. Vuelve mañana.')); b.disabled = false; }
        else if (r && r.motivo === 'sin_cuenta') { abrirCuenta(t('Entra con tu cuenta para votar.')); b.disabled = false; }
        else { avisar(t('No se ha podido enviar el voto. Prueba otra vez.')); b.disabled = false; }
      } catch (err) { avisar(t('No se ha podido enviar el voto. Prueba otra vez.')); b.disabled = false; }
    }
  });

  document.addEventListener('ficha-abierta', ev => {
    pintarCorazones();
    const id = ev.detail.id;
    cargarVoto(id);
  });
  document.addEventListener('ficha-cerrada', () => { voto.clave = ''; });
  document.addEventListener('cuenta-cambio', () => { sincronizar(); if (!ficha.caja.hidden && ficha.id) { voto.clave = ''; cargarVoto(ficha.id); } pintarCorazones(); });

  // el recuento de recomendaciones es público: se pide sin sesión, como los guardados
  fetch(SERVIDOR + '/rest/v1/rpc/recomendaciones_totales', { method: 'POST', headers: { apikey: CLAVE, 'Content-Type': 'application/json' }, body: '{}' })
    .then(r => (r.ok ? r.json() : Promise.reject())).then(d => { recomiendan = d && typeof d === 'object' ? d : {}; if (!ficha.caja.hidden && ficha.id && voto.estado !== 'cargando') pintarVoto(); })
    .catch(() => {});
  ordenar(); pintarCorazones();
  setInterval(pintarMinis, 3000);   // las versiones de cada juego llegan por separado: se repinta hasta que estén
})();
