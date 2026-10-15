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
const diarioPuede = () => diarioEstado().ultimo !== fechaHoy();
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
  if (!diarioPuede()) return;
  const s = diarioEstado(), hoy = fechaHoy(), mes = hoy.slice(0, 7);
  const texto = diarioDa(diarioPremio(s.dia));
  s.dia = (s.dia + 1) % (DIARIO.semanas * 7); s.ultimo = hoy;
  if (s.mes !== mes) { s.mes = mes; s.delMes = 0; }
  s.delMes++;
  let extra = '';
  if (s.delMes >= 20 && s.hito !== mes) {      // 20 días este mes: uno de los especiales (el primero que no tengas)
    s.hito = mes;
    const esp = diarioCosas(t => t === 'Diario · 20 días del mes').find(({ cat, it }) => !arTieneId(cat, it));
    extra = esp ? diarioDa({ cosas: [esp] }) : diarioDa({ gotas: DIARIO.porHito });
  }
  guardaPartida(); play('select'); play('go');
  avisa(tr('Premio del día: {p}', { p: texto + (extra ? ' + ' + extra : '') }), 'bueno');
  diarioPinta(); diarioBoton();
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
  c.beginPath(); c.arc(33, 9, 2.6, 0, TAU); c.fillStyle = '#b45cff'; c.fill(); c.lineWidth = 1.6; c.stroke();      // una gotita que salpica
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
  const bt = E('b-diario-recoger'); bt.disabled = !puede; bt.textContent = puede ? tr('¡RECOGER!') : tr('Vuelve mañana');
}
function abreDiario() { diarioEstado(); DIARIO.hoyVisto = true; diarioPinta(); pantalla('p-diario'); play('select'); }
// el botón del título, con su punto cuando hay premio esperando
function diarioBoton() { const b = E('b-diario'); if (b) b.classList.toggle('aviso', diarioPuede()); }
// al volver al título: la primera vez del día se abre sola
function diarioAlTitulo() {
  if (!armarioVisible()) return;
  diarioBoton();
  if (diarioPuede() && !DIARIO.hoyVisto) setTimeout(() => { if (!E('p-titulo').hidden && diarioPuede()) abreDiario(); }, 700);
}
function preparaDiario() {
  E('b-diario').onclick = abreDiario;
  E('b-diario-recoger').onclick = diarioRecoge;
  E('b-diario-volver').onclick = () => { play('select'); irTitulo(); };
}
