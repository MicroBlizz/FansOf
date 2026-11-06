// Fans of Zombies · EL MAPA (pantalla): con la M se abre un plano de lo que tienes alrededor (320 x 210 m, centrado en ti), visto desde arriba. Solo se ve lo que ya has explorado
// (lo demás, en niebla). Paredes y obstáculos, los edificios en los que se entra, los nombres de las zonas, los bidones con fuego, los
// sitios que ya has registrado, las ventanas con tablas y tú (la flecha). Las paredes se pintan una vez; lo demás, al abrirlo.
'use strict';
const VMAPA = { abierto: false, base: null, escala: 3, ancho: 320, alto: 210, planes: new Map(), semilla: null };
const ZONAS_MAPA = [['CIUDAD DE RATKOV', 0, -10], ['BARRIO RESIDENCIAL', -146, -10], ['POLÍGONO', -160, 130], ['ZONA COMERCIAL', -45, 130], ['AFUERAS', 45, 130]];
const NOMBRE_TROZO = { barrio: 'BARRIO', comercial: 'TIENDAS', poligono: 'POLÍGONO', granja: 'GRANJA', bosque: 'BOSQUE' };
const CENTRO_MAPA = { x0: -214, z0: -66, x1: 90, z1: 196 };
// el dibujo fijo del distrito hecho a mano: suelo, paredes y edificios (3 px por metro). Los trozos se pintan de su plan
function baseMapa() {
  const C = CENTRO_MAPA, k = VMAPA.escala, c = document.createElement('canvas'); c.width = (C.x1 - C.x0) * k; c.height = (C.z1 - C.z0) * k;
  const g = c.getContext('2d'), px = (x) => (x - C.x0) * k, pz = (z) => (z - C.z0) * k, dentro = (r) => r.x0 >= C.x0 && r.x1 <= C.x1 && r.z0 >= C.z0 && r.z1 <= C.z1;
  g.fillStyle = '#d8dee6'; g.fillRect(0, 0, c.width, c.height);
  for (const R of BARRIO.casas) if (dentro(R)) { g.fillStyle = R.tipo ? '#c8b8a0' : '#b8c0cc'; g.fillRect(px(R.x0), pz(R.z0), (R.x1 - R.x0) * k, (R.z1 - R.z0) * k); }
  for (const s of MAPA.solidos) {
    if (!dentro(s)) continue;
    g.fillStyle = s.tipo === 'bajo' ? '#8a929c' : s.tipo === 'poste' ? '#6a727c' : '#3a4048';
    g.fillRect(px(s.x0), pz(s.z0), Math.max(1, (s.x1 - s.x0) * k), Math.max(1, (s.z1 - s.z0) * k));
  }
  VMAPA.base = c;
}
// el plan de un trozo (se guarda para no recalcularlo en cada repintado)
function planMapa(ci, cj) {
  const e = JUEGO.e, k = ZOM.claveTrozo(ci, cj);
  if (VMAPA.semilla !== e.semilla) { VMAPA.planes.clear(); VMAPA.semilla = e.semilla; }
  if (!VMAPA.planes.has(k)) VMAPA.planes.set(k, ZOM.planTrozo(ZOM.AJ, e.semilla, ci, cj));
  return VMAPA.planes.get(k);
}
// un trozo en el mapa: calles, campos, edificios y árboles
function pintaTrozoMapa(g, P, px, pz, k) {
  for (const c of P.calles) { g.fillStyle = c.tierra ? '#b8a88e' : '#8a8e96'; if (c.eje === 'x') g.fillRect(px(c.a), pz(c.fijo - c.ancho / 2), (c.b - c.a) * k, c.ancho * k); else g.fillRect(px(c.fijo - c.ancho / 2), pz(c.a), c.ancho * k, (c.b - c.a) * k); }
  g.fillStyle = '#a89878'; for (const c of P.campos) g.fillRect(px(c.x0), pz(c.z0), (c.x1 - c.x0) * k, (c.z1 - c.z0) * k);
  for (const c of [...P.casas, ...P.edificios]) { g.fillStyle = c.tipo ? '#c8b8a0' : '#b8c0cc'; g.fillRect(px(c.cx - c.w / 2), pz(c.cz - c.d / 2), c.w * k, c.d * k); g.strokeStyle = '#3a4048'; g.lineWidth = 2; g.strokeRect(px(c.cx - c.w / 2), pz(c.cz - c.d / 2), c.w * k, c.d * k); }
  g.fillStyle = '#5a6a5a'; for (const a of P.arboles) { g.beginPath(); g.arc(px(a.x), pz(a.z), 2.5, 0, 7); g.fill(); }
}
function abreMapa() {
  if (JUEGO.e.planta) { avisa(tr('Dentro de la torre no hay mapa del distrito: busca las escaleras.')); return; }
  if (!VMAPA.base) baseMapa();
  VMAPA.abierto = true;
  el('zb-mapa').hidden = false;
  el('zb-mapa').innerHTML = '<div class="zm-marco"><header><b>' + esc(tr('MAPA')) + '</b><span>' + esc(tr('Solo lo que ya has visto')) + '</span><button id="zm-cerrar">' + esc(tr('CERRAR (M)')) + '</button></header>' +
    '<canvas id="zm-lienzo"></canvas><footer><i class="t"></i>' + esc(tr('tú')) + '<i class="f"></i>' + esc(tr('fuego')) + '<i class="r"></i>' + esc(tr('registrado')) + '<i class="s"></i>' + esc(tr('sin registrar')) + '<i class="b"></i>' + esc(tr('con tablas')) + '</footer></div>';
  el('zm-cerrar').onclick = cierraMapa;
  pintaMapa();
}
function cierraMapa() { VMAPA.abierto = false; el('zb-mapa').hidden = true; }
function pintaMapa() {
  const e = JUEGO.e, AJ = ZOM.AJ, X = AJ.explorado, k = VMAPA.escala, cv = el('zm-lienzo'); if (!cv) return;
  const J = e.jugador, ox = J.x - VMAPA.ancho / 2, oz = J.z - VMAPA.alto / 2;
  cv.width = VMAPA.ancho * k; cv.height = VMAPA.alto * k;
  const g = cv.getContext('2d'), px = (x) => (x - ox) * k, pz = (z) => (z - oz) * k, visto = (x, z) => ZOM.visto(AJ, e, x, z);
  g.fillStyle = '#d8dee6'; g.fillRect(0, 0, cv.width, cv.height);
  g.drawImage(VMAPA.base, px(CENTRO_MAPA.x0), pz(CENTRO_MAPA.z0));
  // los trozos del mundo que caen en la ventana
  const a = ZOM.trozoDe(AJ, ox, oz), b = ZOM.trozoDe(AJ, ox + VMAPA.ancho, oz + VMAPA.alto), nombres = [];
  for (let ci = a.ci; ci <= b.ci; ci++) for (let cj = a.cj; cj <= b.cj; cj++) {
    if (ZOM.todoCentro(AJ, ZOM.rectTrozo(AJ, ci, cj))) continue;
    const P = planMapa(ci, cj); pintaTrozoMapa(g, P, px, pz, k);
    const r = P.rect; nombres.push([NOMBRE_TROZO[P.tipo], (r.x0 + r.x1) / 2 + 16, (r.z0 + r.z1) / 2 + 16]);
  }
  g.font = 'bold 26px "Russo One", sans-serif'; g.textAlign = 'center'; g.fillStyle = 'rgba(40,46,56,.55)';
  for (const [n, x, z] of ZONAS_MAPA) if (visto(x, z)) g.fillText(tr(n), px(x), pz(z));
  g.font = 'bold 18px "Russo One", sans-serif';
  for (const [n, x, z] of nombres) if (visto(x, z)) g.fillText(tr(n), px(x), pz(z));
  const punto = (x, z, color, r) => { if (!visto(x, z)) return; g.fillStyle = color; g.beginPath(); g.arc(px(x), pz(z), r, 0, 7); g.fill(); };
  for (const s of sitiosRegistrables(e)) punto(s.x, s.z, s.tipo === 'fuego' ? '#ff8a2a' : e.registrados[s.id] ? '#8a929c' : '#e8c040', s.tipo === 'fuego' ? 5 : 3);
  for (const H of BARRIO.huecos) { const h = e.huecos[H.id]; if (h && h.tablas) punto(H.x, H.z, '#a0602a', 4); }
  // la niebla en lo que no has visto (casillas de 8 m)
  g.fillStyle = 'rgba(18,22,30,.92)';
  const c0 = Math.floor(ox / X.celda), c1 = Math.floor((ox + VMAPA.ancho) / X.celda), f0 = Math.floor(oz / X.celda), f1 = Math.floor((oz + VMAPA.alto) / X.celda);
  for (let j = f0; j <= f1; j++) for (let i = c0; i <= c1; i++) if (!(e.vistos && e.vistos[i + ',' + j])) { const x = Math.floor(px(i * X.celda)), z = Math.floor(pz(j * X.celda)); g.fillRect(x, z, Math.floor(px((i + 1) * X.celda)) - x, Math.floor(pz((j + 1) * X.celda)) - z); }
  // tú: una flecha en el centro, hacia donde miras
  g.save(); g.translate(px(J.x), pz(J.z)); g.rotate(-J.a + Math.PI);
  g.fillStyle = '#ff7a1a'; g.strokeStyle = '#1a0e04'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, -12); g.lineTo(8, 8); g.lineTo(0, 4); g.lineTo(-8, 8); g.closePath(); g.fill(); g.stroke(); g.restore();
}
// cada fotograma: M abre o cierra; mientras está abierto se repinta de vez en cuando (tú te mueves y el mundo sigue)
function vigilaMapa(dt) {
  if (pulsa('mapa')) { if (VMAPA.abierto) cierraMapa(); else abreMapa(); }
  if (VMAPA.abierto && (VMAPA.t = (VMAPA.t || 0) - dt) <= 0) { VMAPA.t = 0.5; pintaMapa(); }
}
