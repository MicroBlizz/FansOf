// Fans of Nova · El piloto del Rey de los huesos: se mueve y ataca como una persona (ve con retraso, rodea, apunta con adelanto, cambia de lado y se equivoca).
// Sus ataques avisan (línea de apuntado, huecos en los anillos): el sitio donde te pones decide si los esquivas. Sin naves de refuerzo salvo una vez, al caer a la mitad.
'use strict';
const NV_JEFE = { reaccion: 0.35, vel: 135, distIdeal: 0.5, balaRafaga: 330, balaCanon: 720, avisoCanon: 1.3, giroCanon: 2.2 };

function nvJefeNuevo(e) {
  e.pil = { lado: Math.random() < 0.5 ? 1 : -1, tLado: 2 + Math.random() * 2, tReac: 0, ve: null, bvx: 0, bvy: 0, tAtaque: 3, cola: [], ult: '', tele: null, quieto: 0, mitad: false };
}
// Ángulo hacia la nave del jugador con adelanto (a dónde estará cuando llegue la bala) y un pequeño error humano.
function nvJefeApunta(S, e, vb, error) {
  const n = S.nave, d = Math.hypot(n.x - e.x, n.y - e.y), t = d / vb;
  return Math.atan2(n.y + n.vy * t - e.y, n.x + n.vx * t - e.x) + (Math.random() - 0.5) * 2 * error;
}
function nvJefeAnillo(S, e, k, hueco, rumbo, v) {   // anillo de balas con un hueco por el que cabe la nave
  for (let i = 0; i < k; i++) {
    let a = i * 6.283 / k - rumbo; a = Math.atan2(Math.sin(a), Math.cos(a));
    if (Math.abs(a) < hueco) continue;
    nvBalaE(S, e.x, e.y, Math.cos(i * 6.283 / k) * v, Math.sin(i * 6.283 / k) * v, 9, 6, 3.4, 'em');
  }
}
function nvJefeElige(S, e, dist, f2) {
  const p = e.pil, n = S.nave, ideal = nvMediaPantalla(S)[0] * NV_JEFE.distIdeal;
  const op = [['rafaga', 3], ['canon', dist > ideal * 0.7 ? 3 : 1], ['anillo', dist < ideal ? 3 : 1]];
  if (f2) op.push(['barrido', 2]);
  const lista = op.filter(o => o[0] !== p.ult);
  let q = Math.random() * lista.reduce((s, o) => s + o[1], 0), id = lista[0][0];
  for (const o of lista) { q -= o[1]; if (q <= 0) { id = o[0]; break; } }
  p.ult = id;
  if (id === 'rafaga') for (let i = 0; i < (f2 ? 5 : 4); i++) p.cola.push({ t: 0.25 + 0.2 * i, f: () => { const a = nvJefeApunta(S, e, NV_JEFE.balaRafaga, 0.05); nvSnd('nvDisparoE', S, e.x, e.y, 0.8); nvBalaE(S, e.x, e.y, Math.cos(a) * NV_JEFE.balaRafaga, Math.sin(a) * NV_JEFE.balaRafaga, 9, 6, 3, 'em'); } });
  else if (id === 'canon') { p.tele = { a: Math.atan2(n.y - e.y, n.x - e.x), t: 0, T: NV_JEFE.avisoCanon }; nvSnd('nvLaserE', S, e.x, e.y, 0.9); }
  else if (id === 'anillo') {
    const rumbo = Math.atan2(n.y - e.y, n.x - e.x) + (Math.random() < 0.5 ? -1 : 1) * (0.9 + Math.random() * 0.6);   // el hueco no está donde estás: hay que moverse
    p.cola.push({ t: 0.7, f: () => nvJefeAnillo(S, e, f2 ? 22 : 16, 0.5, rumbo, 200) });
    if (f2) p.cola.push({ t: 1.4, f: () => nvJefeAnillo(S, e, 22, 0.5, rumbo + 3.14 + 0.3, 200) });   // segundo anillo con el hueco al otro lado
    e.pil.aviso = { t: 0.7, rumbo };
  } else for (let i = 0; i < 14; i++) p.cola.push({ t: 0.4 + 0.1 * i, f: () => {   // barrido: abanico que cruza la pantalla
    const a = nvJefeApunta(S, e, 300, 0) - 0.7 + 1.4 * i / 13;
    nvBalaE(S, e.x, e.y, Math.cos(a) * 300, Math.sin(a) * 300, 9, 6, 3, 'em'); } });
  p.tAtaque = (f2 ? 1.6 : 2.4) + Math.random() * 0.9;
}
// Devuelve nada: el jefe se mueve solo (su velocidad tiene inercia). `apagado`: el apagón lo deja a la deriva.
function nvJefe(S, e, dt, ux, uy, dist, apagado) {
  if (!e.pil) nvJefeNuevo(e);
  const p = e.pil, n = S.nave, f2 = e.hp < e.hpMax / 2, ideal = nvMediaPantalla(S)[0] * NV_JEFE.distIdeal;
  // refuerzos: solo una vez, al caer a la mitad
  if (f2 && !p.mitad) { p.mitad = true; for (let i = 0; i < 2; i++) nvEnemigo(S, 'rastrero', e.x + (i ? 70 : -70), e.y + 40); }
  if (!apagado) {
    // lo que ve llega con retraso de reacción
    if ((p.tReac -= dt) <= 0 || !p.ve) { p.tReac = NV_JEFE.reaccion + Math.random() * 0.15; p.ve = { x: n.x, y: n.y }; }
    if ((p.tLado -= dt) <= 0) { p.lado = -p.lado; p.tLado = 1.8 + Math.random() * 2.7; }
    const dx = p.ve.x - e.x, dy = p.ve.y - e.y, d = Math.hypot(dx, dy) || 1, ax = dx / d, ay = dy / d;
    const rad = d > ideal * 1.15 ? 1 : d < ideal * 0.75 ? -1 : 0;
    let k = p.tele ? 0.2 : p.quieto > 0 ? 0.5 : 1;   // apuntando el cañón casi se para: es su punto débil
    const vx = (ax * rad + -ay * p.lado * (rad ? 0.6 : 1)) * NV_JEFE.vel * (f2 ? 1.25 : 1) * k, vy = (ay * rad + ax * p.lado * (rad ? 0.6 : 1)) * NV_JEFE.vel * (f2 ? 1.25 : 1) * k;
    p.bvx += (vx - p.bvx) * Math.min(1, dt * 1.6); p.bvy += (vy - p.bvy) * Math.min(1, dt * 1.6);
    if (p.quieto > 0) p.quieto -= dt;
    // ataques
    if (!p.tele && !p.cola.length && (p.tAtaque -= dt) <= 0 && e.vis) nvJefeElige(S, e, dist, f2);
    if (p.tele) {
      const t = p.tele; t.t += dt;
      if (t.t < t.T - 0.4) {   // sigue al jugador con giro limitado, y en los últimos 0,4 s fija el tiro
        let da = Math.atan2(n.y - e.y, n.x - e.x) - t.a; da = Math.atan2(Math.sin(da), Math.cos(da));
        t.a += Math.max(-NV_JEFE.giroCanon * dt, Math.min(NV_JEFE.giroCanon * dt, da));
      }
      if (t.t >= t.T) { nvSnd('nvDisparoE', S, e.x, e.y, 1); nvBalaE(S, e.x, e.y, Math.cos(t.a) * NV_JEFE.balaCanon, Math.sin(t.a) * NV_JEFE.balaCanon, 34, 10, 1.8, 'energia'); p.tele = null; p.quieto = 1; }
    }
    for (let i = p.cola.length - 1; i >= 0; i--) if ((p.cola[i].t -= dt) <= 0) { const o = p.cola.splice(i, 1)[0]; if (e.vis) o.f(); }
    if (p.aviso && (p.aviso.t -= dt) <= 0) p.aviso = null;
  } else { p.bvx *= 1 - Math.min(1, dt * 0.8); p.bvy *= 1 - Math.min(1, dt * 0.8); p.tele = null; }
  e.x += p.bvx * dt; e.y += p.bvy * dt;
}
// La línea de apuntado del cañón y el hueco del anillo, para que se pueda leer.
function nvDibujaJefe(c, S) {
  const z = nvZ(S);
  for (const e of S.enem) {
    const p = e.pil; if (!p || e.muerto) continue;
    if (p.tele) {
      const t = p.tele, k = Math.min(1, t.t / t.T), fijo = t.t >= t.T - 0.4;
      c.save(); c.globalAlpha = 0.25 + 0.5 * k; c.strokeStyle = fijo ? '#ffffff' : '#4aa8ff'; c.lineWidth = (fijo ? 5 : 2.5) * z; c.setLineDash([14 * z, 10 * z]);
      c.beginPath(); c.moveTo(e.x, e.y); c.lineTo(e.x + Math.cos(t.a) * 1600, e.y + Math.sin(t.a) * 1600); c.stroke(); c.restore();
    }
    if (p.aviso) {
      c.save(); c.globalAlpha = 0.5; c.strokeStyle = '#b46bff'; c.lineWidth = 3 * z; c.setLineDash([8 * z, 8 * z]);
      c.beginPath(); c.arc(e.x, e.y, e.r + 40 * z, p.aviso.rumbo - 0.5, p.aviso.rumbo + 0.5); c.stroke(); c.restore();
    }
  }
}
