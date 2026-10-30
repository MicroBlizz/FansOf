// Fans Of Decks · La reunión en equipo en pantalla (reglas en equipo.js). Tu líder es el de siempre, en grande, con tu mano;
// arriba, una ficha por compañero con su vida, su bloqueo, sus efectos activos (los mismos que los tuyos: directivas, fuerza, racha, débil...), sus compañeros de mesa y si ya está listo.
// Cada rival lleva encima a quién va. Lo que hacen los demás se ve: sus golpes salen en los rivales y lo que reciben, en su ficha.
'use strict';
function dcEqEntra(red, sala) {
  if (!dcEqEmpieza(red, sala)) { toast(tr('No estás en esta partida.'), true); return dcPortada(); }
  const T = DCP.equipo; DCC.equipo = T; dcEqMesa(T); dcMuestra('dc-combate'); dcPintaCombate();
}
function dcEqMesa(T) { DCC.C = T.Cs[T.yo]; DCC.alFin = () => {}; DCC.elegida = null; DCC.turnoVisto = 0; DCC.fondo = T.tipo; DCC.altoMano = 0; T.nueva = false; }
// Tras cada paso: se repinta (si arrastras una carta, al soltarla).
function dcEqRefresca() {
  const T = DCP.equipo; if (!T || DCC.equipo !== T) return;
  if (DCC.arrastre) { clearTimeout(T.tic); T.tic = setTimeout(dcEqRefresca, 150); return; }
  if (T.fin) return setTimeout(() => { if (DCP.equipo === T) dcEqFinal(T); }, 1400);
  if (T.nueva) { dcEqMesa(T); setTimeout(() => dcRotulo(tr('Reunión {a} de {b}', { a: T.reunion + 1, b: DC_EQ_REUNIONES.length })), 300); }
  dcPintaCombate();
}
// Las fichas de los demás, arriba
function dcEqBanda() {
  const T = DCP.equipo, b = dcEl('div', 'dc-eq-banda');
  T.jug.forEach((p, j) => {
    if (j === T.yo) return;
    const C = T.Cs[j], r = T.runs[j], L = DC_LIDERES[p.lider], vivo = r.hp > 0, f = dcEl('div', 'dc-eq-jug' + (vivo ? '' : ' dc-eq-ko') + (T.fuera[j] ? ' dc-eq-fuera' : '') + (T.listos[j] ? ' dc-eq-listo' : '')); f.dataset.j = j;
    const arte = dcEl('div', 'dc-eq-arte'); arte.append(dcSprite(L.arte, 46));
    const inf = dcEl('div', 'dc-eq-info');
    const estado = !vivo ? tr('KO') : T.fuera[j] ? tr('Fuera de la sala') : T.listos[j] ? tr('Listo') : tr('{n} CAOS', { n: C.caos });
    inf.append(dcEl('b', '', p.nombre), dcEl('small', '', tr(L.nombre) + ' · ' + estado), dcBarraVida(r.hp, r.hpMax, C.bloqueo));
    dcEqCon(j, () => { inf.append(dcEfectosLider(C)); if (C.companeros.length || C.protocolos.length) inf.append(dcPintaEquipo(C)); });
    const van = C.rivales.filter(x => x.hp > 0 && dcEqBlancoDe(T, x) === j).length;
    if (van && vivo) inf.append(dcEl('small', 'dc-eq-van', tr(van === 1 ? 'Le ataca 1 rival' : 'Le atacan {n} rivales', { n: van })));
    f.append(arte, inf); b.append(f);
  });
  const sal = dcEl('button', 'dc-eq-salir', tr('Salir')); sal.onclick = ev => { ev.stopPropagation(); confirmBox(tr('¿Salir de la reunión?'), tr('Tu equipo sigue sin ti. Puedes volver con el código de la sala.'), tr('SALIR'), () => { dcSalaSale(); dcPortada(); }); };
  b.append(sal);
  return b;
}
// Encima de cada rival: a quién va
function dcEqBlanco(r) {
  const T = DCP.equipo, t = dcEqBlancoDe(T, r), e = dcEl('span', 'dc-eq-blanco' + (t === T.yo ? ' dc-eq-a-ti' : '')); if (t < 0) return e;
  e.append(dcSprite(DC_LIDERES[T.jug[t].lider].arte, 20), dcEl('span', '', t === T.yo ? tr('a ti') : T.jug[t].nombre));
  return e;
}
// FIN DE TURNO pasa a ser LISTO: el turno acaba cuando lo están todos (se puede deshacer mientras tanto)
function dcEqBotonFin(fin) {
  const T = DCP.equipo, cuentan = j => dcEqVivo(j) && (!T.fuera[j] || j === T.yo), vivos = T.jug.filter((p, j) => cuentan(j)).length, listos = T.listos.filter((x, j) => x && cuentan(j)).length;
  if (!dcEqVivo(T.yo)) { fin.textContent = tr('KO: tu equipo sigue'); fin.disabled = true; return; }
  fin.disabled = T.fin || T.Cs[T.yo].fase !== 'jugador';
  if (T.listos[T.yo]) { fin.textContent = tr('ESPERANDO {a}/{b}', { a: listos, b: vivos }); fin.classList.add('dc-eq-esperando'); }
  else fin.textContent = vivos > 1 ? tr('LISTO {a}/{b}', { a: listos, b: vivos }) : tr('FIN DE TURNO');
}
function dcEqFinal(T) {
  const gana = T.fin === 'victoria', s = dcPanel(tr(gana ? '¡Equipo imbatible!' : 'Despido colectivo'));
  play(gana ? 'win' : 'lose');
  s.append(dcEl('p', 'dc-nota', tr(gana ? 'Habéis superado las {n} reuniones juntos.' : 'Os han despedido a todos en la reunión {a} de {b}.', { n: DC_EQ_REUNIONES.length, a: T.reunion + 1, b: DC_EQ_REUNIONES.length })));
  T.jug.forEach((p, j) => {
    const L = DC_LIDERES[p.lider], r = T.runs[j], caja = dcEl('div', 'dc-opcion dc-lider-op dc-sala-jugador' + (r.hp > 0 ? '' : ' dc-cerrada'));
    const arte = dcEl('span', 'dc-lider-op-arte'); arte.append(dcSprite(L.arte, 48));
    const txt = dcEl('span', 'dc-lider-op-txt'); txt.append(dcEl('b', '', p.nombre + (j === T.yo ? ' ' + tr('(tú)') : '')), dcEl('small', 'dc-riesgo', tr(L.nombre) + ' · ' + tr('Vida {n}', { n: r.hp + '/' + r.hpMax }))); caja.append(arte, txt); s.append(caja);
  });
  s.append(dcEl('p', 'dc-nota', tr('De momento la partida en equipo no cuenta para tu paro ni tus logros: está en pruebas.')));
  const sal = dcEl('button', 'btn-big ol', tr('SALIR DE LA SALA')); sal.onclick = () => { play('select'); dcSalaSale(); dcPortada(); }; s.append(sal);
}
