// Tiny Fans · adaptador · RESUMEN: la hoja con clip del final de una salida o de un asalto (sello «APROBADO» si vuelves; «Mochila caída»
// si caes), con el botín, la meta y el botón naranja. Dueño: N6 (interfaz).
// ARCHIVO-INTERFAZ: lo deja N1 vacío pero cargable; su dueño lo rellena sin cambiar los nombres que expone. Contrato: docs/guia/juegos/tiny/README.md.
'use strict';
TN.hudResumen = {
  // datos: { motivo: 'vuelve' | 'cae' | 'asalto-sale' | 'asalto-falla', botin, unidades, segundos, meta }; acciones: { otra(), nido() }
  abre(datos, acciones) {},
  cierra() {},
};
