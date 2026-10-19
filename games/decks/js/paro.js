// Fans Of Decks · Niveles de paro: tras superar la campaña en normal se abre el nivel de paro +1, y cada victoria en el nivel más alto abre el siguiente. Cada nivel sube la vida de los rivales un 8 % y, cada tres niveles, les da 1 de Fuerza al entrar; cuesta cada vez más mantener el puesto.
// DCP.run.paro es el nivel de la partida (0 = normal); DCP.meta.paroMax, el más alto desbloqueado. Las cifras de la partida normal no cambian.
'use strict';
const DC_PARO_MAX = 15, DC_PARO_VIDA = 0.08, DC_PARO_NOMBRES = ['Plantilla ajustada', 'Reestructuración', 'Despidos objetivos', 'ERE encubierto', 'Austeridad creativa', 'Auditoría externa', 'Fusión hostil', 'Consultora de recortes', 'Dividendos primero', 'Cierre patronal'];
function dcParo() { return DCP.run && DCP.run.paro ? DCP.run.paro : 0; }
function dcParoNombre(n) { return n ? tr('Paro +{n}', { n }) + ' · ' + tr(DC_PARO_NOMBRES[(n - 1) % DC_PARO_NOMBRES.length]) : tr('Normal'); }
// Lo que el nivel les hace a los rivales: más vida y, de cada tres niveles, 1 de Fuerza.
function dcParoVida(n) { return Math.round(DC_PARO_VIDA * 100 * n); }
function dcParoFuerza(n) { return Math.ceil(n / 3); }
function dcParoEscala(r) {
  const n = dcParo(); if (!n) return r;
  r.hp = r.hpMax = Math.round(r.hp * (1 + DC_PARO_VIDA * n)); r.fuerza = dcParoFuerza(n);
  return r;
}
// Al acabar la partida: ganar en el nivel más alto desbloqueado abre el siguiente.
function dcParoGana() {
  const n = dcParo(); if (n < (DCP.meta.paroMax || 0) || n >= DC_PARO_MAX) return false;
  DCP.meta.paroMax = n + 1; return true;
}
// Elegir el nivel antes de empezar (solo si ya hay alguno abierto).
function dcEligeParo(alElegir) {
  const tope = DCP.meta.paroMax || 0; if (!tope) return alElegir(0);
  let n = tope; const s = dcPanel(tr('Nivel de paro'));
  s.append(dcEl('p', 'dc-nota', tr('Cada nivel de paro hace a los rivales más duros: cada vez cuesta más mantener el puesto. Ganando en el más alto se abre el siguiente.')));
  const caja = dcEl('div', 'dc-opcion dc-paro'), nom = dcEl('b'), txt = dcEl('span');
  const menos = dcEl('button', 'btn-ghost ol', '−'), mas = dcEl('button', 'btn-ghost ol', '+');
  const pinta = () => { nom.textContent = dcParoNombre(n); txt.textContent = n ? tr('Rivales con {v} % más de vida y {f} de Fuerza al entrar.', { v: dcParoVida(n), f: dcParoFuerza(n) }) : tr('La campaña de siempre.'); menos.disabled = n <= 0; mas.disabled = n >= tope; };
  menos.onclick = () => { n--; pinta(); }; mas.onclick = () => { n++; pinta(); };
  caja.style.cursor = 'default'; caja.append(nom, txt);
  const fila = dcEl('div', 'dc-paro-fila'); fila.append(menos, caja, mas); s.append(fila); pinta();
  const ok = dcEl('button', 'btn-big ol', tr('SEGUIR')); ok.onclick = () => { play('select'); alElegir(n); }; s.append(ok);
}
