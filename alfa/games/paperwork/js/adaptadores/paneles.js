// Fans Of Paperwork · adaptador · PANELES: el HTML de la parte de abajo. La barra de arriba (oro, nivel, planta), los botones de acción
// (dinamita, Trituradora, sindicato, cofres) y el panel de la pestaña elegida: pico, materiales, Trituradora y cofres aquí; carrera y
// retos en paneles-carrera.js. Solo pinta: cada botón lleva data-acc (y data-arg) y lo que hace está en botones.js.
'use strict';
PW.paneles = (() => {
  const n = v => PW.txt.num(v), t = s => PW.txt.tiempo(s);
  const boton = (acc, arg, txt, activo = true, clase = '') => `<button class="pw-btn ol ${clase}" data-acc="${acc}" data-arg="${arg}"${activo ? '' : ' disabled'}>${txt}</button>`;
  const fila = (icono, titulo, detalle, derecha) => `<div class="pw-fila">${icono}<p><b>${titulo}</b><small>${detalle}</small></p>${derecha}</div>`;
  const icono = (src, color) => `<span class="pw-ico" style="--c:${color || '#555'}">${src ? `<img src="${src}" alt="" onerror="this.remove()">` : ''}</span>`;

  function hud(e, B) {
    const r = e.r, xp = PW.curvas.xpParaSubir(r.nivel), tope = PW.curvas.topeNivel(e.c.trituradora.nivel);
    const parte = r.nivel >= tope ? 1 : r.xp / xp;
    return `<span class="pw-oro ol">${n(r.oro)}</span>`
      + `<span class="pw-nivel"><b class="ol">${tr('Nv. {n}', { n: r.nivel })}</b><i style="width:${Math.round(parte * 100)}%"></i>${r.nivel >= tope ? `<small>${tr('tope')}</small>` : ''}</span>`
      + `<span class="pw-planta ol">${tr('Planta −{n}', { n: r.planta.n })}<small>${tr(PW.ZONAS[PW.curvas.zonaDe(r.planta.n)].nombre)}</small></span>`
      + `<span class="pw-indem ol" title="${tr('Indemnización')}">${n(e.c.indemnizacion)}</span>`;
  }
  // los cuatro botones grandes de acción, con su carga o su cuenta (la carga va de 5 en 5 %: así el botón no se rehace a cada instante)
  const carga = v => Math.floor(Math.max(0, Math.min(1, v)) * 20) / 20;
  function acciones(e, B) {
    const din = carga(e.r.dinamita / B.recargaDinamita), T = e.c.trituradora, sind = e.c.sindicato;
    const trit = PW.trituradora.acabada(e) ? tr('Rota') : PW.trituradora.atacando(e) ? tr('¡Dale!') : T.espera > 0 ? t(T.espera) : tr('¡Atacar!');
    return `<button class="pw-acc ol${din >= 1 ? ' listo' : ''}" data-acc="dinamita" style="--p:${din}"><img src="img/icono-dinamita.png" alt="" onerror="this.remove()">${tr('Dinamita')}</button>`
      + `<button class="pw-acc ol${PW.trituradora.lista(e) ? ' listo' : ''}" data-acc="pestana" data-arg="trituradora"><img src="img/trituradora.png" alt="">${trit}</button>`
      + `<button class="pw-acc ol${sind.guardados ? ' listo' : ''}" data-acc="sindicato" style="--p:${carga(1 - sind.falta / PW.AJ.sindicato.cada)}"><img src="img/icono-sindicato.png" alt="" onerror="this.remove()">${tr('Sindicato')} ${sind.guardados ? '×' + sind.guardados : ''}</button>`
      + `<button class="pw-acc ol${PW.extras.cofres(e) ? ' listo' : ''}" data-acc="pestana" data-arg="cofres" style="--p:${carga(e.r.medidor / PW.AJ.cofre.medidor)}"><img src="img/icono-cofre.png" alt="" onerror="this.remove()">${tr('Cofres')} ${PW.extras.cofres(e) ? '×' + PW.extras.cofres(e) : ''}</button>`;
  }

  // cada mejora del pico con su icono (la zanahoria de CrazyBunny, el café y la dinamita)
  const PICO_ICONO = { dano: 'zanahoria', velocidad: 'cafe', radio: 'dinamita' };
  const PICO = [['dano', 'Daño del pico', B => tr('{n} por golpe', { n: n(B.dano) })],
    ['velocidad', 'Velocidad', B => tr('{n} golpes por segundo', { n: fmtV(Math.round(B.golpesSeg * 100) / 100) })],
    ['radio', 'Radio', B => tr('{p} de dar también al bloque de al lado', { p: PW.txt.pct(B.radio) })]];
  // cuántas compras se pueden pagar ahora en cada pestaña (el globo que avisa de que hay algo que comprar)
  function avisos(e, B) {
    const pico = PICO.filter(([k]) => e.r.pico[k] < PW.AJ.picoMejoras[k].max && e.r.oro >= PW.compras.precioPico(e, k)).length;
    const materiales = PW.MATERIALES.filter((m, i) => PW.compras.vistoMaterial(e, i) && e.r.mejorasMat[i] < B.topeMaterial && e.r.piezas[i] >= PW.compras.precioMaterial(e, i)).length;
    return { pico, materiales, carrera: PW.panelesCarrera.avisos(e), retos: PW.retos.listos() };
  }
  function pico(e, B) {
    const filas = PICO.map(([k, nombre, det]) => {
      const nivel = e.r.pico[k], max = PW.AJ.picoMejoras[k].max, precio = PW.compras.precioPico(e, k);
      const der = nivel >= max ? `<em>${tr('Máximo')}</em>` : boton('pico', k, `${n(precio)}<i class="pw-oro-i"></i>`, e.r.oro >= precio);
      return fila(icono(`img/icono-${PICO_ICONO[k]}.png`, '#ff9a3c'), `${tr(nombre)} · ${tr('nivel {n}', { n: nivel })}`, det(B), der);
    }).join('');
    const venta = [0, 0.25, 0.5, 0.75, 1].map(p => boton('venta', p, PW.txt.pct(p), true, e.r.venta === p ? 'activo' : '')).join('');
    return filas + `<div class="pw-venta"><b>${tr('Piezas que se venden solas')}</b><div>${venta}</div></div>`;
  }
  function materiales(e, B) {
    const vistos = PW.MATERIALES.map((m, i) => i).filter(i => PW.compras.vistoMaterial(e, i));
    return vistos.map(i => {
      const M = PW.MATERIALES[i], nivel = e.r.mejorasMat[i], precio = PW.compras.precioMaterial(e, i), rango = PW.curvas.rangoExpediente(e.c.expedientes[i] || 0);
      const der = nivel >= B.topeMaterial ? `<em>${tr('Máximo')}</em>` : boton('material', i, `${n(precio)} ${tr('piezas')}`, e.r.piezas[i] >= precio);
      const det = `${tr(M.txt)} · ${tr('expediente {r}/3', { r: rango })}<br>${tr('tienes {n} piezas', { n: n(e.r.piezas[i]) })}`;
      return fila(icono(`img/bloque-${M.id}.png`, M.color), `${tr(M.nombre)} · ${tr('nivel {n}', { n: nivel })}`, det, der);
    }).join('');
  }
  function trituradora(e, B) {
    const T = e.c.trituradora, acabada = PW.trituradora.acabada(e);
    const dano = PW.trituradora.danoSeg(e, B) * PW.AJ.trituradora.intento, vida = acabada ? 1 : PW.trituradora.vida(e);
    const estado = acabada ? tr('¡Destrozada! Ya no queda Trituradora.')
      : tr('Nivel {n} de {t}. Lleva {d} de {v} de daño; su armadura quita {a} a cada golpe.', { n: T.nivel + 1, t: PW.AJ.trituradora.niveles, d: n(T.dano), v: n(vida), a: n(PW.trituradora.armadura(e)) });
    const prevision = acabada ? '' : `<p>${tr('Tu equipo le haría unos {d} en un intento de {s} s.', { d: n(dano), s: PW.AJ.trituradora.intento })}${dano <= 0 ? ' ' + tr('Ahora no le haces nada: mejora el daño.') : ''}</p>`;
    const espera = T.espera > 0 && !PW.trituradora.atacando(e) ? tr('Se puede volver a atacar en {t}.', { t: t(T.espera) }) : '';
    const facciones = PW.FACCIONES.slice(0, PW.bonos.liberadas(e)).map(f => `<li><b>${f.lider}</b> · ${tr(f.poder)}: ${tr(f.txt)}</li>`).join('');
    return `<div class="pw-texto"><p>${estado}</p>${prevision}<p>${espera}</p>`
      + `${boton('atacar', '', tr('ATACAR'), PW.trituradora.lista(e), 'grande')}<h4>${tr('Tu equipo')}</h4><ul>${facciones}</ul></div>`;
  }
  function cofres(e) {
    const hay = PW.extras.cofres(e);
    const objetos = PW.OBJETOS.map(o => {
      const tengo = e.r.objetos[o.id] || 0, activo = e.r.activos[o.id] || 0;
      const det = tr(o.txt) + (activo > 0 ? ' · ' + tr('activo {t}', { t: t(activo) }) : '');
      return fila(icono(`img/icono-${o.id}.png`, '#7ef9ff'), `${tr(o.nombre)} ×${tengo}`, det, boton('usar', o.id, tr('Usar'), tengo > 0));
    }).join('');
    return `<div class="pw-texto"><p>${tr('Rompiendo bloques se llena el medidor y sale un cofre. Cada cofre trae un objeto.')}</p>`
      + `${boton('cofre', '', tr('Abrir cofre ({n})', { n: hay }), hay > 0, 'grande')}</div>${objetos}`;
  }
  return { hud, acciones, avisos, pico, materiales, trituradora, cofres, boton, fila, icono };
})();
