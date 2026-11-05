// Fans of Nova · Habilidad activa en la partida (adaptador de NV.Habilidad, dominio/habilidad.js): qué hace cada una sobre la partida,
// el botón para el pulgar libre (y la barra espaciadora), el bot de pruebas y su dibujo. Datos: datos-habilidades.js.
// Diseño: docs/nova/habilidad-activa.md.
'use strict';

// La de tu campaña; en el simulador (sin campaña), la de la facción del casco
function nvHabInicio(S) {
  S.habFac = (NVP.camp && NVP.camp.faccion) || S.faccion;
  S.hab = NV.Habilidad.nueva(NOVA_HABILIDADES, S.habFac);
  S.espiritus = [];
}
function nvHabLista(S) { return NV.Habilidad.lista(S.hab, NOVA_HABILIDADES, S.nave.rango); }
function nvHabActua(S, id) { return NV.Habilidad.actua(S.hab, id); }

// Ganchos que miran otras partes de la partida (todo vale 1 o false si no hay habilidad actuando)
function nvHabProtege(S) { return nvHabActua(S, 'plasma') || nvHabActua(S, 'estampida'); }   // enemigos.js: nvDanoNave
function nvHabOculto(S) { return nvHabActua(S, 'radar'); }                                     // enemigos.js: no te apuntan
function nvHabLento(S) { return nvHabActua(S, 'bullettime') ? S.hab.efecto.lento : 1; }        // partida.js: enemigos y sus balas
function nvHabVel(S) { return nvHabActua(S, 'estampida') ? S.hab.efecto.vel : 1; }             // partida.js: nvMueve

// Usarla (botón, espacio o bot): el efecto empieza y, la primera vez, sale su aviso
function nvHabUsa(S) {
  if (!S || S.estado !== 'juego') return false;
  const def = NV.Habilidad.usa(S.hab, NOVA_HABILIDADES, S.nave.rango, Math.random, NOVA_HABILIDADES.facciones);
  if (!def) return false;
  const efecto = NV_HAB_EFECTO[def.id];
  if (efecto && efecto.empieza) efecto.empieza(S, def);
  S.aviso = { t: 1.6, txt: tr(def.nombre) + '!' };
  nvSnd('nvHabilidad', S);
  nvGuion(S, 'habilidad');
  if (typeof nvTuto === 'function') nvTuto('habilidad');
  return true;
}
function nvHabPaso(S, dt) {
  if (!S.hab) return;
  if (NVP.teclas[' '] && nvHabLista(S)) nvHabUsa(S);
  if (NVP.auto && nvHabLista(S) && nvHabBotQuiere(S)) nvHabUsa(S);
  const efecto = S.hab.activa > 0 && NV_HAB_EFECTO[S.hab.efecto.id];
  if (efecto && efecto.paso) efecto.paso(S, S.hab.efecto, dt);
  const fin = NV.Habilidad.paso(S.hab, dt);
  if (fin && NV_HAB_EFECTO[fin.id] && NV_HAB_EFECTO[fin.id].acaba) NV_HAB_EFECTO[fin.id].acaba(S, fin);
}
// El bot la usa cuando tiene enemigos armados cerca (para que el balance la mida)
function nvHabBotQuiere(S) {
  const n = S.nave, R = 450 * nvFactor(n.rango);
  return S.enem.some(e => !e.muerto && !e.d.pasivo && Math.hypot(e.x - n.x, e.y - n.y) < R + e.r);
}

// ---------- qué hace cada una ----------
const nvHabCerca = (S, R, conJefes) => { const n = S.nave; return S.enem.filter(e => !e.muerto && !e.d.pasivo && (conJefes || !e.d.jefe) && Math.hypot(e.x - n.x, e.y - n.y) < R + e.r); };
const nvHabArma = carga => ({ portador: 'drones', carga, tam: 'M', fusion: null, nivel: 0, cara: 'proa' });
function nvHabDanoBase(S) { const w = S.nave.armas.find(x => x.portador !== 'defensa'); return w ? nvDanoArma(w) : 10; }
const NV_HAB_EFECTO = {
  estampida: {
    empieza: S => { S.hab.tocados = []; },
    paso: (S, d) => {
      const n = S.nave;
      for (const e of S.enem) {
        if (e.muerto || e.d.pasivo || S.hab.tocados.includes(e) || Math.hypot(e.x - n.x, e.y - n.y) > n.r + e.r) continue;
        S.hab.tocados.push(e);
        nvGolpe(S, e, nvHabDanoBase(S) * d.dano, nvHabArma('cinetica'), e.x, e.y, 1, true);
      }
    },
  },
  legion: {
    empieza: (S, d) => { const n = S.nave; S.espiritus = []; for (let i = 0; i < d.espiritus; i++) S.espiritus.push({ x: n.x, y: n.y, a: i * 6.283 / d.espiritus, cd: i * d.cada / d.espiritus }); },
    paso: (S, d, dt) => {
      const n = S.nave, kf = nvFactor(n.rango), R = d.alcance * kf;
      for (const s of S.espiritus) {
        s.a += dt * 2.2; s.x = n.x + Math.cos(s.a) * 90 * n.escala; s.y = n.y + Math.sin(s.a) * 90 * n.escala;
        if ((s.cd -= dt) > 0) continue;
        const obj = nvHabCerca(S, R, true).sort((a, b) => Math.hypot(a.x - s.x, a.y - s.y) - Math.hypot(b.x - s.x, b.y - s.y))[0];
        if (!obj) continue;
        s.cd = d.cada; s.tx = obj.x; s.ty = obj.y; s.rayo = 0.12;
        nvGolpe(S, obj, nvHabDanoBase(S) * d.dano, nvHabArma('termica'), obj.x, obj.y, 1);
      }
    },
    acaba: S => { S.espiritus = []; },
  },
  directo: {
    paso: (S, d, dt) => {
      const n = S.nave, kf = nvFactor(n.rango);
      for (const e of nvHabCerca(S, d.radio * kf, false)) {
        const dx = n.x - e.x, dy = n.y - e.y, l = Math.hypot(dx, dy) || 1;
        if (l > n.r + e.r + 60 * kf) { e.x += dx / l * d.tira * kf * dt; e.y += dy / l * d.tira * kf * dt; }
        e.est.apagon = Math.max(e.est.apagon || 0, d.apagon);   // se quedan mirando tu directo: no disparan mientras los atrae
      }
    },
  },
  gesta: {
    empieza: S => { nvHabCambiaRango(S, +1); },
    acaba: S => { nvHabCambiaRango(S, -1); },
  },
  plasma: {
    acaba: (S, d) => {
      const n = S.nave;
      S.fx.push({ t: 0.4, x: n.x, y: n.y, r: d.radio * nvFactor(n.rango), color: NOVA_ARMAS.cargas.em.color, tipo: 'onda' });
      for (const e of nvHabCerca(S, d.radio * nvFactor(n.rango), true)) if (!NV.Golpe.escudoEnPie(e)) e.est.apagon = Math.max(e.est.apagon || 0, d.apagon * (e.d.jefe || e.d.capitan ? 0.5 : 1));
    },
  },
  concierto: {
    empieza: (S, d) => {
      const n = S.nave, kf = nvFactor(n.rango);
      S.fx.push({ t: 0.45, x: n.x, y: n.y, r: d.radio * kf, color: '#ff6b9a', tipo: 'onda' });
      for (const e of nvHabCerca(S, d.radio * kf, true)) {
        if (!e.d.jefe) { const dx = e.x - n.x, dy = e.y - n.y, l = Math.hypot(dx, dy) || 1; e.vx = dx / l * d.empuje * kf; e.vy = dy / l * d.empuje * kf; e.empujon = 0.3; }
        e.est.apagon = Math.max(e.est.apagon || 0, d.dura * (e.d.jefe || e.d.capitan ? 0.5 : 1));
      }
    },
    paso: (S, d, dt) => {
      for (const e of S.enem) if (e.empujon > 0) { e.empujon -= dt; e.x += e.vx * dt; e.y += e.vy * dt; if (e.empujon <= 0) { e.vx = 0; e.vy = 0; } }
    },
  },
};
// La Gesta sube (o devuelve) un rango de golpe: tamaño, alcance y casco, como al subir de verdad, pero sin cartas
function nvHabCambiaRango(S, k) {
  const n = S.nave, frac = n.hp / n.hpMax;
  n.rango += k; n.escala = nvEscalaRango(n.rango); n.rAncho = nvRAncho(S.casco, n.rango); n.r = 0.42 * n.rAncho * n.escala;
  n.hpMax = Math.round(n.hpMax * (k > 0 ? 1.08 : 1 / 1.08)); n.hp = Math.min(n.hpMax, n.hpMax * frac);
}

// ---------- el botón (abajo a la derecha, sobre el minimapa) ----------
function nvHabBoton(W, H, u) { const R = 52 * u; return { x: W - R - 10 * u, y: H - 2 * R - 52 * u, r: 28 * u }; }
// pointerdown en el lienzo: si cae en el botón, la usa y no mueve la nave
function nvHabToque(ev) {
  const S = NVP.S, cv = document.getElementById('nv-canvas');
  if (!S || !S.hab || !NV.Habilidad.desbloqueada(NOVA_HABILIDADES, S.nave.rango)) return false;
  const r = cv.getBoundingClientRect(), x = (ev.clientX - r.left) * cv.width / r.width, y = (ev.clientY - r.top) * cv.height / r.height;
  const b = nvHabBoton(cv.width, cv.height, cv.width / 360);
  if (Math.hypot(x - b.x, y - b.y) > b.r * 1.3) return false;
  nvHabUsa(S);
  return true;
}
function nvHabPintaBoton(c, S, W, H, u) {
  if (!S.hab || !NV.Habilidad.desbloqueada(NOVA_HABILIDADES, S.nave.rango)) return;
  const b = nvHabBoton(W, H, u), lista = nvHabLista(S), col = NV_FAC_COLOR[S.habFac] || '#ffd93d';
  c.save();
  c.beginPath(); c.arc(b.x, b.y, b.r, 0, 6.283); c.fillStyle = lista ? col : 'rgba(10,14,40,.8)'; c.globalAlpha = lista ? 0.95 : 0.85; c.fill(); c.globalAlpha = 1;
  c.lineWidth = 4 * u; c.strokeStyle = '#1a0f2e'; c.stroke();
  const falta = NV.Habilidad.falta(S.hab);
  if (falta > 0) { c.beginPath(); c.arc(b.x, b.y, b.r - 3 * u, -Math.PI / 2, -Math.PI / 2 + 6.283 * (1 - falta)); c.lineWidth = 5 * u; c.strokeStyle = col; c.stroke(); }
  if (lista) { c.beginPath(); c.arc(b.x, b.y, b.r + 4 * u + 2 * u * Math.sin(S.t * 6), 0, 6.283); c.lineWidth = 2 * u; c.strokeStyle = '#fff'; c.stroke(); }
  c.textAlign = 'center'; c.font = '800 ' + 9 * u + 'px Baloo 2, sans-serif'; c.fillStyle = '#fff'; c.lineWidth = 3 * u; c.strokeStyle = '#1a0f2e';
  const t = lista ? tr(S.hab.def.nombre) : String(Math.ceil(S.hab.cd || S.hab.activa));
  c.strokeText(t, b.x, b.y + 3 * u); c.fillText(t, b.x, b.y + 3 * u);
  c.restore();
}
// En el mundo: el aura mientras actúa y los espíritus de la Legión
function nvHabPintaMundo(c, S) {
  const h = S.hab, n = S.nave;
  if (!h || h.activa <= 0) return;
  const z = nvZ(S), col = { plasma: '#22e3ff', estampida: '#ff9a3c', radar: '#d6a96a', gesta: '#ffcb3d', bullettime: '#4ade80', directo: '#c084fc', concierto: '#ff6b9a', legion: '#5ef2c0' }[h.efecto.id] || '#fff';
  c.save(); c.globalAlpha = h.efecto.id === 'radar' ? 0.25 : 0.4;
  c.beginPath(); c.arc(n.x, n.y, n.r * 1.35, 0, 6.283); c.lineWidth = 5 * z; c.strokeStyle = col; c.stroke();
  c.globalAlpha = 0.9;
  for (const s of S.espiritus || []) {
    c.beginPath(); c.arc(s.x, s.y, 12 * z, 0, 6.283); c.fillStyle = col; c.fill(); c.lineWidth = 3 * z; c.strokeStyle = '#1a0f2e'; c.stroke();
    if (s.rayo > 0) { s.rayo -= 1 / 60; c.beginPath(); c.moveTo(s.x, s.y); c.lineTo(s.tx, s.ty); c.lineWidth = 3 * z; c.strokeStyle = col; c.stroke(); }
  }
  c.restore();
}
