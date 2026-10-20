// Fans of Beams · Arranque: calidad gráfica adaptable, bucle principal, pausa al ocultarse y el objeto BEAMS que usan las pruebas.
// (Se carga por orden desde index.html: todos los archivos comparten ámbito global.)
'use strict';
// ---------- calidad adaptable: si el móvil va justo, el juego baja solo de nivel (y no vuelve a subir a uno que ya le fue mal) ----------
let fpsEma = 60, ema = 0.0167, lentoT = 0, rapidoT = 0, ant = performance.now();
calAuto = (TACTIL || (navigator.hardwareConcurrency || 8) <= 4) ? 1 : 2;
function fijaCal() {
  const m = OPC.pant.cal; Q = m === 'auto' ? CAL[calAuto] : CAL[{ baja: 0, media: 1, alta: 2, hd: 3 }[m]];
  const nuevo = Q === CAL[0] ? 1.0 : Q === CAL[1] ? 1.5 : Q === CAL[2] ? 2 : 3; if (nuevo !== RkMax) { RkMax = nuevo; ajusta(); }
  const ew = Math.round(W * Q.esc); if (esc.width !== ew) { esc.width = ew; esc.height = Math.round(H * Q.esc); }   // el lienzo de la escena: más grande en HD
}
function adaptaCal(dt) {
  fpsEma += (1 / Math.max(dt, 0.001) - fpsEma) * 0.05; if (OPC.pant.cal !== 'auto' || S.estado !== 'jugando') { lentoT = rapidoT = 0; return; }
  ema += (dt - ema) * 0.06;
  if (ema > 0.026) { lentoT += dt; rapidoT = 0; } else if (ema < 0.0185) { rapidoT += dt; lentoT = 0; } else lentoT = rapidoT = 0;
  if (lentoT > 2 && calAuto > 0) { calAuto--; calMax = calAuto; lentoT = 0; ema = 0.0167; fijaCal(); }
  else if (rapidoT > 15 && calAuto < calMax) { calAuto++; rapidoT = 0; fijaCal(); }
}
function bucle(ahora) {
  const real = Math.min(0.5, (ahora - ant) / 1000), dt = Math.min(0.05, real); ant = ahora;
  refresca();
  if (innerHeight <= innerWidth * 1.1) actualiza(dt);   // en vertical el juego espera
  dibuja(); adaptaCal(real);
  for (const k in PU) delete PU[k]; for (const k in FIJA) delete FIJA[k];
  requestAnimationFrame(bucle);
}
document.addEventListener('visibilitychange', () => { if (document.hidden) { if (S.estado === 'jugando') S.estado = 'pausa'; } else if (S.estado !== 'titulo') pantallaEncendida(); });
// el menú suena en cuanto el navegador deja (hasta la primera tecla no hay audio)
setInterval(() => { if (AC && M.bus && !M.name && S.estado === 'titulo') musicSet('nvMenu'); }, 400);
window.BEAMS = { get S() { return S; }, get P() { return P; }, get ALI() { return ALI; }, get EN() { return EN; }, get FX() { return FX; }, get GIG() { return GIG; }, get ROCAS() { return ROCAS_FONDO; }, crea, creaGigante, explota, suelta, captura, lanzaRayo, daño, setQ(i) { Q = CAL[i]; fijaCal(); }, get ITEMS() { return ITEMS; }, TIPOS, ELEG, nave };
fijaCal(); addEventListener('resize', ajusta); ajusta();
for (const f of ['900 20px FoOrbitron', '700 20px FoOrbitron', '400 20px FoAudiowide', '400 20px FoMichroma']) if (document.fonts) document.fonts.load(f).then(() => TXTC.clear()).catch(() => {});
requestAnimationFrame(bucle);
