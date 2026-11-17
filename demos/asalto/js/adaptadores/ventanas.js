// Fans of Asalto · ADAPTADORES · Las ventanas de la partida, en pergamino (HTML sobre el lienzo): la ficha de un héroe (con el ascenso
// a una de sus dos clases), la de una clase, los premios (elegir reliquia, abrir el cofre, el botín del jefe), las misiones con lo siguiente por conseguir, el final de la partida,
// la pausa y el anuncio de prueba. Cada ventana llama a los casos de uso y se cierra; no decide reglas.
'use strict';
AS.ventanas = (() => {
  const D = AS.dibujos, fx = AS.fx;
  const modal = () => $('#as-modal'), tarjeta = () => $('#as-tarjeta');
  const ico = (nombre, clase) => `<img class="as-pix ${clase || 'as-ico'}" src="${D.rutaIcono(nombre)}" alt="">`;
  const iconoDe = (id, r) => r.icono || (r.clase ? 'clase-' + r.clase : 'gema');
  const btn = (id, txt, clase) => `<button class="as-btn ${clase || ''}" id="${id}" type="button">${txt}</button>`;

  function abre(html, clase) {
    tarjeta().className = 'as-perg ' + (clase || '');
    tarjeta().innerHTML = html;
    modal().hidden = false;
    return tarjeta();
  }
  function cierra() { modal().hidden = true; tarjeta().innerHTML = ''; }
  const abierta = () => !modal().hidden || !$('#as-anuncio').hidden;
  const alPulsar = (id, hace) => { const b = $('#' + id); if (b) b.onclick = () => { AS.suena('clic'); hace(); }; };

  /* ---------- el anuncio de prueba (en la app de Google Play será uno de verdad) ---------- */
  function anuncio(alAcabar) {
    const ov = $('#as-anuncio'), ok = $('#as-ad-ok'), barra = $('#as-ad-barra');
    let t = NUCLEO.desarrollo ? 1 : 5;
    ov.hidden = false;
    const tic = () => {
      if (t > 0) { ok.disabled = true; ok.textContent = tr('El premio llega en {t}…', { t }); barra.style.width = ((5 - t) / 5 * 100) + '%'; t--; ov._t = setTimeout(tic, 1000); return; }
      barra.style.width = '100%'; ok.disabled = false; ok.textContent = tr('RECOGER PREMIO'); AS.suena('premio', 1);
    };
    clearTimeout(ov._t); tic();
    ok.onclick = () => { if (t > 0) return; ov.hidden = true; alAcabar(); };
    $('#as-ad-no').onclick = () => { clearTimeout(ov._t); ov.hidden = true; AS.suena('clic'); toast(tr('Anuncio cerrado: sin premio')); };
  }

  /* ---------- la ficha de un héroe y su ascenso ---------- */
  function htmlHeroe(h, cifras) {
    const d = ASALTO.heroes[h.tipo], her = AS.heroe.herencias(ASALTO, h);
    const titulo = h.rama ? ' · ' + tr(ASALTO.ramas[h.rama].titulo) : '';
    const clases = d.clases.map(k => `<span class="as-chip" style="--c:${ASALTO.clases[k].col}">${ico('clase-' + k)}${tr(ASALTO.clases[k].nombre)}${h.rama === k ? ' x2' : ''}</span>`).join('');
    const herencias = Object.keys(her).map(k => `<li>${ico('clase-' + k)}${tr(ASALTO.herencias[k].txt, { v: ASALTO.herencias[k].v * her[k] })}</li>`).join('');
    return `<div class="as-ficha"><i class="as-retrato as-pix${h.dorado ? ' as-dorado' : ''}" style="${D.cssRetrato(h.tipo, 2)}"></i><div><h2>${d.nombre}${titulo}</h2><p class="as-nivel">${tr('Nivel {n}', { n: h.nivel })}${h.dorado ? ' · ' + tr('Animal Dorado') : ''}</p><p>${clases}</p></div></div>
      <p class="as-cifras">${ico('corazon')}${cifras.vida} &nbsp; ${ico('equipo-arma')}${Math.round(cifras.dano)} &nbsp; ${tr('cada {s} s', { s: cifras.cada.toFixed(2) })}</p>
      ${herencias ? `<h3>${tr('HERENCIAS')}</h3><ul class="as-lista">${herencias}</ul>` : `<p class="as-nota">${tr('Cada 2 héroes de una clase que absorba le dejan una herencia de esa clase.')}</p>`}`;
  }
  function heroe(E, sitio) {
    const p = E.casos.partida, h = AS.equipo.leer(p.equipo, sitio);
    if (!h) return;
    const cifras = AS.poder.deHeroe(ASALTO, h, { equipo: E.casos.statsEquipo(), reliquias: p.reliquias, nivel: p.sinergias.nivel });
    const puede = AS.heroe.puedeAscender(ASALTO, h) && p.fase === 'preparar';
    const ramas = puede ? `<h3>${tr('ASCIENDE: ELIGE UNA CLASE')}</h3>` + ASALTO.heroes[h.tipo].clases.map(k => `<button class="as-carta" data-rama="${k}" type="button" style="--c:${ASALTO.clases[k].col}">${ico('clase-' + k, 'as-ico2')}<b>${tr(ASALTO.ramas[k].titulo)}</b><span>${tr(ASALTO.ramas[k].txt)}</span></button>`).join('')
      : h.rama ? `<p class="as-nota">${tr(ASALTO.ramas[h.rama].txt)}</p>` : `<p class="as-nota">${tr('Al nivel {n} podrá ascender a una de sus dos clases.', { n: ASALTO.niveles.ascenso })}</p>`;
    const t = abre(htmlHeroe(h, cifras) + ramas + btn('as-cerrar', tr('CERRAR'), 'as-azul'));
    alPulsar('as-cerrar', cierra);
    for (const b of t.querySelectorAll('[data-rama]')) b.onclick = () => {
      const r = E.casos.asciende(sitio, b.dataset.rama);
      cierra();
      if (!r.ok) return;
      const s = AS.pantalla.puntoDe(sitio);
      fx.columna(s.x, s.y, [255, 230, 140], 320); fx.onda(s.x, s.y - 40, 90, '#ffd23a'); fx.brasas(s.x, s.y - 20, 24, '#ffd23a', 40); fx.fogonazo(0.35, '#ffe9a0'); fx.sacude(6);
      AS.pantalla.cartel(tr('¡ASCENSO!'), ASALTO.heroes[h.tipo].nombre + ' · ' + tr(ASALTO.ramas[b.dataset.rama].titulo), '#c8901c', 1.6);
      AS.suena('asciende');
    };
  }
  function clase(E, k) {
    const d = ASALTO.clases[k], s = E.casos.partida.sinergias, nivel = s.nivel[k];
    const filas = d.umbral.map((u, i) => `<li class="${nivel === i + 1 ? 'as-on' : ''}">${tr('{n} puntos', { n: u })}: ${tr(d.txt, { v: d.v[i] })}</li>`).join('');
    abre(`<h2 style="color:${d.col}">${ico('clase-' + k, 'as-ico2')} ${tr(d.nombre)}</h2><p class="as-nivel">${tr('Tienes {n} puntos', { n: s.puntos[k] || 0 })}</p><ul class="as-lista">${filas}</ul>
      <p class="as-nota">${tr('Cada héroe del campo da 1 punto a cada una de sus dos clases, y 2 a la que elige al ascender.')}</p>` + btn('as-cerrar', tr('CERRAR'), 'as-azul'));
    alPulsar('as-cerrar', cierra);
  }

  /* ---------- los premios de la oleada ---------- */
  function reliquia(E, sigue) {
    const p = E.casos.partida, ops = p.premio.opciones;
    const cartas = ops.map(id => { const r = ASALTO.reliquias[id]; return `<button class="as-carta" data-rel="${id}" type="button">${ico(iconoDe(id, r), 'as-ico2')}<b>${tr(r.nombre)}</b><span>${tr(r.txt)}</span></button>`; }).join('');
    const t = abre(`<h2>${tr('ELIGE UNA RELIQUIA')}</h2>${cartas}<div class="as-fila">${btn('as-rel-otras', tr('OTRAS 3 · ANUNCIO'), 'as-oro')}${btn('as-rel-todas', tr('LAS 3 · ANUNCIO'), 'as-oro')}</div>`);
    for (const b of t.querySelectorAll('[data-rel]')) b.onclick = () => { if (E.casos.eligeReliquia(b.dataset.rel).ok) { AS.suena('cofre'); sigue(); } };
    alPulsar('as-rel-otras', () => anuncio(() => { E.casos.refrescaReliquias(); reliquia(E, sigue); }));
    alPulsar('as-rel-todas', () => anuncio(() => { if (E.casos.todasLasReliquias().ok) { AS.suena('cofre'); sigue(); } }));
  }
  const htmlObjeto = o => `<li>${ico('equipo-' + o.hueco)}${tr(ASALTO.equipo.nombres[o.hueco])} · ${tr(ASALTO.equipo.rarezas[o.rareza].nombre)} · +${o.valor} % ${tr(ASALTO.equipo.stats[o.stat])}</li>`;
  function cobrado(v, sigue) {
    const objetos = v.objetos.length ? `<h3>${tr('EQUIPO NUEVO')}</h3><ul class="as-lista">${v.objetos.map(htmlObjeto).join('')}</ul>${v.fuera ? `<p class="as-nota">${tr('La mochila está llena: lo que no cabe se ha deshecho en plumas.')}</p>` : ''}` : '';
    abre(`<h2>${tr('¡BOTÍN!')}</h2><i class="as-cofre as-pix" style="${D.cssRetrato('cofre', 2, 2)}"></i><p class="as-botin">${ico('moneda', 'as-ico2')}+${v.oro} &nbsp; ${ico('pluma', 'as-ico2')}+${v.plumas}</p>${objetos}` + btn('as-seguir', tr('SEGUIR'), 'as-verde'));
    AS.suena('cofre');
    alPulsar('as-seguir', sigue);
  }
  function cofre(E, sigue) {
    const pr = E.casos.partida.premio, jefe = pr.tipo === 'jefe';
    const titulo = jefe ? tr('BOTÍN DEL JEFE') : tr('COFRE DE LA AUDITORÍA');
    abre(`<h2>${titulo}</h2><i class="as-cofre as-pix" style="${D.cssRetrato('cofre', 2)}"></i><p class="as-botin">${ico('moneda', 'as-ico2')}${pr.oro} &nbsp; ${ico('pluma', 'as-ico2')}${pr.plumas}${jefe ? ` &nbsp; ${ico('equipo-armadura', 'as-ico2')}x${pr.objetos}` : ''}</p>
      <div class="as-fila">${btn('as-abrir', tr('ABRIR'), 'as-verde')}${jefe ? '' : btn('as-doble', tr('EL DOBLE · ANUNCIO'), 'as-oro')}</div>`);
    const cobra = doble => { const r = E.casos.cobraCofre(doble); if (r.ok) cobrado(r.valor, sigue); else sigue(); };
    alPulsar('as-abrir', () => cobra(false));
    alPulsar('as-doble', () => anuncio(() => cobra(true)));
  }
  // enseña uno a uno los premios que queden y, al acabar, llama a alAcabar
  function premios(E, alAcabar) {
    const pr = E.casos.partida && E.casos.partida.premio;
    if (!pr) { cierra(); if (alAcabar) alAcabar(); return; }
    const sigue = () => premios(E, alAcabar);
    if (pr.tipo === 'reliquia') reliquia(E, sigue); else cofre(E, sigue);
  }

  /* ---------- las metas a la vista: las misiones de la partida y lo siguiente de fuera ---------- */
  const barra = (va, meta) => `<div class="as-barra"><i style="width:${Math.min(100, Math.round(va / meta * 100))}%"></i></div>`;
  // la mejora más cercana y el logro al que menos le falta, cada uno con su barra
  function htmlMetas(E) {
    const m = E.casos.metas(), M = m.mejora, G = m.logro;
    const mejora = M ? `<li class="as-item">${ico(ASALTO.mejoras[M.id].icono, 'as-ico2')}<div><b>${tr('Mejora')}: ${tr(M.nombre)}</b><span>${M.plumas >= M.coste ? tr('¡Ya te llegan las plumas!') : tr('Te faltan {n} plumas', { n: M.coste - M.plumas })}</span>${barra(M.plumas, M.coste)}</div></li>` : '';
    const logro = G ? `<li class="as-item">${ico('trofeo', 'as-ico2')}<div><b>${tr('Logro')}: ${tr(G.txt)}</b><span>${G.va}/${G.meta} · ${ico('pluma')}+${G.premio}</span>${barra(G.va, G.meta)}</div></li>` : '';
    return mejora || logro ? `<h3>${tr('LO SIGUIENTE')}</h3><ul class="as-lista as-metas">${mejora}${logro}</ul>` : '';
  }
  function htmlMision(m) {
    const d = ASALTO.misiones.lista[m.id];
    const pie = m.acabada ? `<span>${tr('Hecha del todo')}</span>` : `<span>${m.va}/${m.meta} · ${ico('moneda')}+${m.oro} ${ico('pluma')}+${m.plumas}</span>${barra(m.va, m.meta)}`;
    return `<li class="as-item">${ico(d.icono, 'as-ico2')}<div><b>${tr(d.txt, { n: m.meta })}</b>${pie}</div></li>`;
  }
  function misiones(E) {
    const p = E.casos.partida;
    abre(`<h2>${tr('MISIONES')}</h2><p class="as-nota">${tr('Se cobran solas al cumplirlas. Cada una tiene tres escalones, con más premio.')}</p><ul class="as-lista as-metas">${p.misiones.map(htmlMision).join('')}</ul>
      <p class="as-nota">${tr('Racha: cada invocación seguida con línea da oro extra.')} ${p.racha >= 2 ? tr('Llevas {n}.', { n: p.racha }) : ''}</p>${htmlMetas(E)}` + btn('as-cerrar', tr('CERRAR'), 'as-azul'));
    alPulsar('as-cerrar', cierra);
  }

  /* ---------- el final de la partida y la pausa ---------- */
  function fin(E) {
    const p = E.casos.partida, c = p.cuenta, gano = p.final === 'victoria', zona = ASALTO.zonas[p.zona], hay = ASALTO.zonas[p.zona + 1];
    const fila = (txt, v) => `<li><span>${txt}</span><b>${v}</b></li>`, M = E.casos.metas().mejora, llega = M && M.plumas >= M.coste, pend = E.casos.logrosPendientes().length;
    abre(`<h2 class="${gano ? 'as-gana' : 'as-pierde'}">${gano ? tr('¡ZONA CONQUISTADA!') : tr('DERROTA')}</h2><p class="as-nivel">${tr(zona.nombre)}${p.sinFin ? ' · ' + tr('SIN FIN') : ''}</p>
      <ul class="as-lista as-resumen">${fila(tr('Oleadas superadas'), c.oleadasGanadas)}${fila(tr('Enemigos derrotados'), c.bajas)}${fila(tr('Líneas en el Altar'), c.lineas)}${fila(tr('Nivel más alto'), c.nivelMax)}${fila(tr('Plumas ganadas'), '+' + p.plumas)}</ul>
      ${htmlMetas(E)}${llega ? btn('as-mejorar', tr('MEJORAR AHORA'), 'as-oro') : ''}${pend ? `<p class="as-nota">${tr('Tienes {n} logros por cobrar en el menú.', { n: pend })}</p>` : ''}
      <div class="as-fila">${btn('as-otra', gano && hay ? tr('SIGUIENTE ZONA') : tr('OTRA VEZ'), 'as-rojo')}${btn('as-menu-ir', tr('MENÚ'), 'as-azul')}</div>`, gano ? 'as-victoria' : '');
    alPulsar('as-mejorar', () => { cierra(); AS.menu.abre('mejoras'); });
    alPulsar('as-otra', () => { cierra(); AS.menu.entra(gano && hay && !p.sinFin ? p.zona + 1 : p.zona, p.sinFin); });
    alPulsar('as-menu-ir', () => { cierra(); AS.menu.abre(); });
  }
  function ajustes(caja, E, alCerrar) {
    const C = E.casos, o = OPCIONES.lista({
      filas: [OPCIONES.sonido({ efectos: [() => C.progreso.vol, v => { C.sonido(v, C.progreso.mus); applyVolume(); }], musica: [() => C.progreso.mus, v => { C.sonido(C.progreso.vol, v); applyVolume(); }] }), 'idioma', 'cuenta'],
      versionTexto: 'Fans of Asalto · v' + NUCLEO.version, alCerrar,
    });
    caja.append(o.lista);
    if (o.version) caja.append(o.version);
    if (o.cerrar) caja.append(o.cerrar);
  }
  // cómo se juega, en cuatro líneas: sale sola la primera vez y se puede volver a ver desde la pausa
  const AYUDA = [['altar', 'INVOCA', 'Tres runas iguales en línea (fila, columna o diagonal) traen a un héroe de esa clase.'],
    ['gema', 'EMPUJA', 'Una vez por oleada, toca una runa de las que asoman: mueve su columna para completar una línea.'],
    ['yunque', 'ABSORBE', 'Arrastra un héroe sobre otro: el que queda suma los niveles de los dos. Al nivel 5 asciende.'],
    ['corazon', 'DEFIENDE', 'Pulsa ¡A LUCHAR! y que no crucen la empalizada: cada enemigo que pasa te quita una vida.']];
  function ayuda(E, alCerrar) {
    const filas = AYUDA.map(([icono, titulo, txt]) => `<li class="as-item">${ico(icono, 'as-ico2')}<div><b>${tr(titulo)}</b><span>${tr(txt)}</span></div></li>`).join('');
    abre(`<h2>${tr('CÓMO SE JUEGA')}</h2><ul class="as-lista as-ayuda">${filas}</ul>` + btn('as-entendido', tr('ENTENDIDO'), 'as-verde') + btn('as-otra-guia', tr('VER LA GUÍA OTRA VEZ'), 'as-naranja as-chico'));
    alPulsar('as-entendido', () => { cierra(); if (alCerrar) alCerrar(); });
    alPulsar('as-otra-guia', () => { E.casos.repiteGuia(); toast(tr('Tu próxima partida nueva en la primera zona será guiada')); });
  }
  function pausa(E) {
    const t = abre(`<h2>${tr('PAUSA')}</h2><div class="as-fila">${btn('as-sigue', tr('SEGUIR'), 'as-verde')}${btn('as-salir', tr('SALIR AL MENÚ'), 'as-azul')}</div>${btn('as-como', tr('CÓMO SE JUEGA'), 'as-naranja as-chico')}<p class="as-nota">${tr('La partida se guarda al empezar cada oleada: puedes salir y seguir luego.')}</p>
      <div id="as-opc"></div>${btn('as-dejar', tr('ABANDONAR LA PARTIDA'), 'as-rojo as-chico')}`);
    ajustes(t.querySelector('#as-opc'), E);
    alPulsar('as-como', () => ayuda(E, () => pausa(E)));
    alPulsar('as-sigue', cierra);
    alPulsar('as-salir', () => { cierra(); AS.menu.abre(); });
    alPulsar('as-dejar', () => confirmBox(tr('¿ABANDONAR?'), tr('Perderás la partida de ahora.'), tr('SÍ, SALIR'), () => { E.casos.abandona(); cierra(); AS.menu.abre(); }));
  }
  return { abre, cierra, abierta, anuncio, heroe, clase, premios, misiones, fin, pausa, ayuda, ajustes, ico, btn, alPulsar };
})();
