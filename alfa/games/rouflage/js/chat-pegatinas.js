// Fans of Rouflage · PEGATINAS EN LA PARTIDA: de fantasma (despedido) y de becario mientras los colados se esconden, el panel del chat rápido (chat-partida.js)
// enseña además tus pegatinas (las de tus paquetes: pegatinas-datos.js). Se mandan como una frase (aviso `ch` con su número, 100 o más) y salen encima de
// quien la manda, en vez del bocadillo de texto, y en la fila de arriba. Mismas reglas de canal que las frases: los fantasmas solo las ven otros fantasmas,
// los becarios solo otros becarios. Nunca dan información: las frases de bando (que dejan marca) siguen siendo gratis para todos.
'use strict';

// ¿puedo mandar pegatinas ahora? De fantasma, o de becario antes de la caza (la sala de espera de los becarios)
const chatPegPuede = () => !!J.yo && typeof pegMias === 'function' && (espectando() || (J.yo.clase === 'cazador' && !J.yo.fuera && (J.fase === 'prep' || J.fase === 'cuenta')));
// quien manda una: lo mismo, mirado desde fuera (para no dibujar una que no tocaba)
const chatPegPuedeEl = e => !!e && (e.fuera || (e.clase === 'cazador' && (J.fase === 'prep' || J.fase === 'cuenta')));

function chatPegHtml(on) {
  if (!chatPegPuede()) return '';
  const ns = []; for (const pq of pegMias()) for (const p of pq.peg) ns.push(p);
  return `<div class="chat-pegs" role="group" aria-label="${esc(tr('PEGATINAS'))}">${ns.map(p => `<button type="button" class="chat-pg" data-n="${p.n}" aria-label="${esc(tr(p.tag))}"${on ? '' : ' disabled'}><img src="${pegImagen(p.n, 120)}" alt=""></button>`).join('')}</div>`;
}
function chatPegManda(n) {
  if (!chatOn() || !chatPuede() || !chatPegPuede() || !pegTengo(n)) return;
  if (RELOJ < CHAT.espera) { play('deny'); pista(tr('Espera un momento para volver a hablar'), 1.4); return; }
  CHAT.espera = RELOJ + CHAT.pausa;
  const s = chatSitio(), canal = chatCanalDe(J.yo);
  chatPegMuestra(J.yo, canal, n, s.x, s.y, true);
  if (J.pvp) rfpManda({ t: 'ch', f: n, x: Math.round(s.x), y: Math.round(s.y) });
  chatAbre(false); play('pop');
  misionEvento('pegatina');      // misiones semanales y logros (misiones.js)
}
function chatPegRecibido(sl, e, n, m) {
  if (!PEG_CHAT[n] || !chatPegPuedeEl(e)) return;
  const canal = chatCanalDe(e);
  if (!chatOn() || !chatMeLlega(canal)) return;
  chatPegMuestra(e, canal, n, +m.x || e.x, +m.y || e.y, false, sl.s);
}
// la fila de arriba (con la pegatina pequeña) y la pegatina encima de quien la manda
function chatPegMuestra(e, canal, n, x, y, mio, slot) {
  if (!chatOn() || !CHAT.feed || !PEG_CHAT[n]) return;
  const p = document.createElement('p');
  p.className = 'chat-fila peg ' + canal + (mio ? ' yo' : '');
  p.innerHTML = `<b>${esc(mio ? tr('Tú') : e.nombre)}:</b> <img src="${pegImagen(n, 96)}" alt="${esc(tr(PEG_CHAT[n].tag))}">`;
  CHAT.feed.appendChild(p);
  for (const v of CHAT.feed.children) if (v !== p) v.classList.add('viejo');
  while (CHAT.feed.children.length > CHAT.max) CHAT.feed.firstChild.remove();
  setTimeout(() => p.classList.add('adios'), (CHAT.dura - 0.5) * 1000); setTimeout(() => p.remove(), CHAT.dura * 1000);
  chatColocaFeed();
  for (let k = CHAT.dichos.length - 1; k >= 0; k--) if (CHAT.dichos[k].e === e) CHAT.dichos.splice(k, 1);
  CHAT.dichos.push({ e, slot, canal, peg: n, t: RELOJ, x, y });
  if (!mio) { if (!CHAT.abierto) CHAT.nuevos++; play('pop', 0.5); chatPintaBoton(); }
}
// pintaChat (chat-partida.js): la pegatina encima de quien la manda, del mismo tamaño en pantalla, con un saltito al salir
function pintaPegDicho(c, d, p, s) {
  const cv = pegLienzo(d.peg, 160); if (!cv) return;
  const edad = RELOJ - d.t, al = Math.min(1, (CHAT.durDicho - edad) * 3), pop = 1 + Math.max(0, 1 - edad * 7) * 0.25, L = 84;
  const alto = p.fan ? 60 : 124, sx = (p.x - CAM.x) * CAM.z, sy = (p.y - CAM.y) * CAM.z - alto * CAM.z;
  if (Math.abs(sx) > VW / 2 + 40 || sy < -VH / 2 - 40 || sy > VH / 2 + 60) return;
  const mueve = limita(sx, -VW / 2 + L / 2 + 6, VW / 2 - L / 2 - 6) - sx;
  c.save(); c.globalAlpha = al; c.translate(p.x, p.y); c.scale(s, s); c.translate(mueve, -alto * CAM.z); c.scale(pop, pop);
  c.drawImage(cv, -L / 2, -L + 6, L, L);
  c.restore();
}
