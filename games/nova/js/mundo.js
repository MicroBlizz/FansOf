// Fans of Nova · El mundo de la partida: mapa grande con asteroides (se comen), pecios, nidos que sueltan enemigos, capitanes que crecen,
// estaciones donde cambiar armas y el Rey de los huesos al final. Todo se coloca al empezar con el azar de la partida.
'use strict';
const NV_MUNDO = { asteroides: 130, pecios: 18, pecioRaro: 5, nidos: 9, capitanes: 4, estaciones: 5, nebulosas: 18, naves: 90 };

function nvGeneraMundo(S) {
  const R = NV_ARENA, puestos = [];
  // un sitio libre: a más de `sep` de lo ya colocado y a más de `minC` del centro (donde empiezas)
  const sitio = (minC, maxC, sep) => {
    for (let i = 0; i < 80; i++) {
      const a = Math.random() * 6.283, r = minC + Math.sqrt(Math.random()) * (maxC - minC), x = Math.cos(a) * r, y = Math.sin(a) * r;
      if (puestos.every(p => Math.hypot(p.x - x, p.y - y) > sep + p.r)) { puestos.push({ x, y, r: sep }); return { x, y }; }
    }
    return { x: 0, y: R * 0.5 };
  };
  S.pecios = []; S.estaciones = []; S.nebulosas = [];
  for (let i = 0; i < NV_MUNDO.estaciones; i++) { const p = i === 0 ? sitio(650, 900, 160) : sitio(900, R * 0.9, 600); S.estaciones.push({ x: p.x, y: p.y, r: 72, cd: 0 }); }
  for (let i = 0; i < NV_MUNDO.nidos; i++) { const p = sitio(1300, R * 0.95, 450); const e = nvEnemigo(S, 'nido', p.x, p.y); e.vivos = 0; e.cdNido = 2; }
  for (let i = 0; i < NV_MUNDO.capitanes; i++) { const p = sitio(1700, R * 0.9, 500); nvEnemigo(S, 'capitan', p.x, p.y); }
  for (let i = 0; i < NV_MUNDO.pecios; i++) { const p = sitio(450, R * 0.95, 140); S.pecios.push({ x: p.x, y: p.y, r: 34, rara: i < NV_MUNDO.pecioRaro, ang: Math.random() * 6.28 }); }
  for (let i = 0; i < NV_MUNDO.asteroides; i++) {
    const g = Math.random() < 0.35, p = g ? sitio(500, R, 60) : sitio(380, R, 60);
    nvAsteroide(S, p.x, p.y, 1);
  }
  // naves de todos los tamaños repartidas por el mapa: las grandes, lejos del centro
  for (let i = 0; i < NV_MUNDO.naves; i++) {
    const f = Math.random(), p = sitio(500, R, 120), d = Math.hypot(p.x, p.y) / R, rango = Math.max(1, Math.min(32, Math.round(1 + d * 24 * (0.35 + f * 0.9))));
    const e = nvEnemigo(S, f < 0.55 ? 'rastrero' : f < 0.85 ? 'fusilero' : 'sepulturero', p.x, p.y, rango); e.errante = 1;
  }
  const cols = ['#3b2a8c', '#1d5a8c', '#7a2a6a', '#1f6b5a'];
  for (let i = 0; i < NV_MUNDO.nebulosas; i++) S.nebulosas.push({ x: (Math.random() * 2 - 1) * R, y: (Math.random() * 2 - 1) * R, r: 300 + Math.random() * 500, col: cols[i % cols.length] });
}

function nvAsteroide(S, x, y, k) {
  const e = nvEnemigo(S, 'asteroide', x, y);
  e.r = (20 + Math.random() * 30) * k; e.hp = e.hpMax = Math.round(e.r * 2.2); e.valor = Math.round(e.r / 3); e.d = Object.assign({}, e.d, { chat: e.valor }); e.ang = Math.random() * 6.28; e.forma = Math.random();
  return e;
}
// El sector no se vacía: lo que comes, recoges o destruyes vuelve a aparecer fuera de la pantalla, a tu escala
// (asteroides más grandes y naves errantes de un rango parecido al tuyo). Las estaciones aumentan con el tamaño del sector.
function nvRepuebla(S, dt) {
  if ((S.cdRelleno = (S.cdRelleno || 0) - dt) > 0) return;
  S.cdRelleno = 1.5;
  const n = S.nave, [hw, hh] = nvMediaPantalla(S), dmin = Math.hypot(hw, hh) * 1.3, dmax = Math.max(dmin + 200, nvLado(S) / 2 * 0.95);
  const fuera = () => { const a = Math.random() * 6.283, r = dmin + Math.random() * (dmax - dmin); return [n.x + Math.cos(a) * r, n.y + Math.sin(a) * r]; };
  const cuenta = f => S.enem.reduce((s, e) => s + (!e.muerto && f(e) ? 1 : 0), 0);
  const k = Math.pow(nvFactor(n.rango), 0.8);
  const nA = cuenta(e => e.tipo === 'asteroide'), nN = cuenta(e => e.errante);   // pocos por tanda: va llenando sin picos
  for (let i = nA; i < Math.min(NV_MUNDO.asteroides, nA + 6); i++) { const [x, y] = fuera(); nvAsteroide(S, x, y, k); }
  for (let i = nN; i < Math.min(NV_MUNDO.naves, nN + 3); i++) {
    const [x, y] = fuera(), f = Math.random(), rango = Math.max(1, n.rango + Math.round(Math.random() * 7 - 4));
    nvEnemigo(S, f < 0.55 ? 'rastrero' : f < 0.85 ? 'fusilero' : 'sepulturero', x, y, rango).errante = 1;
  }
  if (cuenta(e => e.d.nido) < NV_MUNDO.nidos) { const [x, y] = fuera(), e = nvEnemigo(S, 'nido', x, y, Math.max(1, n.rango - 2)); e.vivos = 0; e.cdNido = 2; }
  if (S.pecios.length < NV_MUNDO.pecios) { const [x, y] = fuera(); S.pecios.push({ x, y, r: 34 * k, rara: Math.random() < 0.15, ang: Math.random() * 6.28 }); }
  const est = Math.min(12, Math.round(NV_MUNDO.estaciones * Math.pow(nvLado(S) / (2 * NV_ARENA), 1.2)));
  if (S.estaciones.length < est) { const [x, y] = fuera(); S.estaciones.push({ x, y, r: 72, cd: 0 }); }
}
// Cada fotograma: los nidos sueltan enemigos si estás cerca, los pecios se recogen y las estaciones se abren al tocarlas.
function nvMundo(S, dt) {
  const n = S.nave;
  nvRepuebla(S, dt);
  for (const e of S.enem) {
    if (!e.d.nido || e.muerto) continue;
    const d = Math.hypot(n.x - e.x, n.y - e.y);
    if (d > 1100) continue;
    e.cdNido -= dt;
    if (e.cdNido <= 0) {
      e.cdNido = 3.4;
      const vivos = S.enem.filter(o => !o.muerto && o.nido === e).length;
      if (vivos < 8) for (let i = 0; i < 2; i++) { const a = Math.random() * 6.283, o = nvEnemigo(S, Math.random() < 0.25 ? 'fusilero' : 'rastrero', e.x + Math.cos(a) * (e.r + 10), e.y + Math.sin(a) * (e.r + 10), e.rango); o.nido = e; }
    }
  }
  for (let i = S.pecios.length - 1; i >= 0; i--) {
    const p = S.pecios[i];
    if (Math.hypot(n.x - p.x, n.y - p.y) > p.r + n.r) continue;
    S.pecios.splice(i, 1);
    nvChatarra(S, p.x, p.y, Math.round(40 * Math.pow(1.2, n.rango - 1))); n.hp = Math.min(n.hpMax, n.hp + n.hpMax * 0.1);
    S.nums.push({ x: p.x, y: p.y - 20, t: 1.2, txt: tr(p.rara ? '¡Pecio raro!' : 'Pecio'), color: '#6fe3ff', g: 1 });
    if (p.rara) nvAbrirCartas(S);
  }
  for (const st of S.estaciones) {
    if (st.cd > 0) { st.cd -= dt; continue; }
    if (S.estado === 'juego' && Math.hypot(n.x - st.x, n.y - st.y) < st.r + n.r * 0.6) { S.estado = 'estacion'; S.est = st; S.estVista = null; nvSnd('nvEstacion', S); }
  }
}
