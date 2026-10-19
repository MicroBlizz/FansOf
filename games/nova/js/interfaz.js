// Fans of Nova · Interfaz de la partida: lienzo, entrada táctil y de teclado, HUD, cartas de rango y pantalla final.
'use strict';
const NVI = { cartasVistas: null, finVisto: null };

function nvAjustaLienzo() {
  const cv = document.getElementById('nv-canvas'), st = document.getElementById('stage');
  if (!cv || !st) return;
  const r = window.devicePixelRatio || 1, d = Math.max(Math.min(1, r), Math.min(2, r) * (NVP.calidad || 1)),   // la calidad adaptable nunca baja de 1 px por punto
        w = cv.clientWidth || st.clientWidth, h = cv.clientHeight || st.clientHeight;
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
  const ant = n.rango > 1 ? nvUmbralS(S, n.rango - 1) : 0, sig = nvUmbralS(S, n.rango);
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
// Minimapa: el sector entero centrado en ti (no tiene bordes, da la vuelta) con estaciones (azul), nidos (rojo), capitanes (rosa), pecios y el Rey (dorado).
function nvMinimapa(c, S, W, H, u) {
  const R = 52 * u, n = S.nave, k = R / (nvLado(S) / 2), x0 = W - R - 10 * u, y0 = H - R - 10 * u, x = x0 - n.x * k, y = y0 - n.y * k;
  c.save(); c.beginPath(); c.arc(x0, y0, R, 0, 6.283); c.fillStyle = 'rgba(8,12,40,.7)'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#1a0f2e'; c.stroke(); c.clip();
  const punto = (px, py, col, r) => { c.fillStyle = col; c.fillRect(x + px * k - r, y + py * k - r, 2 * r, 2 * r); };
  for (const p of S.pecios) punto(p.x, p.y, p.rara ? '#ffd93d' : '#6fe3ff', 1.2 * u);
  for (const st of S.estaciones) punto(st.x, st.y, '#7aa8ff', 3 * u);
  for (const e of S.enem) { if (e.muerto) continue; if (e.d.nido) punto(e.x, e.y, '#ff5b5b', 2.6 * u); else if (e.d.capitan) punto(e.x, e.y, '#ff4b9a', 3 * u); else if (e.d.jefe) punto(e.x, e.y, '#ffd93d', 4 * u); }
  c.fillStyle = '#fff'; c.beginPath(); c.arc(x0, y0, 3 * u, 0, 6.283); c.fill();
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
      const celda = nvEl('nv-celda'), col = NOVA_ARMAS.cargas[c.carga] ? NOVA_ARMAS.cargas[c.carga].color : '#ff9a3c';
      const b = nvEl('nv-carta' + (c.rareza && c.rareza !== 'comun' ? ' nv-rar-' + c.rareza : ''), '', 'button'); b.style.setProperty('--col', col);
      const tipo = nvEl('nv-ctipo', tr({ arma: 'ARMA', mejora: 'MEJORA', fusion: 'FUSIÓN', defensa: 'DEFENSA', sistema: 'SISTEMA', basura: 'MEME' }[c.tipo]) + (c.tendencia ? ' · ' + tr('ENCAJA') : ''));
      if (c.rareza && (c.tipo === 'arma' || c.tipo === 'defensa')) { const r = nvEl('nv-rareza', ' · ' + tr(NOVA_RAREZAS[c.rareza].nombre).toUpperCase(), 'span'); r.style.color = NOVA_RAREZAS[c.rareza].color; tipo.appendChild(r); }
      b.appendChild(tipo);
      b.appendChild(nvEl('nv-cnom', c.titulo)); b.appendChild(nvEl('nv-cdet', c.detalle));
      if (c.ic) nvConIcono(b, c.ic[0], c.ic[1], col, 52);
      b.onclick = () => { nvElegirCarta(S, i); cont.textContent = ''; NVI.cartasVistas = null; };
      const rr = nvEl('nv-boton nv-chico', tr('Repetir esta carta') + ' (' + S.rr[i] + ')', 'button'); rr.disabled = !(S.rr[i] > 0);
      rr.onclick = () => { nvRerollCarta(S, i); };
      celda.appendChild(b); celda.appendChild(rr); p.appendChild(celda);
    });
    nvInfo(p, S.cartas.some(c => c.tipo === 'fusion') ? ['cartas', 'armas', 'fusion'] : ['cartas', 'armas']); cont.appendChild(p);
  } else if (S.estado !== 'cartas' && NVI.cartasVistas) { NVI.cartasVistas = null; cont.textContent = ''; }
  if (S.estado === 'estacion' && S.estVista !== S.est) { S.estVista = S.est; S.estSel = null; nvRenderEstacion(S); }
  if ((S.estado === 'victoria' || S.estado === 'derrota') && NVI.finVisto !== S) {
    NVI.finVisto = S; cont.textContent = '';
    const p = nvEl('nv-panel'), ok = S.estado === 'victoria';
    p.appendChild(nvEl('nv-titulo', ok ? tr('¡SECTOR LIMPIO!') : tr('NAVE DESTRUIDA')));
    const l = [[tr('Tiempo'), Math.floor(S.t / 60) + ':' + String(Math.floor(S.t % 60)).padStart(2, '0')], [tr('Rango'), S.nave.rango], [tr('Enemigos destruidos'), S.stats.muertos], [tr('Restos devorados'), S.stats.tragados], [tr('Daño total'), Math.round(S.stats.dano)], [tr('Mayor golpe'), Math.round(S.stats.mayor)], [tr('Aleación ganada'), nvCierraMision(S) || S.aleacionGanada || 0]];
    for (const [a, b] of l) { const f = nvEl('nv-fila'); f.appendChild(nvEl('', a)); f.appendChild(nvEl('', String(b))); p.appendChild(f); }
    const re = Object.keys(S.stats.reacciones);
    if (re.length) p.appendChild(nvEl('nv-cdet', tr('Reacciones') + ': ' + re.map(k => tr(NOVA_ARMAS.reacciones.find(r => r.id === k).nombre) + ' ×' + S.stats.reacciones[k]).join(', ')));
    if (ok && S.sector && !NVP.gal[S.sector].base) p.appendChild(nvEl('nv-cdet', tr('Sector liberado: se abren sus vecinos en la galaxia')));
    if (ok && S.desbloqueos && S.desbloqueos.length) p.appendChild(nvEl('nv-cdet', tr('¡Desbloqueado!') + ' ' + S.desbloqueos.map(x => tr(x)).join(', ')));
    const b = nvEl('nv-boton', tr('Volver a la galaxia'), 'button'); b.onclick = () => { cont.textContent = ''; NVI.finVisto = null; nvParar(); nvGalaxiaMenu(); };
    const s = nvEl('nv-boton', tr('Salir'), 'button'); s.onclick = () => { cont.textContent = ''; nvSalir(); };
    p.appendChild(b); p.appendChild(s); cont.appendChild(p);
  }
}
function nvSalir() {
  nvParar(); NVI.cartasVistas = null; NVI.finVisto = null;
  document.getElementById('nv-partida').hidden = true;
  document.getElementById('nv-portada').hidden = false;
  nvPintaMenu();
}
function nvJugar() {
  document.getElementById('nv-portada').hidden = true;
  document.getElementById('nv-partida').hidden = false;
  nvAjustaLienzo();
  nvMenu();
}

// ---------- menú de naves: cada facción empieza con un arma de su clase ----------
function nvPreview(cv, casco, rango) {
  rango = rango || nvRangoInicial();   // la nave que sale al desplegar: la de tu nivel
  const c = cv.getContext('2d'), H = nvHull(casco, rango), [tm, tam] = nvMotorRango(casco, rango), k = nvClase(rango, casco), e = cv.height / (330 + 80 * k);
  c.clearRect(0, 0, cv.width, cv.height); c.save(); c.translate(cv.width / 2, cv.height * 0.55); c.scale(e, e);
  nvCuerpo(c, casco, k, 'alas'); nvPieza(c, 'motor-' + tm + '-' + tam, H.motor.x, H.motor.y); nvCuerpo(c, casco, k, 'casco');
  c.restore();
}
// Antes de la misión: nave, capitán y un oficial (tres pasos en el mismo panel).
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
    t.appendChild(nvEl('nv-cdet', tr(NV_ETAPAS[nvClase(nvRangoInicial(), id)].nombre) + ' · ' + tr('Evoluciona') + ': ' + NV_ETAPAS.slice(nvClase(nvRangoInicial(), id) + 1).filter(x => !x.jefe || nvJefeLibre(id)).map(x => tr(x.nombre) + ' ' + x.desde).join(' → ')));
    const VI = C.arma[2] && NV_VAR_ID[C.arma[2]];
    t.appendChild(nvEl('nv-cdet', VI ? tr('Arma insignia') + ': ' + tr(VI.nombre) + '. ' + tr(VI.efecto) : tr('Empiezas con') + ': ' + tr(NOVA_ARMAS.portadores[C.arma[0]].nombre) + ' · ' + tr(NOVA_ARMAS.cargas[C.arma[1]].nombre)));
    b.appendChild(t); b.onclick = () => nvMenuCapitan(id);
    p.appendChild(b);
  }
  const s = nvEl('nv-boton', tr('Atrás'), 'button'); s.onclick = nvGalaxiaMenu; p.appendChild(s);
  nvInfo(p, ['nave', 'armasFaccion']);
  cont.appendChild(p);
}
function nvMenuCapitan(casco) {
  const cont = document.getElementById('nv-paneles'); cont.textContent = '';
  const p = nvEl('nv-panel'); p.appendChild(nvEl('nv-titulo', tr('ELIGE TU CAPITÁN')));
  for (const id of nvComandantes()) {   // en campaña: el líder y las unidades de tu facción (comandantes.js)
    const K = NOVA_TRIPULACION.capitanes.find(c => c.id === id), fc = nvCapFaceta(id), fac = K ? K.faccion : nvFaccionCampana(), F = NOVA_CASCOS.facciones[fac];
    const b = nvEl('nv-carta', '', 'button'); b.style.setProperty('--col', '#ffd93d');
    b.appendChild(nvEl('nv-ctipo', tr(F.nombre) + (nvFaccionCampana() ? ' · ' + tr(K ? 'Líder' : 'Unidad') : '')));
    b.appendChild(nvEl('nv-cnom', tr(nvCapNombre(id))));
    if (fc) b.appendChild(nvEl('nv-cdet', tr(NOVA_TRIPULACION.facetas[fc].nombre) + ': ' + tr(NV_OFICIAL_TXT[fc])));
    else {
      b.appendChild(nvEl('nv-cdet', tr(id === 'progamer' ? 'Sin bonus ni pega: cifras base' : K.ventaja)));
      if (K.pega && K.pega !== 'Ninguna') b.appendChild(nvEl('nv-cdet', tr('Pega') + ': ' + tr(K.pega)));
    }
    nvConIcono(b, 'cap', id, NV_COL_CAP[id] || NV_FAC_COLOR[fac], 58);
    b.onclick = () => nvMenuOficial(casco, id);
    p.appendChild(b);
  }
  const at = nvEl('nv-boton', tr('Atrás'), 'button'); at.onclick = nvMenu; p.appendChild(at);
  nvInfo(p, 'capitan');
  cont.appendChild(p);
}
function nvMenuOficial(casco, cap) {
  const cont = document.getElementById('nv-paneles'); cont.textContent = '';
  const p = nvEl('nv-panel'); p.appendChild(nvEl('nv-titulo', tr('ELIGE UN OFICIAL')));
  for (const id of Object.keys(NV_OFICIALES)) {
    const F = NOVA_TRIPULACION.facetas[id];
    const b = nvEl('nv-carta', '', 'button'); b.style.setProperty('--col', '#6fc4ff');
    b.appendChild(nvEl('nv-cnom', tr(F.nombre)));
    b.appendChild(nvEl('nv-cdet', tr(NV_OFICIAL_TXT[id])));
    nvConIcono(b, 'fac', id, '#6fc4ff', 52);
    b.onclick = () => { cont.textContent = ''; NVP.casco = casco; NVP.cap = cap; NVP.ofi = id; nvEmpieza(casco, cap, id); };
    p.appendChild(b);
  }
  const at = nvEl('nv-boton', tr('Atrás'), 'button'); at.onclick = () => nvMenuCapitan(casco); p.appendChild(at);
  nvInfo(p, 'oficial');
  cont.appendChild(p);
}
const NV_COL_CAP = { progamer: '#6fc4ff', bunny: '#ff9a3c', necrolord: '#7ad06b', twitchking: '#b46bff', epicchampion: '#ff5b5b' };
const NV_OFICIAL_TXT = { fuego: 'Daño +10 %', defensa: 'Casco +15 %', ingenieria: 'Reparación automática y un 1 % de robo de casco', tacticas: 'Una repetición de cartas más en cada subida', navegacion: 'Velocidad +8 % y la chatarra te alcanza de más lejos' };

// ---------- estación: reparar y cambiar armas por chatarra de la cartera ----------
function nvTile(w, sel) {   // una arma como ficha: icono, nombre y el tamaño grande en la esquina
  const b = nvEl('nv-carta nv-celda' + (sel ? ' nv-sel' : ''), '', 'button'); b.style.setProperty('--col', NOVA_ARMAS.cargas[w.carga].color);
  b.appendChild(nvEl('nv-cnom', nvNombreArma(w) + (w.nivel ? ' +' + w.nivel : '')));
  b.appendChild(nvEl('nv-cdet', tr(w.cara) + ' · ' + tr({ S: 'pequeña', M: 'mediana', L: 'grande' }[w.tam])));
  nvConIcono(b, 'arma', w.portador, NOVA_ARMAS.cargas[w.carga].color, 48);
  b.appendChild(nvEl('nv-tam', w.tam));
  return b;
}
function nvRenderEstacion(S) {
  const cont = document.getElementById('nv-paneles'), vieja = cont.querySelector('.nv-panel'), scroll = vieja ? vieja.scrollTop : 0; cont.textContent = '';   // repintar no mueve el scroll
  const n = S.nave, p = nvEl('nv-panel'); p.appendChild(nvEl('nv-titulo', tr('ESTACIÓN')));
  p.appendChild(nvEl('nv-cdet', tr('Chatarra para gastar') + ': ' + Math.floor(S.cartera)));
  const rep = nvEl('nv-boton', tr('Reparar casco') + ' (40)', 'button'); rep.disabled = S.cartera < 40 || n.hp >= n.hpMax;
  rep.onclick = () => { S.cartera -= 40; n.hp = n.hpMax; nvRenderEstacion(S); }; p.appendChild(rep);
  const armas = n.armas.filter(w => w.portador !== 'defensa');
  const aviso = nvEl('nv-cdet nv-aviso'), repinta = () => nvRenderEstacion(S);   // la nave con sus anclajes: tocar uno y otro cambia las armas de sitio
  p.appendChild(nvLienzoNave(S, repinta, aviso)); p.appendChild(nvEl('nv-cdet nv-anclaje', nvTextoAnclaje(S))); p.appendChild(nvLeyendaAnclajes(S)); p.appendChild(aviso);
  if (S.estTienda) nvRenderTienda(S, p);
  else if (S.estTaller) {   // taller: unir 2 armas iguales en una mayor, o dividir una en 2 menores
    const T = S.estTaller; T.sel = T.sel.filter(w => armas.includes(w));
    const libres = nvRanuras(n.rango, S).filter(r => r.cara !== 'popa' && !n.armas.some(w => w.slot === r.id)).length;
    p.appendChild(nvEl('nv-titulo', tr('TALLER DE TAMAÑOS')));
    const rc = nvEl('nv-receta'); for (const t of ['S + S → M', 'M + M → L', 'L → M + M', 'M → S + S']) rc.appendChild(nvEl('', t)); p.appendChild(rc);
    p.appendChild(nvEl('nv-cdet', tr('Ranuras libres') + ': ' + libres + ' · ' + tr('Más tamaño = mucho más daño, alcance y bala')));
    for (const w of armas) { const t = nvTile(w, T.sel.includes(w)); t.onclick = () => { T.sel = T.sel.includes(w) ? T.sel.filter(x => x !== w) : T.sel.concat(w).slice(-2); nvRenderEstacion(S); }; p.appendChild(t); }
    const [a, b2] = T.sel;
    let pista = 'Toca 2 armas del mismo tamaño para unirlas, o 1 para dividirla';
    if (T.sel.length === 1) pista = a.tam === 'S' ? 'Toca otra pequeña para unirlas en una mediana' : 'Toca otra del mismo tamaño para unirlas, o divide esta';
    if (T.sel.length === 2) pista = nvPuedeUnir(a, b2) ? 'Se unen en una ' + (a.tam === 'S' ? 'mediana' : 'grande') : 'Tienen que ser del mismo tamaño y no grandes';
    p.appendChild(nvEl('nv-cdet', tr(pista)));
    const u = nvEl('nv-boton', tr(a && a.tam === 'M' ? 'Unir en una grande' : 'Unir en una mediana'), 'button'); u.disabled = !(T.sel.length === 2 && nvPuedeUnir(a, b2)); u.prepend(nvIcono('taller', 'unir', '#ffd93d', 26));
    u.onclick = () => { nvUneArmas(S, a, b2); T.sel = []; nvRenderEstacion(S); }; p.appendChild(u);
    const ok = T.sel.length === 1 && NV_ANT_TAM[a.tam] && nvRanuraLibre(S, a.portador);
    const d = nvEl('nv-boton', tr(a && a.tam === 'L' ? 'Dividir en 2 medianas' : 'Dividir en 2 pequeñas') + (T.sel.length === 1 && NV_ANT_TAM[a.tam] && !ok ? ' · ' + tr('sin ranura libre') : ''), 'button'); d.disabled = !ok; d.prepend(nvIcono('taller', 'dividir', '#ffd93d', 26));
    d.onclick = () => { nvDivideArma(S, a); T.sel = []; nvRenderEstacion(S); }; p.appendChild(d);
    const at = nvEl('nv-boton', tr('Atrás'), 'button'); at.onclick = () => { S.estTaller = null; nvRenderEstacion(S); }; p.appendChild(at);
  } else if (!S.estSel) {
    const ti = nvEl('nv-boton', tr('Tienda de módulos') + ' · ' + tr('comprar, mejorar y reciclar'), 'button'); ti.onclick = () => { S.estTienda = { tab: 'comprar', aviso: '' }; nvRenderEstacion(S); }; p.appendChild(ti);
    const ta = nvEl('nv-boton', tr('Taller de tamaños') + ' · ' + tr('unir y dividir armas'), 'button'); ta.onclick = () => { S.estTaller = { sel: [] }; nvRenderEstacion(S); }; p.appendChild(ta);
    p.appendChild(nvEl('nv-cdet', tr('Cambiar un arma')));
    for (const w of armas) { const t = nvTile(w, false); t.onclick = () => { S.estSel = { w, ofertas: nvOfertasEstacion(S, w.slot) }; nvRenderEstacion(S); }; p.appendChild(t); }
  } else {
    p.appendChild(nvEl('nv-cdet', tr('Sustituir') + ': ' + nvNombreArma(S.estSel.w)));
    for (const o of S.estSel.ofertas) {
      const b = nvEl('nv-carta', '', 'button'); b.style.setProperty('--col', NOVA_ARMAS.cargas[o.carga].color); b.disabled = S.cartera < o.precio;
      const V = o.variante ? NV_VAR_ID[o.variante] : null;
      b.appendChild(nvEl('nv-ctipo', tr(NOVA_RAREZAS[o.rareza].nombre).toUpperCase())); b.lastChild.style.color = NOVA_RAREZAS[o.rareza].color;
      b.appendChild(nvEl('nv-cnom', tr(V ? V.nombre : NOVA_ARMAS.portadores[o.portador].nombre) + ' · ' + tr(NOVA_ARMAS.cargas[o.carga].nombre)));
      b.appendChild(nvEl('nv-cdet', tr(V ? V.efecto : NOVA_ARMAS.portadores[o.portador].fuerte) + ' · ' + o.precio));
      nvConIcono(b, 'arma', o.variante || o.portador, NOVA_ARMAS.cargas[o.carga].color, 48);
      b.onclick = () => { nvCompraArma(S, o, S.estSel.w); S.estSel = null; nvRenderEstacion(S); };
      p.appendChild(b);
    }
    const at = nvEl('nv-boton', tr('Atrás'), 'button'); at.onclick = () => { S.estSel = null; nvRenderEstacion(S); }; p.appendChild(at);
  }
  const sa = nvEl('nv-boton', tr('Salir'), 'button');
  sa.onclick = () => { cont.textContent = ''; S.estTaller = null; S.estTienda = null; S.estSlot = null; S.est.cd = 25; S.est = null; S.estVista = null; S.estado = 'juego'; };
  p.appendChild(sa); nvInfo(p, S.estTienda ? 'tienda' : S.estTaller ? 'taller' : 'estacion'); cont.appendChild(p);
  p.scrollTop = scroll; requestAnimationFrame(() => { p.scrollTop = scroll; });
}
