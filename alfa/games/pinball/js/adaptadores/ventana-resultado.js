// Fans of Pinball · adaptador · VENTANA DE RESULTADO (PROTOTIPO.md, «Pantalla de fin de partida»): planta y puntos grandes, las fichas que
// vuelan al contador (×2 si es la primera del día), el «te faltaron», la barra de la criatura más cerca de subir, el premio del capítulo,
// las misiones cumplidas y, en el sin fin, cuánto queda de semana. OTRA grande y naranja (de vuelta a la mesa al momento) y MENÚ pequeño.
// Sin desplazar ni leer de más.
'use strict';
PB.ventanaResultado = (() => {
  const t = (texto, n) => tr(texto).replace('{n}', PB.miles(n));
  function titulo(r) {
    if (r.resultado === 'victoria') return tr('¡CAPÍTULO SUPERADO!');
    if (r.nuevoRecord) return tr('¡NUEVO RÉCORD!');
    return tr('¡SE ACABÓ EL TIEMPO!');
  }
  function faltan(r) {
    const f = r.faltan;
    if (!f) return '';
    if (f.jefe) return f.plantas === 1 ? tr('Te faltó 1 planta para el jefe') : t('Te faltaron {n} plantas para el jefe', f.plantas);
    if (f.plantas) return f.plantas === 1 ? tr('Te faltó 1 planta para tu récord') : t('Te faltaron {n} plantas para tu récord', f.plantas);
    return t('Te faltaron {n} puntos para tu récord', f.puntos);
  }
  function criatura(r) {
    const c = r.criatura;
    if (!c) return '';
    const nombre = AJUSTES.criaturas.lista[c.id].nombre, texto = c.falta > 0
      ? t('Te faltan {n} fichas para', c.falta) + ' ' + nombre + ' ' + tr('nivel {n}').replace('{n}', c.siguiente)
      : nombre + ': ' + tr('¡ya puedes subirla de nivel!');
    const barra = PB.crea('span', { className: 'pb-barra-nivel' }, PB.crea('i', { style: 'width:' + Math.min(100, (1 - c.falta / c.precio) * 100).toFixed(0) + '%' }));
    return PB.crea('div', { className: 'pb-casi' }, PB.crea('p', { textContent: texto }), barra);
  }
  function semana() {
    const ms = PB.app.clasificacion.lee().valor.cierraEn, d = Math.floor(ms / 86400000), h = Math.floor(ms % 86400000 / 3600000);
    return tr('La semana cierra en {d} d {h} h').replace('{d}', d).replace('{h}', h);
  }
  // el contador de fichas que sube mientras las fichas vuelan
  function contador(r) {
    const n = PB.crea('b', { textContent: PB.miles(r.fichasTotal - r.fichasGanadas) });
    const caja = PB.crea('div', { className: 'pb-chapa pb-chapa-fichas' }, PB.imagen(AJUSTES.arte.imagenes.moneda, 2, 'pb-icono'), n);
    let mostradas = r.fichasTotal - r.fichasGanadas;
    const paso = Math.max(1, Math.ceil(r.fichasGanadas / 20)), fin = r.fichasTotal;
    const sube = setInterval(() => {
      mostradas = Math.min(fin, mostradas + paso); n.textContent = PB.miles(mostradas);
      caja.classList.remove('pb-late'); void caja.offsetWidth; caja.classList.add('pb-late');
      if (mostradas >= fin) clearInterval(sube);
    }, 45);
    return caja;
  }
  function lineas(r) {
    const l = [];
    const extra = r.multiplicador > 1 ? ' ×' + r.multiplicador + ' ' + tr('primera del día') : '';
    l.push(PB.crea('p', { className: 'pb-ganadas', textContent: '+' + PB.miles(r.fichasGanadas) + ' ' + tr('fichas') + extra }));
    const f = faltan(r);
    if (f) l.push(PB.crea('p', { className: 'pb-falto', textContent: f }));
    if (r.premio) l.push(PB.crea('p', { className: 'pb-premio', textContent: tr('¡JunkCoon se une a tu equipo!') + ' +' + r.premio.fichas + ' ' + tr('fichas') }),
      PB.crea('p', { className: 'pb-pronto', textContent: tr('Capítulo 2: Cementerio de juegos, pronto') }));
    for (const m of r.misiones) l.push(PB.crea('p', { className: 'pb-mision-ok', textContent: tr('¡Misión!') + ' ' + tr(m.txt) + ' +' + m.r }));
    const c = criatura(r);
    if (c) l.push(c);
    if (r.modo === 'sinfin') l.push(PB.crea('p', { className: 'pb-semana', textContent: semana() }));
    return l;
  }
  function abre(r, acciones) {
    const grande = PB.crea('div', { className: 'pb-marca' },
      PB.crea('div', {}, PB.crea('small', { textContent: tr('PLANTA') }), PB.crea('b', { textContent: r.planta })),
      PB.crea('div', {}, PB.crea('small', { textContent: tr('PUNTOS') }), PB.crea('b', { textContent: PB.miles(r.puntos) })));
    PB.ventanas.abre({
      clase: 'pb-hoja-resultado' + (r.nuevoRecord || r.resultado === 'victoria' ? ' pb-fiesta' : ''), titulo: titulo(r),
      cuerpo: [grande, contador(r), ...lineas(r)],
      botones: [{ texto: tr('OTRA'), clase: 'pb-naranja pb-grande', alPulsar: acciones.otra }, { texto: tr('MENÚ'), clase: 'pb-azul pb-pequeno', alPulsar: acciones.menu }],
    });
  }
  return { abre };
})();
