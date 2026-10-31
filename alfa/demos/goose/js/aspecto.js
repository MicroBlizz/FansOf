// Fans of Goose · EL ASPECTO: capas y farolillos de colores que se compran en la tienda (pestaña ASPECTO) y solo cambian cómo se ve el
// héroe en la partida. No hay dibujos nuevos: se repinta el pixel art de Yoshi cambiando el tono de sus píxeles (la capa roja o la
// llama amarilla del farol) y se guarda hecho, así sigue siendo pixel art del mismo tamaño. Las cifras están en CFG.aspecto.
'use strict';

CFG.aspecto = {
  capas: [
    { id: 'fuego',   nombre: 'Capa de brasas',    tono: 18,  sat: 1.2, luz: 1.35, coste: 150 },
    { id: 'rosa',    nombre: 'Capa de feria',     tono: 330, sat: 0.9, luz: 1.25, coste: 150 },
    { id: 'morada',  nombre: 'Capa de la Parca',  tono: 275, sat: 0.8, luz: 1.0,  coste: 200 },
    { id: 'noche',   nombre: 'Capa de medianoche', tono: 225, sat: 0.7, luz: 0.7, coste: 200 },
    { id: 'dorada',  nombre: 'Capa dorada',       tono: 44,  sat: 1.3, luz: 1.75, coste: 400 },
    { id: 'camino',  nombre: 'Capa del Camino',   tono: 160, sat: 1.1, luz: 1.2,  pase: true },   // solo del Pase (js/pase.js)
    { id: 'real',    nombre: 'Capa real',         tono: 52,  sat: 1.5, luz: 1.4,  pack: true },   // solo del Pack de bienvenida (js/monetiza.js)
  ],
  luces: [
    { id: 'azul',    nombre: 'Llama fría',      tono: 195, coste: 120 },
    { id: 'verde',   nombre: 'Fuego fatuo',     tono: 120, coste: 120 },
    { id: 'rosa',    nombre: 'Llama de feria',  tono: 320, coste: 120 },
    { id: 'morada',  nombre: 'Llama de difunto', tono: 270, coste: 180 },
    { id: 'camino',  nombre: 'Llama del Camino', tono: 160, pase: true },
    { id: 'sol',     nombre: 'Llama de sol',     tono: 48,  huevos: 150 },   // se paga con huevos de oro
  ],
};
// lo comprado y lo puesto: SAVE.aspecto = { capas: { fuego: 1 }, luces: {}, capa: 'fuego', luz: '' }
const aspecto = () => { if (!SAVE.aspecto) SAVE.aspecto = { capas: {}, luces: {}, capa: '', luz: '' }; return SAVE.aspecto; };
const capaDe = id => CFG.aspecto.capas.find(c => c.id === id);
const luzDe = id => CFG.aspecto.luces.find(c => c.id === id);

// --- repintar un sprite cambiando el tono de unos píxeles (se hace una vez por sprite y color) ---
const REPINTADOS = new WeakMap();   // lienzo de origen -> Map(clave -> lienzo repintado); al cambiar el tamaño de pantalla se rehace solo
function rgbAHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2; let h = 0, s = 0;
  if (mx !== mn) { const d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; }
  return [h, s, l];
}
function hslARgb(h, s, l) {
  const f = n => { const k = (n + h / 30) % 12, a = s * Math.min(l, 1 - l); return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)))); };
  return [f(0), f(8), f(4)];
}
// toca: (h, s, l) -> ¿es de la parte a repintar?  pon: (h, s, l) -> [h, s, l] nuevo
function repinta(origen, clave, toca, pon) {
  let M = REPINTADOS.get(origen); if (!M) { M = new Map(); REPINTADOS.set(origen, M); }
  let c = M.get(clave); if (c) return c;
  c = lienzo(origen.width, origen.height); const x = c.getContext('2d', { willReadFrequently: true });
  x.drawImage(origen, 0, 0);
  const d = x.getImageData(0, 0, c.width, c.height), p = d.data;
  for (let i = 0; i < p.length; i += 4) {
    if (p[i + 3] < 8) continue;
    const [h, s, l] = rgbAHsl(p[i], p[i + 1], p[i + 2]);
    if (!toca(h, s, l)) continue;
    const [h2, s2, l2] = pon(h, s, l), [r, g, b] = hslARgb(h2, Math.max(0, Math.min(1, s2)), Math.max(0, Math.min(1, l2)));
    p[i] = r; p[i + 1] = g; p[i + 2] = b;
  }
  x.putImageData(d, 0, 0); M.set(clave, c); return c;
}
// la capa roja del héroe: tonos rojos y saturados (la piel, más anaranjada y clara, no se toca)
const esCapaRoja = (h, s, l) => (h < 12 || h > 335) && s > 0.28 && l < 0.62;
function lienzoCapa(origen, C) { return repinta(origen, 'capa-' + C.id, esCapaRoja, (h, s, l) => [C.tono, s * C.sat, l * C.luz]); }
// la llama y el brillo del farol: amarillos y naranjas claros
const esLlama = (h, s, l) => h >= 28 && h <= 68 && s > 0.45 && l > 0.42;
function lienzoLuz(origen, L) { return repinta(origen, 'luz-' + L.id, esLlama, (h, s, l) => [L.tono, s, l]); }

// el cuerpo con la capa comprada (si la hay): se parte del dibujo de la capa roja
function cuerpoConAspecto(pose, lado, body, blanco) {
  const C = capaDe(aspecto().capa), base = SPR[pose + lado] || SPR[pose];
  if (!C || !base || blanco) return blanco ? body.b : body.n;
  return lienzoCapa(base.n, C);
}
function farolConAspecto(f, blanco) {
  const L = luzDe(aspecto().luz);
  if (!L || blanco) return blanco ? f.b : f.n;
  return lienzoLuz(f.n, L);
}
// el brillo del farol, del color de su llama
function pintaLuzFarol(x, y, esc) {
  const S = SPR.luz, L = luzDe(aspecto().luz); if (!S) return;
  if (!L) { pinta('luz', x, y, false, false, esc); return; }
  const w = S.w * esc, h = S.h * esc; G.drawImage(lienzoLuz(S.n, L), x - w / 2, y - h / 2, w, h);
}

// --- la pestaña ASPECTO de la tienda: capas o farolillos, de 2 en 2, con el héroe de muestra ---
let ASPECTO_SEC = 'capas';
function pintaHeroeMuestra(x, y, capa, luz, esc) {
  const A = aspecto(), c0 = A.capa, l0 = A.luz; A.capa = capa; A.luz = luz;
  if (capasListas()) { pintaLuzFarol(x + 6 * esc, y + 4 * esc, 0.35 * esc); pintaHeroeCapas(x, y, 'c-cuerpo', 1, '', esc, 1, false, Math.sin(performance.now() / 500) * 0.08, true); }
  A.capa = c0; A.luz = l0;
}
function pintaAspecto() {
  const W = PAN.W, A = aspecto(), capas = ASPECTO_SEC === 'capas';
  const sec = (x, id, txt) => boton(x, 86, (W - 22) / 2, 18, txt, ASPECTO_SEC === id ? '#3f9a3a' : '#5a3418', () => { SONIDO.boton(); ASPECTO_SEC = id; }, 7);
  sec(8, 'capas', tr('CAPAS')); sec(14 + (W - 22) / 2, 'luces', tr('FAROLILLOS'));
  const lista = [{ id: '', nombre: capas ? 'Capa de tu personaje' : 'Llama de siempre', coste: 0 }, ...(capas ? CFG.aspecto.capas : CFG.aspecto.luces)];
  const tuyos = capas ? A.capas : A.luces, puesto = capas ? A.capa : A.luz;
  const cw = (W - 22) / 2, ch = 56;
  lista.forEach((o, i) => {
    const x = 8 + (i % 2) * (cw + 6), y = 110 + Math.floor(i / 2) * (ch + 5), mio = !o.id || tuyos[o.id], esta = (puesto || '') === o.id;
    caja(x, y, cw, ch, 7, '#2a1610', esta ? '#ffd34d' : '#6e4426', 1.4);
    pintaHeroeMuestra(x + 16, y + 27, capas ? o.id : A.capa, capas ? A.luz : o.id, 0.95);
    parrafo(tr(o.nombre), x + 30, y + 9, cw - 34, 7, '#fff4dc');
    const bx = x + 30, bw = cw - 34, by = y + ch - 20;
    if (esta) texto2(tr('PUESTA'), bx + bw / 2, by + 8, 8, '#ffd34d');
    else if (mio) boton(bx, by, bw, 16, tr('PONER'), '#2f74c0', () => { SONIDO.elige(false); if (capas) A.capa = o.id; else A.luz = o.id; guarda(); }, 7);
    else if (o.pase) texto2(tr('EN EL PASE'), bx + bw / 2, by + 8, 6.5, '#ffd34d');
    else if (o.pack) texto2(tr('EN EL TESORO'), bx + bw / 2, by + 8, 6.5, '#ffd34d');
    else if (o.huevos) { boton(bx, by, bw, 16, '', huevos() >= o.huevos ? '#d99a1a' : '#7a3a22', () => compraAspecto(capas, o), 7); pintaHuevos(bx + bw / 2, by + 8, o.huevos, 7, 'center'); }   // con huevos de oro (js/monetiza.js)
    else boton(bx, by, bw, 16, String(o.coste), SAVE.monedas >= o.coste ? '#3f9a3a' : '#7a3a22', () => compraAspecto(capas, o), 7);
  });
}
function compraAspecto(capas, o) {
  const A = aspecto();
  if (o.pase || o.pack) return;
  if (o.huevos) { if (!gastaHuevos(o.huevos)) return; }
  else if (SAVE.monedas < o.coste) { toast(tr('Te faltan monedas: juega otra partida')); SONIDO.dadoMalo(); return; }
  else SAVE.monedas -= o.coste;
  (capas ? A.capas : A.luces)[o.id] = 1; if (capas) A.capa = o.id; else A.luz = o.id;
  guarda(); SONIDO.elige(false); destella('#ffd34d', 0.25);
}
