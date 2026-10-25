// Fans of Cooking · PANTALLAS: lo que va en HTML encima del lienzo: la portada, la campaña (rangos y niveles), preparar la partida (solo o dobles,
// cocineros), la pausa, el final del nivel, las opciones y las novedades. Todo se maneja también con el teclado (flechas, INTRO, ESC).
'use strict';
const PANT = (() => {
  const ui = () => $('#ck-ui');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let escena = 'portada', rangoSel = 0, nivelSel = null, foco = 0;
  const PREP = { modo: SAVE.modo || 'solo', cocineros: SAVE.cocineros.slice(), nombres: SAVE.nombres.slice() };
  const estrellasHtml = (n, max = 3) => `<span class="ck-estrellas">${'<i class="on"></i>'.repeat(n)}${'<i></i>'.repeat(max - n)}</span>`;
  function cierraTodo() { for (const id of ['#ck-portada', '#ck-campana', '#ck-prepara', '#ck-modal', '#ck-pausa']) $(id).hidden = true; CONTROLES.activar(false); }

  /* ---------- el teclado en las pantallas: flechas para moverse entre botones, INTRO para pulsar, ESC para volver ---------- */
  function botones() { const raiz = !$('#ck-modal').hidden ? $('#ck-modal') : !$('#ck-prepara').hidden ? $('#ck-prepara') : !$('#ck-campana').hidden ? $('#ck-campana') : $('#ck-portada'); return [...raiz.querySelectorAll('button:not([disabled]), input')].filter(b => b.offsetParent !== null); }
  function enfoca(i) { const bs = botones(); if (!bs.length) return; foco = ((i % bs.length) + bs.length) % bs.length; bs.forEach((b, k) => b.classList.toggle('ck-foco', k === foco)); bs[foco].focus({ preventScroll: true }); }
  addEventListener('keydown', e => {
    if (escena === 'partida' && $('#ck-modal').hidden) return;
    const bs = botones(); if (!bs.length) return;
    const act = document.activeElement, enInput = act && act.tagName === 'INPUT';
    if (e.key === 'Escape') { const atras = (!$('#ck-modal').hidden ? $('#ck-modal') : ui()).querySelector('[data-atras]'); if (atras && atras.offsetParent !== null) { e.preventDefault(); atras.click(); } return; }
    if (enInput && e.key !== 'ArrowUp' && e.key !== 'ArrowDown' && e.key !== 'Tab') return;
    const i = Math.max(0, bs.indexOf(act));
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey)) { e.preventDefault(); enfoca(i + 1); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) { e.preventDefault(); enfoca(i - 1); }
    else if (e.key === 'Enter' || e.key === ' ') { if (act && act.tagName === 'BUTTON') { e.preventDefault(); act.click(); } }
  });
  const prepFoco = sel => { const b = sel ? ui().querySelector(sel) : null; const bs = botones(); enfoca(b ? Math.max(0, bs.indexOf(b)) : 0); };

  /* ---------- portada ---------- */
  function portada() {
    escena = 'portada'; cierraTodo(); PARTIDA.parar(); $('#ck-portada').hidden = false;
    $('#ck-total').innerHTML = `${tr('Estrellas')}: <b>${estrellasTotal()}</b> / ${RANGOS.reduce((s, r) => s + r.niveles.length * 3, 0)}`;
    if (typeof musicSet === 'function') musicSet('menu'); prepFoco('#ck-jugar');
  }
  /* ---------- la campaña: los rangos y sus niveles ---------- */
  function campana(ri) {
    escena = 'campana'; cierraTodo(); if (ri !== undefined) rangoSel = ri;
    const R = RANGOS[rangoSel], abierto = r => nivelAbierto(r.niveles[0]);
    $('#ck-campana').innerHTML = `
      <h2 class="ck-h2">${tr('DE BECARIO A CEO')}</h2>
      <div class="ck-rangos">${RANGOS.map((r, i) => `<button class="ck-rango ${i === rangoSel ? 'ck-on' : ''} ${abierto(r) ? '' : 'ck-cerrado'}" data-rango="${i}" style="--c:${r.color}" ${abierto(r) ? '' : 'disabled'}>
        <canvas class="ck-jefe" data-jefe="${r.jefe}" width="64" height="64"></canvas><b>${tr(r.nombre)}</b><small>${estrellasRango(i)} / ${r.niveles.length * 3}</small></button>`).join('')}</div>
      <div class="ck-rango-info" style="--c:${R.color}"><h3>${tr(R.cocina)}</h3><p class="ck-nota">${tr(R.historia)}</p></div>
      <div class="ck-niveles">${R.niveles.map(n => { const ab = nivelAbierto(n), g = SAVE.niveles[n.id]; return `<button class="ck-nivel ${ab ? '' : 'ck-cerrado'}" data-nivel="${n.id}" ${ab ? '' : 'disabled'}>
        <span class="ck-nid">${n.id}</span><b>${tr(n.nombre)}</b><small>${n.recetas.map(id => tr(RECETA[id].nombre)).join(' · ')}</small>${estrellasHtml(estrellasDe(n.id))}${g && g.p ? `<em>${tr('Mejor')}: ${g.p}</em>` : ''}</button>`; }).join('')}</div>
      <p class="ck-nota">${tr('Un nivel se abre con una estrella en el anterior; un rango nuevo, con la mitad de las estrellas del anterior.')}</p>
      <div class="ck-fila-b"><button class="ck-btn ck-sec" data-atras id="ck-volver">${tr('VOLVER')}</button></div>`;
    $('#ck-campana').hidden = false;
    $('#ck-campana').querySelectorAll('[data-rango]').forEach(b => { b.onclick = () => { play('select'); campana(+b.dataset.rango); }; });
    $('#ck-campana').querySelectorAll('[data-nivel]').forEach(b => { b.onclick = () => { play('select'); nivelSel = NIVEL(b.dataset.nivel); prepara(); }; });
    $('#ck-volver').onclick = () => { play('select'); portada(); };
    $('#ck-campana').querySelectorAll('canvas[data-jefe]').forEach(cv => retratoJefe(cv, cv.dataset.jefe));
    prepFoco(`[data-nivel="${(R.niveles.find(n => nivelAbierto(n) && estrellasDe(n.id) === 0) || R.niveles[0]).id}"]`);
  }
  function retratoJefe(cv, key) {
    const sp = SPR[key]; if (!sp) return; const c = cv.getContext('2d'); c.clearRect(0, 0, 64, 64);
    const esc = Math.min(56 / sp.wd, 58 / sp.ht); c.save(); c.translate(32, 60); c.scale(esc, esc); c.drawImage(sp.c, -sp.ax, -sp.ay, sp.wd, sp.ht); c.restore();
  }
  function retratoCocinero(cv, key) {
    const sp = SPR[key]; if (!sp) return; const c = cv.getContext('2d'); c.clearRect(0, 0, cv.width, cv.height);
    const esc = Math.min((cv.width - 8) / sp.wd, (cv.height - 8) / sp.ht); c.save(); c.translate(cv.width / 2, cv.height - 4); c.scale(esc, esc); c.drawImage(sp.c, -sp.ax, -sp.ay, sp.wd, sp.ht); c.restore();
  }
  /* ---------- preparar: solo o dobles, los cocineros ---------- */
  function prepara() {
    escena = 'prepara'; cierraTodo(); const N = nivelSel, R = RANGOS[N.ri];
    const abiertos = COOK.cocineros.filter(cocineroAbierto);
    for (let i = 0; i < 2; i++) if (!abiertos.some(c => c.key === PREP.cocineros[i])) PREP.cocineros[i] = abiertos[i % abiertos.length].key;
    const fila = i => { const c = COOK.cocineros.find(k => k.key === PREP.cocineros[i]); return `
      <div class="ck-slot" style="--eq:${COOK.colores[i ? 'j2' : 'j1']}"><span class="ck-punto"></span>
        <canvas class="ck-cara" data-cara="${c.key}" width="72" height="72"></canvas>
        <div class="ck-slot-col"><input class="ck-nombre" data-i="${i}" maxlength="12" value="${esc(PREP.nombres[i])}" placeholder="${tr(i ? 'Jugador 2' : 'Jugador 1')}">
        <button class="ck-chip" data-coc="${i}">${esc(c.nombre)} ▸</button></div>
        <small class="ck-teclas">${PREP.modo === 'dobles' ? (i ? tr('Flechas · INTRO coge · MAYÚS derecha usa') : tr('WASD · ESPACIO coge · Q usa')) : (i ? tr('Se cambia con TAB') : tr('WASD o flechas · ESPACIO coge · Q usa · TAB cambia de cocinero'))}</small></div>`; };
    $('#ck-prepara').innerHTML = `
      <h2 class="ck-h2">${tr(N.nombre)} <small>${N.id} · ${tr(R.cocina)}</small></h2>
      <div class="ck-tabs"><button data-modo="solo" class="${PREP.modo === 'solo' ? 'ck-on' : ''}">${tr('EN SOLITARIO')}</button><button data-modo="dobles" class="${PREP.modo === 'dobles' ? 'ck-on' : ''}">${tr('A DOBLES')}</button></div>
      <div class="ck-slots">${fila(0)}${fila(1)}</div>
      <div class="ck-recetas">${N.recetas.map(id => { const r = RECETA[id]; return `<div class="ck-receta"><canvas data-receta="${id}" width="110" height="40"></canvas><b>${tr(r.nombre)}</b><small>${r.olla ? tr('OLLA') + ': ' + r.olla.map(i => tr(INGREDIENTES[i].nombre)).join(' + ') : r.horno ? tr('MONTAR Y AL HORNO') : r.ings.map(([i, e]) => tr(INGREDIENTES[i].nombre) + (e === 'cortado' ? ' (' + tr('cortado') + ')' : e === 'cocinado' ? ' (' + tr('a la sartén') + ')' : '')).join(' + ')}</small></div>`; }).join('')}</div>
      <p class="ck-nota">${tr('Tiempo: {t} s · Estrellas con {a}, {b} y {c} puntos.', { t: N.tiempo, a: N.estrellas[0], b: N.estrellas[1], c: N.estrellas[2] })} ${PREP.modo === 'solo' ? tr('En solitario llevas a los dos: el que dejas sigue cortando o lavando hasta terminar.') : tr('Dos personas en el mismo teclado, cada una con sus teclas.')}</p>
      <div class="ck-fila-b"><button class="ck-btn ck-sec" data-atras id="ck-atras">${tr('VOLVER')}</button><button class="ck-btn" id="ck-empezar">${tr('A COCINAR')}</button></div>`;
    $('#ck-prepara').hidden = false;
    const q = (s, f) => $('#ck-prepara').querySelectorAll(s).forEach(f);
    q('[data-modo]', b => { b.onclick = () => { play('select'); PREP.modo = b.dataset.modo; prepara(); }; });
    q('[data-coc]', b => { b.onclick = () => { play('select'); const i = +b.dataset.coc, k = abiertos.findIndex(c => c.key === PREP.cocineros[i]); let s = abiertos[(k + 1) % abiertos.length].key; if (s === PREP.cocineros[1 - i] && abiertos.length > 2) s = abiertos[(k + 2) % abiertos.length].key; PREP.cocineros[i] = s; prepara(); prepFoco(`[data-coc="${i}"]`); }; });
    q('.ck-nombre', inp => { inp.oninput = () => { PREP.nombres[+inp.dataset.i] = inp.value.trim().slice(0, 12); }; });
    q('canvas[data-cara]', cv => retratoCocinero(cv, cv.dataset.cara));
    q('canvas[data-receta]', cv => { const c = cv.getContext('2d'), fin = recetaFinal(RECETA[cv.dataset.receta]); fin.forEach(([ing, est], i) => PINTAR.ingrediente(c, ing, est, 55 + (i - (fin.length - 1) / 2) * 26, 22, 0.7)); });
    $('#ck-atras').onclick = () => { play('select'); campana(); };
    $('#ck-empezar').onclick = () => { play('go'); SAVE.modo = PREP.modo; SAVE.cocineros = PREP.cocineros.slice(); SAVE.nombres = PREP.nombres.slice(); ckGuarda(); juega(); };
    prepFoco('#ck-empezar');
  }
  function juega() {
    cierraTodo(); escena = 'partida'; CONTROLES.activar(true); HUD.limpia();
    const cocs = PREP.cocineros.map((key, i) => ({ key, nombre: PREP.nombres[i] || COOK.cocineros.find(c => c.key === key).nombre }));
    PARTIDA.nueva({ nivel: nivelSel, modo: PREP.modo, cocineros: cocs });
    if (typeof musicSet === 'function') musicSet(TRACKS[RANGOS[nivelSel.ri].fac] ? RANGOS[nivelSel.ri].fac : 'animales');
    $('#ck-pausa').hidden = false; ultimaFase = ''; revisa();
  }
  let ultimaFase = '';
  function revisa() {
    const P = PARTIDA.get(); if (!P || escena !== 'partida') return;
    if (P.fase === ultimaFase) return; ultimaFase = P.fase;
    if (P.fase === 'fin') fin(P);
  }
  function fin(P) {
    const N = P.nivel, antes = estrellasTotal(); apuntaResultado(N.id, P.puntos, P.estrellas);
    const nuevos = COOK.cocineros.filter(c => c.estrellas > antes && c.estrellas <= estrellasTotal());
    const sig = (() => { const r = RANGOS[N.ri]; if (N.ni + 1 < r.niveles.length) return r.niveles[N.ni + 1]; return RANGOS[N.ri + 1] ? RANGOS[N.ri + 1].niveles[0] : null; })();
    const frases = P.estrellas === 3 ? ['El CEO ha dicho «aceptable». Es lo más bonito que ha dicho nunca.', 'Microblizz estudia cobrarte por usar la sartén.'] : P.estrellas ? ['Nadie ha llamado a sanidad. Hoy no.', 'Phony quiere vender la receta como DLC.'] : ['Los becarios han pedido pizza por teléfono.', 'IAhorro propone cerrar la cafetería para ahorrar.'];
    CONTROLES.activar(false); if (typeof musicSet === 'function') musicSet(P.estrellas ? 'win' : 'lose');
    $('#ck-modal').innerHTML = `<div class="ck-tarjeta" style="--eq:${P.rango.color}"><p class="ck-eq">${tr(P.rango.cocina)}</p><h2>${P.estrellas ? tr('¡SERVICIO TERMINADO!') : tr('SIN ESTRELLAS')}</h2>
      ${estrellasHtml(P.estrellas)}<p class="ck-quien">${P.puntos} <small>${tr('puntos')}</small></p>
      <p class="ck-nota">${tr('Platos servidos: {s} · Clientes que se fueron: {c}', { s: P.servidos, c: P.caducados })}</p>
      <p class="ck-nota ck-chiste">${tr(pick(frases))}</p>
      ${nuevos.length ? `<p class="ck-nota ck-nuevo">${tr('¡Cocinero nuevo!')} <b>${nuevos.map(c => c.nombre).join(', ')}</b></p>` : ''}
      <div class="ck-fila-b"><button class="ck-btn" id="ck-otra">${tr('REPETIR')}</button>${sig && nivelAbierto(sig) ? `<button class="ck-btn" id="ck-sig">${tr('SIGUIENTE')}</button>` : ''}<button class="ck-btn ck-sec" data-atras id="ck-camp">${tr('CAMPAÑA')}</button></div></div>`;
    $('#ck-modal').hidden = false; $('#ck-pausa').hidden = true;
    $('#ck-otra').onclick = () => { play('select'); juega(); };
    if ($('#ck-sig')) $('#ck-sig').onclick = () => { play('select'); nivelSel = sig; prepara(); };
    $('#ck-camp').onclick = () => { play('select'); PARTIDA.parar(); campana(nivelSel.ri); };
    prepFoco(sig && nivelAbierto(sig) ? '#ck-sig' : '#ck-otra');
  }
  function pausa() {
    const P = PARTIDA.get(); if (!P || P.fase === 'fin' || escena !== 'partida') return;
    P.pausa = true; CONTROLES.activar(false);
    $('#ck-modal').innerHTML = `<div class="ck-tarjeta"><h2>${tr('PAUSA')}</h2><p class="ck-nota">${tr('Microblizz también para a tomar café. Diez minutos. Sin cobrar.')}</p>
      <div class="ck-col"><button class="ck-btn" data-atras id="ck-seguir">${tr('SEGUIR')}</button><button class="ck-btn ck-sec" id="ck-reinicia">${tr('REINICIAR')}</button><button class="ck-btn ck-sec" id="ck-opc">${tr('OPCIONES')}</button><button class="ck-btn ck-sec" id="ck-salir">${tr('ABANDONAR')}</button></div></div>`;
    $('#ck-modal').hidden = false;
    $('#ck-seguir').onclick = () => { play('select'); $('#ck-modal').hidden = true; P.pausa = false; CONTROLES.activar(true); };
    $('#ck-reinicia').onclick = () => { play('select'); $('#ck-modal').hidden = true; juega(); };
    $('#ck-opc').onclick = () => { play('select'); opciones(pausa); };
    $('#ck-salir').onclick = () => { play('select'); confirmBox(tr('¿ABANDONAR LA PARTIDA?'), tr('Se pierde el servicio en curso.'), tr('ABANDONAR'), () => { $('#ck-modal').hidden = true; PARTIDA.parar(); campana(nivelSel.ri); }, tr('SEGUIR')); };
    prepFoco('#ck-seguir');
  }
  function opciones(volver) {
    const filas = OPCIONES.lista({
      filas: [
        OPCIONES.interruptor(tr('Sonido'), '', () => !SAVE.muted, v => { SAVE.muted = !v; applyVolume(); ckGuarda(); }),
        OPCIONES.interruptor(tr('Música'), '', () => SAVE.musica !== false, v => { SAVE.musica = v; applyVolume(); ckGuarda(); }),
        'idioma', 'cuenta', OPCIONES.novedades(() => novedades(() => opciones(volver))), 'instalar',
      ],
      versionTexto: tr('Fans of Cooking · versión ' + VERSION), alCerrar: () => { if (volver) volver(); else { $('#ck-modal').hidden = true; prepFoco('#ck-jugar'); } },
    });
    const t = document.createElement('div'); t.className = 'ck-tarjeta'; const h = document.createElement('h2'); h.textContent = tr('OPCIONES');
    filas.cerrar.setAttribute('data-atras', ''); t.append(h, filas.lista, filas.version, filas.cerrar); $('#ck-modal').replaceChildren(t); $('#ck-modal').hidden = false; enfoca(0);
  }
  function novedades(volver) {
    const lista = l => (l && l.length ? `<ul>${l.map(x => `<li>${tr(x)}</li>`).join('')}</ul>` : '');
    const cuerpo = NEWS.map((n, i) => `<h4>${i ? tr('VERSIÓN') + ' ' + n.v : tr('LO NUEVO')}</h4>${lista(n.real)}${i ? '' : '<h4>' + tr('NOTAS DE MICROBLIZZ Y PHONY') + '</h4>'}${lista(n.joke)}`).join('');
    $('#ck-modal').innerHTML = `<div class="ck-tarjeta ck-news"><h2>${tr('NOVEDADES')} · ${NEWS[0].v}</h2><div class="ck-news-txt">${cuerpo}</div><button class="ck-btn" data-atras id="ck-news-ok">${tr('CERRAR')}</button></div>`;
    $('#ck-modal').hidden = false; $('#ck-news-ok').onclick = () => { play('select'); volver(); }; enfoca(0);
  }
  function inicia() {
    ui().innerHTML = `
      <section id="ck-portada" class="ck-pantalla"><div class="ck-logo"><span>FANS OF</span><b>COOKING</b></div>
        <p class="ck-lema">${tr('Dos cocineros, un teclado y los becarios con hambre.')}</p>
        <div class="ck-col"><button class="ck-btn ck-enorme" id="ck-jugar">${tr('JUGAR')}</button><button class="ck-btn ck-sec" id="ck-opciones">${tr('OPCIONES')}</button></div><p id="ck-total" class="ck-nota"></p></section>
      <section id="ck-campana" class="ck-pantalla" hidden></section>
      <section id="ck-prepara" class="ck-pantalla" hidden></section>
      <button id="ck-pausa" class="ck-pausa" aria-label="${tr('Pausa')}" hidden><svg viewBox="0 0 24 24" width="22" height="22"><path d="M7 4h4v16H7zM13 4h4v16h-4z" fill="#fff" stroke="#20102c" stroke-width="2" stroke-linejoin="round"/></svg></button>
      <section id="ck-modal" class="ck-velo" hidden></section>`;
    $('#ck-jugar').onclick = () => { audioInit(); play('select'); campana(); };
    $('#ck-opciones').onclick = () => { audioInit(); play('select'); opciones(null); };
    $('#ck-pausa').onclick = () => { audioInit(); play('select'); pausa(); };
    if (typeof buildSprites === 'function' && !SPR.bunny) buildSprites();
    portada();
  }
  return { inicia, revisa, pausa, enPartida: () => escena === 'partida' };
})();
