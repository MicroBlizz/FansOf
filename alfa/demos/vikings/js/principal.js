// Fans of Vikings · PRINCIPAL: el lienzo (un lienzo pequeño de VK_ANCHO de ancho donde se pinta el pixel art, ampliado sin
// suavizar al de la pantalla, con los textos encima a resolución completa), los toques (tocar botones y edificios, arrastrar
// para mover el mapa), la ventana de opciones y de ayuda (HTML), el bucle de cada fotograma y el arranque.
'use strict';
const VK_CV = document.getElementById('cv'), VK_CTX = VK_CV.getContext('2d');
const VK_BAJA = document.createElement('canvas'), VK_BCTX = VK_BAJA.getContext('2d');
const VK_ESCENARIO = document.getElementById('stage');

function vkAjusta() {
  const bw = document.body.clientWidth, bh = document.body.clientHeight;
  // vertical: en el móvil, toda la pantalla; en el ordenador, un marco de móvil
  let w = bw, h = bh;
  if (bw > 600 || bw / bh > 0.75) { h = Math.min(bh - 24, 900); w = Math.round(h * 9 / 16); }
  VK_V.H = Math.max(360, Math.min(470, Math.round((VK_ANCHO * h) / Math.max(1, w))));
  VK_V.W = VK_ANCHO;
  w = Math.floor(Math.min(w, (h * VK_V.W) / VK_V.H)); h = Math.floor((w * VK_V.H) / VK_V.W);
  VK_ESCENARIO.style.width = w + 'px'; VK_ESCENARIO.style.height = h + 'px';
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  VK_CV.width = Math.round(w * dpr); VK_CV.height = Math.round(h * dpr);
  VK_V.esc = VK_CV.width / VK_V.W; VK_V.css = w / VK_V.W;
  VK_BAJA.width = VK_V.W; VK_BAJA.height = VK_V.H;
  VK_MAPA.camY = Math.min(VK_MAPA.camY, vkMaxCam());
}

/* ---------- los toques ---------- */
function vkLogico(e) { const r = VK_CV.getBoundingClientRect(); return [(e.clientX - r.left) / VK_V.css, (e.clientY - r.top) / VK_V.css]; }
let VK_TOQUE = null;
VK_CV.addEventListener('pointerdown', e => {
  e.preventDefault();
  try { VK_CV.setPointerCapture(e.pointerId); } catch (er) { /* sin captura */ }
  const [x, y] = vkLogico(e), b = vkBotonEn(x, y);
  VK_TOQUE = { x, y, b };
  VK_PULSA.id = b && !b.zona ? b.id + ':' + JSON.stringify(b.dato) : null;
  if (!VK_C.activo && !VK_ALDEA.panel) vkEmpiezaArrastre(y);
});
VK_CV.addEventListener('pointermove', e => { if (VK_TOQUE && !VK_C.activo) vkArrastra(vkLogico(e)[1]); });
VK_CV.addEventListener('pointerup', e => {
  const t = VK_TOQUE; VK_TOQUE = null; VK_PULSA.id = null;
  const movido = VK_ARRASTRE.movido; VK_ARRASTRE.activo = false; VK_ARRASTRE.movido = false;
  if (!t || movido) return;
  const [x, y] = vkLogico(e), b = vkBotonEn(x, y);
  if (!b || !t.b || b.id !== t.b.id || JSON.stringify(b.dato) !== JSON.stringify(t.b.dato)) return;
  if (VK_C.activo) vkPulsaCombate(b); else vkPulsaAldea(b);
});
VK_CV.addEventListener('pointercancel', () => { VK_TOQUE = null; VK_PULSA.id = null; VK_ARRASTRE.activo = false; });
VK_CV.addEventListener('wheel', e => { if (!VK_C.activo && !VK_ALDEA.panel) VK_MAPA.camY = Math.max(0, Math.min(vkMaxCam(), VK_MAPA.camY + e.deltaY * 0.3)); }, { passive: true });
document.addEventListener('keydown', e => { if (e.key === 'Escape') { if (VK_ALDEA.panel) VK_ALDEA.panel = null; vkCierraModal(); } });

/* ---------- las ventanas HTML: opciones y cómo se juega ---------- */
function vkModal(html) {
  const m = document.getElementById('vk-modal'), t = document.getElementById('vk-tarjeta');
  t.innerHTML = html; m.hidden = false; return t;
}
function vkCierraModal() { const m = document.getElementById('vk-modal'); if (m) m.hidden = true; }
function vkAbreOpciones() {
  const t = vkModal(`<h2>${tr('Opciones')}</h2><div id="vk-opc-lista"></div>
    <div class="vk-fila"><button class="vk-btn vk-azul" id="vk-ayuda" type="button">${tr('CÓMO SE JUEGA')}</button></div>`);
  const { lista, version, cerrar } = OPCIONES.lista({
    filas: [
      OPCIONES.interruptor(tr('Sonido'), tr('Efectos y música.'), () => !SAVE.muted, v => { SAVE.muted = !v; vkGuarda(); applyVolume(); }),
      OPCIONES.interruptor(tr('Música'), tr('La canción de fondo.'), () => SAVE.musica !== false, v => { SAVE.musica = v; vkGuarda(); applyVolume(); }),
      'idioma', 'cuenta',
    ],
    versionTexto: 'Fans of Vikings · v' + VERSION,
    alCerrar: vkCierraModal,
  });
  const sitio = t.querySelector('#vk-opc-lista'); sitio.append(lista); if (version) sitio.append(version); if (cerrar) sitio.append(cerrar);
  t.querySelector('#vk-ayuda').onclick = () => { play('select'); vkAyuda(); };
}
function vkAyuda() {
  const t = vkModal(`<h2>${tr('Cómo se juega')}</h2>
    <p>${tr('Microblizz ha comprado la aldea de los fans. Tus cuatro Animales Locos se defienden: trabajan de día y van de asalto a la sede.')}</p>
    <p>${tr('<b>Toca un edificio</b> para darle trabajo: el huerto da zanahorias, la cocina hace pan y la herrería forja espadas y escudos. Cada uno tiene una cola de 3 y sigue trabajando aunque cierres el juego.')}</p>
    <p>${tr('<b>ASALTO</b>: sube al autobús y lucha por turnos. Toca una habilidad y luego al enemigo. La vida no vuelve sola: <b>cura con pan</b> en la TRIBU.')}</p>
    <p>${tr('Gana asaltos para subir de nivel a tus fans y a la aldea. En la planta de arriba te espera el Ejecutivo.')}</p>
    <div class="vk-fila"><button class="vk-btn" id="vk-vale" type="button">${tr('¡A LA ALDEA!')}</button></div>`);
  t.querySelector('#vk-vale').onclick = () => { play('select'); SAVE.ayuda = true; vkGuarda(); vkCierraModal(); };
}

/* ---------- el bucle ---------- */
let VK_ULT = 0;
function vkFotograma(ahora) {
  requestAnimationFrame(vkFotograma);
  const dt = Math.min(0.05, (ahora - VK_ULT) / 1000 || 0.016); VK_ULT = ahora;
  const t = ahora / 1000, b = VK_BCTX;
  vkMusicaBucle();
  b.imageSmoothingEnabled = false;
  b.setTransform(1, 0, 0, 1, 0, 0); b.clearRect(0, 0, VK_V.W, VK_V.H);
  vkAvanzaAldea(dt);   // la aldea sigue trabajando también durante el combate
  if (VK_C.activo) { vkAvanzaCombate(dt); vkPintaCombate(b, t); }
  else vkPintaAldea(b, t, dt);
  const c = VK_CTX;
  c.setTransform(1, 0, 0, 1, 0, 0); c.imageSmoothingEnabled = false;
  c.drawImage(VK_BAJA, 0, 0, VK_CV.width, VK_CV.height);
  vkPintaTextos(c, VK_V.esc);
}
function vkArranque() {
  vkAjusta();
  window.addEventListener('resize', vkAjusta);
  vkIniciaFans();
  vkCobra();
  document.getElementById('vk-modal').addEventListener('pointerdown', e => { if (e.target.id === 'vk-modal') vkCierraModal(); });
  const carga = document.getElementById('carga'); if (carga) carga.remove();
  if (!SAVE.ayuda) vkAyuda();
  requestAnimationFrame(vkFotograma);
}
// la letra de píxeles tiene que estar lista antes de pintar textos
(document.fonts && document.fonts.load ? Promise.all([document.fonts.load("500 16px 'Pixelify Sans'"), document.fonts.load("700 16px 'Pixelify Sans'")]).catch(() => 0) : Promise.resolve()).then(vkArranque);
