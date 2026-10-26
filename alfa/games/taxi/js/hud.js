// Fans Of Taxi · HUD: lo que se escribe encima del 3D: dinero y combo, el reloj del turno o del evento, el pasajero que llevas, la búsqueda
// (llamas dibujadas, nada de emojis), el nitro, la radio de Lola (frases que ayudan o distraen), los avisos de propina, el velocímetro
// con la altitud, el minimapa (MAPA), el medidor de fluidez (fps, llamadas de dibujo, trozos cargados) y los botones del móvil. Todo el
// texto pasa por tr().
'use strict';
const HUD = (() => {
  const $ = id => document.getElementById(id);
  let avisos = [], radioT = 0, fpsMuestras = [], ultimoFps = 0;
  function montar() {
    $('capa').innerHTML = `
      <div id="arriba">
        <div class="caja" id="dinero"><b class="ol" id="dinero-n">0</b><small id="combo"></small></div>
        <div class="caja reloj" id="reloj" hidden><b class="ol" id="reloj-n">60</b><small id="reloj-t"></small></div>
        <div class="caja" id="busqueda"><div id="llamas"></div><small id="busqueda-t"></small></div>
      </div>
      <canvas id="mapa" width="150" height="150"></canvas>
      <div id="pasajero" class="caja" hidden><i id="pas-color"></i><div><b id="pas-nombre"></b><small id="pas-dest"></small></div></div>
      <div id="radio" hidden><i>LOLA</i><span id="radio-t"></span></div>
      <div id="avisos"></div>
      <div id="centro" hidden></div>
      <div id="abajo">
        <div id="medidor" title=""><b id="fps">60</b><small id="dibujo"></small></div>
        <div id="velo"><b class="ol" id="velo-n">0</b><small>km/h · <span id="alt">0</span> m</small><div id="nitro"><i></i></div></div>
      </div>
      <div id="mandos" class="${CONTROLES.tactil || 'ontouchstart' in window ? '' : 'oculto'}">
        <div class="lado"><button id="b-izq" class="ol" aria-label="${tr('Izquierda')}">◀</button><button id="b-der" class="ol" aria-label="${tr('Derecha')}">▶</button></div>
        <div class="lado"><button id="b-nitro" class="ol">${tr('NITRO')}</button><button id="b-freno" class="ol">${tr('FRENO')}</button><button id="b-gas" class="ol">${tr('GAS')}</button></div>
      </div>
      <button id="b-accion" class="ol" hidden></button>`;
    pintaLlamas(0); MAPA.montar($('mapa'));
  }
  // las llamas de la búsqueda, dibujadas en canvas con el contorno de la serie
  function pintaLlamas(nivel, teVen) {
    const max = TAXI.policia.porNivel.length - 1, cont = $('llamas'); cont.innerHTML = '';
    for (let i = 1; i <= max; i++) {
      const c = document.createElement('canvas'); c.width = c.height = 28; const g = c.getContext('2d');
      g.lineWidth = 3; g.strokeStyle = '#20102c'; g.fillStyle = i <= nivel ? (teVen ? '#ff4b5c' : '#ff7a1a') : '#3e2363';
      g.beginPath(); g.moveTo(14, 3); g.quadraticCurveTo(24, 12, 20, 20); g.quadraticCurveTo(18, 25, 14, 25); g.quadraticCurveTo(6, 25, 7, 17); g.quadraticCurveTo(8, 12, 11, 10); g.quadraticCurveTo(10, 14, 13, 14); g.quadraticCurveTo(15, 10, 14, 3); g.closePath(); g.fill(); g.stroke();
      if (i <= nivel) { g.fillStyle = '#ffcb3d'; g.beginPath(); g.moveTo(14, 13); g.quadraticCurveTo(18, 17, 16, 21); g.quadraticCurveTo(12, 22, 12, 18); g.closePath(); g.fill(); }
      cont.appendChild(c);
    }
  }
  function aviso(texto, clase = '') { const el = document.createElement('div'); el.className = 'aviso ol ' + clase; el.textContent = texto; $('avisos').prepend(el); avisos.push(el); setTimeout(() => el.classList.add('fuera'), 1400); setTimeout(() => el.remove(), 1900); while (avisos.length > 4) avisos.shift().remove(); }
  function radio(texto, segundos = 4) { $('radio').hidden = false; $('radio-t').textContent = texto; radioT = segundos; }
  function centro(html) { const el = $('centro'); el.hidden = !html; el.innerHTML = html || ''; }
  function accion(texto) { const b = $('b-accion'); b.hidden = !texto; if (texto) b.textContent = texto; }
  let nivelPintado = -1, teVenPintado = null;
  function pinta(estado, dt) {
    const ev = estado.eventos, pol = estado.policia, j = estado.jugador;
    $('dinero-n').textContent = fmt(ev.dinero) + ' €';
    $('combo').textContent = ev.combo > 1 ? 'x' + ev.combo + ' ' + tr('combo') : (ev.activo ? tr('ganado') + ' ' + fmt(ev.ganado) : '');
    const r = $('reloj'); r.hidden = !ev.activo;
    if (ev.activo) {
      const a = ev.activo; let n = '', t = '';
      if (a.tipo === 'turno') { n = Math.ceil(a.reloj); t = tr('TURNO') + ' · ' + a.viajes + ' ' + tr('viajes'); r.classList.toggle('poco', a.reloj < 10); }
      else if (a.tipo === 'sprint') { n = a.cuenta > 0 ? Math.ceil(a.cuenta) : a.t.toFixed(1); t = tr('PUESTO') + ' ' + (a.puesto || 1) + '/' + (TAXI.eventos.sprint.rivales + 1); }
      else if (a.tipo === 'huida') { n = Math.ceil(a.t); t = tr('HUIDA'); }
      $('reloj-n').textContent = n; $('reloj-t').textContent = t;
    }
    if (pol.nivel !== nivelPintado || pol.teVen !== teVenPintado) { pintaLlamas(pol.nivel, pol.teVen); nivelPintado = pol.nivel; teVenPintado = pol.teVen; }
    $('busqueda-t').textContent = pol.nivel > 0 ? (pol.teVen ? tr('TE VEN') : tr('escapando') + ' ' + Math.max(0, Math.ceil(pol.enfriar - pol.enfriando))) : '';
    const p = estado.pasajero; $('pasajero').hidden = !p;
    if (p) { $('pas-color').style.background = '#' + p.tramo.color.toString(16).padStart(6, '0'); $('pas-nombre').textContent = tr(p.tipo.nombre); const q = Math.max(0, p.paciencia - p.viaje); $('pas-dest').textContent = tr('paciencia') + ' ' + Math.ceil(q) + ' s · ' + Math.round(p.distancia) + ' m'; }
    $('velo-n').textContent = Math.round(Math.abs(j.v) * 3.6); $('alt').textContent = Math.round(j.y);
    MAPA.pinta(estado); $('nitro').firstElementChild.style.width = (j.nitro * 100) + '%'; $('nitro').classList.toggle('usando', !!j.usandoNitro);
    if (radioT > 0) { radioT -= dt; if (radioT <= 0) $('radio').hidden = true; }
    // fluidez
    fpsMuestras.push(dt); if (fpsMuestras.length > 40) fpsMuestras.shift();
    ultimoFps += dt; if (ultimoFps > 0.5) { ultimoFps = 0; const f = fpsMuestras.length / fpsMuestras.reduce((a, b) => a + b, 0); $('fps').textContent = Math.round(f); $('medidor').className = f >= 50 ? 'bien' : f >= 28 ? 'justo' : 'mal'; const i = ESCENA.info(), tz = TROZOS.estado(); $('dibujo').textContent = i.calls + ' ' + tr('dibujos') + ' · ' + (i.tris / 1000).toFixed(0) + 'k · ' + tz.cargados + ' ' + tr('trozos'); }
  }
  return { montar, pinta, aviso, radio, centro, accion };
})();
