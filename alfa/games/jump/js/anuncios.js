// Fans of Jump · Lo de los anuncios (siempre voluntarios y fuera de la partida, 5 al día entre todos: premios.js) y la tienda
// con euros, que está preparada pero APAGADA:
// · el regalo diario de Lola está en regalo.js: es gratis y el anuncio solo lo duplica
// · probar una piel (pelaje, capa, tronco o estela) que no tienes durante una partida, con un anuncio
// · los packs con euros (gemas, «Zanahoria doble» y «Sin anuncios»), tras el flag 'jump-tienda-real': no se vende nada
//   hasta que Arkioner diga sí y esté Google Play Billing; mientras, comprar solo avisa de que aún no está abierta.
'use strict';

// la tele del botón de los anuncios
function iconoTele(x, y) {
  caja(x - 6, y - 4.5, 12, 9, 2, '#8fd0ff', OLC, 0.8); caja(x - 4.6, y - 3.2, 9.2, 6.4, 1.2, '#dff4ff', null);
  forma([x - 1.4, y - 2, x + 2.2, y, x - 1.4, y + 2], PASTEL.melocoton, null);
  trazo(x - 2.5, y - 4.5, x - 4.5, y - 7, 0.8, OLC, null); trazo(x + 2.5, y - 4.5, x + 4.5, y - 7, 0.8, OLC, null);
}

/* ---------- probar una piel durante una partida ---------- */
// el botoncito «Probar» en la esquina de una tarjeta del puesto (solo si no la tienes)
function chipProbar(x, y, campo, valor) {
  if (!hayAnuncios() || !anunciosQuedan() || GUARDA.prueba) return;
  const w = 26;
  caja(x - w - 2, y + 2, w, 9, 4, PASTEL.oro, OLC, 0.6); letras(tr('Probar'), x - w / 2 - 2, y + 6.8, 5.6, PASTEL.texto, { peso: 800 });
  boton(x - w - 5, y, w + 6, 13, () => verAnuncio(() => {
    cuentaAnuncio();
    GUARDA.prueba = { campo, antes: GUARDA[campo] }; GUARDA[campo] = valor; salvaGuarda();
    bandera(tr('¡Pruébalo en tu próxima partida!'), PASTEL.oro); SONIDO.compra();
  }));
}
// al acabar la partida, la piel de prueba se devuelve
function acabaPrueba() {
  const p = GUARDA.prueba;
  if (!p) return;
  GUARDA[p.campo] = p.antes; delete GUARDA.prueba; salvaGuarda();
}

/* ---------- la tienda con euros (apagada) ---------- */
const tiendaReal = () => NUCLEO.flag('jump-tienda-real', 'Fans of Jump: packs con euros en el puesto de Lola (gemas, Zanahoria doble y Sin anuncios). Apagado hasta el sí de Arkioner y Google Play Billing', false);
const PACKS = [
  ['punado', 'Puñado de gemas', '100 gemas', '0,99 €'],
  ['saco', 'Saco de gemas', '550 gemas', '4,99 €'],
  ['carro', 'Carro de gemas', '1.200 gemas', '9,99 €'],
  ['doble', 'Zanahoria doble', 'Para siempre: las zanahorias de cada partida, por dos.', '2,99 €'],
  ['sinanuncios', 'Sin anuncios', 'Los premios de los anuncios sin verlos, con el mismo tope del día.', '2,99 €'],
  ['bolsa', 'Bolsa de zanahorias', '1.000 zanahorias por 60 gemas.', '60 gemas'],
];
function pintaGemas(x, y, w, h) {
  contenido(x, y, w, h, y0 => {
    const cw = (w - 12) / 2, ch = 58;
    PACKS.forEach(([id, nombre, desc, precio], i) => {
      const cx = x + 2 + (i % 2) * (cw + 4), cy = y0 + 2 + Math.floor(i / 2) * (ch + 4);
      caja(cx, cy, cw, ch, 4, '#ffffff', OLC, 0.8);
      const gema = (gx, gy, r) => forma([gx, gy - r, gx + r * 0.85, gy - r * 0.2, gx, gy + r, gx - r * 0.85, gy - r * 0.2], '#8fd0ff', OLC, 0.7);
      if (id === 'doble') { iconoZana(cx + cw / 2 - 5, cy + 13, 16); iconoZana(cx + cw / 2 + 5, cy + 13, 16); }
      else if (id === 'sinanuncios') { iconoTele(cx + cw / 2, cy + 13); trazo(cx + cw / 2 - 8, cy + 20, cx + cw / 2 + 8, cy + 6, 1.4, '#ff5a6e', null); }
      else if (id === 'bolsa') iconoZana(cx + cw / 2, cy + 13, 20);
      else for (let k = 0; k <= i; k++) gema(cx + cw / 2 + (k - i / 2) * 7, cy + 13 - (k % 2) * 3, 5);
      letras(tr(nombre), cx + cw / 2, cy + 28, 6.8, PASTEL.texto);
      envuelve(tr(desc), cw - 8, 5.2).slice(0, 2).forEach((l, k) => letras(l, cx + cw / 2, cy + 35 + k * 5.8, 5.2, PASTEL.suave, { peso: 700 }));
      caja(cx + cw / 2 - 17, cy + ch - 13, 34, 10, 5, PASTEL.menta, OLC, 0.6); letras(tr(precio), cx + cw / 2, cy + ch - 7.6, 6.4, '#ffffff', { borde: PASTEL.mentaO, bw: 1.6 });
      boton(cx, cy, cw, ch, () => { SONIDO.boton(); toast(tr('La tienda con euros aún no está abierta.')); });
    });
    return y0 + 4 + Math.ceil(PACKS.length / 2) * (ch + 4);
  });
}
