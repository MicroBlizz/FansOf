// Fans of Boom · CONTROLES: los dos modos de apuntar. Botones (mover, grados, barra de potencia, tiro, ¡BOOM!) y teclado, o tirachinas por
// arrastre sobre el lienzo (se tira hacia atrás y se suelta). Los dos usan la misma física y las mismas acciones de PARTIDA.
'use strict';
const CONTROLES = (() => {
  const $p = () => $('#bm-panel');
  const mantenido = {};   // nombre -> segundos que lleva pulsado (para repetir más rápido cuanto más tiempo)
  const teclas = new Set();
  let arrastre = null;
  const TECLAS = { ArrowLeft: 'izq', a: 'izq', A: 'izq', ArrowRight: 'der', d: 'der', D: 'der', ArrowUp: 'aMas', w: 'aMas', W: 'aMas', ArrowDown: 'aMenos', s: 'aMenos', S: 'aMenos', q: 'pMenos', Q: 'pMenos', e: 'pMas', E: 'pMas' };
  const flecha = d => `<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="${d > 0 ? 'M8 4l9 8-9 8z' : 'M16 4l-9 8 9 8z'}" fill="#fff" stroke="#20102c" stroke-width="2.4" stroke-linejoin="round"/></svg>`;

  function construye() {
    $p().innerHTML = `
      <div class="bm-grupo bm-mueve"><div class="bm-fila"><button class="bm-rd" data-m="izq" aria-label="${tr('Mover a la izquierda')}">${flecha(-1)}</button><button class="bm-rd" data-m="der" aria-label="${tr('Mover a la derecha')}">${flecha(1)}</button></div>
        <div class="bm-energia" title="${tr('Camino que te queda')}"><i id="bm-en"></i></div></div>
      <div class="bm-grupo"><span class="bm-et">${tr('ÁNGULO')}</span><div class="bm-fila"><button class="bm-mini" data-m="aMenos">−</button><b id="bm-ang" class="bm-num">45°</b><button class="bm-mini" data-m="aMas">+</button></div></div>
      <div class="bm-grupo bm-gpot"><span class="bm-et">${tr('POTENCIA')} <b id="bm-potn">55</b></span><div id="bm-barra"><i id="bm-pot"></i></div></div>
      <div class="bm-grupo bm-tiros"><button class="bm-tiro" data-t="0">${tr('TIRO 1')}</button><button class="bm-tiro" data-t="1">${tr('TIRO 2')}</button><button class="bm-tiro bm-ss" data-t="2">SS</button></div>
      <button id="bm-fuego" class="bm-fuego">${tr('¡BOOM!')}</button>`;
    $p().querySelectorAll('[data-m]').forEach(b => {
      b.addEventListener('pointerdown', e => { e.preventDefault(); b.setPointerCapture(e.pointerId); mantenido[b.dataset.m] = 0; toque(b.dataset.m); });
      for (const ev of ['pointerup', 'pointercancel']) b.addEventListener(ev, () => { delete mantenido[b.dataset.m]; });
    });
    $p().querySelectorAll('[data-t]').forEach(b => b.addEventListener('click', () => { PARTIDA.eligeTiro(+b.dataset.t); play('select'); }));
    $('#bm-fuego').addEventListener('click', () => PARTIDA.dispara());
    $('#bm-objetos').addEventListener('click', e => { const b = e.target.closest('[data-o]'); if (b && PARTIDA.get().actual && !PARTIDA.get().actual.ia && PARTIDA.get().fase === 'apunta') { if (PARTIDA.usaObjeto(b.dataset.o)) play('heal'); } });
    const barra = $('#bm-barra'), pon = e => { const r = barra.getBoundingClientRect(); PARTIDA.fija(PARTIDA.get().actual.ang, Math.round(5 + clamp((e.clientX - r.left) / r.width, 0, 1) * 95)); };
    barra.addEventListener('pointerdown', e => { barra.setPointerCapture(e.pointerId); barra.dataset.on = 1; pon(e); });
    barra.addEventListener('pointermove', e => { if (barra.dataset.on) pon(e); });
    for (const ev of ['pointerup', 'pointercancel']) barra.addEventListener(ev, () => { delete barra.dataset.on; });
  }
  function toque(n) {   // el primer toque mueve un solo grado o punto: para afinar
    if (n === 'aMas') PARTIDA.apunta(1, 0); else if (n === 'aMenos') PARTIDA.apunta(-1, 0); else if (n === 'pMas') PARTIDA.apunta(0, 1); else if (n === 'pMenos') PARTIDA.apunta(0, -1);
  }
  // cada fotograma: lo que se mantiene pulsado (botones o teclas)
  function frame(dt) {
    const P = PARTIDA.get(); if (!P) return;
    for (const t of teclas) { if (!(t in mantenido)) { mantenido[t] = 0; toque(t); } }
    for (const n of Object.keys(mantenido)) {
      const t = mantenido[n] += dt, v = t > 1.2 ? 60 : t > 0.3 ? 22 : 0;
      if (n === 'izq' || n === 'der') PARTIDA.mueve(n === 'izq' ? -1 : 1, dt);
      else if (t > 0.3) { const d = v * dt; if (n === 'aMas') PARTIDA.apunta(d, 0); else if (n === 'aMenos') PARTIDA.apunta(-d, 0); else if (n === 'pMas') PARTIDA.apunta(0, d); else if (n === 'pMenos') PARTIDA.apunta(0, -d); }
    }
    const m = P.actual, humano = m && !m.ia && P.fase === 'apunta';
    $p().hidden = !(P.fase === 'apunta' || P.fase === 'vuelo' || P.fase === 'despues') || !m || m.ia;
    $p().classList.toggle('bm-quieto', !humano);
    const ob = $('#bm-objetos'); ob.hidden = $p().hidden || !m || m.ia;
    if (!ob.hidden) {
      const clave = m.id + ':' + m.objetos.join(',') + (m.doble ? 'D' : '') + (m.bungee ? 'B' : '');
      if (ob.dataset.k !== clave) { ob.dataset.k = clave; ob.innerHTML = m.objetos.map(o => `<button class="bm-obj" data-o="${o}" title="${tr(BOOM.objetos.lista[o].nota)}">${tr(BOOM.objetos.lista[o].nombre)}</button>`).join('') + (m.doble ? `<i class="bm-act">${tr('Doble listo')}</i>` : '') + (m.bungee ? `<i class="bm-act">${tr('Bungee puesto')}</i>` : ''); }
      ob.classList.toggle('bm-quieto', !humano);
    }
    if (m) {
      $('#bm-ang').textContent = Math.round(m.ang) + '°'; $('#bm-potn').textContent = Math.round(m.pot);
      $('#bm-pot').style.width = ((m.pot - 5) / 95 * 100) + '%'; $('#bm-en').style.width = (m.energia / BOOM.movil.energia * 100) + '%';
      $p().querySelectorAll('[data-t]').forEach(b => { b.classList.toggle('bm-on', +b.dataset.t === m.tiro); const i = +b.dataset.t; if (i < 2) { b.disabled = !PARTIDA.puedeTiro(m, i); b.title = tr(m.def.tiros[i].nombre); b.textContent = m.def.tiros[i].satelite ? tr('SATÉLITE') + ' ' + P.sat.carga : tr(i ? 'TIRO 2' : 'TIRO 1'); } if (b.dataset.t === '2') { b.disabled = m.caos < BOOM.caos.max; b.title = tr(m.def.tiros[2].nombre); b.textContent = m.caos >= BOOM.caos.max ? 'SS' : Math.floor(m.caos) + '%'; } });
      $p().style.setProperty('--eq', BOOM.equipos[m.equipo].color);
    }
  }

  // ---- teclado ----
  addEventListener('keydown', e => {
    if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
    const P = PARTIDA.get(); if (!P || P.fase !== 'apunta') { if (e.key === 'Enter' && P && P.fase === 'cartel') PARTIDA.listo(); return; }
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); PARTIDA.dispara(); }
    else if (e.key === '1' || e.key === '2' || e.key === '3') PARTIDA.eligeTiro(+e.key - 1);
    else if (TECLAS[e.key]) { e.preventDefault(); teclas.add(TECLAS[e.key]); }
  });
  addEventListener('keyup', e => { const t = TECLAS[e.key]; if (t) { teclas.delete(t); delete mantenido[t]; } });

  // ---- tirachinas: se arrastra hacia atrás desde cualquier punto del mapa y al soltar sale el tiro ----
  const MAX_TIRO = 170, MIN_TIRO = 36;
  function vector() {   // hacia dónde y con qué fuerza saldría el tiro con el arrastre actual
    const ax = arrastre.x0 - arrastre.x1, ay = arrastre.y1 - arrastre.y0, largo = Math.hypot(ax, ay);
    return { dir: ax >= 0 ? 1 : -1, ang: Math.round(clamp(Math.atan2(ay, Math.abs(ax)) * 180 / Math.PI, 0, 90)), pot: Math.round(clamp(largo / MAX_TIRO * 100, 5, 100)), largo };
  }
  function empieza(x, y) {
    const P = PARTIDA.get(); if (SAVE.control !== 'tirachinas' || !P || P.fase !== 'apunta' || P.actual.ia || P.pausa) return false;
    arrastre = { x0: x, y0: y, x1: x, y1: y }; return true;
  }
  function mueve(x, y) { if (!arrastre) return; arrastre.x1 = x; arrastre.y1 = y; const v = vector(); if (v.largo > 8) PARTIDA.fija(v.ang, v.pot, v.dir); }
  function suelta() {
    if (!arrastre) return; const v = vector(); arrastre = null;
    if (v.largo >= MIN_TIRO) { PARTIDA.fija(v.ang, v.pot, v.dir); PARTIDA.dispara(); }
  }
  function pinta(c) {
    if (!arrastre) return; const v = vector();
    c.lineCap = 'round'; c.lineWidth = 7; c.strokeStyle = OL; c.beginPath(); c.moveTo(arrastre.x0, arrastre.y0); c.lineTo(arrastre.x1, arrastre.y1); c.stroke();
    c.lineWidth = 3.5; c.strokeStyle = v.largo >= MIN_TIRO ? '#ffcb3d' : '#cdb9ea'; c.stroke();
    c.fillStyle = '#ffcb3d'; c.strokeStyle = OL; c.lineWidth = 3; c.beginPath(); c.arc(arrastre.x1, arrastre.y1, 10, 0, 6.2832); c.fill(); c.stroke();
    PINTAR_TXT(c, `${v.ang}°  ·  ${v.pot}`, arrastre.x1, arrastre.y1 - 28, 20, '#fff');
  }
  return { construye, frame, empieza, mueve, suelta, pinta };
})();
