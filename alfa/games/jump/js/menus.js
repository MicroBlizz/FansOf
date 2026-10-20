// Fans of Jump · Los menús: la portada (zanahorias, mejor marca, sonido, cuatro carteles y las órdenes de Microblizz en
// pósits) y lo que se abre encima, como fichas de carpeta: el puesto de Lola (tienda, con pestañas y tarjetas), los
// expedientes de Lola (guía), la hoja de reclamaciones (ajustes) y mis récords. Los botones se apuntan cada vez que se
// pintan (BOTONES) y el dedo los busca ahí; lo largo se mueve arrastrando.
'use strict';

const PANEL = { abierto: null, scroll: 0, alto: 0, pestana: 'amigos' };
let BOTONES = [];
const boton = (x, y, w, h, fn) => BOTONES.push({ x, y, w, h, fn });
function botonEn(x, y) { for (let i = BOTONES.length - 1; i >= 0; i--) { const b = BOTONES[i]; if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) return b; } return null; }

// lo que vende Lola: [clave, precio, nombre, qué hace]
const PUESTO = {
  amigos: [['ardilla', 0, 'MadSquirrel', 'Va contigo desde el principio. +5 en cada tronco.'], ['zorro', 150, 'SlyFox', 'Esquiva el primer ¡Uy! de cada partida.'],
    ['mapache', 300, 'JunkCoon', 'Contigo, las zanahorias valen el doble.'], ['suricata', 500, 'MeerCat', 'La enfermera: te saca del agua una vez.'],
    ['castor', 800, 'BoomBeaver', 'Al rescatarlo, ¡BUM!: la ola retrocede.']],
  pelaje: [['#ffffff', 0, 'Blanco'], ['#cfd0dc', 150, 'Gris oficina'], ['#b98a66', 400, 'Chocolate'], ['#f4c886', 750, 'Miel'], ['#ffc4dc', 1300, 'Rosa chicle'], ['#d8c0ff', 2500, 'Morado caos']],
  capas: [['#ff7a1a', 0, 'Naranja'], ['#e8343e', 180, 'Roja rebelde'], ['#3a86ff', 450, 'Azul Phony'], ['#3fbf6a', 700, 'Verde bosque'], ['#a04ae0', 1100, 'Morada'], ['#ffc93a', 2600, 'Dorada CEO']],
  kit: [['casco', 40, 'Casco de obra', 'Te saca del agua una vez en toda la partida.'], ['cafe', 30, 'Pausa del café', 'La ola espera 8 s antes de salir.'], ['suerte', 60, 'Zanahoria de la suerte', 'Empiezas la partida con racha de 3.'], ['mirilla', 50, 'Mirilla', 'Ves dónde caes en tus 8 primeros saltos.']],
};

/* ---------- iconos dibujados ---------- */
function iconoCarpeta(x, y) { caja(x - 5, y - 3.5, 10, 7.5, 1, '#f6c56a', OLC, 0.7); caja(x - 5, y - 5, 4.5, 2.4, 0.8, '#f6c56a', OLC, 0.7); caja(x - 3, y - 1, 6, 1, 0, '#c99316', null); }
function iconoCorona(x, y) { forma([x - 5, y + 3, x + 5, y + 3, x + 5.6, y - 3, x + 2.4, y - 0.6, x, y - 4.4, x - 2.4, y - 0.6, x - 5.6, y - 3], vol(x, y, 6, 5, '#ffd86a'), OLC, 0.7); }
function iconoHoja(x, y) { caja(x - 4, y - 5, 8, 10, 1, '#ffffff', OLC, 0.7); for (const d of [-2.4, 0, 2.4]) caja(x - 2.4, y + d, 4.8, 0.7, 0, PASTEL.lilaO, null); }
function iconoSonido(x, y, on) {
  forma([x - 4, y - 1.5, x - 2, y - 1.5, x + 1, y - 4, x + 1, y + 4, x - 2, y + 1.5, x - 4, y + 1.5], PASTEL.texto, null);
  G.lineWidth = 0.9; G.strokeStyle = PASTEL.texto; G.lineCap = 'round';
  if (on) { G.beginPath(); G.arc(x + 1.5, y, 2.4, -0.8, 0.8); G.stroke(); G.beginPath(); G.arc(x + 1.5, y, 4.2, -0.8, 0.8); G.stroke(); }
  else { G.beginPath(); G.moveTo(x + 2.5, y - 2); G.lineTo(x + 6, y + 2); G.moveTo(x + 6, y - 2); G.lineTo(x + 2.5, y + 2); G.stroke(); }
}
function iconoKit(id, x, y) {
  if (id === 'casco') { blanda([x - 5.5, y + 2, x - 4.5, y - 2.5, x, y - 4.5, x + 4.5, y - 2.5, x + 5.5, y + 2], vol(x, y - 1, 6, 4, '#ffd84a')); caja(x - 6.5, y + 1.5, 13, 2, 1, '#f0b414'); }
  else if (id === 'cafe') { caja(x - 4, y - 3, 7, 7, 1.5, '#ffffff', OLC, 0.7); G.beginPath(); G.arc(x + 3.5, y + 0.5, 2, -1.4, 1.4); G.lineWidth = 0.8; G.strokeStyle = OLC; G.stroke(); caja(x - 3, y - 2, 5, 2, 0.5, '#8a5530', null); }
  else if (id === 'mirilla') iconoMirilla(x, y, 6.5);
  else iconoZana(x, y, 14);
}
function pastillaZanas(x, y) {
  const z = String(GUARDA.zanas), w = anchoLetras(z, 9.5) + 27;
  caja(x, y, w, 15, 5, '#ffe6d2', OLC, 0.8); iconoZana(x + 10, y + 7.5, 13.5); letras(z, x + w - 7 - anchoLetras(z, 9.5) / 2, y + 8, 9.5, PASTEL.melocotonO);
  return w;
}

/* ---------- la portada ---------- */
// un cartel: tablilla pastel inclinada con su icono y su nombre
function cartel(x, y, w, h, color, icono, txt, ang, fn) {
  aqui(x + w / 2, y + h / 2, ang, 1, 1, () => {
    caja(-w / 2 + 1, -h / 2 + 2, w, h, 3, 'rgba(61,42,92,0.35)', null);
    caja(-w / 2, -h / 2, w, h, 3, color, OLC, 1);
    elipse(-w / 2 + 3.5, -h / 2 + 3.5, 0.9, 0.9, OLC, null); elipse(w / 2 - 3.5, -h / 2 + 3.5, 0.9, 0.9, OLC, null);
    icono(-w / 2 + 11, 0.5);
    letras(tr(txt), -w / 2 + 20, 0.8, 8, PASTEL.texto, { alin: 'left' });
  });
  boton(x, y, w, h, fn);
}
// una orden de Microblizz colgada como un pósit
function posit(x, y, w, h, color, ang, m) {
  aqui(x + w / 2, y + h / 2, ang, 1, 1, () => {
    caja(-w / 2 + 1, -h / 2 + 1.5, w, h, 1, 'rgba(61,42,92,0.25)', null);
    caja(-w / 2, -h / 2, w, h, 1, color, null);
    caja(-5, -h / 2 - 2, 10, 4, 0.5, 'rgba(255,255,255,0.65)', null);   // el celo
    const ls = envuelve(m.txt, w - 8, 6.2).slice(0, 3), y0 = -6 - (ls.length - 1) * 3.5;
    ls.forEach((l, i) => letras(l, 0, y0 + i * 7, 6.2, PASTEL.texto, { peso: 700 }));
    const pr = '+' + m.premio, pw = anchoLetras(pr, 7.5) + 8;
    iconoZana(-pw / 2 + 2, h / 2 - 7.5, 10); letras(pr, 4, h / 2 - 7, 7.5, PASTEL.melocotonO);
  });
}
function pintaPortada() {
  const W = PAN.W, H = PAN.H, t = JUEGO.t;
  pastillaZanas(7, 8);
  if (GUARDA.mejor) {
    const r = tr('Mejor') + ' ' + GUARDA.mejor.toLocaleString('es-ES') + ' €', w = anchoLetras(r, 8.5) + 22;
    caja(W / 2 - w / 2, 8, w, 15, 3, PASTEL.oro, OLC, 0.8); iconoCorona(W / 2 - w / 2 + 9, 15.5); letras(r, W / 2 + 5, 15.8, 8.5, PASTEL.texto);
  }
  caja(W - 24, 8, 17, 15, 3, PASTEL.papel, OLC, 0.8); iconoSonido(W - 15.5, 15.5, !sonidoApagado());
  boton(W - 26, 6, 21, 19, () => { const on = sonidoApagado(); GUARDA.efectos = on ? 1 : 0; GUARDA.musica = on ? 0.6 : 0; salvaGuarda(); applyVolume(); });
  letras('FANS OF', W / 2, 40, 10, '#ffffff', { borde: OLC, bw: 3 });
  aqui(W / 2, 62 + Math.sin(t * 2.5) * 1.5, Math.sin(t * 1.5) * 0.03, 1, 1, () => {
    letras('JUMP', 0, 3, 32, OLC, { logo: true, borde: OLC, bw: 7 });
    const gr = G.createLinearGradient(-50, 0, 50, 0); ARCOIRIS.forEach((c, k) => gr.addColorStop(k / 6, c));
    letras('JUMP', 0, 0, 32, gr, { logo: true, borde: OLC, bw: 5 });
  });
  if (!GUARDA.partidas) {
    const txt = envuelve(tr('Microblizz está arrasando el bosque. ¡Salta por el río y rescata a tus amigos antes de que te pille la ola de barro!'), W - 56, 8.5);
    const ch = txt.length * 10.5 + 12;
    caja(20, 86 + 1.5, W - 40, ch, 4, 'rgba(61,42,92,0.3)', null); caja(20, 86, W - 40, ch, 4, PASTEL.papel, OLC, 1);
    txt.forEach((l, i) => letras(l, W / 2, 97 + i * 10.5, 8.5, PASTEL.texto, { peso: 700 }));
  }
  // las órdenes de Microblizz (pósits) y los cuatro carteles encima
  const ms = misionesActivas(), pw = (W - 30) / 3, py = H - 54;
  letras(tr('Órdenes de Microblizz'), W / 2, py - 8, 7.5, '#ffffff', { borde: OLC, bw: 2.4 });
  ms.forEach((m, i) => posit(10 + i * (pw + 5), py, pw, 46, ['#fff4a8', '#ffd6e6', '#d6ecff'][i], (i - 1) * 0.05, m));
  const cw = (W - 30) / 2, cy2 = py - 52;
  cartel(10, cy2, cw, 15, '#ffe6d2', (x, y) => iconoZana(x, y, 14), 'Puesto de Lola', -0.03, () => abrePanel('tienda'));
  cartel(20 + cw, cy2, cw, 15, PASTEL.menta, iconoCarpeta, 'Expedientes', 0.03, () => abrePanel('guia'));
  cartel(10, cy2 + 18, cw, 15, PASTEL.oro, iconoCorona, 'Mis récords', 0.02, () => abrePanel('records'));
  cartel(20 + cw, cy2 + 18, cw, 15, PASTEL.lila, iconoHoja, 'Reclamaciones', -0.02, () => abrePanel('ajustes'));
  // el botón de empezar: grande, en el centro, botando un poco
  const bt = tr('¡A JUGAR!'), bw = Math.max(110, anchoLetras(bt, 16, { logo: true }) + 34), bh = 26, bx = W / 2 - bw / 2, by = cy2 - 36 + Math.abs(Math.sin(t * 3)) * -2;
  caja(bx, by + 2.5, bw, bh, 8, OLC, null); caja(bx, by, bw, bh, 8, PASTEL.melocoton, OLC, 1.1);
  caja(bx + 4, by + 3, bw - 8, 6, 3, 'rgba(255,255,255,0.35)', null);
  letras(bt, W / 2, by + 14, 16, '#ffffff', { logo: true, borde: PASTEL.melocotonO, bw: 3.2 });
  boton(bx - 4, by - 4, bw + 8, bh + 8, aJugar);
}

/* ---------- lo que se abre encima: fichas de carpeta ---------- */
function abrePanel(p) { PANEL.abierto = p; PANEL.scroll = 0; SONIDO.boton(); }
// la ficha: una pestaña con el título arriba a la izquierda, la hoja con un borde cosido y el botón de cerrar
function marco(titulo, x, y, w, h, color = PASTEL.lila) {
  G.fillStyle = 'rgba(40,25,60,0.42)'; G.fillRect(0, 0, PAN.W, PAN.H);
  boton(0, 0, PAN.W, PAN.H, () => {});   // lo de detrás no se toca
  const t = tr(titulo), tw = anchoLetras(t, 11, { logo: true }) + 18;
  caja(x + 8, y - 12, tw, 16, [5, 5, 0, 0], color, OLC, 1);
  letras(t, x + 8 + tw / 2, y - 3.5, 11, '#ffffff', { logo: true, borde: OLC, bw: 2.4 });
  caja(x + 2, y + 3, w, h, 6, 'rgba(40,25,60,0.35)', null);
  caja(x, y, w, h, 6, PASTEL.papel, OLC, 1);
  G.setLineDash([2, 2]); caja(x + 3, y + 3, w - 6, h - 6, 4, null, color, 0.8); G.setLineDash([]);
  caja(x + w - 17, y - 9, 14, 12, 3, PASTEL.melocoton, OLC, 0.9);
  trazo(x + w - 12.5, y - 5.5, x + w - 7.5, y - 0.5, 1, '#ffffff', null); trazo(x + w - 7.5, y - 5.5, x + w - 12.5, y - 0.5, 1, '#ffffff', null);
  boton(x + w - 20, y - 12, 20, 18, () => { PANEL.abierto = null; SONIDO.boton(); });
}
// la parte que se mueve arrastrando: dentro, «fn» pinta a partir de y0 y devuelve hasta dónde llegó
function contenido(x, y, w, h, fn) {
  G.save(); G.beginPath(); G.rect(x, y, w, h); G.clip();
  const n0 = BOTONES.length, fin = fn(y - PANEL.scroll);
  G.restore();
  BOTONES = BOTONES.filter((b, i) => i < n0 || (b.y + b.h > y && b.y < y + h));   // lo que no se ve no se toca
  PANEL.alto = Math.max(0, fin + PANEL.scroll - y - h + 6);
  PANEL.scroll = Math.max(0, Math.min(PANEL.alto, PANEL.scroll));
}
// la etiqueta del precio, con forma de zanahoria tumbada; o el estado si ya es tuyo
function etiqueta(x, y, cuanto, estado) {
  if (estado === 'puesto') { caja(x - 17, y - 5, 34, 10, 5, PASTEL.menta, OLC, 0.6); letras(tr('Puesto'), x, y + 0.4, 6.6, PASTEL.texto); return; }
  if (estado === 'tengo') { caja(x - 17, y - 5, 34, 10, 5, PASTEL.fondo, OLC, 0.6); letras(tr('Ponérselo'), x, y + 0.4, 6.6, PASTEL.suave); return; }
  if (estado === 'mio') { caja(x - 17, y - 5, 34, 10, 5, PASTEL.menta, OLC, 0.6); letras(tr('En la pandilla'), x, y + 0.4, 5.6, PASTEL.texto); return; }
  const da = GUARDA.zanas >= cuanto;
  caja(x - 17, y - 5, 34, 10, 5, da ? '#ffa45c' : PASTEL.raya, OLC, 0.6);
  iconoZana(x - 10, y, 10);
  letras(String(cuanto), x + 4, y + 0.4, 7.2, da ? '#ffffff' : PASTEL.flojo, da ? { borde: PASTEL.melocotonO, bw: 1.8 } : {});
}
function compra(clave, cuanto, alComprar) {
  if (GUARDA.tengo[clave] || cuanto === 0) { alComprar(); salvaGuarda(); SONIDO.boton(); return; }
  if (GUARDA.zanas < cuanto) { SONIDO.uy(); return; }
  GUARDA.zanas -= cuanto; GUARDA.tengo[clave] = true; alComprar(); salvaGuarda(); SONIDO.compra();
  confeti(PAN.W / 2, CAM.y + PAN.H * 0.5, 16);
}
// una tarjeta del puesto: el dibujo arriba, el nombre, lo que hace y el precio
function tarjeta(x, y, w, h, dibujo, nombre, desc, cuanto, estado, fn) {
  caja(x, y, w, h, 4, '#ffffff', OLC, 0.8);
  caja(x + 3, y + 3, w - 6, 26, 3, PASTEL.fondo, null);
  dibujo(x + w / 2, y + 16);
  letras(tr(nombre), x + w / 2, y + 35, 7.6, PASTEL.texto);
  if (desc) envuelve(tr(desc), w - 8, 5.8).slice(0, 2).forEach((l, i) => letras(l, x + w / 2, y + 43 + i * 6.5, 5.8, PASTEL.suave, { peso: 700 }));
  etiqueta(x + w / 2, y + h - 8, cuanto, estado);
  if (fn) boton(x, y, w, h, fn);
}
function pintaTienda() {
  const W = PAN.W, H = PAN.H, x = 8, y = 34, w = W - 16, h = H - 48;
  marco('El puesto de Lola', x, y, w, h, PASTEL.melocoton);
  pastillaZanas(x + 6, y + 7);
  spriteConejo('quieto' + Math.floor(JUEGO.t * 7) % 8, x + w - 18, y + 22, 3.6);
  // las pestañas
  const P = [['amigos', 'Amigos'], ['pelaje', 'Pelaje'], ['capas', 'Capas'], ['kit', 'Kit de sabotaje']];
  let px = x + 6;
  P.forEach(([id, txt]) => {
    const tw = anchoLetras(tr(txt), 7) + 10, on = PANEL.pestana === id;
    caja(px, y + 26, tw, 12, 3, on ? PASTEL.melocoton : PASTEL.fondo, OLC, 0.7);
    letras(tr(txt), px + tw / 2, y + 32.4, 7, on ? '#ffffff' : PASTEL.suave, on ? { borde: PASTEL.melocotonO, bw: 1.6 } : {});
    boton(px, y + 24, tw, 16, () => { PANEL.pestana = id; PANEL.scroll = 0; SONIDO.boton(); });
    px += tw + 3;
  });
  contenido(x + 4, y + 42, w - 8, h - 46, y0 => {
    const cw = (w - 20) / 2, ch = PANEL.pestana === 'pelaje' || PANEL.pestana === 'capas' ? 52 : 66;
    const lista = PUESTO[PANEL.pestana];
    lista.forEach((it, i) => {
      const cx = x + 6 + (i % 2) * (cw + 4), cy = y0 + 2 + Math.floor(i / 2) * (ch + 4);
      if (PANEL.pestana === 'amigos') {
        const [id, cuanto, nombre, desc] = it, mio = tengoAmigo(id);
        tarjeta(cx, cy, cw, ch, (X, Y) => spriteEnCaja(id + '_susto0', X - 13, Y - 12, 26, 25), nombre, desc, cuanto, mio ? 'mio' : 'compra', mio ? null : () => compra(id, cuanto, () => {}));
      } else if (PANEL.pestana === 'kit') {
        const [id, cuanto, nombre, desc] = it, n = GUARDA.kit[id] || 0;
        tarjeta(cx, cy, cw, ch, (X, Y) => { iconoKit(id, X, Y); if (n) letras('×' + n, X + 14, Y - 6, 8, PASTEL.texto); }, nombre, desc, cuanto, 'compra',
          () => { if (GUARDA.zanas < cuanto) return SONIDO.uy(); GUARDA.zanas -= cuanto; GUARDA.kit[id] = n + 1; salvaGuarda(); SONIDO.compra(); });
      } else {
        const [col, cuanto, nombre] = it, pelo = PANEL.pestana === 'pelaje', clave = (pelo ? 'pelo' : 'capa') + col;
        const puesto = (pelo ? GUARDA.pelaje : GUARDA.capa) === col, tengo = cuanto === 0 || GUARDA.tengo[clave];
        tarjeta(cx, cy, cw, ch, (X, Y) => pelo ? spriteConejo('quieto0', X, Y + 12, 4.2, 0, 1, 1, col, GUARDA.capa) : spriteConejo('quieto0', X, Y + 12, 4.2, 0, 1, 1, GUARDA.pelaje, col),
          nombre, '', cuanto, puesto ? 'puesto' : tengo ? 'tengo' : 'compra', puesto ? null : () => compra(clave, cuanto, () => { if (pelo) GUARDA.pelaje = col; else GUARDA.capa = col; }));
      }
    });
    const fin = y0 + 2 + Math.ceil(lista.length / 2) * (ch + 4);
    if (PANEL.pestana === 'kit') letras(tr('Se usa en la siguiente partida.'), x + w / 2, fin + 6, 6.6, PASTEL.flojo, { peso: 700 });
    if (PANEL.pestana === 'amigos') { const ls = envuelve(tr('Todos salen atrapados en el río; contrátalos y usarán su poder.'), w - 24, 6.6); ls.forEach((l, i) => letras(l, x + w / 2, fin + 6 + i * 8, 6.6, PASTEL.flojo, { peso: 700 })); return fin + 8 + ls.length * 8; }
    return fin + 14;
  });
}
// los expedientes de Lola: una ficha de personal por cada uno (los que no has visto, clasificados)
function pintaGuia() {
  const W = PAN.W, H = PAN.H, x = 10, y = 34, w = W - 20, h = H - 48;
  marco('Expedientes de Lola', x, y, w, h, PASTEL.menta);
  const FICHAS = [
    ['ardilla', 'Puesto: distraer a las torres', 'Nerviosa y rapidísima. Siempre con hambre.'],
    ['zorro', 'Puesto: espía', 'Invisible hasta que ataca. No sale sin su antifaz morado.'],
    ['mapache', 'Puesto: reciclaje explosivo', 'Lanza bolsas de basura. La suya no la suelta nunca.'],
    ['suricata', 'Puesto: enfermería', 'Cura a todo el mundo. Las alas son de verdad.'],
    ['castor', 'Puesto: demoliciones', 'Lleva dinamita. Siempre. Nadie sabe de dónde la saca.'],
    ['topadora0', 'Propiedad de Microblizz', 'Empuja la ola de barro. Al final se queda atrás.'],
  ];
  contenido(x + 4, y + 8, w - 8, h - 12, y0 => {
    FICHAS.forEach(([id, puesto, desc], i) => {
      const fy = y0 + 2 + i * 38, visto = id === 'topadora0' || GUARDA.visto[id];
      caja(x + 8, fy, w - 16, 34, 3, '#ffffff', OLC, 0.7);
      caja(x + 12, fy + 4, 26, 26, 2, PASTEL.fondo, OLC, 0.6);
      if (visto) spriteEnCaja(id === 'topadora0' ? id : id + '_susto0', x + 12, fy + 4, 26, 26);
      else letras('?', x + 25, fy + 17.5, 14, PASTEL.flojo, { logo: true });
      letras(visto ? (id === 'topadora0' ? tr('Topadora gigante') : nombreAmigo(id)) : '???', x + 44, fy + 8, 8.5, PASTEL.texto, { alin: 'left' });
      letras(visto ? tr(puesto) : '', x + 44, fy + 17, 6.4, PASTEL.lilaO, { alin: 'left', peso: 700 });
      envuelve(visto ? tr(desc) : tr('Rescátalo para abrir su expediente.'), w - 60, 5.8).slice(0, 2).forEach((l, k) => letras(l, x + 44, fy + 24 + k * 6.4, 5.8, PASTEL.suave, { alin: 'left', peso: 700 }));
      if (!visto) aqui(x + w - 34, fy + 10, -0.15, 1, 1, () => { caja(-21, -5, 42, 10, 2, null, '#e0463e', 1); letras(tr('CLASIFICADO'), 0, 0.5, 6, '#e0463e', { logo: true }); });
    });
    return y0 + 2 + FICHAS.length * 38;
  });
}
// la hoja de reclamaciones (los ajustes)
function barra(txt, clave, x, y, w) {
  letras(tr(txt), x, y, 8, PASTEL.texto, { alin: 'left' });
  const by = y + 10, v = GUARDA[clave];
  caja(x, by - 2, w, 4, 2, PASTEL.raya, null); caja(x, by - 2, w * v, 4, 2, PASTEL.lilaO, null);
  elipse(x + w * v, by, 4, 4, PASTEL.melocoton, OLC, 0.8);
  boton(x - 4, by - 8, w + 8, 16, (px) => { GUARDA[clave] = Math.round(Math.max(0, Math.min(1, (px - x) / w)) * 10) / 10; salvaGuarda(); applyVolume(); SONIDO.boton(); });
}
function pintaAjustes() {
  const W = PAN.W, x = 16, y = PAN.H / 2 - 80, w = W - 32, h = 162;
  marco('Hoja de reclamaciones', x, y, w, h, PASTEL.lila);
  barra('Queja n.º 1: los ruiditos', 'efectos', x + 12, y + 16, w - 24);
  barra('Queja n.º 2: la música', 'musica', x + 12, y + 42, w - 24);
  letras(tr('Queja n.º 3: me mareo'), x + 12, y + 72, 8, PASTEL.texto, { alin: 'left' });
  letras(tr('Menos temblores y menos cosas volando.'), x + 12, y + 81, 6.4, PASTEL.suave, { alin: 'left', peso: 700 });
  const sx = x + w - 30, on = GUARDA.suave;
  caja(sx, y + 68, 18, 10, 5, on ? PASTEL.menta : PASTEL.raya, OLC, 0.6); elipse(on ? sx + 13 : sx + 5, y + 73, 3.6, 3.6, '#ffffff', OLC, 0.6);
  boton(sx - 4, y + 64, 26, 18, () => { GUARDA.suave = !GUARDA.suave; salvaGuarda(); SONIDO.boton(); });
  // el tutorial de Lola otra vez
  const rt = tr('Repetir el tutorial de Lola'), rw = anchoLetras(rt, 7.5) + 18;
  caja(W / 2 - rw / 2, y + 93, rw, 15, 4, OLC, null); caja(W / 2 - rw / 2, y + 91.5, rw, 15, 4, PASTEL.melocoton, OLC, 0.8);
  letras(rt, W / 2, y + 99.5, 7.5, '#ffffff', { borde: PASTEL.melocotonO, bw: 2 });
  boton(W / 2 - rw / 2 - 4, y + 88, rw + 8, 22, () => { GUARDA.tuto = false; salvaGuarda(); PANEL.abierto = null; nuevaPartida('listo'); SONIDO.boton(); });
  envuelve(tr('Tus quejas se quedan en este móvil. Microblizz no las leerá.'), w - 30, 6.4).forEach((l, i) => letras(l, W / 2, y + 122 + i * 8, 6.4, PASTEL.flojo, { peso: 700 }));
  aqui(W / 2, y + h - 14, -0.06, 1, 1, () => { const r = tr('Recibido: Lola'), rw = anchoLetras(r, 7, { logo: true }) + 12; caja(-rw / 2, -5.5, rw, 11, 2, null, PASTEL.lilaO, 0.9); letras(r, 0, 0.6, 7, PASTEL.lilaO, { logo: true }); });
}
function pintaRecords() {
  const W = PAN.W, x = 18, y = PAN.H / 2 - 62, w = W - 36, h = 124;
  marco('Mis récords', x, y, w, h, PASTEL.oro);
  const filas = [['Mayores pérdidas', GUARDA.mejor.toLocaleString('es-ES') + ' €'], ['Huida más larga', GUARDA.mejorM + ' m'], ['Partidas', GUARDA.partidas], ['Empleados liberados', GUARDA.rescatados], ['Zanahorias', GUARDA.zanas]];
  filas.forEach(([k, v], i) => {
    letras(tr(k), x + 12, y + 18 + i * 20, 7.8, PASTEL.suave, { alin: 'left', peso: 700 });
    letras(String(v), x + w - 12, y + 18 + i * 20, 9, PASTEL.texto, { alin: 'right' });
    if (i < filas.length - 1) caja(x + 10, y + 27 + i * 20, w - 20, 0.5, 0, PASTEL.raya, null);
  });
}
function pintaPanel() {
  if (PANEL.abierto === 'tienda') pintaTienda();
  else if (PANEL.abierto === 'guia') pintaGuia();
  else if (PANEL.abierto === 'ajustes') pintaAjustes();
  else if (PANEL.abierto === 'records') pintaRecords();
}
