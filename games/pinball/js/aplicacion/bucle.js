// Fans of Pinball · aplicación · BUCLE de paso fijo (MOVIL.md, apartado 2): la física avanza siempre a pasos iguales de 1/240 s y el
// pintado va aparte, a lo que dé la pantalla. fotograma(ms) da los pasos que tocan y pinta una vez con `alfa` (la parte de paso que falta,
// de 0 a 1) para suavizar. Tope de pasos por cuadro (unos 100 ms de física); un salto mayor de 250 ms pausa. La cámara lenta y el parón
// de golpe dan MENOS TIEMPO a la física sin cambiar el tamaño del paso. No pide la hora ni lee los dedos: se los pasan.
'use strict';
PB.creaBucle = ({ reglas, entrada, paso, pinta, alPausar = () => {} }) => {
  const PASO = 1 / reglas.pasosPorSegundo, TOPE = reglas.maxPasosPorFotograma, SALTO = reglas.saltoMaximoMs;
  let antes = null, debe = 0, pasos = 0, enPausa = false, parado = 0;
  const lenta = { quedan: 0, factor: 1 };
  const da = e => { paso(PASO, e); pasos += 1; };
  // segundos de física que tocan por `real` segundos de reloj (descontando parón y cámara lenta)
  function tiempoFisica(real) {
    const come = Math.min(parado, real);
    parado -= come; real -= come;
    const despacio = Math.min(lenta.quedan, real);
    lenta.quedan -= despacio;
    return despacio * lenta.factor + (real - despacio);
  }
  function avanzaTiempo(dtMs) {
    if (dtMs > SALTO) { enPausa = true; debe = 0; alPausar('salto'); return; }
    debe = Math.min(debe + tiempoFisica(dtMs / 1000), PASO * TOPE);
    for (; debe >= PASO - 1e-9; debe = Math.max(0, debe - PASO)) da(entrada());
  }
  return {
    get pasos() { return pasos; },
    get enPausa() { return enPausa; },
    get lenta() { return lenta.quedan > 0; },
    fotograma(ms) {
      const dtMs = antes === null ? 0 : Math.max(0, ms - antes);
      antes = ms;
      if (!enPausa) avanzaTiempo(dtMs);
      pinta(enPausa ? 0 : debe / PASO, dtMs / 1000);
    },
    // pasos a mano, todos con la misma entrada ({ izquierda, derecha }); para pruebas
    avanza(n, e = { izquierda: false, derecha: false }) { for (let i = 0; i < n; i++) da(e); },
    // cámara lenta: `segundos` reales a `factor` de velocidad (0,3 = 30 %)
    camaraLenta(segundos, factor) { lenta.quedan = segundos; lenta.factor = factor; },
    // parón de golpe: la física se para estos milisegundos (se suman si llegan varios, con tope de 150 ms: espec.)
    paron(ms) { parado = Math.min(0.15, parado + ms / 1000); },
    pausa() { enPausa = true; debe = 0; },
    reanuda() { enPausa = false; antes = null; },
  };
};
