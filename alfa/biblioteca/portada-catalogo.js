// Fans Of · LA PORTADA NUEVA · el catálogo con buscador y orden y la fila de NOVEDADES (tarea #277, ADR 188), tras el flag «portada-nueva» (solo en la alfa).
//   · NOVEDADES: bajo el carrusel DESTACADO, una fila que se desliza de lado con los juegos de versión más reciente (novedades/fechas.json).
//   · TODOS LOS JUEGOS: una sola rejilla con todo lo vivo (favoritos y prototipos juntos; el Archivo sigue aparte y plegado), cada juego con su captura,
//     y encima una barra fija con el buscador, el botón ORDENAR (abre una hoja desde abajo) y las etiquetas para filtrar. El orden se recuerda en el navegador.
// No mueve las tarjetas de siempre: pinta las suyas aparte (clase «pn») y portada-nueva.css esconde los grupos viejos, así que cerrar el flag devuelve la portada
// de siempre sin recargar. Buscar, filtrar y ordenar es la regla pura CATALOGO (biblioteca/catalogo.js). Usa de la página: TARJETAS, datosDe() y abrirFicha()
// (tienda.js), AGRUPAR.alVotos() (agrupar.js), ESTILO_NUEVO, NUCLEO.alCambiarFlags, esc() y t(). Las fechas llegan con el aviso «portada:destacado» de tienda.js.
'use strict';
(() => {
  const GUARDADO = 'fansof-portada-orden', MAX_NOVEDADES = 8;
  const NOMBRES = { nuevos: 'Más nuevos', nombre: 'Nombre A-Z', votados: 'Más votados', favoritos: 'Favoritos primero' };
  const EXPLICA = { nuevos: 'La última versión publicada, arriba', nombre: 'Por orden alfabético', votados: 'Lo que más pide la gente', favoritos: 'Los que elegimos nosotros y luego el resto' };
  const leerModo = () => { try { return CATALOGO.modoValido(localStorage.getItem(GUARDADO)); } catch (e) { return 'nuevos'; } };
  const guardarModo = m => { try { localStorage.setItem(GUARDADO, m); } catch (e) { /* sin almacenamiento: vale mientras la página esté abierta */ } };
  const estado = { texto: '', etiqueta: '', modo: leerModo(), fechas: {}, votos: {} };
  let juegos = [], montado = false;

  // los juegos vivos (sin el Archivo ni los que /gestion → Juegos quita de la portada, ADR 203), con lo que necesitan la regla y la tarjeta
  function leerJuegos() {
    return TARJETAS.filter(s => s.dataset.tipo !== 'Archivo' && !s.hidden && s.isConnected).map((s, orden) => {
      const d = datosDe(s);
      return { id: s.id.replace(/^g-/, ''), tarjeta: s.id, nombre: d.nombre, etiquetas: d.etiquetas,
        favorito: 'favorito' in s.dataset, orden, color: d.color, captura: d.capturas[0] || '', jugar: d.jugar };
    });
  }
  function sello(j) {
    if (document.querySelector(`#${j.tarjeta} .marca-nuevo`)) return `<span class="pn-sello pn-sello-nuevo">${esc(t('NUEVO'))}</span>`;
    return j.favorito ? `<span class="pn-sello pn-sello-fav">${esc(t('FAVORITO'))}</span>` : '';
  }
  function puntos(j) {
    const p = Number(estado.votos[j.id] && estado.votos[j.id].puntos) || 0;
    if (!p) return '';
    return `<span class="pn-puntos">${esc(p === 1 ? t('1 punto') : t('{p} puntos', { p }))}</span>`;
  }
  // una tarjeta pequeña: la captura de fondo, el sello, el nombre y su primera etiqueta; JUGAR abajo. Tocarla (fuera de JUGAR) abre la ficha.
  const mini = (j, conJugar = true) => `<article class="pn-mini" data-tarjeta="${esc(j.tarjeta)}" tabindex="0" role="button" aria-label="${esc(j.nombre)}" style="--wc:${esc(j.color)}">
    <div class="pn-mini-img"${j.captura ? ` style="background-image:url('${esc(j.captura)}')"` : ''}>${sello(j)}${puntos(j)}
      <span class="pn-mini-n ol">${esc(j.nombre)}</span><span class="pn-mini-e">${esc(t(j.etiquetas[0] || ''))}</span></div>
    ${conJugar ? `<a class="pn-mini-jugar ol" href="${esc(j.jugar)}">${esc(t('JUGAR'))}</a>` : ''}</article>`;

  function pintarRejilla() {
    const caja = document.getElementById('pn-rejilla'); if (!caja) return;
    // las etiquetas traducidas se piden en cada búsqueda: el diccionario puede llegar después de montar
    const conTextos = juegos.map(j => ({ ...j, textos: j.etiquetas.map(x => t(x)) }));
    const lista = CATALOGO.ordenar(CATALOGO.filtrar(conTextos, estado), estado.modo, estado);
    caja.innerHTML = lista.map(j => mini(j)).join('');
    document.getElementById('pn-vacio').hidden = lista.length > 0;
    document.getElementById('pn-cuenta').textContent = lista.length === 1 ? t('1 juego') : t('{n} juegos', { n: lista.length });
    document.querySelector('#pn-ordenar .pn-ordenar-t').textContent = t(NOMBRES[estado.modo]);
  }
  function pintarNovedades() {
    const caja = document.getElementById('pn-novedades'); if (!caja) return;
    const lista = CATALOGO.ordenar(juegos.filter(j => estado.fechas[j.id]), 'nuevos', estado).slice(0, MAX_NOVEDADES);
    caja.innerHTML = lista.map(j => mini(j, false)).join('');
    caja.closest('.pn-fila').hidden = !lista.length;
  }
  const pintar = () => { pintarRejilla(); pintarNovedades(); };

  function pintarEtiquetas() {
    const todas = [''].concat(CATALOGO.etiquetasFrecuentes(juegos));
    document.getElementById('pn-etiquetas').innerHTML = todas.map(x => `<button type="button" class="pn-etiqueta${x === estado.etiqueta ? ' on' : ''}" data-etiqueta="${esc(x)}"
      aria-pressed="${x === estado.etiqueta}">${esc(x ? t(x) : t('Todos'))}</button>`).join('');
  }
  function hojaHtml() {
    return `<div class="pn pn-velo" id="pn-velo" hidden></div>
    <div class="pn pn-hoja" id="pn-hoja" role="dialog" aria-modal="true" aria-labelledby="pn-hoja-t" hidden><div class="pn-asa"></div>
      <p class="pn-hoja-t ol" id="pn-hoja-t">${esc(t('ORDENAR POR'))}</p>
      ${CATALOGO.MODOS.map(m => `<button type="button" class="pn-op" data-modo="${m}"><span class="pn-punto"></span><span>${esc(t(NOMBRES[m]))}<small>${esc(t(EXPLICA[m]))}</small></span></button>`).join('')}
      <p class="pn-hoja-nota">${esc(t('Se acuerda de lo que eliges en este navegador.'))}</p></div>`;
  }
  function catalogoHtml() {
    return `<div class="pn pn-catalogo subsec" id="catalogo"><h3 class="grupo ol">${esc(t('TODOS LOS JUEGOS'))}</h3>
      <div class="pn-buscador"><label class="pn-busca"><span class="pn-lupa" aria-hidden="true"></span>
        <input type="search" id="pn-busca" placeholder="${esc(t('Buscar juego'))}" aria-label="${esc(t('Buscar juego o etiqueta'))}" autocomplete="off" enterkeyhint="search"></label>
        <button type="button" class="pn-ordenar ol" id="pn-ordenar" aria-haspopup="dialog"><span class="pn-ordenar-t"></span><span class="pn-flecha" aria-hidden="true"></span></button></div>
      <div class="pn-etiquetas" id="pn-etiquetas"></div>
      <p class="pn-cuenta" id="pn-cuenta" aria-live="polite"></p>
      <div class="pn-rejilla" id="pn-rejilla"></div>
      <p class="pn-vacio" id="pn-vacio" hidden>${esc(t('No hay ningún juego así. Prueba con otra palabra.'))}</p></div>`;
  }

  function abrirHoja(si) {
    document.getElementById('pn-hoja').hidden = !si; document.getElementById('pn-velo').hidden = !si;
    if (!si) { document.getElementById('pn-ordenar').focus(); return; }
    document.querySelectorAll('#pn-hoja .pn-op').forEach(b => { const on = b.dataset.modo === estado.modo; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
    document.querySelector('#pn-hoja .pn-op.on').focus();
  }
  function elegirModo(m) { estado.modo = CATALOGO.modoValido(m); guardarModo(estado.modo); abrirHoja(false); pintarRejilla(); }
  function elegirEtiqueta(x) { estado.etiqueta = x; pintarEtiquetas(); pintarRejilla(); }
  // tocar una tarjeta pequeña (fuera de JUGAR) abre la ficha del juego, como las de siempre
  function alTocarMini(e) {
    const m = e.target.closest('.pn-mini');
    if (m && !e.target.closest('a')) abrirFicha(m.dataset.tarjeta);
  }
  function alTeclaMini(e) {
    const m = e.target.closest('.pn-mini');
    if (m && e.target === m && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); abrirFicha(m.dataset.tarjeta); }
  }
  function escuchar() {
    document.getElementById('pn-busca').addEventListener('input', e => { estado.texto = e.target.value; pintarRejilla(); });
    document.getElementById('pn-ordenar').addEventListener('click', () => abrirHoja(true));
    document.getElementById('pn-velo').addEventListener('click', () => abrirHoja(false));
    document.getElementById('pn-hoja').addEventListener('click', e => { const b = e.target.closest('.pn-op'); if (b) elegirModo(b.dataset.modo); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !document.getElementById('pn-hoja').hidden) abrirHoja(false); });
    document.getElementById('pn-etiquetas').addEventListener('click', e => { const b = e.target.closest('.pn-etiqueta'); if (b) elegirEtiqueta(b.dataset.etiqueta); });
    for (const id of ['catalogo', 'pn-fila-novedades']) {
      document.getElementById(id).addEventListener('click', alTocarMini);
      document.getElementById(id).addEventListener('keydown', alTeclaMini);
    }
  }
  // la barra del buscador se pega justo debajo del menú de arriba (que en la portada va fijo y cambia de alto con el ancho)
  function medirMenu() {
    const menu = document.querySelector('nav.menu');
    document.documentElement.style.setProperty('--pn-menu-alto', (menu ? menu.offsetHeight : 0) + 'px');
  }

  function montar() {
    juegos = leerJuegos();
    document.getElementById('dest-puntos').insertAdjacentHTML('afterend', `<div class="pn pn-fila" id="pn-fila-novedades" hidden>
      <h3 class="grupo ol">${esc(t('NOVEDADES'))}</h3><div class="pn-carril" id="pn-novedades"></div></div>`);
    const archivo = document.getElementById('lista-archivo');
    if (archivo) archivo.insertAdjacentHTML('beforebegin', catalogoHtml()); else document.getElementById('biblioteca').insertAdjacentHTML('beforeend', catalogoHtml());
    document.body.insertAdjacentHTML('beforeend', hojaHtml());
    pintarEtiquetas(); pintar(); escuchar(); medirMenu();
    // si se llegó con #catalogo (Votar desde otra página) y el flag llegó tarde, el navegador no encontró el ancla: se baja aquí
    if (location.hash === '#catalogo') document.getElementById('catalogo').scrollIntoView();
    addEventListener('resize', medirMenu);
  }
  function aplicar() {
    if (montado || !ESTILO_NUEVO.activo()) return;
    montado = true; montar();
  }
  // las fechas (y las marcas NUEVO) llegan cuando tienda.js pinta el DESTACADO; los puntos, cuando contesta el servidor (votos.js)
  document.addEventListener('portada:destacado', e => { estado.fechas = (e.detail && e.detail.fechas) || {}; if (montado) pintar(); });
  AGRUPAR.alVotos(v => { estado.votos = v || {}; if (montado) pintarRejilla(); });
  // /gestion → Juegos cambió alguna tarjeta con la portada ya pintada (portada-juegos.js): se vuelven a leer
  document.addEventListener('portada:recolocada', () => { if (montado) { juegos = leerJuegos(); pintar(); } });
  aplicar();
  NUCLEO.alCambiarFlags(aplicar);
})();
