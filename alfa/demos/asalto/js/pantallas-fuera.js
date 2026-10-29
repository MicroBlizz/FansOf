// Fans of Asalto · PANTALLAS DE FUERA DE LA PARTIDA: el Equipo (6 huecos, las estadísticas en % para todos los héroes y la mochila
// de 12), la Herrería (subir un objeto puesto con plumas), los Logros (cobrar los cumplidos) y la Tienda (un cofre de equipo por
// plumas, o plumas con un anuncio de prueba). Todo vive en SAVE (js/guardado.js).
'use strict';
function asObjetoHtml(o, extra) {
  const E = AS_EQUIPO;
  return `<button class="as-obj r${o.rareza}" type="button" data-obj="${o.id}" ${extra || ''}><i data-ico="equipo-${o.hueco}"></i><small>${asH(tr(E.nombres[o.hueco]))}${o.nivel ? ' +' + o.nivel : ''}</small><small class="as-stat">+${o.valor + o.nivel} % ${asH(tr(E.stats[o.stat]))}</small></button>`;
}
function asPintaIconos(t) { t.querySelectorAll('[data-ico]').forEach(i => { i.innerHTML = ''; i.appendChild(asLienzo(i.dataset.ico, 40, true)); }); }

/* ---------- el equipo ---------- */
function asPantallaEquipo() {
  const E = AS_EQUIPO, s = asStatsEquipo();
  const huecos = E.huecos.map(h => { const o = SAVE.equipo[h]; return o ? asObjetoHtml(o, 'data-puesto="1"') : `<div class="as-obj vacio"><i data-ico="equipo-${h}"></i><small>${asH(tr(E.nombres[h]))}</small></div>`; }).join('');
  const stats = Object.keys(E.stats).map(k => `<li><span>${asH(tr(E.stats[k]))}</span><b>+${s[k]} %</b></li>`).join('');
  const mochila = SAVE.mochila.map(o => asObjetoHtml(o)).join('') + '<div class="as-obj vacio"></div>'.repeat(Math.max(0, E.mochila - SAVE.mochila.length));
  const t = asModal(`<h2>${tr('EQUIPO')}</h2><div class="as-equipo"><div class="as-huecos">${huecos}</div><ul class="as-stats">${stats}</ul></div>
    <p class="as-sub">${tr('Mochila')} ${SAVE.mochila.length}/${E.mochila} · ${tr('Toca un objeto para ponerlo; mantenlo pulsado para deshacerlo en plumas.')}</p><div class="as-mochila">${mochila}</div>
    <div class="as-fila"><button class="as-btn2 as-gris" id="as-e-todo" type="button">${tr('DESHACER LOS DE LA MOCHILA')}</button><button class="as-btn2" id="as-e-ok" type="button">${tr('VOLVER')}</button></div>`, 'as-ancha');
  asPintaIconos(t);
  t.querySelectorAll('[data-obj]').forEach(b => {
    const o = [...SAVE.mochila, ...Object.values(SAVE.equipo)].find(x => x.id === b.dataset.obj); if (!o) return;
    let largo = null;
    b.onpointerdown = () => { largo = setTimeout(() => { largo = 'hecho'; confirmBox(tr('¿DESHACER?'), tr('{o} se convierte en {n} plumas.', { o: tr(E.nombres[o.hueco]), n: E.desencantar(o.rareza) }), tr('SÍ'), () => { asDesencantar(o); play('asRefresca'); asPantallaEquipo(); }); }, 600); };
    b.onpointerup = b.onpointerleave = () => { if (largo && largo !== 'hecho') { clearTimeout(largo); largo = null; } };
    b.onclick = () => { if (largo === 'hecho') { largo = null; return; } play('select'); if (b.dataset.puesto) { if (!asQuitarObjeto(o.hueco)) toast(tr('La mochila está llena')); } else asPonerObjeto(o); asPantallaEquipo(); };
  });
  $('#as-e-todo').onclick = () => { if (!SAVE.mochila.length) { play('asNoVale'); return; } confirmBox(tr('¿DESHACER TODO?'), tr('Los {n} objetos de la mochila se convierten en plumas.', { n: SAVE.mochila.length }), tr('SÍ'), () => { for (const o of SAVE.mochila.slice()) asDesencantar(o); play('asRefresca'); asPantallaEquipo(); }); };
  $('#as-e-ok').onclick = () => { play('select'); asCierraModal(); asMenu(); };
}

/* ---------- la herrería ---------- */
function asPantallaHerreria() {
  const E = AS_EQUIPO, puestos = E.huecos.filter(h => SAVE.equipo[h]);
  const lista = puestos.map(h => { const o = SAVE.equipo[h], c = E.herreria(o.nivel); return `<div class="as-forja"><div>${asObjetoHtml(o)}</div><div class="as-forja-txt"><b>+${o.valor + o.nivel} % → +${o.valor + o.nivel + 1} %</b><button class="as-btn2 as-oro" type="button" data-forja="${h}" ${SAVE.plumas < c ? 'disabled' : ''}>${tr('MEJORAR')} · ${c}</button></div></div>`; }).join('');
  const t = asModal(`<h2>${tr('HERRERÍA')}</h2><p class="as-sub">${tr('Sube los objetos que llevas puestos: +1 % cada vez. Tienes {n} plumas.', { n: SAVE.plumas })}</p>
    ${lista || `<p>${tr('No llevas nada puesto. Ponte algo en el Equipo.')}</p>`}<button class="as-btn2" id="as-h-ok" type="button">${tr('VOLVER')}</button>`, 'as-ancha');
  asPintaIconos(t);
  t.querySelectorAll('[data-forja]').forEach(b => b.onclick = () => { const o = SAVE.equipo[b.dataset.forja], c = E.herreria(o.nivel); if (SAVE.plumas < c) { play('asNoVale'); return; } SAVE.plumas -= c; o.nivel++; asGuarda(); play('asSube'); asPantallaHerreria(); });
  $('#as-h-ok').onclick = () => { play('select'); asCierraModal(); asMenu(); };
}

/* ---------- los logros ---------- */
function asPantallaLogros() {
  const filas = AS_LOGROS.map(l => { const hecho = !!SAVE.logros[l.id], puede = !hecho && l.cond(SAVE.stats); return `<li class="${hecho ? 'hecho' : puede ? 'puede' : ''}"><span>${asH(tr(l.txt))}</span>${hecho ? `<b>✓</b>` : puede ? `<button class="as-btn2 as-oro" type="button" data-logro="${l.id}">${tr('COBRAR')} ${asPlumasHtml(l.premio)}</button>` : asPlumasHtml(l.premio)}</li>`; }).join('');
  const t = asModal(`<h2>${tr('LOGROS')}</h2><ul class="as-logros">${filas}</ul><button class="as-btn2" id="as-l-ok" type="button">${tr('VOLVER')}</button>`, 'as-ancha');
  t.querySelectorAll('[data-logro]').forEach(b => b.onclick = () => { const l = AS_LOGROS.find(x => x.id === b.dataset.logro); SAVE.logros[l.id] = 1; SAVE.plumas += l.premio; asGuarda(); play('asCofre'); asPantallaLogros(); });
  $('#as-l-ok').onclick = () => { play('select'); asCierraModal(); asMenu(); };
}

/* ---------- la tienda de fuera ---------- */
function asPantallaTienda() {
  const E = AS_EQUIPO;
  const t = asModal(`<h2>${tr('TIENDA')}</h2><p class="as-sub">${tr('Tienes {n} plumas.', { n: SAVE.plumas })}</p>
    <div class="as-ofertas">
      <button class="as-oferta" type="button" id="as-t-cofre" ${SAVE.plumas < E.cofreTienda ? 'disabled' : ''}><i data-ico="equipo-casco"></i><b>${tr('Cofre de equipo')}</b><small>${tr('Un objeto al azar, raro o épico')}</small>${asPlumasHtml(E.cofreTienda)}</button>
      <button class="as-oferta" type="button" id="as-t-ad"><i data-ico="anuncio"></i><b>${tr('Plumas gratis')}</b><small>${tr('+20 plumas con un anuncio de prueba')}</small></button>
    </div><button class="as-btn2" id="as-t-ok" type="button">${tr('VOLVER')}</button>`, 'as-ancha');
  asPintaIconos(t);
  $('#as-t-cofre').onclick = () => { if (SAVE.plumas < E.cofreTienda) { play('asNoVale'); return; } SAVE.plumas -= E.cofreTienda; const o = asObjetoNuevo(Math.random() < 0.3 ? 2 : 1); const fuera = asGuardaObjetos([o]); play('asCofre'); toast(fuera ? tr('Mochila llena: el objeto se ha deshecho en plumas') : tr('{o}: +{v} % de {s}', { o: tr(E.nombres[o.hueco]), v: o.valor, s: tr(E.stats[o.stat]) }), true); asPantallaTienda(); };
  $('#as-t-ad').onclick = () => asAnuncio(() => { SAVE.plumas += 20; asGuarda(); play('asCofre'); asPantallaTienda(); });
  $('#as-t-ok').onclick = () => { play('select'); asCierraModal(); asMenu(); };
}
