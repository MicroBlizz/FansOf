// Fans Of Decks · OPCIONES y NOVEDADES de la portada: música, efectos, silencio, idioma, la cuenta de core y lo nuevo de cada versión.
'use strict';
const DC_NEWS_CLAVE = 'decks-novedades-vistas';
function dcNovedadSinVer() { try { return localStorage.getItem(DC_NEWS_CLAVE) !== NEWS[0].v; } catch (e) { return false; } }
function dcOpciones() {
  play('select');
  const v = dcVentana(tr('OPCIONES')), O = OPCIONES;   // el componente de core (core/js/sistema/opciones-comunes.js): las mismas filas que en el resto de juegos
  const { lista, version, cerrar } = O.lista({
    filas: [
      O.volumen(tr('Música'), () => DC_SON.mus, x => { DC_SON.mus = x; dcSonGuarda(); }),
      O.volumen(tr('Efectos'), () => DC_SON.vol, x => { DC_SON.vol = x; dcSonGuarda(); }),
      O.interruptor(tr('Sonido'), '', () => !DC_SON.mudo, x => { DC_SON.mudo = !x; dcSonGuarda(); }),
      'idioma', 'cuenta', O.novedades(dcNovedades),
    ],
    versionTexto: tr('Fans Of Decks · versión') + ' ' + NEWS[0].v + ' · © 2026 MicroBlizz', claseVersion: 'dc-version', alCerrar: dcCierraVentana,
  });
  v.append(lista, version, cerrar);
}
function dcNovedades() {
  play('select');
  try { localStorage.setItem(DC_NEWS_CLAVE, NEWS[0].v); } catch (e) { /* sin almacenamiento */ }
  const punto = document.getElementById('dc-news-punto'); if (punto) punto.hidden = true;
  const v = dcVentana(tr('NOVEDADES')), caja = dcEl('div', 'dc-news');
  for (const n of NEWS) {
    caja.append(dcEl('h4', 'ol', tr('Versión {v}', { v: n.v })));
    const ul = dcEl('ul');
    for (const t of n.real) { const li = dcEl('li'); li.innerHTML = tr(t); ul.append(li); }
    for (const t of n.joke || []) { const li = dcEl('li', 'joke'); li.innerHTML = tr(t); ul.append(li); }
    caja.append(ul);
  }
  const b = dcEl('button', 'btn-big ol', tr('CERRAR')); b.onclick = () => { play('select'); dcCierraVentana(); }; v.append(caja, b);
}
