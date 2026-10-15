// Fans of Ratkov · EL HUD: vida, frío y estados (sangrando, desincronizado, con prisa, helado, sobrepeso), el reloj de la ventisca, el arma
// con sus balas, el peso, lo que estás haciendo (registrar, recargar, curarte), la cuenta atrás de la salida, los avisos, el minimapa,
// los bolsillos y las marcas de los contenedores cercanos. Todo es HTML encima del juego, así se traduce solo.
'use strict';
const HUD = { t: 0, marcas: [], mapa: null, ultimos: {} };
function muestraHud(si) {
  el('hud').hidden = !si;
  if (si) { pintaBolsillos(); if (!HUD.mapa) HUD.mapa = planoDelMapa(4); }
}
// cambia un texto solo si es distinto (para no tocar el HTML en cada fotograma)
function pon(id, txt) { if (HUD.ultimos[id] === txt) return; HUD.ultimos[id] = txt; el(id).textContent = txt; }
function ancho(id, f) { const v = Math.round(Math.max(0, Math.min(1, f)) * 100) + '%'; if (HUD.ultimos[id] === v) return; HUD.ultimos[id] = v; el(id).style.width = v; }

// el minijuego del fuego: dos manos que se frotan cada vez que tocas (cuanto más rápido, más calienta)
function pintaFrota(dt) {
  const ver = RAID.alFuego || RAID.frotaVis > 0; el('h-frota').hidden = !ver; if (!ver) return;
  RAID.frotaVis = Math.max(0, (RAID.frotaVis || 0) - dt);
  const g = el('h-frota-c').getContext('2d'), v = RAID.frotaVis / 0.7, lado = (RAID.frotaLado || 1) * Math.round(v * 5);
  g.clearRect(0, 0, 48, 28);
  const mano = (x, y, pal) => { g.fillStyle = '#07090c'; g.fillRect(x - 1, y - 1, 14, 18); g.fillRect(x + 12, y + 3, 5, 6); g.fillStyle = pal; g.fillRect(x, y, 12, 16); g.fillRect(x + 12, y + 4, 3, 4); g.fillStyle = '#ffffff55'; g.fillRect(x + 2, y + 2, 3, 6); };
  mano(9 + lado, 7, '#c8322e'); mano(25 - lado, 5, '#8a2a2a');
  if (v > 0.2) { g.fillStyle = '#ffd27a'; for (let i = 0; i < 4; i++) g.fillRect(22 + ((i * 7 + lado * 3) % 9) - 4, 2 + ((i * 5) % 6), 2, 2); }
  const racha = RAID.frotaRacha || 0, rap = RAID.frotaVis > 0 && racha >= 4;
  pon('h-frota-t', rap ? tr('¡QUE ARDE!') : ENT.tactil ? tr('¡FROTA! TOCA RÁPIDO') : trf('¡FROTA! PULSA %1 RÁPIDO', nombreTecla(teclasDe('accion')[0])));
  el('h-frota').classList.toggle('arde', rap);
}
function avanzaHud(dt) {
  if (!JUG) return;
  const J = JUG; HUD.t += dt;
  pon('h-vida-n', String(Math.ceil(J.vida))); ancho('h-vida-b', J.vida / J.max);
  el('h-vida-b').style.background = J.vida < J.max * 0.3 ? '#ff4b5c' : '#7ee04a';
  pon('h-frio-n', String(Math.floor(J.frio))); ancho('h-frio-b', J.frio / 100);
  const ag = J.aguante == null ? 1 : J.aguante; pon('h-aguante-n', String(Math.round(ag * 100))); ancho('h-aguante-b', ag);
  // solo se toca la página cuando algo cambia (en el móvil, cada cambio cuesta)
  const colAg = J.agotado ? '#ff4b5c' : J.corre ? '#ffcb3d' : '#6ad8ff';
  if (HUD.ultimos.colAg !== colAg) { HUD.ultimos.colAg = colAg; el('h-aguante-b').style.background = colAg; }
  if (HUD.ultimos.agacha !== !!J.agacha) { HUD.ultimos.agacha = !!J.agacha; el('b-agacha').classList.toggle('activo', !!J.agacha); pon('b-agacha', J.agacha ? tr('DE PIE') : tr('AGACHARSE')); }
  // DESPEDIR: un cartel encima del enemigo al que puedes despedir por la espalda
  const bd = J.blancoDespide || J.sinAbrecartas, hd = el('h-despide'); hd.hidden = !bd; hd.classList.toggle('falta', !J.blancoDespide);
  if (bd && !J.blancoDespide) { const p = sueloAPantalla(bd.x, 2.4, bd.z); hd.style.left = Math.max(70, Math.min(innerWidth - 70, p.x)) + 'px'; hd.style.top = Math.max(40, p.y) + 'px'; pon('h-despide', tr('SIN ABRECARTAS')); }
  else if (bd) { const p = sueloAPantalla(bd.x, 2.4, bd.z); hd.style.left = Math.max(70, Math.min(innerWidth - 70, p.x)) + 'px'; hd.style.top = Math.max(40, p.y) + 'px'; pon('h-despide', ENT.tactil ? tr('DESPEDIR') : '[' + nombreTecla(teclasDe('despide')[0]) + '] ' + tr('DESPEDIR')); }
  // estados
  const est = []; if (J.sangra) est.push(['SANGRANDO', 'malo']); if (J.lag > 0) est.push(['DESINCRONIZADO', 'raro']); if (J.prisa > 0) est.push(['HORAS EXTRA', 'bien']); if (J.agacha) est.push(['AGACHADO', 'bien']); if (J.agotado) est.push(['SIN ALIENTO', 'malo']);
  if (J.frio >= 100) est.push(['CONGELÁNDOTE', 'malo']); else if (J.frio > 70) est.push(['TIRITANDO', 'malo']);
  if (fuegoCerca(J.x, J.z) < RADIO_CALOR) est.push(['AL CALOR', 'bien']);
  const colFr = fuegoCerca(J.x, J.z) < RADIO_CALOR ? '#ffb347' : ''; if (HUD.ultimos.colFr !== colFr) { HUD.ultimos.colFr = colFr; el('h-frio-b').style.background = colFr; }
  const peso = pesoEncima(RAID.eq, RAID.mochila, RAID.bolsillos, RAID.rinonera); if (peso > PESO_LIBRE) est.push(['SOBREPESO', 'malo']);
  const clave = est.map(e => e[0]).join('|');
  if (HUD.ultimos.est !== clave) { HUD.ultimos.est = clave; el('h-estados').innerHTML = est.map(([t, c]) => '<span class="' + c + '">' + esc(tr(t)) + '</span>').join(''); }
  // el reloj
  const queda = RAID.dur - RAID.t;
  pon('h-reloj-t', queda > 0 ? tr('VENTISCA EN') : tr('VENTISCA')); pon('h-reloj-n', queda > 0 ? mmss(queda) : tr('¡YA!'));
  el('h-reloj').classList.toggle('prisa', queda < 120);
  // el arma
  const o = armaJ(), st = statsArma(o);
  if (o) {
    pon('h-arma-n', nombreDe(o.id));
    pon('h-arma-m', st.anom === 'crack' ? '∞' : (o.bal || 0) + ' / ' + balasDisponibles(st.cal));
    pon('h-arma-r', J.cuelgue > 0 ? tr('NO RESPONDE') : J.recarga > 0 ? tr('RECARGANDO…') : st.anom ? tr(OBJ[o.anom].n) : '');
  } else { pon('h-arma-n', tr('SIN ARMA')); pon('h-arma-m', '—'); pon('h-arma-r', ''); }
  pon('h-peso-n', peso.toFixed(1) + ' / ' + PESO_LIBRE + ' kg'); el('h-peso').classList.toggle('malo', peso > PESO_LIBRE);
  // lo que estás haciendo
  let acc = null, f = 0;
  const r = RAID.registro;
  if (J.uso) { acc = trf('Usando: %1', nombreDe(J.uso.id)); f = 1 - J.uso.t / J.uso.max; }
  else if (J.recarga > 0) { acc = tr('Recargando'); f = 1 - J.recarga / st.rec; }
  else if (r && r.t < r.max && r.max < 50) { acc = r.c.tipo === 'verja' ? tr('Abriendo la verja') : tr('Registrando'); f = r.t / r.max; }
  el('h-accion').hidden = !acc; if (acc) { pon('h-accion-t', acc); ancho('h-accion-b', f); }
  // el botón de acción dice qué harías
  const c = RAID.cerca;
  const txt = !c ? tr('REGISTRAR') : c.tipo === 'verja' ? (c.cerrado ? tr('ABRIR VERJA') : tr('REGISTRAR')) : c.hackeo && !c.abierto ? tr('HACKEAR TERMINAL') : c.cerradura && !c.abierto ? tr('ABRIR CERRADURA') : c.abierto ? tr('MIRAR') : c.tipo === 'cadaver' ? tr('REGISTRAR CUERPO') : tr('REGISTRAR');
  const frota = !c && RAID.alFuego, txtB = RAID.trampaCerca ? tr('DESACTIVAR TRAMPA') : RAID.soborno ? trf('SOBORNAR (%1)', miles(PRECIO_SOBORNO)) : frota ? tr('FROTAR MANOS') : txt;
  pon('b-accion', J.blancoDespide ? tr('DESPEDIR') : txtB); el('b-accion').classList.toggle('apagado', !c && !frota && !J.blancoDespide && !RAID.soborno && !RAID.trampaCerca);
  pintaFrota(dt);
  // el botón de disparar (apuntado automático) se convierte en REGISTRAR si estás junto a algo y no hay nadie a tiro
  if (modoAuto()) {
    const f = el('b-fuego'), accion = (frota || !!c || !!RAID.soborno || !!RAID.trampaCerca) && !ENT.blanco && !ENT.fuego && !(c && c.tipo === 'verja' && !c.cerrado && c.abierto && !c.cosas);
    const modo = J.blancoDespide ? 'despide' : accion ? 'accion' : 'fuego';
    f.dataset.modo = modo; f.classList.toggle('accion', modo !== 'fuego'); pon('b-fuego', modo === 'despide' ? tr('DESPEDIR') : accion ? txtB : tr('DISPARAR'));
  }
  // la salida
  const s = RAID.salida; el('h-salida').hidden = !s || s.bloqueada;
  if (s && !s.bloqueada) { pon('h-salida-n', trf('SALIENDO POR: %1', tr(s.s.n).toUpperCase())); pon('h-salida-t', String(Math.ceil(s.t))); }
  // efectos de pantalla
  const u = MOTOR.postMat.uniforms; u.frio.value = Math.max(0, (J.frio - 40) / 60); u.dano.value = RAID.dano; u.lag.value = J.lag > 0 ? 0.8 : J.cuelgue > 0 ? 0.4 : 0; u.hora.value = HUD.t; u.blanco.value = RAID.ventisca * 0.45;
  // la mira del ratón
  const mira = el('h-mira'); mira.hidden = ENT.tactil || !ENT.raton; if (!mira.hidden) { mira.style.left = ENT.raton.x + 'px'; mira.style.top = ENT.raton.y + 'px'; mira.classList.toggle('lejos', !!(st && ENT.distRaton > st.alc)); }
  // bolsillos (cuántos quedan)
  if ((HUD.tb = (HUD.tb || 0) + dt) > 0.3) { HUD.tb = 0; pintaBolsillos(); }
  marcasContenedores(); pintaMinimapa();
}

/* ---------- avisos ---------- */
function avisa(texto, tipo = 'info') {
  const caja = el('h-avisos'); if (!caja) return;
  const d = document.createElement('div'); d.className = 'aviso ' + tipo; d.textContent = texto; caja.prepend(d);
  while (caja.children.length > (ENT.tactil ? 2 : 4)) caja.lastChild.remove();   // en el móvil, dos a la vez: más tapan el juego
  setTimeout(() => d.classList.add('fuera'), 4200); setTimeout(() => d.remove(), 5000);
}

/* ---------- bolsillos: tres casillas rápidas ---------- */
function pintaBolsillos() {
  const caja = el('h-bolsillos'); if (!caja || !RAID.bolsillos) return;
  const clave = RAID.bolsillos.map(o => (o ? o.id + o.n : '-')).join(','); if (HUD.ultimos.bol === clave) return; HUD.ultimos.bol = clave;
  caja.innerHTML = RAID.bolsillos.map((o, i) => '<button type="button" class="bolsillo" data-i="' + i + '">' + (o ? imgObj(o.id) + (o.n > 1 ? '<b>' + o.n + '</b>' : '') : '') + '<kbd>' + (i + 1) + '</kbd></button>').join('');
  caja.querySelectorAll('.bolsillo').forEach(b => b.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); PULSO.add('b' + (+b.dataset.i + 1)); }));
}

/* ---------- marcas sobre los contenedores cercanos (para que se vean entre la nieve) ---------- */
function marcasContenedores() {
  const cerca = MAPA.contenedores.filter(c => c.tipo !== 'verja' && lejos(JUG.x, JUG.z, c.x, c.z) < 9 && !(c.abierto && c.cosas && !c.cosas.length)).slice(0, 10);
  while (HUD.marcas.length < cerca.length) { const d = document.createElement('i'); d.className = 'marca-c'; el('hud').appendChild(d); HUD.marcas.push(d); }
  HUD.marcas.forEach((d, i) => {
    const c = cerca[i]; d.hidden = !c; if (!c) return;
    const p = sueloAPantalla(c.x, 1.2, c.z); d.style.left = p.x + 'px'; d.style.top = p.y + 'px';
    d.className = 'marca-c' + (c.abierto ? ' visto' : '') + (c === RAID.cerca ? ' cerca' : '') + (c.tipo === 'cadaver' ? ' cuerpo' : '') + (c.tipo === 'grieta' ? ' raro' : '');
  });
}

/* ---------- el plano del mapa (para el minimapa y la ventana del mapa) ---------- */
function planoDelMapa(k) {
  const W = (MAPA.x1 - MAPA.x0) * k, H = (MAPA.z1 - MAPA.z0) * k, c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d'), X = x => (x - MAPA.x0) * k, Z = z => (z - MAPA.z0) * k;
  g.fillStyle = '#c8d0da'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#7a7470'; g.fillRect(0, Z(4), W, 8 * k); g.fillRect(X(-34), Z(-44), 8 * k, 48 * k); g.fillRect(X(-4), Z(12), 8 * k, 44 * k);
  g.fillStyle = '#a8a49e'; g.fillRect(X(-15), Z(-51), 30 * k, 26 * k); g.fillRect(X(-18), Z(-27), 36 * k, 26 * k);
  for (const s of MAPA.solidos) {
    if (s.x0 < MAPA.x0 - 1 || s.x1 > MAPA.x1 + 1 || s.z0 < MAPA.z0 - 1 || s.z1 > MAPA.z1 + 1) continue;
    g.fillStyle = s.tipo === 'edificio' ? '#3a3e48' : s.tipo === 'verja' ? '#c8202c' : s.h > 1.3 ? '#5a5e66' : '#8a8680';
    g.fillRect(X(s.x0), Z(s.z0), Math.max(1, (s.x1 - s.x0) * k), Math.max(1, (s.z1 - s.z0) * k));
  }
  return c;
}
function pintaMinimapa() {
  const cv = el('h-mapa'), g = cv.getContext('2d'), k = 4, W = cv.width, H = cv.height;
  g.fillStyle = '#0b0d12'; g.fillRect(0, 0, W, H);
  const sx = (JUG.x - MAPA.x0) * k - W / 2, sz = (JUG.z - MAPA.z0) * k - H / 2;
  g.drawImage(HUD.mapa, -sx, -sz);
  for (const s of SALIDAS) { if (!RAID.salidas[s.id] || (s.cond === 'horario' && !(RAID.tren && RAID.tren.esta))) continue; const x = (s.x - MAPA.x0) * k - sx, y = (s.z - MAPA.z0) * k - sz; const dentro = x > 4 && y > 4 && x < W - 4 && y < H - 4; const cx = Math.max(4, Math.min(W - 4, x)), cy = Math.max(4, Math.min(H - 4, y)); g.fillStyle = s.pide ? '#ffcb3d' : '#7ee04a'; g.fillRect(cx - (dentro ? 4 : 3), cy - (dentro ? 4 : 3), dentro ? 8 : 6, dentro ? 8 : 6); }
  // con el radar de un terminal: los enemigos, en rojo
  if (RAID.radar > 0) { g.fillStyle = RAID.radar < 5 && Math.sin(HUD.t * 12) > 0 ? '#7a2a30' : '#ff4b5c'; for (const e of ENEMIGOS) if (e.vivo) { const x = (e.x - MAPA.x0) * k - sx, y = (e.z - MAPA.z0) * k - sz; if (x > 2 && y > 2 && x < W - 2 && y < H - 2) g.fillRect(x - 2, y - 2, 4, 4); } }
  // tú, con tu flecha
  g.save(); g.translate(W / 2, H / 2); g.rotate(-JUG.a + Math.PI); g.fillStyle = '#ff7a1a'; g.beginPath(); g.moveTo(0, -6); g.lineTo(4, 4); g.lineTo(-4, 4); g.closePath(); g.fill(); g.restore();
  if (RAID.deDonde) { g.save(); g.translate(W / 2, H / 2); g.rotate(-RAID.deDonde.a + Math.PI); g.fillStyle = 'rgba(255,75,92,' + Math.min(1, RAID.deDonde.t) + ')'; g.fillRect(-10, -H / 2 + 2, 20, 4); g.restore(); }
  g.strokeStyle = '#40525a'; g.lineWidth = 2; g.strokeRect(1, 1, W - 2, H - 2);
}
