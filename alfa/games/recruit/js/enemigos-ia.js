// Fans of Recruit · LOS DEMÁS: cómo se portan los becarios (toman café, se asustan, andan, apuntan y grapan; los cobardes
// huyen), los drones de KPIs (te siguen por arriba y sueltan flechas rojas), lo que disparan, y las cosas del suelo: monedas
// de CAOS, premios, cajas, fans atados, la MechaVaca aparcada y la vaca suelta.
'use strict';

function nuevoBecario(x, o) {
  const e = { tipo: 'becario', x, y: SUELO, z: ((hash(x | 0) * 7) | 0) - 1, dir: -1, hp: 3, t: 0, est: o.modo || 'anda', anim: 0, flash: 0, cad: rand(40, 110), dist: rand(60, 132),
    cobarde: !!o.cobarde, mueve: false, r: 9, alto: 34 };
  J.enes.push(e);
  return e;
}
function tiraTaza(e) { efecto(SPR.taza, e.x - e.dir * 12, e.y - 28, { vx: -e.dir * 0.8, vy: -2.7, g: 0.16, dur: 62, parp: true }); }
function pasoBecario(e) {
  const dx = JG.x - e.x, lejos = Math.abs(dx);
  if (e.est !== 'huye') e.dir = dx < 0 ? -1 : 1;
  e.mueve = false;
  if (e.est === 'cafe') { if (lejos < 150 && enPantalla(e.x, -8) && J.fase !== 'entra') { e.est = 'susto'; e.t = 0; tiraTaza(e); play('blip'); } }
  else if (e.est === 'susto') { if (e.t > 28) { e.est = e.cobarde ? 'huye' : 'anda'; e.t = 0; if (e.cobarde) e.dir = dx < 0 ? 1 : -1; } }
  else if (e.est === 'huye') { e.x += e.dir * 1.8; e.anim += 0.26; if (!enPantalla(e.x, 34)) e.fuera = true; }
  else if (e.est === 'anda') {
    // se queda a su distancia preferida: se acerca si está lejos y recula si lo tiene encima
    let v = lejos > e.dist + 10 ? 0.62 : lejos < e.dist - 34 ? -0.5 : 0;
    if (!enPantalla(e.x, -14)) v = (e.x < J.camX + J.W / 2 ? 1 : -1) * e.dir * 0.75;
    if (v) { e.x += e.dir * v; e.anim += 0.14; e.mueve = true; }
    if (--e.cad <= 0 && !JG.muerto && enPantalla(e.x, -8) && lejos < 220) { e.est = 'apunta'; e.t = 0; }
  } else if (e.est === 'apunta') {
    if (e.t > 36) {
      const b = SPR.becario.dispara.boca;
      e.est = 'dispara'; e.t = 0;
      J.tiros.push({ tipo: 'grapa', x: e.x + e.dir * b[0], y: e.y + b[1], vx: e.dir * 2.3, vy: 0, t: 0 });
      play('grapa');
    }
  } else if (e.t > 14) { e.est = 'anda'; e.t = 0; e.cad = rand(70, 150); }
}

function nuevoDron(x, lado) {
  const e = { tipo: 'dron', x, y: 64, by: rand(112, 130), fase: rand(0, 6.28), dir: -lado, hp: 2, t: 0, est: 'vuela', flash: 0, cad: rand(80, 140), vx: 0, z: 3, r: 12, alto: 30 };
  J.enes.push(e);
  return e;
}
function pasoDron(e) {
  if (e.est === 'vuela') {
    const obj = acota(JG.x + Math.sin(e.t * 0.011 + e.fase) * 70, J.camX + 16, J.camX + J.W - 16);   // ronda a CrazyBunny sin salirse de la pantalla
    e.vx = acota(e.vx + Math.sign(obj - e.x) * 0.045, -1.4, 1.4) * 0.985;
    if (--e.cad <= 0 && Math.abs(e.x - JG.x) < 30 && enPantalla(e.x, -10) && !JG.muerto) { e.est = 'apunta'; e.t = 0; }
  } else {
    e.vx *= 0.86;
    if (e.t > 30) { e.est = 'vuela'; e.t = 0; e.cad = rand(120, 190); J.tiros.push({ tipo: 'flecha', x: e.x, y: e.y - 2, vx: 0, vy: 0.8, t: 0 }); play('despido'); }
  }
  e.x += e.vx;
  if (Math.abs(e.vx) > 0.2) e.dir = e.vx < 0 ? -1 : 1;
  e.y += (e.by + Math.sin(e.t * 0.07 + e.fase) * 5 - e.y) * 0.06;
}
function pasoEnemigos() {
  for (const e of J.enes) {
    if (e.flash > 0) e.flash--;
    if (e.tipo === 'becario') pasoBecario(e); else if (e.tipo === 'dron') pasoDron(e); else pasoJefe(e);
    e.t++;
  }
  if (J.enes.some(e => e.muerto || e.fuera)) J.enes = J.enes.filter(e => !e.muerto && !e.fuera);
}

/* ---------- lo que disparan: grapa (becario), flecha (dron), carta y onda (jefe) ---------- */
function pasoTiros() {
  const L = J.tiros;
  for (let k = L.length - 1; k >= 0; k--) {
    const b = L[k];
    b.t++;
    if (b.tipo === 'flecha') b.vy = Math.min(3.6, b.vy + 0.09); else if (b.tipo === 'carta') b.vy += 0.11;
    b.x += b.vx; b.y += b.vy;
    let fuera = b.x < J.camX - 40 || b.x > J.camX + J.W + 40;
    if (b.tipo === 'onda') { if (b.t % 4 === 0) polvo(b.x + 9, SUELO); if (tocaJugador(b.x, b.y - 6, 5)) danaJugador(); }
    else if (b.y >= SUELO) { polvo(b.x, SUELO); if (b.tipo !== 'grapa') play('poof'); fuera = true; }
    else if (tocaJugador(b.x, b.y, 2) && danaJugador()) fuera = true;
    if (fuera) L.splice(k, 1);
  }
}

/* ---------- las cosas del suelo ---------- */
function rompeCaja(c) {
  c.fuera = true;
  for (let k = 0; k < 3; k++) polvo(c.x + rand(-9, 9), c.y - rand(0, 12));
  papeles(c.x, c.y - 10, 4); play('trash');
  if (c.da === 'monedas') sueltaMonedas(c.x, c.y - 12, 6);
  else J.cosas.push({ tipo: 'premio', que: c.da, x: c.x, y: c.y - 14, vx: 0, vy: -3.1, t: 0, z: 1 });
  suma(50);
}
function liberaFan(c) {
  if (c.est !== 'atado') return;
  c.est = 'celebra'; c.t = 0; c.r = 0;
  J.fans++;
  suma(500, c.x, c.y - 46);
  efecto(SPR.destello, c.x, c.y - 20, { dur: 12 });
  play('fan'); chat('fan');
}
function cogePremio(que) {
  const j = JG, y = j.y - (j.mecha ? 96 : 62);
  if (que === 'arma') { j.arma = 1; j.municion = 200; flota('¡METRALLETA!', j.x, y, ORO_ROTULO, true); chat('arma'); }
  else if (que === 'bombas') { j.bombas += 10; flota('ZANAHORIAS +10', j.x, y, VERDE_ROTULO, true); }
  else { suma(500); sumaCaos(9); flota('¡CAFÉ! CAOS +3', j.x, y, ['#f3e6ff', '#c79bff', '#8a4be0'], true); }
  play('premio');
}
function pasoCosas() {
  const j = JG;
  for (const c of J.cosas) {
    c.t++;
    if (c.flash > 0) c.flash--;
    if (c.tipo === 'moneda') {
      c.vy += 0.2; c.x += c.vx; c.y += c.vy;
      if (c.y > c.suelo - 6) { c.y = c.suelo - 6; c.vy *= -0.5; c.vx *= 0.7; if (c.vy > -0.8) c.vy = 0; }
      const dx = j.x - c.x, dy = j.y - 16 - c.y, d = Math.hypot(dx, dy) || 1;
      if (!j.muerto && c.t > 16 && d < 52) {
        c.x += dx / d * 3.2; c.y += dy / d * 3.2; c.vy = 0;
        if (d < 13) { c.fuera = true; J.puntos += 10; sumaCaos(1); play('moneda'); efecto(SPR.destello, c.x, c.y, { dur: 10 }); }
      }
      if (c.t > 560) c.fuera = true;
    } else if (c.tipo === 'premio') {
      if (!c.quieto) { c.vy += 0.2; c.x += c.vx; c.y += c.vy; if (c.y >= SUELO) { c.y = SUELO; c.quieto = true; } }
      if (!j.muerto && c.t > 22 && Math.abs(j.x - c.x) < (j.mecha ? 26 : 15) && j.y > c.y - 46) { c.fuera = true; cogePremio(c.que); }
      if (c.t > 1200) c.fuera = true;
    } else if (c.tipo === 'fan') {
      if (c.est === 'atado') { if (!j.muerto && J.fase !== 'entra' && Math.abs(j.x - c.x) < (j.mecha ? 30 : 16) && j.y > SUELO - 44) liberaFan(c); }
      else if (c.est === 'celebra') {
        if (c.t === 24 && c.da) J.cosas.push({ tipo: 'premio', que: c.da, x: c.x, y: c.y - 30, vx: (j.x < c.x ? -1 : 1) * 0.9, vy: -3, t: 0, z: 1 });
        if (c.t > 76) { c.est = 'corre'; c.t = 0; }
      } else { c.x -= 2.2; c.anim += 0.2; if (c.x < J.camX - 34) c.fuera = true; }
    } else if (c.tipo === 'mecha') {
      if (c.t % 46 === 0) efecto(SPR.humo, c.x - c.dir * 25, c.y - 62, { vx: -c.dir * 0.1, vy: -0.35, dur: 40, capa: 0 });
    } else if (c.tipo === 'vaca') {
      // la vaca, sin mecha: corre y embiste a todo el que pilla. Al jefe le da un topetazo y se da la vuelta
      c.x += c.dir * 2.8; c.anim += 0.3;
      for (const e of J.enes.slice()) {
        if (e.muerto || e.intocable) continue;
        if (e.tipo === 'jefe') { if (!c.dio && Math.abs(e.x - c.x) < e.r + 8) { c.dio = true; c.dir = -c.dir; explota(c.x, SUELO - 22, 1); golpea(e, 30, true); } }
        else if (Math.abs(e.x - c.x) < e.r + 12 && e.y > SUELO - 60) { play('golpe'); golpea(e, 20, true); }
      }
      if (c.t % 5 === 0) polvo(c.x - c.dir * 10, SUELO);
      if (!enPantalla(c.x, 60)) c.fuera = true;
    }
  }
  if (J.cosas.some(c => c.fuera)) J.cosas = J.cosas.filter(c => !c.fuera);
}
