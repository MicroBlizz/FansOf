// Fans of Shelter · PANTALLA (1): la cámara, la letra de píxel, pintar todo en orden (suelo, cosas y personajes por altura, armas,
// efectos, la oscuridad de la noche), el marcador (día/noche, corazones, recursos, experiencia) y la portada y la tarjeta final.
'use strict';

const CAM = { x: 0, y: 0, w: 0, h: 0 };
const PAN = { W: 0, H: 0, t: 0 };

function letra(ctx, txt, x, y, color = PALETA.W, alinea = 'left', tam = 8, borde = true) {
  ctx.font = tam + 'px "Press Start 2P", monospace'; ctx.textAlign = alinea; ctx.textBaseline = 'alphabetic';
  x = Math.round(x); y = Math.round(y);
  if (borde) { ctx.fillStyle = PALETA.K; ctx.fillText(txt, x + 1, y + 1); }
  ctx.fillStyle = color; ctx.fillText(txt, x, y);
}
// un texto que no cabe se encoge (queda algo borroso, pero se lee)
function letraCabe(ctx, txt, x, y, ancho, color, alinea = 'left', tam = 8) {
  ctx.font = tam + 'px "Press Start 2P", monospace';
  const w = ctx.measureText(txt).width;
  if (w <= ancho) { letra(ctx, txt, x, y, color, alinea, tam); return; }
  ctx.save(); const f = ancho / w; ctx.translate(Math.round(x), Math.round(y)); ctx.scale(f, 1); letra(ctx, txt, 0, 0, color, alinea, tam); ctx.restore();
}

// el reloj del día: un anillo que se va vaciando (de amarillo sol a violeta noche) con el tiempo que queda hasta la noche
function relojDia(ctx, cx, cy, r) {
  const f = clamp(NOCHE.t / DIA_SEG, 0, 1);
  ctx.beginPath(); ctx.arc(cx, cy, r + 1, 0, Math.PI * 2); ctx.fillStyle = PALETA.K; ctx.fill();
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = PALETA.m; ctx.fill();
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * f); ctx.closePath();
  ctx.fillStyle = f > 0.3 ? PALETA.Y : PALETA.O; ctx.fill();
  ctx.beginPath(); ctx.arc(cx, cy, r - 3, 0, Math.PI * 2); ctx.fillStyle = f > 0.15 ? PALETA.Y2 : PALETA.v; ctx.fill();
}
// un panel de madera como los de la libreta de Daniel: tinta fuera, madera dentro, una línea de luz arriba
function marcoMadera(ctx, x, y, w, h) {
  x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
  caja(ctx, x, y, w, h, PALETA.K); caja(ctx, x + 1, y + 1, w - 2, h - 2, PALETA.b); caja(ctx, x + 2, y + 2, w - 4, h - 4, 'rgba(40,24,10,0.92)');
  caja(ctx, x + 2, y + 2, w - 4, 1, PALETA.B);
}

function enfoca() {
  CAM.w = PAN.W; CAM.h = PAN.H;
  const tx = clamp(J.x - PAN.W / 2, 0, MAPA.w * CAS - PAN.W), ty = clamp(J.y - 18 - PAN.H / 2, 0, MAPA.h * CAS - PAN.H);
  CAM.x += (tx - CAM.x) * 0.15; CAM.y += (ty - CAM.y) * 0.15;
  if (Math.abs(tx - CAM.x) < 0.3) CAM.x = tx; if (Math.abs(ty - CAM.y) < 0.3) CAM.y = ty;
}

function pintaTodo(ctx) {
  const W = PAN.W, H = PAN.H, t = PAN.t;
  if (NOCHE.fase === 'portada') { pintaPortada(ctx, W, H); return; }
  enfoca();
  const cam = { x: Math.round(CAM.x + (FX.temblor ? rand(-2, 2) * FX.temblor : 0)), y: Math.round(CAM.y + (FX.temblor ? rand(-2, 2) * FX.temblor : 0)), w: W, h: H };
  pintaSuelo(ctx, cam, t);
  pintaCristales(ctx, cam);
  // todo lo que tiene altura, ordenado por los pies
  const lista = cosasConAltura(cam, t);
  lista.push({ y: J.y + 10, pinta: c => pintaJugador(c, cam) });   // un poco por delante: que no lo tapen los que le rodean
  for (const e of ENEMIGOS) lista.push({ y: e.vuela ? e.y + 40 : e.y, pinta: c => pintaEnemigo(c, cam, e) });
  lista.sort((a, b) => a.y - b.y);
  for (const o of lista) o.pinta(ctx);
  // detrás de un árbol: la silueta del conejo, tenue, encima de todo
  if (lista.some(o => o.tapa && o.y > J.y + 10 && Math.abs(o.cx - J.x) < 26 && o.y - J.y < 44)) { ctx.globalAlpha = 0.4; pintaJugador(ctx, cam, true); ctx.globalAlpha = 1; }
  pintaArmas(ctx, cam); pintaProyectiles(ctx, cam);
  pintaParticulas(ctx, cam);
  // la noche: un velo morado con un halo de luz alrededor del conejo y de la hoguera
  if (NOCHE.oscuro > 0) {
    const o = NOCHE.oscuro;   // de 0 (día) a 1 (noche cerrada): se multiplica por un azul, así los colores siguen vivos
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = 'rgb(' + Math.round(255 - 170 * o) + ',' + Math.round(255 - 150 * o) + ',' + Math.round(255 - 50 * o) + ')';
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    halo(ctx, J.x - cam.x, J.y - 18 - cam.y, 74, o * 0.35);
    if (MAPA.hoguera) halo(ctx, (MAPA.hoguera.i + 0.5) * CAS - cam.x, (MAPA.hoguera.j + 0.4) * CAS - cam.y, 60 + Math.round(Math.sin(t * 9)) * 2, o * 0.5, true);
    for (const p of PROY) if (p.tipo === 'fuego') halo(ctx, p.x - cam.x, p.y - cam.y, 14, o * 0.4, true);
    if (J.arma.fuego) for (let k = 0; k < J.arma.zanahorias; k++) { const a = ARMAS.ang + k * Math.PI * 2 / J.arma.zanahorias, r = radioZanahoria(); halo(ctx, J.x + Math.cos(a) * r - cam.x, J.y - 18 + Math.sin(a) * r * 0.75 - cam.y, 28, o * 0.35, true); }
    for (let k = 0; k < J.arma.orbes; k++) { const a = -ARMAS.ang * 1.4 + k * Math.PI * 2 / J.arma.orbes; haloColor(ctx, J.x + Math.cos(a) * 60 - cam.x, J.y - 18 + Math.sin(a) * 60 * 0.75 - cam.y, 20, o * 0.3, [40, 120, 160]); }
    for (const b of MAPA.construido) if (b.tipo === 'torreta') haloColor(ctx, (b.i + 0.5) * CAS - cam.x, (b.j + 0.4) * CAS - cam.y, 18, o * 0.25, [120, 70, 20]);
    ctx.globalCompositeOperation = 'source-over';
  }
  pintaNumeros(ctx, cam);
  pintaMarcador(ctx, W, H);
  pintaMandos(ctx, W, H);
  pintaAvisos(ctx, W, H);
  pintaVentana(ctx, W, H);
  if (NOCHE.fase === 'fin') pintaFin(ctx, W, H);
}
// un círculo de luz en pasos (sin degradado: tres anillos)
function haloColor(ctx, x, y, r, fuerza, c) { for (let k = 0; k < 4; k++) circulo(ctx, x, y, Math.round(r * (1 - k * 0.22)), 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (fuerza * 0.45).toFixed(2) + ')'); }
function halo(ctx, x, y, r, fuerza, calido) {
  const c = calido ? [150, 90, 20] : [70, 75, 110];
  for (let k = 0; k < 4; k++) circulo(ctx, x, y, Math.round(r * (1 - k * 0.22)), 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (fuerza * 0.45).toFixed(2) + ')');
}

function pintaMarcador(ctx, W, H) {
  // franja de arriba: día/noche y el tiempo, los corazones, el nivel
  marcoMadera(ctx, 2, 2, W - 4, 14);
  const seg = Math.max(0, Math.ceil(NOCHE.t)), m = Math.floor(seg / 60), s = ('0' + seg % 60).slice(-2);
  const deNoche = NOCHE.fase === 'noche' || (NOCHE.fase === 'fin' && NOCHE.faseAntes === 'noche');
  const fase = deNoche ? tr('NOCHE {n}', { n: NOCHE.noche }) : tr('Día {n}', { n: NOCHE.noche + 1 });
  letra(ctx, fase + ' ' + m + ':' + s, 6, 12, deNoche ? PALETA.Q : PALETA.Y2, 'left', 8, false);
  for (let k = 0; k < J.vidaMax; k++) pintaSpr(ctx, k < J.vida ? 'ico_corazon' : 'ico_corazon_vacio', W - 5 - (J.vidaMax - k) * 10, 4);
  // de día: los recursos; de noche: la barra de experiencia y el nivel
  if (deNoche || NOCHE.fase === 'amanecer') {
    marcoMadera(ctx, 2, 17, W - 4, 8);
    caja(ctx, 4, 19, Math.round((W - 8) * Math.min(1, J.xp / xpParaSubir())), 4, PALETA.Q);
    letra(ctx, tr('NV {n}', { n: J.nivel }), 5, 35, PALETA.W);
    letra(ctx, tr('BAJAS {n}', { n: J.bajas }), W - 4, 35, PALETA.W, 'right');
  } else {
    let x = 5;
    const ancho = RECURSOS.reduce((a, r) => a + 12 + 8 * String(J.inv[r]).length + 5, 4);
    marcoMadera(ctx, 2, 17, Math.min(W - 4, ancho), 14);
    for (const r of RECURSOS) { pintaSpr(ctx, 'ico_' + r, x, 19); letra(ctx, String(J.inv[r]), x + 12, 28, PALETA.W, 'left', 8, false); x += 12 + 8 * String(J.inv[r]).length + 5; }
    relojDia(ctx, W - 12, 26, 8);
    if (NOCHE.fase === 'dia' && NOCHE.t < 12) letra(ctx, tr('¡Anochece!'), W / 2, 44, PALETA.v, 'center');
  }
  // de día, qué hace el botón de acción según lo que tenga delante
  if (NOCHE.fase === 'dia' && !VENTANA.tipo) {
    const c = casillaMirada().c;
    const txt = c === 'T' ? tr('Talar') : (c === 'R' || c === 'I') ? tr('Picar') : c === 'B' ? tr('Empujar') : c === 'M' ? tr('Craftear') : c === 'C' && !MAPA.cofreAbierto ? tr('Abrir') : c === 'H' ? tr('Dormir') : '';
    if (txt) { marcoMadera(ctx, W / 2 - 30, H - 16, 60, 13); letra(ctx, txt, W / 2, H - 6, PALETA.Y2, 'center', 8, false); }
  }
}
function pintaAvisos(ctx, W, H) {
  let y = H * 0.3;
  for (const a of FX.avisos) { ctx.globalAlpha = Math.min(1, a.t * 2); letraCabe(ctx, a.txt, W / 2, y, W - 8, a.color, 'center'); y += 12; }
  ctx.globalAlpha = 1;
}

/* ---------- PORTADA Y FIN ---------- */
function pintaPortada(ctx, W, H) {
  const t = PAN.t;
  // un claro del bosque de noche: el suelo del mapa (alrededor del refugio) y pinos arriba y abajo
  const oi = 1, oj = 8;
  for (let j = 0; j < Math.ceil(H / CAS) + 1; j++) for (let i = 0; i < Math.ceil(W / CAS) + 1; i++) ctx.drawImage(losaSuelo(oi + i, oj + j), i * CAS, j * CAS);
  for (let i = -1; i < Math.ceil(W / CAS) + 1; i++) { pintaSpr(ctx, 'pino', i * CAS + 16, 40 + Math.round(hash2(i, 8, 2) * 10), { ancla: 'pies' }); pintaSpr(ctx, 'pino', i * CAS + 4, H + 20 - Math.round(hash2(i, 7, 2) * 12), { ancla: 'pies' }); }
  pintaSpr(ctx, 'hoguera_0', W * 0.72, H * 0.6 + 26, { ancla: 'pies' });
  ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = 'rgb(110,120,215)'; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'lighter'; halo(ctx, W * 0.72 + 12, H * 0.6 + 10, 40 + Math.round(Math.sin(t * 9)) * 2, 0.5, true); ctx.globalCompositeOperation = 'source-over';
  // el conejo grande en medio con la zanahoria, y murciélagos rondando
  const cx = W / 2, cy = H * 0.52;
  ctx.globalAlpha = 0.3; caja(ctx, cx - 14, cy + 38, 28, 5, PALETA.K); ctx.globalAlpha = 1;
  pintaSpr(ctx, 'bunny_abajo', cx, cy + 40 + (Math.floor(t * 2) % 2 ? -1 : 0), { ancla: 'pies' });
  for (let k = 0; k < 3; k++) {
    const a = t * 1.2 + k * 2.1, x = cx + Math.cos(a) * (W * 0.4), y = cy - 30 + Math.sin(a * 1.3) * 22;
    pintaSpr(ctx, 'murci_' + (Math.floor(t * 8 + k) % 2), x, y, { ancla: 'centro', espejo: Math.sin(a) > 0 });
  }
  marcoMadera(ctx, cx - 60, H * 0.1, 120, 40);
  letra(ctx, 'FANS OF', cx, H * 0.1 + 14, PALETA.O, 'center', 8);
  letra(ctx, 'SHELTER', cx, H * 0.1 + 33, PALETA.Y, 'center', 16);
  if (Math.floor(t * 2) % 2) letra(ctx, tr('Toca para empezar'), cx, H * 0.84, PALETA.W, 'center');
  letraCabe(ctx, tr('De día: pica y craftea · De noche: aguanta'), cx, H * 0.91, W - 8, PALETA.w, 'center');
  if (SAVE.record) letra(ctx, tr('Récord: {n} noches', { n: SAVE.record }), cx, H * 0.97, PALETA.Q, 'center');
  if (nivelRefugio() > 1) letraCabe(ctx, tr('Refugio: {n}', { n: tr(REFUGIO[nivelRefugio()].nombre) }), cx, H * 0.78, W - 8, PALETA.Y, 'center');
  pintaBotonSonido(ctx, W, H);
}
function pintaBotonSonido(ctx, W, H) {
  PAN.btnMus = { x: 4, y: 4, w: 30, h: 12 }; PAN.btnFx = { x: 38, y: 4, w: 30, h: 12 };
  cajaMarco(ctx, 4, 4, 30, 12, SAVE.musica ? PALETA.g : PALETA.N); letra(ctx, tr('MUS'), 19, 13, PALETA.W, 'center', 8, false);
  cajaMarco(ctx, 38, 4, 30, 12, SAVE.efectos ? PALETA.g : PALETA.N); letra(ctx, tr('FX'), 53, 13, PALETA.W, 'center', 8, false);
}
function pintaFin(ctx, W, H) {
  const a = Math.min(1, NOCHE.tFin / 0.8);
  ctx.fillStyle = 'rgba(20,10,30,' + (a * 0.75).toFixed(2) + ')'; ctx.fillRect(0, 0, W, H);
  if (a < 1) return;
  const cx = W / 2, y0 = H * 0.28;
  marcoMadera(ctx, cx - 70, y0 - 14, 140, 98);
  letra(ctx, tr('TE HAN PILLADO'), cx, y0, PALETA.R, 'center');
  letra(ctx, tr('Noches: {n}', { n: NOCHE.noche }), cx, y0 + 18, PALETA.W, 'center');
  letra(ctx, tr('Bajas: {n}', { n: J.bajas }), cx, y0 + 30, PALETA.W, 'center');
  letra(ctx, tr('Nivel: {n}', { n: J.nivel }), cx, y0 + 42, PALETA.W, 'center');
  letra(ctx, tr('Récord: {n} noches', { n: SAVE.record }), cx, y0 + 54, PALETA.Q, 'center');
  letraCabe(ctx, tr('El refugio se queda: {n}', { n: tr(REFUGIO[nivelRefugio()].nombre) }), cx, y0 + 64, 136, PALETA.Y, 'center');
  if (NOCHE.tFin > 1.5 && Math.floor(PAN.t * 2) % 2) letra(ctx, tr('Toca para volver'), cx, y0 + 78, PALETA.W, 'center');
}
