// Fans Of · CAJA NEGRA: la lista de lo que ha pasado justo antes (pantallas, toques, habilidades, errores), en TODOS los juegos.
// Es una lista circular en memoria (los últimos 100 sucesos). Aquí no se envía nada: la leen el botón «!» de los admins (reporte-prueba.js)
// y, más adelante, el envío automático ante un error. Por eso nada de aquí puede ser personal: solo entra lo que cumple una lista de permitidos.
// Está tras el flag 'caja-negra' (cerrado en la web, abierto en desarrollo); cerrado, apuntar un suceso no hace nada.
//
// Para los juegos:   CAJA.suceso('habilidad', { id: 'dron', objetivo: 3 })
//   · el tipo y las claves: minúsculas, números y _ (hasta 16 letras); como mucho 8 claves
//   · los valores: números, true/false o ids cortos (letras, números y _ . : / -). Un texto con espacios o más largo se descarta entero.
//   Nunca nombres, textos escritos por el jugador ni ids de otros jugadores: solo ids de catálogo, pantallas y números.
// Core apunta solo los toques en botones (su id, nunca su texto) y los errores de errores.js.
'use strict';
const CAJA = (() => {
  const MAX = 100, MAX_CLAVES = 8;
  const CLAVE_VALIDA = /^[a-z][a-z0-9_]{0,15}$/, VALOR_VALIDO = /^[A-Za-z0-9_.:\/-]{1,40}$/;
  const anillo = [], inicio = performance.now();

  const activa = () => typeof NUCLEO !== 'undefined' && typeof NUCLEO.flag === 'function' && NUCLEO.flag('caja-negra', 'Caja negra: lista de los últimos sucesos del juego, para los reportes', false);

  // deja pasar solo lo permitido: lo demás se tira (mejor perder un dato que colar uno personal)
  function limpia(datos) {
    const fuera = {};
    if (!datos || typeof datos !== 'object') return fuera;
    let n = 0;
    for (const k of Object.keys(datos)) {
      if (n >= MAX_CLAVES) break;
      const v = datos[k];
      if (!CLAVE_VALIDA.test(k)) continue;
      if (typeof v === 'number' && isFinite(v)) fuera[k] = Math.round(v * 100) / 100;
      else if (typeof v === 'boolean') fuera[k] = v;
      else if (typeof v === 'string' && VALOR_VALIDO.test(v)) fuera[k] = v;
      else continue;
      n++;
    }
    return fuera;
  }

  function suceso(tipo, datos) {
    if (!CLAVE_VALIDA.test(String(tipo)) || !activa()) return;
    anillo.push({ t: Math.round((performance.now() - inicio) / 100) / 10, k: tipo, d: limpia(datos) });
    if (anillo.length > MAX) anillo.shift();
  }

  // los toques en botones los apunta core sin ayuda del juego: solo el id del botón, nunca su texto ni lo que se escriba en un campo
  if (typeof document !== 'undefined') {
    document.addEventListener('click', ev => {
      const b = ev.target && ev.target.closest && ev.target.closest('button,[role="button"],a,input[type="button"],input[type="checkbox"]');
      const id = b && (b.dataset.id || b.id);
      if (id && VALOR_VALIDO.test(id)) suceso('toque', { id });
    }, true);
  }

  return { suceso, limpia, sucesos: () => anillo.map(s => Object.assign({}, s)), vaciar: () => { anillo.length = 0; } };
})();
