// Fans of Rouflage · EL PASE EN EL FINAL: en la pantalla del final (#p-fin), debajo de las estrellas, un tubo de cristal que se llena de pintura de
// colores (franjas que ondulan, burbujas, el frente con su onda) desde la experiencia de antes hasta la de ahora, y las Gotas contando hacia arriba.
// Si sube de nivel: se llena, destello, «¡NIVEL N!» con lo que da el pase en ese nivel y vuelve a empezar desde 0 con lo que sobra.
// finPaseApunta(r) lo llama economiaPartida (economia.js) ANTES de sumar nada: guarda lo de antes en r.eco. finPaseMuestra(r) lo llama muestraFin.
// Con cuenta, el servidor manda los números un poco después (servidor.js los pone en SAVE): se anima hasta lo previsto y, si llega otra cosa, hasta eso.
'use strict';

const FINP = { r: null, raf: 0, ultimo: 0, v: 0, meta: 0, nivel: 1, seg: null, fase: 'espera', t: 0, flash: 0, parts: [], burbujas: [], gotasV: 0, gotaT: 0, w: 0, h: 0, d: 1, espera: 0 };
const FINP_COL = ['#ff4b5c', '#ff7a1a', '#ffcb3d', '#7ee04a', '#39d5e8', '#3a7de0', '#b45cff'];      // los de la gota de pintura (diario.js)
const finNivelDe = xp => Math.min(ECO.niveles, 1 + Math.floor(xp / ECO.xpNivel));

// lo de antes de la partida y lo que se espera ganar (con la misma cuenta que servidor-economia.js; sin servidor, economia.js pone las Gotas de verdad)
function finPaseApunta(r) {
  const p = ecoEstado(), publica = J.pvp && !(RFP.info && RFP.info.privada), e = SAVE.eco || {}, hoy = e.dia === (RFS.activo() ? gachaMadrid().fecha : fechaHoy()) ? e.gotasHoy || 0 : 0;
  const gotas = Math.max(0, Math.min((ECO.gotas + (r.victoria ? ECO.gotasGanar : 0)) * (publica ? ECO.linea : 1), ECO.topeDia - hoy));
  const xp = Math.round((ECO.xp + (r.victoria ? ECO.xpGanar : 0)) * (publica ? ECO.xpLinea : 1));
  r.eco = { xpA: p.xp, xp, gotas, serv: RFS.activo(), premium: !!p.premium };
}
// a dónde llega la barra: sin servidor, lo que ya hay en SAVE; con él, lo previsto hasta que el servidor conteste (y entonces, lo suyo)
function finXpMeta() { const e = FINP.r.eco, x = ecoEstado().xp; return e.serv ? (x !== e.xpA ? x : e.xpA + e.xp) : x; }
// lo que da el pase al llegar al nivel n (lo de la pista gratis y, con premium, lo de la dorada): [{ it } | { texto }]
function finPremiosNivel(n) {
  const premium = FINP.r.eco.premium, out = [];
  for (const c of paseCosas()) if (c.nv === n && (!c.premium || premium)) out.push({ it: c.it });
  const suma = (tabla, f) => { if (tabla && tabla[n]) out.push({ texto: f(tabla[n]) }); };
  suma(ECO.purpGratis, k => '+' + tr('{n} Acciones', { n: k })); suma(ECO.gotasGratis, k => '+' + tr('{n} Gotas', { n: k }));
  if (premium) { suma(ECO.purpPremium, k => '+' + tr('{n} Acciones', { n: k })); suma(ECO.accionesPremium, k => '+' + tr('{n} Acciones', { n: k })); }
  return out;
}
function finPremiosHtml(lista) {
  const d = document.createElement('div'); d.className = 'fp-lista';
  for (const x of lista) {
    const s = document.createElement('span'); s.className = 'fp-premio';
    if (x.it) { const k = arLienzo(26, 26); arPinta(k, (c, w) => x.it.x(c, w)); s.appendChild(k); s.appendChild(document.createTextNode(tr(x.it.n))); }
    else s.textContent = x.texto;
    d.appendChild(s);
  }
  return d;
}

// la caja: se crea la primera vez debajo de las estrellas
function finPaseCaja() {
  let caja = E('fin-pase'); if (caja) return caja;
  caja = document.createElement('div'); caja.className = 'fin-pase'; caja.id = 'fin-pase';
  caja.innerHTML = `<div class="fp-cab"><span class="fp-tit ol"></span><span class="fp-gotas"><b id="fp-gotas"></b></span></div>`
    + `<div class="fp-tubo"><canvas id="fp-tubo" aria-hidden="true"></canvas><div class="fp-nivel" id="fp-nivel" hidden></div></div>`
    + `<div class="fp-pie"><span id="fp-xp"></span><span id="fp-cuenta"></span></div><div class="fp-premios" id="fp-premios"></div>`;
  caja.querySelector('.fp-gotas').prepend(iconoPeq(pintaGotas, 22));
  E('fin-estrellas').after(caja);
  return caja;
}
function finPaseMuestra(r) {
  const caja = finPaseCaja();
  cancelAnimationFrame(FINP.raf); FINP.raf = 0;
  caja.hidden = !(r && r.eco); if (caja.hidden) return;
  Object.assign(FINP, { r, v: r.eco.xpA, nivel: finNivelDe(r.eco.xpA), seg: null, fase: 'espera', t: 0, flash: 0, parts: [], burbujas: [], gotasV: 0, espera: 0.55 });
  FINP.meta = finXpMeta();
  caja.querySelector('.fp-tit').textContent = tr('PASE DE TEMPORADA');
  E('fp-xp').textContent = '+' + (FINP.meta - r.eco.xpA) + ' XP';
  E('fp-gotas').textContent = r.eco.gotas ? '+0' : tr('tope de hoy');
  E('fp-premios').innerHTML = ''; E('fp-nivel').hidden = true;
  finPaseCuenta();
  FINP.ultimo = performance.now(); FINP.raf = requestAnimationFrame(finPaseFotograma);
}
function finPaseCuenta() {
  const lleno = FINP.nivel >= ECO.niveles;
  E('fp-cuenta').textContent = lleno ? tr('¡Pase completo!') : tr('{a} / {b} XP', { a: Math.floor(FINP.v - (FINP.nivel - 1) * ECO.xpNivel), b: ECO.xpNivel });
}
// el siguiente tramo: hasta el final del nivel o hasta la meta, lo que llegue antes (cada tramo con su tiempo y su frenada)
function finTramo() {
  const tope = FINP.nivel >= ECO.niveles ? FINP.v : Math.min(FINP.meta, FINP.nivel * ECO.xpNivel), d = tope - FINP.v;
  return d > 0.5 ? { de: FINP.v, a: tope, t: 0, dur: 0.75 + d / ECO.xpNivel * 1.3 } : null;
}

/* ---------- el bucle: las fases (espera, llena, fiesta, vacía, fin) y el dibujo ---------- */
function finPaseFotograma(now) {
  const F = FINP;
  if (E('p-fin').hidden || !E('fin-pase') || E('fin-pase').hidden) { F.raf = 0; return; }
  const dt = Math.min(0.05, (now - F.ultimo) / 1000); F.ultimo = now; F.t += dt;
  // si el servidor contesta otra cosa, la meta cambia: se sigue hasta ahí (y si es menos, se pone directamente)
  const meta = finXpMeta();
  if (meta !== F.meta) {
    F.meta = meta; E('fp-xp').textContent = '+' + Math.max(0, meta - F.r.eco.xpA) + ' XP';
    if (meta < F.v) { F.v = meta; F.nivel = finNivelDe(meta); F.seg = null; finPaseCuenta(); }
    if (F.fase === 'fin') F.fase = 'llena';
  }
  if (F.fase === 'espera') { F.espera -= dt; if (F.espera <= 0) F.fase = 'llena'; }
  else if (F.fase === 'llena') {
    if (!F.seg) F.seg = finTramo();
    if (!F.seg) F.fase = 'fin';
    else {
      const S = F.seg; S.t += dt; const k = Math.min(1, S.t / S.dur), e = 1 - Math.pow(1 - k, 3);
      F.v = S.de + (S.a - S.de) * e; finPaseCuenta();
      if (k >= 1) {
        F.v = S.a; F.seg = null;
        if (F.nivel < ECO.niveles && F.v >= F.nivel * ECO.xpNivel) finSubeNivel();
      }
    }
  } else if (F.fase === 'fiesta') { F.fiesta -= dt; if (F.fiesta <= 0) { F.fase = 'vacia'; F.vacia = 0.4; } }
  else if (F.fase === 'vacia') {
    F.vacia -= dt;
    if (F.vacia <= 0) { F.nivel = Math.min(ECO.niveles, F.nivel + 1); F.burbujas = []; F.fase = 'llena'; finPaseCuenta(); }
  }
  // las Gotas, contando hacia arriba a la vez que se llena
  const g = F.r.eco.gotas;
  if (g && F.fase !== 'espera' && F.gotasV < g) {
    F.gotasV = Math.min(g, F.gotasV + Math.max(dt * g / 1.1, dt * 12));
    E('fp-gotas').textContent = '+' + Math.floor(F.gotasV);
    F.gotaT -= dt; if (F.gotaT <= 0 || F.gotasV >= g) { F.gotaT = 0.12; play('gota'); }
    if (F.gotasV >= g) E('fp-gotas').parentNode.classList.add('lleno');
  }
  finPaseDibuja(dt);
  F.raf = requestAnimationFrame(finPaseFotograma);
}
// sube de nivel: destello, chispas, el cartel con el premio y, al acabar, se vacía y vuelve a llenarse con lo que sobra
function finSubeNivel() {
  const F = FINP, n = F.nivel + 1;
  F.fase = 'fiesta'; F.fiesta = 1.9; F.flash = 1; play('levelup'); setTimeout(() => play('crown'), 180); vibra(30);
  const premios = finPremiosNivel(n), cartel = E('fp-nivel');
  cartel.innerHTML = `<b class="ol">${esc(tr('¡NIVEL {n}!', { n }))}</b>`;
  if (premios.length) cartel.appendChild(finPremiosHtml(premios));
  cartel.hidden = false; cartel.classList.remove('sale'); void cartel.offsetWidth; cartel.classList.add('entra');
  setTimeout(() => {      // el cartel se recoge y queda debajo, como recuerdo del nivel y de lo que ha dado
    cartel.classList.add('sale');
    setTimeout(() => { cartel.hidden = true; cartel.classList.remove('entra', 'sale'); }, 300);
    const fila = document.createElement('div'); fila.className = 'fp-hecho';
    const t = document.createElement('b'); t.className = 'ol'; t.textContent = tr('¡NIVEL {n}!', { n }); fila.appendChild(t);
    if (premios.length) fila.appendChild(finPremiosHtml(premios));
    E('fp-premios').appendChild(fila);
  }, 2300);
  // chispas desde la tapa de la derecha y a lo largo del tubo
  const L = finMedidas();
  for (let i = 0; i < 70; i++) {
    const enTubo = i < 30, x = enTubo ? L.x0 + Math.random() * (L.x1 - L.x0) : L.bx2, y = L.cy, a = enTubo ? -Math.PI / 2 + (Math.random() - 0.5) * 2.2 : Math.random() * TAU, v = 80 + Math.random() * 220;
    F.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 40, vida: 0.7 + Math.random() * 0.8, max: 1.5, s: 2.5 + Math.random() * 3.5, col: FINP_COL[i % 7], tipo: i % 3 ? 'confeti' : 'estrella', rot: Math.random() * 6, vr: (Math.random() - 0.5) * 14 });
  }
}

/* ---------- el dibujo del tubo ---------- */
// el lienzo es más grande que su hueco (sobresale por arriba y por abajo) para que las chispas no se corten
function finMedidas(F = FINP) {
  const R = F.R || 22, cy = F.h / 2, th = F.th || 34;
  return { R, cy, th, bx1: R + 3, bx2: F.w - R - 3, x0: 2 * R + 14, x1: F.w - 2 * R - 14 };
}
function finCapsula(c, x0, y0, x1, y1) { const r = (y1 - y0) / 2; c.beginPath(); c.moveTo(x0 + r, y0); c.lineTo(x1 - r, y0); c.arc(x1 - r, y0 + r, r, -Math.PI / 2, Math.PI / 2); c.lineTo(x0 + r, y1); c.arc(x0 + r, y0 + r, r, Math.PI / 2, Math.PI * 1.5); c.closePath(); }
function finInsignia(c, x, y, R, n, oro, brillo) {
  c.save();
  if (brillo > 0) { const g = c.createRadialGradient(x, y, R * 0.5, x, y, R * 2.4); g.addColorStop(0, `rgba(255,224,122,${0.8 * brillo})`); g.addColorStop(1, 'rgba(255,224,122,0)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, R * 2.4, 0, TAU); c.fill(); }
  c.beginPath(); c.arc(x, y + 3, R, 0, TAU); c.fillStyle = OL; c.fill();
  const g = c.createLinearGradient(0, y - R, 0, y + R);
  if (oro) { g.addColorStop(0, '#ffe98a'); g.addColorStop(0.55, '#ffcb3d'); g.addColorStop(1, '#d98a12'); } else { g.addColorStop(0, '#7d8bb0'); g.addColorStop(1, '#3d4a6e'); }
  c.beginPath(); c.arc(x, y, R, 0, TAU); c.fillStyle = g; c.fill(); c.lineWidth = 3.5; c.strokeStyle = OL; c.stroke();
  c.beginPath(); c.arc(x, y, R - 5, Math.PI * 1.1, Math.PI * 1.75); c.lineWidth = 2.5; c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineCap = 'round'; c.stroke();
  rotulo(c, String(n), x, y + 2 * R / 22, (n > 9 ? 17 : 20) * R / 22, '#fff6ea', OL);
  c.restore();
}
function finPaseDibuja(dt) {
  const F = FINP;
  F.lleno = F.nivel >= ECO.niveles; F.cols = FINP_COL;
  const dentro = F.lleno ? 1 : Math.max(0, Math.min(1, (F.v - (F.nivel - 1) * ECO.xpNivel) / ECO.xpNivel));
  F.frac = F.fase === 'fiesta' ? 1 : F.fase === 'vacia' ? Math.max(0, F.vacia / 0.4) : dentro;
  tuboPinta(E('fp-tubo'), F, dt);
}
// EL TUBO (también lo usan los talentos: talentos-pantalla.js y talentos-fin.js). F: { t, frac, fase, nivel, lleno, cols, burbujas, parts, flash, vacia, R, th }
function tuboPinta(cv, F, dt) {
  const d = Math.min(2, window.devicePixelRatio || 1), w = cv.clientWidth, h = cv.clientHeight;
  if (!w || !h) return;
  if (cv.width !== Math.round(w * d) || cv.height !== Math.round(h * d)) { cv.width = Math.round(w * d); cv.height = Math.round(h * d); }
  F.w = w; F.h = h; F.d = d;
  const c = cv.getContext('2d'), L = finMedidas(F), { cy, th, x0, x1 } = L, y0 = cy - th / 2, y1 = cy + th / 2, t = F.t, COL = F.cols || FINP_COL;
  c.setTransform(d, 0, 0, d, 0, 0); c.clearRect(0, 0, w, h); c.lineJoin = 'round';
  const lleno = F.lleno, frac = F.frac;
  // la sombra y el fondo del cristal
  finCapsula(c, x0, y0 + 4, x1, y1 + 4); c.fillStyle = OL; c.fill();
  finCapsula(c, x0, y0, x1, y1); const fondo = c.createLinearGradient(0, y0, 0, y1); fondo.addColorStop(0, '#2a2248'); fondo.addColorStop(1, '#120c24'); c.fillStyle = fondo; c.fill();
  // la pintura: franjas de colores inclinadas que se mueven y ondulan, recortadas por el frente con su onda
  const ix0 = x0 + 3, ix1 = x1 - 3, iy0 = y0 + 3, iy1 = y1 - 3, xf = ix0 + (ix1 - ix0) * frac;
  if (frac > 0.003) {
    c.save(); finCapsula(c, ix0, iy0, ix1, iy1); c.clip();
    c.beginPath(); c.moveTo(ix0 - 2, iy0 - 2);
    const onda = F.fase === 'llena' ? 3.2 : 2;
    for (let y = iy0 - 2; y <= iy1 + 2; y += 2) c.lineTo(Math.min(ix1 + 4, xf + Math.sin(y * 0.38 + t * 7) * onda * Math.min(1, frac * 8)), y);
    c.lineTo(ix0 - 2, iy1 + 2); c.closePath(); c.save(); c.clip();
    const sw = th * 0.38, paso = sw * COL.length, mueve = (t * 26) % paso;
    for (let k = -2; ix0 - th + k * sw - mueve < xf + th; k++) {
      const bx = ix0 + k * sw + mueve - th;
      c.beginPath();
      for (let y = iy0 - 2; y <= iy1 + 2; y += 3) c.lineTo(bx + (iy1 - y) * 0.6 + Math.sin(y * 0.3 + t * 3 + k) * 2.2, y);
      for (let y = iy1 + 2; y >= iy0 - 2; y -= 3) c.lineTo(bx + sw + 0.6 + (iy1 - y) * 0.6 + Math.sin(y * 0.3 + t * 3 + k + 0.6) * 2.2, y);
      c.closePath(); c.fillStyle = COL[((k % COL.length) + COL.length) % COL.length]; c.fill();
    }
    // volumen: luz arriba y sombra abajo, como un líquido dentro de un tubo
    const vol = c.createLinearGradient(0, iy0, 0, iy1); vol.addColorStop(0, 'rgba(255,255,255,0.42)'); vol.addColorStop(0.35, 'rgba(255,255,255,0.05)'); vol.addColorStop(0.7, 'rgba(32,16,44,0.05)'); vol.addColorStop(1, 'rgba(32,16,44,0.45)');
    c.fillStyle = vol; c.fillRect(ix0, iy0, xf - ix0 + 6, iy1 - iy0);
    // burbujas que suben (más mientras se llena)
    if (Math.random() < (F.fase === 'llena' ? 0.28 : 0.08) && xf - ix0 > 12) F.burbujas.push({ x: ix0 + 6 + Math.random() * (xf - ix0 - 10), y: iy1 + 2, r: 1.2 + Math.random() * 2.4, v: 10 + Math.random() * 16, f: Math.random() * 6 });
    c.lineWidth = 1.2;
    for (const b of F.burbujas) {
      b.y -= b.v * dt; b.f += dt * 5; const bx = b.x + Math.sin(b.f) * 1.2;
      c.beginPath(); c.arc(bx, b.y, b.r, 0, TAU); c.fillStyle = 'rgba(255,255,255,0.22)'; c.fill(); c.strokeStyle = 'rgba(255,255,255,0.75)'; c.stroke();
      c.beginPath(); c.arc(bx - b.r * 0.35, b.y - b.r * 0.35, b.r * 0.3, 0, TAU); c.fillStyle = '#fff'; c.fill();
    }
    F.burbujas = F.burbujas.filter(b => b.y > iy0 - 3 && b.x < xf);
    c.restore();
    // el frente: una línea clara con la misma onda
    if (frac < 0.995) {
      c.beginPath(); for (let y = iy0; y <= iy1; y += 2) c.lineTo(xf + Math.sin(y * 0.38 + t * 7) * onda * Math.min(1, frac * 8), y);
      c.lineWidth = 2.2; c.strokeStyle = 'rgba(255,255,255,0.7)'; c.stroke();
    }
    c.restore();
  }
  // el cristal por encima: rayitas de medida, el brillo de arriba, el reflejo de abajo y un destello que pasa de vez en cuando
  c.save(); finCapsula(c, x0, y0, x1, y1); c.clip();
  c.strokeStyle = 'rgba(255,255,255,0.28)'; c.lineWidth = 1.5;
  for (let i = 1; i < 10; i++) { const x = x0 + (x1 - x0) * i / 10; c.beginPath(); c.moveTo(x, y1 - 3); c.lineTo(x, y1 - (i === 5 ? 10 : 7)); c.stroke(); }
  c.lineCap = 'round';
  c.beginPath(); c.moveTo(x0 + th * 0.55, y0 + th * 0.24); c.lineTo(x1 - th * 0.55, y0 + th * 0.24); c.lineWidth = 4; c.strokeStyle = 'rgba(255,255,255,0.5)'; c.stroke();
  c.beginPath(); c.moveTo(x0 + th * 0.4, y0 + th * 0.24); c.lineTo(x0 + th * 0.4 + 6, y0 + th * 0.24); c.lineWidth = 4; c.strokeStyle = 'rgba(255,255,255,0.85)'; c.stroke();
  c.beginPath(); c.moveTo(x0 + th, y1 - th * 0.2); c.lineTo(x1 - th, y1 - th * 0.2); c.lineWidth = 2; c.strokeStyle = 'rgba(255,255,255,0.16)'; c.stroke();
  const pasa = ((t * 0.45) % 1.6) - 0.3, gx = x0 + (x1 - x0) * pasa;
  if (pasa > -0.2 && pasa < 1.2) { const gl = c.createLinearGradient(gx - 30, 0, gx + 30, 0); gl.addColorStop(0, 'rgba(255,255,255,0)'); gl.addColorStop(0.5, 'rgba(255,255,255,0.28)'); gl.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gl; c.beginPath(); c.moveTo(gx - 22, y0); c.lineTo(gx + 6, y0); c.lineTo(gx - 6, y1); c.lineTo(gx - 34, y1); c.closePath(); c.fill(); }
  if (F.flash > 0) { c.globalAlpha = F.flash; c.fillStyle = '#fff6ea'; c.fillRect(x0, y0, x1 - x0, th); c.globalAlpha = 1; }
  c.restore();
  finCapsula(c, x0, y0, x1, y1); c.lineWidth = 4; c.strokeStyle = OL; c.stroke();
  // las tapas: dos anillas de metal en los extremos del tubo
  for (const x of [x0 + 5, x1 - 5]) {
    const g = c.createLinearGradient(0, y0 - 5, 0, y1 + 5); g.addColorStop(0, '#d9ccff'); g.addColorStop(0.45, '#8f7fc4'); g.addColorStop(1, '#3b2d63');
    c.beginPath(); rrPathRF(c, x - 6, y0 - 5, 12, th + 10, 5); c.fillStyle = g; c.fill(); c.lineWidth = 3; c.strokeStyle = OL; c.stroke();
    c.beginPath(); c.moveTo(x - 2.5, y0 - 1); c.lineTo(x - 2.5, y1 - 2); c.lineWidth = 2; c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineCap = 'round'; c.stroke();
  }
  // las insignias: el nivel en el que estás y el siguiente (se pone de oro al llegar)
  const sube = F.fase === 'fiesta' || F.fase === 'vacia', pulso = sube ? 0.6 + 0.4 * Math.sin(t * 14) : 0;
  finInsignia(c, L.bx1, cy, L.R, F.nivel, true, 0);
  if (!lleno) finInsignia(c, L.bx2, cy, L.R * (sube ? 1.08 : 1), F.nivel + 1, sube, pulso);
  // las chispas
  for (const p of F.parts) {
    p.vida -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 260 * dt; p.vx *= 0.98; p.rot += p.vr * dt;
    c.globalAlpha = Math.max(0, Math.min(1, p.vida / p.max * 1.8)); c.save(); c.translate(p.x, p.y); c.rotate(p.rot); c.fillStyle = p.col;
    if (p.tipo === 'confeti') c.fillRect(-p.s, -p.s * 0.45, p.s * 2, p.s * 0.9);
    else { c.beginPath(); for (let i = 0; i < 8; i++) { const r = i % 2 ? p.s * 0.4 : p.s * 1.3; c.lineTo(Math.cos(i * TAU / 8) * r, Math.sin(i * TAU / 8) * r); } c.fill(); }
    c.restore();
  }
  c.globalAlpha = 1; F.parts = F.parts.filter(p => p.vida > 0);
  F.flash = Math.max(0, F.flash - dt * 2.4);
}
