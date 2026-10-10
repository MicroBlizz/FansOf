// Fans of Roguelite · El directo: el juego se ve como un directo de Twitch. Arriba, la etiqueta EN DIRECTO con los
// espectadores; abajo, el chat, donde se mezcla lo que va pasando (con «>») con lo que escriben los espectadores (nombre de
// color e insignia). Comentan lo que pasa, dan consejos (buenos y malos) y Lola, la moderadora, da el consejo de verdad la
// primera vez de cada cosa. Se apaga en Opciones.
'use strict';

const CHATS = { t: 5, cd: {}, ult: -9, recientes: [], quien: null };
const chatApagado = () => !!GUARDA.chatOff;

// alguien del chat dice algo de la lista «tipo» ({X} = extra)
function chatDice(tipo, extra) {
  if (chatApagado()) return;
  const mundo = tipo === 'idle' && Math.random() < 0.45 ? CHAT_MUNDO[VIAJE.mundo] : null, lista = mundo || CHAT_FRASES[tipo];
  if (!lista) return;
  let txt = lista[Math.floor(Math.random() * lista.length)];
  for (let i = 0; i < 6 && CHATS.recientes.includes(txt); i++) txt = lista[Math.floor(Math.random() * lista.length)];
  CHATS.recientes.push(txt); if (CHATS.recientes.length > 12) CHATS.recientes.shift();
  let u = CHAT_USUARIOS[Math.floor(Math.random() * CHAT_USUARIOS.length)];
  if (u === CHATS.quien) u = CHAT_USUARIOS[(CHAT_USUARIOS.indexOf(u) + 1) % CHAT_USUARIOS.length];
  CHATS.quien = u;
  LOG.push({ txt: tr(txt).replace(/\{X\}/g, extra || ''), quien: u, t0: RELOJ.t });
  if (LOG.length > 30) LOG.shift();
  if (ESPECTA[tipo]) VIAJE.esp += Math.round(ESPECTA[tipo] * (0.6 + Math.random()) * (1 + VIAJE.mundo * 0.5));
}
// un comentario por algo que pasa: con su probabilidad y su pausa (y nunca dos casi a la vez)
function chatEv(tipo, extra, prob = 1, cd = 5) {
  if (chatApagado() || VIAJE.modo !== 'juego' || Math.random() > prob) return;
  if (CHATS.cd[tipo] != null && RELOJ.t - CHATS.cd[tipo] < cd) return;
  if (RELOJ.t - CHATS.ult < 0.8) { espera(0.9).then(() => chatEv(tipo, extra, 1, cd)).catch(() => {}); return; }
  CHATS.cd[tipo] = CHATS.ult = RELOJ.t; CHATS.t = Math.max(CHATS.t, 3.5);
  chatDice(tipo, extra);
}
// varios comentarios seguidos (jefes, victorias…)
function chatRafaga(tipo, n, extra) {
  if (chatApagado()) return;
  CHATS.ult = RELOJ.t; CHATS.t = Math.max(CHATS.t, 4);
  chatDice(tipo, extra);
  for (let i = 1; i < n; i++) espera(0.45 + i * 0.55 + Math.random() * 0.3).then(() => chatDice(tipo, extra)).catch(() => {});
}
// Lola (moderadora) da el consejo la primera vez de cada cosa; no para el juego
function consejo(k) {
  const T = GUARDA.consejos;
  if (chatApagado() || !CONSEJOS[k] || T[k]) return;
  T[k] = 1; guarda();
  LOG.push({ txt: tr(CONSEJOS[k]), quien: CHAT_LOLA, t0: RELOJ.t });
  if (LOG.length > 30) LOG.shift();
  CHATS.t = Math.max(CHATS.t, 6);
}
// cada fotograma: la charla de fondo y los espectadores que se ven
function avanzaChat(dt) {
  if (VIAJE.modo !== 'juego') return;
  CHATS.t -= dt;
  if (CHATS.t <= 0) { chatDice('idle'); CHATS.t = 4 + Math.random() * 5; }
  VIAJE.espVista += (VIAJE.esp - VIAJE.espVista) * Math.min(1, dt * 2);
}
function nuevoDirecto() {
  Object.assign(CHATS, { t: 3, cd: {}, ult: -9, recientes: [], quien: null });
  VIAJE.esp = VIAJE.espVista = Math.round(60 + VIAJE.mundo * 140 + Math.random() * 40 + Math.min(200, GUARDA.partidas * 4));
}
const miles = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, IDIOMA_RL === 'es' ? '.' : ',');

// la etiqueta EN DIRECTO con los espectadores (arriba a la izquierda de la escena)
function pintaDirecto(ctx, x, y) {
  const t = tr('EN DIRECTO'), w = anchoTexto(t) + 12;
  ctx.fillStyle = OL; ctx.fillRect(x, y, w + 2, 11);
  ctx.fillStyle = '#e91e3c'; ctx.fillRect(x + 1, y + 1, w, 9);
  if (Math.sin(RELOJ.t * 4) > -0.3) { ctx.fillStyle = '#ffffff'; ctx.fillRect(x + 3, y + 4, 3, 3); }
  escribe(ctx, t, x + 9, y + 2, { c: '#ffffff', borde: null });
  // el muñequito y cuántos miran
  const px = x + w + 6;
  ctx.fillStyle = OL; ctx.fillRect(px - 1, y + 1, 5, 4); ctx.fillRect(px - 2, y + 5, 7, 5);
  ctx.fillStyle = '#ffb0b8'; ctx.fillRect(px, y + 2, 3, 2); ctx.fillRect(px - 1, y + 6, 5, 3);
  escribe(ctx, miles(VIAJE.espVista), px + 7, y + 2, { c: '#ffb0b8' });
}

// el chat: los mensajes, de abajo arriba, en el hueco [ya, yb]; mini: sin el efecto de máquina de escribir
const INSIGNIA = { mod: ['#2fb84a', '#d8ffd8'], vip: ['#e0308a', '#ffd0ec'], sub: ['#7a4ad6', '#ffe14d'] };
function pintaInsignia(ctx, tipo, x, y) {
  const [f, d] = INSIGNIA[tipo];
  ctx.fillStyle = OL; ctx.fillRect(x - 1, y - 1, 9, 9);
  ctx.fillStyle = f; ctx.fillRect(x, y, 7, 7);
  ctx.fillStyle = d;
  if (tipo === 'mod') { for (let i = 0; i < 4; i++) ctx.fillRect(x + 2 + i, y + 4 - i, 1, 1); ctx.fillRect(x + 1, y + 5, 2, 1); ctx.fillRect(x + 2, y + 4, 1, 2); }
  else if (tipo === 'vip') { ctx.fillRect(x + 3, y + 1, 1, 5); ctx.fillRect(x + 2, y + 2, 3, 3); ctx.fillRect(x + 1, y + 3, 5, 1); }
  else { ctx.fillRect(x + 3, y + 1, 1, 1); ctx.fillRect(x + 1, y + 3, 5, 1); ctx.fillRect(x + 2, y + 2, 3, 3); ctx.fillRect(x + 2, y + 5, 1, 1); ctx.fillRect(x + 4, y + 5, 1, 1); }
}
function lineasChat(e, ancho) {
  if (!e.quien) return envuelve(e.txt, ancho - 8).map((l, j) => ({ l, j, sis: true }));
  const [nombre, , ins] = e.quien, pre = (ins ? ' ' : '') + nombre + ':';
  return envuelve(pre + ' ' + e.txt, ancho).map((l, j) => ({ l, j }));
}
function pintaChat(ctx, W, ya, yb, mini) {
  const ancho = W - 14, filas = [], cabe = Math.floor((yb - ya) / LINEA);
  if (cabe < 1) return;
  for (let i = LOG.length - 1; i >= 0 && filas.length < cabe; i--) {
    const e = LOG[i], ls = lineasChat(e, ancho);
    for (let j = ls.length - 1; j >= 0 && filas.length < cabe; j--) filas.unshift({ ...ls[j], e, antes: ls.slice(0, j).reduce((s, x) => s + x.l.length + 1, 0) });
  }
  const ult = LOG[LOG.length - 1];
  let y = yb - filas.length * LINEA;
  for (const f of filas) {
    const e = f.e, nueva = e === ult && !mini, x = 7, sube = Math.max(0, Math.round((1 - Math.min(1, (RELOJ.t - e.t0) / 0.15)) * 4));
    if (f.sis) {
      const vis = nueva ? Math.floor((RELOJ.t - e.t0) * 70) - f.antes : undefined;
      if (f.j === 0) escribe(ctx, '>', x, y, { c: nueva ? COL.oro : '#6a4a9a' });
      if (vis === undefined || vis > 0) escribe(ctx, f.l, x + 8, y, { c: nueva ? COL.tinta : COL.tenue, hasta: vis });
    } else if (f.j === 0) {
      const [nombre, col, ins] = e.quien, k = f.l.indexOf(' '), nom = k < 0 ? f.l : f.l.slice(0, k), resto = k < 0 ? '' : f.l.slice(k + 1);
      let nx = x;
      if (ins) { pintaInsignia(ctx, ins, x, y + sube); nx += anchoTexto(' ') + 1; }
      escribe(ctx, nom.replace(' ', ''), nx, y + sube, { c: col });
      if (resto) escribe(ctx, resto, x + anchoTexto(nom + ' ') + 1, y + sube, { c: e.quien === CHAT_LOLA ? '#fff3c4' : COL.tinta });
    } else escribe(ctx, f.l, x, y + sube, { c: e.quien === CHAT_LOLA ? '#fff3c4' : COL.tinta });
    y += LINEA;
  }
}
