// Fans Of Pets · adaptador · CASA: el HTML de la mascota (las barras, los cuidados por etapa y sus menús: aseo, jugar, más, álbum, despedir),
// la pantalla del ascenso y la del final (la carta). Lo que hace cada botón está en botones.js; lo que se refresca con el reloj, en pantallas.js.
'use strict';
PT.casa = (() => {
  const ui = PT.ui, esc = PT.esc;
  const boton = (id, texto, clase = '') => `<button type="button" class="pt-btn ${clase}" id="${id}">${esc(texto)}</button>`;
  const titulo = (p, etapa) => {
    const c = p.criatura;
    return `<h2 class="pt-titulo">${esc(PT.criaturas.nombre(c))} <small>${tr(PT.ETAPA[etapa])} · ${esc(PT.criaturas.faccion(c.fac))}</small></h2>`;
  };

  // la casa, según el menú abierto (ui.menu: '', 'aseo', 'jugar', 'mas', 'album', 'despedir')
  function caja(p) {
    const m = p.mascota;
    if (ui.menu === 'album') return cajaAlbum(p);
    if (ui.menu === 'despedir') return cajaDespedir(p);
    const barras = m.visibles.map(k => `<div class="pt-nec"><span>${tr(PT.NOMBRE_NEC[k])}</span><div class="pt-barra"><i id="pt-b-${k}"></i></div></div>`).join('');
    return titulo(p, m.etapa) + `<p class="pt-nota" id="pt-estado"></p><div class="pt-necs">${barras}</div>` + avisos(m) + menu(m) +
      `<div class="pt-fila pt-pie"><span id="pt-crece"></span></div>`;
  }
  // la carta de dimisión y el ascenso, cuando tocan
  function avisos(m) {
    let h = '';
    if (m.carrera.dimision) h += `<p class="pt-nota pt-aviso">${tr('Carta de dimisión sobre la mesa: {d} días de preaviso.', { d: PETS.dimision.preavisoDias })}</p>` + boton('pt-contraoferta', tr('CONTRAOFERTA'), 'pt-grande');
    if (m.puedeAscender) h += boton('pt-ascender', tr('ASCENDER'), 'pt-grande');
    return h;
  }
  function menu(m) {
    if (ui.menu === 'aseo') return cajaAseo(m);
    if (ui.menu === 'jugar') return cajaJugar(m);
    if (ui.menu === 'mas') return cajaMas();
    const aseo = m.cuidados.includes('dientes') ? boton('pt-aseo', tr('ASEO')) : boton('pt-banar', tr('BAÑAR'));
    const chuche = m.cuidados.includes('chuche') ? boton('pt-chuche', tr('CHUCHE')) : '';
    return `<div class="pt-fila">${boton('pt-comer', tr('COMER'))}${boton('pt-beber', tr('BEBER'))}${boton('pt-dormir', tr('DORMIR'))}${aseo}</div>` +
      `<div class="pt-fila">${boton('pt-jugar', tr('JUGAR'))}${chuche}${boton('pt-mas', tr('MÁS'), 'pt-chico')}</div>`;
  }
  function cajaAseo(m) {
    const b = ['banar', 'dientes', 'cara', 'bano'].filter(t => m.cuidados.includes(t));
    const T = { banar: tr('DUCHA'), dientes: tr('DIENTES'), cara: tr('CARA'), bano: tr('BAÑO') };
    return `<div class="pt-fila">${b.map(t => boton('pt-' + t, T[t])).join('')}</div><div class="pt-fila">${boton('pt-volver', tr('VOLVER'), 'pt-chico')}</div>`;
  }
  function cajaJugar(m) {
    const j = m.minijuegos.map(x => `<button type="button" class="pt-btn pt-minijuego" data-juego="${x.id}">${esc(x.nombre)}</button>`).join('');
    return `<p class="pt-nota">${tr('Elige a qué jugar')} · ${tr('Se abre en otra pestaña y cuenta como jugado.')}</p><p class="pt-nota" id="pt-jugadas"></p>` +
      `<div class="pt-respuestas">${j}</div><div class="pt-fila">${boton('pt-volver', tr('VOLVER'), 'pt-chico')}</div>`;
  }
  function cajaMas() {
    return `<div class="pt-fila">${boton('pt-horario', tr('HORARIO'), 'pt-chico')}${boton('pt-album', tr('ÁLBUM'), 'pt-chico')}${boton('pt-sonido', '', 'pt-chico')}</div>` +
      `<div class="pt-fila">${boton('pt-despedir', tr('DESPEDIR'), 'pt-chico')}${boton('pt-volver', tr('VOLVER'), 'pt-chico')}</div>`;
  }
  function cajaDespedir(p) {
    return titulo(p, p.mascota.etapa) + `<h2 class="pt-titulo">${tr('¿Despedirla?')}</h2><p class="pt-nota">${tr('Se va con su carta al álbum y empiezas con otro huevo.')}</p>` +
      `<div class="pt-fila">${boton('pt-despedir-si', tr('SÍ, DESPEDIRLA'))}${boton('pt-volver', tr('VOLVER'), 'pt-chico')}</div>`;
  }
  // el álbum: las que ya pasaron, la última primero
  function cajaAlbum(p) {
    const filas = p.album.slice().reverse().map(e => {
      const c = PT.criaturas.busca(e.criatura), nombre = c ? PT.criaturas.nombre(c) : e.criatura;
      const que = e.resultado === 'ascenso' ? tr(PT.FRASES.cargo[e.rama]) : tr(PT.RESULTADO[e.resultado]) + ' · ' + tr(PT.ETAPA[e.etapa]);
      return `<p class="pt-nota"><b>${esc(nombre)}</b> · ${esc(que)}</p>`;
    });
    return `<h2 class="pt-titulo">${tr('Álbum')}</h2>` + (filas.length ? filas.join('') : `<p class="pt-nota">${tr('Todavía no hay nadie en el álbum.')}</p>`) +
      `<div class="pt-fila">${boton('pt-volver', tr('VOLVER'), 'pt-chico')}</div>`;
  }

  // el ascenso: la carta y otro huevo
  function cajaAscenso(p) {
    const nombre = PT.criaturas.nombre(p.criatura), cargo = tr(PT.FRASES.cargo[p.mascota.rama]);
    return `<h2 class="pt-titulo">${tr('¡Ascenso!')}</h2><p class="pt-nota">${esc(tr(PT.FRASES.ascenso, { nombre, cargo }))}</p>` +
      boton('pt-otro-huevo', tr('OTRO HUEVO'), 'pt-grande');
  }
  // el final: la carta de dimisión o de despido y otro huevo
  function cajaFinal(p) {
    const dimision = p.final.motivo === 'dimision';
    return `<h2 class="pt-titulo">${dimision ? tr('Carta de dimisión') : tr('Carta de despido')}</h2><p class="pt-nota">${esc(tr(dimision ? PT.FRASES.seMarcha : PT.FRASES.despedida))}</p>` +
      boton('pt-otro-huevo', tr('OTRO HUEVO'), 'pt-grande');
  }

  return { caja, cajaAscenso, cajaFinal };
})();
