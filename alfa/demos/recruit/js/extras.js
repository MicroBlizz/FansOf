// Fans of Recruit · LOS DIBUJOS SUELTOS de la partida: balas, fogonazos, monedas, casquillos, polvo, humo, trozos, folios, la
// flecha roja de los drones, el proyectil de la MechaVaca, la onda del golpe del jefe, el sello de «CANCELADO» y la planta de
// delante. Se hacen una vez al arrancar (creaSueltos) y la partida solo los pega donde toca.
'use strict';

// un dibujo girado un cuarto de vuelta (n = 1: lo que miraba a la derecha mira abajo; n = -1: mira arriba). No pierde píxeles
function giraSpr(s, n) {
  const c = lienzoNuevo(s.h, s.w), g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  if (n > 0) { g.translate(s.h, 0); g.rotate(Math.PI / 2); } else { g.translate(0, s.w); g.rotate(-Math.PI / 2); }
  g.drawImage(s.c, 0, 0);
  return { c, b: c, w: s.h, h: s.w, ox: n > 0 ? s.h - s.oy : s.oy, oy: n > 0 ? s.ox : s.w - s.ox };
}
// un dibujo girado un ángulo cualquiera alrededor de su origen (sin suavizar: sigue siendo pixel art). Se guarda en 32 giros
function giradoA(s, a) {
  const n = ((Math.round(a / (Math.PI / 16)) % 32) + 32) % 32;
  s.giros = s.giros || [];
  if (s.giros[n]) return s.giros[n];
  const R = Math.ceil(Math.hypot(Math.max(s.ox, s.w - s.ox), Math.max(s.oy, s.h - s.oy))) + 1, c = lienzoNuevo(R * 2, R * 2), g = c.getContext('2d');
  g.imageSmoothingEnabled = false; g.translate(R, R); g.rotate(n * Math.PI / 16); g.drawImage(s.c, -s.ox, -s.oy);
  return (s.giros[n] = { c, b: c, ox: R, oy: R, w: R * 2, h: R * 2 });
}
function creaSueltos() {
  const R = SPR;
  R.bala = fotoBala(); R.balaArr = giraSpr(R.bala, -1); R.balaAba = giraSpr(R.bala, 1);
  R.fogonazo = [0, 1, 2].map(fotoFogonazo); R.fogonazoArr = R.fogonazo.map(s => giraSpr(s, -1)); R.fogonazoAba = R.fogonazo.map(s => giraSpr(s, 1));
  R.impacto = [0, 1].map(fotoImpacto);
  R.casquillo = [0, 1, 2, 3].map(fotoCasquillo);
  R.grapa = fotoGrapa();
  R.moneda = [0, 1, 2, 3, 4, 5, 6, 7].map(fotoMoneda);
  R.chispa = [0, 1, 2].map(k => fotoChispa(k));
  R.destello = [R.chispa[1], R.chispa[2], R.chispa[1], R.chispa[0]];
  R.polvo = [0.05, 0.3, 0.55, 0.8].map(t => fotoNubecilla(t, 5, 3));
  R.humo = [0.05, 0.3, 0.55, 0.8].map(t => fotoNubecilla(t, 5, 11, true));
  R.trozo = [0, 1, 2, 3].map(k => fotoTrozo(k, k * 0.9 + 0.3));
  R.folio = [['aire', 0.5], ['doblado', -0.5], ['aire', 1.3], ['doblado', 2.2], ['aire', -0.9]].map(([m, a]) => { const p = new Pincel(13, 13, 6, 6); folio(p, 0, 0, m, a); return p.lienzo(); });
  { const p = new Pincel(14, 6, 7, 5); folio(p, 0, 0, 'suelo'); R.folioSuelo = apagaSpr(p.lienzo(), AIRE, 0.25); }
  { const p = new Pincel(24, 22, 10, 20); cartelMojado(p, 0, 0); R.mojado = p.lienzo(); }
  R.taza = fotoTazaVolando();
  // la flecha roja de los KPIs que sueltan los drones (apunta hacia abajo; la punta cae en sus pies)
  { const p = new Pincel(15, 17, 7, 15), f = F.pol(-2.4, -14, 2.4, -14, 2.4, -7, 6, -7, 0, 0, -6, -7, -2.4, -7);
    p.parte(f, MAT.rojo, { r: 2.4, sombra: 0 }); p.tonoPx(-1.5, -12.5, 2); p.tonoPx(-1.5, -11.5, 1); R.flecha = p.lienzo(); }
  // el proyectil del cañón de la MechaVaca: una bola de plasma rosa (hacia la derecha)
  { const p = new Pincel(19, 11, 9, 5), C = MAT.mecha.c;
    p.plano(F.ov(0.5, 0.5, 8.4, 4.6), C[1]); p.plano(F.ov(1.5, 0.5, 7, 3.6), C[3]); p.plano(F.ov(3, 0.5, 5, 2.6), C[5]); p.plano(F.ov(4, 0.5, 3, 1.4), '#ffffff'); R.balaMecha = p.lienzo(); }
  // la onda del golpe del jefe: una llamarada que corre por el suelo (2 dibujos; los pies, en el suelo)
  R.onda = [1, 0].map(k => giraSpr(fotoFogonazo(k), -1));
  // el sello rojo de «CANCELADO»
  { const s = tr('CANCELADO'), w = anchoTexto(s, 3) + 18, h = 37, c = lienzoNuevo(w, h), g = c.getContext('2d'), rojo = '#e0283a';
    rect(g, 0, 0, w, h, TINTA); rect(g, 1, 1, w - 2, h - 2, rojo); rect(g, 4, 4, w - 8, h - 8, TINTA); g.clearRect(5, 5, w - 10, h - 10);
    g.globalAlpha = 0.5; rect(g, 5, 5, w - 10, h - 10, '#2a0a12'); g.globalAlpha = 1;
    escribe(g, s, 9, 8, { esc: 3, c: ['#ff8a85', rojo, '#a01426'] });
    R.sello = { c, b: c, ox: w >> 1, oy: h >> 1, w, h }; }
  // lo de delante del todo: un ficus enorme, casi a contraluz
  { const p = new Pincel(120, 120, 60, 116, { sx: 2.3, sy: 2.3 }); plantaFicus(p, 0, 0, 5, 30); R.delante = apagaSpr(p.lienzo(), '#0c1220', 0.62); }
}
function creaExplosiones() { SPR.boom2 = creaExplosion(13, 7, 12); SPR.boom = creaExplosion(25, 3, 14); }
function creaExplosionGrande() { SPR.boom3 = creaExplosion(36, 5, 14); }
