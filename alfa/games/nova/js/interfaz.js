// Fans of Nova · Interfaz de la partida: lienzo, entrada táctil y de teclado, HUD, cartas de rango y pantalla final.
'use strict';
const NVI = { cartasVistas: null, finVisto: null };

function nvAjustaLienzo() {
  const cv = document.getElementById('nv-canvas'), st = document.getElementById('stage');
  if (!cv || !st) return;
  const d = Math.min(2, window.devicePixelRatio || 1), w = cv.clientWidth || st.clientWidth, h = cv.clientHeight || st.clientHeight;
  if (cv.width !== Math.round(w * d)) { cv.width = Math.round(w * d); cv.height = Math.round(h * d); }
}
function nvEntrada() {
  const cv = document.getElementById('nv-canvas'), e = NVP.entrada;
  cv.addEventListener('pointerdown', ev => { NVP.joy = { x: ev.clientX, y: ev.clientY, id: ev.pointerId }; cv.setPointerCapture(ev.pointerId); });
  cv.addEventListener('pointermove', ev => {
    const j = NVP.joy; if (!j || j.id !== ev.pointerId) return;
    const dx = ev.clientX - j.x, dy = ev.clientY - j.y, m = Math.hypot(dx, dy), k = Math.min(1, m / 60);
    e.x = m > 4 ? dx / m * k : 0; e.y = m > 4 ? dy / m * k : 0; j.px = ev.clientX; j.py = ev.clientY;
  });
  const fin = ev => { if (NVP.joy && NVP.joy.id === ev.pointerId) { NVP.joy = null; e.x = e.y = 0; } };
  cv.addEventListener('pointerup', fin); cv.addEventListener('pointercancel', fin);
  window.addEventListener('keydown', ev => { NVP.teclas[ev.key.length === 1 ? ev.key.toLowerCase() : ev.key] = 1; });
  window.addEventListener('keyup', ev => { delete NVP.teclas[ev.key.length === 1 ? ev.key.toLowerCase() : ev.key]; });
  window.addEventListener('resize', nvAjustaLienzo);
}

// ---------- HUD en el lienzo ----------
function nvBarra(c, x, y, w, h, f, col, fondo) {
  c.fillStyle = fondo || 'rgba(10,14,40,.75)'; c.fillRect(x, y, w, h);
  c.fillStyle = col; c.fillRect(x, y, w * Math.max(0, Math.min(1, f)), h);
  c.lineWidth = 2; c.strokeStyle = '#1a0f2e'; c.strokeRect(x, y, w, h);
}
function nvHud(c, S, W, H, vs) {
  const n = S.nave, u = W / 360, m = 12 * u, bw = W - 2 * m;
  c.textAlign = 'left'; c.font = '800 ' + 14 * u + 'px Baloo 2, sans-serif';
  nvBarra(c, m, m, bw, 14 * u, n.hp / n.hpMax, n.hp / n.hpMax > 0.3 ? '#5be36b' : '#ff5b5b');
  if (n.esc) nvBarra(c, m, m + 14 * u, bw * n.esc.hp / n.esc.cap, 4 * u, 1, '#6fc4ff', 'rgba(0,0,0,0)');
  const ant = n.rango > 1 ? nvUmbral(n.rango - 1) : 0, sig = nvUmbral(n.rango);
  nvBarra(c, m, m + 20 * u, bw, 9 * u, (S.chat - ant) / (sig - ant), '#ffd93d');
  c.fillStyle = '#fff'; c.lineWidth = 4; c.strokeStyle = '#1a0f2e';
  const txt = tr('RANGO') + ' ' + n.rango, t = Math.floor(S.t), tt = Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0');
  c.strokeText(txt, m, m + 46 * u); c.fillText(txt, m, m + 46 * u);
  c.textAlign = 'right'; c.strokeText(tt, W - m, m + 46 * u); c.fillText(tt, W - m, m + 46 * u);
  if (S.jefe && !S.jefe.muerto) { c.textAlign = 'center'; const j = S.jefe; nvBarra(c, W * 0.2, m + 56 * u, W * 0.6, 8 * u, j.hp / j.hpMax, '#ff4b9a'); c.strokeText(tr(j.d.nombre), W / 2, m + 80 * u); c.fillText(tr(j.d.nombre), W / 2, m + 80 * u); }
  if (S.aviso) { c.textAlign = 'center'; c.font = '800 ' + 26 * u + 'px Luckiest Guy, Baloo 2, sans-serif'; c.strokeText(S.aviso.txt, W / 2, H * 0.3); c.fillText(S.aviso.txt, W / 2, H * 0.3); }
  nvMinimapa(c, S, W, H, u);
  // armas montadas, abajo
  c.textAlign = 'left'; c.font = '700 ' + 11 * u + 'px Baloo 2, sans-serif';
  const act = n.armas.filter(w => w.portador !== 'defensa');
  act.forEach((w, i) => { const y = H - m - (act.length - 1 - i) * 15 * u; c.fillStyle = NOVA_ARMAS.cargas[w.carga].color; c.fillRect(m, y - 9 * u, 8 * u, 8 * u); c.fillStyle = '#fff'; c.lineWidth = 3; c.strokeText(nvNombreArma(w) + (w.nivel ? ' +' + w.nivel : '') + ' ' + w.tam, m + 12 * u, y); c.fillText(nvNombreArma(w) + (w.nivel ? ' +' + w.nivel : '') + ' ' + w.tam, m + 12 * u, y); });
  if (NVP.joy && NVP.joy.px !== undefined) { const j = NVP.joy, r = cvRect(); c.beginPath(); c.arc((j.x - r.left) * W / r.width, (j.y - r.top) * H / r.height, 40 * u, 0, 6.283); c.strokeStyle = 'rgba(255,255,255,.3)'; c.lineWidth = 3; c.stroke(); c.beginPath(); c.arc((j.px - r.left) * W / r.width, (j.py - r.top) * H / r.height, 16 * u, 0, 6.283); c.fillStyle = 'rgba(255,255,255,.35)'; c.fill(); }
  nvPanelesDOM(S);
}
// Minimapa: la arena entera con estaciones (azul), nidos (rojo), capitanes (rosa), pecios, el Rey (dorado) y tú.
function nvMinimapa(c, S, W, H, u) {
  const R = 52 * u, x = W - R - 10 * u, y = H - R - 10 * u, k = R / NV_ARENA, n = S.nave;
  c.save(); c.beginPath(); c.arc(x, y, R, 0, 6.283); c.fillStyle = 'rgba(8,12,40,.7)'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#1a0f2e'; c.stroke(); c.clip();
  const punto = (px, py, col, r) => { c.fillStyle = col; c.fillRect(x + px * k - r, y + py * k - r, 2 * r, 2 * r); };
  for (const p of S.pecios) punto(p.x, p.y, p.rara ? '#ffd93d' : '#6fe3ff', 1.2 * u);
  for (const st of S.estaciones) punto(st.x, st.y, '#7aa8ff', 3 * u);
  for (const e of S.enem) { if (e.muerto) continue; if (e.d.nido) punto(e.x, e.y, '#ff5b5b', 2.6 * u); else if (e.d.capitan) punto(e.x, e.y, '#ff4b9a', 3 * u); else if (e.d.jefe) punto(e.x, e.y, '#ffd93d', 4 * u); }
  c.fillStyle = '#fff'; c.beginPath(); c.arc(x + n.x * k, y + n.y * k, 3 * u, 0, 6.283); c.fill();
  c.restore();
}
function cvRect() { return document.getElementById('nv-canvas').getBoundingClientRect(); }

// ---------- cartas de rango y final (DOM sobre el lienzo) ----------
function nvEl(cls, txt, tag) { const e = document.createElement(tag || 'div'); if (cls) e.className = cls; if (txt !== undefined) e.textContent = txt; return e; }
function nvPanelesDOM(S) {
  const cont = document.getElementById('nv-paneles');
  if (S.estado === 'cartas' && S.cartas !== NVI.cartasVistas) {
    NVI.cartasVistas = S.cartas; cont.textContent = '';
    const p = nvEl('nv-panel'); p.appendChild(nvEl('nv-titulo', tr('ELIGE UNA CARTA')));
    S.cartas.forEach((c, i) => {
      const b = nvEl('nv-carta', '', 'button'); b.style.setProperty('--col', NOVA_ARMAS.cargas[c.carga] ? NOVA_ARMAS.cargas[c.carga].color : '#ff9a3c');
      b.appendChild(nvEl('nv-ctipo', tr({ arma: 'ARMA', mejora: 'MEJORA', fusion: 'FUSIÓN', defensa: 'DEFENSA', sistema: 'SISTEMA' }[c.tipo]) + (c.tendencia ? ' · ' + tr('ENCAJA') : '')));
      b.appendChild(nvEl('nv-cnom', c.titulo)); b.appendChild(nvEl('nv-cdet', c.detalle));
      b.onclick = () => { nvElegirCarta(S, i); cont.textContent = ''; NVI.cartasVistas = null; };
      p.appendChild(b);
    });
    const rr = nvEl('nv-boton', tr('Repetir cartas') + ' (' + S.rerolls + ')', 'button'); rr.disabled = S.rerolls <= 0;
    rr.onclick = () => { nvReroll(S); };
    p.appendChild(rr); cont.appendChild(p);
  } else if (S.estado !== 'cartas' && NVI.cartasVistas) { NVI.cartasVistas = null; cont.textContent = ''; }
  if (S.estado === 'estacion' && S.estVista !== S.est) { S.estVista = S.est; S.estSel = null; nvRenderEstacion(S); }
  if ((S.estado === 'victoria' || S.estado === 'derrota') && NVI.finVisto !== S) {
    NVI.finVisto = S; cont.textContent = '';
    const p = nvEl('nv-panel'), ok = S.estado === 'victoria';
    p.appendChild(nvEl('nv-titulo', ok ? tr('¡SECTOR LIMPIO!') : tr('NAVE DESTRUIDA')));
    const l = [[tr('Tiempo'), Math.floor(S.t / 60) + ':' + String(Math.floor(S.t % 60)).padStart(2, '0')], [tr('Rango'), S.nave.rango], [tr('Enemigos destruidos'), S.stats.muertos], [tr('Restos devorados'), S.stats.tragados], [tr('Daño total'), Math.round(S.stats.dano)], [tr('Mayor golpe'), Math.round(S.stats.mayor)], [tr('Aleación'), Math.floor(S.chat / 10)]];
    for (const [a, b] of l) { const f = nvEl('nv-fila'); f.appendChild(nvEl('', a)); f.appendChild(nvEl('', String(b))); p.appendChild(f); }
    const re = Object.keys(S.stats.reacciones);
    if (re.length) p.appendChild(nvEl('nv-cdet', tr('Reacciones') + ': ' + re.map(k => tr(NOVA_ARMAS.reacciones.find(r => r.id === k).nombre) + ' ×' + S.stats.reacciones[k]).join(', ')));
    const b = nvEl('nv-boton', tr('Jugar otra vez'), 'button'); b.onclick = () => { cont.textContent = ''; NVI.finVisto = null; nvParar(); nvMenu(); };
    const s = nvEl('nv-boton', tr('Salir'), 'button'); s.onclick = () => { cont.textContent = ''; nvSalir(); };
    p.appendChild(b); p.appendChild(s); cont.appendChild(p);
  }
}
function nvSalir() {
  nvParar(); NVI.cartasVistas = null; NVI.finVisto = null;
  document.getElementById('nv-partida').hidden = true;
  document.getElementById('nv-portada').hidden = false;
}
function nvJugar() {
  document.getElementById('nv-portada').hidden = true;
  document.getElementById('nv-partida').hidden = false;
  nvAjustaLienzo();
  nvMenu();
}

// ---------- menú de naves: cada facción empieza con un arma de su clase ----------
function nvPreview(cv, casco) {
  const c = cv.getContext('2d'), H = NOVA_PIEZAS.cascos[casco], [tm, tam] = nvMotorRango(casco, 5), e = cv.height / 330;
  c.clearRect(0, 0, cv.width, cv.height); c.save(); c.translate(cv.width / 2, cv.height * 0.55); c.scale(e, e);
  nvPieza(c, casco + '-alas', H.alas.x, H.alas.y); nvPieza(c, 'motor-' + tm + '-' + tam, H.motor.x, H.motor.y); nvPieza(c, casco + '-casco', 0, 0);
  c.restore();
}
function nvMenu() {
  nvParar();
  const cont = document.getElementById('nv-paneles'); cont.textContent = '';
  const p = nvEl('nv-panel'); p.appendChild(nvEl('nv-titulo', tr('ELIGE TU NAVE')));
  for (const id of Object.keys(NOVA_PIEZAS.cascos)) {
    const H = NOVA_PIEZAS.cascos[id], F = NOVA_CASCOS.facciones[H.faccion], C = NV_CASCOS[id];
    const b = nvEl('nv-carta nv-nave', '', 'button'); b.style.setProperty('--col', NOVA_ARMAS.cargas[C.arma[1]].color);
    const cv = document.createElement('canvas'); cv.width = 110; cv.height = 150; b.appendChild(cv); nvPreview(cv, id);
    const t = nvEl('nv-ntxt'); t.appendChild(nvEl('nv-ctipo', tr(F.nombre)));
    t.appendChild(nvEl('nv-cnom', tr(H.nombre)));
    t.appendChild(nvEl('nv-cdet', tr(F.casco) + '. ' + tr(F.afinidad)));
    t.appendChild(nvEl('nv-cdet', tr('Empiezas con') + ': ' + tr(NOVA_ARMAS.portadores[C.arma[0]].nombre) + ' · ' + tr(NOVA_ARMAS.cargas[C.arma[1]].nombre)));
    b.appendChild(t); b.onclick = () => { cont.textContent = ''; NVP.casco = id; nvEmpieza(id); };
    p.appendChild(b);
  }
  const s = nvEl('nv-boton', tr('Salir'), 'button'); s.onclick = () => { cont.textContent = ''; nvSalir(); }; p.appendChild(s);
  cont.appendChild(p);
}

// ---------- estación: reparar y cambiar armas por chatarra de la cartera ----------
function nvRenderEstacion(S) {
  const cont = document.getElementById('nv-paneles'); cont.textContent = '';
  const n = S.nave, p = nvEl('nv-panel'); p.appendChild(nvEl('nv-titulo', tr('ESTACIÓN')));
  p.appendChild(nvEl('nv-cdet', tr('Chatarra para gastar') + ': ' + Math.floor(S.cartera)));
  const rep = nvEl('nv-boton', tr('Reparar casco') + ' (40)', 'button'); rep.disabled = S.cartera < 40 || n.hp >= n.hpMax;
  rep.onclick = () => { S.cartera -= 40; n.hp = n.hpMax; nvRenderEstacion(S); }; p.appendChild(rep);
  if (!S.estSel) {
    p.appendChild(nvEl('nv-cdet', tr('Cambiar un arma')));
    for (const w of n.armas) {
      if (w.portador === 'defensa') continue;
      const b = nvEl('nv-carta', '', 'button'); b.style.setProperty('--col', NOVA_ARMAS.cargas[w.carga].color);
      b.appendChild(nvEl('nv-cnom', nvNombreArma(w) + (w.nivel ? ' +' + w.nivel : '')));
      b.appendChild(nvEl('nv-cdet', tr(w.cara) + ' · ' + w.tam));
      b.onclick = () => { S.estSel = { w, ofertas: nvOfertasEstacion(S, w.slot) }; nvRenderEstacion(S); };
      p.appendChild(b);
    }
  } else {
    p.appendChild(nvEl('nv-cdet', tr('Sustituir') + ': ' + nvNombreArma(S.estSel.w)));
    for (const o of S.estSel.ofertas) {
      const b = nvEl('nv-carta', '', 'button'); b.style.setProperty('--col', NOVA_ARMAS.cargas[o.carga].color); b.disabled = S.cartera < o.precio;
      b.appendChild(nvEl('nv-cnom', tr(NOVA_ARMAS.portadores[o.portador].nombre) + ' · ' + tr(NOVA_ARMAS.cargas[o.carga].nombre)));
      b.appendChild(nvEl('nv-cdet', tr(NOVA_ARMAS.portadores[o.portador].fuerte) + ' · ' + o.precio));
      b.onclick = () => { nvCompraArma(S, o, S.estSel.w); S.estSel = null; nvRenderEstacion(S); };
      p.appendChild(b);
    }
    const at = nvEl('nv-boton', tr('Atrás'), 'button'); at.onclick = () => { S.estSel = null; nvRenderEstacion(S); }; p.appendChild(at);
  }
  const sa = nvEl('nv-boton', tr('Salir'), 'button');
  sa.onclick = () => { cont.textContent = ''; S.est.cd = 25; S.est = null; S.estVista = null; S.estado = 'juego'; };
  p.appendChild(sa); cont.appendChild(p);
}
