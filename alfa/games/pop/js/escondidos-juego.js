// Fans of Pop · LA BURBUJA BRILLANTE EN LA PARTIDA (aplicación; tarea #294, ADR 199, nodo n4). Solo con el flag `companeros` abierto y
// solo en los niveles del camino (de día) y del Difícil (de noche), nunca en duelos, Pesadilla ni Memoria: al entrar en un nivel se
// tira si sale la burbuja brillante (PP_ESC.sale) y qué compañero trae (PP_ESC.elige); si sale, una burbuja normal del tablero brilla
// tornasolada. Desde la tarea #329 (ADR 205) hay que tocarla LA PRIMERA: si trae un repetido, se da con su aviso (ppViaGana,
// js/companeros-vias.js); si trae uno nuevo, se abre la ventana del duelo (js/escondidos-duelo.js); cualquier otra primera acción
// (otra burbuja, martillo o bomba) hace que se escape con su «puf». Tampoco sale en los niveles de tutorial (la manita señala otra)
// ni en los primeros niveles gratis.
// Las reglas son puras (js/escondidos.js); aquí van el azar (Math.random), la partida guardada y el dibujo.
//
// Lo guardado vive en SAVE.brillo = { sin, pend }, fuera de SAVE.cole (PP_COLE.lee solo conserva sus campos y ppColeGuarda pone un
// estado nuevo): `sin`, niveles seguidos sin burbuja (el contador de la garantía); `pend`, la tirada del nivel en el que se ha entrado
// y aún no se ha jugado ({ sale, az }). La tirada se guarda al entrar y se gasta con el primer toque: salir sin tocar y volver a entrar
// (en ese nivel o en otro) usa la misma tirada y los mismos números para elegir, así que entrar y salir no da más burbujas ni otra rareza.
// Con el flag cerrado no se llama nada de esto: ni azar, ni guardado, ni dibujo.
'use strict';
/* ---------- la tirada al entrar en un nivel ---------- */
// lo guardado (lo crea la primera vez)
function ppEscGuardado() {
  const b = SAVE.brillo;
  if (b && typeof b === 'object') return b;
  SAVE.brillo = { sin: 0, pend: null };
  return SAVE.brillo;
}
// ¿puede salir en este nivel? Camino y Difícil; nunca un duelo (d.nim), la Pesadilla (d.lo, dif 2) ni un tablero sin nivel
// ni un nivel de tutorial, ni los primeros niveles gratis de una partida nueva (ahí no se pierden corazones: js/primeros-pasos-juego.js),
// ni antes de abrir el equipo (repetir el 1 o el 2 ya ganados ya no es gratis, tarea 406)
const ppEscEnNivel = d => !!d && !d.nim && !d.lo && d.dif !== 2 && !d.tutorial && !ppPrimerosGratis() && ppPrimerosVe('equipo');
// de noche = el modo Difícil del mundo (se pinta de noche: ppPintaFondo con `dif`); de día, el camino
const ppEscMomento = d => (d.dif ? 'noche' : 'dia');
// un azar repetible: da los números guardados en orden (para que volver a entrar elija lo mismo)
function ppEscAzarDe(lista) { let k = 0; return () => lista[k++ % lista.length]; }
// la tirada de ahora: la pendiente si la hay; si no, una nueva, que sube o reinicia el contador y se guarda ya
function ppEscTirada(b) {
  if (b.pend) return b.pend;
  const r = PP_ESC.sale(b.sin, Math.random);
  b.sin = r.sinBrillo;
  b.pend = { sale: r.sale, az: [Math.random(), Math.random(), Math.random()] };
  ppGuarda();
  return b.pend;
}
// la burbuja que brilla: una normal levantada (sin nata ni cereza, ni hielo ni concha) que no sea la del amigo atrapado; si no queda
// ninguna normal, cualquiera levantada sin atrapado. -1 si no hay sitio
function ppEscSitio(T, azar) {
  const libres = [...T.up.keys()].filter(i => T.up[i] && !(i in T.slimes));
  const normales = libres.filter(i => T.up[i] === 1 && !(T.esp && T.esp[i]));
  const lista = normales.length ? normales : libres;
  return lista.length ? lista[Math.min(lista.length - 1, Math.floor(azar() * lista.length))] : -1;
}
// al entrar en un nivel (ppEntra, js/partida.js): T.esc = { gastada, brillo } con brillo = { i, id, nuevo, lleno, ganado, salto, ido, dato } o null
function ppEscEntra(T, d) {
  if (!ppCompanerosActivo() || !ppEscEnNivel(d)) return;
  const pend = ppEscTirada(ppEscGuardado()), az = ppEscAzarDe(pend.az);
  T.esc = { gastada: false, brillo: null };
  const dev = pend.sale ? ppEscDev(pend) : null;
  const comp = pend.sale ? (dev || PP_ESC.elige(ppCole().tiene, d.mundo, ppEscMomento(d), az)) : null;
  const i = comp ? ppEscSitio(T, az) : -1;
  ppEscFicha(pend, i < 0 ? null : comp, d, dev);
  if (i < 0) return;
  const lleno = !comp.nuevo && PP_ESC.progreso(ppCole().tiene[comp.id]).lleno;   // ya al máximo: otro repetido solo da monedas
  T.esc.brillo = { i, id: comp.id, nuevo: comp.nuevo, lleno, ganado: false, salto: null, ido: null, dato: pend.dato || null };
  if (!pend.dato && !dev) { pend.dato = PP_ESC_DATOS.nueva(comp, lleno, d, ppEscMomento(d)); T.esc.brillo.dato = pend.dato; ppGuarda(); }
  ppTutorial('arcoiris');   // Lola, la primera vez: hay que tocarla la primera
}
// la ficha de la tirada (js/escondidos-datos.js) es una por encuentro aunque se salga y se vuelva a entrar; si al volver la burbuja ya
// no está o trae a otro (la tirada sigue en otro nivel), la de antes se cierra «sin-tocar»
function ppEscFicha(pend, comp, d, dev) {
  if (!pend.dato || (comp && !dev && PP_ESC_DATOS.esDe(pend.dato, comp, d, ppEscMomento(d)))) return;
  PP_ESC_DATOS.estado(pend.dato, 'sin-tocar'); pend.dato = null; ppGuarda();
}
// panel DEV (js/dev.js): el compañero que se ha pedido probar en la burbuja, solo en la alfa y en local
function ppEscDev(pend) {
  if (!pend.dev || !ppEsPruebas() || !PP_COMP.INFO[pend.dev]) return null;
  return { id: pend.dev, nuevo: !(pend.dev in ppCole().tiene) };
}
// la tirada se gasta con la primera acción del nivel (o al decidir en la ventana del duelo)
function ppEscGasta(T) { T.esc.gastada = true; ppEscGuardado().pend = null; ppGuarda(); }

/* ---------- al reventar ---------- */
// antes de un toque tuyo (ppToque, js/partida.js; también el que coloca el martillo o la bomba): apunta dónde ha sido la primera
// acción y, si es la burbuja de un compañero nuevo o de un repetido que aún sirve, abre su ventana y el toque no llega al tablero (true)
function ppEscAntesDeToque(T, i) {
  const e = T.esc; if (!e || e.gastada) return false;
  e.toque = i;
  const que = PP_ESC.primera(e.brillo, i);
  if (que !== 'duelo' && que !== 'repetido') return false;
  ppEscVentanaLucha(T, e.brillo);   // js/escondidos-duelo.js
  return true;
}
// tras la primera acción del nivel (ppTrasToque, js/partida.js): gasta la tirada; si era la burbuja (con uno ya al máximo), te lo da;
// si era cualquier otra cosa, la burbuja se escapa. Lo que pase después ya no cuenta
function ppEscTrasToque(T, r) {
  const e = T.esc; if (!e || e.gastada) return;
  ppEscGasta(T);
  const b = e.brillo; if (!b) return;
  if (PP_ESC.primera(b, e.toque) === 'regalo' && r.pops.includes(b.i)) { ppEscRevienta(T, b); PP_ESC_DATOS.estado(b.dato, 'regalo'); }
  else { ppEscSeVa(b); PP_ESC_DATOS.estado(b.dato, 'escapada'); }
}
// la burbuja se escapa: deja de brillar con un «puf» y se dice (la burbuja de debajo sigue ahí, normal)
function ppEscSeVa(b) {
  b.ido = { t0: null };
  ppFlota(tr('¡La burbuja arcoíris se ha escapado!'), 270, 240, '#ff6ec7'); play('ppEscapa');
}
// el compañero sale de un salto con chispas pastel y se gana con su aviso («¡Nuevo compañero: X!» o «+1 X repetido»). También lo
// captura así la red (js/escondidos-duelo.js)
function ppEscRevienta(T, b) {
  b.ganado = true;
  const [x, y] = ppCentro(ppGeom(T.n), b.i);
  b.salto = { x, y, t0: null };
  PP_FX.parts = PP_CHISPAS.recorta(PP_FX.parts.concat(PP_CHISPAS.chispas(x, y, Math.random), PP_CHISPAS.chispas(x, y, Math.random)));
  ppViaGana(b.id);
}

/* ---------- el dibujo (ppPintaTablero, js/pintar.js) ---------- */
// arcoíris pastel, sin contorno: rosa, melocotón, limón, menta, cielo y otra vez rosa para cerrar la vuelta
const PP_ESC_TORNASOL = Object.freeze(['#ffb3d9', '#ffd6a5', '#fff3a0', '#a8f0c6', '#9fdcff', '#ffb3d9']);
// lo de la burbuja brillante de este tablero: el brillo mientras sigue arriba y el salto del compañero al reventarla
function ppEscPinta(c, T, g, r, t) {
  const b = T.esc && T.esc.brillo; if (!b) return;
  const [cx, cy] = ppCentro(g, b.i);
  if (b.ido) ppEscPuf(c, b, cx, cy - 4, r, t);
  else if (!b.ganado && T.up[b.i]) ppEscBrillo(c, cx, cy - 4, r, t);
  if (b.salto) ppEscSalto(c, b, r, t);
}
// el «puf» al escaparse (0,6 s): un aro pastel que se abre y se apaga y 6 destellos que salen hacia fuera
function ppEscPuf(c, b, x, y, r, t) {
  if (b.ido.t0 === null) b.ido.t0 = t;
  const k = (t - b.ido.t0) / 0.6;
  if (k >= 1) return;
  c.save(); c.translate(x, y); c.globalAlpha = 1 - k;
  c.beginPath(); c.arc(0, 0, r * (1.1 + k * 0.9), 0, Math.PI * 2); c.lineWidth = r * 0.2 * (1 - k); c.strokeStyle = ppEscTornasol(c, t); c.stroke();
  for (let n = 0; n < 6; n++) { const a = n * Math.PI / 3, d = r * (1.2 + k * 1.3); ppEscDestello(c, Math.cos(a) * d, Math.sin(a) * d, r * 0.22 * (1 - k), PP_ESC_TORNASOL[n % 5]); }
  c.restore();
}
// un degradado que da la vuelta con los colores del arcoíris (girando con `a`); sin degradado cónico, el color de ese momento
function ppEscTornasol(c, a) {
  if (typeof c.createConicGradient !== 'function') return PP_ESC_TORNASOL[Math.floor(Math.abs(a) * 2) % (PP_ESC_TORNASOL.length - 1)];
  const gr = c.createConicGradient(a, 0, 0);
  PP_ESC_TORNASOL.forEach((col, k) => gr.addColorStop(k / (PP_ESC_TORNASOL.length - 1), col));
  return gr;
}
// el brillo: un halo suave que late, un aro tornasolado que gira, un velo de arcoíris sobre la burbuja y 3 destellos que dan vueltas
function ppEscBrillo(c, x, y, r, t) {
  const late = 0.5 + 0.5 * Math.sin(t * 3.2);
  c.save(); c.translate(x, y);
  const halo = c.createRadialGradient(0, 0, r * 0.9, 0, 0, r * (1.6 + 0.2 * late));
  halo.addColorStop(0, `rgba(255,214,240,${0.7 + 0.3 * late})`); halo.addColorStop(0.5, `rgba(255,236,170,${0.35 + 0.2 * late})`); halo.addColorStop(1, 'rgba(255,236,170,0)');
  c.beginPath(); c.arc(0, 0, r * 1.85, 0, Math.PI * 2); c.fillStyle = halo; c.fill();
  c.globalAlpha = 0.2 + 0.1 * late;
  c.beginPath(); c.arc(0, 0, r * 0.98, 0, Math.PI * 2); c.fillStyle = ppEscTornasol(c, -t * 0.8); c.fill();
  c.globalAlpha = 1; c.shadowColor = '#ffffff'; c.shadowBlur = r * (0.3 + 0.3 * late);
  c.beginPath(); c.arc(0, 0, r * (1.12 + 0.05 * late), 0, Math.PI * 2); c.lineWidth = r * 0.24; c.strokeStyle = ppEscTornasol(c, t * 1.3); c.stroke();
  c.shadowBlur = 0;
  for (let k = 0; k < 3; k++) {
    const a = t * 1.1 + k * Math.PI * 2 / 3, d = r * (1.32 + 0.06 * Math.sin(t * 2 + k));
    ppEscDestello(c, Math.cos(a) * d, Math.sin(a) * d, r * (0.24 + 0.08 * Math.sin(t * 4 + k * 2)), PP_ESC_TORNASOL[k * 2]);
  }
  c.restore();
}
// un destello de cuatro puntas, blanco con un aura de su color (sin contorno)
function ppEscDestello(c, x, y, s, col) {
  c.save(); c.translate(x, y); c.shadowColor = col; c.shadowBlur = s * 1.6; c.fillStyle = '#ffffff';
  c.beginPath(); c.moveTo(0, -s); c.quadraticCurveTo(0, 0, s, 0); c.quadraticCurveTo(0, 0, 0, s); c.quadraticCurveTo(0, 0, -s, 0); c.quadraticCurveTo(0, 0, 0, -s);
  c.fill(); c.restore();
}
// el compañero salta fuera de la burbuja y se va desvaneciendo (1,2 s)
function ppEscSalto(c, b, r, t) {
  const s = b.salto;
  if (s.t0 === null) s.t0 = t;
  const k = (t - s.t0) / 1.2;
  if (k >= 1) { b.salto = null; return; }
  const y = s.y - Math.sin(Math.min(1, k * 1.4) * Math.PI / 2) * 120;
  ppSlimeRepuestoOImagen(c, b.id, s.x, y, r * (0.7 + 0.4 * Math.min(1, k * 2)), t, 1 - Math.max(0, (k - 0.6) / 0.4));
}
