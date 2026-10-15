// Fans of Nova · El mundo de la partida: mapa grande con asteroides (se comen), pecios, nidos que sueltan enemigos, capitanes que crecen,
// estaciones donde cambiar armas y el Rey de los huesos al final. Todo se coloca al empezar con el azar de la partida.
'use strict';
const NV_MUNDO = { asteroides: 130, pecios: 18, pecioRaro: 5, nidos: 9, capitanes: 4, estaciones: 5, nebulosas: 18 };

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
    const g = Math.random() < 0.35, p = g ? sitio(500, R, 60) : sitio(380, R, 60), e = nvEnemigo(S, 'asteroide', p.x, p.y);
    e.r = 20 + Math.random() * 30; e.hp = e.hpMax = Math.round(e.r * 2.2); e.valor = Math.round(e.r / 3); e.d = Object.assign({}, e.d, { chat: e.valor }); e.ang = Math.random() * 6.28; e.forma = Math.random();
  }
  const cols = ['#3b2a8c', '#1d5a8c', '#7a2a6a', '#1f6b5a'];
  for (let i = 0; i < NV_MUNDO.nebulosas; i++) S.nebulosas.push({ x: (Math.random() * 2 - 1) * R, y: (Math.random() * 2 - 1) * R, r: 300 + Math.random() * 500, col: cols[i % cols.length] });
}

// Cada fotograma: los nidos sueltan enemigos si estás cerca, los pecios se recogen y las estaciones se abren al tocarlas.
function nvMundo(S, dt) {
  const n = S.nave;
  for (const e of S.enem) {
    if (!e.d.nido || e.muerto) continue;
    const d = Math.hypot(n.x - e.x, n.y - e.y);
    if (d > 1100) continue;
    e.cdNido -= dt;
    if (e.cdNido <= 0) {
      e.cdNido = 3.4;
      const vivos = S.enem.filter(o => !o.muerto && o.nido === e).length;
      if (vivos < 8) for (let i = 0; i < 2; i++) { const a = Math.random() * 6.283, o = nvEnemigo(S, Math.random() < 0.25 ? 'fusilero' : 'rastrero', e.x + Math.cos(a) * (e.r + 10), e.y + Math.sin(a) * (e.r + 10)); o.nido = e; }
    }
  }
  for (let i = S.pecios.length - 1; i >= 0; i--) {
    const p = S.pecios[i];
    if (Math.hypot(n.x - p.x, n.y - p.y) > p.r + n.r) continue;
    S.pecios.splice(i, 1);
    nvChatarra(S, p.x, p.y, 40); n.hp = Math.min(n.hpMax, n.hp + n.hpMax * 0.1);
    S.nums.push({ x: p.x, y: p.y - 20, t: 1.2, txt: tr(p.rara ? '¡Pecio raro!' : 'Pecio'), color: '#6fe3ff', g: 1 });
    if (p.rara) nvAbrirCartas(S);
  }
  for (const st of S.estaciones) {
    if (st.cd > 0) { st.cd -= dt; continue; }
    if (S.estado === 'juego' && Math.hypot(n.x - st.x, n.y - st.y) < st.r + n.r * 0.6) { S.estado = 'estacion'; S.est = st; S.estVista = null; }
  }
}
