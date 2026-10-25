// Fans of Rouflage · LA LISTA DE AMIGOS (boceto 7, pedida por Daniel el 23-10-2026: «invitarles directamente a jugar si están en línea»). Botón AMIGOS del título.
// · Tu código de amigo es el de TRAE A UN COLADO (referidos.js). AÑADIR con el código de otro os hace amigos a los dos. Quien llega por tu enlace ?inv= queda de amigo solo.
// · El LATIDO (cada 45 s con el juego abierto, rouflage_amigos en servidor/82-rouflage-amigos-lista.sql) dice dónde estás (menú, sala con su código, o jugando)
//   y trae la lista y las invitaciones. En línea = visto hace menos de 90 s.
// · INVITAR: si estás en tu sala con amigos, le manda su código; si no, crea la sala y luego le invita. UNIRME: si tu amigo está en una sala, entras.
// · Te invitan: sale un aviso arriba con UNIRME (no mientras juegas: espera a que acabes).
'use strict';

const AMG = { lista: [], codigo: '', cola: [], latido: null, ultimo: 0, pidiendo: null, aviso: null };

// dónde estás, para tus amigos
function amgEstado() {
  const i = typeof RFP !== 'undefined' && RFP.info;
  if (J.pvp && J.fase !== 'titulo') return { p_estado: 'partida', p_sala: null };
  if (i && i.privada && i.estado === 'espera' && i.codigo) return { p_estado: 'sala', p_sala: i.codigo };
  if (J.fase === 'prep' || J.fase === 'caza' || J.fase === 'cuenta') return { p_estado: 'partida', p_sala: null };
  return { p_estado: 'menu', p_sala: null };
}
function amgLatido() {
  if (AMG.pidiendo || document.hidden || !RFRED.conSesion()) return AMG.pidiendo || Promise.resolve(null);
  AMG.pidiendo = Promise.resolve(RFRED.rpc('rouflage_amigos', amgEstado())).then(d => {
    if (!d) return null;
    AMG.lista = d.amigos || []; AMG.codigo = d.codigo || AMG.codigo; AMG.ultimo = Date.now();
    if (AMG.codigo && typeof REF !== 'undefined' && !REF.codigo) REF.codigo = AMG.codigo;
    for (const inv of d.invitaciones || []) AMG.cola.push(inv);
    titAmigosEnLinea(); amgInvitacion();
    if (visible('p-amigoslista')) amgPinta();
    return d;
  }).catch(e => { console.warn('[amigos]', e); return null; }).finally(() => { AMG.pidiendo = null; });
  return AMG.pidiendo;
}
// cuántos amigos hay en línea, en el botón EN LÍNEA del título
function titAmigosEnLinea() {
  const b = E('tit-pvp-amigos'); if (!b) return;
  const n = AMG.lista.filter(a => a.enLinea).length;
  b.hidden = !n; b.textContent = n === 1 ? tr('1 amigo') : tr('{n} amigos', { n });
}

/* ---------- la pantalla ---------- */
function abreAmigos() { pantalla('p-amigoslista'); amgPinta(); amgLatido(); }
function amgDonde(a) {
  if (!a.enLinea) return a.hace == null ? tr('Nunca') : a.hace < 3600 ? tr('Hace {n} min', { n: Math.max(1, Math.round(a.hace / 60)) }) : a.hace < 86400 ? tr('Hace {n} h', { n: Math.round(a.hace / 3600) }) : tr('Hace {n} días', { n: Math.round(a.hace / 86400) });
  return a.estado === 'partida' ? tr('Jugando una partida') : a.estado === 'sala' ? tr('En su sala, esperando') : tr('En el menú');
}
function amgPinta() {
  E('amg-codigo').textContent = AMG.codigo || (typeof REF !== 'undefined' && REF.codigo) || '…';
  const en = AMG.lista.filter(a => a.enLinea), fuera = AMG.lista.filter(a => !a.enLinea);
  E('amg-en-t').textContent = tr('EN LÍNEA · {n}', { n: en.length }); E('amg-fuera-t').textContent = tr('DESCONECTADOS · {n}', { n: fuera.length });
  const fila = (a, enLinea) => {
    const f = document.createElement('div'); f.className = 'amg-fila' + (enLinea ? '' : ' fuera');
    const k = arLienzo(36, 36); arPinta(k, (c, w, h) => ARD.vestida(c, w, h * 0.94, { esc: h / 96 })); f.appendChild(k);
    const t = document.createElement('span'); t.innerHTML = '<b></b><small></small>'; t.children[0].textContent = a.nombre; t.children[1].textContent = amgDonde(a); f.appendChild(t);
    const b = document.createElement('button'); b.type = 'button'; b.className = 'boton peq';
    if (enLinea && a.estado === 'sala' && a.sala) { b.textContent = tr('UNIRME'); b.classList.add('azul'); b.onclick = () => amgUnirme(a.sala); }
    else if (enLinea && a.estado !== 'partida') { b.textContent = tr('INVITAR'); b.onclick = () => amgInvita(a, b); }
    else if (enLinea) { b.textContent = tr('JUGANDO'); b.disabled = true; }
    else { b.textContent = tr('QUITAR'); b.classList.add('gris'); b.onclick = () => amgQuita(a, b); }
    f.appendChild(b); if (typeof visitaBotonAmigo === 'function') visitaBotonAmigo(f, a); return f;      // VER su escenario (visita.js)
  };
  const le = E('amg-en'); le.innerHTML = ''; for (const a of en) le.appendChild(fila(a, true));
  const lf = E('amg-fuera'); lf.innerHTML = ''; for (const a of fuera) lf.appendChild(fila(a, false));
  E('amg-vacio').hidden = AMG.lista.length > 0;
  E('amg-en-t').hidden = !en.length; E('amg-fuera-t').hidden = !fuera.length;
  // si estás en tu sala con amigos, VOLVER te devuelve a ella
  if (typeof visitaAmigos === 'function') visitaAmigos();      // el ESCENARIO DE LA SEMANA (visita.js)
  const i = RFP.info; E('b-amg-volver').textContent = i && i.privada && i.estado === 'espera' ? tr('VOLVER A LA SALA') : tr('VOLVER');
}
async function amgAnade() {
  const c = (E('amg-nuevo').value || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
  if (c.length !== 6) { play('deny'); avisa(tr('El código tiene 6 letras y números'), 'malo'); return; }
  play('select');
  try { const r = await RFRED.rpc('rouflage_amigo_anadir', { p_codigo: c }); E('amg-nuevo').value = ''; avisa(tr('{n} ya es tu amigo', { n: (r && r.nombre) || c }), 'bueno'); amgLatido(); }
  catch (e) { const m = String((e && e.message) || e); avisa(/es_tuyo/.test(m) ? tr('Ese es tu código') : /codigo_no_valido/.test(m) ? tr('Ese código no existe') : /demasiados/.test(m) ? tr('Ya tienes 100 amigos') : tr('Necesitas conexión'), 'malo'); }
}
async function amgQuita(a, b) {
  if (!b.dataset.seguro) { b.dataset.seguro = '1'; b.textContent = tr('¿SEGURO?'); play('deny'); return; }
  try { await RFRED.rpc('rouflage_amigo_quitar', { p_codigo: a.codigo }); AMG.lista = AMG.lista.filter(x => x !== a); amgPinta(); } catch (_) { /* sin red */ }
}
// invitar: con tu sala abierta, su código; si no, se crea la sala y en cuanto tiene código se manda
async function amgInvita(a, b) {
  play('select'); b.disabled = true; b.textContent = tr('INVITANDO…');
  let i = RFP.info;
  if (!(i && i.privada && i.estado === 'espera' && i.codigo)) {
    pvpBuscar({ crear: true });
    for (let n = 0; n < 40 && !(RFP.info && RFP.info.codigo); n++) await new Promise(r => setTimeout(r, 250));
    i = RFP.info;
  }
  if (!(i && i.codigo)) { avisa(tr('No se ha podido crear la sala'), 'malo'); b.disabled = false; b.textContent = tr('INVITAR'); return; }
  try { await RFRED.rpc('rouflage_amigo_invitar', { p_codigo: a.codigo, p_sala: i.codigo }); avisa(tr('Invitación mandada a {n}: le llegará en unos segundos', { n: a.nombre }), 'bueno'); }
  catch (e) { avisa(/demasiadas/.test(String(e && e.message)) ? tr('Has mandado muchas invitaciones: espera un poco') : tr('No se ha podido invitar'), 'malo'); }
  if (!visible('p-busca')) pvpMuestra('p-busca');
}
function amgUnirme(sala) { play('select'); amgCierraAviso(); RFP.error = ''; pvpBuscar({ codigo: sala }); }

/* ---------- te invitan: aviso arriba con UNIRME ---------- */
function amgInvitacion() {
  if (AMG.aviso || !AMG.cola.length) return;
  const jugando = J.fase === 'prep' || J.fase === 'caza' || J.fase === 'cuenta' || (J.pvp && J.fase !== 'fin');
  if (jugando) return;      // ya saldrá al acabar
  const inv = AMG.cola.shift(), d = document.createElement('div'); d.className = 'amg-aviso';
  d.innerHTML = '<span></span><button type="button" class="boton peq azul"></button><button type="button" class="boton peq gris"></button>';
  d.children[0].textContent = tr('{n} te invita a su sala', { n: inv.nombre });
  d.children[1].textContent = tr('UNIRME'); d.children[1].onclick = () => amgUnirme(inv.sala);
  d.children[2].textContent = tr('NO'); d.children[2].onclick = () => { play('select'); amgCierraAviso(); };
  document.body.appendChild(d); AMG.aviso = d; play('tick');
  setTimeout(() => { if (AMG.aviso === d) amgCierraAviso(); }, 30000);
}
function amgCierraAviso() { if (AMG.aviso) { AMG.aviso.remove(); AMG.aviso = null; } setTimeout(amgInvitacion, 400); }

function preparaAmigos() {
  if (!PANTALLAS.includes('p-amigoslista')) PANTALLAS.push('p-amigoslista');
  E('b-amg-anadir').onclick = amgAnade;
  E('amg-nuevo').onkeydown = ev => { if (ev.key === 'Enter') amgAnade(); };
  E('b-amg-traer').onclick = () => { play('select'); abreInvita(); };
  E('b-amg-volver').onclick = () => { play('select'); const i = RFP.info; if (i && i.privada && i.estado === 'espera') pvpMuestra('p-busca'); else irTitulo(); };
  E('b-busca-amigos').onclick = () => { play('select'); abreAmigos(); };
  // TRAE A UN COLADO vuelve a la lista de amigos
  E('b-inv-volver').onclick = () => { play('select'); abreAmigos(); };
  // el latido: al arrancar, cada 45 s y al volver a la pestaña
  setTimeout(amgLatido, 1500);
  AMG.latido = setInterval(amgLatido, 45000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && Date.now() - AMG.ultimo > 20000) amgLatido(); });
  // al acabar una partida, las invitaciones que esperaban
  setInterval(amgInvitacion, 2000);
}
