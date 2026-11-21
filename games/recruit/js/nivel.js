// Fans of Recruit · LA MISIÓN 1, «La Gran Compra»: la planta de las Oficinas de Microblizz. Aquí está el plano (ventanas,
// pilares y paredes, de izquierda a derecha), los muebles del fondo, y el guion: dónde espera cada becario, cada fan
// prisionero, cada caja, la MechaVaca, las zonas de combate (la pantalla se para hasta que no queda nadie) y el jefe.
'use strict';

const TROZO = 256;        // el escenario se pinta en trozos de este ancho
const MARGEN = 16;        // cada trozo se pinta un poco más ancho y se recorta: lo que cruza de un trozo a otro no deja raya
const AIRE = '#36465a';   // hacia este color se apagan los muebles del fondo (el aire de la oficina)
const NIVEL = { largo: 0, tramos: [], muebles: [], trozos: [], lejos: null };

// el plano: ['ventana', ancho, { persiana, rota, agujero }] · ['pilar', qué lleva] · ['pared', ancho, qué lleva]
const PLANO = [
  ['pared', 124, 1], ['pilar', 'extintor'], ['ventana', 84, { persiana: 0.34 }], ['pilar'], ['pared', 124, 0], ['pilar', 'camara'],
  ['ventana', 122, { persiana: 0.12, rota: true, agujero: [0.74, 0.62] }], ['pilar'], ['ventana', 104, { persiana: 0.6 }], ['pilar', 'extintor'], ['pared', 124, 2], ['pilar'],
  ['ventana', 122, { persiana: 0.2 }], ['pilar', 'camara'], ['ventana', 84, { persiana: 0.5, rota: true }], ['pilar'], ['pared', 124, 0], ['pilar', 'extintor'],
  ['ventana', 104, { persiana: 0.1 }], ['pilar'], ['pared', 124, 1], ['pilar', 'camara'], ['ventana', 122, { persiana: 0.4 }], ['pilar'],
  ['ventana', 122, { persiana: 0.16, rota: true, agujero: [0.3, 0.6] }], ['pilar', 'extintor'], ['pared', 124, 2], ['pilar'], ['ventana', 104, { persiana: 0.25 }], ['pilar', 'camara'],
  ['pared', 124, 0], ['pilar'], ['ventana', 122, { persiana: 0.3 }], ['pilar', 'extintor'], ['ventana', 84, { persiana: 0.15, rota: true }], ['pilar'],
  ['ascensor', 150], ['pilar'], ['ventana', 122, { persiana: 0.45 }], ['pilar'],
];
/* el guion de la misión, por orden. Cada cosa aparece cuando la pantalla llega a su x.
   zona = dónde se para la pantalla; olas = oleadas: [tipo, lado (1 = por la derecha, -1 = por la izquierda), espera en pasos] */
const GUION = [
  { x: 170, t: 'caja', da: 'monedas' },
  { x: 262, t: 'becario', modo: 'cafe' }, { x: 318, t: 'becario', modo: 'cafe', cobarde: true },
  { x: 392, t: 'fan', da: 'arma' },
  { zona: 430, olas: [[['becario', 1, 0], ['becario', 1, 50]], [['becario', 1, 0], ['becario', -1, 30], ['dron', 1, 70]]] },
  { x: 880, t: 'caja', da: 'cafe' }, { x: 936, t: 'becario', modo: 'cafe' }, { x: 990, t: 'dron' }, { x: 1066, t: 'becario', modo: 'cafe', cobarde: true },
  { x: 1120, t: 'fan', da: 'bombas' },
  { x: 1200, t: 'mecha' },
  { zona: 1130, olas: [[['becario', 1, 0], ['becario', 1, 40], ['dron', 1, 20]], [['becario', -1, 0], ['becario', 1, 20], ['becario', 1, 60], ['dron', 1, 30], ['dron', -1, 90]], [['becario', 1, 0], ['becario', 1, 30], ['becario', 1, 60], ['dron', 1, 45]]] },
  { x: 1690, t: 'caja', da: 'bombas' }, { x: 1736, t: 'becario', modo: 'cafe' }, { x: 1790, t: 'becario', modo: 'cafe' },
  { x: 1850, t: 'fan', da: 'arma' }, { x: 1910, t: 'dron' }, { x: 1966, t: 'dron' },
  { zona: 1995, olas: [[['dron', 1, 0], ['dron', -1, 40], ['becario', 1, 20]], [['becario', -1, 0], ['becario', -1, 50], ['becario', 1, 20], ['becario', 1, 70]]] },
  { x: 2452, t: 'fan', da: 'bombas' }, { x: 2500, t: 'caja', da: 'cafe' },
  { jefe: true },
];

// coloca el plano (cada tramo con su x) y decide los muebles del fondo de cada tramo
function creaNivel() {
  let x = 0;
  NIVEL.tramos = []; NIVEL.muebles = [];
  PLANO.forEach(([t, a, b], k) => {
    if (t === 'pilar') { NIVEL.tramos.push({ t, x, que: a }); x += 20; return; }
    if (t === 'ventana') { NIVEL.tramos.push(Object.assign({ t, x: x + 4, w: a }, b)); amuebla(k, x, a + 8, 'ventana'); x += a + 8; return; }
    if (t === 'ascensor') { NIVEL.tramos.push({ t: 'pared', x, w: a, que: 9 }, { t: 'ascensor', x: x + 47 }); NIVEL.ascensor = x + 75; x += a; return; }
    NIVEL.tramos.push({ t, x, w: a, que: b }); amuebla(k, x, a, 'pared'); x += a;
  });
  NIVEL.largo = x;
}
// los muebles de un tramo: cada uno es una función que lo pinta con su x
function amuebla(k, x, w, tipo) {
  const M = NIVEL.muebles, y = 168, az = hash(k * 13 + 5), pon = (dx, rx, fn) => M.push({ x: x + dx, rx, fn });
  if (tipo === 'ventana') {
    if (az < 0.3) { pon(12, 11, (p, u) => archivador(p, u, y - 2, hash(k) < 0.5)); pon(46, 26, (p, u) => mampara(p, u - 24, y - 1, 48, 36, k)); if (w > 100) pon(w - 16, 6, (p, u) => papelera(p, u, y)); }
    else if (az < 0.62) { pon(w / 2, 34, (p, u) => { const m = mesaOficina(p, u - 32, y, 64); monton(p, u - 12, m.y, 3 + (k % 3)); tazaMesa(p, u, m.y); monitorCrt(p, u + 16, m.y, ['grafica', 'azul', 'cancelado', 'roto'][k % 4]); }); pon(w / 2 - 44, 9, (p, u) => sillaOficina(p, u, y + 2)); }
    else if (az < 0.85) { pon(26, 22, (p, u) => fotocopiadora(p, u, y - 1)); pon(w - 30, 26, (p, u) => cajasCosas(p, u, y)); }
    else { pon(w / 2 - 20, 8, (p, u) => plantaFicus(p, u, y - 1, k, 30)); pon(w / 2 + 24, 26, (p, u) => mampara(p, u - 22, y - 1, 44, 34, k + 3)); }
  } else {
    if (az < 0.4) { pon(14, 9, (p, u) => enfriador(p, u, y - 2)); pon(36, 8, (p, u) => plantaFicus(p, u, y - 1, k + 2, 32)); pon(w - 30, 11, (p, u) => archivador(p, u, y - 2, false)); }
    else if (az < 0.75) { pon(w / 2, 54, (p, u) => vallaObra(p, u, y + 3)); }
    else { pon(w / 2, 34, (p, u) => { const m = mesaOficina(p, u - 30, y, 60); teclado(p, u - 12, m.y); flexo(p, u + 14, m.y); monitorCrt(p, u - 12, m.y, 'azul'); }); pon(w - 14, 8, (p, u) => plantaFicus(p, u, y - 1, k + 7, 28)); }
  }
}
// pinta el trozo k del escenario: pared, suelo, sombras y muebles
function pintaTrozo(k) {
  const X0 = k * TROZO - MARGEN, A = TROZO + MARGEN * 2, c = pintaOficina(A, NIVEL.tramos, X0), g = c.getContext('2d'), cerca = NIVEL.muebles.filter(m => m.x > X0 - 80 && m.x < X0 + A + 80);
  if (cerca.length) {
    const p = new Pincel(A, 190, 0, 0);
    for (const m of cerca) { sombraSuelo(g, m.x - X0 + 3, 169, m.rx, 3); m.fn(p, m.x - X0); }
    g.drawImage(apagaSpr(p.lienzo(), AIRE, 0.3).c, 0, 0);
  }
  // cosas por el suelo (siempre en el mismo sitio): folios y, de vez en cuando, el cartel de suelo mojado
  for (let x = Math.floor((X0 - 20) / 90) * 90; x < X0 + A + 20; x += 90) {
    const a = hash(x * 3 + 1);
    if (a < 0.72) pintaSpr(g, SPR.folioSuelo, x - X0 + Math.round(a * 70), 198 + Math.round(hash(x + 2) * 32));
    if (x % 810 === 540) { sombraSuelo(g, x - X0 + 2, 205, 8, 2); pintaSpr(g, SPR.mojado, x - X0, 204); }
  }
  const r = lienzoNuevo(TROZO, OFI.ALTO);
  r.getContext('2d').drawImage(c, -MARGEN, 0);
  NIVEL.trozos[k] = r;
}
