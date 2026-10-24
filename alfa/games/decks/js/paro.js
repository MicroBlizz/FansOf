// Fans Of Decks · Niveles de paro, por líder: tras superar la campaña en normal se abre el paro +1 con ese líder, y cada victoria en su nivel más alto abre el siguiente.
// Cada nivel sube la vida de los rivales un 8 % y, cada tres niveles, les da 1 de Fuerza al entrar; cuesta cada vez más mantener el puesto.
// Premios (Arkioner, 24-10-2026): los niveles superados sumando todos los líderes abren ventajas genéricas (ventajas.js) y los de cada líder, las suyas (logros.js).
// Los huecos de ventajas siguen a Fibonacci con el paro de ese líder: al ganar el +2 se llevan 2, al ganar el +4, 3, el +7, 4 y el +12, 5.
// DCP.run.paro es el nivel de la partida (0 = normal); DCP.meta.paro[líder], el más alto abierto con ese líder; DCP.meta.paroTope, el más alto con cualquiera.
'use strict';
const DC_PARO_MAX = 15, DC_PARO_VIDA = 0.08, DC_PARO_HUECOS = [3, 5, 8, 13], DC_PARO_NOMBRES = ['Plantilla ajustada', 'Reestructuración', 'Despidos objetivos', 'ERE encubierto', 'Austeridad creativa', 'Auditoría externa', 'Fusión hostil', 'Consultora de recortes', 'Dividendos primero', 'Cierre patronal'];
function dcParo() { return DCP.run && DCP.run.paro ? DCP.run.paro : 0; }
function dcParoNombre(n) { return n ? tr('Paro +{n}', { n }) + ' · ' + tr(DC_PARO_NOMBRES[(n - 1) % DC_PARO_NOMBRES.length]) : tr('Normal'); }
// El paro abierto de cada líder. Las partidas de antes guardaban uno solo (meta.paroMax): pasa a CrazyBunny, el único líder que había.
function dcParoTabla() {
  const M = DCP.meta;
  if (!M.paro) { M.paro = {}; if (M.paroMax) M.paro.bunny = M.paroMax; }
  if (M.paroMax) { M.paro.bunny = Math.max(M.paro.bunny || 0, M.paroMax); delete M.paroMax; }
  M.paroTope = Math.max(0, ...Object.values(M.paro));
  return M.paro;
}
// Los niveles de paro superados, sumando todos los líderes (abren las ventajas genéricas).
function dcParoSuma() { return Object.values(dcParoTabla()).reduce((a, n) => a + n, 0); }
function dcParoAbierto(lider) { return dcParoTabla()[lider] || 0; }
// Cuántas ventajas fiscales se llevan a la vez con ese líder: 1, y una más al abrir el paro +3, +5, +8 y +13.
function dcHuecosVentaja(lider) { const n = dcParoAbierto(lider); return 1 + DC_PARO_HUECOS.filter(h => n >= h).length; }
function dcSiguienteHueco(lider) { const n = dcParoAbierto(lider); return DC_PARO_HUECOS.find(h => n < h) || 0; }
// Lo que el nivel les hace a los rivales: más vida y, de cada tres niveles, 1 de Fuerza.
function dcParoVida(n) { return Math.round(DC_PARO_VIDA * 100 * n); }
function dcParoFuerza(n) { return Math.ceil(n / 3); }
function dcParoEscala(r) {
  const n = dcParo(); if (!n) return r;
  r.hp = r.hpMax = Math.round(r.hp * (1 + DC_PARO_VIDA * n)); r.fuerza = dcParoFuerza(n);
  return r;
}
// Al ganar la partida: ganar en el nivel más alto abierto con ese líder abre el siguiente. Devuelve el nivel abierto (o 0).
function dcParoGana() {
  dcLogrosPartida();   // logros.js
  const T = dcParoTabla(), k = DCP.run.lider, n = dcParo();
  if (n < (T[k] || 0) || n >= DC_PARO_MAX) return 0;
  T[k] = n + 1; DCP.meta.paroTope = Math.max(DCP.meta.paroTope || 0, n + 1); return n + 1;
}
// Elegir el nivel con el líder ya elegido: normal y los paros abiertos (el más alto arriba), y el siguiente, cerrado, con lo que pide.
function dcEligeParo(lider, alElegir, volver) {
  const tope = dcParoAbierto(lider), s = dcPanel(tr('Nivel de paro'));
  s.append(dcEl('p', 'dc-nota', tr('Cada nivel de paro hace a los rivales más duros: cada vez cuesta más mantener el puesto. Ganando en el más alto se abre el siguiente, y los niveles superados abren ventajas fiscales nuevas.')));
  const huecos = dcHuecosVentaja(lider), sig = dcSiguienteHueco(lider);
  s.append(dcEl('p', 'dc-nota', tr(huecos === 1 ? 'Con este líder llevas 1 ventaja fiscal.' : 'Con este líder llevas {n} ventajas fiscales a la vez.', { n: huecos }) + (sig ? ' ' + tr('Al abrir el paro +{n}, una más.', { n: sig }) : '')));
  const opcion = (n, abierto) => {
    const b = dcEl('button', 'dc-opcion dc-ventaja dc-nivel-paro' + (abierto ? '' : ' dc-cerrada')); b.dataset.paro = n;
    b.append(dcEl('b', '', dcParoNombre(n)), dcEl('small', 'dc-riesgo', abierto ? (n === tope ? tr('El más alto') : tr('Superado')) : tr('Se abre: gana el {n} con este líder', { n: n > 1 ? tr('paro +{n}', { n: n - 1 }) : tr('modo normal') })));
    b.append(dcEl('span', '', n ? tr('Rivales con {v} % más de vida y {f} de Fuerza al entrar.', { v: dcParoVida(n), f: dcParoFuerza(n) }) : tr('La campaña de siempre.')));
    b.disabled = !abierto; b.onclick = () => { play('select'); alElegir(n); }; return b;
  };
  if (tope < DC_PARO_MAX) s.append(opcion(tope + 1, false));
  for (let n = tope; n >= 0; n--) s.append(opcion(n, true));
  if (volver) { const v = dcEl('button', 'btn-ghost ol', tr('VOLVER')); v.onclick = () => { play('select'); volver(); }; s.append(v); }
}
