// Fans of Rouflage · EL CHAT (2 de 5): FRASES RÁPIDAS EN PARTIDA, sin teclado. Un botón pequeño abajo a la izquierda (azul de becario, naranja de colado,
// morado de fantasma; gris y tachado si el chat está apagado) abre un panel con las 8 frases de tu canal (chat-frases.js). Al mandar una sale una fila arriba a
// la izquierda («Nombre: frase», con el color del bando, se va a los 5 s, 3 como mucho) y un bocadillo sobre quien la manda; «¡Aquí hay uno!» y «Mirad aquí»
// dejan además una marca en su sitio unos segundos. Con el panel cerrado, un número rojo cuenta los mensajes nuevos. Entre frase y frase, 2 s.
// En el ordenador: T abre y cierra el panel y 1-8 mandan una frase (con el panel abierto; cerrado, 1 y 2 siguen siendo silbar y la habilidad).
// En el PvP la frase viaja por el canal de la partida como un aviso `ch` con su número (rfpManda, pvp-sync.js; también en ?pvp=local) y quien la recibe
// mira el bando del que la manda: nunca ve el canal del otro bando, y lo de los fantasmas solo lo ven otros fantasmas. Los bots hablan en chat-bots.js
// (contra bots, y en el PvP los de la máquina, desde el anfitrión).
'use strict';

const CHAT = { pausa: 2, dura: 5, max: 3, durMarca: 6, durDicho: 3.2,
  abierto: false, nuevos: 0, espera: 0, yo: null, canal: '', btn: null, panel: null, feed: null, dichos: [], marcas: [], tFeed: 0 };

// mi canal y el de cualquiera: becarios, colados vivos o fantasmas (colados despedidos)
const chatCanalDe = e => !e ? '' : e.clase === 'cazador' ? 'b' : e.fuera ? 'f' : 'c';
// ¿lo que se dice en ese canal me llega? Los fantasmas también leen a sus colados vivos
const chatMeLlega = canal => { const m = chatCanalDe(J.yo); return !!m && (canal === m || (m === 'f' && canal === 'c')); };
const chatPuede = () => !!J.yo && !(typeof RETO !== 'undefined' && RETO.activo) && ['prep', 'cuenta', 'caza'].includes(J.fase) && !TALLER.abierto && !E('hud').hidden && !(J.yo.fuera && !espectando());

// ---------- el botón, el panel y la columna de mensajes (se crean la primera vez que hacen falta) ----------
function chatPrepara() {
  if (CHAT.btn) return;
  const hud = E('hud');
  const b = CHAT.btn = document.createElement('button');
  b.type = 'button'; b.id = 'b-chat'; b.className = 'chat-boton'; b.hidden = true;
  b.innerHTML = `<span class="chat-ico"></span><i class="chat-n" hidden></i><kbd>T</kbd>`;
  b.onclick = () => { play('select'); chatAbre(!CHAT.abierto); };
  const p = CHAT.panel = document.createElement('div');
  p.id = 'chat-panel'; p.className = 'chat-panel'; p.hidden = true; p.setAttribute('role', 'dialog');
  p.addEventListener('click', ev => {
    const f = ev.target.closest('.chat-fr'); if (f && !f.disabled) { chatManda(+f.dataset.i); return; }
    const g = ev.target.closest('.chat-pg'); if (g && !g.disabled) chatPegManda(+g.dataset.n);      // una pegatina (chat-pegatinas.js)
  });
  const f = CHAT.feed = document.createElement('div');
  f.id = 'chat-filas'; f.className = 'chat-filas'; f.setAttribute('aria-live', 'polite');
  hud.append(f, p, b);
}
// el panel con las frases de mi canal (se rehace al cambiar de canal o de idioma)
function chatPintaPanel() {
  const canal = chatCanalDe(J.yo), on = chatOn(), d = CHAT_CANAL[canal]; if (!d) return;
  const clase = { b: 'bec', c: 'col', f: 'fan' }[canal];
  CHAT.panel.className = 'chat-panel ' + clase + (on ? '' : ' apagado');
  CHAT.panel.setAttribute('aria-label', tr(d.titulo));
  CHAT.panel.innerHTML = `<h4>${chatIcono({ b: '#8fbfff', c: '#ffb070', f: '#cbb6ff' }[canal], false, 22)}<span>${tr(d.titulo)}</span><em>${tr(d.solo)}</em></h4>
    <div class="chat-frases">${CHAT_FRASES[canal].map((x, i) => `<button type="button" class="chat-fr${CHAT_MARCA[canal] && CHAT_MARCA[canal][i] ? ' marca m' + i : ''}" data-i="${i}"${on ? '' : ' disabled'}>`
      + (CHAT_MARCA[canal] && CHAT_MARCA[canal][i] ? '<svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6" fill="none" stroke="#0b0f1c" stroke-width="3"/><circle cx="8" cy="8" r="2" fill="#0b0f1c"/></svg>' : '')
      + `<span>${esc(tr(x))}</span><kbd>${i + 1}</kbd></button>`).join('')}</div>
    ${chatPegHtml(on)}
    <div class="chat-pie"><span>${on ? tr(d.pie) : tr('Chat apagado: no llega nada')}</span>${chatTogHtml()}</div>`;
  CHAT.panelDe = chatPanelClave();
}
// cuándo hay que rehacer el panel: otro canal, chat encendido o apagado, o se abren o cierran las pegatinas
const chatPanelClave = () => chatCanalDe(J.yo) + (chatOn() ? 1 : 0) + (chatPegPuede() ? 'p' : '');
function chatPintaBoton() {
  const canal = chatCanalDe(J.yo), on = chatOn(), b = CHAT.btn;
  const k = 'chat-boton ' + ({ b: 'bec', c: 'col', f: 'fan' }[canal] || '') + (on ? '' : ' off') + (CHAT.abierto ? ' abierto' : '');
  if (b.className !== k) b.className = k;
  const ico = (on ? 'si' : 'no') + canal;
  if (b.dataset.ico !== ico) { b.dataset.ico = ico; b.querySelector('.chat-ico').innerHTML = on ? chatIcono('#fff6ea') : chatIcono('#b9c6dc', false); }
  b.setAttribute('aria-label', on ? tr('Chat rápido') : tr('Chat apagado'));
  const n = b.querySelector('.chat-n'), ver = on && CHAT.nuevos > 0 && !CHAT.abierto;
  if (n.hidden === ver) n.hidden = !ver;
  if (ver && n.textContent !== String(Math.min(9, CHAT.nuevos))) n.textContent = CHAT.nuevos > 9 ? '9+' : String(CHAT.nuevos);
}
function chatAbre(si) {
  if (!CHAT.panel) return;
  CHAT.abierto = !!si && chatPuede();
  if (CHAT.abierto) { CHAT.nuevos = 0; chatPintaPanel(); chatConsejoCierra(); }
  CHAT.panel.hidden = !CHAT.abierto;
  chatPintaBoton();
}
// al encender o apagar desde el interruptor (chat-frases.js)
function chatPartidaCambia() {
  if (!CHAT.panel) return;
  if (!chatOn()) { CHAT.nuevos = 0; CHAT.feed.textContent = ''; CHAT.dichos.length = 0; CHAT.marcas.length = 0; }
  if (CHAT.abierto) chatPintaPanel();
  chatPintaBoton();
}

// ---------- mandar y recibir ----------
// dónde está quien habla: su personaje o, si mira de fantasma, su fantasma
const chatSitio = () => (espectando() && J.fantasma ? J.fantasma : J.yo);
function chatManda(i) {
  const canal = chatCanalDe(J.yo);
  if (!chatOn() || !chatPuede() || !CHAT_FRASES[canal] || !(i >= 0 && i < 8)) return;
  if (RELOJ < CHAT.espera) { play('deny'); pista(tr('Espera un momento para volver a hablar'), 1.4); return; }
  CHAT.espera = RELOJ + CHAT.pausa;
  const s = chatSitio();
  chatMuestra(J.yo, canal, i, s.x, s.y, true);
  if (J.pvp) rfpManda({ t: 'ch', f: i, x: Math.round(s.x), y: Math.round(s.y) });
  chatAbre(false); play('pop');
  if (typeof chatBotsOyen === 'function') chatBotsOyen(canal, i);
}
// llega un `ch` por la red: el canal lo dice el bando de quien lo manda (no lo que diga el mensaje)
function chatRecibido(sl, m) {
  if (m.b != null) {      // un bot: solo si lo dice el anfitrión y la plaza es de la máquina (chat-bots.js)
    const bs = RFP.slots[m.b | 0]; if (m.de !== RFP.host || !bs || bs.humano) return;
    sl = bs;
  }
  const e = sl && sl.ente, i = m.f | 0;
  if (e && i >= 100 && m.b == null) { chatPegRecibido(sl, e, i, m); return; }      // una pegatina (chat-pegatinas.js)
  if (!e || !(i >= 0 && i < 8)) return;
  const canal = chatCanalDe(e);
  if (!chatOn() || !chatMeLlega(canal)) return;
  chatMuestra(e, canal, i, +m.x || e.x, +m.y || e.y, false, sl.s);
}
// lo que se ve: la fila, el bocadillo y, si toca, la marca. Lo usan también los bots (chat-bots.js)
function chatMuestra(e, canal, i, x, y, mio, slot) {
  if (!chatOn() || !CHAT.feed) return;
  const txt = chatFrase(canal, i); if (!txt) return;
  const p = document.createElement('p');
  p.className = 'chat-fila ' + canal + (mio ? ' yo' : '');
  p.innerHTML = `<b>${esc(mio ? tr('Tú') : e.nombre)}:</b> ${esc(txt)}`;
  CHAT.feed.appendChild(p);
  for (const v of CHAT.feed.children) if (v !== p) v.classList.add('viejo');
  while (CHAT.feed.children.length > CHAT.max) CHAT.feed.firstChild.remove();
  setTimeout(() => p.classList.add('adios'), (CHAT.dura - 0.5) * 1000); setTimeout(() => p.remove(), CHAT.dura * 1000);
  chatColocaFeed();
  for (let k = CHAT.dichos.length - 1; k >= 0; k--) if (CHAT.dichos[k].e === e) CHAT.dichos.splice(k, 1);
  CHAT.dichos.push({ e, slot, canal, txt: txt.toUpperCase(), t: RELOJ, x, y });
  const col = CHAT_MARCA[canal] && CHAT_MARCA[canal][i];
  if (col && J.fase === 'caza') { CHAT.marcas.push({ x, y, col, t: RELOJ, de: mio ? tr('Tú') : e.nombre }); while (CHAT.marcas.length > 4) CHAT.marcas.shift(); }
  if (!mio) { if (!CHAT.abierto) CHAT.nuevos++; play('pop', 0.5); chatPintaBoton(); }
}
// la columna de mensajes va justo debajo de los avisos (o del marcador, si no hay avisos)
function chatColocaFeed() {
  const f = CHAT.feed; if (!f || !f.children.length) return;
  const av = E('avisos'), r = av.children.length ? av.getBoundingClientRect() : null;
  const top = r && r.height ? r.bottom + 6 : finMarcador() + 8;
  f.style.top = Math.round(top) + 'px';
}

// ---------- cada fotograma (principal.js) ----------
function chatAvanza(dt) {
  if (!J.yo) { if (CHAT.btn && !CHAT.btn.hidden) { CHAT.btn.hidden = true; chatAbre(false); } CHAT.yo = null; return; }
  chatPrepara();
  if (CHAT.yo !== J.yo) {      // partida nueva: se olvida lo de la anterior
    CHAT.yo = J.yo; CHAT.nuevos = 0; CHAT.espera = 0; CHAT.dichos.length = 0; CHAT.marcas.length = 0; CHAT.feed.textContent = ''; CHAT.canal = '';
    if (typeof chatBotsEmpieza === 'function') chatBotsEmpieza();
  }
  const ver = chatPuede();
  if (CHAT.btn.hidden === ver) { CHAT.btn.hidden = !ver; if (!ver) chatAbre(false); }
  const canal = chatCanalDe(J.yo);
  if (canal !== CHAT.canal) { CHAT.canal = canal; chatPintaBoton(); if (CHAT.abierto) chatPintaPanel(); }
  if (CHAT.abierto && CHAT.panelDe !== chatPanelClave()) chatPintaPanel();
  if (ver) {
    CHAT.btn.classList.toggle('cargando', RELOJ < CHAT.espera);
    if (!CHAT.consejoVisto && !(typeof bocadilloActivo === 'function' && bocadilloActivo()) && !J.pausa) {
      CHAT.consejoVisto = true;
      chatConsejo(CHAT.btn, matchMedia('(hover: hover) and (pointer: fine)').matches ? tr('Avisa a tu bando con una frase rápida (tecla T). Solo lo ven los tuyos.') : tr('Avisa a tu bando con una frase rápida. Solo lo ven los tuyos.'), 'chat-consejo');
    }
    chatConsejoColoca();
  }
  if ((CHAT.tFeed -= dt) <= 0) { CHAT.tFeed = 0.2; chatColocaFeed(); }
  while (CHAT.dichos.length && RELOJ - CHAT.dichos[0].t > CHAT.durDicho) CHAT.dichos.shift();
  while (CHAT.marcas.length && RELOJ - CHAT.marcas[0].t > CHAT.durMarca) CHAT.marcas.shift();
  if (J.fase !== 'caza' && CHAT.marcas.length) CHAT.marcas.length = 0;
  if ((!J.pvp || RFP.soyHost) && typeof chatBotsAvanza === 'function') chatBotsAvanza(dt);      // contra bots, o el anfitrión por los bots del PvP
}

// ---------- en el mapa (dibujo.js, encima de la oscuridad): las marcas y los bocadillos, siempre del mismo tamaño en pantalla ----------
function pintaChat(c, t) {
  if (!J.yo || (!CHAT.dichos.length && !CHAT.marcas.length)) return;
  const s = 1 / CAM.z, mw = VW / CAM.z / 2 - 30 / CAM.z, mh = VH / CAM.z / 2 - 70 / CAM.z;
  for (const m of CHAT.marcas) {
    const vida = (RELOJ - m.t) / CHAT.durMarca, al = Math.min(1, (1 - vida) * 4), dx = m.x - CAM.x, dy = m.y - CAM.y;
    c.save(); c.globalAlpha = al;
    if (Math.abs(dx) > mw || Math.abs(dy) > mh) {      // fuera de la pantalla: una flecha en el borde
      const k = Math.min(mw / Math.abs(dx || 1e-6), mh / Math.abs(dy || 1e-6));
      c.translate(CAM.x + dx * k, CAM.y + dy * k); c.rotate(Math.atan2(dy, dx)); c.scale(s, s);
      c.beginPath(); c.moveTo(16, 0); c.lineTo(-8, -12); c.lineTo(-8, 12); c.closePath();
      c.fillStyle = m.col; c.strokeStyle = OL; c.lineWidth = 3; c.lineJoin = 'round'; c.stroke(); c.fill();
    } else {
      const pulso = (t * 1.4) % 1;
      c.translate(m.x, m.y - 10); c.scale(s, s);
      c.beginPath(); c.arc(0, 0, 22 + pulso * 26, 0, TAU); c.globalAlpha = al * (1 - pulso); c.lineWidth = 3; c.strokeStyle = m.col; c.stroke(); c.globalAlpha = al;
      c.beginPath(); c.arc(0, 0, 21, 0, TAU); c.lineWidth = 9; c.strokeStyle = OL; c.stroke(); c.lineWidth = 5; c.strokeStyle = m.col; c.stroke();
      c.save(); c.rotate(t * 1.5); c.setLineDash([5, 4]); c.beginPath(); c.arc(0, 0, 11, 0, TAU); c.lineWidth = 3; c.stroke(); c.restore();
      c.beginPath(); c.arc(0, 0, 3.5, 0, TAU); c.fillStyle = m.col; c.fill();
    }
    c.restore();
  }
  for (const d of CHAT.dichos) {
    const p = chatSitioDe(d); if (!p) continue;
    if (d.peg) { pintaPegDicho(c, d, p, s); continue; }      // una pegatina en vez de bocadillo (chat-pegatinas.js)
    const edad = RELOJ - d.t, al = Math.min(1, (CHAT.durDicho - edad) * 3), pop = 1 + Math.max(0, 1 - edad * 7) * 0.22;
    const alto = d.e && d.e.gesto && d.e.gesto.hasta > RELOJ ? 180 : p.fan ? 58 : 122;      // por encima del rótulo «TÚ» (y del gesto, si hace uno)
    const sx = (p.x - CAM.x) * CAM.z, sy = (p.y - CAM.y) * CAM.z - alto * CAM.z;      // en píxeles de pantalla, desde el centro
    if (Math.abs(sx) > VW / 2 + 20 || sy < -VH / 2 - 10 || sy > VH / 2 + 40) continue;      // quien habla está fuera de la pantalla: basta con la fila
    c.font = '400 14px ' + LETRA_GORDA;
    const w = Math.min(230, c.measureText(d.txt).width) + 20, mueve = limita(sx, -VW / 2 + w / 2 + 8, VW / 2 - w / 2 - 8) - sx;      // que no se salga por los lados
    c.save(); c.globalAlpha = al; c.translate(p.x, p.y); c.scale(s, s); c.translate(0, -alto * CAM.z); c.scale(pop, pop);
    chatBocadillo(c, d.txt, { b: '#cfe6ff', c: '#ffe0b8', f: '#e4daff' }[d.canal] || '#fff6ea', mueve / pop);
    c.restore();
  }
}
// dónde va el bocadillo: encima del personaje, o del fantasma (el mío o el de otro jugador en el PvP)
function chatSitioDe(d) {
  const e = d.e;
  if (e === J.yo && espectando() && J.fantasma) return { x: J.fantasma.x, y: J.fantasma.y, fan: true };
  if (e && e.fuera) { const g = d.slot != null && typeof FANTASMAS_RED !== 'undefined' && FANTASMAS_RED[d.slot]; return g ? { x: g.x, y: g.y, fan: true } : null; }
  if (e && !e.fuera) return { x: e.x, y: e.y };
  return null;
}
// el bocadillo de texto: letras de la serie, contorno grueso y el pico hacia abajo
// (mueve: cuánto se corre la caja hacia un lado para no salirse de la pantalla; el pico sigue señalando a quien habla)
function chatBocadillo(c, txt, fondo, mueve = 0) {
  c.font = '400 14px ' + LETRA_GORDA;
  const w = Math.min(230, c.measureText(txt).width) + 20, h = 26, pico = limita(-mueve, -w / 2 + 16, w / 2 - 16);
  c.translate(mueve, 0);
  c.beginPath(); rrPathRF(c, -w / 2, -h - 9, w, h, 11); c.moveTo(pico - 7, -9.5); c.lineTo(pico, 0); c.lineTo(pico + 7, -9.5);
  c.fillStyle = OL; c.save(); c.translate(0, 3); c.fill(); c.restore();
  c.fillStyle = fondo; c.fill(); c.lineWidth = 3; c.lineJoin = 'round'; c.strokeStyle = OL; c.stroke();
  c.fillStyle = OL; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, 0, -h / 2 - 7.5, 230); c.textAlign = 'start'; c.textBaseline = 'alphabetic';
}

// ---------- teclado (antes que controles.js) y tocar fuera del panel para cerrarlo (sin disparar ni andar) ----------
window.addEventListener('keydown', ev => {
  if (ev.repeat || ev.ctrlKey || ev.metaKey || ev.altKey || (ev.target && ev.target.closest && ev.target.closest('input, textarea, select'))) return;
  if (!CHAT.btn || !chatPuede()) return;
  let usado = false;
  if (ev.code === 'KeyT') { chatAbre(!CHAT.abierto); play('select'); usado = true; }
  else if (CHAT.abierto && /^(Digit|Numpad)[1-8]$/.test(ev.code)) { chatManda(+ev.code.slice(-1) - 1); usado = true; }
  else if (CHAT.abierto && ev.code === 'Escape') { chatAbre(false); usado = true; }
  if (usado) { ev.preventDefault(); ev.stopImmediatePropagation(); }
}, true);
window.addEventListener('pointerdown', ev => {
  if (!CHAT.abierto || !CHAT.panel || ev.target.closest('#chat-panel, #b-chat')) return;
  chatAbre(false);
  if (ev.target === cv) { ev.preventDefault(); ev.stopImmediatePropagation(); }      // ese toque solo cierra el panel
}, true);
