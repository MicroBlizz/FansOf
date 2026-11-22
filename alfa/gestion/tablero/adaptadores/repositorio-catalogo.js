// Fans Of · /gestion · TABLERO · adaptador · REPOSITORIOCATALOGO: los juegos que tienen página en la alfa, leídos del catálogo de la biblioteca
// (web/biblioteca/juegos.json, ADR 198). Recibe de principal.js `pedir()`, que devuelve el texto del fichero (y lanza si no llega); el dominio valida los ids
// (TABLERO.juegosDelCatalogo). Devuelve un resultado: ok con los ids, `sin-catalogo` (no llegó: sin red o 404) o `catalogo-roto` (no es JSON o no vale).
'use strict';
TABLERO.repositorioCatalogo = ({ pedir }) => ({
  async juegos() {
    let texto;
    try { texto = await pedir(); } catch (e) { return TABLERO.error('sin-catalogo', { causa: e }); }
    let datos;
    try { datos = JSON.parse(texto); } catch (e) { return TABLERO.error('catalogo-roto', { causa: e }); }
    return TABLERO.juegosDelCatalogo(datos);
  },
});
