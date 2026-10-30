// Fans of Rouflage · EL PANEL DEL TALLER (al pintarte): el medidor de camuflaje, la tinta, la pintura rápida y los botones del taller.
// Antes estaba en interfaz.js; el taller en sí (pincel, cubo, figuras…) está en taller*.js.
'use strict';
function muestraTaller(si) { E('taller').hidden = !si; if (si) refrescaTaller(); refrescaHud(true); }
function pintaMedidor(n) { E('t-camo').textContent = n + ' %'; const b = E('t-barra'); b.style.width = n + '%'; b.style.background = colorCamo(n); }
function refrescaTinta() { const yo = J.yo; if (!yo) return; const n = Math.max(0, Math.ceil(yo.tinta)); ponTexto('tinta', E('t-tinta-n'), String(n)); E('t-tinta-barra').style.width = Math.max(0, yo.tinta / tintaSen(yo) * 100) + '%'; }
// el botón de la pintura rápida: apagado mientras se recarga, con los segundos que faltan en el rótulo (lo llama avanzaTaller cada fotograma)
const RAPIDA = { seg: -1 };
function refrescaRapida() {
  const yo = J.yo, b = E('t-rapida'); if (!yo || !b) return;
  const seg = Math.ceil(yo.rapida); if (seg === RAPIDA.seg) return; RAPIDA.seg = seg;
  b.disabled = seg > 0; b.querySelector('small').textContent = seg > 0 ? seg + ' s' : tr('Rápida');
}
function refrescaTaller() {
  E('taller').classList.toggle('plegado', TALLER.plegado); RAPIDA.seg = -1; refrescaRapida();
  const pl = E('t-plegar'); pl.setAttribute('aria-expanded', String(!TALLER.plegado)); pl.setAttribute('aria-label', TALLER.plegado ? tr('Mostrar las herramientas') : tr('Ocultar las herramientas'));
  E('t-gota').classList.toggle('puesto', TALLER.herr === 'gota');
  for (const b of document.querySelectorAll('.t-radio')) b.classList.toggle('puesto', TALLER.herr === 'pincel' && RADIOS[+b.dataset.radio] === TALLER.radio);
  E('t-calco').classList.toggle('puesto', TALLER.calco); E('t-senuelo').classList.toggle('puesto', TALLER.herr === 'senuelo');
  E('t-ayuda').textContent = TALLER.herr === 'senuelo' ? tr('Señuelo: pinta en el suelo, cerca de ti. Gasta tinta y los becarios pueden picar.') : tr('Toca el suelo para coger su color y pinta tu cuerpo con el dedo.');
  refrescaTinta();
  for (const b of document.querySelectorAll('.t-cabezal')) b.classList.toggle('puesto', TALLER.cabezal === b.dataset.cabezal);
  for (const b of document.querySelectorAll('.t-figura')) b.classList.toggle('puesto', TALLER.herr === b.dataset.figura);
  const post = (J.yo && J.yo.postura) || 'firmes';
  for (const b of document.querySelectorAll('.t-postura')) b.classList.toggle('puesto', b.dataset.postura === post);
  const pal = E('t-paleta');
  if (!pal.children.length) for (const col of paletaDelMapa()) {
    const b = document.createElement('button'); b.type = 'button'; b.style.background = col; b.dataset.color = col; b.setAttribute('aria-label', tr('Color') + ' ' + col);
    b.onclick = () => { ponColor(col); if (TALLER.herr === 'gota') TALLER.herr = 'pincel'; play('select'); refrescaTaller(); };
    pal.appendChild(b);
  }
  for (const b of pal.children) b.classList.toggle('puesto', b.dataset.color === TALLER.color);
  E('t-color').style.background = TALLER.color;
  const caja = E('t-recientes'); caja.textContent = '';
  for (const col of TALLER.recientes) {
    const b = document.createElement('button'); b.type = 'button'; b.style.background = col; b.setAttribute('aria-label', tr('Color') + ' ' + col);
    if (col === TALLER.color) b.className = 'puesto';
    b.onclick = () => { ponColor(col); if (TALLER.herr === 'gota') TALLER.herr = 'pincel'; play('select'); refrescaTaller(); };
    caja.appendChild(b);
  }
  refrescaMenuPintar();
}
