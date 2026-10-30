// Fans of Karts (prototipo) · ARRANQUE: el tamaño de la pantalla (la del juego, de 240 × 160, se amplía todo lo que cabe), dónde van los
// botones para el dedo (debajo del juego con el móvil de pie; a los lados con el móvil tumbado), las fotos de los karts que se van
// haciendo mientras estás en los menús, y el bucle: la carrera avanza a pasos fijos de 1/60 s y se pinta una vez por fotograma.
// Con Opciones → «Jugar en» se puede jugar tumbado o de pie aunque el móvil no gire la pantalla: se pinta todo un cuarto de vuelta girado.
// Para probar: ?pista=oficinas|cementerio|nube entra directo a una carrera, &piloto=bunny… elige piloto, &auto=1 hace que conduzca solo,
// &dif=0|1|2 pone el nivel (becario, empleado o CEO) y &dedos=1 enseña los botones del móvil en el ordenador.
'use strict';

const cv = document.getElementById('cv'), mc = cv.getContext('2d');
let DPR = 1, ESC = 3, OX = 0, OY = 0, RELOJ = 0, ACUM = 0, ULTIMO = 0;
let GIRADA = 0, LW = 240, LH = 160;
// la resolución del lienzo: la del móvil, salvo que no le dé para 50 fotogramas por segundo; entonces se baja (en pixel art casi no se nota)
let DPR_TOPE = 3, MEDIDA = { n: 0, t: 0 };      // el cuarto de vuelta que pone el juego (0, 90 o 270 grados) y el tamaño de la pantalla tal como se pinta
const PASO = 1 / 60;
const BOT = [];      // los botones para el dedo: { id, x, y, w, h, txt } en píxeles de la pantalla tal como se pinta

function ajusta() {
  DPR = Math.min(DPR_TOPE, window.devicePixelRatio || 1);
  const w = Math.max(160, window.innerWidth), h = Math.max(160, window.innerHeight);
  cv.width = Math.round(w * DPR); cv.height = Math.round(h * DPR); cv.style.width = w + 'px'; cv.style.height = h + 'px';
  // los bordes que tapa el móvil (la muesca, la barra de abajo): arriba, derecha, abajo, izquierda
  const cs = getComputedStyle(document.getElementById('seguro'));
  let m = [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft].map(v => (parseFloat(v) || 0) * DPR);
  // «Jugar en: horizontal» con el móvil de pie (o «vertical» con el móvil tumbado): se pinta girado y el móvil se coge del otro modo
  const dePie = cv.height > cv.width * 1.1, tumbado = cv.width > cv.height * 1.1, dedos = ENT.tactil;
  GIRADA = !dedos ? 0 : AJUSTES.pantalla === 'horizontal' && dePie ? 90 : AJUSTES.pantalla === 'vertical' && tumbado ? (anguloSistema() === 270 ? 90 : 270) : 0;
  if (GIRADA === 90) m = [m[1], m[2], m[3], m[0]]; else if (GIRADA === 270) m = [m[3], m[0], m[1], m[2]];
  LW = GIRADA ? cv.height : cv.width; LH = GIRADA ? cv.width : cv.height;
  const W = LW - m[1] - m[3], H = LH - m[0] - m[2], vertical = H > W * 1.1, enCarrera = PANT.id === 'carrera' || PANT.id === 'carga';
  // el juego, lo más grande que quepa; con un número entero de píxeles por punto si así no se pierde mucho sitio
  let e = Math.min(W / PW, (vertical && dedos ? H * 0.6 : H) / PH);
  const entero = Math.floor(e);
  if (entero >= 1 && entero / e > 0.86) e = entero;
  ESC = e;
  OX = Math.round(m[3] + (W - PW * e) / 2);
  // de pie y en carrera, el juego va arriba para dejar los pulgares abajo; en los menús, centrado
  OY = Math.round(m[0] + (vertical && dedos && enCarrera ? Math.min((H - PH * e) / 2, H * 0.12) : (H - PH * e) / 2));
  BOT.length = 0; HM = 0;
  if (!dedos) return;
  if (vertical) {
    // de pie: los botones, debajo del juego, en la zona de los pulgares
    const oy = Math.round(m[0] + Math.min((H - PH * e) / 2, H * 0.12)), y0 = oy + PH * e, alto = LH - m[2] - y0, u = Math.min(W * 0.25, alto * 0.36), sep = u * 0.12;
    const yB = Math.min(y0 + alto * 0.58, LH - m[2] - u * 1.15), x0 = m[3] + W * 0.035, x1 = m[3] + W * 0.965;
    BOT.push({ id: 'izq', x: x0, y: yB, w: u, h: u, txt: '<' }, { id: 'der', x: x0 + u + sep, y: yB, w: u, h: u, txt: '>' });
    BOT.push({ id: 'derrapa', x: x1 - u * 1.25, y: yB - u * 0.1, w: u * 1.25, h: u * 1.1, txt: 'DERRAPE' });
    BOT.push({ id: 'usa', x: x1 - u * 1.25, y: yB - u * 0.1 - sep - u * 0.75, w: u * 1.25, h: u * 0.75, txt: 'OBJETO' });
    BOT.push({ id: 'freno', x: x0, y: yB - sep - u * 0.6, w: u * 2 + sep, h: u * 0.6, txt: 'FRENO' });
  } else {
    // tumbado: a los lados del juego; si no caben, pisan un poco sus esquinas de abajo (y el marcador se aparta: HM)
    const hueco = OX - m[3], x0 = m[3] + W * 0.008, x1 = m[3] + W * 0.992;
    const u = Math.max(H * 0.2, Math.min(H * 0.3, (hueco + PW * e * 0.08 - W * 0.008) / 2.12)), sep = u * 0.12, yB = m[0] + H * 0.96 - u;
    BOT.push({ id: 'izq', x: x0, y: yB, w: u, h: u, txt: '<' }, { id: 'der', x: x0 + u + sep, y: yB, w: u, h: u, txt: '>' });
    BOT.push({ id: 'derrapa', x: x1 - u * 1.3, y: yB - u * 0.1, w: u * 1.3, h: u * 1.1, txt: 'DERRAPE' });
    BOT.push({ id: 'usa', x: x1 - u * 1.3, y: yB - u * 0.1 - sep - u * 0.8, w: u * 1.3, h: u * 0.8, txt: 'OBJETO' });
    BOT.push({ id: 'freno', x: x0, y: yB - sep - u * 0.55, w: u * 2 + sep, h: u * 0.55, txt: 'FRENO' });
    HM = limita(Math.ceil((x0 + u * 2 + sep - OX) / e) + 2, 0, 44);
  }
  for (const b of BOT) { b.x = Math.round(b.x); b.y = Math.round(b.y); b.w = Math.round(b.w); b.h = Math.round(b.h); }
}
function pintaBotones() {
  if (!ENT.tactil || PANT.id !== 'carrera' || PANT.pausa) return;
  const g = Math.max(2, Math.round(ESC * 0.75)), conGiro = inclLista();
  for (const b of BOT) {
    if (conGiro && (b.id === 'izq' || b.id === 'der')) continue;      // con el giroscopio no hacen falta las flechas
    let ap = false; for (const v of DEDOS.values()) if (v === b.id) ap = true;
    mc.fillStyle = '#1c1028'; mc.globalAlpha = 0.55; mc.fillRect(b.x + g, b.y, b.w - 2 * g, b.h); mc.fillRect(b.x, b.y + g, b.w, b.h - 2 * g);
    mc.fillStyle = ap ? '#ffcb3d' : b.id === 'derrapa' ? '#ff8a1f' : b.id === 'usa' ? '#7c3aed' : '#4a2f72'; mc.globalAlpha = ap ? 0.85 : 0.5;
    mc.fillRect(b.x + g, b.y + g, b.w - 2 * g, b.h - 2 * g);
    mc.globalAlpha = 0.95;
    const flecha = b.txt.length === 1, es = Math.max(1, Math.floor(flecha ? b.h / 16 : Math.min(b.h / 16, b.w / (anchoTexto(tr(b.txt)) + 8))));
    escribeB(mc, tr(b.txt), Math.round(b.x + b.w / 2), Math.round(b.y + b.h / 2 - 3.5 * es), ap ? '#1c1028' : '#ffffff', ap ? '#fff3a0' : '#1c1028', 'centro', es);
    mc.globalAlpha = 1;
  }
}

// ---------- las fotos de los karts: se van haciendo en los ratos libres (menús), una foto cada vez para que el menú no dé tirones,
// y lo que falte, en la pantalla de carga ----------
const COLA_FOTOS = [];
let FOTO_EN_CURSO = null;
function encolaFotos() { for (let n = 0; n <= 13; n++) for (const p of PILOTOS) COLA_FOTOS.push([figuraDe(p.id), n]); }
function haceFotos(ms) {
  const t0 = performance.now();
  while (performance.now() - t0 < ms) {
    if (!FOTO_EN_CURSO) {
      if (!COLA_FOTOS.length) return 0;
      const [f, n, esc] = COLA_FOTOS.shift();
      if (f.listo(n)) continue;
      FOTO_EN_CURSO = { f, n, t: f.empieza(esc || BASE_KART * Math.pow(RAZON_NIVEL, n)) };
    }
    const q = FOTO_EN_CURSO;
    if (q.f.sigue(q.t)) { if (!q.f.listo(q.n)) q.f.niveles[q.n + EXTRA_FOTO] = q.t; FOTO_EN_CURSO = null; }
  }
  return COLA_FOTOS.length + (FOTO_EN_CURSO ? 1 : 0);
}
// las de los adornos y los objetos de una pista (son pequeñas: se hacen de golpe al cargarla)
function precalienta(P) {
  const figs = new Set(P.cosas.filter(c => c.fig).map(c => c.fig));
  for (const id of ['moneda', 'regalo0', 'regalo1', 'regalo2', 'gashapon0', 'gashapon1', 'gashapon2', 'nerf', 'parche', 'cono', 'reloj', 'dron']) figs.add(figCosa(id));
  for (const f of figs) for (let n = 0; n <= 16; n++) if (!f.listo(n)) f.niveles[n + EXTRA_FOTO] = f.tira(BASE_COSA * Math.pow(RAZON_NIVEL, n));
  for (const id of LISTA_OBJETOS) iconoDe(OBJETOS[id].fig);
}

function fotograma(ahora) {
  const dt = Math.min(0.1, (ahora - ULTIMO) / 1000 || 0); ULTIMO = ahora; RELOJ += dt;
  if (PANT.id === 'carrera' && !PANT.pausa && (DPR_TOPE > 1 || CAL === 2) && dt > 0) {
    MEDIDA.n++; MEDIDA.t += dt;
    if (MEDIDA.n >= 90) {
      if (MEDIDA.t / MEDIDA.n > 1 / 50) {
        if (CAL === 2) { ponCalidad(1); comenta('Tu móvil iba justo: imagen clásica por esta vez. La HD está en Opciones.'); }
        else if (DPR > 1) { DPR_TOPE = Math.max(1, Math.floor(DPR) - 1); ajusta(); }
      }
      MEDIDA.n = 0; MEDIDA.t = 0;
    }
  }
  mando(); inclVigila();
  if (PANT.id === 'carrera' && (!PANT.pausa || CARRERA.pvp)) {     // en PvP la pausa no para la carrera (el rival sigue)
    ACUM += dt;
    let n = 0;
    while (ACUM >= PASO) { pasoCarrera(PASO); ACUM -= PASO; if (++n >= 5) { ACUM = 0; break; } }
    if ((COLA_FOTOS.length || FOTO_EN_CURSO) && dt < 1 / 40) haceFotos(2);      // las fotos grandes de la HD que se vayan pidiendo, poco a poco
  } else { PULSOS.salta = false; PULSOS.usa = false; if (PANT.id !== 'carga') haceFotos(5); }
  pintaPantalla(dt);
  vigilaMusica();
  motorSuena(CARRERA.jugador, PANT.id === 'carrera' && (!PANT.pausa || !!CARRERA.pvp));
  // a la pantalla de verdad (girada un cuarto de vuelta si toca)
  if (GIRADA === 90) mc.setTransform(0, 1, -1, 0, cv.width, 0); else if (GIRADA === 270) mc.setTransform(0, -1, 1, 0, 0, cv.height); else mc.setTransform(1, 0, 0, 1, 0, 0);
  mc.fillStyle = '#150b21'; mc.fillRect(0, 0, LW, LH);
  const w = Math.round(PW * ESC), h = Math.round(PH * ESC), g = Math.max(2, Math.round(ESC));
  mc.fillStyle = '#3a2a52'; mc.fillRect(OX - g, OY - g, w + 2 * g, h + 2 * g);
  if (EN_MUNDO) modoUI();
  mc.imageSmoothingEnabled = false;
  mc.drawImage(LU, OX, OY, w, h);
  pintaBotones();
  giraCapa();      // las pantallas en HTML giran con el juego (capa-girada.js)
  requestAnimationFrame(fotograma);
}

// ---------- arranque ----------
(() => {
  const q = new URLSearchParams(location.search);
  ENT.tactil = !!(window.matchMedia && matchMedia('(pointer: coarse)').matches) || q.get('dedos') === '1';
  ENT.autoGas = AJUSTES.autoGas === 'si' || (AJUSTES.autoGas === 'auto' && ENT.tactil);
  preparaDedos(); ajusta();
  window.addEventListener('resize', ajusta);
  window.addEventListener('orientationchange', () => setTimeout(ajusta, 250));
  document.addEventListener('visibilitychange', () => { if (document.hidden && PANT.id === 'carrera' && CARRERA.estado === 'corre') PANT.pausa = true; });
  encolaFotos();
  const ip = PISTAS.findIndex(p => p.id === q.get('pista')), ij = JUGABLES.findIndex(p => p.id === q.get('piloto'));
  if (ij >= 0) PANT.piloto = ij;
  if (q.get('dif')) AJUSTES.dificultad = limita(+q.get('dif') | 0, 0, 2);
  if (q.get('jugar')) AJUSTES.pantalla = q.get('jugar');
  PISTA = creaPista(PISTAS[Math.max(0, ip)]); PISTA.idioma = IDIOMA_K; PISTA.dif = nivelDif(); preparaIA(PISTA);
  musica('menu');
  if (q.get('auto') === '1') PANT.auto = true;
  if (ip >= 0) { PANT.pista = ip; PANT.mundo = PISTAS[ip].mundo - 1; PANT.premium = !!PISTAS[ip].premium; empiezaCarga(); }
  ajusta();
  document.getElementById('carga').hidden = true;
  requestAnimationFrame(t => { ULTIMO = t; fotograma(t); });
})();
