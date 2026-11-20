// Tiny Fans · adaptador · DEV: los ganchos de prueba (TN.dev) y la sección «Tiny Fans» del panel DEV de core (UTILIDADES_JUEGO), solo
// en modo desarrollo. Con los ganchos, una prueba mueve el juego sin dedos ni esperas: avanza(segundos, entrada) da pasos de simulación
// a mano (y deja el tiempo real en pausa hasta reanuda()), estado() lee lo que hay y ve(pantalla) salta a otra. Cada módulo añade sus
// botones al panel con TN.dev.boton('texto', fn) al cargarse, sin tocar este archivo. Dueño: N1 (arquitectura).
'use strict';
TN.dev = (() => {
  const botones = [];
  const boton = (texto, fn) => { botones.push([texto, fn]); };
  // avanza la simulación `segundos` con la misma entrada en cada paso: { mx, mz } en ejes del mundo (x a la derecha, z hacia el jugador)
  function avanza(segundos, entrada) {
    const n = Math.round(segundos * AJUSTES.simulacion.pasosPorSegundo);
    TN.bucle.pausa();
    TN.bucle.avanza(n, entrada);
    return n;
  }
  const estado = () => ({ ...TN.pantallas.estado(), pasos: TN.bucle.pasos, enPausa: TN.bucle.enPausa, partida: TN.sesion.partida.aJson() });
  const ve = (id, datos) => TN.pantallas.ve(id, datos);
  // materiales de sobra para probar el nido, y el asalto abierto sin tener que volver con botín
  function regala(n = 50) {
    const p = TN.sesion.partida, r = TN.Nido.desdeJson(AJUSTES, p.nido), nido = r.ok ? r.valor : TN.Nido.nuevo(AJUSTES);
    nido.guarda({ carton: n, grapas: n, migas: n, plastico: n, pilas: 5 }); p.ponNido(nido.aJson()); TN.sesion.guarda();
    return ve(TN.pantallas.actual);
  }
  function abreAsalto() { TN.sesion.partida.anotaVuelta(true, 1); TN.sesion.guarda(); return ve(TN.pantallas.actual); }
  function reinicia() { TN.sesion.reinicia(); return ve(AJUSTES.pantallas.inicial); }
  // la sección del panel DEV: saltar a cada pantalla, el tiempo y la partida; detrás, los botones de cada módulo
  function panel(caja) {
    const fijos = [...TN.pantallas.ids().map(id => ['Ir a: ' + id, () => ve(id)]), ['+1 s', () => avanza(1)], ['+10 s', () => avanza(10)],
      ['Reanudar', () => TN.bucle.reanuda()], ['+1 h de reloj', () => TN.reloj.adelanta(1)], ['Partida nueva', reinicia], ['+50 materiales', () => regala()], ['Abrir asalto', abreAsalto]];
    const fila = TN.crea('div', { className: 'fila' });
    for (const [texto, fn] of fijos.concat(botones)) fila.append(TN.crea('button', { type: 'button', textContent: texto, onclick: fn }));
    caja.append(fila);
  }
  return { boton, avanza, estado, ve, reinicia, regala, abreAsalto, reanuda: () => TN.bucle.reanuda(), pausa: () => TN.bucle.pausa(), panel };
})();
// el nombre que busca el panel DEV de core (core/js/sistema/desarrollo.js): es suyo, no un global nuevo del juego
const UTILIDADES_JUEGO = NUCLEO.desarrollo ? [{ titulo: 'Tiny Fans', pinta: caja => TN.dev.panel(caja) }] : [];
