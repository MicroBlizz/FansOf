// Fans of Roguelite · El directo: el juego se ve como un directo de Twitch. En la barra de arriba, la etiqueta EN DIRECTO
// con los espectadores y el chat (las últimas frases, con letra pequeña, enteras): los espectadores comentan lo que pasa y dan
// consejos, buenos y malos. Abajo, lo que va pasando, con los consejos de Lola en dorado. El chat se apaga en Opciones.
'use strict';

const CHATS = { t: 5, cd: {}, ult: -9, recientes: [], quien: null, cola: [], paso: 0 };
// cada cuánto sale una frase nueva (con 1 línea, cada frase se queda sola en pantalla: necesita más)
const pasoChat = () => BARRA.lineas > 1 ? 2.6 : 3.4;
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
  CHATS.cola.push({ txt: tr(txt).replace(/\{X\}/g, extra || ''), quien: u });
  if (CHATS.cola.length > 4) CHATS.cola.shift();   // si se amontonan, lo más viejo ya no viene a cuento
  if (ESPECTA[tipo]) VIAJE.esp += Math.round(ESPECTA[tipo] * (0.6 + Math.random()) * (1 + VIAJE.mundo * 0.5));
}
// un comentario por algo que pasa: con su probabilidad y su pausa (y nunca dos casi a la vez)
function chatEv(tipo, extra, prob = 1, cd = 5) {
  if (chatApagado() || VIAJE.modo !== 'juego' || Math.random() > prob) return;
  if (CHATS.cd[tipo] != null && RELOJ.t - CHATS.cd[tipo] < cd) return;
  CHATS.cd[tipo] = CHATS.ult = RELOJ.t; CHATS.t = Math.max(CHATS.t, 3.5);
  chatDice(tipo, extra);
}
// varios comentarios seguidos (jefes, victorias…)
function chatRafaga(tipo, n, extra) {
  if (chatApagado()) return;
  CHATS.ult = RELOJ.t; CHATS.t = Math.max(CHATS.t, 4);
  for (let i = 0; i < n; i++) chatDice(tipo, extra);
}
// Lola da el consejo la primera vez de cada cosa: una línea dorada en lo que va pasando (no para el juego)
function consejo(k) {
  const T = GUARDA.consejos;
  if (!CONSEJOS[k] || T[k]) return;
  T[k] = 1; guarda();
  LOG.push({ txt: 'Lola: ' + tr(CONSEJOS[k]), t0: RELOJ.t, lola: true });
  if (LOG.length > 60) LOG.shift();
}
// cada fotograma: la charla de fondo y los espectadores que se ven
function avanzaChat(dt) {
  if (VIAJE.modo === 'menu') return;
  CHATS.t -= dt; CHATS.paso -= dt;
  if (CHATS.t <= 0 && VIAJE.modo === 'juego') { if (!CHATS.cola.length) chatDice('idle'); CHATS.t = 4 + Math.random() * 5; }
  if (CHATS.paso <= 0 && CHATS.cola.length) {   // sale la siguiente frase de la cola
    const e = CHATS.cola.shift();
    LOG.push(Object.assign(e, { t0: RELOJ.t, fin: RELOJ.t + 11 }));
    if (LOG.length > 60) LOG.shift();
    const n = filasChat(e).length;   // una frase larga se queda más rato
    CHATS.paso = Math.max(pasoChat(), n > BARRA.lineas ? Math.ceil(n / BARRA.lineas) * PAGINA_CHAT + 0.8 : n > 1 ? 3.4 : 0);
  }
  VIAJE.espVista += (VIAJE.esp - VIAJE.espVista) * Math.min(1, dt * 2);
}
function nuevoDirecto() {
  Object.assign(CHATS, { t: 3, cd: {}, ult: -9, recientes: [], quien: null, cola: [], paso: 0 });
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

// lo que va pasando (panel de abajo), de abajo arriba en el hueco [ya, yb]; la línea más nueva se escribe letra a letra
function pintaChat(ctx, W, ya, yb) {
  const lista = LOG.filter(e => !e.quien), ancho = W - 22, filas = [], cabe = Math.floor((yb - ya) / LINEA);
  if (cabe < 1) return;
  for (let i = lista.length - 1; i >= 0 && filas.length < cabe; i--) {
    const e = lista[i], ls = envuelve(e.txt, ancho);
    for (let j = ls.length - 1; j >= 0 && filas.length < cabe; j--) filas.unshift({ l: ls[j], j, e, antes: ls.slice(0, j).reduce((s, q) => s + q.length + 1, 0) });
  }
  const ult = lista[lista.length - 1];
  let y = yb - filas.length * LINEA;
  for (const f of filas) {
    const e = f.e, nueva = e === ult, vis = nueva ? Math.floor((RELOJ.t - e.t0) * 70) - f.antes : undefined;
    if (f.j === 0) escribe(ctx, '>', 7, y, { c: nueva || e.lola ? COL.oro : '#6a4a9a' });
    if (vis === undefined || vis > 0) escribe(ctx, f.l, 15, y, { c: e.lola ? '#ffe08a' : nueva ? COL.tinta : COL.tenue, hasta: vis });
    y += LINEA;
  }
}
// el chat del directo, en su franja de la barra de arriba, con la letra pequeña: las últimas frases (2 filas, o 1 en
// pantallas bajas). Nada se corta: una frase larga ocupa dos filas y, si solo hay una, se lee en dos partes seguidas
const INS_MINI = { mod: '#2fb84a', vip: '#e0308a', sub: '#7a4ad6' };
const ANCHO_CHAT = () => PAN.W - 12;
function filasChat(e) {
  if (!e.filas) {
    const [nombre, , ins] = e.quien, pre = (ins ? 5 : 0) + anchoMini(nombre + ':') + 3;
    e.filas = envuelveMini(e.txt, ANCHO_CHAT() - 4, ANCHO_CHAT() - pre);
  }
  return e.filas;
}
function filaMini(ctx, e, j, x, y) {
  const [nombre, col, ins] = e.quien, txt = filasChat(e)[j];
  if (j > 0) return escribeMini(ctx, txt, x + 4, y, '#fff6ea');
  if (ins) { ctx.fillStyle = OL; ctx.fillRect(x - 1, y, 5, 5); ctx.fillStyle = INS_MINI[ins]; ctx.fillRect(x, y + 1, 3, 3); x += 5; }
  x += escribeMini(ctx, nombre + ':', x, y, col) + 3;
  escribeMini(ctx, txt, x, y, '#fff6ea');
}
const PAGINA_CHAT = 1.8;   // lo que se ve cada parte de una frase que no cabe entera
function pintaChatEscena(ctx, y, lineas = 2) {
  const vivos = LOG.filter(e => e.quien && e.fin > RELOJ.t), filas = [];
  for (let i = vivos.length - 1; i >= 0; i--) {
    const e = vivos[i], n = filasChat(e).length;
    if (filas.length + n <= lineas) { for (let j = n - 1; j >= 0; j--) filas.unshift([e, j]); continue; }
    if (!filas.length) {   // la más nueva no cabe entera: se enseña por partes
      const partes = Math.ceil(n / lineas), p = Math.min(partes - 1, Math.floor((RELOJ.t - e.t0) / PAGINA_CHAT));
      for (let j = Math.min(n, (p + 1) * lineas) - 1; j >= p * lineas; j--) filas.unshift([e, j]);
    }
    break;
  }
  filas.forEach(([e, j], k) => filaMini(ctx, e, j, 6, y + (lineas - filas.length + k) * 9));
}
