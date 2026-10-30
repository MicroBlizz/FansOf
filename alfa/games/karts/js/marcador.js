// Fans of Karts (prototipo) · EL MARCADOR: lo que se ve encima de la carrera. Arriba, la vuelta, las monedas, el objeto (con su ruleta),
// el tiempo y el mapa pequeño con un punto por piloto; abajo, el puesto en grande y la cinta del comentarista; en el centro, los avisos
// (¡NERFEADO!, ¡ÚLTIMA VUELTA!…) y la cuenta atrás.
'use strict';

const AVISO = { t1: '', t2: '', color: '#ffffff', t: 0 };
let HM = 0;      // cuánto se aparta el marcador de los lados (con el móvil tumbado, para que los botones del dedo no lo tapen)
const TICKER = { txt: '', t: 0, x: 0, w: 0 };
// un aviso grande en el centro (dos líneas) y una frase del comentarista en la cinta de abajo
function aviso(t1, t2 = '', color = '#ffffff') { AVISO.t1 = tr(t1); AVISO.t2 = tr(t2); AVISO.color = color; AVISO.t = 2.1; }
function comenta(txt) { TICKER.txt = tr(txt); TICKER.w = anchoTexto(TICKER.txt); TICKER.x = PW + 4; TICKER.t = 1; }

const COLOR_PUESTO = ['#ffcb3d', '#dfe6f2', '#e89a5a', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff'];
function caja(x, y, w, h, fondo = 'rgba(28,16,40,0.62)') { lx.fillStyle = fondo; lx.fillRect(x + 1, y, w - 2, h); lx.fillRect(x, y + 1, w, h - 2); }

function pintaMarcador(C, dt) {
  const yo = C.jugador, P = PISTA;
  // ---------- vuelta y monedas ----------
  const L = HM, R = PW - HM;      // los bordes izquierdo y derecho del marcador
  caja(L + 3, 3, 50, 23);
  mini(lx, tr('VUELTA'), L + 7, 6, '#bdb6d6');
  escribe(lx, Math.min(C.vueltas, Math.max(1, yo.vuelta)) + '/' + C.vueltas, L + 49, 5, '#ffffff', '#1c1028', 'der');
  const mo = iconoMoneda();
  lx.drawImage(mo, L + 6, 14);
  escribe(lx, '×' + (yo.monedas < 10 ? '0' : '') + yo.monedas, L + 19, 16, yo.monedas >= AJ.maxMonedas ? '#ffcb3d' : '#ffffff', '#1c1028');
  // ---------- el objeto ----------
  caja(108, 3, 24, 24, 'rgba(28,16,40,0.7)');
  lx.strokeStyle = yo.objeto ? '#ffcb3d' : '#6e6890'; lx.lineWidth = 1; lx.strokeRect(108.5, 3.5, 23, 23);
  const idObj = yo.tRuleta > 0 ? LISTA_OBJETOS[Math.floor(RELOJ * 14) % LISTA_OBJETOS.length] : yo.objeto;
  if (idObj) {
    const ic = iconoDe(OBJETOS[idObj].fig);
    lx.drawImage(ic.c, 0, 0, ic.w, ic.h, Math.round(120 - ic.ax), Math.round(23 - ic.ay), ic.w, ic.h);
    if (yo.objeto && yo.tRuleta <= 0) {
      if (yo.usos > 1) mini(lx, '×' + yo.usos, 130, 20, '#ffcb3d', '#1c1028', 'der');
      mini(lx, tr(OBJETOS[yo.objeto].nombre), 120, 29, '#ffffff', '#1c1028', 'centro');
    }
  }
  // ---------- tiempo y mapa ----------
  caja(R - 59, 3, 44, 11);
  escribe(lx, tiempoTxt(C.reloj), R - 18, 5, '#ffffff', '#1c1028', 'der');
  const m = P.mini;
  const MX = R - 54;
  if (C.espejo) { lx.save(); lx.setTransform(-1, 0, 0, 1, 2 * MX + m.c.width, 0); }      // el espejo: el mapa también, del revés
  lx.globalAlpha = 0.85; lx.drawImage(m.c, MX, 17); lx.globalAlpha = 1;
  for (let i = C.orden.length - 1; i >= 0; i--) {
    const k = C.orden[i], mx = MX + Math.floor(k.x / m.esc), my = 17 + Math.floor(k.y / m.esc);
    if (k === yo) continue;
    lx.fillStyle = '#1c1028'; lx.fillRect(mx - 1, my - 1, 3, 3); lx.fillStyle = k.piloto.color; lx.fillRect(mx, my, 1, 1); lx.fillRect(mx - 1, my, 3, 1); lx.fillRect(mx, my - 1, 1, 3);
  }
  { const mx = MX + Math.floor(yo.x / m.esc), my = 17 + Math.floor(yo.y / m.esc); lx.fillStyle = '#1c1028'; lx.fillRect(mx - 2, my - 2, 5, 5); lx.fillStyle = (RELOJ * 4) % 1 < 0.5 ? '#ffffff' : yo.piloto.color; lx.fillRect(mx - 1, my - 1, 3, 3); }
  if (C.espejo) lx.restore();
  if (C.crono && SAVE.crono[C.def.id]) mini(lx, tr('RÉCORD') + ' ' + tiempoTxt(SAVE.crono[C.def.id]), R - 18, 16 + m.c.height + 3, '#ffe9a8', '#1c1028', 'der');
  // el botón de pausa (para el dedo o el ratón)
  caja(R - 12, 3, 9, 11); lx.fillStyle = '#ffffff'; lx.fillRect(R - 10, 6, 2, 5); lx.fillRect(R - 7, 6, 2, 5);
  // ---------- el puesto ----------
  const pt = puestoTxt(yo.puesto), num = String(yo.puesto), col = COLOR_PUESTO[yo.puesto - 1];
  if (!C.crono) {
  const py = HM ? 30 : 121;        // con los botones del dedo a los lados, el puesto sube bajo las monedas
  escribeB(lx, num, L + 6, py, col, '#1c1028', 'izq', HM ? 3 : 4);
  escribeB(lx, pt.slice(num.length), L + 8 + anchoTexto(num, HM ? 3 : 4), py + 1, col, '#1c1028', 'izq', HM ? 1 : 2);
  }
  // ---------- la cinta del comentarista ----------
  if (TICKER.t > 0) {
    TICKER.x -= dt * 62;
    if (TICKER.x < -TICKER.w - 6) TICKER.t = 0;
    else { lx.fillStyle = 'rgba(28,16,40,0.72)'; lx.fillRect(58, 148, PW - 58, 11); lx.save(); lx.beginPath(); lx.rect(60, 148, PW - 62, 11); lx.clip(); escribe(lx, TICKER.txt, Math.round(TICKER.x), 150, '#ffe9a8', null); lx.restore(); }
  }
  // ---------- avisos ----------
  if (C.estado === 'cuenta') {
    const n = Math.ceil(C.tCuenta);
    if (n <= 3 && n >= 1) { const f = C.tCuenta - (n - 1); escribeB(lx, String(n), PW / 2, 52 - Math.round(f * 6), n === 1 ? '#5ef27a' : '#ffcb3d', '#1c1028', 'centro', 5); }
    else if (n > 3) { caja(40, 55, 160, 15); escribe(lx, tr('Conectando con los servidores…'), PW / 2, 59, '#ffffff', '#1c1028', 'centro'); }
    caja(58, 147, 180, 11, 'rgba(28,16,40,0.72)');
    mini(lx, tr(ENT.tactil ? 'SALIDA TURBO: APRIETA DERRAPE JUSTO ANTES DEL YA' : 'SALIDA TURBO: ACELERA JUSTO ANTES DEL YA'), 148, 150, '#ffe9a8', null, 'centro');
  } else if (C.estado === 'corre' && C.reloj < 0.9) escribeB(lx, tr('¡YA!'), PW / 2, 50, '#5ef27a', '#1c1028', 'centro', 5);
  if (AVISO.t > 0) {
    AVISO.t -= dt;
    const y = 64 - Math.round(Math.max(0, AVISO.t - 1.9) * 60);
    if (AVISO.t > 0.25 || (RELOJ * 16) & 1) {
      const e = anchoTexto(AVISO.t1, 2) > PW - 12 ? 1 : 2;
      escribeB(lx, AVISO.t1, PW / 2, y, AVISO.color, '#1c1028', 'centro', e);
      if (AVISO.t2) escribeB(lx, AVISO.t2, PW / 2, y + (e === 2 ? 19 : 11), '#ffffff', '#1c1028', 'centro');
    }
  }
  if (yo.tContra > 1.1 && (RELOJ * 3) % 1 < 0.7) { escribeB(lx, tr('¡SENTIDO CONTRARIO!'), PW / 2, 100, '#ff3348', '#1c1028', 'centro'); mini(lx, tr('NO ES UN BUG: ES UNA FUNCIÓN'), PW / 2, 111, '#ffffff', '#1c1028', 'centro'); }
  if (C.tCierre >= 0 && C.estado === 'corre') escribeB(lx, trf('CIERRE EN %1', Math.ceil(C.tCierre)), PW / 2, 36, '#ff3348', '#1c1028', 'centro');
}
// la moneda pequeña del marcador (un dibujito de 10 × 10)
let ICONO_MONEDA = null;
function iconoMoneda() {
  if (ICONO_MONEDA) return ICONO_MONEDA;
  const [c, x] = lienzo(10, 10), filas = ['..oooo..', '.oAAAAo.', 'oAABBAAo', 'oABAABAo', 'oABAABAo', 'oAABBAAo', '.oAAAAo.', '..oooo..'], col = { o: '#1c1028', A: '#ffcb3d', B: '#fff3a0' };
  filas.forEach((f, j) => { for (let i = 0; i < f.length; i++) if (f[i] !== '.') { x.fillStyle = col[f[i]]; x.fillRect(i + 1, j + 1, 1, 1); } });
  return (ICONO_MONEDA = c);
}
