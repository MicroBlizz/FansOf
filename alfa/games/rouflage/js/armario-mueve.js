// Fans of Rouflage · ARMARIO EN MOVIMIENTO: en la vista grande del armario, la galleta puede dejar de ser un dibujo quieto y moverse como en la partida
// (pintaAlubia de alubia.js con un personaje de mentira vestido con lo puesto o lo que te pruebas). Dos botones sobre la vista: MOVER (anda de un lado a otro,
// se para a respirar y vuelve a andar; tocando la vista va hasta ahí) y COLADO/BECARIO (cómo te queda la ropa de becario, con su linterna). Se recuerda
// en las opciones del jugador (opGuarda). Con MOVER apagado se ve el dibujo quieto de siempre (ARD.vestida).
'use strict';

const ARMUEVE = { on: false, clase: 'camaleon', e: null, clave: '', raf: 0, t0: 0, tAnt: 0, meta: null, pausa: 0, mascota: null, botones: null };

function arMuevePrepara() {
  ARMUEVE.on = opLee('ar-mueve', '1') === '1';      // de serie, en movimiento: quieta no se ve cómo queda la ropa al andar
  ARMUEVE.clase = opLee('ar-mueve-clase', 'camaleon') === 'cazador' ? 'cazador' : 'camaleon';
  const sitio = E('ar-vista-sitio'), f = document.createElement('div');
  f.className = 'ar-mueve';
  f.innerHTML = `<button type="button" class="ar-mueve-b" data-a="mueve"></button><button type="button" class="ar-mueve-b" data-a="clase"></button>`;
  sitio.appendChild(f); ARMUEVE.botones = f;
  f.onclick = ev => {
    const b = ev.target.closest('button[data-a]'); if (!b) return;
    play('select');
    if (b.dataset.a === 'mueve') { ARMUEVE.on = !ARMUEVE.on; opGuarda('ar-mueve', ARMUEVE.on ? '1' : '0'); }
    else { ARMUEVE.clase = ARMUEVE.clase === 'cazador' ? 'camaleon' : 'cazador'; opGuarda('ar-mueve-clase', ARMUEVE.clase); ARMUEVE.clave = ''; }
    arPintaVista();
  };
  // tocando la vista, la galleta va andando hasta ahí
  E('ar-vista').addEventListener('pointerdown', ev => {
    if (!ARMUEVE.on || !ARMUEVE.e) return;
    const k = E('ar-vista'), r = k.getBoundingClientRect(), esc = arMueveEscala(k);
    ARMUEVE.meta = limita(((ev.clientX - r.left) / r.width * k.width - k.width / 2) / esc, -arMueveBorde(k), arMueveBorde(k)); ARMUEVE.pausa = 0;
  });
}
const arMueveEscala = k => k.height / 92;
const arMueveBorde = k => Math.max(0, k.width / 2 / arMueveEscala(k) - 28);      // que no se salga por los lados (ni la linterna del becario)

function arMueveTextos() {
  const f = ARMUEVE.botones; if (!f) return;
  const bm = f.querySelector('[data-a="mueve"]'), bc = f.querySelector('[data-a="clase"]');
  bm.textContent = ARMUEVE.on ? tr('QUIETO') : tr('MOVER'); bm.classList.toggle('on', ARMUEVE.on);
  bm.setAttribute('aria-label', ARMUEVE.on ? tr('Dejar la galleta quieta') : tr('Ver la galleta en movimiento'));
  bc.hidden = !ARMUEVE.on; bc.textContent = ARMUEVE.clase === 'cazador' ? tr('BECARIO') : tr('COLADO');
  bc.className = 'ar-mueve-b ' + (ARMUEVE.clase === 'cazador' ? 'becario' : 'colado');
  bc.setAttribute('aria-label', tr('Cambiar entre colado y becario'));
}

// la llama arPintaVista: true si se encarga ella (la galleta en movimiento); false para pintar el dibujo quieto de siempre
function arMueveVista(cat, pr) {
  arMueveTextos();
  const f = ARMUEVE.botones; if (f) f.hidden = !cat.cuerpo;
  if (!ARMUEVE.on || !cat.cuerpo) { arMueveParar(); return false; }
  const ropa = ropaDe(pr), clave = ARMUEVE.clase + '|' + JSON.stringify(ropa.ids);
  if (!ARMUEVE.e || ARMUEVE.clave !== clave) {
    const viejo = ARMUEVE.e, cazador = ARMUEVE.clase === 'cazador';
    const [piel, pctx] = nuevaPiel(cazador ? '#aab4c4' : BLANCO_PIEL);
    const e = { clase: ARMUEVE.clase, tipo: 'fan', x: viejo ? viejo.x : 0, y: 0, mira: viejo ? viejo.mira : 1, dir: 0, hielo: 0, piel, pctx, pasos: [], semilla: 3, anda: 0, alerta: 0, ciego: 0, balas: 5, moviendo: false };
    e.ropa = ropa; ponPapel(e);
    ARMUEVE.e = e; ARMUEVE.clave = clave; ARMUEVE.mascota = ropa.mascota;
  }
  if (!ARMUEVE.raf) { ARMUEVE.tAnt = 0; ARMUEVE.raf = requestAnimationFrame(arMuevePaso); }
  return true;
}
function arMueveParar() { cancelAnimationFrame(ARMUEVE.raf || 0); ARMUEVE.raf = 0; }

function arMuevePaso(ahora) {
  const k = E('ar-vista');
  if (E('p-armario').hidden || !ARMUEVE.on || !k || k.hidden || !ARMUEVE.e) { ARMUEVE.raf = 0; return; }
  const t = ahora / 1000, dt = ARMUEVE.tAnt ? Math.min(0.05, t - ARMUEVE.tAnt) : 0; ARMUEVE.tAnt = t;
  const e = ARMUEVE.e, borde = arMueveBorde(k);
  // de un lado a otro: anda hasta su meta, se para un rato y elige otra
  if (ARMUEVE.meta == null) {
    ARMUEVE.pausa -= dt;
    if (ARMUEVE.pausa <= 0) ARMUEVE.meta = borde > 4 ? (e.x > 0 ? -1 : 1) * borde * (0.5 + Math.random() * 0.5) : 0;
  }
  if (ARMUEVE.meta != null) {
    const d = ARMUEVE.meta - e.x, v = 34;
    if (Math.abs(d) < 0.8) { ARMUEVE.meta = null; ARMUEVE.pausa = 1.4 + Math.random() * 1.8; e.moviendo = false; if (borde <= 4) e.mira = -e.mira; }
    else { e.moviendo = true; e.mira = d > 0 ? 1 : -1; e.x += Math.sign(d) * Math.min(Math.abs(d), v * dt); e.anda += dt; }
  } else e.moviendo = false;
  arPinta(k, (c, w, h) => {
    const esc = arMueveEscala(k);
    c.translate(w / 2, h * 0.885); c.scale(esc, esc);
    if (ARMUEVE.mascota && ARD.MASCOTAS && ARD.MASCOTAS[ARMUEVE.mascota]) {      // su mascota, detrás de ella
      c.save(); c.translate(e.x - e.mira * 22, 0); c.scale(e.mira, 1); ARD.MASCOTAS[ARMUEVE.mascota](c, { t, mov: e.moviendo ? 1 : 0, susto: false, sem: 0 }); c.restore();
    }
    pintaAlubia(c, e, t);
  });
  ARMUEVE.raf = requestAnimationFrame(arMuevePaso);
}
