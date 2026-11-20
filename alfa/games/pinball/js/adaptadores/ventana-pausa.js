// Fans of Pinball · adaptador · VENTANA DE PAUSA: SEGUIR (con cuenta atrás 3, 2, 1 para recolocar los pulgares), el sonido y la vibración
// (se guardan en la partida) y SALIR al menú. Sale con el botón de pausa, al ocultarse la app y tras un salto largo del reloj.
'use strict';
PB.ventanaPausa = (() => {
  const texto = (nombre, si) => tr(nombre) + ': ' + (si ? tr('SÍ') : tr('NO'));
  function abre(acciones) {
    const s = PB.app.sonido;
    const sonido = PB.crea('button', { type: 'button', className: 'pb-boton pb-verde', textContent: texto('SONIDO', !s.apagado) });
    sonido.onclick = () => { s.alterna(); sonido.textContent = texto('SONIDO', !s.apagado); sonido.classList.toggle('pb-amarillo', s.apagado); };
    const vibra = PB.crea('button', { type: 'button', className: 'pb-boton pb-verde', textContent: texto('VIBRACIÓN', !s.sinVibrar) });
    vibra.onclick = () => { s.alternaVibrar(); vibra.textContent = texto('VIBRACIÓN', !s.sinVibrar); vibra.classList.toggle('pb-amarillo', s.sinVibrar); s.vibra(30); };
    PB.ventanas.abre({
      clase: 'pb-hoja-pausa', titulo: tr('PAUSA'), cuerpo: [PB.crea('div', { className: 'pb-columna' }, sonido, vibra)],
      botones: [{ texto: tr('SEGUIR'), clase: 'pb-naranja pb-grande', alPulsar: acciones.seguir }, { texto: tr('SALIR'), clase: 'pb-azul', alPulsar: acciones.salir }],
    });
  }
  return { abre };
})();
