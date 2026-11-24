// Fans of Island · prototipo Brotito 3D, visor para comparar: un solo Brotito (mundo.js) dibujado seis veces a la vez, de cerca. Arriba, como
// está hoy: en lonchas (vista-lonchas.js, con la misma cámara) y con los dos modelos 3D (brotito.glb, desde el render; brotito-vinilo.glb,
// desde la figura de vinilo). Abajo, lo mismo en alta resolución (lonchas x4 y brotito-hd.glb, brotito-vinilo-hd.glb).
// Todos los botones y la cámara (arrastrar cualquiera o «Dar vueltas») valen para los seis a la vez.
'use strict';
import './brotito-3d.js';

const $ = id => document.getElementById(id);
while (IS.TAREAS.length) IS.TAREAS.shift()(null);
const proto = IS.Prototipo3D.crea();
const lonchas = [IS.VistaLonchas.crea($('lonchas')), IS.VistaLonchas.crea($('lonchas-hd'), 4)];   // las del juego y las de alta resolución
// lo que comparten los tres: la cámara (giro y altura) y las opciones de dibujo
const estado = { vueltas: false, vistas: [], cam: { yaw: 0, elev: IS.VistaLonchas.ELEV_JUEGO }, opciones: { suave: true, contorno: true } };

const todas = (f) => { for (const v of estado.vistas) f(v); };
function giraTodas(yaw, elev) {
  estado.cam.yaw = yaw; if (elev !== undefined) estado.cam.elev = elev;
  todas(v => v.vista.gira(estado.cam.yaw, estado.cam.elev));
}
function ponOpcion(nombre, valor) { estado.opciones[nombre] = valor; todas(v => { v.opciones[nombre] = valor; }); }

function arrastrar(lienzo) {   // arrastrar las lonchas gira la cámara de los tres, igual que arrastrar un 3D
  let antes = null;
  lienzo.addEventListener('pointerdown', ev => { antes = { x: ev.clientX, y: ev.clientY }; lienzo.setPointerCapture(ev.pointerId); });
  lienzo.addEventListener('pointermove', ev => {
    if (!antes) return;
    const elev = Math.min(1.35, Math.max(0.02, estado.cam.elev + (ev.clientY - antes.y) * 0.006));
    giraTodas(estado.cam.yaw - (ev.clientX - antes.x) * 0.008, elev);
    antes = { x: ev.clientX, y: ev.clientY };
  });
  lienzo.addEventListener('pointerup', () => { antes = null; });
}

function botones() {
  const marca = b => { for (const x of document.querySelectorAll('[data-grupo="postura"]')) x.classList.toggle('activo', x === b); };
  for (const b of document.querySelectorAll('[data-postura]')) b.addEventListener('click', () => { proto.estado.fija = b.dataset.postura || null; marca(b); });
  $('pisar').addEventListener('click', () => { proto.estado.fija = null; marca($('libre')); proto.pisa(); });
  const interruptor = (id, leer, poner) => {
    const b = $(id); b.classList.toggle('activo', leer());
    b.addEventListener('click', () => { poner(!leer()); b.classList.toggle('activo', leer()); });
  };
  interruptor('lento', () => proto.estado.lento, v => { proto.estado.lento = v; });
  interruptor('suave', () => estado.opciones.suave, v => ponOpcion('suave', v));
  interruptor('borde', () => estado.opciones.contorno, v => ponOpcion('contorno', v));
  interruptor('vueltas', () => estado.vueltas, v => { estado.vueltas = v; });
  $('frente').addEventListener('click', () => {
    estado.vueltas = false; $('vueltas').classList.remove('activo');
    todas(x => { x.vista.deJuego(); x.vista.cerca(); });
    giraTodas(0, IS.VistaLonchas.ELEV_JUEGO);
  });
  arrastrar($('lonchas')); arrastrar($('lonchas-hd'));
}

async function cargaVistas() {
  const modelos = [['render', 'brotito.glb'], ['vinilo', 'brotito-vinilo.glb'], ['render-hd', 'brotito-hd.glb'], ['vinilo-hd', 'brotito-vinilo-hd.glb']];
  for (const [id, ruta] of modelos) {
    try {
      const v = await IS.Vista3D.crea($(id), ruta, g => giraTodas(g.yaw, g.elev));
      v.vista.cerca(); v.vista.gira(estado.cam.yaw, estado.cam.elev);   // si llega tarde, con la cámara que ya tengan los demás
      Object.assign(v.opciones, estado.opciones);
      estado.vistas.push(v);
    } catch (e) {
      $('aviso').textContent += `No se pudo cargar ${ruta}: ${e.message}. `;
      console.error(e);   // la caja negra del navegador: las demás vistas siguen
    }
  }
}

function arranca() {
  botones();
  cargaVistas();   // sin esperar: cada modelo se suma al bucle cuando llega
  let antes = performance.now();
  const vuelta = ahora => {
    const dtReal = Math.min(0.05, (ahora - antes) / 1000), dt = dtReal * (proto.estado.lento ? 0.25 : 1); antes = ahora;
    proto.paso(dt);
    if (estado.vueltas) giraTodas(estado.cam.yaw + dtReal * 0.8);
    for (const l of lonchas) l.pinta(proto, estado.cam, estado.opciones, dt);
    todas(v => v.pinta(proto, dt));
    $('estado').textContent = proto.estado.e.muerto ? 'pisado' : proto.postura();
    requestAnimationFrame(vuelta);
  };
  requestAnimationFrame(vuelta);
}
arranca();
