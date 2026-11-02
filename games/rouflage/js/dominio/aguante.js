// Fans of Rouflage · DOMINIO: EL AGUANTE de un colado. Corriendo se gasta (`seg` segundos seguidos); parado o congelado se recupera (`descanso`
// segundos para entero). Al agotarse queda «cansado» (va a paso de tortuga) hasta recuperar la mitad. Regla pura: devuelve el estado nuevo.
'use strict';

RF.Aguante = (() => {
  const limita = (v, a, b) => (v < a ? a : v > b ? b : v);
  // estado: { aguante (0 a 1), cansado }; reglas: { aguante (segundos corriendo), descanso (segundos parado) }
  // → { aguante, cansado, seAgota } (seAgota: justo ahora ha llegado a 0, para el aviso)
  const paso = (estado, dt, corre, reglas) => {
    const aguante = limita(estado.aguante + (corre ? -dt / reglas.aguante : dt / reglas.descanso), 0, 1);
    if (!estado.cansado && aguante <= 0) return { aguante, cansado: true, seAgota: true };
    if (estado.cansado && aguante >= 0.5) return { aguante, cansado: false, seAgota: false };
    return { aguante, cansado: estado.cansado, seAgota: false };
  };
  return { paso };
})();
