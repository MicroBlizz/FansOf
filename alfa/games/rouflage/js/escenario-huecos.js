// Fans of Rouflage · MIS ESCENARIOS: los HUECOS de guardado (decidido por Daniel el 27-10-2026). Puedes tener hasta 3 escenarios distintos (su
// escenario o lienzo, muebles, pintura y pegatinas) y eliges cuál usas: el que usas es el que ven tus amigos y donde se juega. El primero es
// gratis; el 2.º y el 3.º se compran en la tienda (escenarios: hueco2 y hueco3, con Acciones o Gotas; en la alfa y en localhost, abiertos para
// probar). El que usas vive en SAVE.escenario como siempre (así todo lo demás no cambia); los otros, en SAVE.escHuecos.h. Aquí también está
// la ventana de «¿SEGURO?» (escSeguro) de NUEVO y de BORRAR TODO. Va después de escenario-obra3.js.
'use strict';

const HUECOS_ESC = 3;

// los huecos en la tienda (como los tamaños del lienzo, escenario-obra2.js): sg, no salen en el gachapón
(() => {
  const cat = arCat('escenarios'); if (!cat || cat.items.some(it => it.hueco)) return;
  cat.items.push({ id: 'hueco2', n: 'Segundo escenario', r: 'epica', de: 'tienda', txt: 300, hueco: 2, sg: true, x: (c, w) => escHuecoDibujo(c, w, 2) },
    { id: 'hueco3', n: 'Tercer escenario', r: 'legend', de: 'tienda', txt: 500, hueco: 3, sg: true, x: (c, w) => escHuecoDibujo(c, w, 3) });
})();
// el dibujo de un hueco: una casita con su número
function escHuecoDibujo(c, w, n) {
  const s = w / 64; c.save(); c.scale(s, s); c.lineJoin = 'round';
  c.fillStyle = n === 3 ? '#ffcb3d' : '#9fd0ff'; c.strokeStyle = OL; c.lineWidth = 4;
  c.beginPath(); c.moveTo(10, 30); c.lineTo(32, 10); c.lineTo(54, 30); c.lineTo(50, 30); c.lineTo(50, 54); c.lineTo(14, 54); c.lineTo(14, 30); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#20102c'; c.font = '900 22px ' + (getComputedStyle(document.body).getPropertyValue('--font-display') || 'sans-serif'); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(n), 32, 40);
  c.restore();
}

function escHuecos() {
  const H = SAVE.escHuecos && Array.isArray(SAVE.escHuecos.h) ? SAVE.escHuecos : (SAVE.escHuecos = { act: 0, h: [] });
  while (H.h.length < HUECOS_ESC) H.h.push(null);
  if (!(H.act >= 0 && H.act < HUECOS_ESC)) H.act = 0;
  return H;
}
const escHuecoItem = n => arCat('escenarios').items.find(it => it.hueco === n + 1);      // n: 0, 1, 2
function escHuecoTuyo(n) {
  if (n === 0) return true;
  const it = escHuecoItem(n); return !!it && (arTiene('escenarios', it) || (typeof arPruebasVisibles === 'function' && arPruebasVisibles()));
}
// los datos guardados de un hueco (el que usas: SAVE.escenario)
const escHuecoDatos = n => (n === escHuecos().act ? SAVE.escenario : escHuecos().h[n]) || null;
function escHuecoLibre() { const H = escHuecos(); for (let n = 0; n < HUECOS_ESC; n++) if (n !== H.act && escHuecoTuyo(n) && !H.h[n]) return n; return -1; }

// cambiar al hueco n (si está vacío, se abre EMPEZAR UN LIENZO para elegir cómo empezarlo; luego: lo que se hace después, en su lugar)
function escHuecoUsa(n, luego) {
  const H = escHuecos(); if (n === H.act) { E('esc-huecos').hidden = true; return; }
  if (MIESC.yo) escGuarda();
  if (typeof PINCEL_ESC !== 'undefined' && PINCEL_ESC.herr === 'sel') escSelSuelta();
  const vacio = !H.h[n];
  H.h[H.act] = SAVE.escenario ? JSON.parse(JSON.stringify(SAVE.escenario)) : null;
  SAVE.escenario = H.h[n] || { v: 2, id: 'lienzo' };
  H.h[n] = null; H.act = n;
  delete ESC_LZ['lienzo~mio']; delete _escMundos['lienzo~mio']; delete _escIconos['lienzo~mio'];
  MIESC.sala = null; MIESC.yo = null; MIESC.sel = null;
  PINCEL_ESC.pasos.length = 0; PINCEL2.rehacer.length = 0; OBRA.pasos.length = 0; escSelOlvida();
  guardaPartida(); E('esc-huecos').hidden = true;
  abreEscenario(); escHuecoBoton();
  play('levelup'); escAviso(tr('Escenario {n}', { n: n + 1 }));
  if (luego) setTimeout(luego, 250); else if (vacio) setTimeout(obraElige, 250);
}

/* ---------- la ventana MIS ESCENARIOS ---------- */
function escHuecosAbre() {
  let v = E('esc-huecos');
  if (!v) {
    v = document.createElement('div'); v.id = 'esc-huecos'; v.className = 'obra-elige'; v.hidden = true;
    v.innerHTML = '<div class="caja obra-elige-caja"><h3 class="ol"></h3><p class="nota-sala"></p><div class="obra-elige-lista esc-huecos-lista" id="esc-huecos-lista"></div><button type="button" class="boton gris peq" id="b-esc-huecos-no"></button></div>';
    E('p-escenario').appendChild(v);
    E('b-esc-huecos-no').onclick = () => { play('select'); v.hidden = true; };
    v.addEventListener('pointerdown', e => { if (e.target === v) v.hidden = true; });
  }
  v.querySelector('h3').textContent = tr('MIS ESCENARIOS');
  v.querySelector('p').textContent = tr('Guarda hasta 3 escenarios distintos. El que usas es el que ven tus amigos y donde se juega.');
  E('b-esc-huecos-no').textContent = tr('CERRAR');
  const H = escHuecos(), lista = E('esc-huecos-lista'); lista.innerHTML = '';
  for (let n = 0; n < HUECOS_ESC; n++) {
    const d = escHuecoDatos(n), tuyo = escHuecoTuyo(n), usa = n === H.act, it = escHuecoItem(n);
    const b = document.createElement('button'); b.type = 'button'; b.className = 'esc-carta esc-hueco ' + (usa ? 'r-epica obra-mio' : tuyo ? 'r-comun' : 'r-' + (it ? it.r : 'comun') + ' bloq');
    const k = arLienzo(64, 64);
    if (d) { const id = d.id === 'lienzo' ? (usa ? lzMio() : lzDeDatos(d.lz)) : d.id; arPinta(k, (c, w) => escenarioIcono(c, w, ESCENARIOS[escBase(id)] ? id : 'oficina')); }
    else arPinta(k, (c, w) => escHuecoDibujo(c, w, n + 1));
    b.appendChild(k);
    const t = document.createElement('small'); t.textContent = tr('Escenario {n}', { n: n + 1 }); b.appendChild(t);
    const e = document.createElement('i'); e.className = 'esc-rar';
    e.textContent = usa ? tr('EN USO') : !tuyo ? (it ? arTextoDe(it) : '') : d ? tr('{n} muebles', { n: (d.m || []).length }) : tr('Vacío');
    b.appendChild(e);
    if (!tuyo) { const cd = arLienzo(22, 22, 'ar-candado'); arPinta(cd, (c, w) => ARD.ICONOS.candado(c, w)); b.appendChild(cd); }
    b.onclick = () => {
      if (!tuyo) { if (it) { play('select'); escGuarda(); v.hidden = true; arPideCompra(arCat('escenarios'), it); } return; }
      play('select'); escHuecoUsa(n);
    };
    lista.appendChild(b);
  }
  v.hidden = false;
}
// el botón de arriba (junto a MI ESCENARIO): qué hueco usas
function escHuecoBoton() {
  let b = E('b-esc-huecos');
  if (!b) {
    b = document.createElement('button'); b.type = 'button'; b.id = 'b-esc-huecos'; b.className = 'boton peq esc-huecos-b';
    b.innerHTML = '<i></i><b></b>'; ponIcono(b.firstChild, 'casa');
    b.onclick = () => { play('select'); escHuecosAbre(); };
    const h2 = E('esc-arriba').querySelector('h2'); h2.after(b);
  }
  b.title = tr('MIS ESCENARIOS'); b.setAttribute('aria-label', tr('MIS ESCENARIOS'));
  b.lastChild.textContent = (escHuecos().act + 1) + '/' + HUECOS_ESC;
}

/* ---------- la ventana de «¿SEGURO?» ---------- */
// otros: [[texto, alTocar], …] botones de más (por ejemplo, empezar en otro hueco)
function escSeguro(titulo, texto, si, alSi, otros = []) {
  let v = E('esc-seguro');
  if (!v) {
    v = document.createElement('div'); v.id = 'esc-seguro'; v.className = 'obra-elige'; v.hidden = true;
    v.innerHTML = '<div class="caja obra-elige-caja esc-seguro-caja"><h3 class="ol"></h3><p class="nota-sala"></p><div class="esc-seguro-botones"></div></div>';
    E('p-escenario').appendChild(v);
    v.addEventListener('pointerdown', e => { if (e.target === v) v.hidden = true; });
  }
  v.querySelector('h3').textContent = titulo; v.querySelector('p').textContent = texto;
  const f = v.querySelector('.esc-seguro-botones'); f.innerHTML = '';
  const boton = (txt, clase, fn) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'boton peq ' + clase; b.textContent = txt; b.onclick = () => { v.hidden = true; fn(); }; f.appendChild(b); };
  for (const [txt, fn] of otros) boton(txt, 'verde', () => { play('select'); fn(); });
  boton(si, 'rojo', () => alSi());
  boton(tr('CANCELAR'), 'gris', () => play('select'));
  play('deny'); v.hidden = false;
}
// NUEVO (empezar un lienzo en blanco o desde una plantilla) pisa la forma de tu lienzo: antes, «¿seguro?», y si tienes un hueco libre, la opción de empezarlo ahí
function obraEmpiezaSeguro(lz) {
  const tuyo = lzMioTexto(); if (!tuyo || tuyo === lzCodifica(lzNuevo())) { lzEmpieza(lz); return; }      // un lienzo sin tocar: nada que perder
  const libre = escHuecoLibre();
  E('obra-elige').hidden = true;
  escSeguro(tr('¿CAMBIAR TU LIENZO?'), tr('Las paredes, los suelos y las puertas de tu lienzo se cambiarán por los nuevos. Los muebles y la pintura se quedan.'), tr('CAMBIAR ESTE'), () => { play('select'); lzEmpieza(lz); },
    libre >= 0 ? [[tr('EN EL ESCENARIO {n}', { n: libre + 1 }), () => escHuecoUsa(libre, () => lzEmpieza(lz))]] : []);
}
