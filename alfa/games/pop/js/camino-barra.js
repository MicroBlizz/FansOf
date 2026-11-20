// Fans of Pop · LOS BOTONES HTML DEL CAMINO (tarea #267; Pepins, 20-11-2026: «no sé cuántas herramientas tengo… ni tengo un botón para
// ir al menú principal»; eligió la mezcla B + C de los bocetos):
// · a la izquierda, la columna de AYUDAS (#pp-camino-ayudas) con cuántas tienes de cada una o, si no te queda, su precio en perlas;
//   tocar una abre la tienda en «Ayudas». Qué se enseña lo dice js/camino-ayudas.js.
// · abajo y fija, la barra (#pp-camino-barra) como la de la portada: INICIO (azul, a la portada), EQUIPO (turquesa, solo con el flag
//   de compañeros) y TIENDA (dorada). La barra de corazones y monedas del lienzo va justo encima (ppPintaMapa).
// La pinta ppIrA al cambiar de pantalla; la columna se repasa cada segundo con el lateral (js/principal.js) por si cambian tus ayudas.
'use strict';
// el nombre corto de cada ayuda bajo su icono (la pista de Lola es la lupa)
const PP_CAMINO_NOMBRES = Object.freeze({ martillo: 'Martillo', bomba: 'Bomba', toques3: '+3 toques', pista: 'Lupa', deshacer: 'Deshacer' });
let PP_CAMINO_VISTO = '';   // lo último pintado en la columna: si no cambia, no se rehace (se repasa cada segundo)
const ppEnCamino = () => PP_PANT.actual === 'mapa';
// las ayudas que tocan ahora, según los primeros pasos (js/primeros-pasos-juego.js)
function ppCaminoListaAyudas() {
  const p = ppPrimeros();
  return PP_CAMINO.ayudas(PP_PRIMEROS.verAyudas(PP_CFG.primeros, p, p.nivel, false), ppPrimerosVe('duelos'));
}
function ppCaminoBotonAyuda(k) {
  const ins = PP_CAMINO.insignia(ppTengo(k), PP_CFG.ayudas[k].perlas), b = document.createElement('button');
  b.type = 'button'; b.className = 'pp-cam-ayuda';
  b.setAttribute('aria-label', tr(PP_CFG.ayudas[k].nombre));
  const marca = ins.tipo === 'cuantas' ? `<i class="pp-cam-n">${ins.n}</i>` : `<i class="pp-cam-n pp-cam-precio">${ppPerlasHtml(ins.n, 18)}</i>`;
  b.innerHTML = `<span class="pp-cam-bola">${ppIcono('i-' + k, 50, '#ffd1ec')}${k === 'toques3' ? '<em>+3</em>' : ''}${marca}</span><b>${tr(PP_CAMINO_NOMBRES[k])}</b>`;
  b.onclick = () => { play('select'); ppTienda(null, 'ayudas'); };
  return b;
}
// la columna de la izquierda (solo se rehace si cambia algo)
function ppPintaCaminoAyudas() {
  const col = $pp('#pp-camino-ayudas'); if (!col) return;
  const lista = ppEnCamino() ? ppCaminoListaAyudas() : [];
  col.hidden = !lista.length;
  const visto = lista.map(k => k + ppTengo(k)).join();
  if (col.hidden || visto === PP_CAMINO_VISTO) return;
  PP_CAMINO_VISTO = visto;
  col.replaceChildren(...lista.map(ppCaminoBotonAyuda));
}
// la barra de abajo: dibujo y nombre de cada botón, y qué hace
function ppPintaCaminoBarra() {
  const nav = $pp('#pp-camino-barra'); if (!nav) return;
  nav.hidden = !ppEnCamino(); if (nav.hidden) return;
  ppBarraBoton('#pp-camino-inicio', 'inicio', tr('INICIO')).onclick = () => { play('select'); ppGuardaCamino(); PP_P = null; ppIrA('titulo'); };
  ppBarraBoton('#pp-camino-tienda', 'tienda', tr('TIENDA')).onclick = () => { play('select'); ppTienda(null, 'ofertas'); };
  const eq = ppBarraBoton('#pp-camino-equipo', 'companeros', tr('EQUIPO'));
  eq.hidden = !ppCompanerosActivo();
  eq.onclick = () => ppVentanaCompaneros('equipo');
  ppPrimerosLado(eq, 'equipo');   // en una partida nueva, con candado hasta su nivel
}
function ppPintaCamino() { PP_CAMINO_VISTO = ''; ppPintaCaminoAyudas(); ppPintaCaminoBarra(); }
