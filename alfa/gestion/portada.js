// Fans Of · /gestion → Juegos → pestaña «PORTADA» de cada juego (tarea #327, ADR 203): sección, «En la portada» y «En el anuncio» en la alfa, alfa y web
// lado a lado, «Pasar a la web» (con un paso de confirmar en la página) y «Deshacer». Pantalla fina: lo que decide está en portada-juegos.js
// (GESTION_PORTADA). Lo del repo sale de ../biblioteca/juegos.json y las filas, de gestion_juego_portada (servidor/188-juego-portada.sql).
// También da a la lista de juegos sus marcas («alfa cambiada», «pasar a la web») y la sección de cada uno en la alfa con GESTION_NAV.marcador.
// Usa lo de gestion/index.html: rpc(), leerToken(), esc(), textoError() y $().
'use strict';
(() => {
  let repo = null, filas = [], id = null, nombre = '', confirmando = false;

  async function cargaRepo() {
    if (!repo) { const r = await fetch('../biblioteca/juegos.json', { cache: 'no-store' }); repo = GESTION_PORTADA.repoDe(await r.json()); }
    return repo;
  }
  const cargaFilas = async () => { filas = (await rpc('gestion_juego_portada', { p_token: leerToken() })).filas || []; };
  const estado = () => GESTION_PORTADA.estado(repo, filas, id);
  const aviso = t => { const a = $('pan-portada').querySelector('[data-aviso-portada]'); if (a) a.textContent = t; };
  function pinta() { $('pan-portada').innerHTML = GESTION_PORTADA.html(estado(), nombre, { confirmando }, esc); }

  async function cargar(juego, nombreJuego) {
    id = juego; nombre = nombreJuego; confirmando = false;
    $('pan-portada').innerHTML = '<div class="caja ayuda">Cargando…</div>';
    try { await cargaRepo(); await cargaFilas(); }
    catch (e) { $('pan-portada').innerHTML = `<div class="caja aviso">${esc(textoError(e))}</div>`; return; }
    if (id === juego) pinta();
  }
  // Una llamada que cambia algo; después se vuelven a pedir las filas y se repinta. Mientras, los botones quedan quietos
  async function cambia(nombreRpc, cuerpo) {
    $('pan-portada').querySelectorAll('button').forEach(b => { b.disabled = true; });
    try { await rpc(nombreRpc, { p_token: leerToken(), p_juego: id, ...cuerpo }); await cargaFilas(); confirmando = false; pinta(); }
    catch (e) { pinta(); aviso(textoError(e)); }
  }
  const poner = fila => cambia('gestion_juego_portada_poner', { p_seccion: fila.seccion, p_en_portada: fila.en_portada, p_en_anuncio: fila.en_anuncio });
  function alTocar(ev) {
    const b = ev.target.closest('button'); const e = estado();
    if (!b || b.disabled || !e) return;
    const d = b.dataset;
    if (d.seccion) poner(GESTION_PORTADA.filaConCambio(e, 'seccion', d.seccion));
    else if (d.interruptor) poner(GESTION_PORTADA.filaConCambio(e, d.interruptor, b.getAttribute('aria-checked') !== 'true'));
    else if ('pasar' in d) { confirmando = true; pinta(); }
    else if ('cancelar' in d) { confirmando = false; pinta(); }
    else if ('confirmar' in d) cambia('gestion_juego_portada_a_web', {});
    else if ('deshacer' in d) cambia('gestion_juego_portada_deshacer', {});
  }
  // Las marcas de la lista de juegos y su sección en la alfa; si falla el repo o el servidor, lanza y la lista lo avisa (nav.js)
  async function marcas() {
    await cargaRepo(); await cargaFilas();
    return { marcas: GESTION_PORTADA.marcas(repo, filas), secciones: GESTION_PORTADA.secciones(repo, filas) };
  }

  $('pan-portada').onclick = alTocar;
  $('estilo-portada').textContent = GESTION_PORTADA.ESTILO;
  GESTION_NAV.seccion({ id: 'portada', pan: 'pan-portada', juego: '*', etiqueta: 'Portada', orden: 0.5, cargar });
  GESTION_NAV.marcador(marcas);
})();
