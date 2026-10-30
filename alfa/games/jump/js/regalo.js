// Fans of Jump · El regalo diario de Lola: GRATIS, una vez al día, en un calendario de 7 casillas que va subiendo (el día 4,
// un casco de obra; el 7, el gordo) y vuelve a empezar. Si te saltas un día no pierdes nada: sigues por donde ibas.
// En la portada es el cofre de arriba a la izquierda, y la primera vez que entras en el día se abre solo.
// Con un anuncio (voluntario, de los 5 del día) se duplican las zanahorias de ese día.
'use strict';

const REGALOS = [{ z: 50 }, { z: 75 }, { z: 100 }, { kit: 'casco' }, { z: 150 }, { z: 200 }, { z: 400 }];
let regaloVisto = false;   // ya se abrió solo en esta visita
const regaloHoy = () => !GUARDA.regalo || yaPaso(GUARDA.regalo.dia);                       // ¿queda el de hoy?
const casillaRegalo = () => GUARDA.regalo ? (regaloHoy() ? GUARDA.regalo.n + 1 : GUARDA.regalo.n) % REGALOS.length : 0;   // la de hoy

// el cofre de la portada: bota y brilla si queda el de hoy
function pintaCofre(x, y, t) {
  const hay = regaloHoy(), bote = hay ? Math.abs(Math.sin(t * 3)) * 2 : 0;
  if (hay && !regaloVisto && GUARDA.partidas > 0 && !PANEL.abierto) { regaloVisto = true; abrePanel('regalo'); }
  aqui(x, y - bote, hay ? Math.sin(t * 6) * 0.05 : 0, 1, 1, () => {
    caja(-9, -3, 18, 11, 2, hay ? '#c47a3c' : '#b7a58f', OLC, 0.9);   // la caja
    caja(-10, -9, 20, 7, [4, 4, 1, 1], hay ? '#e0944a' : '#c9b8a2', OLC, 0.9);   // la tapa
    caja(-2, -9, 4, 17, 0, hay ? PASTEL.oro : PASTEL.raya, OLC, 0.6);   // la cinta
    caja(-2.4, -2.5, 4.8, 4.2, 1, '#fff1a0', OLC, 0.6);   // el cierre
  });
  if (hay) estrellita(x + 9, y - 10 - bote, 2.6 + Math.sin(t * 7), 0.95);
  letras(tr(hay ? 'Regalo' : 'Mañana'), x, y + 13, 6.4, '#ffffff', { borde: OLC, bw: 2 });
  boton(x - 13, y - 14, 26, 32, () => abrePanel('regalo'));
}
// el dibujo de lo que da una casilla
function pintaPremioRegalo(r, x, y, s = 1) {
  if (r.kit) iconoKit(r.kit, x, y);
  else { iconoZana(x, y - 1 - (s - 1) * 6, 15 * s); letras('+' + r.z, x, y + 10, 7.4, PASTEL.melocotonO); }
}
function recogeRegalo() {
  if (!regaloHoy()) return SONIDO.uy();
  const n = casillaRegalo(), r = REGALOS[n];
  GUARDA.regalo = { dia: hoy(), n, doble: false };
  if (r.kit) GUARDA.kit[r.kit] = (GUARDA.kit[r.kit] || 0) + 1; else GUARDA.zanas += r.z;
  salvaGuarda(); JS.pide('regalo');
  bandera(r.kit ? tr('¡Casco de obra!') : tr('¡Regalo de Lola! +{n}', { n: r.z }), PASTEL.oro);
  confeti(PAN.W / 2, CAM.y + PAN.H * 0.6, 40); SONIDO.compra(); vibra([20, 30, 20]);
}
function duplicaRegalo() {
  const g = GUARDA.regalo, r = g && REGALOS[g.n];
  if (!r || !r.z || g.doble || regaloHoy() || !anunciosQuedan() || !hayAnuncios()) return;
  verAnuncio(() => {
    cuentaAnuncio('regalo'); g.doble = true; GUARDA.zanas += r.z; salvaGuarda();
    bandera(tr('¡Duplicado! +{n}', { n: r.z }), PASTEL.menta); confeti(PAN.W / 2, CAM.y + PAN.H * 0.6, 30); SONIDO.compra();
  });
}
// la ficha del calendario: 4 casillas arriba y 3 abajo (la del día 7, el doble de ancha)
function pintaRegalo() {
  const W = PAN.W, x = 14, w = W - 28, h = 196, y = PAN.H / 2 - h / 2;
  marco('Regalo de Lola', x, y, w, h, PASTEL.oro);
  const hay = regaloHoy(), hoyN = casillaRegalo(), hecho = GUARDA.regalo ? GUARDA.regalo.n : -1;
  envuelve(tr('Un regalo gratis cada día. Si un día no vienes, no pasa nada: sigues por donde ibas.'), w - 24, 6.6)
    .forEach((l, i) => letras(l, W / 2, y + 14 + i * 8, 6.6, PASTEL.suave, { peso: 700 }));
  const cw = (w - 30) / 4, ch = 40;
  REGALOS.forEach((r, i) => {
    const fila = i < 4 ? 0 : 1, col = i < 4 ? i : i - 4, ancho = i === 6 ? cw * 2 + 4 : cw;
    const cx = x + 9 + col * (cw + 4), cy = y + 34 + fila * (ch + 6);
    const esHoy = i === hoyN && hay, cogido = hay ? i < hoyN : i <= hecho;
    caja(cx, cy, ancho, ch, 4, esHoy ? '#fff4c2' : cogido ? PASTEL.fondo : '#ffffff', esHoy ? PASTEL.oroO : OLC, esHoy ? 1.3 : 0.7);
    letras(tr('Día {n}', { n: i + 1 }), cx + ancho / 2, cy + 6.5, 6, esHoy ? PASTEL.oroO : PASTEL.suave, { peso: 800 });
    G.globalAlpha = cogido ? 0.45 : 1; pintaPremioRegalo(r, cx + ancho / 2, cy + 22, i === 6 ? 1.3 : 1); G.globalAlpha = 1;
    if (cogido) { trazo(cx + ancho / 2 - 6, cy + 22, cx + ancho / 2 - 1, cy + 27, 1.6, PASTEL.mentaO, null); trazo(cx + ancho / 2 - 1, cy + 27, cx + ancho / 2 + 8, cy + 15, 1.6, PASTEL.mentaO, null); }
  });
  const bw = 120, bh = 20, bx = W / 2 - bw / 2, by = y + h - 50;
  if (hay) {
    caja(bx, by + 2, bw, bh, 5, OLC, null); caja(bx, by, bw, bh, 5, PASTEL.melocoton, OLC, 1);
    letras(tr('¡Recoger!'), W / 2, by + 10.5, 11, '#ffffff', { logo: true, borde: PASTEL.melocotonO, bw: 2.4, max: bw - 12 });
    boton(bx - 4, by - 4, bw + 8, bh + 8, recogeRegalo);
  } else {
    const r = REGALOS[GUARDA.regalo.n], puede = r.z && !GUARDA.regalo.doble && hayAnuncios() && anunciosQuedan() > 0;
    if (puede) {
      caja(bx, by + 2, bw, bh, 5, OLC, null); caja(bx, by, bw, bh, 5, PASTEL.menta, OLC, 1);
      iconoTele(bx + 12, by + 10); letras(tr('Duplícalo con un anuncio'), W / 2 + 9, by + 10.5, 7.2, PASTEL.texto, { peso: 800, max: bw - 28 });
      boton(bx - 4, by - 4, bw + 8, bh + 8, duplicaRegalo);
    } else letras(tr('Vuelve mañana: te espera el día {n}', { n: casillaRegalo() + 1 }), W / 2, by + 10, 7.4, PASTEL.texto, { peso: 800, max: w - 20 });
  }
  { letras(tr('Cerrar'), W / 2, by + 34, 7.5, PASTEL.suave, { peso: 700 }); boton(W / 2 - 30, by + 26, 60, 16, () => { PANEL.abierto = null; SONIDO.boton(); }); }
}
