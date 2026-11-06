// Fans Of · /gestion, pestaña COLA: la hoja de estilos de la pantalla (carriles, tabla de resumen, barras de progreso).
// Solo datos: cola.js la pone en un <style>. `css(extra)` recibe el CSS de otro módulo (cola-config.js) y lo pega en su sitio.
'use strict';
const COLA_ESTILO = (() => {
  const css = extra => `.cl-bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center}.cl-bar button.on{background:var(--acento);color:var(--acento-texto);border-color:var(--acento);font-weight:600}
    .cl-op{display:flex;gap:6px;align-items:center;font-size:13px;color:var(--suave)}.cl-gran{font-size:26px;font-weight:700;margin-bottom:4px}.cl-fila{display:grid;grid-template-columns:minmax(120px,1.2fr) 3fr auto;gap:10px;align-items:center;padding:4px 0}.cl-rec{grid-template-columns:1fr auto auto}
    .cl-res{margin:12px 0 6px}.cl-res td,.cl-res th{padding:6px 10px}.cl-res .cl-tot td{font-weight:700}.cl-res .cl-sub td:first-child{padding-left:1.6em}.cl-res .cl-suave{color:var(--suave)}.cl-barra{height:12px;border:1px solid var(--linea);border-radius:6px;overflow:hidden;background:var(--bg)}.cl-barra i{display:block;height:100%;background:var(--debil)}
    .cl-lane{display:grid;gap:4px;margin-bottom:12px}.cl-strip{display:flex;min-height:48px;border:2px solid var(--texto);border-radius:8px;overflow:hidden}.cl-strip.off{background:repeating-linear-gradient(45deg,var(--bg) 0 8px,var(--panel) 8px 16px)}
    .cl-b{display:flex;flex-direction:column;justify-content:center;padding:0 8px;border-right:2px solid var(--texto);font-size:12px;font-weight:600;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;background:var(--panel);min-width:0}.cl-b:last-child{border-right:0}
    .cl-b.run{background:var(--ok-fondo);color:var(--ok)}.cl-b small{font:11px var(--mono);font-weight:400;color:var(--suave)}.estado.esp{background:var(--debil-fondo);color:var(--debil)}
    .cl-refr{display:inline-flex;flex-direction:column;gap:3px;align-items:stretch;min-width:7em}.cl-prog-txt{font:11px var(--mono);color:var(--suave);text-align:center;white-space:nowrap}
    ${extra}
    .cl-prog{display:block;height:6px;border:1px solid var(--texto);border-radius:4px;overflow:hidden;background:var(--bg)}.cl-prog b{display:block;height:100%;width:0;background:var(--acento);transition:width .3s}`;
  return { css };
})();
