// Fans Of · NÚCLEO · el panel DEV (ADR 096): decide cuándo se carga core/js/sistema/desarrollo.js. Una pieza de nucleo.js; recibe lo que usa (el entorno,
// los roles de la cuenta, cómo cargar y recargar), así que se prueba en Node.
// En la alfa y en el modo desarrollo sale siempre, como hasta ahora. En la release y en la app de Android sale solo si la cuenta tiene el rol «alfa»
// (CUENTA.roles, ADR 097): ya se sabe al acabar de cargar la página, porque lo recordado se lee del navegador sin preguntar a nadie. Si el servidor
// da el rol, el panel se carga en caliente; si lo quita, la página se recarga una vez. No abre ningún juego cerrado: eso es el modo desarrollo.
'use strict';
(() => {
  const ROL = 'alfa';

  // entorno: el de entorno.js · roles(): CUENTA.roles, o null si CUENTA aún no ha llegado · alCargar(fn): al acabar de cargar la página y su código ·
  // carga(enCola): pone desarrollo.js (enCola: entre lo que se pide junto a todo lo demás; si no, ya con la página cargada) · recarga() ·
  // espera(fn, ms) · consola: console
  function panelDev({ entorno, roles, alCargar, carga, recarga, espera, consola }) {
    const conRol = () => { const r = roles(); return !!(r && r.tiene(ROL)); };
    // ¿sale ahora el panel? Se pregunta en el momento: el rol puede llegar de fondo
    const sale = () => entorno.panelDev(conRol());

    // Pregunta de fondo al servidor lo que haga falta. Si la página salió sin panel y ahora hay rol, se carga el panel en caliente; si salió con
    // él y el rol se ha quitado, se recarga (el panel no se puede descargar) y solo si quedó guardado, porque si no, la página recargada saldría igual.
    // Quien tiene un «no» reciente no vuelve a preguntar en cada carga: cuesta una consulta al servidor por página.
    async function vigila(yaPuesto) {
      const r = roles();
      if (!r || (!yaPuesto && r.vigente())) return;
      const res = await r.refrescar([ROL]);
      if (!res.ok) return;   // sin red, sin cuenta o cambio de cuenta: se queda como está
      const hay = res.valor.roles.tiene(ROL);
      if (hay && !yaPuesto) carga(false);
      else if (!hay && yaPuesto && res.valor.guardado) recarga();
    }
    const alFondo = yaPuesto => vigila(yaPuesto).catch(e => consola.error('Panel DEV: ' + e.message));

    // Se llama una vez, cuando ya se ha pedido todo lo común
    function programa() {
      if (entorno.desarrollo || entorno.alfa) { carga(true); return; }
      alCargar(() => {
        const yaPuesto = conRol();
        if (yaPuesto) carga(false);
        if (yaPuesto) espera(() => alFondo(true), 5000); else alFondo(false);   // con el rol recordado se juega ya y se mira de fondo
      });
    }

    return Object.freeze({ sale, programa, vigila: alFondo });
  }

  if (typeof NUCLEO_PIEZAS !== 'undefined') NUCLEO_PIEZAS.panelDev = panelDev;
  if (typeof module !== 'undefined') module.exports = panelDev;
})();
