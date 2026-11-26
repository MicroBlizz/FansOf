// Fans of Pop · EL CAJÓN DE MISIONES DEL PASE (tarea 375; boceto D elegido por Pepins el 26-11-2026: en el móvil el Pase no cabía y lo
// aplastaba todo, y no quería una barra de deslizar). Abajo de la ventana del Pase asoma un cajón rosa, «MISIONES Y LOGROS», con un
// globito de cuántas hay para cobrar. Al tocarlo sube y tapa el escaparate, la barra y el carril; al tocarlo otra vez, baja. RECOGER TODO
// (los premios de los escalones) se queda siempre abajo. Lo pinta ppVentanaPaseNueva (js/pase-pantalla.js); el estilo, css/pase.css.
// · crea(t, repinta, partes, n, pie): el cajón para la ventana `t` con `partes` dentro (las misiones y los logros), `n` en el globito y
//   `pie` (RECOGER TODO) debajo del asa, pegados los dos al fondo de la ventana aunque esta se deslice en un móvil pequeño. Al
//   abrir el Pase sale cerrado; al repintar (tras cobrar) se queda como estaba.
// · porCobrar(listas): cuántas misiones o logros están listos y sin cobrar.
'use strict';
const PP_PASE_CAJON = (() => {
  let abierto = false;
  const porCobrar = listas => listas.reduce((n, l) => n + l.filter(m => m.listo && !m.cobrada).length, 0);
  function crea(t, repinta, partes, n, pie) {
    if (!repinta) abierto = false;
    const cajon = document.createElement('div'), dentro = document.createElement('div');
    cajon.className = 'pp-pase-cajon'; dentro.className = 'pp-pase-cajon-dentro';
    const pon = () => { t.classList.toggle('pp-cajon-abierto', abierto); asa.setAttribute('aria-expanded', String(abierto)); };
    const asa = ppBoton('', 'pp-pase-asa', () => { abierto = !abierto; pon(); });
    asa.innerHTML = `<span>${tr('MISIONES Y LOGROS')}</span>${n > 0 ? `<b class="pp-pase-globo">${n}</b>` : ''}<svg class="pp-pase-flecha" viewBox="0 0 20 20" aria-hidden="true"><path d="M4 13l6-6 6 6" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    dentro.append(...partes);
    cajon.append(asa, dentro, pie);
    pon();
    return cajon;
  }
  return Object.freeze({ crea, porCobrar, get abierto() { return abierto; } });
})();
