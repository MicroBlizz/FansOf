// Fans of Jump · El puesto de Lola (la tienda): lo que vende (PUESTO), sus pestañas en dos filas (amigos, pelaje, capas, troncos,
// estelas y kit de sabotaje), las tarjetas con su dibujo, su nombre y su precio en zanahorias, y comprar o ponérselo.
'use strict';

// lo que vende Lola: [clave, precio, nombre, qué hace]
const PUESTO = {
  amigos: [['ardilla', 0, 'MadSquirrel', 'Va contigo desde el principio. +5 en cada tronco.'], ['zorro', 100, 'SlyFox', 'Esquiva el primer ¡Uy! de cada partida.'],
    ['mapache', 250, 'JunkCoon', 'Contigo, las zanahorias valen el doble.'], ['suricata', 450, 'MeerCat', 'La enfermera: te saca del agua una vez.'],
    ['castor', 700, 'BoomBeaver', 'Al rescatarlo, ¡BUM!: la ola retrocede.']],
  pelaje: [['#ffffff', 0, 'Blanco'], ['#cfd0dc', 200, 'Gris oficina'], ['#b98a66', 600, 'Chocolate'], ['#f4c886', 1200, 'Miel'], ['#ffc4dc', 2200, 'Rosa chicle'], ['#d8c0ff', 4000, 'Morado caos']],
  capas: [['#ff7a1a', 0, 'Naranja'], ['#e8343e', 200, 'Roja rebelde'], ['#3a86ff', 600, 'Azul Phony'], ['#3fbf6a', 1100, 'Verde bosque'], ['#a04ae0', 2000, 'Morada'], ['#ffc93a', 4500, 'Dorada CEO']],
  troncos: [['madera', 0, 'Troncos de madera'], ['nenufar', 300, 'Nenúfares'], ['galleta', 700, 'Galletas'], ['sandia', 1200, 'Sandías'], ['tarta', 2000, 'Tartas'], ['nube', 3000, 'Nubes']],
  estelas: [['arcoiris', 0, 'Arcoíris de racha'], ['corazones', 300, 'Corazones'], ['burbujas', 700, 'Burbujas'], ['chispas', 1200, 'Chispas'], ['notas', 2000, 'Notas musicales']],
  kit: [['casco', 40, 'Casco de obra', 'Te saca del agua una vez en toda la partida.'], ['cafe', 30, 'Pausa del café', 'La ola espera 8 s antes de salir.'], ['suerte', 60, 'Zanahoria de la suerte', 'Empiezas la partida con racha de 3.'], ['mirilla', 50, 'Mirilla', 'Ves dónde caes en tus 8 primeros saltos.']],
};

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
// extra: lo que la tarjeta crece para llenar el panel (el hueco del dibujo se agranda y el dibujo con él)
function tarjeta(x, y, w, h, dibujo, nombre, desc, cuanto, estado, fn, extra = 0) {
  const s = 1 + extra / 32, alto = 26 + extra;
  caja(x, y, w, h, 4, '#ffffff', OLC, 0.8);
  caja(x + 3, y + 3, w - 6, alto, 3, PASTEL.fondo, null);
  aqui(x + w / 2, y + 3 + alto / 2 + 3 * s, 0, s, s, () => dibujo(0, -3));
  letras(tr(nombre), x + w / 2, y + 35 + extra, 7.6, PASTEL.texto);
  if (desc) envuelve(tr(desc), w - 8, 5.8).slice(0, 2).forEach((l, i) => letras(l, x + w / 2, y + 43 + extra + i * 6.5, 5.8, PASTEL.suave, { peso: 700 }));
  etiqueta(x + w / 2, y + h - 8, cuanto, estado);
  if (fn) boton(x, y, w, h, fn);
}
function pintaTienda() {
  const W = PAN.W, H = PAN.H, x = 8, y = 34, w = W - 16, h = H - 48;
  marco('El puesto de Lola', x, y, w, h, PASTEL.melocoton);
  pastillaZanas(x + 6, y + 7);
  spriteConejo('quieto' + Math.floor(JUEGO.t * 7) % 8, x + w - 18, y + 22, 3.6);
  if (tiendaReal()) {   // los packs con euros (anuncios.js), de momento solo con el flag
    const on = PANEL.pestana === 'packs';
    caja(x + w - 64, y + 8, 30, 12, 4, on ? PASTEL.oro : PASTEL.fondo, OLC, 0.7); letras(tr('Packs'), x + w - 49, y + 14.4, 6.6, on ? PASTEL.texto : PASTEL.suave, { max: 26 });
    boton(x + w - 66, y + 6, 34, 16, () => { PANEL.pestana = 'packs'; PANEL.scroll = 0; SONIDO.boton(); });
  }
  // las pestañas
  // las pestañas, en dos filas de tres
  const P = [['amigos', 'Amigos'], ['pelaje', 'Pelaje'], ['capas', 'Capas'], ['troncos', 'Troncos'], ['estelas', 'Estelas'], ['kit', 'Kit']];
  const tw = (w - 18) / 3;
  P.forEach(([id, txt], i) => {
    const on = PANEL.pestana === id, px = x + 6 + (i % 3) * (tw + 3), py = y + 26 + Math.floor(i / 3) * 15;
    caja(px, py, tw, 12, 3, on ? PASTEL.melocoton : PASTEL.fondo, OLC, 0.7);
    letras(tr(txt), px + tw / 2, py + 6.4, 7, on ? '#ffffff' : PASTEL.suave, on ? { borde: PASTEL.melocotonO, bw: 1.6 } : {});
    boton(px, py - 2, tw, 16, () => { PANEL.pestana = id; PANEL.scroll = 0; SONIDO.boton(); });
  });
  if (PANEL.pestana === 'packs') { if (!tiendaReal()) PANEL.pestana = 'amigos'; else return pintaPacks(x + 4, y + 57, w - 8, h - 61); }
  contenido(x + 4, y + 57, w - 8, h - 61, y0 => {
    // las tarjetas crecen hasta llenar el panel (con un tope), y el dibujo con ellas
    const base = ['pelaje', 'capas', 'estelas', 'troncos'].includes(PANEL.pestana) ? 52 : 66, filas = Math.ceil(PUESTO[PANEL.pestana].length / 2);
    const pie = PANEL.pestana === 'amigos' ? 24 : PANEL.pestana === 'kit' ? 14 : 4, cabe = (h - 61 - pie) / filas - 4;
    const cw = (w - 20) / 2, ch = Math.max(base, Math.min(base * 1.9, cabe)), extra = ch - base;
    const lista = PUESTO[PANEL.pestana];
    lista.forEach((it, i) => {
      const cx = x + 6 + (i % 2) * (cw + 4), cy = y0 + 2 + Math.floor(i / 2) * (ch + 4);
      if (PANEL.pestana === 'amigos') {
        const [id, cuanto, nombre, desc] = it, mio = tengoAmigo(id);
        tarjeta(cx, cy, cw, ch, (X, Y) => spriteEnCaja(id + '_susto0', X - 13, Y - 12, 26, 25), nombre, desc, cuanto, mio ? 'mio' : 'compra', mio ? null : () => compra(id, cuanto, () => {}), extra);
      } else if (PANEL.pestana === 'kit') {
        const [id, cuanto, nombre, desc] = it, n = GUARDA.kit[id] || 0;
        tarjeta(cx, cy, cw, ch, (X, Y) => { iconoKit(id, X, Y); if (n) letras('×' + n, X + 14, Y - 6, 8, PASTEL.texto); }, nombre, desc, cuanto, 'compra',
          () => { if (GUARDA.zanas < cuanto) return SONIDO.uy(); GUARDA.zanas -= cuanto; GUARDA.kit[id] = n + 1; salvaGuarda(); SONIDO.compra(); }, extra);
      } else if (PANEL.pestana === 'troncos') {
        const [id, cuanto, nombre] = it, clave = 'piel' + id, puesto = (GUARDA.piel || 'madera') === id, tengo = cuanto === 0 || GUARDA.tengo[clave];
        tarjeta(cx, cy, cw, ch, (X, Y) => sprite(id === 'madera' ? 'tronco1' : 'piel_' + id, X, Y + 4, 11), nombre, '', cuanto, puesto ? 'puesto' : tengo ? 'tengo' : 'compra', puesto ? null : () => compra(clave, cuanto, () => { GUARDA.piel = id; }), extra);
        if (!tengo) chipProbar(cx + cw, cy, 'piel', id);
      } else if (PANEL.pestana === 'estelas') {
        const [id, cuanto, nombre] = it, clave = 'estela' + id, puesto = GUARDA.estela === id, tengo = cuanto === 0 || GUARDA.tengo[clave];
        tarjeta(cx, cy, cw, ch, (X, Y) => {
          if (id === 'arcoiris') ARCOIRIS.forEach((c, k) => { G.beginPath(); G.arc(X, Y + 8, 14 - k * 1.5, Math.PI, 0); G.lineWidth = 1.5; G.strokeStyle = c; G.stroke(); });
          else for (let k = 0; k < 3; k++) pintaMotaEstela(id, X - 10 + k * 10, Y + 2 - Math.sin(k * 1.4) * 4, 3.4, k);
        }, nombre, '', cuanto, puesto ? 'puesto' : tengo ? 'tengo' : 'compra', puesto ? null : () => compra(clave, cuanto, () => { GUARDA.estela = id; }), extra);
        if (!tengo) chipProbar(cx + cw, cy, 'estela', id);
      } else {
        const [col, cuanto, nombre] = it, pelo = PANEL.pestana === 'pelaje', clave = (pelo ? 'pelo' : 'capa') + col;
        const puesto = (pelo ? GUARDA.pelaje : GUARDA.capa) === col, tengo = cuanto === 0 || GUARDA.tengo[clave];
        tarjeta(cx, cy, cw, ch, (X, Y) => pelo ? spriteConejo('quieto0', X, Y + 12, 4.2, 0, 1, 1, col, GUARDA.capa) : spriteConejo('quieto0', X, Y + 12, 4.2, 0, 1, 1, GUARDA.pelaje, col),
          nombre, '', cuanto, puesto ? 'puesto' : tengo ? 'tengo' : 'compra', puesto ? null : () => compra(clave, cuanto, () => { if (pelo) GUARDA.pelaje = col; else GUARDA.capa = col; }), extra);
        if (!tengo) chipProbar(cx + cw, cy, pelo ? 'pelaje' : 'capa', col);
      }
    });
    const fin = y0 + 2 + Math.ceil(lista.length / 2) * (ch + 4);
    if (PANEL.pestana === 'kit') letras(tr('Se usa en la siguiente partida.'), x + w / 2, fin + 6, 6.6, PASTEL.flojo, { peso: 700 });
    if (PANEL.pestana === 'amigos') { const ls = envuelve(tr('Todos salen atrapados en el río; contrátalos y usarán su poder.'), w - 24, 6.6); ls.forEach((l, i) => letras(l, x + w / 2, fin + 6 + i * 8, 6.6, PASTEL.flojo, { peso: 700 })); return fin + 8 + ls.length * 8; }
    return fin + 14;
  });
}
