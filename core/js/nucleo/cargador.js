// Fans Of · NÚCLEO · el cargador: pide las hojas, las fuentes y los archivos de código, los cuenta para la splash y los pasa por la puerta de
// carga (PUERTA_CARGA, ADR 093), y apunta todo lo pedido (es lo que se guarda para jugar sin conexión). Una pieza de nucleo.js (tarea #28):
// recibe el documento, la puerta y el aviso a la splash, así que se prueba en Node.
'use strict';
(() => {
  // documento: el document · puerta: PUERTA_CARGA · aSplash(orden, ...datos): avisar a la splash, si está · conV: añade el ?v= ·
  // estilosComunes: las hojas de las pantallas comunes · consola: console
  function cargador({ documento, puerta, aSplash, conV, estilosComunes, consola }) {
    const pedido = [];   // todo lo que carga la página: es lo que se guarda para jugar sin conexión
    // cada hoja y cada script que se pide avisa a la splash al llegar o al fallar (la barra de carga y el aviso de error)
    const carga = { pide: () => aSplash('pide'), llega: () => aSplash('llega'), falla(src) { consola.error('No se ha podido cargar ' + src); aSplash('falla', src); } };
    // la puerta de carga le avisa también cuando ha cargado todo: la página y todo el código pedido (el load solo ya no basta)
    const avisosPuerta = Object.assign({ cargada: () => aSplash('cargada') }, carga);
    const pideHoja = (h, opcional) => { pedido.push(conV(h)); carga.pide(); puerta.hoja(conV(h), opcional); };

    // Hojas de estilo, en el orden en que se dan. Se escriben en la cabecera, en su sitio, pero sin bloquear el pintado (la splash sale ya):
    // el código del juego no corre hasta que han llegado todas. La primera de las comunes trae todas, en su orden.
    function estilos(...hojas) {
      puerta.avisa(avisosPuerta);
      for (const h of hojas.flatMap(x => (x === estilosComunes[0] ? estilosComunes : [x]))) pideHoja(h, false);
    }
    // Las hojas de las fuentes, las de core/fuentes/ (ADR 092): como una hoja más, pero opcionales (si una falta, el juego sale con la letra
    // de repuesto).
    function fuentes(...hojas) {
      puerta.avisa(avisosPuerta);
      for (const h of hojas) pideHoja(h, true);
    }
    // Un archivo de código. Con async = false se ejecutan en el orden en que se piden, aunque lleguen desordenados. Se empieza a bajar ya
    // (preload) pero no se pone en la página hasta que se abre la puerta de carga: así arranca con sus hojas y su letra.
    // opcional: si no llega, el juego sigue (no para la splash); es lo que no hace falta para jugar (estadísticas, panel DEV)
    function codigo(src, opcional = false) {
      const s = documento.createElement('script'); s.src = conV(src); s.async = false;
      s.onload = () => { carga.llega(); puerta.codigoHecho(); };
      s.onerror = () => { if (!opcional) carga.falla(src); else { consola.error('No se ha podido cargar ' + src); carga.llega(); } puerta.codigoHecho(); };
      carga.pide(); pedido.push(s.src); puerta.codigoPide();
      if (!puerta.abierta) { const l = documento.createElement('link'); l.rel = 'preload'; l.as = 'script'; l.href = s.src; documento.head.appendChild(l); }
      puerta.alAbrir(() => documento.body.appendChild(s));
    }
    // Un archivo de código que se pide cuando la página ya ha cargado (el panel DEV de quien tiene el rol «alfa», ADR 096): se pone en la página sin
    // pasar por la puerta ni contarse para la splash, que ya se ha ido. Opcional siempre: si no llega, solo se apunta en la consola.
    function codigoTardio(src) {
      const s = documento.createElement('script'); s.src = conV(src);
      s.onerror = () => consola.error('No se ha podido cargar ' + src);
      documento.body.appendChild(s);
    }
    // ya se ha pedido todo el código: la barra de la splash ya puede contarlo, la puerta puede abrirse (cuando lleguen las hojas)
    // y la carga puede darse por acabada
    function todoPedido() { aSplash('todoPedido'); puerta.avisa(avisosPuerta); puerta.todoPedido(); }

    return { pedido, carga, estilos, fuentes, codigo, codigoTardio, todoPedido };
  }

  if (typeof NUCLEO_PIEZAS !== 'undefined') NUCLEO_PIEZAS.cargador = cargador;
  if (typeof module !== 'undefined') module.exports = cargador;
})();
