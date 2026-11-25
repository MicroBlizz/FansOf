// Fans Of · CAPTURA DE PANTALLA: una foto de lo que ve el jugador, literal: el lienzo del juego y todo lo que va encima (ventanas, botones,
// la pantalla de victoria, los iconos del camino…). Antes el reporte solo copiaba el lienzo y se perdía lo demás (reporte 29 de Pop, tarea #233).
// Dibuja la página entera con modern-screenshot (core/js/vendor/, MIT), que se pide solo la primera vez que hace falta: no pesa a nadie que no
// reporte. Si la librería no llega o falla, se queda en la foto del lienzo más grande, como antes. ADR 174.
//   CAPTURA_PANTALLA.foto({ lado: 1280, excluir: ['rp-boton'] }) → Promise<'data:image/jpeg;base64,…' | null>
'use strict';
const CAPTURA_PANTALLA = (() => {
  const LADO = 1280, CALIDAD = 0.6, MAXIMO = 390000;   // el servidor no guarda capturas de más de 400 000 letras (servidor/98-reportes-prueba.sql)
  const yo = typeof document !== 'undefined' ? document.currentScript : null;
  // la librería, junto a core/js/ y con el mismo ?v= que este archivo
  const LIBRERIA = yo && yo.src ? new URL('../vendor/modern-screenshot.js' + new URL(yo.src).search, yo.src).href : null;
  let pedida = null;

  // a qué escala sale la foto: el lado más largo, como mucho `lado` píxeles (nunca se agranda)
  function escala(ancho, alto, lado = LADO) {
    const mayor = Math.max(ancho, alto);
    return mayor > 0 ? Math.min(1, lado / mayor) : 1;
  }
  // qué nodos entran en la foto: todos menos los de la lista de ids (el propio botón «!», la ventana del reporte)
  const entra = excluir => nodo => !(nodo && nodo.id && excluir.includes(nodo.id));

  function libreria() {
    if (window.modernScreenshot) return Promise.resolve(window.modernScreenshot);
    if (!LIBRERIA) return Promise.reject(new Error('sin ruta a la librería de captura'));
    if (!pedida) {
      pedida = new Promise((bien, mal) => {
        const s = document.createElement('script'); s.src = LIBRERIA;
        s.onload = () => { if (window.modernScreenshot) bien(window.modernScreenshot); else { pedida = null; mal(new Error('la librería de captura no ha arrancado')); } };
        s.onerror = () => { pedida = null; mal(new Error('No se ha podido cargar ' + LIBRERIA)); };
        document.head.appendChild(s);
      });
    }
    return pedida;
  }

  // la foto del lienzo más grande (lo de antes: lo que queda si no se puede dibujar la página)
  function lienzo(lado = LADO) {
    const lienzos = [...document.querySelectorAll('canvas')].filter(c => c.width > 0 && c.height > 0);
    if (!lienzos.length) return null;
    const mayor = lienzos.reduce((a, b) => (a.width * a.height >= b.width * b.height ? a : b));
    const k = escala(mayor.width, mayor.height, lado), c = document.createElement('canvas');
    c.width = Math.round(mayor.width * k); c.height = Math.round(mayor.height * k);
    c.getContext('2d').drawImage(mayor, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', CALIDAD);
  }

  // la página tal y como se ve ahora (el trozo de la ventana, no lo que queda fuera); si pesa demasiado, otra vez más pequeña
  async function pagina(excluir, lado) {
    const ms = await libreria();
    const ancho = window.innerWidth, alto = window.innerHeight, fondo = getComputedStyle(document.body).backgroundColor;
    for (let l = lado; l >= 480; l = Math.round(l * 0.75)) {
      const foto = await ms.domToJpeg(document.documentElement, { width: ancho, height: alto, scale: escala(ancho, alto, l), quality: CALIDAD,
        backgroundColor: fondo, filter: entra(excluir), timeout: 8000,
        features: { restoreScrollPosition: true } });   // cada ventana con su desplazamiento, no arriba del todo (tarea #347; viene apagado)
      if (foto && foto.length <= MAXIMO) return foto;
    }
    return null;
  }

  async function foto({ lado = LADO, excluir = [] } = {}) {
    try {
      const f = await pagina(excluir, lado);
      if (f) return f;
    } catch (e) {
      console.error('Captura de la página: ' + (e && e.message));   // no es un fallo del juego: se sigue con la foto del lienzo
    }
    try { return lienzo(lado); } catch (e) { console.error('Captura del lienzo: ' + (e && e.message)); return null; }
  }

  return { foto, escala, entra };
})();
