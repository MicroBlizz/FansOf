// Fans of Asalto · ADAPTADORES · Lo que la cuenta tiene comprado para siempre (ADR 200): hoy, «Sin anuncios». Lo lleva core (DERECHOS,
// core/js/sistema/derechos.js): la cuenta manda, con una copia en este navegador (clave <partida>-derechos) para jugar sin red; las compras de
// prueba van aparte y solo cuentan en modo desarrollo. Aquí queda lo de Asalto: qué derechos son suyos y a quién avisar al cambiar.
'use strict';
AS.derechos = (() => {
  let avisa = () => {};
  const almacenamiento = (() => { try { return window.localStorage; } catch (e) { console.warn('Asalto: sin almacenamiento para los derechos', e); return null; } })();
  const d = DERECHOS.crea({
    almacenamiento, clave: SAVE_KEY + '-derechos', cuenta: typeof CUENTA !== 'undefined' ? CUENTA : null, juego: AJUSTES.id, desarrollo: !!NUCLEO.desarrollo,
    vale: c => c === MEDIDOR_ANUNCIOS.DERECHO, alCambiar: () => avisa(), enLinea: () => navigator.onLine !== false,
  });
  return { ...d, alCambiar: f => { avisa = f; } };
})();
