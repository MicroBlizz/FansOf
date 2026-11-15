// Fans Of Paperwork · adaptador · PANELES DEL PASILLO: lo que acompaña al pasillo además de los paneles de compra. La tira de recursos
// (los expedientes y caducados que se tienen, siempre a la vista), las flechas para cambiar de planta, el panel de plantas (la lista de las
// ya pisadas y el modo auto), la lista de desbloqueos, la pelea contra la Trituradora (sin menús: es un jefe) y su cortinilla de entrada.
// Mismo contrato que paneles.js: solo HTML con data-acc.
'use strict';
PW.panelesTurno = (() => {
  const P = PW.paneles, n = v => PW.txt.num(v), t = s => PW.txt.tiempo(s);

  // la tira de recursos: una ficha por cada tipo de documento visto, con sus expedientes, y los caducados si ya hay sellos
  function recursos(e, B) {
    const fichas = PW.DOCUMENTOS.map((d, i) => i).filter(i => PW.compras.vistoDocumento(e, i))
      .map(i => `<span class="pw-ficha" style="--c:${PW.DOCUMENTOS[i].color}" title="${tr(PW.DOCUMENTOS[i].nombre)}"><i></i>${n(e.r.expedientes[i])}</span>`).join('');
    const caducados = B.abierto.sellos ? `<span class="pw-ficha pw-caducados" title="${tr('Caducados')}"><i></i>${n(e.r.caducados)}</span>` : '';
    return `<button class="pw-recursos" data-acc="pestana" data-arg="documentos">${fichas}${caducados}</button>`;
  }
  // las flechas del lateral: subir a la planta anterior y bajar a la siguiente ya pisada (no salen hasta haber bajado una planta)
  function lateral(e) {
    const r = e.r, nPl = r.planta.n;
    if (r.plantaMax < 2) return '';
    const flecha = (clase, a, activo) => `<button class="pw-flecha ${clase}" data-acc="planta" data-arg="${a}" aria-label="${clase === 'sube' ? tr('Subir una planta') : tr('Bajar una planta')}"${activo ? '' : ' disabled'}></button>`;
    return flecha('sube', nPl - 1, nPl > 1) + flecha('baja', nPl + 1, nPl < r.plantaMax);
  }
  const LISTA = 30;   // plantas que enseña la lista, desde la más honda (a las demás se llega con las flechas)
  const AUTO = v => (v === 0 ? tr('Quedarme') : v === 1 ? tr('Siempre') : tr('Tras {n}', { n: v }));
  // el panel de plantas: el modo auto y la lista de las plantas ya pisadas en este turno, de la más honda a la primera
  function plantas(e) {
    const r = e.r, auto = PW.AJ.planta.bajar.map(v => P.boton('bajar', v, AUTO(v), true, e.c.bajar === v ? 'activo' : '')).join('');
    const filas = [];
    for (let p = r.plantaMax; p >= Math.max(1, r.plantaMax - LISTA + 1); p--) {
      const [a, b] = PW.curvas.documentosDe(p), aqui = p === r.planta.n;
      const docs = `${tr(PW.DOCUMENTOS[a].nombre)}${b !== a ? ' · ' + tr(PW.DOCUMENTOS[b].nombre) : ''}`;
      const der = aqui ? `<em>${tr('Estás aquí')}</em>` : P.boton('planta', p, tr('Ir'));
      filas.push(P.fila(P.icono(`img/archivador-${PW.DOCUMENTOS[b].id}.png`, PW.DOCUMENTOS[b].color), tr('Planta −{n}', { n: p }), `${tr(PW.ZONAS[PW.curvas.zonaDe(p)].nombre)}<br>${docs}`, der));
    }
    const repes = e.c.bajar > 1 ? ' ' + tr('Llevas {a} de {b} limpiezas de esta planta.', { a: r.repes || 0, b: e.c.bajar }) : '';
    return `<div class="pw-venta"><b>${tr('Bajar sola a la planta siguiente')}</b><div>${auto}</div></div>`
      + `<p class="pw-nota">${tr('Elige cuántas veces limpia el equipo una planta antes de bajar, o que se quede en ella para sacar más de sus documentos.')}${repes}</p>` + filas.join('') + (r.plantaMax > LISTA ? `<p class="pw-nota">${tr('A las plantas de más arriba se llega con las flechas del pasillo.')}</p>` : '');
  }
  // lo que queda por abrir y lo ya abierto, por nivel de la Trituradora
  function desbloqueos(e) {
    const nivel = e.c.trituradora.nivel;
    const filas = PW.DESBLOQUEOS.map(d => {
      const abierto = nivel >= d.nivel;
      return P.fila(P.icono('', abierto ? '#3ddc84' : '#555'), tr(d.nombre), tr(d.txt), `<em>${abierto ? tr('Abierto') : tr('Trituradora nv. {n}', { n: d.nivel })}</em>`);
    }).join('');
    return `<h4 class="pw-sub">${tr('Lo que abre la Trituradora')}</h4>${filas}`;
  }
  // lo que abrirá atascar el nivel en curso, en una frase (o '')
  function premio(e) {
    const abre = PW.desbloqueos.alAtascar(e.c.trituradora.nivel + 1).map(d => tr(d.nombre));
    return abre.length ? tr('Si la atascas se abre: {lista}.', { lista: abre.join(', ') }) : '';
  }
  // la pelea: mientras dura el intento no hay menús, solo lo que pasa con la máquina
  function jefe(e, B) {
    const T = e.c.trituradora, cabe = PW.trituradora.capacidad(e);
    const boca = B.abierto.sellos ? `<p>${tr('Bocado en curso: x{n}', { n: fmtV(Math.round(T.multi * 100) / 100) })} · ${tr('caducados {n}', { n: n(e.r.caducados) })}</p>` : '';
    const flojo = PW.trituradora.atascoSeg(e, B) > 0 ? '' : `<p class="pw-jefe-flojo">${tr('Tu equipo lee menos de lo que traga: no le hace nada. Mejora las gafas y los guantes y vuelve.')}</p>`;
    return `<div class="pw-texto pw-jefe"><h4>${tr('Trituradora · nivel {n}', { n: T.nivel + 1 })}</h4>`
      + `<p class="pw-jefe-toca">${tr('¡Toca la pantalla para empujar!')}</p>`
      + `<p>${tr('Lleva {d} de {v} atascado. Quedan {t}.', { d: n(T.atasco), v: n(cabe), t: t(T.intento) })}</p>${flojo}${boca}`
      + `<p><small>${tr('Lo que no atasques ahora se queda para el próximo intento.')} ${premio(e)}</small></p></div>`;
  }
  // la cortinilla de entrada a la pelea: qué vas a hacer, en tres pasos, y el botón que empieza el intento
  function cortinilla(e, B) {
    const A = PW.AJ.trituradora, T = e.c.trituradora;
    const pasos = [
      tr('Tu equipo deja de rebuscar y le echa documentos durante {s} segundos.', { s: A.intento }),
      B.abierto.sellos ? tr('Se come lo que hayas marcado, lo mejor primero: cuanto mejor el bocado, más se atasca.') : tr('Cuanto más lea tu equipo, más se atasca.'),
      tr('Toca la pantalla para empujar. Lo que no atasques hoy se queda para el próximo intento.'),
    ].map((s, k) => `<li style="--k:${k}"><b>${k + 1}</b><span>${s}</span></li>`).join('');
    return `<div class="pw-cort"><p class="pw-cort-rotulo ol">${tr('¡JEFE!')}</p><h3 class="ol">${tr('LA TRITURADORA')}</h3><p class="pw-cort-nivel ol">${tr('Nivel {n} de {t}', { n: T.nivel + 1, t: A.niveles })}</p>`
      + `<img src="img/trituradora.png" alt="" onerror="this.remove()"><ol>${pasos}</ol><p class="pw-cort-premio">${premio(e)}</p>`
      + `${P.boton('atascar-ya', '', tr('¡A ATASCAR!'), true, 'grande listo')}${P.boton('cortinilla-no', '', tr('Ahora no'), true, 'pw-cort-no')}</div>`;
  }
  return { recursos, lateral, plantas, desbloqueos, jefe, cortinilla, premio };
})();
