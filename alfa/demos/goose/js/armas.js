// Fans of Goose · Armas: atacan solas. Látigo (delante, empuja), Cuchillas de pluma (giran alrededor), Huevos podridos (explotan y
// dejan charco) y Dados cargados (rebotan de oca en oca y sueltan metralla). Cada una con sus cifras por nivel (NIV) y su evolución.
'use strict';

const NIV = {
  latigo: { dano: [12, 16, 20, 26, 34], alcance: [40, 46, 50, 54, 62], cd: [1.25, 1.15, 1.05, 0.9, 0.8] },
  plumas: { n: [2, 3, 3, 4, 5], radio: [26, 28, 34, 36, 38], giro: [3.2, 3.4, 4.2, 4.4, 5.2], dano: [7, 9, 10, 13, 16] },
  huevo: { cd: [1.7, 1.6, 1.5, 1.4, 1.2], n: [1, 1, 2, 2, 3], radio: [20, 26, 26, 28, 34], dano: [18, 22, 26, 30, 38], charco: [2, 2, 2.6, 3.4, 3.4], dps: [6, 6, 7, 10, 12] },
  dados: { cd: [1.5, 1.4, 1.3, 1.2, 1.0], n: [1, 1, 1, 2, 2], rebotes: [2, 3, 3, 3, 6], dano: [12, 14, 16, 18, 22], metralla: [0, 0, 2, 2, 3] },
};
const LATIGAZOS = [];   // los trazos que se ven un momento: { x, y, ang, abre, r, t, dur, evo }

const nv = (arma, campo) => NIV[arma][campo][Math.min(MAX_NIVEL, JUEGO.armas[arma].nivel) - 1];
const multiDado = () => (JUEGO.dado.efecto === 6 ? 2 : 1);
const multiArea = () => JUEGO.st.area * (JUEGO.dado.efecto === 4 ? 1.4 : 1);

function avanzaArmas(dt) {
  const J = JUEGO, A = J.armas;
  for (const id in A) { const a = A[id]; a.t -= dt; }
  if (A.latigo) { armaLatigo(A.latigo); latigoPendiente(dt); }
  if (A.plumas) armaPlumas(A.plumas, dt);
  if (A.huevo && A.huevo.t <= 0) armaHuevo(A.huevo);
  if (A.dados && A.dados.t <= 0) armaDados(A.dados);
  avanzaProyectiles(dt);
  avanzaCharcos(dt);
  for (let i = LATIGAZOS.length - 1; i >= 0; i--) { LATIGAZOS[i].t += dt; if (LATIGAZOS[i].t >= LATIGAZOS[i].dur) LATIGAZOS.splice(i, 1); }
}

// --- látigo ---
function azote(ang, abre, r, dano, evo) {
  const yo = JUEGO.yo, n = enemigosCerca(yo.x, yo.y, r + 16), cx = Math.cos(ang), cy = Math.sin(ang), lim = Math.cos(abre);
  let golpes = 0;
  for (let k = 0; k < n; k++) {
    const e = ENE.lista[CERCA[k]]; if (e.hp <= 0) continue;
    const dx = e.x - yo.x, dy = e.y - yo.y, d = Math.hypot(dx, dy) || 1;
    if (d > r + e.r) continue;
    if (abre < 3 && (dx * cx + dy * cy) / d < lim) continue;
    danar(e, dano, dx / d, dy / d, 190); golpes++;
  }
  if (LATIGAZOS.length < 8) LATIGAZOS.push({ x: yo.x, y: yo.y, ang, abre, r, t: 0, dur: 0.22, evo, chispa: golpes > 0 });
  JUEGO.latigoT = 0.18;
  if (golpes >= 4) congela(0.03);
  if (golpes) SONIDO.latigo(golpes);
  else SONIDO.zas();
}
function armaLatigo(a) {
  if (a.t > 0) return;
  const yo = JUEGO.yo, area = multiArea(), dano = nv('latigo', 'dano') * JUEGO.st.dano * multiDado();
  const ang = Math.atan2(yo.miraY, yo.miraX), r = nv('latigo', 'alcance') * area;
  if (a.evo) {
    azote(ang, 3.3, 70 * area, 40 * JUEGO.st.dano * multiDado(), true);
    a.doble = 0.14; a.t = 0.75 * JUEGO.st.cd; tiembla(1.5);
    return;
  }
  azote(ang, 1.25, r, dano, false);
  if (a.nivel >= 3) a.atras = 0.16;
  a.t = nv('latigo', 'cd') * JUEGO.st.cd;
}
function latigoPendiente(dt) {   // el segundo latigazo (atrás, o el doble de la evolución), un poco después
  const a = JUEGO.armas.latigo; if (!a) return;
  const yo = JUEGO.yo, area = multiArea(), ang = Math.atan2(yo.miraY, yo.miraX);
  if (a.atras > 0) { a.atras -= dt; if (a.atras <= 0) azote(ang + Math.PI, 1.25, nv('latigo', 'alcance') * area, nv('latigo', 'dano') * JUEGO.st.dano * multiDado(), false); }
  if (a.doble > 0) { a.doble -= dt; if (a.doble <= 0) azote(ang + 1.5, 3.3, 70 * area, 40 * JUEGO.st.dano * multiDado(), true); }
}

// --- cuchillas de pluma ---
function plumasPosiciones(a) {
  const yo = JUEGO.yo, evo = a.evo, n = evo ? 8 : nv('plumas', 'n');
  const r = (evo ? 34 + Math.sin(JUEGO.t * 2.4) * 18 : nv('plumas', 'radio')) * multiArea();
  return { n, r, yo };
}
function armaPlumas(a, dt) {
  const evo = a.evo, giro = evo ? 6 : nv('plumas', 'giro');
  const corre = JUEGO.yo.moviendo ? 1.25 : 1;
  a.ang += giro * dt * corre * (JUEGO.st.vel / CFG.jugador.velocidad);
  const { n, r, yo } = plumasPosiciones(a);
  const dano = (evo ? 22 * (JUEGO.st.vel / CFG.jugador.velocidad) : nv('plumas', 'dano')) * JUEGO.st.dano * multiDado();
  const tam = 7 * multiArea();
  for (let i = 0; i < n; i++) {
    const an = a.ang + i * 6.283 / n, px = yo.x + Math.cos(an) * r, py = yo.y + Math.sin(an) * r;
    const m = enemigosCerca(px, py, tam + 10);
    for (let k = 0; k < m; k++) {
      const e = ENE.lista[CERCA[k]]; if (e.hp <= 0 || e.cdPl > 0) continue;
      const dx = e.x - px, dy = e.y - py; if (dx * dx + dy * dy > (tam + e.r) * (tam + e.r)) continue;
      e.cdPl = 0.42; const d = Math.hypot(e.x - yo.x, e.y - yo.y) || 1;
      danar(e, dano, (e.x - yo.x) / d, (e.y - yo.y) / d, 70);
      if (Math.random() < 0.3) SONIDO.corte();
    }
  }
}

// --- huevos podridos ---
function objetivoAlAzar(rango) {
  const yo = JUEGO.yo, n = enemigosCerca(yo.x, yo.y, rango);
  for (let intento = 0; intento < 6 && n; intento++) { const e = ENE.lista[CERCA[(Math.random() * n) | 0]]; if (e.hp > 0 && Math.hypot(e.x - yo.x, e.y - yo.y) < rango) return e; }
  return null;
}
function lanzaHuevo(x0, y0, x1, y1, dano, r, nivel, evo, mini) {
  const p = PROY.saca(); if (!p) return;
  p.tipo = mini ? 'minihuevo' : 'huevo'; p.x0 = p.x = x0; p.y0 = p.y = y0; p.x1 = x1; p.y1 = y1; p.t = 0; p.dur = mini ? 0.35 : 0.55; p.dano = dano; p.r = r; p.nivel = nivel; p.evo = evo; p.gira = Math.random() * 6;
}
function armaHuevo(a) {
  const yo = JUEGO.yo, n = a.evo ? 3 : nv('huevo', 'n');
  for (let i = 0; i < n; i++) {
    const e = objetivoAlAzar(130);
    const tx = e ? e.x + e.vx * 0.4 : yo.x + yo.miraX * 60 + (Math.random() - 0.5) * 50, ty = e ? e.y + e.vy * 0.4 : yo.y + yo.miraY * 60 + (Math.random() - 0.5) * 50;
    lanzaHuevo(yo.x, yo.y, tx, ty, (a.evo ? 44 : nv('huevo', 'dano')) * JUEGO.st.dano * multiDado(), (a.evo ? 36 : nv('huevo', 'radio')) * multiArea(), a.nivel, a.evo, false);
  }
  a.t = (a.evo ? 1.0 : nv('huevo', 'cd')) * JUEGO.st.cd;
  SONIDO.lanza();
}
function explotaHuevo(p) {
  const n = enemigosCerca(p.x, p.y, p.r + 14);
  for (let k = 0; k < n; k++) {
    const e = ENE.lista[CERCA[k]]; if (e.hp <= 0) continue;
    const dx = e.x - p.x, dy = e.y - p.y, d = Math.hypot(dx, dy) || 1; if (d > p.r + e.r) continue;
    danar(e, p.dano, dx / d, dy / d, 140);
  }
  estallido(p.x, p.y, p.tipo === 'minihuevo' ? 8 : 18, '#c8e65a', 90, 0.5, 2.4, 0, 0);
  estallido(p.x, p.y, 6, '#fff7c2', 50, 0.3, 2, 2);
  anillo(p.x, p.y, p.r, '#d9ff6b', 0.3, 3);
  if (p.tipo === 'huevo') {
    const c = CHARCOS.saca(); if (c) { c.x = p.x; c.y = p.y; c.r = p.r * 0.85; c.vida = p.evo ? 4 : NIV.huevo.charco[Math.min(5, p.nivel) - 1]; c.dps = (p.evo ? 16 : NIV.huevo.dps[Math.min(5, p.nivel) - 1]) * JUEGO.st.dano; c.tic = 0; }
    if (p.evo) for (let i = 0; i < 4; i++) { const an = i * 1.57 + Math.random() * 0.6; lanzaHuevo(p.x, p.y, p.x + Math.cos(an) * 40, p.y + Math.sin(an) * 40, p.dano * 0.45, 16 * multiArea(), p.nivel, false, true); }
    tiembla(1.2); SONIDO.explota();
  } else SONIDO.explotita();
}
function avanzaCharcos(dt) {
  const l = CHARCOS.lista;
  for (let i = CHARCOS.n - 1; i >= 0; i--) {
    const c = l[i]; c.vida -= dt; if (c.vida <= 0) { CHARCOS.quita(i); continue; }
    c.tic -= dt; if (c.tic > 0) continue; c.tic = 0.33;
    const n = enemigosCerca(c.x, c.y, c.r + 10);
    for (let k = 0; k < n; k++) { const e = ENE.lista[CERCA[k]]; if (e.hp > 0 && Math.hypot(e.x - c.x, e.y - c.y) < c.r + e.r * 0.5) danar(e, c.dps * 0.33, 0, 0, 0, true); }
  }
}

// --- dados cargados ---
function masCercano(x, y, rango, salvo) {
  const n = enemigosCerca(x, y, rango); let mejor = null, md = rango * rango;
  for (let k = 0; k < n; k++) { const e = ENE.lista[CERCA[k]]; if (e.hp <= 0 || e.id === salvo) continue; const d = (e.x - x) ** 2 + (e.y - y) ** 2; if (d < md) { md = d; mejor = e; } }
  return mejor;
}
function tiraDadoArma(x, y, e, a) {
  const p = PROY.saca(); if (!p) return;
  const d = Math.hypot(e.x - x, e.y - y) || 1, v = 200;
  p.tipo = 'dado'; p.x = x; p.y = y; p.vx = (e.x - x) / d * v; p.vy = (e.y - y) / d * v; p.t = 0; p.dur = 1.4;
  p.dano = (a.evo ? 30 : nv('dados', 'dano')) * JUEGO.st.dano * multiDado(); p.r = 5 * multiArea(); p.rebotes = a.evo ? 7 : nv('dados', 'rebotes'); p.ultimo = -1; p.nivel = a.nivel; p.evo = a.evo; p.gira = Math.random() * 6;
}
function armaDados(a) {
  const yo = JUEGO.yo, n = a.evo ? 3 : nv('dados', 'n');
  let tiros = 0;
  for (let i = 0; i < n; i++) { const e = i === 0 ? masCercano(yo.x, yo.y, 150, -1) : objetivoAlAzar(150); if (e) { tiraDadoArma(yo.x, yo.y, e, a); tiros++; } }
  a.t = (tiros ? (a.evo ? 0.8 : nv('dados', 'cd')) : 0.3) * JUEGO.st.cd;
  if (tiros) SONIDO.dadoArma();
}
function metralla(x, y, n, dano, estrella) {
  for (let i = 0; i < n; i++) {
    const p = PROY.saca(); if (!p) return;
    const an = estrella ? i * 6.283 / n : Math.random() * 6.283;
    p.tipo = 'metralla'; p.x = x; p.y = y; p.vx = Math.cos(an) * 170; p.vy = Math.sin(an) * 170; p.t = 0; p.dur = 0.38; p.dano = dano; p.r = 3; p.ultimo = -1;
  }
}

function avanzaProyectiles(dt) {
  const l = PROY.lista;
  for (let i = PROY.n - 1; i >= 0; i--) {
    const p = l[i]; p.t += dt; p.gira += dt * 14;
    if (p.tipo === 'huevo' || p.tipo === 'minihuevo') {
      const k = Math.min(1, p.t / p.dur); p.x = p.x0 + (p.x1 - p.x0) * k; p.y = p.y0 + (p.y1 - p.y0) * k;
      if (k >= 1) { explotaHuevo(p); PROY.quita(i); }
      continue;
    }
    p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.t >= p.dur) { PROY.quita(i); continue; }
    const n = enemigosCerca(p.x, p.y, p.r + 16); let golpe = null;
    for (let k = 0; k < n; k++) { const e = ENE.lista[CERCA[k]]; if (e.hp <= 0 || e.id === p.ultimo) continue; const rr = p.r + e.r; if ((e.x - p.x) ** 2 + (e.y - p.y) ** 2 < rr * rr) { golpe = e; break; } }
    if (!golpe) continue;
    const d = Math.hypot(p.vx, p.vy) || 1;
    if (p.tipo === 'metralla') { danar(golpe, p.dano, p.vx / d, p.vy / d, 40); PROY.quita(i); continue; }
    // dado
    danar(golpe, p.dano, p.vx / d, p.vy / d, 90, false, p.evo);
    estallido(p.x, p.y, 5, '#f1e6c8', 60, 0.3, 1.6, 2);
    const nm = p.evo ? 6 : NIV.dados.metralla[Math.min(5, p.nivel) - 1];
    if (nm) metralla(p.x, p.y, nm, p.dano * 0.4, p.evo);
    p.ultimo = golpe.id; p.rebotes--;
    const sig = p.rebotes >= 0 ? masCercano(p.x, p.y, 100, golpe.id) : null;
    if (!sig) { PROY.quita(i); continue; }
    const dd = Math.hypot(sig.x - p.x, sig.y - p.y) || 1; p.vx = (sig.x - p.x) / dd * 210; p.vy = (sig.y - p.y) / dd * 210; p.t = 0;
    SONIDO.rebote();
  }
}

// --- dibujo de las armas ---
function pintaArmas() {
  const J = JUEGO, yo = J.yo;
  // charcos
  const c = CHARCOS.lista;
  for (let i = 0; i < CHARCOS.n; i++) {
    const o = c[i], a = Math.min(1, o.vida / 0.6);
    G.globalAlpha = 0.45 * a; G.fillStyle = '#6fbf2a'; G.beginPath(); G.ellipse(o.x, o.y, o.r, o.r * 0.7, 0, 0, 6.283); G.fill();
    G.globalAlpha = 0.6 * a; G.fillStyle = '#c8f25a'; const b = (J.t * 3 + i) % 1; G.beginPath(); G.arc(o.x + Math.sin(i * 7) * o.r * 0.4, o.y + Math.cos(i * 5) * o.r * 0.3, 1.5 + b * 2, 0, 6.283); G.fill();
  }
  G.globalAlpha = 1;
  // latigazos
  for (const l of LATIGAZOS) pintaLatigazo(l);
  G.globalAlpha = 1;
  // plumas giratorias
  const a = J.armas.plumas;
  if (a) {
    const { n, r } = plumasPosiciones(a), spr = a.evo ? 'tornado' : 'cuchilla', esc = multiArea();
    for (let i = 0; i < n; i++) { const an = a.ang + i * 6.283 / n; pintaGirado(spr, yo.x + Math.cos(an) * r, yo.y + Math.sin(an) * r, an + 1.57, esc); }
  }
  // proyectiles
  const p = PROY.lista;
  for (let i = 0; i < PROY.n; i++) {
    const o = p[i];
    if (o.tipo === 'huevo' || o.tipo === 'minihuevo') {
      const k = Math.min(1, o.t / o.dur), alto = Math.sin(k * Math.PI) * (o.tipo === 'huevo' ? 34 : 18);
      G.fillStyle = 'rgba(0,0,0,.35)'; G.beginPath(); G.ellipse(o.x, o.y, 3, 1.6, 0, 0, 6.283); G.fill();
      pintaGirado('huevo', o.x, o.y - alto, o.gira, o.tipo === 'huevo' ? 1 : 0.7);
    } else if (o.tipo === 'dado') pintaGirado('dado' + (1 + ((o.gira * 0.5) | 0) % 6), o.x, o.y, o.gira, o.evo ? 1.2 : 0.9);
    else { G.fillStyle = '#ffe9a8'; G.fillRect(o.x - 1.2, o.y - 1.2, 2.4, 2.4); }
  }
}

// el latigazo: la tira de junco barre el arco de delante hacia atrás; gruesa en el mango, afilada en la punta, con el chasquido al final
function pintaLatigazo(l) {
  const k = l.t / l.dur, barrido = Math.min(1, k * 1.8), col = l.evo ? '#ff5a3d' : '#c98a3d', luz = l.evo ? '#ffd0a8' : '#f6e7b8';
  const r = l.r * (0.7 + k * 0.3), ang0 = l.abre > 3 ? barrido * 6.283 - 3.2 : l.ang - l.abre, ang1 = l.abre > 3 ? ang0 + 2.4 : ang0 + l.abre * 2 * barrido;
  // la estela (lo que ya barrió)
  G.globalAlpha = (1 - k) * 0.35; G.fillStyle = col; G.beginPath(); G.moveTo(l.x, l.y); G.arc(l.x, l.y, r, ang0, ang1); G.closePath(); G.fill();
  // la tira: varios segmentos del mango a la punta, cada vez más finos
  G.globalAlpha = 1 - k * k; G.lineCap = 'round';
  const n = 7;
  for (let i = 0; i < n; i++) {
    const a = ang1 - (i / n) * 0.9 * (l.abre > 3 ? 1 : 0.6), rr0 = r * (i / n), rr1 = r * ((i + 1) / n);
    const ang = a - Math.sin(i * 0.9 + k * 6) * 0.08;
    G.strokeStyle = i < 2 ? '#5a3418' : col; G.lineWidth = 4.5 - i * 0.55;
    G.beginPath(); G.moveTo(l.x + Math.cos(ang) * rr0, l.y + Math.sin(ang) * rr0); G.lineTo(l.x + Math.cos(ang1) * rr1, l.y + Math.sin(ang1) * rr1); G.stroke();
  }
  // el chasquido en la punta
  if (l.chispa && k > 0.25 && k < 0.7) {
    const px = l.x + Math.cos(ang1) * r, py = l.y + Math.sin(ang1) * r, s = (0.7 - k) / 0.45;
    G.globalAlpha = s; G.fillStyle = luz;
    for (let i = 0; i < 4; i++) { const a = i * 1.571 + k * 10; G.beginPath(); G.moveTo(px, py); G.lineTo(px + Math.cos(a) * 7 * s, py + Math.sin(a) * 7 * s); G.lineTo(px + Math.cos(a + 0.5) * 2.5, py + Math.sin(a + 0.5) * 2.5); G.closePath(); G.fill(); }
    G.fillStyle = '#fff'; G.beginPath(); G.arc(px, py, 2.2 * s, 0, 6.283); G.fill();
  }
  G.globalAlpha = 1;
}
