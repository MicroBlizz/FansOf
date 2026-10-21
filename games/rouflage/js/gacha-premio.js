// Fans of Rouflage · EL PREMIO DEL GACHAPÓN: lo que sale de las cápsulas, a pantalla completa y en el centro, como en el Rumble. Con una cápsula, la
// carta grande (entra con zoom y rebote, la pieza dibujada en grande, nombre, rareza, categoría y el sello «¡NUEVO!» o «REPETIDA +X»); con diez, una
// rejilla que se destapa cápsula a cápsula (la mejor, la última y temblando) y arriba la mejor en grande (tocar otra la pone ahí). Detrás, en un
// lienzo, rayos del color de la rareza que giran, brillo y chispas. La llama gachaTirar (gacha-pantalla.js) cuando la animación de core abre la cápsula.
'use strict';

const GPREMIO = { sale: null, sel: 0, mejor: 0, raf: 0, parts: [], ultimo: 0, chispaT: 0, destello: 0, timers: [], hecho: true };
const RAR_RANGO = { comun: 0, rara: 1, epica: 2, legend: 3 };
const GP_CONF = ['#ff4b5c', '#ff7a1a', '#ffcb3d', '#7ee04a', '#39d5e8', '#3a7de0', '#b45cff'];      // los colores de la gota de pintura (diario.js)

// lo que se ve: la capa entera (#gacha-result), con la carta o la rejilla, y los botones debajo
function gachaPremio(sale) {
  const G = GPREMIO; gpLimpia();
  G.sale = sale; G.hecho = false; G.parts = []; G.destello = 0; G.vista = sale.length > 1 ? 'comun' : sale[0].it.r;
  G.mejor = sale.reduce((b, x, i) => (RAR_RANGO[x.it.r] > RAR_RANGO[sale[b].it.r] || (RAR_RANGO[x.it.r] === RAR_RANGO[sale[b].it.r] && x.nuevo && !sale[b].nuevo) ? i : b), 0);
  G.sel = G.mejor;
  const gr = E('gacha-result'), res = E('gacha-res'), cab = E('gacha-cab');
  gr.classList.toggle('gp-multi', sale.length > 1); gr.classList.remove('gp-listo');
  gr.dataset.rar = G.vista;
  res.innerHTML = ''; cab.innerHTML = '';
  if (sale.length === 1) {
    res.appendChild(gpCarta(sale[0], false));
    G.timers.push(setTimeout(() => gpExplota(gpFoco(), sale[0].it.r, true), 60));
    G.timers.push(setTimeout(gpTermina, 650));
  } else {
    const n = k => sale.filter(x => x.it.r === k).length, nuevos = sale.filter(x => x.nuevo).length;
    const PLURAL = { comun: '{n} Comunes', rara: '{n} Raras', epica: '{n} Épicas', legend: '{n} Legendarias' };      // «1 Rara · 3 Comunes»
    const resumen = ['legend', 'epica', 'rara', 'comun'].filter(n).map(k => `<span class="gp-r-${k}">${esc(n(k) === 1 ? '1 ' + tr(RAREZA_AR[k]) : tr(PLURAL[k], { n: n(k) }))}</span>`);
    if (nuevos) resumen.push(`<span class="gp-r-nuevo">${esc(nuevos === 1 ? tr('1 nueva') : tr('{n} nuevas', { n: nuevos }))}</span>`);
    cab.innerHTML = `<b class="ol">${esc(tr('TIRADA x{n}', { n: sale.length }))}</b><small>${resumen.join(' · ')}</small>`;
    // arriba, mientras se destapan, una cápsula grande que espera a la mejor; al final, la mejor en su carta
    const foco = document.createElement('div'); foco.className = 'gp-foco'; foco.id = 'gacha-foco'; res.appendChild(foco);
    const espera = arLienzo(120, 120, 'gp-espera'); arPinta(espera, (c, w) => GACHA_FX.util.capsula(c, w / 2, w / 2, w * 0.36, '#ffcb3d')); foco.appendChild(espera);
    const rej = document.createElement('div'); rej.className = 'gp-rejilla'; res.appendChild(rej);
    sale.forEach((x, i) => rej.appendChild(gpCasilla(x, i)));
    // se destapan en orden; la mejor, la última y con suspense
    const orden = sale.map((_, i) => i).filter(i => i !== G.mejor), paso = 170, suspense = RAR_RANGO[sale[G.mejor].it.r] >= 2 ? 900 : 450;
    orden.forEach((i, k) => G.timers.push(setTimeout(() => gpDestapa(i), 350 + k * paso)));
    const tMejor = 350 + orden.length * paso;
    G.timers.push(setTimeout(() => { const c = rej.children[G.mejor]; if (c) c.classList.add('tiembla'); E('gacha-foco').classList.add('tiembla'); if (RAR_RANGO[sale[G.mejor].it.r] >= 2) play('roll'); }, tMejor));
    G.timers.push(setTimeout(() => { gpDestapa(G.mejor); gpPonFoco(G.mejor); gpExplota(gpFoco(), sale[G.mejor].it.r, true); }, tMejor + suspense));
    G.timers.push(setTimeout(gpTermina, tMejor + suspense + 450));
  }
  gpBotones();
  gr.hidden = false;
  gpLienzo();
  if (!G.raf) { G.ultimo = performance.now(); G.raf = requestAnimationFrame(gpFotograma); }
}
function gpLimpia() { GPREMIO.timers.forEach(clearTimeout); GPREMIO.timers = []; }
// todo destapado: el foco con la mejor y los botones (tocar la capa durante la revelación lo adelanta)
function gpTermina() {
  const G = GPREMIO; if (G.hecho) return;
  gpLimpia(); G.hecho = true;
  if (G.sale.length > 1) { G.sale.forEach((_, i) => gpDestapa(i, true)); if (!E('gacha-foco').querySelector('.gp-carta')) gpPonFoco(G.mejor); }
  E('gacha-result').classList.add('gp-listo');
  GACHA_UI.ocupado = false; gachaPinta();
}

// la carta de una pieza: cinta con la rareza, la pieza en grande sobre su peana, nombre, categoría y el sello
function gpCarta(x, compacta) {
  const d = document.createElement('div'); d.className = 'gp-carta gp-' + x.it.r + (compacta ? ' compacta' : '');
  const cinta = document.createElement('div'); cinta.className = 'gp-cinta ol'; cinta.textContent = tr(RAREZA_AR[x.it.r]).toUpperCase(); d.appendChild(cinta);
  const peana = document.createElement('div'); peana.className = 'gp-peana';
  const px = compacta ? 92 : 150, k = arLienzo(px, px); arPinta(k, (c, w) => x.it.x(c, w)); peana.appendChild(k); d.appendChild(peana);
  const n = document.createElement('b'); n.className = 'gp-nombre ol'; n.textContent = tr(x.it.n); d.appendChild(n);
  const s = document.createElement('small'); s.className = 'gp-cat'; s.textContent = tr(arCat(x.cat).corto); d.appendChild(s);
  const sello = document.createElement('div'); sello.className = 'gp-sello ol ' + (x.nuevo ? 'nuevo' : 'repe');
  if (x.nuevo) sello.textContent = tr('¡NUEVO!');
  else { sello.textContent = tr('REPETIDA +{n}', { n: x.devuelve }); sello.appendChild(iconoPeq(pintaGotas, 18)); }
  d.appendChild(sello);
  return d;
}
// una casilla de la rejilla: primero una cápsula cerrada; al destaparse, la pieza
function gpCasilla(x, i) {
  const b = document.createElement('button'); b.type = 'button'; b.className = 'gp-casilla gp-' + x.it.r + (i === GPREMIO.mejor ? ' mejor' : '') + (x.nuevo ? ' nuevo' : '');
  b.setAttribute('aria-label', tr(x.it.n) + ', ' + tr(RAREZA_AR[x.it.r]));
  const tapa = arLienzo(40, 40, 'gp-tapa'); arPinta(tapa, (c, w) => GACHA_FX.util.capsula(c, w / 2, w / 2, w * 0.4, GACHA_FX.util.BOLAS[i % 6])); b.appendChild(tapa);
  const cara = document.createElement('span'); cara.className = 'gp-cara';
  const k = arLienzo(46, 46); arPinta(k, (c, w) => x.it.x(c, w)); cara.appendChild(k);
  const n = document.createElement('small'); n.textContent = tr(x.it.n); cara.appendChild(n);
  if (x.nuevo) { const t = document.createElement('i'); t.className = 'ol'; t.textContent = tr('¡NUEVO!'); cara.appendChild(t); }
  b.appendChild(cara);
  b.onclick = () => { if (!b.classList.contains('abierta')) return; play('select'); gpPonFoco(i); };
  return b;
}
function gpDestapa(i, callado) {
  const c = E('gacha-res').querySelector('.gp-rejilla').children[i]; if (!c || c.classList.contains('abierta')) return;
  c.classList.remove('tiembla'); c.classList.add('abierta');
  const r = GPREMIO.sale[i].it.r, top = RAR_RANGO[r] >= 2;
  if (RAR_RANGO[r] > RAR_RANGO[GPREMIO.vista]) E('gacha-result').dataset.rar = GPREMIO.vista = r;      // los rayos toman el color de lo mejor que ha salido hasta ahora
  if (callado) return;
  play(top ? 'crown' : 'pop'); gpExplota(c, r, i === GPREMIO.mejor && top);
}
function gpPonFoco(i) {
  const G = GPREMIO, f = E('gacha-foco'); if (!f) return;
  G.sel = i; E('gacha-result').dataset.rar = G.sale[i].it.r; f.classList.remove('tiembla'); f.innerHTML = ''; f.appendChild(gpCarta(G.sale[i], true));
  E('gacha-res').querySelectorAll('.gp-casilla').forEach((c, k) => c.classList.toggle('sel', k === i));
  gpBotones();
}
// los botones: PONÉRMELO (o A MI ESCENARIO, si es un mueble o un escenario) de la pieza que se ve, y ¡VALE!
function gpBotones() {
  const G = GPREMIO, caja = E('gacha-botones'), x = G.sale && G.sale[G.sel];
  const viejo = caja.querySelector('.gp-accion'); if (viejo) viejo.remove();
  if (!x || !x.nuevo || (arCat(x.cat).conjuntos && !arCat(x.cat).sala)) return;
  const b = document.createElement('button'); b.type = 'button'; b.className = 'boton gp-accion';
  if (arCat(x.cat).sala) {      // un mueble o un escenario: a tu sala (escenario.js)
    b.textContent = tr('A MI ESCENARIO');
    b.onclick = () => { play('select'); clearInterval(_gachaReloj); E('gacha-result').hidden = true; if (x.cat === 'escenarios') { SAVE.escenario = Object.assign({}, SAVE.escenario || {}, { id: x.it.id }); guardaPartida(); abreEscenario(); } else abreEscenario(x.it.id); };
  } else {
    const puesto = armarioEstado().puesto[x.cat] === x.it.id;
    b.textContent = tr(puesto ? 'Puesto' : 'Ponérmelo'); b.disabled = puesto;
    b.onclick = () => { armarioEstado().puesto[x.cat] = x.it.id; guardaPartida(); play('crown'); b.disabled = true; b.textContent = tr('Puesto'); gpExplota(gpFoco(), x.it.r, false); };
  }
  caja.insertBefore(b, E('b-gacha-vale'));
}

/* ---------- el lienzo de detrás: rayos que giran, brillo y chispas ---------- */
const gpFoco = () => document.querySelector('#gacha-result .gp-peana, #gacha-result .gp-espera') || E('gacha-res');
function gpLienzo() {
  const cv = E('gacha-luz'), d = Math.min(2, window.devicePixelRatio || 1), w = innerWidth, h = innerHeight;
  if (cv.width !== Math.round(w * d) || cv.height !== Math.round(h * d)) { cv.width = Math.round(w * d); cv.height = Math.round(h * d); }
  GPREMIO.d = d; GPREMIO.w = w; GPREMIO.h = h;
}
function gpCentro(el) { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2, r.width]; }
// una explosión de chispas (y confeti si es épica o legendaria) desde un elemento
function gpExplota(el, rar, grande) {
  if (!el) return;
  const [x, y] = gpCentro(el), [claro] = GACHA_COLOR[rar] || GACHA_COLOR.comun, top = RAR_RANGO[rar] >= 2, n = grande ? (rar === 'legend' ? 90 : 60) : top ? 26 : 12;
  for (let i = 0; i < n; i++) {
    const a = Math.random() * TAU, v = (grande ? 260 : 150) * (0.35 + Math.random() * 0.75), conf = top && i % 2 === 0;
    GPREMIO.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - (conf ? 120 : 0), vida: 0.7 + Math.random() * 0.7, max: 1.4, s: 2.5 + Math.random() * (grande ? 4 : 3),
      col: conf ? GP_CONF[i % GP_CONF.length] : i % 3 ? claro : '#fff6ea', tipo: conf ? 'confeti' : i % 4 === 0 ? 'estrella' : 'punto', rot: Math.random() * 6, vr: (Math.random() - 0.5) * 16 });
  }
  if (grande) GPREMIO.destello = top ? 0.85 : 0.45;
}
function gpEstrella(c, x, y, r, col, rot) {
  c.save(); c.translate(x, y); c.rotate(rot); c.beginPath();
  for (let i = 0; i < 8; i++) { const k = i % 2 ? r * 0.32 : r; c.lineTo(Math.cos(i * TAU / 8) * k, Math.sin(i * TAU / 8) * k); }
  c.closePath(); c.fillStyle = col; c.fill(); if (r > 5) { c.lineWidth = 1.6; c.strokeStyle = OL; c.stroke(); }
  c.restore();
}
function gpFotograma(now) {
  const G = GPREMIO, gr = E('gacha-result');
  if (gr.hidden || E('p-gacha').hidden) { G.raf = 0; gpLimpia(); return; }
  const dt = Math.min(0.05, (now - G.ultimo) / 1000); G.ultimo = now;
  if (innerWidth !== G.w || innerHeight !== G.h) gpLienzo();
  const cv = E('gacha-luz'), c = cv.getContext('2d'), W = G.w, H = G.h, t = now / 1000;
  c.setTransform(G.d, 0, 0, G.d, 0, 0); c.clearRect(0, 0, W, H);
  const rar = G.hecho ? G.sale[G.sel].it.r : G.vista, [claro, oscuro] = GACHA_COLOR[rar] || GACHA_COLOR.comun, rango = RAR_RANGO[rar];
  const [fx, fy, fw] = gpCentro(gpFoco()), largo = Math.hypot(W, H);
  // dos capas de rayos que giran en sentidos contrarios, del color de la rareza, que se apagan hacia fuera
  for (const [n, giro, alfa, col, ancho] of [[16, 0.22, 0.30 + rango * 0.07, claro, 0.085], [11, -0.14, 0.18 + rango * 0.05, oscuro, 0.06]]) {
    const g = c.createRadialGradient(fx, fy, fw * 0.2, fx, fy, largo * 0.62); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.save(); c.translate(fx, fy); c.rotate(t * giro); c.globalAlpha = alfa; c.fillStyle = g; c.beginPath();
    for (let i = 0; i < n; i++) { const a = i * TAU / n; c.moveTo(0, 0); c.lineTo(Math.cos(a - ancho) * largo, Math.sin(a - ancho) * largo); c.lineTo(Math.cos(a + ancho) * largo, Math.sin(a + ancho) * largo); c.closePath(); }
    c.translate(-fx, -fy); c.fill(); c.restore();
  }
  // el brillo detrás de la pieza, que late
  const br = c.createRadialGradient(fx, fy, 0, fx, fy, fw * (1.25 + 0.08 * Math.sin(t * 3))); br.addColorStop(0, claro); br.addColorStop(1, 'rgba(0,0,0,0)');
  c.globalAlpha = 0.55 + rango * 0.1; c.fillStyle = br; c.beginPath(); c.arc(fx, fy, fw * 1.4, 0, TAU); c.fill(); c.globalAlpha = 1;
  // la mejor de la rejilla brilla también donde está
  const mej = gr.querySelector('.gp-casilla.mejor.abierta');
  if (mej && G.sale.length > 1) { const [mx, my, mw] = gpCentro(mej), [mc] = GACHA_COLOR[G.sale[G.mejor].it.r]; const g2 = c.createRadialGradient(mx, my, 0, mx, my, mw); g2.addColorStop(0, mc); g2.addColorStop(1, 'rgba(0,0,0,0)'); c.globalAlpha = 0.6; c.fillStyle = g2; c.fillRect(mx - mw, my - mw, mw * 2, mw * 2); c.globalAlpha = 1; }
  // destellos que aparecen y se apagan alrededor de la pieza (más cuanto mejor es)
  G.chispaT -= dt;
  if (G.chispaT <= 0) {
    G.chispaT = 0.16 - rango * 0.03;
    const a = Math.random() * TAU, rr = fw * (0.55 + Math.random() * 0.75);
    G.parts.push({ x: fx + Math.cos(a) * rr, y: fy + Math.sin(a) * rr, vx: 0, vy: -12, vida: 0.9, max: 0.9, s: 5 + Math.random() * 6, col: Math.random() < 0.5 ? '#fff6ea' : claro, tipo: 'brillo', rot: Math.random() });
    if (rango === 3 && Math.random() < 0.5) G.parts.push({ x: Math.random() * W, y: -10, vx: (Math.random() - 0.5) * 40, vy: 60, vida: 3, max: 3, s: 3 + Math.random() * 3, col: GP_CONF[Math.floor(Math.random() * 7)], tipo: 'confeti', rot: 0, vr: (Math.random() - 0.5) * 10 });
  }
  for (const p of G.parts) {
    p.vida -= dt; p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.tipo === 'confeti') { p.vy += 300 * dt; p.vx *= 0.99; p.rot += p.vr * dt; } else if (p.tipo !== 'brillo') { p.vy += 140 * dt; p.vx *= 0.97; p.vy *= 0.97; }
    const a = Math.max(0, Math.min(1, p.vida / p.max * 1.6)); c.globalAlpha = a;
    if (p.tipo === 'brillo') { const k = Math.sin(Math.PI * (1 - p.vida / p.max)); gpEstrella(c, p.x, p.y, p.s * k, p.col, p.rot); }
    else if (p.tipo === 'estrella') gpEstrella(c, p.x, p.y, p.s * 1.4, p.col, p.rot += dt * 3);
    else if (p.tipo === 'confeti') { c.save(); c.translate(p.x, p.y); c.rotate(p.rot); c.fillStyle = p.col; c.fillRect(-p.s, -p.s * 0.45, p.s * 2, p.s * 0.9); c.restore(); }
    else { c.beginPath(); c.arc(p.x, p.y, p.s, 0, TAU); c.fillStyle = p.col; c.fill(); }
  }
  c.globalAlpha = 1; G.parts = G.parts.filter(p => p.vida > 0);
  if (G.destello > 0) { c.globalAlpha = G.destello; c.fillStyle = '#fff6ea'; c.fillRect(0, 0, W, H); c.globalAlpha = 1; G.destello = Math.max(0, G.destello - dt * 3.2); }
  G.raf = requestAnimationFrame(gpFotograma);
}
function preparaGachaPremio() {
  // tocar la capa mientras se destapa lo enseña todo de golpe
  E('gacha-result').addEventListener('pointerdown', e => { if (!GPREMIO.hecho && !e.target.closest('button.boton')) gpTermina(); });
  addEventListener('resize', () => { if (!E('gacha-result').hidden) gpLienzo(); });
}
