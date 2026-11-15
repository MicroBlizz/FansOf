// Fans Of Paperwork · adaptador · PANELES DE «ESTE TURNO»: el HTML de lo que se pierde con el Despido. La barra de arriba (oro, nivel, planta),
// los botones de acción (castor, Trituradora, urgentes, sindicato, cofres), las pestañas de los dos niveles del menú y los paneles del
// turno: útiles, documentos, Trituradora y cofres. Lo que se queda para siempre («Tu carrera») está en paneles-carrera.js. Solo pinta: cada
// botón lleva data-acc (y data-arg) y lo que hace está en botones.js.
'use strict';
PW.paneles = (() => {
  const n = v => PW.txt.num(v), t = s => PW.txt.tiempo(s), pct = p => PW.txt.pct(p), x = v => 'x' + fmtV(Math.round(v * 100) / 100);
  const boton = (acc, arg, txt, activo = true, clase = '') => `<button class="pw-btn ol ${clase}" data-acc="${acc}" data-arg="${arg}"${activo ? '' : ' disabled'}>${txt}</button>`;
  const fila = (icono, titulo, detalle, derecha) => `<div class="pw-fila">${icono}<p><b>${titulo}</b><small>${detalle}</small></p>${derecha}</div>`;
  const icono = (src, color) => `<span class="pw-ico" style="--c:${color || '#555'}">${src ? `<img src="${src}" alt="" onerror="this.remove()">` : ''}</span>`;
  // los dos niveles del menú y sus pestañas (las de la Trituradora y los cofres se abren desde los botones de acción)
  const TURNO = [['utiles', 'Útiles'], ['documentos', 'Documentos']];
  const CARRERA = [['despido', 'Despido'], ['recuerdos', 'Recuerdos'], ['plan', 'Plan'], ['equipo', 'Equipo'], ['retos', 'Retos'], ['opciones', '···']];
  const enCarrera = pestana => CARRERA.some(([id]) => id === pestana);

  function hud(e) {
    const r = e.r, xp = PW.curvas.xpParaSubir(r.nivel), tope = PW.curvas.topeNivel(e.c.trituradora.nivel);
    const parte = r.nivel >= tope ? 1 : r.xp / xp;
    return `<span class="pw-oro ol">${n(r.oro)}</span>`
      + `<span class="pw-nivel"><b class="ol">${tr('Nv. {n}', { n: r.nivel })}</b><i style="width:${Math.round(parte * 100)}%"></i>${r.nivel >= tope ? `<small>${tr('tope')}</small>` : ''}</span>`
      + `<span class="pw-planta ol">${tr('Planta −{n}', { n: r.planta.n })}<small>${tr(PW.ZONAS[PW.curvas.zonaDe(r.planta.n)].nombre)}</small></span>`
      + `<span class="pw-indem ol" title="${tr('Indemnización')}">${n(e.c.indemnizacion)}</span>`;
  }
  // los botones grandes de acción, con su carga o su cuenta (la carga va de 5 en 5 %: así el botón no se rehace a cada instante)
  const carga = v => Math.floor(Math.max(0, Math.min(1, v)) * 20) / 20;
  const accion = (acc, arg, listo, p, img, txt) => `<button class="pw-acc ol${listo ? ' listo' : ''}" data-acc="${acc}" data-arg="${arg}" style="--p:${p}"><img src="img/${img}.png" alt="" onerror="this.remove()">${txt}</button>`;
  function acciones(e, B) {
    const T = e.c.trituradora, sind = e.c.sindicato, urg = e.r.urgentes, cofres = PW.extras.cofres(e);
    const trit = PW.trituradora.acabada(e) ? tr('Atascada') : PW.trituradora.atascando(e) ? tr('¡Dale!') : T.espera > 0 ? t(T.espera) : tr('¡Atascar!');
    const plazo = urg.length ? Math.min(...urg.map(u => u.falta)) : 0;
    return accion('estanteria', '', e.r.estanteria >= B.recargaEstanteria, carga(e.r.estanteria / B.recargaEstanteria), 'icono-castor', tr('Castor'))
      + accion('pestana', 'trituradora', PW.trituradora.lista(e), 0, 'trituradora', trit)
      + accion('urgente', '', urg.length > 0, carga(plazo / PW.AJ.sellos.urgenteDura), 'icono-sello', urg.length ? `${tr('Urgente')} ${t(plazo)}` : tr('Urgente'))
      + accion('sindicato', '', sind.guardados > 0, carga(1 - sind.falta / PW.AJ.sindicato.cada), 'icono-sindicato', `${tr('Sindicato')} ${sind.guardados ? '×' + sind.guardados : ''}`)
      + accion('pestana', 'cofres', cofres > 0, carga(e.r.medidor / PW.AJ.cofre.medidor), 'icono-cofre', `${tr('Cofres')} ${cofres ? '×' + cofres : ''}`);
  }
  const pestanaDe = (id, txt, activa, globo, clase = '') => `<button class="ol ${clase}${activa === id ? ' activo' : ''}" data-acc="pestana" data-arg="${id}" data-globo="${globo || ''}">${txt}</button>`;
  // la barra de pestañas del nivel en el que se está: las del turno y el salto a la carrera, o las de la carrera y la vuelta al turno
  function pestanas(e, B, activa) {
    const av = avisos(e, B);
    if (!enCarrera(activa)) {
      return TURNO.map(([id, txt]) => pestanaDe(id, tr(txt), activa, av[id])).join('')
        + pestanaDe('despido', tr('Tu carrera'), '', av.despido + av.recuerdos + av.plan + av.retos, 'pw-salto');
    }
    return `<div class="pw-cabecera"><button class="ol pw-vuelta" data-acc="pestana" data-arg="utiles">${tr('Este turno')}</button><b class="ol">${tr('TU CARRERA')}</b>`
      + `<small>${tr('Lo que se queda cuando te despiden')}</small></div><div class="pw-fila-pestanas">`
      + CARRERA.map(([id, txt]) => pestanaDe(id, id === 'opciones' ? txt : tr(txt), activa, av[id])).join('') + '</div>';
  }

  // los útiles del líder: su icono y lo que hacen ahora
  const UTIL = {
    gafas: ['zanahoria', B => tr('{n} hojas por vistazo', { n: n(B.dano) })],
    cafe: ['cafe', B => tr('{n} vistazos por segundo', { n: fmtV(Math.round(B.vistazosSeg * 100) / 100) })],
    guantes: ['guantes', B => tr('Quitan un {p} de la dureza del papel y de las tragaderas de la Trituradora', { p: pct(1 - B.guantes) })],
    carrito: ['carrito', B => tr('{p} de llevarte también lo del archivador de al lado', { p: pct(B.carrito) })],
  };
  const zonasVistas = e => PW.ZONAS.map((z, i) => i).filter(z => PW.compras.vistaZona(e, z));
  // cuántas compras se pueden pagar ahora en cada pestaña (el globo que avisa de que hay algo que comprar)
  function avisos(e, B) {
    const utiles = PW.UTILES.filter(u => e.r.utiles[u.id] < PW.AJ.utiles[u.id].max && e.r.oro >= PW.compras.precioUtil(e, u.id)).length
      + zonasVistas(e).filter(z => e.r.herramientas[z] < PW.AJ.herramienta.max && e.r.oro >= PW.compras.precioHerramienta(e, z)).length;
    const documentos = PW.DOCUMENTOS.filter((m, i) => PW.compras.vistoDocumento(e, i) && e.r.mejorasDoc[i] < B.topeDocumento && e.r.expedientes[i] >= PW.compras.precioDocumento(e, i)).length;
    return { utiles, documentos, ...PW.panelesCarrera.avisos(e), retos: PW.retos.listos() };
  }
  // lo que el papel de esta planta le quita al líder: para que se vea cuándo tocan guantes
  function notaDureza(e, B) {
    const [, b] = PW.curvas.documentosDe(e.r.planta.n), du = PW.bonos.dureza(B, b, e.r.planta.n);
    if (du <= 0) return '';
    const lee = PW.curvas.trasDureza(B.dano, du), poco = lee < B.dano * 0.5;
    return `<p class="pw-nota${poco ? ' pw-aviso' : ''}">${tr('El papel de esta planta resta {d} a cada vistazo: lees {n}.', { d: n(du), n: n(lee) })}${poco ? ' ' + tr('Tocan guantes.') : ''}</p>`;
  }
  function utiles(e, B) {
    const filas = PW.UTILES.map(u => {
      const nivel = e.r.utiles[u.id], max = PW.AJ.utiles[u.id].max, precio = PW.compras.precioUtil(e, u.id);
      const der = nivel >= max ? `<em>${tr('Máximo')}</em>` : boton('util', u.id, `${n(precio)}<i class="pw-oro-i"></i>`, e.r.oro >= precio);
      return fila(icono(`img/icono-${UTIL[u.id][0]}.png`, '#ff9a3c'), `${tr(u.nombre)} · ${tr('nivel {n}', { n: nivel })}`, UTIL[u.id][1](B), der);
    }).join('');
    const herramientas = zonasVistas(e).map(z => {
      const H = PW.ZONAS[z].herramienta, nivel = e.r.herramientas[z], precio = PW.compras.precioHerramienta(e, z);
      const der = nivel >= PW.AJ.herramienta.max ? `<em>${tr('Máximo')}</em>` : boton('herramienta', z, `${n(precio)}<i class="pw-oro-i"></i>`, e.r.oro >= precio);
      const det = tr('Quita un {p} de dureza al papel {papel} de {zona}', { p: pct(1 - B.herramientas[z]), papel: tr(PW.ZONAS[z].papel), zona: tr(PW.ZONAS[z].nombre) });
      return fila(icono(`img/icono-${H.id}.png`, '#9aa7b8'), `${tr(H.nombre)} · ${tr('nivel {n}', { n: nivel })}`, det, der);
    }).join('');
    const venta = [0, 0.25, 0.5, 0.75, 1].map(p => boton('venta', p, pct(p), true, e.r.venta === p ? 'activo' : '')).join('');
    return notaDureza(e, B) + filas + herramientas + `<div class="pw-venta"><b>${tr('Expedientes que se venden solos a la prensa')}</b><div>${venta}</div></div>`;
  }
  // los montones urgentes (con lo que pagan si se entregan ya) y los caducados guardados
  function montones(e, B) {
    const urg = e.r.urgentes, paga = urg.reduce((s, u) => s + PW.sellos.pagaUrgente(B, u), 0);
    const urgente = urg.length ? `<div class="pw-texto pw-urgente"><p>${tr('Tienes {n} montones urgentes. Entrégalos antes de {t} y pagan el triple.', { n: urg.length, t: t(Math.min(...urg.map(u => u.falta))) })}</p>`
      + `${boton('urgente', '', `${tr('ENTREGAR')} · ${n(paga)}<i class="pw-oro-i"></i>`, true, 'grande listo')}</div>` : '';
    return urgente + `<p class="pw-nota">${tr('Caducados guardados: {n}. No se venden: son para la Trituradora.', { n: n(e.r.caducados) })}</p>`;
  }
  function documentos(e, B) {
    const vistos = PW.DOCUMENTOS.map((m, i) => i).filter(i => PW.compras.vistoDocumento(e, i));
    return montones(e, B) + vistos.map(i => {
      const D = PW.DOCUMENTOS[i], nivel = e.r.mejorasDoc[i], precio = PW.compras.precioDocumento(e, i), rango = PW.curvas.rangoEspecialidad(e.c.especialidad[i] || 0);
      const der = nivel >= B.topeDocumento ? `<em>${tr('Máximo')}</em>` : boton('documento', i, `${n(precio)} ${tr('exp.')}`, e.r.expedientes[i] >= precio);
      const du = PW.bonos.dureza(B, i, e.r.planta.n);
      const det = `${tr(D.txt)} · ${tr('especialidad {r}/3', { r: rango })}${du > 0 ? ' · ' + tr('dureza {d}', { d: n(du) }) : ''}<br>${tr('tienes {n} expedientes', { n: n(e.r.expedientes[i]) })}`;
      return fila(icono(`img/archivador-${D.id}.png`, D.color), `${tr(D.nombre)} · ${tr('nivel {n}', { n: nivel })}`, det, der);
    }).join('');
  }
  // qué se le echa a la Trituradora: los caducados y los expedientes de cada documento que se tenga
  function municion(e) {
    const M = e.c.municion, A = PW.AJ.trituradora;
    const docs = PW.DOCUMENTOS.map((d, i) => i).filter(i => e.r.expedientes[i] >= 1 || (M.docs[i] && PW.compras.vistoDocumento(e, i)));
    const botones = boton('municion', 'caducados', `${tr('Caducados')} (${n(e.r.caducados)}) ${x(A.caducado)}`, true, M.caducados ? 'activo' : '')
      + docs.map(i => boton('municion', i, `${tr(PW.DOCUMENTOS[i].nombre)} (${n(e.r.expedientes[i])}) ${x(PW.trituradora.multiDoc(i))}`, true, M.docs[i] ? 'activo' : '')).join('');
    return `<div class="pw-venta pw-municion"><b>${tr('Qué le echas (lo marcado se gasta en el intento, lo mejor primero)')}</b><div>${botones}</div></div>`;
  }
  function trituradora(e, B) {
    const T = e.c.trituradora, acabada = PW.trituradora.acabada(e), A = PW.AJ.trituradora;
    const cabe = acabada ? 1 : PW.trituradora.capacidad(e), pre = PW.trituradora.prevision(e, B);
    const estado = acabada ? tr('¡Atascada del todo! Ya no tritura nada más.')
      : tr('Nivel {n} de {t}. Lleva {d} de {v} atascado; se traga {a} de cada vistazo sin enterarse.', { n: T.nivel + 1, t: A.niveles, d: n(T.atasco), v: n(cabe), a: n(PW.trituradora.tragaderas(e, B)) });
    const prevision = acabada ? '' : `<p>${tr('Con lo que le vas a echar, tu equipo la atascaría unos {d} en un intento de {s} s (el bocado medio vale {m}).', { d: n(pre.atasco), s: A.intento, m: x(pre.multi) })}`
      + `${PW.trituradora.atascoSeg(e, B) <= 0 ? ' ' + tr('Ahora se lo traga todo: mejora las gafas o los guantes.') : ''}</p>`
      + `<p><small>${tr('Se come {b} documentos por intento. Sin munición casi no se atasca ({m}).', { b: pre.bocados, m: x(A.sinMunicion) })}</small></p>`;
    const espera = T.espera > 0 && !PW.trituradora.atascando(e) ? `<p>${tr('Se puede volver a intentar en {t}.', { t: t(T.espera) })}</p>` : '';
    return `<div class="pw-texto"><p>${estado}</p>${prevision}${espera}${boton('atascar', '', tr('ATASCAR'), PW.trituradora.lista(e), 'grande')}</div>${acabada ? '' : municion(e)}`;
  }
  function cofres(e) {
    const hay = PW.extras.cofres(e);
    const objetos = PW.OBJETOS.map(o => {
      const tengo = e.r.objetos[o.id] || 0, activo = e.r.activos[o.id] || 0;
      const det = tr(o.txt) + (activo > 0 ? ' · ' + tr('activo {t}', { t: t(activo) }) : '');
      return fila(icono(`img/icono-${o.id}.png`, '#7ef9ff'), `${tr(o.nombre)} ×${tengo}`, det, boton('usar', o.id, tr('Usar'), tengo > 0));
    }).join('');
    return `<div class="pw-texto"><p>${tr('Vaciando archivadores se llena el medidor y sale un cofre. Cada cofre trae un objeto.')}</p>`
      + `${boton('cofre', '', tr('Abrir cofre ({n})', { n: hay }), hay > 0, 'grande')}</div>${objetos}`;
  }
  return { hud, acciones, pestanas, enCarrera, avisos, utiles, documentos, trituradora, cofres, boton, fila, icono };
})();
