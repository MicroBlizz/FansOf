// Fans of Rouflage · DOMINIO: LA SOSPECHA de un becario bot hacia un colado. Es un número de 0 a 1,3: con 0,5 le pica la curiosidad y se acerca a
// mirar («?»); con 1 te ha visto, apunta («!») y dispara. Sube hacia lo que «cantas» dividido por el mínimo que necesita para distinguirte
// desde esa distancia, y baja cuando no te ve. Reglas puras: no miran la partida, solo los números que se les pasan.
'use strict';

RF.Sospecha = (() => {
  const CONTORNO = 0.85;      // por debajo de este hielo se le ve el contorno (se mueve o se acaba de mover)
  const entre = (a, b, t) => a + (b - a) * t;
  // lo que sube la sospecha hacia un colado que está en la luz, a distancia `d`.
  // o: { d, canta (0 a 1), minimo (lo que debe cantar a esa distancia), ojo (el ojo que tiene hoy, 0,55 a 1,45), hielo, camo, uv (la linterna ultravioleta ve mejor la pintura: su factor, o 1) }
  const nivel = o => {
    const quieto = o.hielo >= CONTORNO;
    let n = o.canta / (o.minimo * (quieto ? o.ojo : 1)) * (quieto ? o.uv : 1);
    if (quieto && o.d < 45) n = Math.max(n, 0.35 + 0.8 * (1 - o.d / 45));      // pegado a él, hasta el mejor camuflaje se nota (el contorno, la sombra)
    if (quieto && o.camo >= 100 && o.d < 110) n = Math.max(n, 0.5 + 0.8 * (1 - o.d / 110));      // al 100 % le brilla el contorno: se acerca a mirar y, de cerca, lo ve
    return n;
  };
  // la sospecha ya tenida `s` ante un nivel `n` durante `dt` segundos; `rapida`: lo ve moverse con el contorno (y sin pasos de gato)
  const avanza = (s, n, rapida, dt) => (n > s ? Math.min(1.3, s + (n - s) * (rapida ? 3 : 1.4) * dt + 0.02 * dt) : Math.max(n, s - 0.2 * dt));
  const pierde = (s, dt) => Math.max(0, s - 0.14 * dt);      // no lo ve: se le va olvidando
  const tropieza = s => Math.max(s, 0.55);      // se ha tropezado con él: se para a mirar
  // lo que tiene que «cantar» un camaleón para que un becario lo distinga a esa distancia; si va atento (tras un silbido), algo menos
  const minimoVista = (d, atento, cerca, lejos, luzLargo) => entre(cerca, lejos, Math.min(1, d / luzLargo)) * (atento > 1 ? 0.85 : 1);
  return { nivel, avanza, pierde, tropieza, minimoVista, CONTORNO };
})();
