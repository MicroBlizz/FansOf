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
  const ant = n.rango > 1 ? NV_CHATARRA_RANGO[n.rango - 2] : 0, sig = n.rango < 5 ? NV_CHATARRA_RANGO[n.rango - 1] : ant + 1;
  nvBarra(c, m, m + 20 * u, bw, 9 * u, n.rango < 5 ? (S.chat - ant) / (sig - ant) : 1, '#ffd93d');
  c.fillStyle = '#fff'; c.lineWidth = 4; c.strokeStyle = '#1a0f2e';
  const txt = tr('RANGO') + ' ' + n.rango + (n.rango < 5 ? '' : ' · MAX'), t = Math.floor(S.t), tt = Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0');
  c.strokeText(txt, m, m + 46 * u); c.fillText(txt, m, m + 46 * u);
  c.textAlign = 'right'; c.strokeText(tt, W - m, m + 46 * u); c.fillText(tt, W - m, m + 46 * u);
  if (S.jefe && !S.jefe.muerto) { c.textAlign = 'center'; const j = S.jefe; nvBarra(c, W * 0.2, m + 56 * u, W * 0.6, 8 * u, j.hp / j.hpMax, '#ff4b9a'); c.strokeText(tr(j.d.nombre), W / 2, m + 80 * u); c.fillText(tr(j.d.nombre), W / 2, m + 80 * u); }
  if (S.aviso) { c.textAlign = 'center'; c.font = '800 ' + 26 * u + 'px Luckiest Guy, Baloo 2, sans-serif'; c.strokeText(S.aviso.txt, W / 2, H * 0.3); c.fillText(S.aviso.txt, W / 2, H * 0.3); }
  // armas montadas, abajo
  c.textAlign = 'left'; c.font = '700 ' + 11 * u + 'px Baloo 2, sans-serif';
  const act = n.armas.filter(w => w.portador !== 'defensa');
  act.forEach((w, i) => { const y = H - m - (act.length - 1 - i) * 15 * u; c.fillStyle = NOVA_ARMAS.cargas[w.carga].color; c.fillRect(m, y - 9 * u, 8 * u, 8 * u); c.fillStyle = '#fff'; c.lineWidth = 3; c.strokeText(nvNombreArma(w) + (w.nivel ? ' +' + w.nivel : '') + ' ' + w.tam, m + 12 * u, y); c.fillText(nvNombreArma(w) + (w.nivel ? ' +' + w.nivel : '') + ' ' + w.tam, m + 12 * u, y); });
  if (NVP.joy && NVP.joy.px !== undefined) { const j = NVP.joy, r = cvRect(); c.beginPath(); c.arc((j.x - r.left) * W / r.width, (j.y - r.top) * H / r.height, 40 * u, 0, 6.283); c.strokeStyle = 'rgba(255,255,255,.3)'; c.lineWidth = 3; c.stroke(); c.beginPath(); c.arc((j.px - r.left) * W / r.width, (j.py - r.top) * H / r.height, 16 * u, 0, 6.283); c.fillStyle = 'rgba(255,255,255,.35)'; c.fill(); }
  nvPanelesDOM(S);
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
  if ((S.estado === 'victoria' || S.estado === 'derrota') && NVI.finVisto !== S) {
    NVI.finVisto = S; cont.textContent = '';
    const p = nvEl('nv-panel'), ok = S.estado === 'victoria';
    p.appendChild(nvEl('nv-titulo', ok ? tr('¡SECTOR LIMPIO!') : tr('NAVE DESTRUIDA')));
    const l = [[tr('Tiempo'), Math.floor(S.t / 60) + ':' + String(Math.floor(S.t % 60)).padStart(2, '0')], [tr('Rango'), S.nave.rango], [tr('Enemigos destruidos'), S.stats.muertos], [tr('Enemigos tragados'), S.stats.tragados], [tr('Daño total'), Math.round(S.stats.dano)], [tr('Mayor golpe'), Math.round(S.stats.mayor)], [tr('Aleación'), Math.floor(S.chat / 10)]];
    for (const [a, b] of l) { const f = nvEl('nv-fila'); f.appendChild(nvEl('', a)); f.appendChild(nvEl('', String(b))); p.appendChild(f); }
    const re = Object.keys(S.stats.reacciones);
    if (re.length) p.appendChild(nvEl('nv-cdet', tr('Reacciones') + ': ' + re.map(k => tr(NOVA_ARMAS.reacciones.find(r => r.id === k).nombre) + ' ×' + S.stats.reacciones[k]).join(', ')));
    const b = nvEl('nv-boton', tr('Jugar otra vez'), 'button'); b.onclick = () => { cont.textContent = ''; NVI.finVisto = null; nvEmpieza(); };
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
  nvEmpieza();
}
