// Fans of Chef · PANTALLA (1): la cámara, pintar el sótano en orden (suelo, cosas y personajes por los pies, botín, efectos),
// el marcador de la caza (objetivos, corazones, reloj, cesta) y la portada. Las ventanas (mañana, servicio, cierre) están en pantalla-2.js.
'use strict';

const CAM = { x: 0, y: 0, w: 0, h: 0 };
const PAN = { W: 0, H: 0, t: 0 };

function enfoca() {
  CAM.w = PAN.W; CAM.h = PAN.H;
  const tx = clamp(J.x - PAN.W / 2, 0, Math.max(0, MAPA.w * CAS - PAN.W)), ty = clamp(J.y - 14 - PAN.H / 2, 0, Math.max(0, MAPA.h * CAS - PAN.H));
  CAM.x += (tx - CAM.x) * 0.15; CAM.y += (ty - CAM.y) * 0.15;
  if (Math.abs(tx - CAM.x) < 0.3) CAM.x = tx; if (Math.abs(ty - CAM.y) < 0.3) CAM.y = ty;
}

function pintaTodo(ctx) {
  const W = PAN.W, H = PAN.H, t = PAN.t, f = JORNADA.fase;
  if (f === 'portada') { pintaPortada(ctx, W, H); return; }
  if (f === 'caza' || f === 'subiendo') {
    enfoca();
    const cam = { x: Math.round(CAM.x + (FX.temblor ? rand(-2, 2) * FX.temblor : 0)), y: Math.round(CAM.y + (FX.temblor ? rand(-2, 2) * FX.temblor : 0)), w: W, h: H };
    pintaSuelo(ctx, cam);
    pintaBotin(ctx, cam);
    const lista = cosasConAltura(cam);
    if (vivo()) lista.push({ y: J.y + 1, pinta: c => pintaJugador(c, cam) });
    for (const e of ENEMIGOS) lista.push({ y: e.y, pinta: c => pintaEnemigo(c, cam, e) });
    lista.sort((a, b) => a.y - b.y);
    for (const o of lista) o.pinta(ctx);
    pintaParticulas(ctx, cam); pintaNumeros(ctx, cam);
    pintaLuz(ctx, cam, W, H);
    pintaMarcador(ctx, W, H);
    pintaMandos(ctx, W, H);
    if (f === 'subiendo') { const a = clamp(JORNADA.subeT < 0 ? (JORNADA.subeT + 1.2) / 1.2 : JORNADA.subeT / 1.2, 0, 1); ctx.fillStyle = 'rgba(0,0,0,' + a.toFixed(2) + ')'; ctx.fillRect(0, 0, W, H); if (JORNADA.subeT >= 0) letra(ctx, tr('Subiendo a la cantina...'), W / 2, H / 2, PALETA.Y, 'center'); }
  } else {
    pintaFondoCantina(ctx, W, H, t);
  }
  pintaVentana(ctx, W, H);
  pintaAvisos(ctx, W, H);
}
// la luz de las antorchas: oscuridad suave con halos cálidos (y uno alrededor del cocinero)
function pintaLuz(ctx, cam, W, H) {
  ctx.fillStyle = 'rgba(8,4,12,0.28)'; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'lighter';
  for (const a of MAPA.antorchas) { const x = a.x - cam.x, y = a.y - cam.y; if (x < -60 || y < -60 || x > W + 60 || y > H + 60) continue; halo(ctx, x, y - 6, 34 + Math.round(Math.sin(PAN.t * 9 + a.x)) * 2, 0.5); }
  halo(ctx, J.x - cam.x, J.y - cam.y - 14, 44, 0.28);
  ctx.globalCompositeOperation = 'source-over';
}
function halo(ctx, x, y, r, fuerza) { for (let k = 0; k < 4; k++) circulo(ctx, x, y, Math.round(r * (1 - k * 0.22)), 'rgba(150,90,20,' + (fuerza * 0.45).toFixed(2) + ')'); }

function pintaMarcador(ctx, W, H) {
  // arriba a la izquierda: la fase y los objetivos de la jornada
  const obj = Object.keys(JORNADA.objetivos), alto = 16 + obj.length * 11;
  marcoMadera(ctx, 2, 2, Math.min(W - 60, 118), alto);
  letra(ctx, tr('DÍA {n}: CAZA', { n: JORNADA.dia }), 6, 12, PALETA.Y, 'left', 8, false);
  obj.forEach((k, i) => {
    const tengo = JORNADA.despensa[k] || 0, quiero = JORNADA.objetivos[k], hecho = tengo >= quiero;
    pintaSpr(ctx, 'ico_' + k, 10, 24 + i * 11, { que: k });
    letraCabe(ctx, tr(INGREDIENTES[k].nombre), 18, 23 + i * 11, 64, hecho ? PALETA.G : PALETA.w, 'left', 7);
    letra(ctx, Math.min(tengo, quiero) + '/' + quiero, 114, 23 + i * 11, hecho ? PALETA.G : PALETA.W, 'right', 7, false);
  });
  // arriba a la derecha: corazones y reloj
  marcoMadera(ctx, W - 58, 2, 56, 26);
  for (let k = 0; k < CIFRAS.vida; k++) pintaSpr(ctx, 'ico_corazon', W - 48 + k * 12, 14, { vacio: k >= J.vida });
  const seg = Math.ceil(JORNADA.reloj()), m = Math.floor(seg / 60), s = ('0' + seg % 60).slice(-2);
  letra(ctx, m + ':' + s, W - 30, 25, seg <= 10 && Math.floor(PAN.t * 4) % 2 ? PALETA.R : PALETA.Y, 'center', 8, false);
  // abajo a la izquierda: la cesta (lo cazado)
  const tipos = Object.keys(INGREDIENTES);
  marcoMadera(ctx, 2, H - 40, 6 + tipos.length * 26, 18);   // (abajo del todo está el botón DEV)
  tipos.forEach((k, i) => { pintaSpr(ctx, 'ico_' + k, 10 + i * 26, H - 25, { que: k }); letra(ctx, 'x' + (JORNADA.despensa[k] || 0), 16 + i * 26, H - 27, PALETA.W, 'left', 7, false); });
  // el montacargas: qué pasa al pulsar
  if (JORNADA.enMontacargas && JORNADA.fase === 'caza') { const txt = JORNADA.objetivosHechos() ? tr('Subir a la cantina') : tr('Subir (faltan cosas)'); marcoMadera(ctx, W / 2 - 60, H - 36, 120, 13); letraCabe(ctx, (ENTRADA.tactil ? tr('CUCHILLO: ') : tr('J: ')) + txt, W / 2, H - 26, 112, PALETA.Y, 'center', 7); }
}

/* ---------- PORTADA ---------- */
function pintaPortada(ctx, W, H) {
  const t = PAN.t;
  // la cantina a oscuras: suelo de piedra, el montacargas al fondo y el cocinero delante
  ctx.fillStyle = patronSuelo(ctx); ctx.fillRect(0, 0, W, H);
  pintaMuroFondo(ctx, W); ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(0, CAS * 2, W, 6);
  pintaSpr(ctx, 'verja', W / 2 - 70, CAS * 2 - 1); pintaSpr(ctx, 'montacargas', W / 2 + 50, CAS * 2 + 40, { listo: false });
  pintaSpr(ctx, 'antorcha', W / 2 - 20, CAS * 2 - 6, { t }); pintaSpr(ctx, 'antorcha', W / 2 + 100, CAS * 2 - 6, { t });
  pintaSpr(ctx, 'columna', 14, H * 0.5); pintaSpr(ctx, 'barril', W - 16, H * 0.5); pintaSpr(ctx, 'huesos', W * 0.3, H * 0.8); pintaSpr(ctx, 'charco', W * 0.75, H * 0.75, { t });
  ctx.fillStyle = 'rgba(8,4,12,0.35)'; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'lighter'; halo(ctx, W / 2 - 20, CAS * 2 - 12, 36, 0.5); halo(ctx, W / 2 + 100, CAS * 2 - 12, 36, 0.5); ctx.globalCompositeOperation = 'source-over';
  const cx = W / 2, cy = H * 0.62;
  ctx.save(); ctx.translate(cx, cy); ctx.scale(2, 2); ctx.translate(-cx, -cy);
  ctx.globalAlpha = 0.3; circulo(ctx, cx, cy, 8, PALETA.K); ctx.globalAlpha = 1;
  pintaSpr(ctx, 'chef_abajo', cx, cy - Math.abs(Math.sin(t * 3)) * 1.5);
  ctx.restore();
  for (let k = 0; k < 2; k++) { const a = t * 0.9 + k * 3.1, x = cx + Math.cos(a) * (W * 0.38), y = cy + 6 + Math.sin(a * 1.7) * 14; pintaSpr(ctx, k ? 'gelatina' : 'cebollon', x, y, { t, espejo: Math.cos(a) < 0 }); }
  marcoMadera(ctx, cx - 60, H * 0.08, 120, 40);
  letra(ctx, 'FANS OF', cx, H * 0.08 + 14, PALETA.O, 'center', 8);
  letra(ctx, 'CHEF', cx, H * 0.08 + 33, PALETA.Y, 'center', 16);
  if (Math.floor(t * 2) % 2) letra(ctx, tr('Toca para empezar'), cx, H * 0.84, PALETA.W, 'center');
  letraCabe(ctx, tr('Caza en el sótano · Cocina para la empresa'), cx, H * 0.91, W - 8, PALETA.w, 'center');
  if (SAVE.recordDia) letra(ctx, tr('Jornada {n} · Oro: {o}', { n: SAVE.dia, o: SAVE.oro }), cx, H * 0.97, PALETA.Y, 'center');
  pintaBotonSonido(ctx, W, H);
}
function pintaBotonSonido(ctx, W, H) {
  PAN.btnMus = { x: 4, y: 4, w: 30, h: 12 }; PAN.btnFx = { x: 38, y: 4, w: 30, h: 12 };
  cajaMarco(ctx, 4, 4, 30, 12, SAVE.musica ? PALETA.g : PALETA.N); letra(ctx, tr('MUS'), 19, 13, PALETA.W, 'center', 8, false);
  cajaMarco(ctx, 38, 4, 30, 12, SAVE.efectos ? PALETA.g : PALETA.N); letra(ctx, tr('FX'), 53, 13, PALETA.W, 'center', 8, false);
  void H;
}
// el fondo de la cantina (mañana, servicio y cierre): la barra de madera, el fogón y el cocinero detrás
function pintaFondoCantina(ctx, W, H, t) {
  caja(ctx, 0, 0, W, H, '#2a1a0c');
  pintaMuroFondo(ctx, W);
  caja(ctx, 0, CAS * 2, W, H * 0.42 - CAS * 2, '#3b2614'); ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(0, CAS * 2, W, 6); caja(ctx, 0, H * 0.42, W, 3, PALETA.K); caja(ctx, 0, H * 0.42 + 3, W, 10, PALETA.B); caja(ctx, 0, H * 0.42 + 4, W, 1, PALETA.T);
  ctx.fillStyle = patronSuelo(ctx); ctx.fillRect(0, H * 0.42 + 13, W, H);
  // el fogón: una olla con vapor
  const fx = W * 0.2, fy = H * 0.42 + 2; cajaMarco(ctx, fx - 10, fy - 12, 20, 12, PALETA.N); caja(ctx, fx - 8, fy - 13, 16, 2, PALETA.n);
  for (let k = 0; k < 3; k++) { const p = (t * 0.7 + k * 0.33) % 1; ctx.globalAlpha = 0.5 * (1 - p); circulo(ctx, fx - 4 + k * 4 + Math.sin(t * 2 + k) * 2, fy - 16 - p * 16, 2, PALETA.w); }
  ctx.globalAlpha = 1;
  pintaSpr(ctx, 'antorcha', W * 0.1, CAS * 2 - 6, { t }); pintaSpr(ctx, 'antorcha', W * 0.9, CAS * 2 - 6, { t }); pintaSpr(ctx, 'barril', W * 0.9, H * 0.42 + 2); pintaSpr(ctx, 'barril', W * 0.9 - 16, H * 0.42 + 4);
  pintaSpr(ctx, 'chef_abajo', W * 0.5, H * 0.42 + 4 - Math.abs(Math.sin(t * 3)));
  ctx.fillStyle = 'rgba(8,4,12,0.25)'; ctx.fillRect(0, 0, W, H);
}
