// Tiny Fans · aplicación · BUCLE de paso fijo: la simulación avanza siempre a pasos iguales (AJUSTES.simulacion.pasosPorSegundo) y el
// pintado va aparte, a lo que dé la pantalla. fotograma(ms) da los pasos que tocan y pinta una vez con `alfa`, la parte de paso que
// falta por dar (de 0 a 1), para suavizar. No pide la hora ni lee el joystick: se los pasan. En pausa pinta pero no avanza; avanza(n)
// da pasos a mano (pruebas). Dueño: N1 (arquitectura).
'use strict';
TN.creaBucle = ({ reglas, entrada, paso, pinta }) => {
  const PASO = 1000 / reglas.pasosPorSegundo, TOPE = reglas.maxPasosPorFotograma;
  let antes = null, debe = 0, pasos = 0, enPausa = false;
  const da = e => { paso(e); pasos += 1; };
  return {
    get pasos() { return pasos; },
    get enPausa() { return enPausa; },
    fotograma(ms) {
      const dt = antes === null ? 0 : Math.max(0, ms - antes);
      antes = ms;
      if (!enPausa) {
        debe = Math.min(debe + dt, PASO * TOPE);   // tras un atasco no se recupera todo de golpe
        for (; debe >= PASO - 1e-6; debe = Math.max(0, debe - PASO)) da(entrada());   // el margen evita perder un paso por el redondeo
      }
      pinta(enPausa ? 0 : debe / PASO, dt / 1000);
    },
    // pasos a mano, todos con la misma entrada ({ mx, mz } en ejes del mundo)
    avanza(n, e = { mx: 0, mz: 0 }) { for (let i = 0; i < n; i++) da(e); },
    pausa() { enPausa = true; debe = 0; },
    reanuda() { enPausa = false; },
  };
};
