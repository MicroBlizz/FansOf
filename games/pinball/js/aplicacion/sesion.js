// Fans of Pinball · aplicación · SESIÓN: los datos guardados (PB.Guardado) y la ÚNICA puerta para guardarlos, como TN.creaSesion de Tiny.
// Los casos de uso piden sesion.datos, cambian lo suyo y llaman a sesion.guarda(). Puerto que recibe:
//   almacen: { carga() → json | null, guarda(json) → bool }
// Sin partida guardada, o con una que no vale, se empieza de cero: `empezoDeCero` y `descartada` (el error) lo dicen.
'use strict';
PB.creaSesion = ({ reglas, almacen }) => {
  const guardado = almacen.carga();
  const r = guardado ? PB.Guardado.desdeJson(reglas, guardado) : null;
  let datos = r && r.ok ? r.valor : PB.Guardado.nuevo(reglas);
  return {
    get datos() { return datos; },
    empezoDeCero: !(r && r.ok),
    descartada: r && !r.ok ? r : null,
    guarda() { return almacen.guarda(datos); },
    // empezar de cero (panel DEV)
    reinicia() { datos = PB.Guardado.nuevo(reglas); return almacen.guarda(datos); },
  };
};
