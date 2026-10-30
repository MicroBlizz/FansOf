// Fans Of Decks · Las pantallas del calendario: la tira de la semana, el comienzo de cada día (con la noche, el ascenso del lunes y la convocatoria de RR. HH.) y el cierre de cada día y de cada acto.
'use strict';
const DC_ABR = { Lunes: 'Lun', Martes: 'Mar', 'Miércoles': 'Mié', Jueves: 'Jue', Viernes: 'Vie' };
// La semana del acto en curso: un chip por día (hecho, hoy o pendiente) y el lunes de jefe marcado.
function dcSemana() {
  const r = DCP.run, w = dcEl('div', 'dc-semana');
  dcActo().dias.forEach((d, i) => {
    const c = dcEl('span', 'dc-sem-dia' + (i < r.dia ? ' dc-sem-hecho' : i === r.dia ? ' dc-sem-hoy' : '') + (d.tipoFin === 'jefe' ? ' dc-sem-jefe' : ''), tr(DC_ABR[d.dia] || d.dia));
    c.title = tr(d.dia); if (i < r.dia) c.prepend(dcSvg('check')); w.append(c);
  });
  return w;
}
// El comienzo del día: la tarjeta con quién te espera a las 17:00 y, si toca, el ascenso o la convocatoria. «A la agenda» abre el mapa del día.
function dcPintaDia() {
  const r = DCP.run, d = dcDia(), A = dcActo(), s = dcPanel(tr(d.dia) + ' · ' + tr(A.titulo), 'normal');
  const fichas = [['reunion', dcRango(), tr('rango')], ['vida', r.hp + '/' + r.hpMax, tr('vida')], ['nominas', fmt(r.nominas), tr('bonus')]];
  s.append(dcTarjetaResultado(tr(d.dia), tr('Día {n} de {m}', { n: r.dia + 1, m: A.dias.length }), fichas));
  s.append(dcSemana());
  s.append(dcEl('p', 'dc-nota', tr(d.texto)));
  if (r.curado > 0) s.append(dcEl('p', 'dc-nota dc-nota-ok', tr('Has dormido bien: te curas {n}.', { n: r.curado })));
  if (r.sub === 'pagada') s.append(dcEl('p', 'dc-nota dc-nota-ok', tr('Plan Bienestar: pagas {c} de bonus y te curas {n}.', { c: r.suscripcion.cuota, n: r.suscripcion.cura })));
  if (r.sub === 'cancelada') s.append(dcEl('p', 'dc-nota', tr('No te llega el bonus para el Plan Bienestar: Phony lo cancela sin avisar.')));
  if (d.rrhh) {
    const caja = dcEl('div', 'dc-correo');
    caja.append(dcEl('h3', 'ol', tr('Convocatoria de RR. HH.')), dcEl('p', '', tr('Asunto: charla informal. Preséntate a las 17:00 en la última planta. Se ruega puntualidad y ninguna expectativa.')));
    s.append(caja);
  }
  const D = DC_RIVALES[d.fin], fin = dcEl('div', 'dc-fin-dia dc-fin-' + (d.tipoFin || 'minijefe'));
  const pers = dcEl('span', 'dc-fin-arte'); pers.append(dcSprite(D.arte, 70)); const txt = dcEl('span', 'dc-fin-txt');
  txt.append(dcEl('small', '', tr('A las 17:00')), dcEl('b', '', dcNombreRival(d.fin)), dcEl('em', '', tr(d.cita)));
  fin.append(pers, txt); s.append(fin);
  if (d.ascenso && r.ascensoPend) return dcCajaAscenso(s);
  const b = dcEl('button', 'btn-big ol', tr('A LA AGENDA')); b.onclick = () => { play('select'); r.pendiente = null; dcGuarda(); dcPintaMapa(); }; s.append(b);
}
// El ascenso del lunes: Becario pasa a Junior (más vida máxima) y una carta del mazo asciende con el mismo aviso de siempre.
function dcCajaAscenso(s) {
  const r = DCP.run, caja = dcEl('div', 'dc-correo dc-ascenso-caja');
  const rg = dcCap().rangos;
  caja.append(dcEl('h3', 'ol', tr('¡Ascenso a {r}!', { r: tr(rg[1]) })), dcEl('p', '', tr('Te suben de {a} a {b}: 10 de vida máxima más y una carta de tu mazo asciende. La taza sigue siendo la misma.', { a: tr(rg[0]), b: tr(rg[1]) })));
  s.append(caja);
  const b = dcEl('button', 'btn-big ol', tr('ASCENDER UNA CARTA'));
  const listo = () => { r.rango = 1; r.hpMax += 10; r.hp += 10; r.ascensoPend = false; play('levelup'); dcGuarda(); dcPintaDia(); };
  b.onclick = () => { play('select'); if (r.mazo.some(dcPuedeSubir)) dcEligeAscenso(listo); else listo(); };
  s.append(b);
}
// Acaba el día (ganado el minijefe y cobrados sus premios): empieza el siguiente.
function dcFinDia() { dcSiguienteDia(); dcPintaDia(); }
// Acaba una semana: tras el jefe de departamento, pantalla de cierre y a la semana siguiente; tras el CEO, el cierre del capítulo (o el final si era el último).
function dcFinActo() {
  const r = DCP.run, C = dcActo().cierre;
  if (dcEsUltimoActo()) { dcFinPartida(true); return dcPintaFin(true); }
  if (dcFinDeCapitulo()) return dcCierreCapitulo();
  const s = dcPanel(tr('¡Semana superada!'), 'jefe');
  s.append(dcTarjetaResultado(tr(C.titulo), tr(dcCap().lugar), [['reunion', String(r.stats.dias), tr('días')], ['vida', r.hp + '/' + r.hpMax, tr('vida')], ['nominas', fmt(r.nominas), tr('bonus')]]));
  s.append(dcEl('p', 'dc-nota', tr(C.texto)), dcEl('p', 'dc-nota dc-joke', tr(C.joke)));
  const b = dcEl('button', 'btn-big ol', tr('SEGUIR')); b.onclick = () => { play('select'); dcFinDia(); }; s.append(b);
}
// El CEO ha caído: eres el nuevo CEO y, al día siguiente, los accionistas cierran la empresa; empieza el capítulo siguiente en otra.
function dcCierreCapitulo() {
  const r = DCP.run, K = dcCap().cierre, S = K.sig, s = dcPanel(tr(K.titulo), 'jefe');
  s.append(dcTarjetaResultado(tr(K.titulo), tr(dcCap().lugar), [['reunion', String(r.stats.dias), tr('días')], ['vida', r.hp + '/' + r.hpMax, tr('vida')], ['nominas', fmt(r.nominas), tr('bonus')]]));
  s.append(dcEl('p', 'dc-nota', tr(K.texto)));
  const b = dcEl('button', 'btn-big ol', tr('SEGUIR'));
  b.onclick = () => {
    play('select'); const p = dcPanel(tr(S.titulo), 'correo');
    const caja = dcEl('div', 'dc-correo'); caja.append(dcEl('h3', 'ol', tr(S.titulo)), dcEl('p', '', tr(S.texto))); p.append(caja, dcEl('p', 'dc-nota dc-joke', tr(S.joke)));
    const c = dcEl('button', 'btn-big ol', tr(S.boton)); c.onclick = () => { play('levelup'); dcFinDia(); }; p.append(c);
  };
  s.append(b);
}
