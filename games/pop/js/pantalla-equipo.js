// Fans of Pop · PANTALLA DE COMPAÑEROS: MI EQUIPO (tarea #142, ADR 157; boceto aprobado por Pepins, 19-11-2026). La segunda pestaña de la
// ventana de compañeros (js/pantalla-album.js): un equipo por modo (Niveles, Pesadilla y Duelos contra la máquina), sus casillas (abiertas,
// la siguiente con candado y precio, las de después cerradas) y abajo tus compañeros de ese modo para ponerlos o quitarlos. Las casillas se
// abren con monedas y, en Niveles, también con perlas (como el hueco de antes, motivo 'hueco'). Reglas en js/coleccion.js.
'use strict';
const PP_EQ_EXPLICA = Object.freeze({
  N: 'Ayudan en niveles normales y difíciles. {s} de serie, hasta {t}.',
  P: 'En Pesadilla ayudan una vez por nivel. {s} de serie, hasta {t}.',
  D: 'Solo contra la máquina. {s} de serie, hasta {t}.',
});
function ppEqModos() {
  const fila = ppPfEl('div', 'pp-cm-modos');
  for (const m of PP_COLE.MODOS) {
    const b = ppPfEl('button', `pp-cm-modo-b pp-cm-m${m}` + (PP_ALB.modo === m ? ' pp-on' : ''), tr(PP_ALB_MODOS[m]).toUpperCase()); b.type = 'button';
    b.onclick = () => { play('select'); PP_ALB.modo = m; PP_ALB.aviso = ''; ppVentanaCompaneros(); }; fila.appendChild(b);
  }
  return fila;
}
// una casilla: con su compañero (tocarla lo quita), vacía, la siguiente (candado y precio) o cerrada (solo candado)
function ppEqCasilla(m, c) {
  if (c.tipo === 'abierta' && c.id) {
    const b = ppPfEl('button', 'pp-cm-casilla'); b.type = 'button';
    b.appendChild(ppCompMini(c.id, 64));
    b.onclick = () => { play('select'); ppEqToca(m, c.id); };
    return b;
  }
  if (c.tipo === 'abierta') return ppPfEl('div', 'pp-cm-casilla pp-cm-vacia', tr('Vacía'));
  return ppPfEl('div', 'pp-cm-casilla pp-cm-cerrada', PP_COMP_CANDADO + (c.tipo === 'siguiente' ? ppMonedasHtml(c.monedas, 18) : ''));
}
// los botones para abrir la siguiente casilla (si queda alguna)
function ppEqCompra(t, m, sig) {
  if (!sig) return;
  t.appendChild(ppPfEl('p', 'pp-cm-via', `${tr('Abre otra casilla, para siempre.')} ${tr('Tienes:')} ${ppMonedasHtml(SAVE.monedas, 22)}`));
  const fila = ppPfEl('div', 'pp-fila pp-cm-compra');
  fila.appendChild(ppBotonPrecio(tr('ABRIR'), sig.monedas, 'pp-btn2 pp-oro', () => ppEqAbre(m, true)));
  if (sig.perlas) fila.appendChild(ppBotonPerlas(tr('ABRIR'), sig.perlas, 'pp-btn2 pp-rosa', () => ppEqAbre(m, false), () => ppVentanaCompaneros(), 'hueco'));
  t.appendChild(fila);
}
function ppEqLista(e, m) {
  const caja = ppPfEl('div', 'pp-cm-pagina'), tuyos = PP_COMP_VISTA.tuyosDe(e, m);
  caja.innerHTML = `<h3>${tr('Tus compañeros de {m}', { m: tr(PP_ALB_MODOS[m]) })}</h3>`;
  if (!tuyos.length) { caja.appendChild(ppPfEl('p', 'pp-cm-via', tr('Aún no tienes compañeros de este modo: búscalos en el álbum.'))); return caja; }
  caja.appendChild(ppPfEl('p', 'pp-cm-via', tr('Toca uno para ponerlo o quitarlo.')));
  const rejilla = ppPfEl('div', 'pp-cm-rejilla');
  for (const id of tuyos) rejilla.appendChild(ppAlbCarta(e, id, e.eq[m].includes(id) ? 'pp-cm-puesto' : '', k => ppEqToca(m, k)));
  caja.appendChild(rejilla);
  return caja;
}
function ppEquipoLlena(t) {
  const e = ppCole(), m = PP_ALB.modo, p = PP_COMP.PRECIOS.casillas[m], lista = PP_COMP_VISTA.casillas(e, m);
  t.appendChild(ppEqModos());
  t.appendChild(ppPfEl('p', 'pp-cm-explica', tr(PP_EQ_EXPLICA[m], { s: p.serie, t: p.tope })));
  const huecos = ppPfEl('div', 'pp-cm-casillas');
  huecos.style.gridTemplateColumns = `repeat(${lista.length}, 1fr)`;
  for (const c of lista) huecos.appendChild(ppEqCasilla(m, c));
  t.appendChild(huecos);
  ppEqCompra(t, m, lista.find(c => c.tipo === 'siguiente'));
  t.appendChild(ppEqLista(e, m));
}
// poner o quitar uno del equipo de un modo
function ppEqToca(m, id) {
  const e = ppCole(), r = e.eq[m].includes(id) ? PP_COLE.quita(e, m, id) : PP_COLE.pon(e, m, id);
  PP_ALB.aviso = r.ok ? '' : ppAlbError(r.error);
  if (r.ok) ppColeGuarda(r.estado);
  ppVentanaCompaneros();
}
// abrir la siguiente casilla: con monedas (se cobran aquí) o con perlas (ya las ha cobrado ppBotonPerlas)
function ppEqAbre(m, conMonedas) {
  const r = PP_COLE.abreCasilla(ppCole(), m);
  if (!r.ok || (conMonedas && !ppCobra(r.precio.monedas))) { PP_ALB.aviso = ppAlbError(r.ok ? 'monedas' : r.error); ppVentanaCompaneros(); return; }
  ppColeGuarda(r.estado);
  play('ppPremio'); ppVibra([20, 30, 20]);
  PP_ALB.aviso = tr('¡Casilla abierta!');
  ppVentanaCompaneros();
}
