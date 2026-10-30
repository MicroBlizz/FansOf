// Fans Of Decks · Ascensos (subir un nivel) y listas de cartas: el antes y el después de ascender una carta (con lo que cambia marcado), elegir cuál ascender y la ventana que lista cartas.
'use strict';
// El ascenso de una carta (un nivel más: Becario → Junior, y con el flag de niveles Senior y CEO): la carta de ahora, la de después con lo que cambia marcado, y la lista de cambios.
// alConfirmar (si hay) asciende; alOtra vuelve a la lista o a la carta.
const DC_ETIQUETA_FX = { coste: 'Coste', dano: 'Daño', veces: 'Veces', bloqueo: 'Bloqueo', cura: 'Cura', roba: 'Roba', caos: 'CAOS', vulnerable: 'Vulnerable', debil: 'Débil', aturde: 'Aturde', fuerza: 'Fuerza', fuerzaTurno: 'Fuerza del turno', blindaje: 'Blindaje', n: 'Cifra' };
const DC_PALABRA_CAMBIO = { despedida: ['Ya no se despide: vuelve al mazo', 'Despedida: se va al jugarla'], indefinido: ['Ya no se queda en la mano', 'Contrato indefinido: si no la juegas, se queda en tu mano'], madrugador: ['Ya no madruga', 'Madrugador: siempre en tu mano inicial'] };
function dcVerAscenso(c, alConfirmar, alOtra) {
  const v = dcVentana(tr('Ascenso: {n}', { n: dcNombre(c) })), cambios = dcCambiosAscenso(c), resalta = new Set(cambios.map(x => x.k));
  const fila = dcEl('div', 'dc-ascenso');
  const antes = dcEl('div', 'dc-ascenso-col'); antes.append(dcEl('small', '', tr('Ahora') + (dcMaxNivel() > 1 ? ' · ' + dcNombreNivel(dcNiv(c)) : '')), dcPintaCarta({ id: c.id, asc: dcNiv(c) >= 1, niv: dcNiv(c) }, { grande: true }));
  const fl = dcEl('div', 'dc-ascenso-flecha'); fl.append(dcSvg('fuerza'));
  const despues = dcEl('div', 'dc-ascenso-col dc-ascenso-nueva'); despues.append(dcEl('small', '', dcNombreNivel(dcNiv(c) + 1)), dcPintaCarta({ id: c.id, asc: true, niv: dcNiv(c) + 1 }, { grande: true, resalta }));
  fila.append(antes, fl, despues); v.append(fila);
  const lista = dcEl('div', 'dc-cambios');
  for (const x of cambios) {
    const ch = dcEl('span', 'dc-cambio-chip');
    if (DC_PALABRA_CAMBIO[x.k]) ch.textContent = tr(DC_PALABRA_CAMBIO[x.k][x.despues ? 1 : 0]);
    else { ch.append(dcEl('span', '', tr(DC_ETIQUETA_FX[x.k] || x.k) + ' '), dcEl('s', '', String(x.antes)), dcEl('b', '', ' ' + String(x.despues))); }
    lista.append(ch);
  }
  v.append(lista);
  if (alConfirmar) { const b = dcEl('button', 'btn-big ol dc-ascender', tr('ASCENDER')); b.onclick = () => { dcCierraVentana(); alConfirmar(); }; v.append(b); }
  const o = dcEl('button', 'btn-ghost ol', tr(alConfirmar ? 'OTRA CARTA' : 'CERRAR')); o.onclick = () => { dcCierraVentana(); if (alOtra) alOtra(); }; v.append(o);
}
// Elegir qué carta ascender: la lista, y al tocar una, su ascenso para confirmarlo.
function dcEligeAscenso(alHecho) {
  const r = DCP.run, cands = r.mazo.filter(dcPuedeSubir);
  dcVerCartas(tr('¿Qué carta asciendes?'), cands, c => dcVerAscenso(c, () => { dcSube(c); alHecho(c); }, () => dcEligeAscenso(alHecho)), { mejoradas: true });
}
// o.mejoradas: con el interruptor «Ver mejoradas» cada carta se pinta como quedará ascendida, con los cambios marcados (se recuerda mientras dura la sesión).
function dcVerCartas(titulo, cartas, alElegir, o = {}) {
  const v = dcVentana(titulo), g = dcEl('div', 'dc-rejilla');
  let mejoradas = !!(o.mejoradas && DCC.verMejoradas);
  const pinta = () => {
    g.textContent = ''; if (!cartas.length) g.append(dcEl('p', 'dc-nota', tr('No hay cartas aquí')));
    cartas.forEach(c => {
      const m = mejoradas && dcPuedeSubir(c), cc = m ? { id: c.id, asc: true, niv: dcNiv(c) + 1 } : c;
      g.append(dcPintaCarta(cc, { resalta: m ? new Set(dcCambiosAscenso(c).map(x => x.k)) : undefined, al: alElegir ? () => { dcCierraVentana(); alElegir(c); } : () => dcVerCarta(cc) }));
    });
  };
  if (o.mejoradas) {
    const t = dcEl('button', 'dc-toggle'), caja = dcEl('span', 'dc-toggle-caja'); caja.append(dcSvg('check')); t.append(caja, dcEl('span', '', tr('Ver mejoradas')));
    const refresca = () => t.classList.toggle('dc-toggle-on', mejoradas); refresca();
    t.onclick = () => { mejoradas = !mejoradas; DCC.verMejoradas = mejoradas; play('select'); refresca(); pinta(); };
    v.append(t);
  }
  pinta(); v.append(g);
  const b = dcEl('button', 'btn-ghost ol', tr(alElegir ? 'MEJOR NO' : 'CERRAR')); b.onclick = dcCierraVentana; v.append(b);
}
