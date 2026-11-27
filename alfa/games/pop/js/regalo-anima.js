// Fans of Pop · ABRIR EL REGALO DIARIO, la animación (tarea 383, boceto A de Pepins, 26-11-2026): al pulsar ¡ABRIR! la caja tiembla
// y se abre de golpe por su bisagra (img-liso/i-regalo-abierto.png, del mismo dibujo que i-regalo); con un destello sale lo que ha
// tocado (y el premio de la meta de días seguidos, si la hay) con rayos de luz y, al pulsar ¡GENIAL!, sus iconos
// vuelan a la barra de arriba (corazones, monedas y perlas), cuyas cifras cuentan hacia arriba. El vuelo es el del pase (ppPaseVuela,
// js/pase.js) y la barra, la de la victoria (ppVicBarra, js/victoria-panel.js). Solo en pruebas, junto con los días seguidos
// (ppDiasSeguidosActivo, js/regalo.js). Con «reducir movimiento» en el móvil no tiembla ni vuela: sale el premio y se cierra. Estilo: css/regalo.css.
'use strict';
// cuánto dura cada parte (ms; `mira`, lo que se queda abierta al llegar el último icono, para ver la cifra ya contada) y cuántas copias
// de cada moneda o perla salen volando (un chorro, como en el boceto)
const PP_RG_ANIMA = Object.freeze({ tiembla: 650, estalla: 350, mira: 700, copias: 5 });
const ppRegaloQuieto = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
// los iconos que vuelan: de monedas y perlas, `copias` cada uno; lo demás (ayudas, corazones infinitos), una vez
function ppRegaloVuelan(iconos, copias = PP_RG_ANIMA.copias) {
  return iconos.flatMap(i => (i.dataset.i === 'i-moneda' || i.dataset.i === 'i-perla' ? Array(copias).fill(i) : [i]));
}
// la caja de la ventana del regalo tiembla y estalla; después sale lo que ha tocado. `html` es esa ventana, `antes` lo que tenías
// (monedas y perlas) antes de recibirlo, para que la barra de arriba cuente desde ahí
function ppRegaloAnimaAbre(html, antes) {
  const halo = $pp('#pp-tarjeta .pp-rg-halo'), abrir = $pp('#pp-tarjeta > .pp-btn');
  if (abrir) abrir.disabled = true;
  if (!halo || ppRegaloQuieto()) { ppRegaloToma(html, antes); return; }
  halo.classList.add('pp-rg-tiembla');
  setTimeout(() => { halo.classList.add('pp-rg-estalla'); halo.innerHTML = ppIcono('i-regalo-abierto', 130, '#9cf0a0'); play('ppPop'); }, PP_RG_ANIMA.tiembla);   // se abre por la bisagra
  setTimeout(() => ppRegaloToma(html, antes, halo), PP_RG_ANIMA.tiembla + PP_RG_ANIMA.estalla);
}
// la ventana de lo que ha tocado, con la barra de arriba. Si mientras temblaba la cerraste o abriste otra (ya no está la caja que
// temblaba, `halo`), no se vuelve a abrir ni tapa la otra: el premio ya es tuyo
function ppRegaloToma(html, antes, halo) {
  ppPintaLateral();
  if ($pp('#pp-modal').hidden || (halo && !halo.isConnected)) return;
  play('ppVictoria'); ppVibra([20, 30, 20]);
  ppVicBarra(antes.monedas);
  const t = ppAbre(html);
  t.classList.add('pp-rg-toma');
  t.appendChild(ppBoton(tr('¡GENIAL!'), 'pp-btn', () => ppRegaloVuela(t, antes)));
}
// ¡GENIAL!: los iconos del premio y de la meta vuelan a la barra y, al llegar el último, se cierra
function ppRegaloVuela(t, antes) {
  const boton = t.querySelector('.pp-btn');
  if (boton) boton.disabled = true;
  if (ppRegaloQuieto()) { ppCierra(); return; }
  const iconos = [...t.querySelectorAll('.pp-rg-premio .pp-ico, .pp-rg-logro .pp-ico')];
  ppPaseVuela(ppRegaloVuelan(iconos), antes, () => setTimeout(ppCierra, PP_RG_ANIMA.mira));   // copia los iconos antes de que se apaguen los de la ventana
  t.querySelectorAll('.pp-rg-premio, .pp-rg-logro .pp-premios').forEach(e => e.classList.add('pp-rg-se-va'));
}
