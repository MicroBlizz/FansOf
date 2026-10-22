// Fans of Jump · Lo de los anuncios (siempre voluntarios y fuera de la partida, 5 al día entre todos: premios.js) y la tienda
// con euros, que está preparada pero APAGADA:
// · el regalo diario de Lola está en regalo.js: es gratis y el anuncio solo lo duplica
// · probar una piel (pelaje, capa, tronco o estela) que no tienes durante una partida, con un anuncio
// · los packs con euros (zanahorias, bienvenida, «Zanahoria doble» y «Sin anuncios»), tras el flag 'jump-tienda-real': no se vende nada
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
    cuentaAnuncio('prueba');
    GUARDA.prueba = { campo, antes: GUARDA[campo], valor }; GUARDA[campo] = valor; salvaGuarda();
    bandera(tr('¡Pruébalo en tu próxima partida!'), PASTEL.oro); SONIDO.compra();
  }));
}
// al acabar la partida, la piel de prueba se devuelve
// (solo si sigues con ella puesta: si durante la partida te pusiste otra, o compraste la que probabas, eso se queda)
function acabaPrueba() {
  const p = GUARDA.prueba;
  if (!p) return;
  if (GUARDA[p.campo] === p.valor && !tengoPiel(p.campo, p.valor)) GUARDA[p.campo] = p.antes;
  delete GUARDA.prueba; salvaGuarda();
}
// ¿esa piel ya es tuya? (las gratis del puesto, o las compradas)
function tengoPiel(campo, valor) {
  const L = { pelaje: ['pelaje', 'pelo'], capa: ['capas', 'capa'], piel: ['troncos', 'piel'], estela: ['estelas', 'estela'] }[campo];
  const it = L && PUESTO[L[0]].find(x => x[0] === valor);
  return !!it && (it[1] === 0 || !!GUARDA.tengo[L[1] + valor]);   // las claves de lo comprado: pelo#…, capa#…, pielnube, estelanotas (puesto.js)
}

/* ---------- la tienda con euros (apagada) ---------- */
// Jump no tiene azar: las zanahorias solo compran cosas a precio fijo. Por eso aquí se venden zanahorias con euros (excepción
// a PLAN-MONEDAS.md pedida a Arkioner en PLAN-JUMP.md, sección 6). Todo cobro pasa por MONEDAS.compraReal (core): en desarrollo es
// una compra de prueba; en la web dice que aún no está a la venta. Nada se vende hasta el sí de Arkioner y Google Play Billing.
const tiendaReal = () => NUCLEO.flag('jump-tienda-real', 'Fans of Jump: packs con euros en el puesto de Lola (zanahorias, bienvenida, Zanahoria doble y Sin anuncios). Apagado hasta el sí de Arkioner y Google Play Billing', false);
// [clave, nombre, qué da, precio en euros, entrega]
const PACKS = [
  ['bienvenida', 'Pack de bienvenida', 'Solo una vez: 2.000 zanahorias, 3 cascos de obra y 3 mirillas.', 1.99, () => { GUARDA.zanas += 2000; GUARDA.kit.casco = (GUARDA.kit.casco || 0) + 3; GUARDA.kit.mirilla = (GUARDA.kit.mirilla || 0) + 3; }],
  ['punado', 'Puñado de zanahorias', '500 zanahorias.', 0.99, () => { GUARDA.zanas += 500; }],
  ['saco', 'Saco de zanahorias', '3.000 zanahorias (20 % de regalo).', 4.99, () => { GUARDA.zanas += 3000; }],
  ['carretilla', 'Carretilla de zanahorias', '7.000 zanahorias (40 % de regalo).', 9.99, () => { GUARDA.zanas += 7000; }],
  ['doble', 'Zanahoria doble', 'Para siempre: las zanahorias que recoges en cada partida, por dos.', 2.99, () => {}],
  ['sinanuncios', 'Sin anuncios', 'Los premios de los anuncios sin verlos, con el mismo tope del día.', 2.99, () => {}],
  ['pase', 'Contrato de obra', 'La pista de pago del pase de esta temporada: colores de obra exclusivos y zanahorias.', 2.99, () => { estadoPase().premium = true; }],
];
// el precio escrito como en cada idioma (tr() no toca textos sin letras): 0,99 € / €0.99
const euros = v => (NUCLEO.idioma === 'en' ? '€' + v.toFixed(2) : v.toFixed(2).replace('.', ',') + ' €');
const UNA_VEZ = ['bienvenida', 'doble', 'sinanuncios', 'pase'];
const comprado = id => id === 'pase' ? !!estadoPase().premium : !!(GUARDA.compras && GUARDA.compras[id]);   // el pase es por temporada (pase.js)
function compraPack([id, nombre, desc, precio, entrega]) {
  if (UNA_VEZ.includes(id) && comprado(id)) return SONIDO.uy();
  SONIDO.boton();
  MONEDAS.compraReal(tr(nombre), '<p>' + tr(desc) + '</p><p><b>' + tr(precio) + '</b></p>', () => {
    GUARDA.compras = GUARDA.compras || {}; if (id !== 'pase') GUARDA.compras[id] = (GUARDA.compras[id] || 0) + 1;
    entrega(); salvaGuarda(); JS.pide('pack', { pack: id });
    bandera(tr('¡Gracias! {pack}', { pack: tr(nombre) }), PASTEL.oro); confeti(PAN.W / 2, CAM.y + PAN.H * 0.5, 40); SONIDO.compra();
  });
}
// el dibujo de cada pack
function iconoPack(id, x, y) {
  if (id === 'punado') iconoZana(x, y, 18);
  else if (id === 'saco' || id === 'carretilla') { const n = id === 'saco' ? 3 : 5; for (let k = 0; k < n; k++) iconoZana(x + (k - (n - 1) / 2) * 7, y - (k % 2) * 3, 16); }
  else if (id === 'doble') { iconoZana(x - 5, y, 17); iconoZana(x + 5, y, 17); letras('×2', x + 11, y - 7, 7, PASTEL.melocotonO, { borde: '#ffffff', bw: 2 }); }
  else if (id === 'sinanuncios') { iconoTele(x, y); trazo(x - 8, y + 7, x + 8, y - 7, 1.4, '#ff5a6e', null); }
  else if (id === 'pase') {   // un contrato firmado: hoja con líneas y un garabato
    caja(x - 7, y - 9, 14, 18, 1.5, '#ffffff', OLC, 0.8); for (const d of [-5, -2, 1]) caja(x - 4.5, y + d, 9, 1, 0, PASTEL.raya, null);
    trazo(x - 4, y + 6, x - 1, y + 3, 1.2, PASTEL.lilaO, null); trazo(x - 1, y + 3, x + 1, y + 6.5, 1.2, PASTEL.lilaO, null); trazo(x + 1, y + 6.5, x + 4.5, y + 2.5, 1.2, PASTEL.lilaO, null);
  }
  else if (id === 'bienvenida') {   // una caja de regalo con lazo
    caja(x - 9, y - 4, 18, 12, 2, PASTEL.melocoton, OLC, 0.9); caja(x - 10, y - 8, 20, 5, 2, '#ffd0b5', OLC, 0.9);
    caja(x - 1.8, y - 8, 3.6, 16, 0, PASTEL.oro, OLC, 0.6);
    elipse(x - 3.5, y - 10, 3.2, 2.2, PASTEL.oro, OLC, 0.6); elipse(x + 3.5, y - 10, 3.2, 2.2, PASTEL.oro, OLC, 0.6);
  }
}
function pintaPacks(x, y, w, h) {
  contenido(x, y, w, h, y0 => {
    const cw = (w - 12) / 2, ch = 62;
    PACKS.forEach((pk, i) => {
      const [id, nombre, desc, precio] = pk, ya = UNA_VEZ.includes(id) && comprado(id);
      const cx = x + 2 + (i % 2) * (cw + 4), cy = y0 + 2 + Math.floor(i / 2) * (ch + 4);
      caja(cx, cy, cw, ch, 4, id === 'bienvenida' && !ya ? '#fff4c2' : '#ffffff', id === 'bienvenida' && !ya ? PASTEL.oroO : OLC, 0.8);
      iconoPack(id, cx + cw / 2, cy + 13);
      letras(tr(nombre), cx + cw / 2, cy + 28, 6.8, PASTEL.texto, { max: cw - 8 });
      envuelve(tr(desc), cw - 8, 5.2).slice(0, 3).forEach((l, k) => letras(l, cx + cw / 2, cy + 35 + k * 5.8, 5.2, PASTEL.suave, { peso: 700, max: cw - 6 }));
      const et = ya ? tr('Ya es tuyo') : euros(precio);
      caja(cx + cw / 2 - 19, cy + ch - 11.5, 38, 10, 5, ya ? PASTEL.fondo : PASTEL.menta, OLC, 0.6);
      letras(et, cx + cw / 2, cy + ch - 6.1, 6.4, ya ? PASTEL.suave : '#ffffff', ya ? { max: 34 } : { borde: PASTEL.mentaO, bw: 1.6, max: 34 });
      if (!ya) boton(cx, cy, cw, ch, () => compraPack(pk));
    });
    const fin = y0 + 4 + Math.ceil(PACKS.length / 2) * (ch + 4);
    envuelve(tr('Las compras con dinero real las hace una persona adulta o con su permiso.'), w - 16, 5.6).forEach((l, k) => letras(l, x + w / 2, fin + 6 + k * 7, 5.6, PASTEL.flojo, { peso: 700 }));
    return fin + 18;
  });
}
