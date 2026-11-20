// Fans of Pinball · adaptador · VENTANA DE MEJORAS: elegir 1 de 3 tras cada ascensor (PROTOTIPO.md, «Mejoras de partida»): cartas grandes
// con su icono, nombre, texto de una línea y la rareza con su color (común verde, rara azul, épica naranja; nada de lila ni gris), y el
// botón de barajar (uno gratis por partida). Las cartas no aceptan toques en sus primeras décimas: un pulgar que seguía apretando la
// pala no elige sin querer.
'use strict';
PB.ventanaMejoras = (() => {
  const RAREZA = { comun: 'Común', rara: 'Rara', epica: 'Épica' };
  const ESPERA_MS = 350;
  function carta(m, i, alElegir) {
    const icono = PB.imagen(AJUSTES.arte.mejoras[m.id] || AJUSTES.arte.mejoras.pala_acero, 2, 'pb-icono-mejora');
    return PB.crea('button', { type: 'button', className: 'pb-mejora pb-' + m.rareza, onclick: () => alElegir(i) },
      icono,
      PB.crea('b', { textContent: tr(m.nombre) }),
      PB.crea('small', { textContent: tr(m.texto) }),
      PB.crea('em', { textContent: tr(RAREZA[m.rareza]) + (m.tiene ? ' · ' + tr('Nivel {n}').replace('{n}', m.tiene + 1) : '') }));
  }
  function abre(foto, acciones) {
    const desde = performance.now(), lista = PB.crea('div', { className: 'pb-mejoras' });
    const elige = i => {
      if (performance.now() - desde < ESPERA_MS) return;
      PB.ventanas.cierra();
      acciones.elige(i);
    };
    const pinta = f => { lista.replaceChildren(...f.oferta.map((m, i) => carta(m, i, elige))); };
    pinta(foto);
    const hoja = PB.ventanas.abre({
      clase: 'pb-hoja-mejoras', titulo: tr('ELIGE UNA MEJORA'), cuerpo: [lista],
      botones: [{ texto: tr('BARAJAR') + ' (' + foto.barajar + ')', clase: 'pb-azul', queda: true, alPulsar: () => {
        const f = acciones.baraja();
        if (!f) return;
        pinta(f);
        boton.textContent = tr('BARAJAR') + ' (' + f.barajar + ')';
        boton.disabled = f.barajar <= 0;
      } }],
    });
    const boton = hoja.querySelector('.pb-azul');
    boton.disabled = foto.barajar <= 0;
  }
  return { abre };
})();
