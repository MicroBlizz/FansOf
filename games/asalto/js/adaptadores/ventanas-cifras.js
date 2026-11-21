// Fans of Asalto · ADAPTADORES · La ventana de las cifras del combate (HTML sobre el lienzo): lo que ha hecho cada héroe, en cuatro
// pestañas (daño hecho, daño aguantado, curación y bajas), del último combate o de la partida entera. Cada héroe sale con su retrato,
// su cifra y una barra respecto al mejor. Solo enseña lo que llevan los casos de uso (dominio/cifras.js): no decide nada.
'use strict';
AS.ventanas.cifras = (() => {
  const V = AS.ventanas, btn = V.btn, CI = AS.cifras;
  // las cuatro pestañas: su cuenta, su rótulo, su color y la frase que la explica
  const PESTANAS = [
    { campo: 'dano', nombre: 'DAÑO', clase: 'as-rojo', col: '#d8402f', txt: 'El daño que cada héroe ha hecho a los enemigos.' },
    { campo: 'aguante', nombre: 'AGUANTE', clase: 'as-azul', col: '#3f8ae8', txt: 'El daño que ha recibido cada héroe, con lo que ha parado su escudo.' },
    { campo: 'cura', nombre: 'CURA', clase: 'as-verde', col: '#57b947', txt: 'La vida que cada héroe ha devuelto, a sí mismo o a los demás.' },
    { campo: 'bajas', nombre: 'BAJAS', clase: 'as-naranja', col: '#f08a2a', txt: 'Los enemigos que ha derrotado cada héroe.' },
  ];
  const ver = { campo: 'dano', cual: 'ultimo' };   // lo que se está mirando: se recuerda mientras dure la partida
  const cifra = v => String(Math.round(v));
  function fila(x, P) {
    const d = ASALTO.heroes[x.tipo];
    return `<li class="as-item"><i class="as-retrato as-pix" style="${AS.dibujos.cssRetrato(x.tipo, 0.5)}"></i><div><b>${d.nombre} <em class="as-cifra">${cifra(x.v)}</em></b>
      <div class="as-barra"><i style="width:${Math.round(x.parte * 100)}%;background:${P.col}"></i></div></div></li>`;
  }
  function cuerpo(tabla, P) {
    const l = CI.lista(tabla, P.campo);
    if (!l.length) return `<p class="as-nota">${tr('Aún no has luchado en esta partida.')}</p>`;
    return `<ul class="as-lista as-cifras">${l.map(x => fila(x, P)).join('')}</ul><p class="as-botin">${tr('Total:')} ${cifra(CI.total(tabla, P.campo))}</p>`;
  }
  // alCerrar: adónde se vuelve (la ventana del final de la partida); sin él, a la partida
  function abre(E, alCerrar) {
    const c = E.casos.cifras, P = PESTANAS.find(x => x.campo === ver.campo), cual = (k, txt) => btn('as-cual-' + k, txt, 'as-chico ' + (ver.cual === k ? 'as-oro' : 'as-naranja as-apagado'));
    const pestanas = PESTANAS.map(x => btn('as-pest-' + x.campo, tr(x.nombre), 'as-chico ' + x.clase + (x === P ? '' : ' as-apagado'))).join('');
    V.abre(`<h2>${tr('CIFRAS')}</h2><div class="as-fila as-junta">${cual('ultimo', tr('ÚLTIMO COMBATE'))}${cual('partida', tr('PARTIDA'))}</div>
      <div class="as-fila as-junta">${pestanas}</div><p class="as-nota">${tr(P.txt)}</p>${cuerpo(c[ver.cual], P)}` + btn('as-cerrar', tr('CERRAR'), 'as-azul'));
    V.alPulsar('as-cerrar', () => { V.cierra(); if (alCerrar) alCerrar(); });
    for (const k of ['ultimo', 'partida']) V.alPulsar('as-cual-' + k, () => { ver.cual = k; abre(E, alCerrar); });
    for (const x of PESTANAS) V.alPulsar('as-pest-' + x.campo, () => { ver.campo = x.campo; abre(E, alCerrar); });
  }
  return abre;
})();
