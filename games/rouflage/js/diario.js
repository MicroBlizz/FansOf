// Fans of Rouflage · EL PREMIO DIARIO: un calendario de 4 semanas de 7 días. Cada día que entras recoges el siguiente premio: Gotas de pintura (la moneda
// de cada día, SAVE.gotas) o un cosmético del armario de los marcados «Diario» en armario-datos.js (los días 2 y 4 de la primera semana y el
// día 7 de cada semana). Si un día no entras no pierdes nada: sigues por donde ibas. Además, al recoger 20 días en un mismo mes cae uno de los
// especiales «20 días del mes». Lo que ya tienes se cambia por Gotas. Va con el armario: solo en la alfa y en desarrollo (armarioVisible).
// Se guarda en SAVE.diario = { dia (0..27, el siguiente), ultimo ('AAAA-MM-DD' del último cobro), mes ('AAAA-MM'), delMes, hito ('AAAA-MM' ya cobrado) }.
'use strict';

const DIARIO = { semanas: 4, gotasDia: [20, 30, 40, 50, 60, 0, 0], porRepetido: 150, porHito: 500, hoyVisto: false };

const fechaHoy = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
function diarioEstado() {
  if (!SAVE.diario) SAVE.diario = { dia: 0, ultimo: '', mes: '', delMes: 0, hito: '' };
  if (typeof SAVE.gotas !== 'number') SAVE.gotas = 0;
  return SAVE.diario;
}
const diaHoy = () => (RFS.activo() ? gachaMadrid().fecha : fechaHoy());      // con servidor, el día es el de Madrid
const diarioPuede = () => diarioEstado().ultimo !== diaHoy();

/* ---------- LA RACHA (bocetos 2 y 3, 23-10-2026): días seguidos recogiendo. La misma cuenta que el servidor (rf_diario, servidor/81-rouflage-racha.sql) ---------- */
const RACHA = { porDia: 10, tope: 10, rescate: 50, hitos: [[7, 'titulos', 'puntual'], [14, 'titulos', 'fichaje'], [30, 'titulos', 'empleado']] };
const diaMas = (f, n) => { const d = new Date(f + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
// la semana ISO ('2026-43'), como to_char(fecha, 'IYYY-IW') del servidor: el escudo es uno por semana
function semanaDe(f) {
  const d = new Date(f + 'T12:00:00Z'), dia = (d.getUTCDay() + 6) % 7; d.setUTCDate(d.getUTCDate() - dia + 3);
  const ano = d.getUTCFullYear(), primero = new Date(Date.UTC(ano, 0, 4)), sem = 1 + Math.round(((d - primero) / 864e5 - 3 + ((primero.getUTCDay() + 6) % 7)) / 7);
  return ano + '-' + String(sem).padStart(2, '0');
}
const rachaExtra = r => Math.min(Math.max(r - 1, 0), RACHA.tope) * RACHA.porDia;
// cómo queda la racha si recoges hoy: { r, escudo (lo gasta), perdida (la que se pierde, si llevabas 3 o más) }. Si hoy ya recogiste, la que tienes
function rachaHoy() {
  const s = diarioEstado(), hoy = diaHoy(), r = s.racha || 0;
  if (s.ultimo === hoy) return { r, hecha: true };
  if (s.ultimo === diaMas(hoy, -1)) return { r: r + 1 };
  if (s.ultimo === diaMas(hoy, -2) && r > 0 && s.escudo !== semanaDe(hoy)) return { r: r + 1, escudo: true };
  return { r: 1, perdida: r >= 3 ? r : 0 };
}
// las cosas del armario marcadas «Diario», con su categoría (la clave con la que se guardan: 'cat:id')
function diarioCosas(filtro) {
  const out = [];
  for (const c of CATALOGO_AR) for (const it of c.items) if (it.de === 'diario' && filtro(String(it.txt))) out.push({ cat: c.id, it });
  return out;
}
// el premio de un día del calendario (0..27): { gotas } o { cosas: [{cat, it}] }
function diarioPremio(i) {
  const sem = Math.floor(i / 7) + 1, d = (i % 7) + 1;
  let cosas = [];
  if (d === 7) cosas = diarioCosas(t => t === 'Diario · día 7 (semana ' + sem + ')');
  else if (sem === 1) cosas = diarioCosas(t => t === 'Diario · día ' + d);
  if (cosas.length) return { cosas };
  const base = DIARIO.gotasDia[d - 1] || 100;
  return { gotas: Math.round(base * (1 + (sem - 1) * 0.25) / 5) * 5 };
}
const arTieneId = (cat, it) => arTiene(cat, it);
// da un premio: las cosas que ya tienes se cambian por Gotas. Devuelve el texto de lo que te ha tocado
function diarioDa(premio) {
  const a = armarioEstado(), dicho = [];
  if (premio.gotas) { SAVE.gotas += premio.gotas; dicho.push(tr('{n} Gotas', { n: premio.gotas })); }
  for (const { cat, it } of premio.cosas || []) {
    if (arTieneId(cat, it)) { SAVE.gotas += DIARIO.porRepetido; dicho.push(tr('{n} Gotas', { n: DIARIO.porRepetido }) + ' (' + tr(it.n) + ')'); }
    else { a.tengo.push(cat + ':' + it.id); dicho.push(tr(it.n)); }
  }
  return dicho.join(' + ');
}
function diarioRecoge() {
  if (RFS.activo()) return diarioRecogeServidor();
  if (!diarioPuede()) return;
  const s = diarioEstado(), hoy = fechaHoy(), mes = hoy.slice(0, 7);
  // la racha, como en el servidor
  const rh = rachaHoy(), extras = [];
  if (rh.escudo) s.escudo = semanaDe(hoy);
  if (rh.perdida) { s.perdida = rh.perdida; s.perdidaDia = hoy; }
  s.racha = rh.r;
  if (rachaExtra(rh.r)) { SAVE.gotas += rachaExtra(rh.r); extras.push(tr('{n} Gotas de racha', { n: rachaExtra(rh.r) })); }
  const hitoR = RACHA.hitos.find(h => h[0] === rh.r);
  if (hitoR) { const it = arItem(hitoR[1], hitoR[2]); if (it) extras.push(diarioDa({ cosas: [{ cat: hitoR[1], it }] })); }
  const texto = [diarioDa(diarioPremio(s.dia))].concat(extras).join(' + ');
  s.dia = (s.dia + 1) % (DIARIO.semanas * 7); s.ultimo = hoy;
  if (s.mes !== mes) { s.mes = mes; s.delMes = 0; }
  s.delMes++;
  let extra = '';
  if (s.delMes >= 20 && s.hito !== mes) {      // 20 días este mes: uno de los especiales (el primero que no tengas)
    s.hito = mes;
    const esp = diarioCosas(t => t === 'Diario · 20 días del mes').find(({ cat, it }) => !arTieneId(cat, it));
    extra = esp ? diarioDa({ cosas: [esp] }) : diarioDa({ gotas: DIARIO.porHito });
  }
  misionEvento('diario'); guardaPartida(); play('select'); play('go');
  avisa(tr('Premio del día: {p}', { p: texto + (extra ? ' + ' + extra : '') }), 'bueno');
  diarioPinta(); diarioBoton();
  if (rh.perdida) setTimeout(() => abreRescate(rh.perdida), 900); else if (rh.r >= 2) avisosOfrece();
}

/* ---------- se te secó la racha: rescatarla (solo el día que la pierdes) ---------- */
function abreRescate(n) {
  E('racha-sub').textContent = tr('Llevabas {n} días. Puedes rescatarla hoy, solo hoy.', { n });
  E('b-racha-rescatar').textContent = tr('RESCATAR · {a} ACCIONES', { a: RACHA.rescate });
  pantalla('p-racha'); play('deny');
}
async function rachaRescata() {
  const s = diarioEstado();
  if (RFS.activo()) {
    try { await RFS.llama('rf_racha_rescatar'); } catch (e) { if (/sin_acciones/.test(String(e && e.message))) { abreTienda('titulo'); return; } RFS.error(e); return; }
  } else {
    if ((SAVE.acciones || 0) < RACHA.rescate) { play('deny'); abreTienda('titulo'); return; }
    SAVE.acciones -= RACHA.rescate; s.racha = (s.perdida || 0) + 1; s.perdida = 0; s.perdidaDia = ''; guardaPartida();
  }
  play('crown'); avisa(tr('¡Racha rescatada! Llevas {n} días', { n: diarioEstado().racha }), 'bueno'); abreDiario();
}

/* ---------- la ventana ---------- */
// el icono de las Gotas: una gota de pintura arcoíris, con franjas suaves, brillo y una gotita que salpica
function pintaGotas(c, w) {
  c.save(); c.scale(w / 40, w / 40);
  const gota = g => { g.beginPath(); g.moveTo(20, 4); g.bezierCurveTo(27, 14, 32.5, 20.5, 32.5, 26); g.arc(20, 26, 12.5, 0, Math.PI); g.bezierCurveTo(7.5, 20.5, 13, 14, 20, 4); g.closePath(); };
  c.save(); gota(c); c.clip();
  const col = ['#ff4b5c', '#ff7a1a', '#ffcb3d', '#7ee04a', '#39d5e8', '#3a7de0', '#b45cff'];
  const g = c.createLinearGradient(10, 9, 28, 38); col.forEach((k, i) => g.addColorStop(0.04 + i / (col.length - 1) * 0.92, k));
  c.fillStyle = g; c.fillRect(0, 0, 40, 40);
  const r = c.createRadialGradient(15, 22, 1, 20, 26, 16); r.addColorStop(0, 'rgba(255,255,255,0.35)'); r.addColorStop(0.5, 'rgba(255,255,255,0)'); r.addColorStop(1, 'rgba(32,16,44,0.15)');
  c.fillStyle = r; c.fillRect(0, 0, 40, 40);
  c.restore();
  gota(c); c.lineWidth = 2.6; c.strokeStyle = OL; c.stroke();
  c.beginPath(); c.ellipse(14.5, 25, 2.4, 4.6, 0.35, 0, TAU); c.fillStyle = 'rgba(255,255,255,0.85)'; c.fill();
  c.beginPath(); c.arc(17.5, 17.5, 1.3, 0, TAU); c.fill();
  c.beginPath(); c.arc(33, 9, 2.6, 0, TAU); c.fillStyle = '#39d5e8'; c.fill(); c.lineWidth = 1.6; c.stroke();      // una gotita que salpica
  c.restore();
}
function diarioPinta() {
  const s = diarioEstado(), sem = Math.floor(s.dia / 7), puede = diarioPuede(), hoyI = puede ? s.dia : s.dia - 1, caja = E('diario-dias');
  E('diario-semana').textContent = tr('Semana {n} de {t}', { n: sem + 1, t: DIARIO.semanas });
  E('diario-gotas').textContent = String(SAVE.gotas);
  const mes = fechaHoy().slice(0, 7), delMes = s.mes === mes ? s.delMes : 0;
  E('diario-mes').textContent = s.hito === mes ? tr('Premio de 20 días: ¡conseguido este mes!') : tr('Días recogidos este mes: {n} de 20 (premio especial)', { n: delMes });
  caja.innerHTML = '';
  for (let d = 0; d < 7; d++) {
    const i = sem * 7 + d, p = diarioPremio(i), cel = document.createElement('div');
    const estado = i < s.dia || (!puede && i === hoyI) ? 'cobrado' : i === s.dia && puede ? 'hoy' : 'luego';
    cel.className = 'diario-dia ' + estado + (d === 6 ? ' grande' : '');
    cel.innerHTML = `<small>${tr('Día {n}', { n: d + 1 })}</small>`;
    const k = arLienzo(d === 6 ? 64 : 44, d === 6 ? 64 : 44); cel.appendChild(k);
    const cosa = p.cosas && p.cosas[0];
    arPinta(k, (c, w) => { if (cosa) cosa.it.x(c, w); else pintaGotas(c, w); });
    const b = document.createElement('b'); b.textContent = cosa ? tr(cosa.it.n) + (p.cosas.length > 1 ? ' +' + (p.cosas.length - 1) : '') : String(p.gotas); cel.appendChild(b);
    caja.appendChild(cel);
  }
  const bt = E('b-diario-recoger'); bt.disabled = !puede; bt.textContent = puede ? tr('¡RECOGER!') : tr('VUELVE MAÑANA');
  // la racha: cuántos días, lo que da hoy (o mañana) y sus premios
  const rh = rachaHoy(), r = rh.r, ex = puede ? rachaExtra(r) : rachaExtra(r + 1);
  E('diario-racha-t').textContent = r >= 2 || !puede ? tr('RACHA DE {n}', { n: r }) : tr('EMPIEZA TU RACHA');
  E('diario-racha-s').textContent = puede ? (ex ? tr('+{n} gotas extra al recoger hoy', { n: ex }) : tr('Recoge cada día para que crezca')) : tr('Mañana: +{n} gotas extra', { n: ex });
  arPinta(E('diario-racha-dib'), (c, w, h) => pintaBote(c, w, h, Math.min(1, r / 30)));
  const pr = E('diario-premios'); pr.innerHTML = '';
  for (const [n, cat, id] of RACHA.hitos) {
    const it = arItem(cat, id); if (!it) continue;
    const f = document.createElement('div'); f.className = 'diario-premio' + ((s.racha || 0) >= n ? ' hecho' : '');
    f.innerHTML = '<span></span><b></b>'; f.children[0].textContent = tr('{n} días', { n }); f.children[1].textContent = tr(it.n); pr.appendChild(f);
  }
  const usado = s.escudo === semanaDe(diaHoy());
  E('diario-escudo').textContent = usado ? tr('Escudo gastado esta semana: el lunes tienes otro.') : tr('Tienes 1 escudo esta semana: si un día no entras, salva tu racha solo.');
}
// el bote de pintura de la racha: se llena según los días (lleno a los 30), con su chorrete por fuera
function pintaBote(c, w, h, lleno) {
  c.save(); c.scale(w / 92, h / 104);
  const cuerpo = g => { g.beginPath(); g.moveTo(16, 34); g.lineTo(76, 34); g.lineTo(70, 96); g.quadraticCurveTo(46, 102, 22, 96); g.closePath(); };
  c.lineJoin = 'round'; c.lineWidth = 4; c.strokeStyle = OL;
  cuerpo(c); c.fillStyle = '#fff6ea'; c.fill();
  c.save(); cuerpo(c); c.clip();
  const y = 96 - 60 * Math.max(0.12, lleno), g = c.createLinearGradient(0, y, 0, 100); g.addColorStop(0, '#ff7a1a'); g.addColorStop(1, '#ff4b5c');
  c.fillStyle = g; c.beginPath(); c.moveTo(0, y); for (let x = 0; x <= 92; x += 8) c.quadraticCurveTo(x + 4, y + (x % 16 ? 4 : -4), x + 8, y); c.lineTo(92, 104); c.lineTo(0, 104); c.fill();
  c.restore();
  cuerpo(c); c.stroke();
  c.beginPath(); c.ellipse(46, 34, 30, 8, 0, 0, TAU); c.fillStyle = '#ff7a1a'; c.fill(); c.stroke();      // la boca, llena de pintura
  c.beginPath(); c.moveTo(70, 36); c.quadraticCurveTo(80, 44, 76, 58); c.quadraticCurveTo(73, 64, 71, 56); c.quadraticCurveTo(70, 46, 64, 40); c.fillStyle = '#ff7a1a'; c.fill(); c.stroke();      // el chorrete
  c.beginPath(); c.moveTo(18, 30); c.quadraticCurveTo(46, -2, 74, 30); c.lineWidth = 4; c.stroke();      // el asa
  c.restore();
}
function abreDiario() { diarioEstado(); DIARIO.hoyVisto = true; diarioPinta(); pantalla('p-diario'); play('select'); }
// el botón del título, con su punto cuando hay premio esperando
function diarioBoton() { const b = E('b-diario'); if (b) b.classList.toggle('aviso', diarioPuede()); }
// al volver al título: ya no se abre sola (antes tapaba el juego nada más entrar). La tira del título (titulo.js) avisa de que hay premio esperando
function diarioAlTitulo() {
  if (!armarioVisible()) return;
  diarioBoton();
}
// lo que dice la tira del premio diario en el título: { t: título, s: debajo, b: el botón (vacío si hoy ya está) }
function diarioTira() {
  const s = diarioEstado(), puede = diarioPuede(), rh = rachaHoy();
  if (!puede) return { t: rh.r >= 2 ? tr('RACHA DE {n} DÍAS', { n: rh.r }) : tr('PREMIO DIARIO'), s: tr('Vuelve mañana para que siga creciendo.'), b: '' };
  const p = diarioPremio(s.dia), cosa = p.cosas && p.cosas[0], ex = rachaExtra(rh.r);
  const hoy = cosa ? tr('Hoy toca: {c}', { c: tr(cosa.it.n) }) : tr('Hoy toca: {n} gotas', { n: p.gotas });
  if (rh.perdida) return { t: tr('SE TE SECÓ LA RACHA'), s: hoy, b: tr('RECOGER') };
  return { t: rh.r >= 2 ? tr('RACHA DE {n} DÍAS', { n: rh.r }) : tr('PREMIO DIARIO · DÍA {n}', { n: (s.dia % 7) + 1 }), s: hoy + (ex ? ' ' + tr('+ {n} de racha', { n: ex }) : ''), b: tr('RECOGER') };
}
function preparaDiario() {
  if (!PANTALLAS.includes('p-racha')) PANTALLAS.push('p-racha');
  E('b-racha-rescatar').onclick = rachaRescata;
  E('b-racha-no').onclick = () => { play('select'); abreDiario(); };
  E('b-diario').onclick = abreDiario;
  E('b-diario-recoger').onclick = diarioRecoge;
  E('b-diario-volver').onclick = () => { play('select'); irTitulo(); };
}
