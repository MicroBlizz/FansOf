// Fans of Rumble · Frases y emoticonos en la partida: el botón del bocadillo, el panel (opción A, elegida por Daniel),
// los bocadillos encima de cada sede y la CPU, que contesta. En PvP viajan dentro del mensaje de turno (19b-pvp.js: PVP.frase).
// No tocan la simulación: no pueden descuadrar una partida PvP. Los datos están en js/retos-armario.js; el armario, en core/js/frases.js.
'use strict';
const FRP = { cd: 2.5, max: 3, ventana: 10, dura: 2.8 };   // segundos entre una y otra · como mucho 3 cada 10 s · lo que dura el bocadillo
const FR_ST = { abierto: false, mias: [], mute: false, ultimaCpu: 0, raf: 0, vivos: [], visto: { estado: '', p: 0, e: 0 } };
// lo que dice la CPU (según la empresa rival; con una facción corrompida, las de «otros»)
const FR_CPU = {
  microblizz: { inicio: ['Tu juego ha sido adquirido', 'Bienvenido a la reestructuración'], responde: ['Hemos tomado nota', 'Pasa por caja', 'Eso no estaba en el contrato', 'Tu opinión ha sido archivada'], gana: ['Despedido', 'Rentabilidad récord'], pierde: ['Esa torre nos sobraba', 'Ya la cobraremos en un DLC'] },
  phony: { inicio: ['Esto ahora es de suscripción'], responde: ['Mensaje solo para suscriptores Plus', 'Remasterizado a 70 €', 'Error de conexión. Pague para reintentar'], gana: ['Renovación automática activada'], pierde: ['Servidores en mantenimiento'] },
  iahorro: { inicio: ['Te ha sustituido una IA'], responde: ['Generado en 3 segundos', 'Como modelo de lenguaje, me río', 'Respuesta optimizada'], gana: ['Optimizado'], pierde: ['Error 404: torre no encontrada'] },
  otros: { inicio: ['¡Hola!', 'Que gane el mejor'], responde: ['Bien jugado', 'Uy…', 'JAJAJA', '¿Y eso?'], gana: ['¡Toma!', 'Para la próxima'], pierde: ['Uy…', 'Ha sido el lag'] },
};
const frEnPartida = () => G.state === 'play' && !G.autoplay;
const frRivalFuera = () => !!SAVE.frOff || FR_ST.mute;
const frCpuDe = () => FR_CPU[G.efac] || (G.mode === 'camp' || G.mode === 'boss' ? FR_CPU[ownerOf()] : null) || FR_CPU.otros;
const frRivalNombre = () => (PVP.on ? PVP.rival || 'Rival' : G.efac && FACTIONS[G.efac] ? enemyLabel(G.efac) : ownerName());

/* ---------- el bocadillo: arriba el del rival, abajo el tuyo ---------- */
function frBocadillo(quien, f) {   // f: { frase } | { emote } | { txt } (lo de la CPU)
  const el = $(quien === 'yo' ? '#fr-yo' : '#fr-rival'); if (!el) return;
  const D = f.frase ? FRD('frase')[f.frase] : f.emote ? FRD('emote')[f.emote] : null;
  if ((f.frase || f.emote) && !D) return;   // un id que no existe (otra versión): no se enseña
  const nombre = quien === 'yo' ? pname() : frRivalNombre();
  el.className = 'fr-bubble ' + (quien === 'yo' ? 'yo' : 'rival') + (f.emote ? ' em' : '') + (D && D.rar ? ' rar-' + D.rar : '');
  el.style.setProperty('--rc', D ? rarColor(D.rar) : '#c3c9d4');
  el.innerHTML = `<b class="fr-who">${esc(nombre)}</b>` + (f.emote ? `<canvas data-em="${f.emote}" data-lw="92" aria-hidden="true"></canvas>` : `<span class="fr-say">${esc(f.frase ? D.t : f.txt)}</span>`);
  if (f.emote) pintaEmote(el.querySelector('canvas'), f.emote, 92, 0);
  el.hidden = false; el.classList.remove('sale'); void el.offsetWidth; el.classList.add('sale');
  const v = { el, t0: performance.now(), em: f.emote && D.anim ? f.emote : null };
  FR_ST.vivos = FR_ST.vivos.filter(x => x.el !== el).concat(v);
  clearTimeout(el._tm); el._tm = setTimeout(() => { el.classList.add('fuera'); setTimeout(() => { el.hidden = true; el.classList.remove('fuera'); }, 280); FR_ST.vivos = FR_ST.vivos.filter(x => x !== v); }, FRP.dura * 1000);
  if (v.em && !FR_ST.raf) FR_ST.raf = requestAnimationFrame(frAnima);
}
function frAnima(now) {   // los emoticonos que se mueven (billetes, directo, el foco de la directora)
  FR_ST.raf = 0; let alguno = false;
  for (const v of FR_ST.vivos) if (v.em) { const cv = v.el.querySelector('canvas'); if (cv) { pintaEmote(cv, v.em, 92, (now - v.t0) / 1000); alguno = true; } }
  if (alguno) FR_ST.raf = requestAnimationFrame(frAnima);
}
function frLimpia() { for (const s of ['#fr-yo', '#fr-rival']) { const el = $(s); if (el) { clearTimeout(el._tm); el.hidden = true; } } FR_ST.vivos = []; frCierra(); }

/* ---------- mandar una ---------- */
function frPuede() {
  const ahora = performance.now() / 1000; FR_ST.mias = FR_ST.mias.filter(t => ahora - t < FRP.ventana);
  const ult = FR_ST.mias[FR_ST.mias.length - 1];
  if (ult != null && ahora - ult < FRP.cd) return false;
  return FR_ST.mias.length < FRP.max;
}
function frManda(f) {
  if (!frEnPartida()) return;
  if (!frPuede()) { play('deny'); toast('Más despacio: hasta Microblizz respira entre reunión y reunión'); return; }
  FR_ST.mias.push(performance.now() / 1000); frCierra(); play('pop'); frBocadillo('yo', f); frBoton();
  stat('frase', 1);
  if (PVP.on) { PVP.frase = f.frase ? 'f:' + f.frase : 'e:' + f.emote; return; }   // sale con el próximo turno
  if (Math.random() < 0.65) frCpu('responde', 1.1 + Math.random() * 0.9);
}
// la CPU dice algo (con un poco de retraso, y no más de una vez cada 6 s)
function frCpu(cuando, retraso = 0.6) {
  if (PVP.on || G.mode === 'sandbox' || frRivalFuera()) return;
  const ahora = performance.now() / 1000; if (ahora - FR_ST.ultimaCpu < 6) return; FR_ST.ultimaCpu = ahora;
  const L = frCpuDe()[cuando]; if (!L) return;
  setTimeout(() => { if (frEnPartida() && !frRivalFuera()) { play('blip'); frBocadillo('rival', { txt: pick(L) }); } }, retraso * 1000);
}
// lo del rival en PvP (lo llama pvpRecibir)
function frDelRival(cod) {
  if (typeof cod !== 'string' || frRivalFuera() || !frEnPartida()) return;
  const [t, id] = cod.split(':'); if ((t !== 'f' && t !== 'e') || !id) return;
  play('blip'); frBocadillo('rival', t === 'f' ? { frase: id } : { emote: id });
}

/* ---------- el botón y el panel ---------- */
function frBoton() {
  const b = $('#btn-fr'); if (!b) return;
  b.hidden = !frEnPartida() || !ARM();
  const ahora = performance.now() / 1000, ult = FR_ST.mias[FR_ST.mias.length - 1], falta = ult == null ? 0 : Math.max(0, FRP.cd - (ahora - ult));
  b.style.setProperty('--cd', String(falta / FRP.cd)); b.classList.toggle('espera', falta > 0);
}
function frAbre() {
  if (!frEnPartida()) return;
  const P = frasesPuestas(), p = $('#fr-panel');
  p.innerHTML = `<div class="frp-h"><b class="ol">TUS FRASES</b><button class="frp-mute${FR_ST.mute ? ' on' : ''}" id="frp-mute" aria-pressed="${FR_ST.mute}">${FR_ST.mute ? ICO_MUDO : ICO_VOZ}<span>${FR_ST.mute ? 'Rival silenciado' : 'Silenciar al rival'}</span></button></div>`
    + `<div class="frp-f">${P.frase.map(id => { const D = FRD('frase')[id]; return `<button class="frp-fr" data-frm="frase:${id}" style="--rc:${rarColor(D.rar)}">${esc(D.t)}</button>`; }).join('')}</div>`
    + `<div class="frp-e">${P.emote.map(id => { const D = FRD('emote')[id]; return `<button class="frp-em rar-${D.rar}" data-frm="emote:${id}" style="--rc:${rarColor(D.rar)}" aria-label="${esc(D.name)}"><canvas data-em="${id}" data-lw="64" aria-hidden="true"></canvas></button>`; }).join('')}</div>`
    + '<p class="frp-pie">Cámbialas en el <b>Armario</b> (tu perfil).</p>';
  pintaEmotes(p);
  for (const b of p.querySelectorAll('[data-frm]')) b.onclick = e => { e.stopPropagation(); const [t, id] = b.dataset.frm.split(':'); frManda(t === 'frase' ? { frase: id } : { emote: id }); };
  $('#frp-mute').onclick = e => { e.stopPropagation(); FR_ST.mute = !FR_ST.mute; play('select'); if (FR_ST.mute) { const r = $('#fr-rival'); r.hidden = true; } frAbre(); };
  p.hidden = false; FR_ST.abierto = true; $('#btn-fr').setAttribute('aria-expanded', 'true'); play('select');
}
function frCierra() { const p = $('#fr-panel'); if (p) p.hidden = true; FR_ST.abierto = false; const b = $('#btn-fr'); if (b) b.setAttribute('aria-expanded', 'false'); }
const ICO_VOZ = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>';
const ICO_MUDO = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>';

(function frMonta() {
  const ui = $('#ui'); if (!ui || $('#btn-fr')) return;
  ui.insertAdjacentHTML('beforeend', '<div class="fr-bubble rival" id="fr-rival" hidden aria-live="polite"></div><div class="fr-bubble yo" id="fr-yo" hidden></div>'
    + '<div id="fr-panel" hidden></div>'
    + '<button id="btn-fr" class="btn-fr" hidden aria-label="Frases y emoticonos" aria-expanded="false"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5 6.5h22a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3H14l-6.5 5v-5H5a3 3 0 0 1-3-3v-11a3 3 0 0 1 3-3z" fill="#fff6ea" stroke="#20102c" stroke-width="2.6" stroke-linejoin="round"/><circle cx="10" cy="15" r="2.2" fill="#a3168f"/><circle cx="16" cy="15" r="2.2" fill="#a3168f"/><circle cx="22" cy="15" r="2.2" fill="#a3168f"/></svg></button>');
  const b = $('#btn-fr');
  b.addEventListener('pointerdown', e => e.stopPropagation());
  b.addEventListener('click', e => { e.stopPropagation(); if (FR_ST.abierto) { frCierra(); play('select'); } else frAbre(); });
  $('#fr-panel').addEventListener('pointerdown', e => e.stopPropagation());
  // tocar fuera del panel lo cierra (y ese toque no hace nada más)
  window.addEventListener('pointerdown', e => { if (FR_ST.abierto && !e.target.closest('#fr-panel, #btn-fr')) frCierra(); }, true);
  // vigila la partida: al empezar, al caer torres y al acabar (sin tocar la simulación)
  setInterval(() => {
    const V = FR_ST.visto, st = G.state;
    if (st !== V.estado) {
      if (st === 'countdown') { frLimpia(); FR_ST.mias = []; FR_ST.mute = false; FR_ST.ultimaCpu = 0; PVP.frase = null; }
      if (st === 'play' && V.estado === 'countdown' && Math.random() < 0.45) frCpu('inicio', 1.2);
      if (st !== 'play' && st !== 'paused') frLimpia();
      if (st === 'paused') frCierra();
      V.estado = st;
    }
    if (S && st === 'play') {
      const yo = verEquipo(), otro = other(yo);
      if (S[otro].crowns > V.e) { if (Math.random() < 0.5) frCpu('gana', 0.9); }
      if (S[yo].crowns > V.p) { if (Math.random() < 0.4) frCpu('pierde', 1.4); }
      V.p = S[yo].crowns; V.e = S[otro].crowns;
    } else if (st === 'countdown') { V.p = 0; V.e = 0; }
    frBoton();
  }, 200);
})();

/* ---------- Opciones: frases del rival sí / no ---------- */
(function frOpcion() {
  const fila = document.querySelector('#btn-chat') && document.querySelector('#btn-chat').closest('.opt-row'); if (!fila || $('#btn-frases')) return;
  fila.insertAdjacentHTML('afterend', '<div class="opt-row"><span><b>Frases del rival</b><br>Las frases y los emoticonos que te manda el rival (o la CPU) durante la partida.</span><button class="btn-ghost ol" id="btn-frases">SÍ</button></div>');
  const pinta = () => { $('#btn-frases').textContent = SAVE.frOff ? 'NO' : 'SÍ'; };
  $('#btn-frases').addEventListener('click', () => { SAVE.frOff = !SAVE.frOff; saveGame(); pinta(); play('select'); });
  $('#btn-options').addEventListener('click', pinta); pinta();
})();
