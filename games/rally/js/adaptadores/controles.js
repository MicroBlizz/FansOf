// Fans of Rally · adaptador · MANDOS: el gas va solo (como en la recreativa con el pedal a fondo); tú giras y frenas. En el móvil,
// dos botones grandes abajo a la izquierda para girar y uno a la derecha para frenar; en el PC, flechas o A/D para girar y abajo, S o
// espacio para frenar. El giro sube y baja poco a poco, para que tocar el botón no dé un volantazo.
'use strict';
RA.creaMandos = raiz => {
  const pulsado = { izq: false, der: false, freno: false }, teclas = new Set();
  let giro = 0;
  const TECLAS = { izq: ['ArrowLeft', 'a', 'A'], der: ['ArrowRight', 'd', 'D'], freno: ['ArrowDown', 's', 'S', ' '] };
  const tecla = nombre => TECLAS[nombre].some(t => teclas.has(t));
  function boton(el, nombre) {
    const pon = v => e => { e.preventDefault(); pulsado[nombre] = v; el.classList.toggle('ra-pulsado', v); };
    el.addEventListener('pointerdown', pon(true));
    for (const ev of ['pointerup', 'pointercancel', 'pointerleave']) el.addEventListener(ev, pon(false));
  }
  raiz.querySelectorAll('[data-mando]').forEach(el => boton(el, el.dataset.mando));
  addEventListener('keydown', e => { teclas.add(e.key); if (e.key.startsWith('Arrow') || e.key === ' ') e.preventDefault(); });
  addEventListener('keyup', e => teclas.delete(e.key));
  addEventListener('blur', () => { teclas.clear(); Object.keys(pulsado).forEach(k => { pulsado[k] = false; }); });
  // los mandos de este momento para el coche del jugador
  function lee(dt) {
    const quiere = (pulsado.der || tecla('der') ? 1 : 0) - (pulsado.izq || tecla('izq') ? 1 : 0);
    const rapidez = quiere === 0 ? 9 : Math.sign(quiere) !== Math.sign(giro) ? 10 : 5;
    giro += RA.limita(quiere - giro, -rapidez * dt, rapidez * dt);
    const freno = pulsado.freno || tecla('freno') ? 1 : 0;
    return { giro, gas: freno ? 0 : 1, freno };
  }
  const suelta = () => { giro = 0; teclas.clear(); Object.keys(pulsado).forEach(k => { pulsado[k] = false; }); };
  return { lee, suelta };
};
