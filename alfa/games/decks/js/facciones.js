// Fans Of Decks · Facciones: lo que comparten todas (el pool de ofertas de cada una, sus palabras clave nuevas y la pantalla de elegir líder).
// Cada facción vive en su archivo fac-<facción>.js (cartas, líder, mazo inicial y pasiva) y solo añade a DC_CARTAS, DC_MAZOS, DC_LIDERES y DC_FACCIONES.
// Los líderes se desbloquean en orden (DC_LIDERES_ORDEN) superando la campaña en normal; el orden alterna flojo y fuerte según el balance del bot simple (21-10-2026). Tras el flag 'decks-desbloqueo-lideres': apagado, están todos abiertos.
'use strict';
function dcLider() { return DC_LIDERES[DCP.run && DC_LIDERES[DCP.run.lider] ? DCP.run.lider : 'bunny']; }
const DC_LIDERES_ORDEN = ['bunny', 'directora', 'twitchking', 'epicchampion', 'necrolord', 'progamer', 'vikingo', 'cybermarine', 'memelord'];
function dcDesbloqueoLideres() { return NUCLEO.flag('decks-desbloqueo-lideres', 'Los líderes se desbloquean en orden superando la campaña', false); }
function dcLiderAbierto(k) { return !!DC_LIDERES[k] && (!dcDesbloqueoLideres() || k === DC_LIDERES_ORDEN[0] || (DCP.meta.lideres || []).includes(k)); }
// Al ganar en normal se abre el siguiente líder cerrado de la lista; devuelve su clave (o null).
function dcAbreLider() {
  if (!dcDesbloqueoLideres()) return null;
  const k = DC_LIDERES_ORDEN.find(x => DC_LIDERES[x] && !dcLiderAbierto(x)); if (!k) return null;
  (DCP.meta.lideres = DCP.meta.lideres || []).push(k); return k;
}
// Ganchos de la pasiva de la facción: dcGancho('nombre', C, …) llama a DC_FACCIONES[facción][nombre] si existe (alTurno, alJugar, alBaja, bono, sinAtaque, estados).
function dcGancho(n, ...a) { const F = dcFaccion(); return F && F[n] ? F[n](...a) : undefined; }
function dcFacDeCarta(id) { return DC_CARTAS[id].fac || 'animales'; }
// Las cartas que pueden ofrecerse al líder de la partida: las de su facción y las neutrales (sin su mazo inicial, sin cláusulas, spam ni legendarias).
function dcPool() {
  const k = DCP.run ? DCP.run.lider : 'bunny', fac = dcLider().faccion, ini = DC_MAZOS[k] || [];
  return Object.keys(DC_CARTAS).filter(id => { const D = DC_CARTAS[id], f = dcFacDeCarta(id); return !['clausula', 'spam'].includes(D.tipo) && D.rar !== 'legendary' && !ini.includes(id) && (f === fac || f === 'neutral'); });
}
// Las que da el jefe: legendarias de su facción o neutrales.
function dcLegendarias() { const fac = dcLider().faccion; return Object.keys(DC_CARTAS).filter(id => { const D = DC_CARTAS[id], f = dcFacDeCarta(id); return D.rar === 'legendary' && D.tipo !== 'clausula' && (f === fac || f === 'neutral'); }); }
// Palabras clave y efectos de las facciones nuevas (el glosario de la carta y los filtros de la Biblioteca las leen de aquí).
DC_PALABRAS.push(['perfora', 'Perfora el bloqueo.']);
Object.assign(DC_GLOSARIO, { perfora: 'Perfora el bloqueo: su daño se salta el bloqueo del rival.' });
Object.assign(DC_BIB_PROPIEDADES, { perfora: 'Perfora el bloqueo', resucita: 'Recupera cartas', pierde: 'Cuesta vida' });
// ---------- elegir líder ----------
// Lo que pide un líder cerrado: van en orden, y cada victoria en normal abre el siguiente.
function dcCandadoLider(k) {
  const i = DC_LIDERES_ORDEN.indexOf(k), prev = DC_LIDERES_ORDEN[i - 1];
  return prev && !dcLiderAbierto(prev) ? tr('Se abre después de {l}', { l: tr(DC_LIDERES[prev].nombre) }) : tr('Se abre superando la campaña en normal');
}
function dcEligeLider(alElegir) {
  const s = dcPanel(tr('Elige tu líder'));
  s.append(dcEl('p', 'dc-nota', tr(dcDesbloqueoLideres() ? 'Cada líder trae su facción, su pasiva y su mazo. Superando la campaña en normal se abre el siguiente.' : 'Cada líder trae su facción, su pasiva y su mazo. Por ahora están todos abiertos; más adelante se irán desbloqueando.')));
  for (const k of DC_LIDERES_ORDEN.filter(x => DC_LIDERES[x]).concat(Object.keys(DC_LIDERES).filter(x => !DC_LIDERES_ORDEN.includes(x)))) {   // en el orden en que se abren
    const L = DC_LIDERES[k], F = DC_FACCIONES[L.faccion], abierto = dcLiderAbierto(k), b = dcEl('button', 'dc-opcion dc-lider-op' + (abierto ? '' : ' dc-cerrada'));
    const arte = dcEl('span', 'dc-lider-op-arte'); arte.append(dcSprite(L.arte, 64));
    const txt = dcEl('span', 'dc-lider-op-txt');
    const paro = dcParoAbierto(k), estado = !abierto ? dcCandadoLider(k) : paro ? tr('Abierto hasta el paro +{n}', { n: paro }) : '';
    txt.append(dcEl('b', '', tr(L.nombre)), dcEl('small', 'dc-riesgo', tr(F.nombre) + ' · ' + tr('Vida {n}', { n: L.hp })));
    if (estado) txt.append(dcEl('small', 'dc-lider-estado' + (abierto ? '' : ' dc-lider-candado'), estado));
    txt.append( dcEl('span', '', tr(F.pasiva) + ': ' + tr(F.texto)), dcEl('span', '', tr(L.jugada.nombre) + ': ' + tr(L.jugada.texto, L.jugada)));
    b.append(arte, txt); b.dataset.lider = k; b.disabled = !abierto; b.onclick = () => { play('levelup'); alElegir(k); }; s.append(b);
  }
  const v = dcEl('button', 'btn-ghost ol', tr('VOLVER')); v.onclick = () => { play('select'); dcPortada(); }; s.append(v);
}
