// Fans of Pinball · adaptador · CÁMARA: sigue a la bola entre los dos niveles (PROTOTIPO.md, «Controles y mesa»; MOVIL.md, «Cámara»):
// suave, con un poco de adelanto en la dirección en que va y sin saltos; con varias bolas (CAOS) sigue a la más baja; las palas del nivel
// de la bola siempre a la vista si cabe, y la bola siempre. Se mueve en píxeles enteros del lienzo (una sola densidad: ARTE.md) y
// lleva el temblor (★5: nunca más de 0,2 s). Coordenadas: y en unidades del mundo; pos() da la esquina de la vista en píxeles lógicos.
'use strict';
PB.creaCamara = (reglas, arte, mesa) => {   // reglas = AJUSTES.jugo
  const C = reglas.camara, K = arte.pxPorUnidad, NIVEL = mesa.niveles[0].y1;
  const palasY = { arriba: 0, abajo: 0 };
  for (const p of mesa.palas) palasY[p.nivel] = Math.max(palasY[p.nivel], p.y);
  let y = 0, pegada = true, amp = 0, queda = 0;
  const pos = { x: 0, y: 0 };
  // la bola a seguir: la más baja (la que va hacia las palas)
  function objetivo(bolas) {
    let b = null;
    for (const o of bolas) if (!b || o.y > b.y) b = o;
    return b;
  }
  // la y (arriba de la vista, en unidades) que se quiere para esa bola con una vista de `alto` unidades
  function quiere(b, alto, techo) {
    const ade = Math.max(-C.adelantoMax, Math.min(C.adelantoMax, b.vy * C.adelanto));
    let top = b.y + ade - techo - (alto - techo) * 0.5;   // centrada en lo que no tapa el marcador
    const pala = b.y < NIVEL ? palasY.arriba : palasY.abajo;
    top = Math.max(top, pala + C.margenPalas - alto);   // las palas de su nivel, a la vista
    top = Math.min(top, b.y - C.margenBola - techo);    // pero la bola, siempre (por debajo del marcador)
    return Math.max(-techo, Math.min(mesa.alto - alto, top));
  }
  return {
    // vista: { ancho, alto } en píxeles lógicos; techo: unidades que tapa el marcador arriba (la cámara puede subir eso por encima de la mesa)
    sigue(foto, dt, vista, techo = 0) {
      const b = objetivo(foto.bolas), alto = vista.alto / K;
      if (b) {
        const meta = quiere(b, alto, techo);
        y = pegada ? meta : y + (meta - y) * Math.min(1, C.suave * dt);
        pegada = false;
      }
      y = Math.max(-techo, Math.min(Math.max(0, mesa.alto - alto), y));
      queda = Math.max(0, queda - dt);
      const t = queda > 0 ? amp : 0;
      pos.x = Math.floor(((mesa.ancho + 2 * arte.margen) * K - vista.ancho) / 2) + (t ? Math.round((Math.random() * 2 - 1) * t) : 0);
      pos.y = Math.round(y * K) + (t ? Math.round((Math.random() * 2 - 1) * t) : 0);
      return pos;
    },
    // la próxima vez se pone de golpe sobre la bola (al empezar una sala)
    pega() { pegada = true; },
    // temblor de `px` píxeles lógicos (se queda con el mayor de los que coincidan)
    tiembla(px) { amp = queda > 0 ? Math.max(amp, px) : px; queda = reglas.temblor.segundos; },
    get y() { return y; },
  };
};
