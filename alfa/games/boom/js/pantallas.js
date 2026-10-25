// Fans of Boom · PANTALLAS: lo que va en HTML encima del lienzo. La portada, preparar la partida (modo, plazas, mapa), el cartel de
// «Le toca a…» del hot seat, la pausa, las opciones y el final.
'use strict';
const PANT = (() => {
  const ui = () => $('#bm-ui'), modal = () => $('#bm-modal');
  const NIVELES = ['FÁCIL', 'NORMAL', 'DIFÍCIL'];
  const PREP = Object.assign({ modo: '1v1', mapa: 'oficina', slots: [] }, SAVE.ultima || {});
  const asegura = () => {   // una plaza por jugador del modo; las que faltan son personas, salvo la segunda del 1 contra 1, que arranca como IA
    const n = BOOM.modos[PREP.modo].equipos.length;
    for (let i = 0; i < n; i++) if (!PREP.slots[i]) PREP.slots[i] = { ia: i === 1, nivel: 1, nombre: '', movil: BOOM.moviles[i % BOOM.moviles.length].id };
    for (const s of PREP.slots) if (!s.movil || !BOOM.moviles.some(d => d.id === s.movil)) s.movil = BOOM.moviles[0].id;
    PREP.slots.length = Math.max(PREP.slots.length, n);
  };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let escena = 'portada';

  // partida con rango: una persona contra una IA en 1 contra 1 (la IA se ajusta al rango)
  const conRango = () => { const s = PREP.slots; return PREP.modo === '1v1' && s[0] && s[1] && s[0].ia !== s[1].ia; };
  const insignia = () => `<span class="bm-rango"><b>${tr(RANGO.nombre(RANGO.puntos()))}</b> · ${RANGO.puntos()}</span>`;
  function cierraTodo() { for (const id of ['#bm-portada', '#bm-prepara', '#bm-cartel', '#bm-modal', '#bm-pausa']) $(id).hidden = true; }
  function portada() {
    escena = 'portada'; cierraTodo(); PARTIDA.parar(); $('#bm-pausa').hidden = true;
    $('#bm-portada').hidden = false; $('#bm-rg').innerHTML = insignia();
  }
  function prepara() {
    escena = 'prepara'; cierraTodo(); asegura();
    const E = BOOM.equipos, equipos = BOOM.modos[PREP.modo].equipos;
    const filas = PREP.slots.slice(0, equipos.length).map((s, i) => `
      <div class="bm-slot" style="--eq:${E[equipos[i]].color}">
        <span class="bm-punto"></span>
        <input class="bm-nombre" data-i="${i}" maxlength="12" value="${esc(s.nombre)}" placeholder="${tr('Jugador {n}', { n: i + 1 })}" ${s.ia ? 'disabled' : ''}>
        <button class="bm-chip" data-ia="${i}">${tr(s.ia ? 'IA' : 'PERSONA')}</button>
        <button class="bm-chip bm-ayuda${s.facil ? ' bm-on' : ''}" data-facil="${i}" ${s.ia ? 'style="visibility:hidden"' : ''} title="${tr('Ayuda fácil: ves por dónde iría el tiro sin viento')}">${tr(s.facil ? 'FÁCIL' : 'SIN AYUDA')}</button>
        <button class="bm-chip bm-movil" data-movil="${i}" style="--c1:${BOOM.moviles.find(d => d.id === s.movil).colores[0]}">${esc(tr(BOOM.moviles.find(d => d.id === s.movil).nombre))}</button>
        <button class="bm-chip bm-nivel" data-nivel="${i}" ${s.ia && !(conRango()) ? '' : 'style="visibility:hidden"'}>${tr(NIVELES[s.nivel])}</button>
      </div>`).join('');
    const personas = PREP.slots.slice(0, equipos.length).filter(s => !s.ia).length;
    $('#bm-prepara').innerHTML = `
      <h2 class="bm-h2">${tr('PREPARA LA PARTIDA')}</h2>
      <div class="bm-tabs"><button data-modo="1v1" class="${PREP.modo === '1v1' ? 'bm-on' : ''}">${tr('1 CONTRA 1')}</button><button data-modo="2v2" class="${PREP.modo === '2v2' ? 'bm-on' : ''}">${tr('DOBLES')}</button></div>
      <div class="bm-slots">${filas}</div>
      <div class="bm-mapas">${BOOM.mapas.map(m => `<button data-mapa="${m.id}" class="${PREP.mapa === m.id ? 'bm-on' : ''}" style="--c1:${m.cielo[0]};--c2:${m.roca[0]}"><i></i><span>${tr(m.nombre)}</span></button>`).join('')}</div>
      <p class="bm-nota">${conRango() ? tr('Partida con rango: la IA se ajusta a tu rango y ganas o pierdes puntos.') + ' ' : ''}${personas >= 2 ? tr('Se juega pasándose el aparato: antes de cada turno sale un cartel y el viento no se ve hasta que lo coge quien tira.') : tr('Cada plaza puede ser una persona o la IA.')}</p>
      <div class="bm-fila-b"><button class="bm-btn bm-sec" id="bm-atras">${tr('VOLVER')}</button><button class="bm-btn" id="bm-empezar">${tr('EMPEZAR')}</button></div>`;
    $('#bm-prepara').hidden = false;
    const q = (s, f) => $('#bm-prepara').querySelectorAll(s).forEach(f);
    q('[data-modo]', b => { b.onclick = () => { play('select'); PREP.modo = b.dataset.modo; prepara(); }; });
    q('[data-mapa]', b => { b.onclick = () => { play('select'); PREP.mapa = b.dataset.mapa; prepara(); }; });
    q('[data-ia]', b => { b.onclick = () => { play('select'); const s = PREP.slots[+b.dataset.ia]; s.ia = !s.ia; prepara(); }; });
    q('[data-movil]', b => { b.onclick = () => { play('select'); const s = PREP.slots[+b.dataset.movil]; GARAJE.abre(s.movil, id => { s.movil = id; $('#bm-modal').hidden = true; prepara(); }); }; });
    q('[data-facil]', b => { b.onclick = () => { play('select'); const s = PREP.slots[+b.dataset.facil]; s.facil = !s.facil; prepara(); }; });
    q('[data-nivel]', b => { b.onclick = () => { play('select'); const s = PREP.slots[+b.dataset.nivel]; s.nivel = (s.nivel + 1) % 3; prepara(); }; });
    q('.bm-nombre', inp => { inp.oninput = () => { PREP.slots[+inp.dataset.i].nombre = inp.value.trim().slice(0, 12); }; });
    $('#bm-atras').onclick = () => { play('select'); portada(); };
    $('#bm-empezar').onclick = () => { play('select'); const n = equipos.length; SAVE.ultima = JSON.parse(JSON.stringify({ modo: PREP.modo, mapa: PREP.mapa, slots: PREP.slots })); bmGuarda(); juega(n); };
  }
  function juega(n, semilla) {
    cierraTodo(); escena = 'partida';
    const rango = conRango() && PREP.modo === '1v1';
    PARTIDA.nueva({ modo: PREP.modo, mapa: PREP.mapa, semilla, rango, slots: PREP.slots.slice(0, n).map(s => ({ ia: s.ia, nivel: rango && s.ia ? RANGO.nivelIA() : s.nivel, nombre: s.nombre, movil: s.movil, facil: s.facil })) });
    EFECTOS.reinicia(); const P = PARTIDA.get(); PINTAR.enfoca(P.actual.x, P.actual.y - 100, true);
    $('#bm-pausa').hidden = false; revisa();
  }
  // lo que cambia con la fase de la partida: el cartel de «Le toca a…» y el final
  let ultimaFase = '';
  function revisa() {
    const P = PARTIDA.get(); if (!P || escena !== 'partida') return;
    const clave = P.fase + ':' + (P.actual && P.actual.id) + ':' + P.turnos;
    if (clave === ultimaFase) return; ultimaFase = clave;
    if (P.fase === 'cartel') cartel(P.actual); else if (P.fase === 'fin') fin(P); else $('#bm-cartel').hidden = true;
  }
  function cartel(m) {
    const E = BOOM.equipos[m.equipo];
    $('#bm-cartel').innerHTML = `<div class="bm-tarjeta" style="--eq:${E.color}"><p class="bm-eq">${tr('EQUIPO ' + E.nombre)}</p><h2>${tr('LE TOCA A')}</h2><p class="bm-quien">${esc(m.nombre)}</p>
      <p class="bm-nota">${tr('Pásale el aparato. El viento no se ve hasta que lo coja.')}</p><button class="bm-btn" id="bm-listo">${tr('LISTO')}</button></div>`;
    $('#bm-cartel').hidden = false; $('#bm-listo').onclick = () => { play('select'); $('#bm-cartel').hidden = true; PARTIDA.listo(); };
  }
  function fin(P) {
    let rg = '';
    if (P.cfg.rango && !P.rangoHecho) {   // los puntos se cuentan una sola vez por partida
      P.rangoHecho = true; const hum = P.moviles.find(m => !m.ia), ia = P.moviles.find(m => m.ia);
      P.rangoRes = P.ganador < 0 ? null : RANGO.aplica(P.ganador === hum.equipo, ia.nivel);
    }
    if (P.rangoRes) { const r = P.rangoRes; rg = `<p class="bm-nota"><b>${r.delta > 0 ? '+' : ''}${r.delta}</b> ${tr('puntos')} · ${insignia()}${r.subio ? ' · <b>' + tr('¡Subes de rango!') + '</b>' : ''}</p>`; }
    const E = BOOM.equipos, g = P.ganador, nombres = P.moviles.filter(m => m.equipo === g).map(m => esc(m.nombre)).join(' y ');
    $('#bm-modal').innerHTML = `<div class="bm-tarjeta" style="--eq:${g < 0 ? '#cdb9ea' : E[g].color}"><h2>${g < 0 ? tr('EMPATE') : tr('GANA EL EQUIPO ' + E[g].nombre)}</h2>
      <p class="bm-quien">${g < 0 ? tr('Nadie queda en pie. Phony pide recuento.') : nombres}</p>
      <p class="bm-nota">${tr('Turnos jugados: {n}', { n: P.turnos })}</p>${rg}
      <div class="bm-fila-b"><button class="bm-btn" id="bm-otra">${tr('REVANCHA')}</button><button class="bm-btn bm-sec" id="bm-cambia">${tr('PREPARAR')}</button><button class="bm-btn bm-sec" id="bm-inicio">${tr('SALIR')}</button></div></div>`;
    $('#bm-modal').hidden = false;
    $('#bm-otra').onclick = () => { play('select'); ultimaFase = ''; if (P.entrena) ENTRENO.empieza(P.cfg.slots[0].movil); else juega(P.moviles.length); };
    $('#bm-cambia').onclick = () => { play('select'); if (P.entrena) ENTRENO.abre(); else prepara(); };
    $('#bm-inicio').onclick = () => { play('select'); portada(); };
  }
  function pausa() {
    const P = PARTIDA.get(); if (!P || P.fase === 'fin' || escena !== 'partida') return;
    P.pausa = true;
    $('#bm-modal').innerHTML = `<div class="bm-tarjeta"><h2>${tr('PAUSA')}</h2><p class="bm-nota">${tr('Microblizz también para a tomar café. Diez minutos. Sin cobrar.')}</p>
      <div class="bm-col"><button class="bm-btn" id="bm-seguir">${tr('SEGUIR')}</button><button class="bm-btn bm-sec" id="bm-opc">${tr('OPCIONES')}</button><button class="bm-btn bm-sec" id="bm-salir">${tr('ABANDONAR')}</button></div></div>`;
    $('#bm-modal').hidden = false;
    $('#bm-seguir').onclick = () => { play('select'); $('#bm-modal').hidden = true; P.pausa = false; };
    $('#bm-opc').onclick = () => { play('select'); opciones(pausa); };
    $('#bm-salir').onclick = () => { play('select'); confirmBox(tr('¿ABANDONAR LA PARTIDA?'), tr('Se pierde la partida en curso.'), tr('ABANDONAR'), () => { portada(); }, tr('SEGUIR')); };
  }
  function opciones(volver) {
    const filas = OPCIONES.lista({
      filas: [
        OPCIONES.interruptor(tr('Sonido'), '', () => !SAVE.muted, v => { SAVE.muted = !v; applyVolume(); bmGuarda(); }),
        OPCIONES.interruptor(tr('Control'), tr('Botones: ángulo y potencia a mano. Tirachinas: arrastra hacia atrás desde cualquier punto y suelta.'), () => SAVE.control === 'tirachinas', v => { SAVE.control = v ? 'tirachinas' : 'botones'; bmGuarda(); }, ['TIRACHINAS', 'BOTONES']),
        'idioma', 'cuenta', OPCIONES.novedades(() => novedades(() => opciones(volver))), 'instalar',
      ],
      versionTexto: tr('Fans of Boom · versión ' + VERSION), alCerrar: () => { if (volver) volver(); else { $('#bm-modal').hidden = true; } },
    });
    const t = document.createElement('div'); t.className = 'bm-tarjeta'; const h = document.createElement('h2'); h.textContent = tr('OPCIONES');
    t.append(h, filas.lista, filas.version, filas.cerrar); $('#bm-modal').replaceChildren(t); $('#bm-modal').hidden = false;
  }
  function novedades(volver) {   // las novedades del juego (js/novedades.js), con el mismo texto que la librería
    const lista = l => (l && l.length ? `<ul>${l.map(x => `<li>${tr(x)}</li>`).join('')}</ul>` : '');
    const cuerpo = NEWS.map((n, i) => `<h4>${i ? tr('VERSIÓN') + ' ' + n.v : tr('LO NUEVO')}</h4>${lista(n.real)}${i ? '' : '<h4>' + tr('NOTAS DE MICROBLIZZ Y PHONY') + '</h4>'}${lista(n.joke)}`).join('');
    $('#bm-modal').innerHTML = `<div class="bm-tarjeta bm-news"><h2>${tr('NOVEDADES')} · ${NEWS[0].v}</h2><div class="bm-news-txt">${cuerpo}</div><button class="bm-btn" id="bm-news-ok">${tr('CERRAR')}</button></div>`;
    $('#bm-modal').hidden = false; $('#bm-news-ok').onclick = () => { play('select'); volver(); };
  }
  function inicia() {
    ui().innerHTML = `
      <section id="bm-portada" class="bm-pantalla"><div class="bm-logo"><span>FANS OF</span><b>BOOM</b></div>
        <p class="bm-lema">${tr('Apunta bien. El viento ya hará el resto.')}</p>
        <div class="bm-col"><button class="bm-btn bm-enorme" id="bm-jugar">${tr('JUGAR')}</button><button class="bm-btn" id="bm-entreno">${tr('ENTRENAMIENTO')}</button><button class="bm-btn bm-sec" id="bm-opciones">${tr('OPCIONES')}</button></div><p id="bm-rg"></p></section>
      <section id="bm-prepara" class="bm-pantalla" hidden></section>
      <button id="bm-pausa" class="bm-pausa" aria-label="${tr('Pausa')}" hidden><svg viewBox="0 0 24 24" width="22" height="22"><path d="M7 4h4v16H7zM13 4h4v16h-4z" fill="#fff" stroke="#20102c" stroke-width="2" stroke-linejoin="round"/></svg></button>
      <div id="bm-panel" hidden></div><div id="bm-objetos" hidden></div>
      <section id="bm-cartel" class="bm-velo" hidden></section>
      <section id="bm-modal" class="bm-velo" hidden></section>`;
    CONTROLES.construye();
    $('#bm-jugar').onclick = () => { audioInit(); play('select'); prepara(); };
    $('#bm-entreno').onclick = () => { audioInit(); play('select'); ENTRENO.abre(); };
    $('#bm-opciones').onclick = () => { audioInit(); play('select'); opciones(() => { $('#bm-modal').hidden = true; }); };
    $('#bm-pausa').onclick = () => { audioInit(); play('select'); pausa(); };
    addEventListener('keydown', e => { if (e.key === 'Escape') { if (!$('#bm-modal').hidden && PARTIDA.get() && PARTIDA.get().pausa) $('#bm-seguir') && $('#bm-seguir').click(); else pausa(); } });
    portada();
  }
  // el Entrenamiento (entreno.js) arranca su partida por aquí, para que la pantalla quede igual que en una normal
  function juegaCon(cfg) {
    cierraTodo(); escena = 'partida'; ultimaFase = '';
    PARTIDA.nueva(cfg); EFECTOS.reinicia(); const P = PARTIDA.get(); PINTAR.enfoca(P.actual.x, P.actual.y - 100, true);
    $('#bm-pausa').hidden = false; revisa();
  }
  return { inicia, revisa, juegaCon, mapa: () => PREP.mapa, movil: () => (PREP.slots[0] || {}).movil, enPartida: () => escena === 'partida' };
})();
