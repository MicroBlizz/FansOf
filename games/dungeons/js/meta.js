// Fans of Dungeons · Lo que rodea a las partidas (0.2.0): la Taquilla de RR. HH. (mejoras para siempre que se pagan con el
// Bonus que ganas al acabar cada partida), las escenas de Lola al llegar a cada zona, el mapa grande de la planta y el resumen
// de la partida al morir (despedidos, cosas rotas, el golpe más fuerte…). El reto del día no usa las mejoras: es igual para todos.
'use strict';

/* ---------- la Taquilla de RR. HH.: mejoras entre partidas ---------- */
const MEJORAS_META = [
  { id: 'vida', nombre: 'Seguro médico de empresa', desc: '+6 de Vida máxima al empezar.', precios: [3, 6, 10] },
  { id: 'ataque', nombre: 'Curso de formación', desc: '+1 de Ataque al empezar.', precios: [5, 10] },
  { id: 'cafe', nombre: 'Cafetera en tu planta', desc: 'Empiezas con un café solo más.', precios: [3, 7] },
  { id: 'monedas', nombre: 'Plus de productividad', desc: '+10 % de monedas al cogerlas.', precios: [4, 7, 11] },
  { id: 'mochila', nombre: 'Taquilla propia', desc: 'Empiezas con la mochila de 24 huecos.', precios: [8] },
  { id: 'plano', nombre: 'Plano de evacuación', desc: 'Al llegar a cada planta, ya sabes dónde está la escalera.', precios: [9] },
];
const meta = () => { if (!GUARDA.meta) GUARDA.meta = { bonus: 0, n: {} }; return GUARDA.meta; };
const nivelMeta = id => (J.diario ? 0 : meta().n[id] || 0);
const factorMonedas = () => 1 + 0.1 * nivelMeta('monedas');
// las mejoras compradas, al empezar una partida normal
function aplicaMeta(h) {
  if (J.diario) return;
  h.vidaBase += 6 * nivelMeta('vida'); h.atqBase += nivelMeta('ataque');
  for (let i = 0; i < nivelMeta('cafe'); i++) h.mochila.push({ id: 'cafe_solo', rar: 0 });
  if (nivelMeta('mochila')) h.mochilaMax = 24;
  recalcula(h); h.vida = h.vidaMax;
}
// el bonus que se gana al acabar (muriendo o ganando): un punto cada 100, más 2 por jefe
function ganaBonus(puntos, jefes) {
  const n = Math.floor(puntos / 100) + jefes * 2;
  meta().bonus += n; return n;
}
function compraMeta(id) {
  const M = MEJORAS_META.find(q => q.id === id), g = meta(), n = g.n[id] || 0;
  if (!M || n >= M.precios.length) return;
  if (g.bonus < M.precios[n]) { sonido('error'); return; }
  g.bonus -= M.precios[n]; g.n[id] = n + 1; guardaMeta(); sonido('nivel');
}
function pintaTaquilla(ctx) {
  fondoPantalla(ctx);
  const W = PAN.W, g = meta();
  escribe(ctx, tr('TAQUILLA DE RR. HH.'), W / 2, 8, { c: COL.oro, alin: 'centro' });
  let y = 24;
  for (const l of envuelve(tr('Cada partida te da Bonus de empresa. Gástalo en mejoras para siempre (no cuentan en el reto del día).'), W - 16)) { txt(ctx, l, 8, y, COL.apagado); y += LH; }
  y += 2; txt(ctx, fmt(tr('Tu Bonus: {n}'), { n: g.bonus }), 8, y, COL.oro); y += LH + 6;
  const fh = Math.min(48, Math.floor((PAN.H - y - 34) / MEJORAS_META.length) - 4);
  for (const M of MEJORAS_META) {
    const n = g.n[M.id] || 0, tope = n >= M.precios.length, precio = tope ? 0 : M.precios[n], puede = !tope && g.bonus >= precio;
    ctx.fillStyle = COL.panel; ctx.fillRect(6, y, W - 12, fh); ctx.fillStyle = COL.borde; ctx.fillRect(6, y + fh - 1, W - 12, 1);
    txt(ctx, corta(tr(M.nombre), W - 90), 10, y + 3, tope ? COL.oro : COL.texto);
    envuelve(tr(M.desc), W - 92).slice(0, Math.max(1, Math.floor((fh - 14) / 9))).forEach((l, i) => escribeMini(ctx, l, 10, y + 15 + i * 9, COL.apagado));
    for (let k = 0; k < M.precios.length; k++) { ctx.fillStyle = k < n ? COL.oro : '#3a3046'; ctx.fillRect(10 + k * 7, y + fh - 6, 5, 3); }
    boton(ctx, W - 76, y + Math.round((fh - 20) / 2), 68, 20, { txt: tope ? tr('Al máximo') : fmt(tr('{n} Bonus'), { n: precio }), apagado: !puede }, () => compraMeta(M.id));
    y += fh + 4;
  }
  boton(ctx, W / 2 - 40, PAN.H - 26, 80, 22, { txt: tr('Volver') }, () => { J.modo = 'titulo'; });
}

/* ---------- las escenas de Lola al llegar a cada zona ---------- */
const ESCENAS = {
  oficinas: ['Bienvenido a la Torre de Microblizz. Arriba del todo está el CEO, el que cerró nuestros juegos.', 'Sube planta a planta… y esta vez despídelo tú a él. Yo te espero con café.'],
  cementerio: ['El Cementerio de juegos. Aquí acaban los juegos que Microblizz cierra.', 'Los no-muertos no son malos: solo están cansados de esperar un parche. Aun así, muerden.'],
  foro: ['El Foro Infinito: miles de hilos sin respuesta, trolls y abogados.', 'Si alguien te escribe en mayúsculas, no le contestes. Pégale.'],
  azotea: ['El despacho del CEO. Huele a colonia cara y a despidos.', 'Es aquí. Por todos los juegos cerrados. Y por mi puesto de café.'],
};
function abreEscena(zona) {
  if (!ESCENAS[zona]) return;
  J.panel = { tipo: 'escena', zona, t: 0 }; J.modo = 'panel';
}
function pintaEscena(ctx, p) {
  p.t = (p.t || 0) + 1 / 60;
  const W = PAN.W, c = { x: 8, y: VISTA.y + Math.round(VISTA.h * 0.28), w: W - 16, h: Math.round(VISTA.h * 0.5) };
  ctx.fillStyle = 'rgba(4,2,8,0.72)'; ctx.fillRect(0, VISTA.y, W, VISTA.h);
  ctx.fillStyle = COL.panel; ctx.fillRect(c.x, c.y, c.w, c.h); ctx.fillStyle = COL.borde; ctx.fillRect(c.x, c.y, c.w, 1); ctx.fillRect(c.x, c.y + c.h - 1, c.w, 1);
  escribe(ctx, tr(ZONAS[p.zona].nombre).toUpperCase(), W / 2, c.y + 8, { c: COL.oro, alin: 'centro' });
  pintaFigura(ctx, 'lola', c.x + 26, c.y + c.h - 30, { anim: 'quieto', f: Math.floor(J.tiempo * 4) % 4 });
  let y = c.y + 26;
  const letras = Math.floor(p.t * 45);   // el texto sale letra a letra
  let resto = letras;
  for (const frase of ESCENAS[p.zona]) {
    for (const l of envuelve(tr(frase), c.w - 60)) { if (resto <= 0) break; txt(ctx, l.slice(0, resto), c.x + 52, y, COL.texto); resto -= l.length; y += LH; }
    y += 4;
  }
  escribeMini(ctx, tr('Lola'), c.x + 18, c.y + c.h - 24, '#ff8ad0');
  boton(ctx, c.x + c.w - 84, c.y + c.h - 26, 78, 20, { txt: tr('¡Vamos!') }, cierraPanel);
  BOTONES.unshift({ x: 0, y: VISTA.y, w: W, h: VISTA.h, f: () => { if (p.t < 2) p.t = 99; else cierraPanel(); } });   // un toque: todo el texto; otro: cerrar
}

/* ---------- el mapa grande de la planta ---------- */
function pintaMapaGrande(ctx) {
  const c = cuadroPanel(ctx, tr('PLANO DE LA PLANTA')), m = J.mapa, h = J.heroe;
  const esc = Math.max(1, Math.floor(Math.min((c.w - 10) / m.w, (c.h - 70) / m.h)));
  const x0 = c.x + Math.round((c.w - m.w * esc) / 2), y0 = c.y + 22;
  ctx.fillStyle = '#060408'; ctx.fillRect(x0 - 1, y0 - 1, m.w * esc + 2, m.h * esc + 2);
  const COLC = { [T.SUBIDA]: '#ffd040', [T.LLEGADA]: '#8c879a', [T.PUESTO]: '#ff8ad0', [T.MAQUINA]: '#4aa3ff', [T.CAFETERA]: '#5fd36a', [T.ALTAR]: '#c8a040', [T.ATRIL]: '#c8a040', [T.JAULA]: '#e0804a', [T.REJA]: '#a8323a', [T.ROMPIBLE]: '#7a5a34', [T.PUERTA_CERRADA]: '#ffd040' };
  for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
    const k = y * m.w + x, v = m.vis[k]; if (!v) continue;
    const t = m.t[k];
    ctx.fillStyle = COLC[t] || (t === T.MURO ? (v === 2 ? '#5a4c46' : '#3a3234') : t === T.PUERTA || t === T.PUERTA_ABIERTA ? '#b07040' : t === T.MUEBLE ? '#2a2026' : (v === 2 ? '#2a2228' : '#1a1418'));
    ctx.fillRect(x0 + x * esc, y0 + y * esc, esc, esc);
  }
  for (const o of J.objetos) if (m.vis[o.y * m.w + o.x]) { ctx.fillStyle = o.obj.id === 'monedas' ? '#ffd040' : o.obj.id === 'cofre' ? '#ffb02e' : '#d9d2e0'; ctx.fillRect(x0 + o.x * esc + (esc > 2 ? 1 : 0), y0 + o.y * esc + (esc > 2 ? 1 : 0), Math.max(1, esc - (esc > 2 ? 2 : 0)), Math.max(1, esc - (esc > 2 ? 2 : 0))); }
  for (const e of J.enemigos) if (m.vis[e.y * m.w + e.x] === 2) { ctx.fillStyle = e.jefe || e.mini ? '#ff8a2a' : '#e43f4a'; ctx.fillRect(x0 + e.x * esc, y0 + e.y * esc, esc, esc); }
  for (const a of J.aliados) { ctx.fillStyle = '#6aa878'; ctx.fillRect(x0 + a.x * esc, y0 + a.y * esc, esc, esc); }
  const p = Math.floor(J.tiempo * 4) % 2; ctx.fillStyle = p ? '#ffffff' : '#5ef2ff'; ctx.fillRect(x0 + h.x * esc - 1, y0 + h.y * esc - 1, esc + 2, esc + 2);
  // la leyenda
  let ly = y0 + m.h * esc + 8, lx = c.x + 8;
  for (const [col, t] of [['#5ef2ff', 'Tú'], ['#e43f4a', 'Enemigos'], ['#ffd040', 'Escalera'], ['#ff8ad0', 'Tienda'], ['#c8a040', 'Altar o atril'], ['#ffb02e', 'Cofre']]) {
    const w = 8 + anchoMini(tr(t)) + 8;
    if (lx + w > c.x + c.w - 4) { lx = c.x + 8; ly += 10; }
    ctx.fillStyle = col; ctx.fillRect(lx, ly + 1, 4, 4); escribeMini(ctx, tr(t), lx + 7, ly, COL.apagado); lx += w;
  }
  boton(ctx, c.x + c.w - 74, c.y + c.h - 26, 70, 22, { txt: tr('Cerrar') }, cierraPanel);
}

/* ---------- el resumen de la partida ---------- */
const nuevasCuentas = () => ({ despedidos: 0, rotos: 0, objetos: 0, golpe: 0, cafes: 0, pasos: 0 });
const cuenta = (k, n = 1) => { if (!J.stats) J.stats = nuevasCuentas(); J.stats[k] += n; };
function apuntaGolpe(n) { if (!J.stats) J.stats = nuevasCuentas(); J.stats.golpe = Math.max(J.stats.golpe, n); }
function lineasResumen() {
  const s = J.stats || nuevasCuentas();
  return [
    fmt(tr('Enemigos despedidos: {n}'), { n: s.despedidos }),
    fmt(tr('Cosas rotas: {n} · objetos cogidos: {o}'), { n: s.rotos, o: s.objetos }),
    fmt(tr('Golpe más fuerte: {n} · cafés y pergaminos: {c}'), { n: s.golpe, c: s.cafes }),
  ];
}
