// Fans of Zombies · LOS BARRIOS DEL SUR (pantalla y mapa): al sur de la ciudad de Ratkov, una avenida de este a oeste y tres zonas.
// El POLÍGONO (oeste): naves con estanterías, contenedores de barco y camiones. La ZONA COMERCIAL (centro): supermercado con pasillos,
// gasolinera con su tienda, ferretería y farmacia, con aparcamientos llenos de coches con alarma. Las AFUERAS (este): comisaría con
// armería, colegio con aulas y una granja con su granero, campos y bosque. Cada edificio es como una casa del barrio (js/barrio.js):
// paredes de verdad con puertas y ventanas (huecos), tejado plano que se quita al entrar y muebles que se registran.
'use strict';
const SUR = { z0: 64, z1: 186 };

function construyeSur(o, az) {
  callesSur(o);
  poligono(o, az);
  comercial(o, az);
  afueras(o, az);
}
function callesSur(o) {
  const asfalto = 0x3c4048, acera = 0x8a8e96;
  // la avenida de este a oeste y las calles que bajan desde el norte
  o.caja(286, 0.06, 8, asfalto, -62, 0.03, 120); for (const s of [-1, 1]) o.caja(286, 0.14, 1.4, acera, -62, 0.07, 120 + s * 4.7);
  for (let x = -200; x < 80; x += 5) o.caja(2.2, 0.07, 0.22, 0xd8d0a0, x, 0.04, 120);
  for (let x = -196; x < 80; x += 18) for (const s of [-1, 1]) farolaBarrio(o, x, 120 + s * 5.2);
  for (const x of [-146, 0, 40]) { o.caja(7, 0.06, 124, asfalto, x, 0.03, 124); for (const s of [-1, 1]) o.caja(1.4, 0.14, 124, acera, x + s * 4.2, 0.07, 124); }
}

// un edificio genérico: paredes con huecos ({ lado: 'n'|'s'|'e'|'o', en: desplazamiento desde el centro, tipo }), tabiques
// ({ eje, en, desde, hasta, paso }), tejado plano aparte y muebles. Devuelve la caja (para el tejado y el mapa)
function edificio(o, id, cx, cz, w, d, op) {
  const x0 = cx - w / 2, x1 = cx + w / 2, z0 = cz - d / 2, z1 = cz + d / 2, color = op.color || 0xb0aaa0;
  o.caja(w, 0.12, d, op.suelo || 0x8a8a84, cx, 0.06, cz);
  const huecos = (lado) => (op.huecos || []).filter((h) => h.lado === lado).map((h) => ({ en: (lado === 'n' || lado === 's' ? cx : cz) + h.en, ancho: 1.3, tipo: h.tipo }));
  pared(o, 'x', z0, x0, x1, color, huecos('n'), id); pared(o, 'x', z1, x0, x1, color, huecos('s'), id);
  pared(o, 'z', x0, z0 + GROSOR / 2, z1 - GROSOR / 2, color, huecos('o'), id); pared(o, 'z', x1, z0 + GROSOR / 2, z1 - GROSOR / 2, color, huecos('e'), id);
  for (const t of op.tabiques || []) pared(o, t.eje, t.eje === 'x' ? cz + t.en : cx + t.en, (t.eje === 'x' ? cx : cz) + t.desde, (t.eje === 'x' ? cx : cz) + t.hasta, color, [{ en: (t.eje === 'x' ? cx : cz) + t.paso, ancho: 1.6, tipo: null }], id);
  const r = new Obra();
  r.caja(w + 0.5, 0.3, d + 0.5, op.tejado || 0x4a4a52, cx, ALTO_CASA + 0.15, cz); r.caja(w + 0.3, 0.1, d + 0.3, 0xeef2f6, cx, ALTO_CASA + 0.35, cz);
  if (op.rotulo) r.caja(Math.min(w * 0.6, 8), 0.8, 0.2, op.rotulo, cx, ALTO_CASA + 0.7, z1 + 0.1);
  const techo = r.hecha(); MOTOR.escena.add(techo);
  const C = { id, x0, x1, z0, z1, techo, tipo: op.tipo || 'edificio' };
  BARRIO.casas.push(C);
  return C;
}
// una estantería (o un estante del súper) contra la pared o en un pasillo, que se registra
function estante(o, x, z, largo, tipo, color, giro) {
  const enX = !giro;
  o.caja(enX ? largo : 0.6, 1.7, enX ? 0.6 : largo, color, x, 0.85, z);
  for (const y of [0.5, 1.05, 1.6]) o.caja(enX ? largo + 0.02 : 0.62, 0.05, enX ? 0.62 : largo + 0.02, 0x3a3430, x, y, z);
  solido(x - (enX ? largo / 2 : 0.3), z - (enX ? 0.3 : largo / 2), x + (enX ? largo / 2 : 0.3), z + (enX ? 0.3 : largo / 2), 1.7, 'bajo');
  contenedor(tipo, x + (enX ? 0 : 0.8), z + (enX ? 0.8 : 0));
}
const mostrador = (o, x, z, w, tipo) => { o.caja(w, 1.0, 0.7, 0x6a5a4a, x, 0.5, z); solido(x - w / 2, z - 0.35, x + w / 2, z + 0.35, 1.0, 'bajo'); if (tipo) contenedor(tipo, x, z - 0.9); };
function aparcamiento(o, x0, x1, z, az) {
  o.caja(x1 - x0, 0.05, 9, 0x4a4e56, (x0 + x1) / 2, 0.025, z);
  for (let x = x0 + 1.5; x < x1; x += 3) o.caja(0.12, 0.06, 4, 0xd8d0a0, x, 0.04, z - 2);
  for (let x = x0 + 3; x < x1 - 2; x += 3) if (az() < 0.45) coche(o, x, z - 2, [0x2a6ab8, 0xb8282e, 0x3a3a3e, 0xd8d8d0, 0x3a6a3a][Math.floor(az() * 5)], (az() < 0.5 ? 0 : Math.PI) + Math.PI / 2 + (az() - 0.5) * 0.2, true);
}

/* ---------- el polígono ---------- */
function poligono(o, az) {
  const naves = [[-186, 84], [-162, 84], [-120, 84], [-186, 152], [-120, 152]];
  naves.forEach(([cx, cz], i) => {
    const s = i % 2 ? 1 : -1;
    edificio(o, 'nv' + i, cx, cz, 22, 13, { color: 0x8a9098, tejado: 0x5a6068, suelo: 0x7a7a7a, tipo: 'nave',
      huecos: [{ lado: 's', en: -5, tipo: 'puerta' }, { lado: 's', en: 4, tipo: 'ventana' }, { lado: 'n', en: 0, tipo: 'ventana' }, { lado: 'e', en: 0, tipo: 'ventana' }, { lado: 'o', en: 2, tipo: 'puerta' }] });
    for (let k = 0; k < 3; k++) estante(o, cx - 7 + k * 7, cz - 4, 4, 'estanteria', 0x5a6a7a);
    estante(o, cx + 8, cz + 2, 3, 'estanteria', 0x5a6a7a, true);
    cajasCarton(o, cx + s * 3, cz + 3, az);
  });
  // la playa de contenedores y camiones aparcados
  const colores = [0x8a3a2a, 0x2a5a7a, 0x3a6a3a, 0xb07a20];
  for (let i = 0; i < 4; i++) maritimo(o, -168 + i * 9, 174 + (i % 2) * 5, colores[i], 0.05 * (i - 2), 0, i % 2 === 0);
  for (const [x, z] of [[-170, 104], [-134, 104], [-100, 168]]) coche(o, x, z, 0xd8d8d0, Math.PI / 2, true);
  for (let x = -204; x < -96; x += 6) if (az() < 0.5) erizo(o, x, 68 + az() * 3, az() * 3);
}

/* ---------- la zona comercial ---------- */
function comercial(o, az) {
  // el supermercado: pasillos de estantes y las cajas
  edificio(o, 'super', -48, 86, 30, 18, { color: 0xd8d4c8, tejado: 0x3a5a8a, rotulo: 0xc8282e, tipo: 'super',
    huecos: [{ lado: 's', en: -6, tipo: 'puerta' }, { lado: 's', en: 6, tipo: 'puerta' }, { lado: 's', en: -11, tipo: 'ventana' }, { lado: 's', en: 0, tipo: 'ventana' }, { lado: 's', en: 11, tipo: 'ventana' }, { lado: 'n', en: 8, tipo: 'puerta' }] });
  for (let k = 0; k < 5; k++) estante(o, -60 + k * 6, 83, 8, 'super', 0xe8e4dc, true);
  for (const x of [-56, -48, -40]) mostrador(o, x, 92, 2.4, null);
  aparcamiento(o, -64, -32, 104, az);
  // la gasolinera: marquesina con surtidores y su tienda
  o.caja(14, 0.4, 8, 0xd8d4c8, -14, 3.6, 92); o.caja(14.2, 0.5, 8.2, 0xc8282e, -14, 3.2, 92);
  for (const x of [-19, -9]) { o.caja(0.4, 3.4, 0.4, 0xd8d4c8, x, 1.7, 89); o.caja(0.4, 3.4, 0.4, 0xd8d4c8, x, 1.7, 95); }
  for (const x of [-17, -11]) { o.caja(0.8, 1.6, 0.6, 0x3a5a8a, x, 0.8, 92); solido(x - 0.4, 91.7, x + 0.4, 92.3, 1.6, 'bajo'); }
  edificio(o, 'gaso', -14, 80, 10, 7, { color: 0xe8e4dc, tejado: 0xc8282e, tipo: 'gasolinera',
    huecos: [{ lado: 's', en: 0, tipo: 'puerta' }, { lado: 's', en: 3, tipo: 'ventana' }, { lado: 'n', en: 2, tipo: 'ventana' }] });
  estante(o, -17, 79, 3, 'gasolinera', 0xe8e4dc); mostrador(o, -11, 80, 2, null);
  // la ferretería y la farmacia, al sur de la avenida
  edificio(o, 'ferre', -62, 140, 14, 10, { color: 0xb8a888, tejado: 0x6a4a2a, rotulo: 0xe8a020, tipo: 'ferreteria',
    huecos: [{ lado: 'n', en: 0, tipo: 'puerta' }, { lado: 'n', en: 4, tipo: 'ventana' }, { lado: 'e', en: 0, tipo: 'ventana' }] });
  estante(o, -66, 143, 4, 'ferreteria', 0x7a5a3a); estante(o, -58, 143, 4, 'ferreteria', 0x7a5a3a); mostrador(o, -62, 138, 3, null);
  edificio(o, 'farma', -36, 140, 10, 9, { color: 0xe8ece8, tejado: 0x3a8a4a, rotulo: 0x3ac86a, tipo: 'farmacia',
    huecos: [{ lado: 'n', en: 0, tipo: 'puerta' }, { lado: 'n', en: -3, tipo: 'ventana' }, { lado: 'o', en: 0, tipo: 'ventana' }] });
  estante(o, -36, 143, 6, 'farmacia', 0xe8ece8); mostrador(o, -36, 138, 3, null);
  aparcamiento(o, -78, -26, 158, az);
}

/* ---------- las afueras ---------- */
function afueras(o, az) {
  // la comisaría: recepción, despachos y la armería al fondo
  edificio(o, 'comis', 62, 88, 18, 13, { color: 0x9aa8b8, tejado: 0x2a3a5a, rotulo: 0x2a5ab8, tipo: 'comisaria',
    huecos: [{ lado: 's', en: 0, tipo: 'puerta' }, { lado: 's', en: -5, tipo: 'ventana' }, { lado: 's', en: 5, tipo: 'ventana' }, { lado: 'e', en: 0, tipo: 'ventana' }, { lado: 'o', en: -3, tipo: 'ventana' }],
    tabiques: [{ eje: 'x', en: -2, desde: -9, hasta: 9, paso: 4 }] });
  estante(o, 56, 84, 4, 'armeria', 0x3a3e46); estante(o, 66, 84, 4, 'armeria', 0x3a3e46); mostrador(o, 62, 91, 4, 'taquilla');
  for (const x of [52, 72]) coche(o, x, 102, 0x2a2a3a, Math.PI / 2, true);
  // el colegio: un pasillo y tres aulas con pupitres
  edificio(o, 'cole', 22, 152, 28, 15, { color: 0xd8b888, tejado: 0x8a3a2a, tipo: 'colegio',
    huecos: [{ lado: 'n', en: 0, tipo: 'puerta' }, { lado: 'n', en: -9, tipo: 'ventana' }, { lado: 'n', en: 9, tipo: 'ventana' }, { lado: 's', en: -9, tipo: 'ventana' }, { lado: 's', en: 0, tipo: 'ventana' }, { lado: 's', en: 9, tipo: 'ventana' }, { lado: 'e', en: 0, tipo: 'puerta' }],
    tabiques: [{ eje: 'x', en: -2.5, desde: -14, hasta: 14, paso: -9 }, { eje: 'z', en: -4.7, desde: -2.5, hasta: 7.5, paso: 2 }, { eje: 'z', en: 4.7, desde: -2.5, hasta: 7.5, paso: 2 }] });
  for (const ax of [13, 22, 31]) for (const dz of [1, 4]) { o.caja(1.2, 0.7, 0.7, 0x8a6a48, ax, 0.35, 152 + dz); solido(ax - 0.6, 152 + dz - 0.35, ax + 0.6, 152 + dz + 0.35, 0.7, 'bajo'); }
  for (const ax of [13, 22, 31]) contenedor('pupitre', ax, 152 + 2.5);
  // la granja: granero, campos y el bosque
  edificio(o, 'granero', 66, 152, 14, 11, { color: 0x9a3a2a, tejado: 0x5a2a20, tipo: 'granero',
    huecos: [{ lado: 'n', en: 0, tipo: 'puerta' }, { lado: 'o', en: 0, tipo: 'ventana' }, { lado: 's', en: 3, tipo: 'ventana' }] });
  estante(o, 62, 155, 4, 'granero', 0x7a5a3a); estante(o, 70, 155, 4, 'granero', 0x7a5a3a);
  for (let r = 0; r < 6; r++) for (let x = 46; x < 80; x += 2.2) o.caja(1.4, 0.25, 0.6, 0x5a4a2a, x, 0.12, 170 + r * 2.2);
  for (let i = 0; i < 40; i++) { const x = 6 + az() * 74, z = 128 + az() * 12; if (Math.abs(x - 40) > 5) arbolPelado(o, x, z, 1 + az() * 0.5, az); }
}
