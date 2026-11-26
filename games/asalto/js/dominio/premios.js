// Fans of Asalto · DOMINIO · Los premios por cobrar al ganar una oleada (los hace reglas.premios): el cofre de la oleada de élite, el
// botín del jefe y la elección de reliquia. Aquí solo se mira el premio que toca y se dice qué da: la partida lo aplica (oro, plumas,
// reliquias) y pasa al siguiente. Puro: el azar llega de fuera.
'use strict';
AS.premios = (() => {
  const esReliquia = p => !!p && p.tipo === 'reliquia';
  // el cofre o el botín del jefe: AS.ok({ oro, plumas, objetos }). doble: con anuncio (solo el cofre)
  function cofre(p, doble) {
    if (!p || (p.tipo !== 'cofre' && p.tipo !== 'jefe')) return AS.error('sin-premio');
    const k = doble && p.tipo === 'cofre' ? 2 : 1;
    return AS.ok({ oro: p.oro * k, plumas: p.plumas * k, objetos: p.objetos || 0 });
  }
  // la reliquia elegida: AS.ok([id]) si está entre las opciones
  function elige(p, id) {
    if (!esReliquia(p)) return AS.error('sin-premio');
    return p.opciones.includes(id) ? AS.ok([id]) : AS.error('no-esta-en-la-oferta');
  }
  // llevarse las tres (con anuncio): AS.ok([id…])
  const todas = p => (esReliquia(p) ? AS.ok(p.opciones.slice()) : AS.error('sin-premio'));
  // otras tres (con anuncio): AS.ok(el premio con las opciones nuevas). reliquias: las que ya tiene, que no vuelven a salir
  const refresca = (datos, p, reliquias, azar) => (esReliquia(p) ? AS.ok({ ...p, opciones: AS.reglas.tresReliquias(datos, reliquias, azar) }) : AS.error('sin-premio'));
  return { cofre, elige, todas, refresca };
})();
