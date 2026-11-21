// Fans Of · MI CUENTA de la web · las pestañas PERFIL y MIS JUEGOS (pantalla, tarea #299). Las abre biblioteca/cuenta-web.js con su ctx
// ({ casos, juegos, aviso, boton, alCambiarPerfil, … }); la pestaña AJUSTES va en cuenta-ajustes.js.
//   · PERFIL: TU CARA (rejilla de caras de biblioteca/caras/, con una pestaña pequeña por juego; la elegida con borde dorado), TU NOMBRE y
//     TU JUEGO FAVORITO (uno de la biblioteca, con su botón grande JUGAR A …).
//   · MIS JUEGOS: tus guardados y tus votos de hoy como enlaces (los da biblioteca/votos.js, VOTOS_WEB) y el caos primordial ilimitado.
// Usa t(), esc(), CUENTA, CARAS_CUENTA, CUENTA_PERFIL y avisar().
'use strict';
const CUENTA_PESTANAS = (() => {
  const sub = texto => `<h4 class="cuenta-sub ol">${esc(t(texto))}</h4>`;
  const mal = (ctx, r) => window.avisar(ctx.aviso(r));

  // ---------- TU CARA ----------
  function caraBoton(id, elegida) {
    const nombre = CUENTA_PERFIL.nombrePersonaje(id, CARAS_CUENTA);
    return `<button type="button" class="cu-cara-op${id === elegida ? ' on' : ''}" data-cara="${esc(id)}" role="radio" aria-checked="${id === elegida}" aria-label="${esc(nombre)}">`
      + `<img src="${esc(CARAS_CUENTA.ruta(id))}" alt="" loading="lazy" width="56" height="56"></button>`;
  }
  function pintarCaras(caja, ctx, grupo) {
    const elegida = ctx.casos.perfil().cara, g = CARAS_CUENTA.grupos.find(x => x.grupo === grupo) || CARAS_CUENTA.grupos[0];
    caja.querySelectorAll('.cu-grupo').forEach(b => { const on = b.dataset.grupo === g.grupo; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
    caja.querySelector('.cu-caras').innerHTML = g.ids.map(id => caraBoton(id, elegida)).join('');
  }
  async function elegirCara(caja, ctx, boton) {
    const rejilla = caja.querySelector('.cu-caras'); rejilla.setAttribute('aria-busy', 'true');
    const r = await ctx.casos.elegirCara(boton.dataset.cara);
    rejilla.removeAttribute('aria-busy');
    if (!r.ok) { mal(ctx, r); if (r.motivo === 'sin_perfil') caja.querySelector('#cuenta-nombre-web').focus(); return; }
    pintarCaras(caja, ctx, caja.querySelector('.cu-grupo.on').dataset.grupo); ctx.alCambiarPerfil();
  }
  function seccionCara(caja, ctx) {
    const grupo = CUENTA_PERFIL.grupoInicial(ctx.casos.perfil().cara, CARAS_CUENTA);
    caja.insertAdjacentHTML('beforeend', sub('TU CARA')
      + `<div class="cu-grupos" role="tablist">${CARAS_CUENTA.grupos.map(g => `<button type="button" role="tab" class="cu-grupo" data-grupo="${esc(g.grupo)}">${esc(g.nombre)}</button>`).join('')}</div>`
      + `<div class="cu-caras" role="radiogroup" aria-label="${esc(t('TU CARA'))}"></div>`);
    pintarCaras(caja, ctx, grupo);
    caja.querySelector('.cu-grupos').onclick = e => { const b = e.target.closest('.cu-grupo'); if (b) pintarCaras(caja, ctx, b.dataset.grupo); };
    caja.querySelector('.cu-caras').onclick = e => { const b = e.target.closest('.cu-cara-op'); if (b) elegirCara(caja, ctx, b); };
  }

  // ---------- TU NOMBRE (el mismo en todos los juegos, servidor/36-perfil.sql) ----------
  function seccionNombre(caja, ctx) {
    caja.insertAdjacentHTML('beforeend', sub('TU NOMBRE') + `<p>${esc(t('Es el que ven los demás en las clasificaciones y las partidas. Se cambia en todos tus juegos.'))}</p>`
      + `<input id="cuenta-nombre-web" type="text" maxlength="14" autocomplete="nickname" placeholder="${esc(t('Tu nombre'))}" aria-label="${esc(t('Tu nombre'))}" value="${esc(ctx.casos.perfil().nombre)}">`);
    const fila = document.createElement('div'); fila.className = 'cuenta-botones';
    fila.append(ctx.boton(t('CAMBIAR NOMBRE'), 'boton ol', async () => {
      const r = await ctx.casos.cambiarNombre(caja.querySelector('#cuenta-nombre-web').value);
      if (!r.ok) { mal(ctx, r); return; }
      window.avisar(t('Ahora te llamas {n}', { n: r.perfil.nombre }), true); ctx.alCambiarPerfil();
    }));
    caja.append(fila);
  }

  // ---------- TU JUEGO FAVORITO ----------
  function pintarJugar(caja, ctx) {
    const j = CUENTA_PERFIL.juegoElegido(ctx.casos.perfil(), ctx.juegos()), a = caja.querySelector('.cu-jugar');
    a.hidden = !j;
    if (j) { a.href = j.jugar; a.textContent = t('JUGAR A {j}', { j: j.nombre }); }
  }
  function seccionJuego(caja, ctx) {
    const elegido = ctx.casos.perfil().juego;
    caja.insertAdjacentHTML('beforeend', sub('TU JUEGO FAVORITO') + `<p>${esc(t('El que más juegas: te lo dejamos a mano aquí y en la portada.'))}</p>`
      + `<select id="cu-juego" aria-label="${esc(t('TU JUEGO FAVORITO'))}"><option value="">${esc(t('Elige uno'))}</option>`
      + ctx.juegos().map(j => `<option value="${esc(j.id)}"${j.id === elegido ? ' selected' : ''}>${esc(j.nombre)}</option>`).join('') + '</select>'
      + '<a class="boton ol cu-jugar" hidden></a>');
    pintarJugar(caja, ctx);
    const sel = caja.querySelector('#cu-juego');
    sel.onchange = async () => {
      if (!sel.value) { sel.value = ctx.casos.perfil().juego; return; }   // «Elige uno» no quita el favorito
      const r = await ctx.casos.elegirJuego(sel.value, ctx.juegos());
      if (!r.ok) { sel.value = ctx.casos.perfil().juego; mal(ctx, r); return; }
      pintarJugar(caja, ctx); ctx.alCambiarPerfil();
    };
  }
  function perfil(caja, ctx) { seccionCara(caja, ctx); seccionNombre(caja, ctx); seccionJuego(caja, ctx); }

  // ---------- MIS JUEGOS ----------
  const enlace = (j, extra = '') => `<li><a href="${esc(j.jugar)}">${esc(j.nombre)}</a>${extra}</li>`;
  function lista(guardados, votos) {
    const voto = v => `<span class="cu-voto${v.voto > 0 ? ' si' : ''}">${esc(t(v.voto > 0 ? 'Lo recomiendas' : 'No lo recomiendas'))}</span>`;
    return sub('GUARDADOS') + (guardados.length ? `<ul class="cu-lista">${guardados.map(j => enlace(j)).join('')}</ul>`
      : `<p class="cu-vacio">${esc(t('Aún no has guardado ningún juego: toca el marcapáginas de su tarjeta.'))}</p>`)
      + sub('TUS VOTOS DE HOY') + (votos.length ? `<ul class="cu-lista">${votos.map(v => enlace(v, voto(v))).join('')}</ul>`
      : `<p class="cu-vacio">${esc(t('Hoy aún no has votado. Vota en la ficha de cada juego: un voto al día.'))}</p>`);
  }
  // el caos primordial ilimitado: es de la cuenta y vale en todos los juegos (la función pide un juego, pero el pase no depende de él)
  function pase(caja) {
    const p = document.createElement('p'); p.className = 'cuenta-pase'; caja.append(p);
    CUENTA.rpc('pvp_energia', { p_juego: 'rumble' }).then(e => {
      if (!e || !p.isConnected) return;
      const vivo = e.pase_hasta && new Date(e.pase_hasta) > new Date();
      if (!vivo && !e.activa) return;
      const f = vivo ? new Date(e.pase_hasta).toLocaleDateString(IDIOMA.actual === 'en' ? 'en-GB' : 'es-ES') : '';
      p.innerHTML = '<b>' + esc(t('CAOS PRIMORDIAL ILIMITADO')) + '</b>: ' + esc(vivo ? t('activo hasta el {f}. Vale en todos los juegos.', { f }) : t('sin activar. Se usa la energía de cada juego.'));
    }).catch(() => { /* sin red o sin la función: no se enseña nada */ });
  }
  function juegos(caja, ctx) {
    const datos = typeof VOTOS_WEB === 'undefined' ? {} : { guardados: VOTOS_WEB.guardados(), votos: VOTOS_WEB.votosDeHoy() };
    const mios = CUENTA_PERFIL.misJuegos(datos, ctx.juegos());
    caja.insertAdjacentHTML('beforeend', lista(mios.guardados, mios.votos));
    pase(caja);
  }
  return Object.freeze({ perfil, juegos });
})();
