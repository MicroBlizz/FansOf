// Fans Of · NOVEDADES: el informe de parches, igual en todos los juegos.
//
// Cada juego escribe solo la lista, en su js/novedades.js, con la versión más nueva primero:
//     const NEWS = [
//       { v: '1.2.0', real: ['Lo nuevo de verdad, en lenguaje llano.', '…'], joke: ['Una nota de humor de Microblizz o Phony.'] },
//       { v: '1.1.0', real: ['…'], joke: ['…'] },
//     ];
// Con eso, este archivo hace lo demás:
//   · la ventana NOVEDADES (la última versión arriba y las anteriores debajo), que se abre con los botones #btn-news y #btn-opt-news;
//   · que salga sola la primera vez que se abre el juego después de actualizarse (novedadesPendientes, que cada juego mira al volver a su menú);
//   · el mismo texto para la librería de la raíz, que enseña las novedades de todos los juegos (newsHtml).
// La página del juego solo necesita la ventana: #scr-news con #news-title, #news-body y #btn-news-ok.
'use strict';
const newsLista = (items, cls) => (items && items.length ? `<ul${cls ? ' class="' + cls + '"' : ''}>${items.map(t => `<li>${tr(t)}</li>`).join('')}</ul>` : '');
// el informe entero: la versión más nueva con sus dos títulos y, debajo, las anteriores
function newsHtml(list) {
  if (!list || !list.length) return '';
  const cur = list[0];
  return `<h4>LO NUEVO</h4>${newsLista(cur.real)}<h4>NOTAS DE MICROBLIZZ Y PHONY</h4>${newsLista(cur.joke, 'joke')}`
    + list.slice(1).map(n => `<h4>VERSIÓN ${n.v}</h4>${newsLista(n.real)}${newsLista(n.joke, 'joke')}`).join('');
}
// lo que sigue solo tiene sentido dentro de un juego (la librería usa nada más que newsHtml)
const NEWS_VER = typeof NEWS !== 'undefined' && NEWS.length ? NEWS[0].v : '';   // la última versión con novedades: solo se enseñan solas cuando cambia
const novedadesPendientes = () => !!NEWS_VER && SAVE.seenVer !== NEWS_VER;
function openNews() {
  $('#news-title').textContent = 'NOVEDADES · ' + NEWS_VER;
  $('#news-body').innerHTML = newsHtml(NEWS);
  $('#scr-news').hidden = false; $('#news-body').scrollTop = 0;
}
// al cerrarla queda vista esta versión y el juego sigue con lo que le toque enseñar en el menú (su titlePopups)
function closeNews() {
  $('#scr-news').hidden = true; play('select'); stat('news', 1);
  if (SAVE.seenVer !== NEWS_VER) { SAVE.seenVer = NEWS_VER; saveGame(); }
  updateBadges(); titlePopups();
}
if (NEWS_VER && document.querySelector('#btn-news-ok')) {
  $('#btn-news-ok').onclick = closeNews;
  for (const id of ['#btn-news', '#btn-opt-news']) if ($(id)) $(id).onclick = () => { play('select'); openNews(); };
}
