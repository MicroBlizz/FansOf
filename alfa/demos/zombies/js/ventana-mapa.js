// Fans of Zombies · EL MAPA (pantalla): con la M se abre un plano del distrito visto desde arriba. Solo se ve lo que ya has explorado
// (lo demás, en niebla). Paredes y obstáculos, los edificios en los que se entra, los nombres de las zonas, los bidones con fuego, los
// sitios que ya has registrado, las ventanas con tablas y tú (la flecha). Las paredes se pintan una vez; lo demás, al abrirlo.
'use strict';
const VMAPA = { abierto: false, base: null, escala: 3 };
const ZONAS_MAPA = [['CIUDAD DE RATKOV', 0, -10], ['BARRIO RESIDENCIAL', -146, -10], ['POLÍGONO', -160, 130], ['ZONA COMERCIAL', -45, 130], ['AFUERAS', 45, 130]];
// el dibujo fijo: suelo, paredes y edificios (3 px por metro)
function baseMapa() {
  const X = ZOM.AJ.explorado, k = VMAPA.escala, W = X.w * X.celda * k, H = X.h * X.celda * k;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d'), px = (x) => (x - X.x0) * k, pz = (z) => (z - X.z0) * k;
  g.fillStyle = '#d8dee6'; g.fillRect(0, 0, W, H);
  for (const C of BARRIO.casas) { g.fillStyle = C.tipo === 'edificio' ? '#c8b8a0' : '#b8c0cc'; g.fillRect(px(C.x0), pz(C.z0), (C.x1 - C.x0) * k, (C.z1 - C.z0) * k); }
  for (const s of MAPA.solidos) {
    g.fillStyle = s.tipo === 'bajo' ? '#8a929c' : s.tipo === 'poste' ? '#6a727c' : '#3a4048';
    g.fillRect(px(s.x0), pz(s.z0), Math.max(1, (s.x1 - s.x0) * k), Math.max(1, (s.z1 - s.z0) * k));
  }
  VMAPA.base = c;
}
function abreMapa() {
  if (JUEGO.e.planta) { avisa(tr('Dentro de la torre no hay mapa del distrito: busca las escaleras.')); return; }
  if (!VMAPA.base) baseMapa();
  VMAPA.abierto = true;
  el('zb-mapa').hidden = false;
  el('zb-mapa').innerHTML = '<div class="zm-marco"><header><b>' + esc(tr('MAPA DEL DISTRITO')) + '</b><span>' + esc(tr('Solo lo que ya has visto')) + '</span><button id="zm-cerrar">' + esc(tr('CERRAR (M)')) + '</button></header>' +
    '<canvas id="zm-lienzo"></canvas><footer><i class="t"></i>' + esc(tr('tú')) + '<i class="f"></i>' + esc(tr('fuego')) + '<i class="r"></i>' + esc(tr('registrado')) + '<i class="s"></i>' + esc(tr('sin registrar')) + '<i class="b"></i>' + esc(tr('con tablas')) + '</footer></div>';
  el('zm-cerrar').onclick = cierraMapa;
  pintaMapa();
}
function cierraMapa() { VMAPA.abierto = false; el('zb-mapa').hidden = true; }
function pintaMapa() {
  const e = JUEGO.e, AJ = ZOM.AJ, X = AJ.explorado, k = VMAPA.escala, cv = el('zm-lienzo'); if (!cv) return;
  cv.width = VMAPA.base.width; cv.height = VMAPA.base.height;
  const g = cv.getContext('2d'), px = (x) => (x - X.x0) * k, pz = (z) => (z - X.z0) * k, visto = (x, z) => ZOM.visto(AJ, e, x, z);
  g.drawImage(VMAPA.base, 0, 0);
  g.font = 'bold 26px "Russo One", sans-serif'; g.textAlign = 'center'; g.fillStyle = 'rgba(40,46,56,.55)';
  for (const [n, x, z] of ZONAS_MAPA) if (visto(x, z)) g.fillText(tr(n), px(x), pz(z));
  const punto = (x, z, color, r) => { if (!visto(x, z)) return; g.fillStyle = color; g.beginPath(); g.arc(px(x), pz(z), r, 0, 7); g.fill(); };
  for (const s of sitiosRegistrables(e)) punto(s.x, s.z, s.tipo === 'fuego' ? '#ff8a2a' : e.registrados[s.id] ? '#8a929c' : '#e8c040', s.tipo === 'fuego' ? 5 : 3);
  for (const H of BARRIO.huecos) { const h = e.huecos[H.id]; if (h && h.tablas) punto(H.x, H.z, '#a0602a', 4); }
  // la niebla en lo que no has visto
  g.fillStyle = 'rgba(18,22,30,.92)';
  for (let j = 0; j < X.h; j++) for (let i = 0; i < X.w; i++) if (!e.explorado || !e.explorado[j * X.w + i]) g.fillRect(i * X.celda * k, j * X.celda * k, X.celda * k + 1, X.celda * k + 1);
  // tú: una flecha hacia donde miras
  const J = e.jugador; g.save(); g.translate(px(J.x), pz(J.z)); g.rotate(-J.a + Math.PI);
  g.fillStyle = '#ff7a1a'; g.strokeStyle = '#1a0e04'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, -12); g.lineTo(8, 8); g.lineTo(0, 4); g.lineTo(-8, 8); g.closePath(); g.fill(); g.stroke(); g.restore();
}
// cada fotograma: M abre o cierra; mientras está abierto se repinta de vez en cuando (tú te mueves y el mundo sigue)
function vigilaMapa(dt) {
  if (pulsa('mapa')) { if (VMAPA.abierto) cierraMapa(); else abreMapa(); }
  if (VMAPA.abierto && (VMAPA.t = (VMAPA.t || 0) - dt) <= 0) { VMAPA.t = 0.5; pintaMapa(); }
}
