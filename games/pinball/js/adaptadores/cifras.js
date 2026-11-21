// Fans of Pinball · adaptador · CIFRAS Y LETREROS en HTML encima del lienzo (el lienzo no lleva texto): los números que saltan (★2: daño
// y puntos, más grandes con el combo), los letreros gordos («¡CAOS!», «¡POR LOS PELOS!», «¡×10!», «PLANTA 3») y las fichas que vuelan a
// su contador y lo hacen latir (★4). Grupos fijos de elementos creados al montar y reciclados: nada se crea en cada golpe.
'use strict';
PB.creaCifras = (capa, jugo) => {
  const J = jugo.cifras, caja = PB.crea('div', { className: 'pb-cifras' }), cifras = [], monedas = [];
  let sig = 0, sigM = 0;
  for (let i = 0; i < J.cuantas; i++) { const d = PB.crea('b', { className: 'pb-cifra' }); cifras.push(d); caja.append(d); }
  for (let i = 0; i < jugo.fichasVuelan.cuantas; i++) { const m = PB.imagen(AJUSTES.arte.imagenes.moneda, 2, 'pb-vuela'); m.hidden = true; monedas.push(m); caja.append(m); }
  const letrero = PB.crea('div', { className: 'pb-letrero', hidden: true });
  caja.append(letrero);
  capa.append(caja);
  let quitaLetrero = 0;
  // reinicia la animación CSS de un elemento
  const reanima = (e, clase) => { e.classList.remove(clase); void e.offsetWidth; e.classList.add(clase); };
  return {
    // un número en (x, y) CSS; combo agranda; clase: '' | 'pb-puntos' | 'pb-critico' | 'pb-tiempo'
    salta(texto, x, y, combo = 0, clase = '') {
      const d = cifras[sig];
      sig = (sig + 1) % cifras.length;
      d.textContent = texto;
      d.className = 'pb-cifra ' + clase;
      d.style.left = Math.round(x) + 'px'; d.style.top = Math.round(y) + 'px';
      d.style.fontSize = Math.min(J.tope, J.base + combo * J.porCombo) + 'px';
      reanima(d, 'pb-sube');
    },
    // un letrero gordo en el centro durante `segundos`; clase: 'pb-naranja' | 'pb-rojo' | 'pb-verde' | 'pb-azul'
    letrero(texto, clase = 'pb-naranja', segundos = 1.2) {
      clearTimeout(quitaLetrero);
      letrero.textContent = texto;
      letrero.className = 'pb-letrero ' + clase;
      letrero.hidden = false;
      reanima(letrero, 'pb-golpea');
      quitaLetrero = setTimeout(() => { letrero.hidden = true; }, segundos * 1000);
    },
    // una ficha vuela de (x, y) CSS al elemento `destino`, que late al llegar
    vuela(x, y, destino, alLlegar) {
      if (!destino) return;
      const m = monedas[sigM], r = destino.getBoundingClientRect();
      sigM = (sigM + 1) % monedas.length;
      m.hidden = false;
      const a = m.animate([{ transform: `translate(${x - 14}px, ${y - 14}px) scale(1.2)` }, { transform: `translate(${r.left + r.width / 2 - 14}px, ${r.top + r.height / 2 - 14}px) scale(0.8)` }],
        { duration: jugo.fichasVuelan.segundos * 1000, easing: 'cubic-bezier(.5,-0.3,.7,1)' });
      a.onfinish = () => { m.hidden = true; reanima(destino, 'pb-late'); if (alLlegar) alLlegar(); };
    },
    limpia() { clearTimeout(quitaLetrero); letrero.hidden = true; for (const m of monedas) m.hidden = true; },
    quita() { caja.remove(); },
  };
};
