// Fans of Rouflage · EL PREMIO DIARIO: un calendario de 4 semanas de 7 días. Cada día que entras recoges el siguiente premio: Migas (la moneda
// de cada día, SAVE.migas) o un cosmético del armario de los marcados «Diario» en armario-datos.js (los días 2 y 4 de la primera semana y el
// día 7 de cada semana). Si un día no entras no pierdes nada: sigues por donde ibas. Además, al recoger 20 días en un mismo mes cae uno de los
// especiales «20 días del mes». Lo que ya tienes se cambia por Migas. Va con el armario: solo en la alfa y en desarrollo (armarioVisible).
// Se guarda en SAVE.diario = { dia (0..27, el siguiente), ultimo ('AAAA-MM-DD' del último cobro), mes ('AAAA-MM'), delMes, hito ('AAAA-MM' ya cobrado) }.
'use strict';

const DIARIO = { semanas: 4, migasDia: [20, 30, 40, 50, 60, 0, 0], porRepetido: 150, porHito: 500, hoyVisto: false };

const fechaHoy = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
function diarioEstado() {
  if (!SAVE.diario) SAVE.diario = { dia: 0, ultimo: '', mes: '', delMes: 0, hito: '' };
  if (typeof SAVE.migas !== 'number') SAVE.migas = 0;
  return SAVE.diario;
}
const diarioPuede = () => diarioEstado().ultimo !== fechaHoy();
// las cosas del armario marcadas «Diario», con su categoría (la clave con la que se guardan: 'cat:id')
function diarioCosas(filtro) {
  const out = [];
  for (const c of CATALOGO_AR) for (const it of c.items) if (it.de === 'diario' && filtro(String(it.txt))) out.push({ cat: c.id, it });
  return out;
}
// el premio de un día del calendario (0..27): { migas } o { cosas: [{cat, it}] }
function diarioPremio(i) {
  const sem = Math.floor(i / 7) + 1, d = (i % 7) + 1;
  let cosas = [];
  if (d === 7) cosas = diarioCosas(t => t === 'Diario · día 7 (semana ' + sem + ')');
  else if (sem === 1) cosas = diarioCosas(t => t === 'Diario · día ' + d);
  if (cosas.length) return { cosas };
  const base = DIARIO.migasDia[d - 1] || 100;
  return { migas: Math.round(base * (1 + (sem - 1) * 0.25) / 5) * 5 };
}
const arTieneId = (cat, it) => arTiene(cat, it);
// da un premio: las cosas que ya tienes se cambian por Migas. Devuelve el texto de lo que te ha tocado
function diarioDa(premio) {
  const a = armarioEstado(), dicho = [];
  if (premio.migas) { SAVE.migas += premio.migas; dicho.push(tr('{n} Migas', { n: premio.migas })); }
  for (const { cat, it } of premio.cosas || []) {
    if (arTieneId(cat, it)) { SAVE.migas += DIARIO.porRepetido; dicho.push(tr('{n} Migas', { n: DIARIO.porRepetido }) + ' (' + tr(it.n) + ')'); }
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
    extra = esp ? diarioDa({ cosas: [esp] }) : diarioDa({ migas: DIARIO.porHito });
  }
  guardaPartida(); play('select'); play('go');
  avisa(tr('Premio del día: {p}', { p: texto + (extra ? ' + ' + extra : '') }), 'bueno');
  diarioPinta(); diarioBoton();
}

/* ---------- la ventana ---------- */
// el icono de las Migas: tres migas de galleta
function pintaMigas(c, w) {
  c.save(); c.scale(w / 40, w / 40);
  for (const [x, y, r] of [[15, 23, 8], [26, 17, 6], [26, 28, 5]]) { c.beginPath(); c.arc(x, y, r, 0, TAU); c.fillStyle = '#d9a35a'; c.fill(); c.lineWidth = 2.4; c.strokeStyle = OL; c.stroke(); c.fillStyle = '#7a4a2c'; c.beginPath(); c.arc(x - r * 0.3, y - r * 0.2, r * 0.22, 0, TAU); c.fill(); }
  c.restore();
}
function diarioPinta() {
  const s = diarioEstado(), sem = Math.floor(s.dia / 7), puede = diarioPuede(), hoyI = puede ? s.dia : s.dia - 1, caja = E('diario-dias');
  E('diario-semana').textContent = tr('Semana {n} de {t}', { n: sem + 1, t: DIARIO.semanas });
  E('diario-migas').textContent = String(SAVE.migas);
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
    arPinta(k, (c, w) => { if (cosa) cosa.it.x(c, w); else pintaMigas(c, w); });
    const b = document.createElement('b'); b.textContent = cosa ? tr(cosa.it.n) + (p.cosas.length > 1 ? ' +' + (p.cosas.length - 1) : '') : String(p.migas); cel.appendChild(b);
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
