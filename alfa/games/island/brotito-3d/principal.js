// Fans of Island · prototipo Brotito 3D, arranque: fabrica las lonchas de Brotito (IS.TAREAS), monta el mundo (mundo.js), la vista 3D
// (brotito-3d.js) y los botones, y lleva el bucle: un solo estado, dibujado en lonchas arriba y en 3D abajo.
'use strict';
import './brotito-3d.js';

const $ = id => document.getElementById(id);
while (IS.TAREAS.length) IS.TAREAS.shift()(null);
const proto = IS.Prototipo3D.crea();
const lonchas = $('lonchas');
lonchas.width = IS.Prototipo3D.ANCHO; lonchas.height = IS.Prototipo3D.ALTO;

function botones(vista3d) {
  const marca = (grupo, b) => { for (const x of document.querySelectorAll(`[data-grupo="${grupo}"]`)) x.classList.toggle('activo', x === b); };
  for (const b of document.querySelectorAll('[data-postura]')) {
    b.addEventListener('click', () => { proto.estado.fija = b.dataset.postura || null; marca('postura', b); });
  }
  $('pisar').addEventListener('click', () => { proto.estado.fija = null; marca('postura', $('libre')); proto.pisa(); });
  const interruptor = (id, leer, poner) => {
    const b = $(id); b.classList.toggle('activo', leer());
    b.addEventListener('click', () => { poner(!leer()); b.classList.toggle('activo', leer()); });
  };
  interruptor('lento', () => proto.estado.lento, v => { proto.estado.lento = v; });
  interruptor('suave', () => vista3d.opciones.suave, v => { vista3d.opciones.suave = v; });
  interruptor('borde', () => vista3d.opciones.contorno, v => { vista3d.opciones.contorno = v; });
  $('juego').addEventListener('click', () => vista3d.vista.deJuego());
  $('cerca').addEventListener('click', () => vista3d.vista.cerca());
  $('zana').addEventListener('click', () => { proto.estado.siguiendo = false; proto.estado.J.x = 99999; });
  const pedida = new URLSearchParams(location.search).get('postura');   // ?postura=aterriza abre con esa postura fija (para comparar o enlazar)
  const b = pedida && document.querySelector(`[data-postura="${CSS.escape(pedida)}"]`);
  if (b) b.click();
  if (new URLSearchParams(location.search).has('cerca')) vista3d.vista.cerca();
}

function ponZanahoria(ev) {   // tocar la isla de arriba pone la zanahoria: el Brotito brinca hacia ella si está a menos de 150
  const r = lonchas.getBoundingClientRect();
  proto.estado.J.x = IS.Prototipo3D.xMundo((ev.clientX - r.left) / r.width);
  proto.estado.siguiendo = true;
}
lonchas.addEventListener('pointerdown', ponZanahoria);

async function arranca() {
  let vista3d = null;
  try {
    const vinilo = new URLSearchParams(location.search).get('modelo') === 'vinilo';   // ?modelo=vinilo: el hecho desde la figura de vinilo
    $(vinilo ? 'm-vinilo' : 'm-render').classList.add('activo');
    vista3d = await IS.Vista3D.crea($('tres'), vinilo ? 'brotito-vinilo.glb' : 'brotito.glb');
    botones(vista3d);
  } catch (e) {
    $('aviso').textContent = 'No se pudo cargar el modelo 3D: ' + e.message;
    console.error(e);   // la caja negra del navegador: el prototipo sigue con las lonchas
  }
  let antes = performance.now();
  const vuelta = ahora => {
    const dt = Math.min(0.05, (ahora - antes) / 1000) * (proto.estado.lento ? 0.25 : 1); antes = ahora;
    proto.paso(dt);
    IS.Prototipo3D.pinta(lonchas, proto);
    if (vista3d) vista3d.pinta(proto, dt);
    $('estado').textContent = proto.estado.e.muerto ? 'pisado' : proto.postura();
    requestAnimationFrame(vuelta);
  };
  requestAnimationFrame(vuelta);
}
arranca();
