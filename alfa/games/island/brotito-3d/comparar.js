// Fans of Island · prototipo Brotito 3D, visor para comparar: un solo Brotito (mundo.js) dibujado tres veces a la vez, de cerca: en lonchas
// (recortado del lienzo del juego y ampliado sin suavizar) y con los dos modelos 3D (brotito.glb, desde el render; brotito-vinilo.glb,
// desde la figura de vinilo). Las dos cámaras 3D giran juntas, a mano o con «Dar vueltas».
'use strict';
import './brotito-3d.js';

const $ = id => document.getElementById(id);
const LADO = 60;   // el recorte de las lonchas: lo mismo que se ve de alto en el 3D de cerca
while (IS.TAREAS.length) IS.TAREAS.shift()(null);
const proto = IS.Prototipo3D.crea();
const mundo = document.createElement('canvas');
mundo.width = IS.Prototipo3D.ANCHO; mundo.height = IS.Prototipo3D.ALTO;
const lonchas = $('lonchas');
lonchas.width = LADO; lonchas.height = LADO;
const estado = { vueltas: false, vistas: [] };

function pintaLonchas() {   // el lienzo entero del juego, fuera de la pantalla, y de él solo el trozo del Brotito
  IS.Prototipo3D.pinta(mundo, proto);
  const p = IS.Prototipo3D.enLienzo(proto.estado.e), g = lonchas.getContext('2d');
  g.imageSmoothingEnabled = false;
  g.fillStyle = '#7fd3ff'; g.fillRect(0, 0, LADO, LADO);   // si el recorte se sale del lienzo, cielo en vez del fotograma anterior
  g.drawImage(mundo, p.x - LADO / 2, p.y - LADO * 0.7, LADO, LADO, 0, 0, LADO, LADO);
}

const todas = (f) => { for (const v of estado.vistas) f(v); };
const giraTodas = (yaw, elev) => todas(v => v.vista.gira(yaw, elev));

function botones() {
  const marca = b => { for (const x of document.querySelectorAll('[data-grupo="postura"]')) x.classList.toggle('activo', x === b); };
  for (const b of document.querySelectorAll('[data-postura]')) b.addEventListener('click', () => { proto.estado.fija = b.dataset.postura || null; marca(b); });
  $('pisar').addEventListener('click', () => { proto.estado.fija = null; marca($('libre')); proto.pisa(); });
  const interruptor = (id, leer, poner) => {
    const b = $(id); b.classList.toggle('activo', leer());
    b.addEventListener('click', () => { poner(!leer()); b.classList.toggle('activo', leer()); });
  };
  interruptor('lento', () => proto.estado.lento, v => { proto.estado.lento = v; });
  interruptor('suave', () => estado.vistas[0]?.opciones.suave, v => todas(x => { x.opciones.suave = v; }));
  interruptor('borde', () => estado.vistas[0]?.opciones.contorno, v => todas(x => { x.opciones.contorno = v; }));
  interruptor('vueltas', () => estado.vueltas, v => { estado.vueltas = v; });
  $('frente').addEventListener('click', () => { estado.vueltas = false; $('vueltas').classList.remove('activo'); todas(x => { x.vista.deJuego(); x.vista.cerca(); }); });
}

async function cargaVistas() {
  for (const [id, ruta] of [['render', 'brotito.glb'], ['vinilo', 'brotito-vinilo.glb']]) {
    try {
      const v = await IS.Vista3D.crea($(id), ruta, g => giraTodas(g.yaw, g.elev));
      v.vista.cerca();
      estado.vistas.push(v);
    } catch (e) {
      $('aviso').textContent += `No se pudo cargar ${ruta}: ${e.message}. `;
      console.error(e);   // la caja negra del navegador: las demás vistas siguen
    }
  }
}

async function arranca() {
  await cargaVistas();
  botones();
  let antes = performance.now();
  const vuelta = ahora => {
    const dtReal = Math.min(0.05, (ahora - antes) / 1000), dt = dtReal * (proto.estado.lento ? 0.25 : 1); antes = ahora;
    proto.paso(dt);
    if (estado.vueltas && estado.vistas.length) giraTodas(estado.vistas[0].vista.giro() + dtReal * 0.8);
    pintaLonchas();
    todas(v => v.pinta(proto, dt));
    $('estado').textContent = proto.estado.e.muerto ? 'pisado' : proto.postura();
    requestAnimationFrame(vuelta);
  };
  requestAnimationFrame(vuelta);
}
arranca();
