// Fans of Asalto · ADAPTADORES · El panel de probabilidades (HTML sobre el lienzo): la línea por invocación (y la de la próxima, con la
// red contra la mala suerte), lo que sale de cada runa, la rareza con la que llega cada héroe (las de candado, cerradas), las piedras de
// destino y lo que hace la máquina elegida. Todas las cifras las da dominio/suerte.js con los mismos pesos que la tirada: aquí solo se pintan.
'use strict';
AS.ventanas.suerte = (() => {
  const V = AS.ventanas, btn = V.btn;
  // un porcentaje a la manera del idioma: 29,7 % en español y 29.7 % en inglés; los muy pequeños, con un decimal más
  function pc(p) {
    const v = p * 100, d = v > 0 && v < 1 ? 2 : v === Math.round(v) ? 0 : 1, txt = v.toFixed(d);
    return (typeof IDIOMA !== 'undefined' && IDIOMA.actual === 'en' ? txt : txt.replace('.', ',')) + '\u00a0%';   // sin partir el número del %
  }
  const barra = p => `<div class="as-barra"><i style="width:${Math.round(p * 100)}%"></i></div>`;
  const nombreRuna = r => (r === AS.altar.COMODIN ? tr('Comodín') : tr(ASALTO.clases[r].nombre));
  const icoRuna = r => V.ico(r === AS.altar.COMODIN ? 'gema' : 'clase-' + r);
  function htmlLinea(s) {
    const red = tr('Si fallas {n} seguidas, la red contra la mala suerte puede arreglar la siguiente: {lista}.', { n: s.red.desde, lista: s.red.prob.map(pc).join(', ') });
    const ahora = s.ahora > s.linea ? `<p class="as-nota"><b>${tr('Tu próxima invocación: {p} (llevas {n} sin línea)', { p: pc(s.ahora), n: s.fallos })}</b></p>` : '';
    return `<h3>${tr('LÍNEA POR INVOCACIÓN')}</h3><p class="as-suerte-gorda">${pc(s.linea)}</p>${ahora}<p class="as-nota">${red}</p>`
      + (s.repite ? `<p class="as-nota">${tr('Segunda oportunidad: si la primera invocación de la oleada no da línea, se repite gratis.')}</p>` : '');
  }
  const htmlRunas = s => `<h3>${tr('CADA RUNA')}</h3><div class="as-suerte-runas">${s.runas.map(x => `<span>${icoRuna(x.runa)}<b>${pc(x.p)}</b><small>${nombreRuna(x.runa)}</small></span>`).join('')}</div>`;
  function htmlRarezas(s) {
    const fila = x => `<li class="as-item${x.candado ? ' as-suerte-cerrada' : ''}"><div><b>${tr(x.nombre)} <em class="as-cifra">${x.candado ? '' : pc(x.p)}</em></b>${x.candado ? `<span>${tr('Con candado: se abre en Mejoras')}</span>` : barra(x.p)}</div></li>`;
    return `<h3>${tr('RAREZA DE CADA HÉROE')}</h3><ul class="as-lista as-cifras">${s.rarezas.map(fila).join('')}</ul>`;
  }
  function htmlPiedras(s) {
    const fila = x => `<li class="as-item">${AS.pinta.piedras.img(x.tipo)}<div><b>${tr(x.nombre)} <em class="as-cifra">${pc(x.p)}</em></b>
      <span>${x.hasta > 0 ? tr('+{n} de rareza · como mucho {r}', { n: x.sube, r: tr(ASALTO.rarezas[x.hasta].nombre) }) : tr('+{n} de rareza · sin rarezas abiertas, llegan Comunes', { n: x.sube })}</span></div></li>`;
    return `<h3>${tr('PIEDRAS DE DESTINO')}</h3><p class="as-nota">${tr('Lo a menudo que da cada piedra su misión, y hasta dónde sube la rareza con lo que tienes abierto.')}</p><ul class="as-lista as-cifras">${s.piedras.map(fila).join('')}</ul>`;
  }
  function htmlMaquina(s) {
    const m = s.maquina, cifras = m.estallidos ? tr('Empujones por oleada: {e} · Estallidos: {s}', { e: m.empujones, s: m.estallidos }) : tr('Empujones por oleada: {e}', { e: m.empujones });
    return `<h3>${tr('TU MÁQUINA')}</h3><ul class="as-lista"><li class="as-item"><div><b>${tr(m.nombre)}</b><span>${tr(m.txt)}</span><span>${cifras}</span></div></li></ul>`;
  }
  // el estado del panel sale de la partida en juego (sus mejoras, reliquias, fallos seguidos y máquina)
  function abre(E) {
    const p = E.casos.partida, s = AS.suerte.de(ASALTO, { mods: p.mods, reliquias: p.reliquias, fallos: p.fallos, maquina: p.maquina });
    V.abre(`<h2>${tr('PROBABILIDADES')}</h2><p class="as-nota">${tr('Cuentas exactas, con tus mejoras y reliquias de ahora.')}</p>`
      + htmlLinea(s) + htmlRunas(s) + htmlRarezas(s) + htmlPiedras(s) + htmlMaquina(s) + btn('as-cerrar', tr('CERRAR'), 'as-azul'), 'as-suerte');
    V.alPulsar('as-cerrar', V.cierra);
  }
  return Object.assign(abre, { pc });
})();
