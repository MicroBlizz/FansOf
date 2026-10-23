// Fans of Snakes · Tienda: pieles para la serpiente, solo de adorno (no dan ventaja, ni en el ranking ni en el VS), que se compran
// con las monedas de la Demolición, las fases y las misiones. Todavía no se vende nada con dinero real: los packs de monedas y el
// pase de temporada irán aquí cuando estén Google Play Billing y el sí de Arkioner.
// colorPiel(i, n, t, cabeza) da el color del segmento i de n; la usa js/tablero.js (fuera del Frenesí, que va en arcoíris).
'use strict';

const PIELES = [
  { id: 'clasica', nombre: 'CLÁSICA', precio: 0, color: (i, n, t, cab) => cab ? '#9cff6b' : `hsl(140 70% ${28 + (1 - i / n * 0.35) * 22}%)` },
  { id: 'neon', nombre: 'NEÓN', precio: 150, color: (i, n, t, cab) => cab ? '#ffffff' : i % 2 ? '#00e5ff' : '#ff4fd8' },
  { id: 'lava', nombre: 'LAVA', precio: 300, color: (i, n, t, cab) => cab ? '#ffd54a' : `hsl(${10 + Math.sin(t * 6 + i) * 14} 95% ${45 + Math.sin(t * 9 + i * 1.7) * 8}%)` },
  { id: 'tigre', nombre: 'TIGRE', precio: 400, color: (i, n, t, cab) => cab ? '#ffb74d' : i % 3 === 0 ? '#1a120a' : '#ff9800' },
  { id: 'nokia', nombre: '3310', precio: 500, color: (i, n, t, cab) => cab ? '#c5d4a8' : '#8a9a72' },
  { id: 'oro', nombre: 'ORO', precio: 800, color: (i, n, t, cab) => cab ? '#fff6c8' : `hsl(45 95% ${50 + Math.sin(t * 5 - i * 0.6) * 12}%)` },
  { id: 'fantasma', nombre: 'FANTASMA', precio: 1000, color: (i, n, t, cab) => cab ? '#ffffff' : `rgba(207,232,255,${0.85 - i / n * 0.6})` },
  { id: 'arcoiris', nombre: 'ARCOÍRIS', precio: 1500, color: (i, n, t, cab) => cab ? '#ffffff' : arcoiris(i, t * 0.4, 58) },
];
const pielPuesta = () => PIELES.find(p => p.id === SAVE.piel) || PIELES[0];
const colorPiel = (i, n, t, cab) => pielPuesta().color(i, n, t, cab);

function compraPiel(p) {
  if (SAVE.pieles.includes(p.id)) { SAVE.piel = p.id; guarda(); return; }
  if (SAVE.monedas < p.precio) { numero(PAN.W / 2, PAN.H / 2, tr('Te faltan {n} monedas', { n: p.precio - SAVE.monedas }), '#ff6b6b', 9); return; }
  SAVE.monedas -= p.precio; SAVE.pieles.push(p.id); SAVE.piel = p.id; guarda();
  chispa(PAN.W / 2, PAN.H / 2, '#ffd54a', 24, 100); SONIDO.elige();
}

function pintaTienda(W, H) {
  const y0 = TAB.y0, t = JUEGO.t;
  G.fillStyle = 'rgba(6,17,10,0.82)'; G.fillRect(0, 0, W, H);
  letra(tr('TIENDA'), W / 2, y0 + 12, 16, '#ffd54a', 'center', '#06110a', 3.5);
  letra(tr('Pieles solo de adorno: no dan ventaja'), W / 2, y0 + 28, 7, '#cfe', 'center', null, 0, 700);
  const cw = (W - 30) / 2, ch = 54;
  PIELES.forEach((p, k) => {
    const x = 12 + (k % 2) * (cw + 6), y = y0 + 38 + Math.floor(k / 2) * (ch + 6), tiene = SAVE.pieles.includes(p.id), puesta = SAVE.piel === p.id;
    caja(x, y, cw, ch, 7, puesta ? '#1f5a36' : '#10251a', puesta ? '#9cff6b' : '#2a4a36', puesta ? 2 : 1.2);
    for (let i = 7; i >= 0; i--) { const lat = i ? 7 : 8.5; caja(x + 12 + (7 - i) * 8 - lat / 2, y + 14 - lat / 2 + Math.sin(t * 4 + i * 0.7) * 1.5, lat, lat, 2, colorDe(p, i, 8, t), '#06110a', 0.8); }
    letra(tr(p.nombre), x + cw / 2, y + 28, 8, '#fff', 'center', '#06110a', 2);
    const txt = puesta ? tr('PUESTA') : tiene ? tr('PONER') : p.precio.toLocaleString('es-ES');
    const col = puesta ? '#2a4a36' : tiene ? '#3ddc84' : SAVE.monedas >= p.precio ? '#ffd54a' : '#5a5a4a';
    botonUI(txt, x + 8, y + 36, cw - 16, 13, () => compraPiel(p), col, puesta ? '#9cff6b' : '#06110a', 7.5);
    if (!tiene) circulo(x + 18, y + 42.5, 3, '#ffd54a', '#8a5a00', 0.8);
  });
  letra(tr('Pronto: packs de monedas y pase de temporada'), W / 2, y0 + 38 + 4 * (ch + 6) + 4, 6.5, '#9fb3a6', 'center', null, 0, 700);
  const atras = () => alMenu('menu');
  botonUI(tr('VOLVER'), W / 2 - 40, Math.min(H - 30, y0 + 38 + 4 * (ch + 6) + 14), 80, 20, atras, '#9cff6b');
  UI.enter = atras; UI.atras = atras;
}
const colorDe = (p, i, n, t) => p.color(i, n, t, i === 0);
