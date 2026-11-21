// Fans of Recruit · PINTAR LA PARTIDA: de atrás adelante → la ciudad por las ventanas (se mueve más despacio), el reflejo de
// los cristales, la oficina (en trozos ya pintados), las sombras, los personajes ordenados por lo cerca que están, las balas,
// los efectos, los letreros, la planta de delante y, encima de todo, el marcador y los mandos del móvil.
'use strict';

const RADIO_SOMBRA = { jugador: 13, becario: 12, dron: 8, jefe: 42, caja: 15, fan: 11, mecha: 29, vaca: 13, premio: 7 };
const VIOLETA_ROTULO = ['#f3e6ff', '#c79bff', '#8a4be0'], ROSA_ROTULO = ['#ffe3ef', '#ffabd2', '#f07fb8'];

function pintaFx(g, e, cx, cy) {
  if (e.parp && e.t > e.dur - 22 && (e.t & 2)) return;
  const s = Array.isArray(e.s) ? e.s[e.gira ? (((e.t / e.gira) | 0) + (e.f0 || 0)) % e.s.length : Math.min(e.s.length - 1, (e.t * e.s.length / e.dur) | 0)] : e.s;
  pintaSpr(g, s, e.x - cx, e.y - cy);
}
// cómo se pinta cada cosa. (cx, cy) = la esquina de la cámara
const PINTA = {
  jugador(g, j, cx, cy) {
    if (j.muerto ? j.muerto > 56 && (j.muerto & 2) : j.inv > 0 && !j.caos && (j.inv & 2) && J.fase !== 'gana') return;   // parpadea
    const x = j.x - cx, y = j.y - cy, esp = j.dir < 0;
    if (j.mecha) {
      const s = dibujoMecha(), bote = j.suelo && j.vx ? (j.anim | 0) % 3 === 1 ? 1 : 0 : j.suelo ? (j.t >> 4) & 1 : -1;
      pintaSpr(g, SPR.conejo.agachado[0], x - j.dir * 13, y - 47 + bote, esp);   // CrazyBunny va subido detrás de la cabina
      pintaSpr(g, s, x, y, esp, j.inv > 62);
      if (j.fogon > 1) { const bx = x + j.dir * s.boca[0], by = y + s.boca[1]; if (j.mira < 0) pintaSpr(g, giradoA(SPR.fogonazo[j.t % 3], Math.atan2(Math.sin(CANON_ARR), j.dir * Math.cos(CANON_ARR))), bx, by); else pintaSpr(g, SPR.fogonazo[j.t % 3], bx, by, esp); }
      return;
    }
    const s = dibujoConejo();
    pintaSpr(g, s, x, y - 1, esp);
    if (j.fogon > 1 && s.boca) {
      const bx = x + j.dir * s.boca[0], by = y - 1 + s.boca[1], d = dirDisparo(j), f = j.t % 3;
      if (j.mira === -0.5 || j.mira === 0.5) pintaSpr(g, giradoA(SPR.fogonazo[f], Math.atan2(d[1], d[0])), bx, by);
      else pintaSpr(g, (j.mira < 0 ? SPR.fogonazoArr : j.mira > 0 ? SPR.fogonazoAba : SPR.fogonazo)[f], bx, by, esp);
    }
  },
  becario(g, e, cx, cy) {
    const B = SPR.becario, x = e.x - cx, y = e.y + e.z - cy;
    const s = e.est === 'cafe' ? B.cafe[(e.t >> 3) % 4] : e.est === 'susto' ? B.susto : e.est === 'huye' ? B.huye[(e.anim | 0) % 4] : e.est === 'apunta' ? B.apunta[(e.t >> 2) & 1] : e.est === 'dispara' ? B.dispara : e.mueve ? B.anda[(e.anim | 0) % 4] : B.anda[1];
    pintaSpr(g, e.flash > 1 ? B.dano : s, x, y, e.dir < 0, e.flash > 2);
    if (e.est === 'susto' || (e.est === 'apunta' && (e.t & 4))) escribe(g, '!', x, y - 52, { c: ROJO_ROTULO, alin: 'centro' });
  },
  dron(g, e, cx, cy) {
    const x = e.x - cx, y = e.y - cy;
    if (e.est === 'apunta' && (e.t & 2)) for (let v = y + 4; v < SUELO - cy; v += 5) rect(g, x, v, 1, 2, '#ff5a5a');   // avisa de dónde cae la flecha
    pintaSpr(g, e.flash > 1 ? SPR.dron.dano : SPR.dron.vuela[(e.t >> 2) % 4], x, y, e.dir < 0, e.flash > 2);
  },
  jefe(g, e, cx, cy) {
    const s = dibujoJefe(e), tiembla = e.est === 'muere' || (e.est === 'golpe' && e.t > 30 && e.t < 46) ? ((e.t & 1) ? 1 : -1) : 0, x = e.x - cx + tiembla, y = e.y - cy;
    pintaSpr(g, s, x, y, true, e.flash > 4);
    if (!e.tiro) return;
    // el rayo del ojo: primero una línea fina que parpadea y luego el rayo de verdad
    const [ox, oy] = puntoJefe(e, SPR.jefe.rayo[0], 'ojo'), gx = e.tiro.gx - cx, gy = SUELO - cy;
    if (!e.tiro.on) { if (e.t & 2) rayaPx(g, ox - cx, oy - cy, gx, gy, '#ff5a5a'); anilloPx(g, gx, gy, 5, 1, '#ff5a5a'); return; }
    for (const [d, c] of [[-3, '#c8201c'], [3, '#c8201c'], [-2, '#ff6a3c'], [2, '#ff6a3c'], [-1, '#ffd0a8'], [1, '#ffd0a8'], [0, '#ffffff']]) rayaPx(g, ox - cx, oy - cy + d, gx, gy + d, c);
    circuloPx(g, ox - cx, oy - cy, 5, '#ffffff');
  },
  caja(g, c, cx, cy) { pintaSpr(g, SPR.caja, c.x - cx, c.y + c.z - cy, false, c.flash > 1); },
  fan(g, c, cx, cy) {
    const N = SPR.fan, x = c.x - cx, y = c.y + c.z - cy;
    if (c.est === 'atado') pintaSpr(g, N.atado[(c.t >> 4) & 1], x, y);
    else if (c.est === 'celebra') pintaSpr(g, N.celebra[(c.t >> 3) & 1], x, y + 2 - ((c.t >> 3) & 1) * 3);
    else pintaSpr(g, N.corre[(c.anim | 0) % 4], x, y + 3, true);
  },
  mecha(g, c, cx, cy) { pintaSpr(g, SPR.mecha.quieta[(c.t >> 4) & 1], c.x - cx, c.y - cy, c.dir < 0); },
  vaca(g, c, cx, cy) { pintaSpr(g, SPR.vaca.corre[(c.anim | 0) % 4], c.x - cx, c.y - cy, c.dir < 0); },
  moneda(g, c, cx, cy) { if (c.t > 470 && (c.t & 2)) return; pintaSpr(g, SPR.moneda[((c.t >> 2) + c.f0) % 8], c.x - cx, c.y - cy); },
  premio(g, c, cx, cy) { if (c.t > 1050 && (c.t & 4)) return; pintaSpr(g, SPR.premio[c.que], c.x - cx, c.y - cy - (c.quieto ? Math.round(Math.abs(Math.sin(c.t * 0.07)) * 3) : 0)); },
};

function pintaMundo(g) {
  const W = J.W, H = J.H, tb = J.tiembla > 0 ? Math.min(3, 1 + (J.tiembla >> 3)) : 0;
  const cx = Math.round(acota(J.camX, 0, Math.max(0, NIVEL.largo - W))) + (tb ? Math.round(rand(-tb, tb)) : 0), cy = J.camY + (tb ? Math.round(rand(-tb, tb)) : 0);
  g.fillStyle = '#10141e'; g.fillRect(0, 0, W, H);
  /* ---------- el fondo ---------- */
  g.drawImage(NIVEL.lejos, -Math.round(cx * 0.2) - 8, 22 - cy);
  g.save(); g.translate(0, -cy); pintaReflejos(g, NIVEL.tramos, cx, W); g.restore();
  for (let k = Math.max(0, Math.floor(cx / TROZO)); k * TROZO < cx + W && k < NIVEL.trozos.length; k++) if (NIVEL.trozos[k]) g.drawImage(NIVEL.trozos[k], k * TROZO - cx, -cy);
  /* ---------- todo lo que pisa el suelo, de más lejos a más cerca ---------- */
  const L = J.estado === 'titulo' ? [JG] : [...J.cosas, ...J.enes, JG];
  L.sort((a, b) => (a.z || 0) - (b.z || 0));
  for (const o of L) {
    const r = RADIO_SOMBRA[o.tipo];
    if (!r || (o === JG && o.caos)) continue;
    const alto = SUELO - o.y, k = Math.max(0.35, 1 - alto / 130), rr = o === JG && o.mecha ? RADIO_SOMBRA.mecha : r;
    if (alto < 200) sombraSuelo(g, o.x - cx, SUELO + 1 + (o.z || 0) - cy, Math.round(rr * k), 3);
  }
  for (const e of J.fx) if (!e.capa) pintaFx(g, e, cx, cy);
  for (const o of L) PINTA[o.tipo](g, o, cx, cy);
  /* ---------- balas y disparos ---------- */
  for (const b of J.balas) {
    const x = b.x - cx, y = b.y - cy;
    if (b.tipo === 2) pintaSpr(g, SPR.bomba[(b.t >> 2) & 3], x, y, b.vx < 0);
    else if (b.tipo === 1) { if (b.vy) pintaSpr(g, giradoA(SPR.balaMecha, Math.atan2(b.vy, b.vx)), x, y); else pintaSpr(g, SPR.balaMecha, x - Math.sign(b.vx) * 4, y, b.vx < 0); }
    else if (b.vx && b.vy) { const l = Math.hypot(b.vx, b.vy); pintaSpr(g, giradoA(SPR.bala, Math.atan2(b.vy, b.vx)), x - b.vx / l * 11, y - b.vy / l * 11); }   // en diagonal: la bala girada
    else if (b.vy < 0) pintaSpr(g, SPR.balaArr, x, y + 11);
    else if (b.vy > 0) pintaSpr(g, SPR.balaAba, x, y - 11);
    else pintaSpr(g, SPR.bala, x - Math.sign(b.vx) * 11, y, b.vx < 0);
  }
  for (const b of J.tiros) {
    const x = b.x - cx, y = b.y - cy;
    if (b.tipo === 'grapa') { const s = b.vx < 0 ? 1 : -1; rect(g, Math.round(x) + (s > 0 ? 5 : -10), Math.round(y) - 1, 5, 1, '#8d97ac'); rect(g, Math.round(x) + (s > 0 ? 6 : -9), Math.round(y) + 1, 3, 1, '#5f687d'); pintaSpr(g, SPR.grapa, x, y, b.vx > 0); }
    else if (b.tipo === 'flecha') pintaSpr(g, SPR.flecha, x, y);
    else if (b.tipo === 'carta') pintaSpr(g, SPR.carta[(b.t >> 3) & 1], x, y, (b.t >> 4) & 1);
    else pintaSpr(g, SPR.onda[(b.t >> 2) & 1], x, y, (b.t >> 3) & 1);
  }
  for (const e of J.fx) if (e.capa) pintaFx(g, e, cx, cy);
  /* ---------- avisos sobre las cosas ---------- */
  if (J.estado !== 'titulo') for (const c of J.cosas) {
    if (c.tipo === 'fan' && c.est === 'atado' && Math.abs(JG.x - c.x) < 170 && c.t % 150 < 100) pintaBocadillo(g, c.t % 300 < 150 ? '¡AQUÍ!' : '¡SOCORRO!', Math.round(c.x - cx) + 2, c.y + c.z - cy - 33);
    else if (c.tipo === 'fan' && c.est === 'celebra' && c.t > 10) pintaBocadillo(g, '¡GRACIAS!', Math.round(c.x - cx) + 2, c.y + c.z - cy - 40);
    else if (c.tipo === 'mecha') pintaAviso(g, MANDO.tactil ? '¡SUBE!' : '¡SUBE! (SALTO)', Math.round(c.x - cx) + 2, c.y - cy - 90, J.t / 60);
  }
  for (const f of J.flotan) { if (f.t > (f.g ? 64 : 34) && (f.t & 2)) continue; escribe(g, tr(f.s), f.x - cx, f.y - cy, { alin: 'centro', c: f.c, fuente: f.g ? 'normal' : 'mini' }); }
  /* ---------- lo de delante del todo ---------- */
  for (const wx of [30, 880, 1900, 2950, 3800]) { const x = Math.round(wx - cx * 1.4); if (x > -70 && x < W + 70) pintaSpr(g, SPR.delante, x, 296 - cy); }
}

/* ---------- el marcador y lo que va encima de la partida ---------- */
function pintaRotulo(g) {
  const r = J.rotulo, W = J.W, ent = suaveSale(Math.min(1, r.t / 16)), sal = Math.min(1, Math.max(0, (r.dur - r.t) / 12));
  let y = 60;
  r.lineas.forEach(([s, c, esc], k) => {
    const lado = k % 2 ? 1 : -1, dx = Math.round((1 - ent) * lado * W - (1 - sal) * lado * W);
    escribe(g, tr(s), W / 2 + dx, y, { alin: 'centro', c, esc });
    y += 7 * esc + 9;
  });
}
function barraJefe(g) {
  const e = J.jefe, W = J.W, w = Math.min(170, W - 190), x = Math.round(W / 2 - w / 2), y = J.H - 13, v = Math.max(0, e.hp / JEFE_VIDA);
  escribe(g, 'SURVIVALBOT', W / 2, y - 9, { alin: 'centro', fuente: 'mini', c: ROJO_ROTULO });
  rect(g, x - 2, y - 2, w + 4, 9, TINTA); rect(g, x - 1, y - 1, w + 2, 7, '#ffd23c'); rect(g, x, y, w, 5, '#2a0d14');
  rect(g, x, y, Math.round(w * v), 5, e.flash > 4 ? '#ffffff' : '#e0283a'); rect(g, x, y, Math.round(w * v), 1, e.flash > 4 ? '#ffffff' : '#ff8a85');
  rect(g, x + (w >> 1), y, 1, 5, '#ffd23c');
}
function pintaHud(g) {
  const W = J.W, j = JG;
  pintaMarcador(g, W, { vidas: j.vidas, puntos: J.puntos, municion: j.arma ? j.municion : '∞', bombas: j.bombas, caos: J.caos, tiempo: J.tiempo, fans: J.fans, espectadores: genteChat(),
    chat: W >= 380 ? CHAT.lineas.map(l => [l.q, l.c, l.s]) : [] });
  if (J.caos >= 10 && (J.t & 16)) escribe(g, tr(MANDO.tactil ? '¡CAOS LISTO!' : '¡CAOS LISTO! (V)'), 128, 27, { fuente: 'mini', c: VIOLETA_ROTULO });
  if (j.mecha) { escribe(g, 'MECHAVACA', 5, 45, { fuente: 'mini', c: ROSA_ROTULO }); for (let k = 0; k < 3; k++) { rect(g, 54 + k * 8, 44, 7, 7, TINTA); rect(g, 55 + k * 8, 45, 5, 5, k < j.mecha.hp ? '#f07fb8' : '#3a2440'); } }
  if (J.jefe && J.jefe.est !== 'cae') barraJefe(g);
  if (J.adelante > 0 && (J.adelante & 16)) pintaAdelante(g, W - 16, 100, J.t / 60);
  if (J.rotulo && J.estado === 'juego') pintaRotulo(g);
  if (J.sello) { const s = J.sello < 6 ? 6 - J.sello : 0; pintaSpr(g, SPR.sello, W / 2 + (s & 1 ? s : -s), 92 - s * 3); }
  if (J.tinte > 0) { g.globalAlpha = Math.min(0.4, J.tinte / 50); g.fillStyle = '#8a2bff'; g.fillRect(0, 0, W, J.H); g.globalAlpha = 1; }
  if (J.flash > 0) { g.globalAlpha = Math.min(1, J.flash / 8); g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, J.H); g.globalAlpha = 1; }
}
// oscurece la pantalla (para las pantallas que van encima de la partida)
function velo(g, a) { g.globalAlpha = a; g.fillStyle = '#080a14'; g.fillRect(0, 0, J.W, J.H); g.globalAlpha = 1; }
function pinta() {
  const g = CTX;
  if (J.estado === 'carga') { pintaCarga(g); return; }
  pintaMundo(g);
  if (J.estado === 'titulo') { pintaTitulo(g); if (OPC.on) pintaOpciones(g); return; }
  pintaHud(g);
  if (J.estado === 'juego') pintaMandos(g);
  else if (J.estado === 'pausa') pintaPausa(g);
  else if (J.estado === 'fin') pintaFin(g);
  else if (J.estado === 'victoria') pintaVictoria(g);
  if (OPC.on) pintaOpciones(g);
}
