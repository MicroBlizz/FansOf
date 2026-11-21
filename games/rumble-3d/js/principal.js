// Boceto 3D de Fans of Rumble · El arranque: monta el escenario, la pantalla de inicio, los botones, las cartas (con
// el retrato 3D de cada unidad), los dos modos (la misión y el modo libre), los toques en el campo, el bucle de dibujo
// y el medidor de fluidez (FPS = cuántas
// imágenes por segundo pinta el móvil: 60 es perfecto, 30 se juega bien, menos de 20 se nota a tirones).
'use strict';
import * as THREE from './three.min.js';
import { crearDibujante, crearEscena, crearSuelo, crearRio, crearCiudad, encuadre, sueloEn, CAMPO, CAMINOS } from './escena.js';
import { crearPuentes, crearDecorado, SITIOS } from './edificios.js';
import { Efectos } from './efectos.js';
import { Partida, EDIF } from './partida.js';
import { MODELOS } from './modelos.js';
import { Especie, nuevaPose, animar } from './munecos.js';
import { despertarAudio, VOZ } from './voces.js';
import { poner, arrancarPendiente, musicaOn } from './musica.js';
import { Mision } from './mision.js';
import { tr, traducirPagina } from './textos.js';

const $ = id => document.getElementById(id);
traducirPagina();
// el cartel de Microblizz usa la letra del juego: se espera a que cargue (como mucho 1,5 s)
try { await Promise.race([document.fonts.load('40px "Luckiest Guy"'), new Promise(r => setTimeout(r, 1500))]); } catch (e) { /* sin letra especial */ }

let dibujante;
try { dibujante = crearDibujante($('lienzo')); } catch (e) {
  $('inicio').querySelector('.panel').innerHTML = `<p class="error">${tr('Tu navegador no puede mostrar 3D (WebGL).')}</p>`;
  throw e;
}

/* ---------- el escenario ---------- */
const escena = crearEscena();
const camara = new THREE.PerspectiveCamera(40, 1, 1, 400);
const distCamino = (x, z) => {
  let m = 99;
  for (const c of CAMINOS) for (let i = 0; i < c.length - 1; i++) {
    const [ax, az] = c[i], [bx, bz] = c[i + 1], dx = bx - ax, dz = bz - az;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz)));
    m = Math.min(m, Math.hypot(x - (ax + dx * t), z - (az + dz * t)));
  }
  return m;
};
crearSuelo(escena, (x, z, m) => distCamino(x, z) < m);
const rioT = crearRio(escena);
crearCiudad(escena);
crearPuentes(escena);
crearDecorado(escena, (x, z, m) => distCamino(x, z) > m + 1 && Math.abs(z) > 4.5 && Math.abs(x) < 24 && Math.abs(z) < 34
  && SITIOS.every(s => Math.hypot(x - s.x, z - s.z) > s.r + m) && !(Math.abs(z) > 6 && Math.abs(z) < 15 && Math.abs(Math.abs(x) - 16) < 6));
const efectos = new Efectos(escena, camara, $('capa'));
const partida = new Partida(escena, efectos);

/* ---------- los retratos 3D de las cartas ---------- */
function retrato(tipo, lienzo) {
  const mini = new THREE.Scene();
  mini.add(new THREE.HemisphereLight(0xfff1e0, 0x6a5a86, 1.7));
  const sol = new THREE.DirectionalLight(0xfff4e0, 2.4); sol.position.set(-3, 5, 6); mini.add(sol);
  const def = MODELOS[tipo], especie = new Especie(mini, def, 1);
  const u = { x: 0, y: 0, z: 0, yaw: 0.35, tipo, def, pose: nuevaPose(def), estado: 'pose', mueve: 0, paso: 0, ataque: -1, aplasta: 0, golpe: 0, habla: 0, silaba: 0, destello: 0, id: 3, estadoT: 0 };
  animar(u, 0.25); especie.pintar([u]);
  const alto = def.alto, cam = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  cam.position.set(0, alto * 0.62, alto * 2.5); cam.lookAt(0, alto * 0.5, 0);
  const T = 256, rt = new THREE.WebGLRenderTarget(T, T, { samples: 4 });
  rt.texture.colorSpace = THREE.SRGBColorSpace;
  dibujante.setClearColor(0x000000, 0);
  dibujante.setRenderTarget(rt); dibujante.clear(); dibujante.render(mini, cam); dibujante.setRenderTarget(null);
  const px = new Uint8Array(T * T * 4); dibujante.readRenderTargetPixels(rt, 0, 0, T, T, px);
  const img = new ImageData(T, T);
  for (let y = 0; y < T; y++) img.data.set(px.subarray((T - 1 - y) * T * 4, (T - y) * T * 4), y * T * 4);   // viene boca abajo
  lienzo.width = lienzo.height = T; lienzo.getContext('2d').putImageData(img, 0, 0);
  rt.dispose();
}
for (const b of document.querySelectorAll('.carta')) retrato(b.dataset.carta, b.querySelector('canvas'));

/* ---------- tamaño y cámara ---------- */
let modoCamara = 'lejos', calidad = 'alta', base = null, ancho = 1, alto = 1, modo = 'portada', musica = true;
const camPos = new THREE.Vector3(0, 80, 60), camMira = new THREE.Vector3(), temblor = new THREE.Vector3();
const destino = { posicion: new THREE.Vector3(), objetivo: new THREE.Vector3() };
function ajustar(salto = false) {
  ancho = innerWidth; alto = innerHeight;
  dibujante.setPixelRatio(calidad === 'alta' ? Math.min(devicePixelRatio || 1, 2) : 1);
  dibujante.setSize(ancho, alto, false);
  efectos.tam(ancho, alto);
  const arriba = $('botones').getBoundingClientRect().bottom + 4, abajo = alto - $('bandeja').getBoundingClientRect().top + 4;
  base = encuadre(camara, ancho, alto, arriba, abajo, modoCamara);
  const dist = base.posicion.distanceTo(base.objetivo);
  escena.fog.near = dist * (modoCamara === 'cerca' ? 1.8 : 1.25); escena.fog.far = escena.fog.near + 120;
  if (salto) { camPos.copy(base.posicion); camMira.copy(base.objetivo); }
}
// a dónde mira la cámara en este fotograma: la escena de la misión, la unidad que sigue (de cerca) o el campo entero
function apuntar() {
  const f = modo === 'mision' && mision.foco;
  if (f) {
    const [x, z, dist, inclina] = f;
    destino.objetivo.set(x, 0, z); destino.posicion.set(x, Math.sin(inclina) * dist, z + Math.cos(inclina) * dist);
    escena.fog.near = 200; return;
  }
  escena.fog.near = base.posicion.distanceTo(base.objetivo) * (modoCamara === 'cerca' ? 1.8 : 1.25);
  if (base.desde) {
    const u = partida.protagonista();
    if (u) { base.objetivo.set(u.x, 0, u.z - 2); base.posicion.copy(base.objetivo).add(base.desde); }
  }
  destino.objetivo.copy(base.objetivo); destino.posicion.copy(base.posicion);
}
addEventListener('resize', () => ajustar());
ajustar(true);

/* ---------- la misión ---------- */
const mision = new Mision(partida, efectos, {
  comentar(texto, seg) {
    const c = $('comentario'); c.querySelector('span').textContent = texto; c.hidden = false;
    clearTimeout(this.ct); this.ct = setTimeout(() => { c.hidden = true; }, seg * 1000);
  },
  objetivo(texto) { const o = $('objetivo'); o.textContent = texto; o.hidden = !texto; },
  saltar(si, boton = true) { $('saltar').hidden = !(si && boton); $('seguir').hidden = !si; document.body.classList.toggle('escena', si); },
  final(gana) {
    const f = $('final'); f.className = gana ? 'gana' : 'pierde';
    f.querySelector('h2').textContent = tr(gana ? '¡Victoria!' : '¡Derrota!');
    f.querySelector('p').textContent = tr(gana ? 'La Madriguera sigue en pie y el juego sigue abierto.' : 'Microblizz ha cerrado el juego… por ahora.');
    f.hidden = false;
  },
});
function jugarMision() {
  despertarAudio(); modo = 'mision';
  document.body.classList.remove('libre'); $('inicio').hidden = true; $('final').hidden = true; $('fin').hidden = true;
  mision.empezar();
}
function jugarLibre() {
  despertarAudio(); modo = 'libre'; mision.fase = 'nada';
  document.body.classList.add('libre'); document.body.classList.remove('escena');
  $('inicio').hidden = true; $('final').hidden = true; $('objetivo').hidden = true; $('saltar').hidden = true; $('seguir').hidden = true;
  partida.reiniciar(); partida.modo = 'libre'; partida.sinBarras = false;
  for (const e of partida.edificios) e.max = e.vida = EDIF[e.tipo].vida;
  poner('animales');
}
$('empezar').onclick = jugarMision; $('otra').onclick = jugarMision;
$('libre').onclick = jugarLibre; $('irLibre').onclick = jugarLibre;
$('saltar').onclick = () => mision.saltarIntro();
document.body.classList.add('libre');   // detrás de la portada se juega solo, en modo libre

/* ---------- botones ---------- */
const VOCES = [['inventada', 'Inventada'], ['movil', 'Del móvil'], ['nada', 'Sin voz']];
function rotulos() {
  $('vCamara').textContent = tr(modoCamara === 'lejos' ? 'Lejos' : 'Cerca');
  $('vVoz').textContent = tr(VOCES.find(v => v[0] === VOZ.modo)[1]);
  $('vCalidad').textContent = tr(calidad === 'alta' ? 'Sí' : 'No');
  $('vMusica').textContent = tr(musica ? 'Sí' : 'No');
}
rotulos();
$('bCamara').onclick = () => { modoCamara = modoCamara === 'lejos' ? 'cerca' : 'lejos'; ajustar(); rotulos(); };
$('bVoz').onclick = () => { const i = VOCES.findIndex(v => v[0] === VOZ.modo); VOZ.modo = VOCES[(i + 1) % VOCES.length][0]; if ('speechSynthesis' in window && VOZ.modo !== 'movil') speechSynthesis.cancel(); rotulos(); };
$('bCalidad').onclick = () => { calidad = calidad === 'alta' ? 'baja' : 'alta'; ajustar(); rotulos(); muestras.length = 0; };
$('bMusica').onclick = () => { musica = !musica; musicaOn(musica); rotulos(); };
$('bMas').onclick = () => { partida.ultimoToque = partida.t; partida.avalancha(); muestras.length = 0; };
let carta = 'bunny';
const cartas = [...document.querySelectorAll('.carta')];
for (const b of cartas) b.onclick = () => {
  carta = b.dataset.carta;
  for (const o of cartas) o.classList.toggle('sel', o === b);
};
function pintarCartas() {
  if (modo !== 'mision') { for (const b of cartas) b.classList.remove('no'); return; }
  for (const b of cartas) b.classList.toggle('no', !mision.puede(b.dataset.carta));
  const o = $('oro');
  o.querySelector('i').style.width = `${(mision.oro / 10) * 100}%`;
  o.querySelector('span').textContent = Math.floor(mision.oro);
}

let avisoT = 0;
function aviso(texto) { const a = $('aviso'); a.textContent = texto; a.hidden = false; a.classList.remove('sale'); void a.offsetWidth; a.classList.add('sale'); clearTimeout(avisoT); avisoT = setTimeout(() => { a.hidden = true; }, 1400); }

// tocar el campo: en las escenas pasa a la siguiente frase; si no, suelta la carta elegida (solo en tu mitad)
$('lienzo').addEventListener('pointerdown', ev => {
  despertarAudio();
  if (!$('inicio').hidden || !$('final').hidden) return;
  if (modo === 'mision' && mision.enEscena()) { mision.toque(); return; }
  if (partida.fin) return;
  const p = sueloEn(camara, ev.clientX, ev.clientY, ancho, alto);
  if (!p || p.z < 4.5 || p.z > CAMPO.z1 - 2 || Math.abs(p.x) > CAMPO.x1 - 1) { aviso(tr('Solo en tu lado del campo')); return; }
  if (modo !== 'mision') { partida.pedir(carta, p.x, p.z); return; }
  if (!mision.puede(carta)) { aviso(tr(carta === 'bunny' && mision.oro >= 4 ? 'Solo un líder a la vez' : 'Te falta oro')); return; }
  mision.soltar(carta, p.x, p.z);
});

partida.alFin = lado => {
  const f = $('fin');
  if (!lado || modo === 'mision') { f.hidden = true; return; }
  f.querySelector('b').textContent = tr(lado === 'p' ? '¡Victoria!' : '¡Derrota!');
  f.querySelector('small').textContent = tr('Otra vez en 4 s');
  f.className = lado === 'p' ? 'gana' : 'pierde'; f.hidden = false;
};
/* ---------- el medidor de fluidez ---------- */
const muestras = [];
let cuenta = 0, desde = performance.now();
function medir(ahora) {
  cuenta++;
  if (ahora - desde < 500) return;
  muestras.push((cuenta * 1000) / (ahora - desde)); if (muestras.length > 6) muestras.shift();
  cuenta = 0; desde = ahora;
  const fps = muestras.reduce((a, b) => a + b, 0) / muestras.length;
  const [txt, clase] = fps >= 55 ? ['Muy fluido', 'bien'] : fps >= 30 ? ['Fluido', 'bien'] : fps >= 20 ? ['Justo', 'justo'] : ['Lento', 'mal'];
  $('fps').textContent = Math.round(fps);
  $('veredicto').textContent = tr(txt);
  $('medidor').className = clase;
  const n = partida.cuantos();
  $('cuantos').textContent = `${n} ${tr(n === 1 ? 'muñeco' : 'muñecos')}`;
  $('medidor').title = `${dibujante.info.render.calls} draw calls · ${dibujante.info.render.triangles} tris`;
}

/* ---------- el bucle: cada fotograma se mueve todo y se pinta ---------- */
let antes = performance.now();
function bucle(ahora) {
  requestAnimationFrame(bucle);
  const dt = Math.min(0.05, (ahora - antes) / 1000); antes = ahora;
  partida.actualizar(dt);
  if (modo === 'mision') mision.actualizar(dt);
  arrancarPendiente();
  rioT.value += dt;
  apuntar();
  const k = 1 - Math.exp(-dt * (modo === 'mision' && mision.foco ? 2.5 : 4));
  camPos.lerp(destino.posicion, k); camMira.lerp(destino.objetivo, k);
  camara.position.copy(camPos).add(efectos.sacudida(temblor)); camara.lookAt(camMira); camara.updateMatrixWorld();
  partida.pintar(camara);
  efectos.actualizar(dt);
  dibujante.render(escena, camara);
  medir(ahora);
  pintarCartas();
}
requestAnimationFrame(bucle);
window.__boceto = { partida, dibujante, camara, mision };   // para las pruebas automáticas
