// Fans Of · /gestion: la pestaña FLAGS. Abrir y cerrar, POR PLATAFORMA (alfa, web, android), los flags que ya existen en la tabla flags (servidor/22-flags.sql y 70). Crearlos y borrarlos es cosa de desarrollo.
// Un flag es una pareja (nombre, juego) con una fila por plataforma; '*' es el valor base y cada plataforma lo cambia solo para ella. Los valores que siempre se aplican no son flags: van en la pestaña CONFIG (config.js).
// Datos: gestion_flags(token) y gestion_flag_valor(token, nombre, juego, plataforma, valor), servidor/70-config-y-flags-por-plataforma.sql. Usa lo de gestion/index.html: rpc(), leerToken(), esc(), textoError() y $().
'use strict';
(() => {
  let G = [];   // grupos: { nombre, juego, filas: { '*': fila, alfa: fila, web: fila, android: fila } }
  const sinFuncion = e => /does not exist|PGRST202|404/.test(String(e.message));
  // iconos con el trazo de Fans Of (contorno grueso): alfa (la letra), web (el globo) y android (la cabeza del robot)
  const SVG = {
    alfa: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" stroke-width="2.6"/><path d="M16.5 8.2c-1.3-1.2-3.4-1.5-5-.3-1.7 1.3-2.2 3.9-.8 5.4 1.3 1.3 3.4 1 4.6-.4.8-.9 1.1-2.2 1.1-3.5.1 1.5.6 3 1.7 4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    web: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" stroke-width="2.6"/><ellipse cx="12" cy="12" rx="4" ry="9.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M2.8 12h18.4" stroke="currentColor" stroke-width="2"/></svg>',
    android: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 17V12a7.5 7.5 0 0 1 15 0v5z" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/><path d="M7.5 4 9 6.6M16.5 4 15 6.6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><circle cx="9.3" cy="11.8" r="1.2" fill="currentColor"/><circle cx="14.7" cy="11.8" r="1.2" fill="currentColor"/></svg>',
  };
  const NOMBRE = { alfa: 'Alfa', web: 'Web (release)', android: 'Android' };
  const efectivo = (g, p) => (g.filas[p] || g.filas['*'] || {}).valor;   // la fila de la plataforma, o si no el valor base
  function agrupa(L) {
    const m = {};
    for (const f of L) { const k = f.nombre + '|' + f.juego; (m[k] = m[k] || { nombre: f.nombre, juego: f.juego, filas: {} }).filas[f.plataforma] = f; }
    return Object.values(m);
  }
  function pinta() {
    $('fl-lista').innerHTML = G.length ? G.map((g, i) => {
      const base = g.filas['*'], ref = base || Object.values(g.filas)[0];
      return `<article class="cuenta"><div class="cab"><span class="codigo">${esc(g.nombre)}</span><span class="estado">${esc(g.juego)}</span>${base ? `<span class="estado">base: ${base.valor ? 'abierto' : 'cerrado'}</span>` : ''}${ref.porcentaje < 100 ? `<span class="estado">${ref.porcentaje} %</span>` : ''}</div>
      ${ref.mensaje || ref.dato ? `<div class="meta">${ref.mensaje ? 'Mensaje: ' + esc(ref.mensaje) : ''}${ref.dato ? ' · Dato: ' + esc(ref.dato) : ''}</div>` : ''}
      <div class="accion">${['alfa', 'web', 'android'].map(p => { const v = efectivo(g, p); return `<button type="button" class="plat ${v ? 'abierto' : 'cerrado'}" data-i="${i}" data-p="${p}" title="${NOMBRE[p]}: ${v ? 'abierto (pulsa para cerrar)' : 'cerrado (pulsa para abrir)'}" aria-label="${NOMBRE[p]}: ${v ? 'abierto' : 'cerrado'}">${SVG[p]}<span>${NOMBRE[p].split(' ')[0]}<b>${v ? 'ABIERTO' : 'CERRADO'}</b></span></button>`; }).join('')}</div></article>`;
    }).join('')
      : '<div class="vacio"><b>No hay flags en el servidor</b>Los crea desarrollo cuando introduce una función nueva tras un flag.</div>';
  }
  async function cargar() {
    $('fl-aviso').textContent = '';
    try { G = agrupa((await rpc('gestion_flags', { p_token: leerToken() })).flags || []); pinta(); }
    catch (e) { $('fl-aviso').textContent = sinFuncion(e) ? 'Los flags aún no están en el panel (servidor/70-config-y-flags-por-plataforma.sql).' : textoError(e); }
  }
  const tabs = () => [...document.querySelectorAll('#tabs button')].map(b => b.id).filter(id => id !== 't-flags');
  function mostrar(si) {
    $('pan-flags').hidden = !si; $('t-flags').classList.toggle('activa', si);
    if (si) { document.querySelectorAll('#vista-panel > div[id^="pan-"]').forEach(p => { if (p.id !== 'pan-flags') p.hidden = true; }); tabs().forEach(t => $(t).classList.remove('activa')); cargar(); }
  }
  $('t-flags').onclick = () => mostrar(true);
  tabs().forEach(t => $(t).addEventListener('click', () => { $('pan-flags').hidden = true; $('t-flags').classList.remove('activa'); }));
  $('menu').addEventListener('click', () => { $('pan-flags').hidden = true; $('t-flags').classList.remove('activa'); });
  $('salir').addEventListener('click', () => mostrar(false));
  $('fl-lista').onclick = async ev => {
    const b = ev.target.closest('button[data-p]'); if (!b) return;
    const g = G[+b.dataset.i], p = b.dataset.p; $('fl-aviso').textContent = ''; b.disabled = true;
    try { await rpc('gestion_flag_valor', { p_token: leerToken(), p_nombre: g.nombre, p_juego: g.juego, p_plataforma: p, p_valor: !efectivo(g, p) }); await cargar(); }
    catch (e) { $('fl-aviso').textContent = /flag_no_existe/.test(String(e.message)) ? 'Ese flag ya no existe: lo habrá borrado desarrollo.' : /plataforma_no_vale/.test(String(e.message)) || /flags_plataforma_check/.test(String(e.message)) ? 'El servidor aún no admite la plataforma alfa (servidor/70-config-y-flags-por-plataforma.sql).' : sinFuncion(e) ? 'Abrir y cerrar aún no está activado en el servidor (servidor/70-config-y-flags-por-plataforma.sql).' : textoError(e); b.disabled = false; await cargar(); }
  };
})();
