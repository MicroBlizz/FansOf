// Fans of Zombies · LOS TROZOS DEL MUNDO (pantalla y mapa): dibuja los trozos que tienes cerca a partir de su plan (js/trozos.js) con las
// mismas piezas del barrio y los barrios del sur (casas, naves, tiendas, granero, árboles, coches) y quita los que quedan lejos: sus
// mallas, sus choques, sus sitios para registrar, sus puertas y ventanas. Se carga como mucho un trozo por fotograma. Lo que hiciste en
// un trozo (registrar, tablas, puertas) va en la partida por su id, así que al volver está igual. ADR 073.
'use strict';
const TROZOS = { cargados: new Map(), semilla: null, sucio: false };
const COLORES_COCHE = [0x2a6ab8, 0xb8282e, 0x3a3a3e, 0xd8d8d0, 0x3a6a3a];
const COLORES_MARITIMO = [0x8a3a2a, 0x2a5a7a, 0x3a6a3a, 0xb07a20];

// cada fotograma: quita los trozos lejanos y pone el que falte más cerca (en la torre no se toca nada)
function avanzaTrozos(e) {
  if (e.planta) return;
  if (TROZOS.semilla !== e.semilla) { descargaTrozos(null); TROZOS.semilla = e.semilla; }
  const AJ = ZOM.AJ, T = AJ.trozos, { ci, cj } = ZOM.trozoDe(AJ, e.jugador.x, e.jugador.z);
  for (const [k, Tr] of TROZOS.cargados) if (Math.abs(Tr.P.ci - ci) > T.descarga || Math.abs(Tr.P.cj - cj) > T.descarga) quitaTrozo(e, k, Tr);
  let mejor = null, dMin = Infinity;
  for (let di = -T.carga; di <= T.carga; di++) for (let dj = -T.carga; dj <= T.carga; dj++) {
    const a = ci + di, b = cj + dj;
    if (TROZOS.cargados.has(ZOM.claveTrozo(a, b)) || ZOM.todoCentro(AJ, ZOM.rectTrozo(AJ, a, b))) continue;
    if (di * di + dj * dj < dMin) { dMin = di * di + dj * dj; mejor = [a, b]; }
  }
  if (mejor) ponTrozo(e, mejor[0], mejor[1]);
}
function ponTrozo(e, ci, cj) {
  const AJ = ZOM.AJ, P = ZOM.planTrozo(AJ, e.semilla, ci, cj), Tr = construyeTrozo(P);
  TROZOS.cargados.set(P.clave, Tr); TROZOS.sucio = true;
  ZOM.preparaHuecos(AJ, e, Tr.huecos.map((h) => ({ id: h.id, tipo: h.tipo })));
  ZOM.entraTrozo(AJ, e, P, MUNDO, azarJuego);
}
function quitaTrozo(e, k, Tr) {
  if (e) { for (const id of ZOM.saleTrozo(ZOM.AJ, e, Tr.P).valor) quitaVistaZombi(id); if (e.abierto && Tr.sitios.some((s) => s.id === e.abierto)) cierraMochila(); }
  borraCosas(Tr);
  TROZOS.cargados.delete(k); TROZOS.sucio = true;
}
// todos fuera (al acabar una partida o empezar otra con otra semilla)
function descargaTrozos(e) { for (const [k, Tr] of TROZOS.cargados) quitaTrozo(e, k, Tr); }
// los sitios que se pueden registrar en los trozos cargados
function sitiosTrozos() { const out = []; for (const Tr of TROZOS.cargados.values()) out.push(...Tr.sitios); return out; }

// construir un trozo: se apunta lo que había antes para saber qué ha añadido (choques, sitios, huecos, casas y mallas)
function construyeTrozo(P) {
  const ini = { s: MAPA.solidos.length, c: MAPA.contenedores.length, h: BARRIO.huecos.length, k: BARRIO.casas.length, o: MOTOR.escena.children.length };
  const o = new Obra(), az = ZOM.azarTrozo(TROZOS.semilla, P.ci, P.cj, 3);
  for (const k of P.calles) calleTrozo(o, k);
  for (const c of P.casas) casa(o, c.id, c.cx, c.cz, c.w, c.d, c.frente, COLORES_CASA[c.paleta], az);
  for (const E of P.edificios) EDIFICIO_TROZO[E.tipo](o, E, az);
  for (const c of P.campos) campoTrozo(o, c);
  for (const a of P.arboles) arbolPelado(o, a.x, a.z, a.s, az);
  for (const c of P.coches) coche(o, c.x, c.z, COLORES_COCHE[c.color], c.giro, true);
  MOTOR.escena.add(o.hecha());
  const Tr = { P, solidos: MAPA.solidos.slice(ini.s), contenedores: MAPA.contenedores.slice(ini.c), huecos: BARRIO.huecos.slice(ini.h), casas: BARRIO.casas.slice(ini.k), objetos: MOTOR.escena.children.slice(ini.o) };
  Tr.sitios = Tr.contenedores.map((c, i) => ({ id: P.clave + ':' + i, x: c.x, z: c.z, tipo: c.tipo }));
  return Tr;
}
// quitar lo que puso un trozo
function borraCosas(Tr) {
  const fuera = (lista, quitar) => { const S = new Set(quitar); return lista.filter((x) => !S.has(x)); };
  for (const s of Tr.solidos) quitaDeRejilla(s);
  MAPA.solidos = fuera(MAPA.solidos, Tr.solidos);
  MAPA.contenedores = fuera(MAPA.contenedores, Tr.contenedores);
  BARRIO.huecos = fuera(BARRIO.huecos, Tr.huecos); for (const h of Tr.huecos) delete BARRIO.porId[h.id];
  BARRIO.casas = fuera(BARRIO.casas, Tr.casas);
  for (const g of Tr.objetos) { MOTOR.escena.remove(g); g.traverse((m) => { if (m.geometry) m.geometry.dispose(); if (m.material && m.material.transparent) m.material.dispose(); }); }
}
function quitaDeRejilla(s) {
  const C = MAPA.CEL;
  for (let i = Math.floor(s.x0 / C); i <= Math.floor(s.x1 / C); i++) for (let j = Math.floor(s.z0 / C); j <= Math.floor(s.z1 / C); j++) {
    const k = i + ',' + j, l = MAPA.rejilla.get(k); if (!l) continue;
    const n = l.filter((x) => x !== s); if (n.length) MAPA.rejilla.set(k, n); else MAPA.rejilla.delete(k);
  }
}

/* ---------- las piezas de un trozo ---------- */
// una calle (asfalto con aceras y rayas, o un camino de tierra en el campo)
function calleTrozo(o, k) {
  const L = k.b - k.a, m = (k.a + k.b) / 2, enX = k.eje === 'x';
  const tira = (ancho, alto, color, y, desv) => (enX ? o.caja(L, alto, ancho, color, m, y, k.fijo + desv) : o.caja(ancho, alto, L, color, k.fijo + desv, y, m));
  if (k.tierra) { tira(k.ancho, 0.05, 0x8a7a66, 0.025, 0); return; }
  tira(k.ancho, 0.06, 0x3c4048, 0.03, 0);
  for (const s of [-1, 1]) tira(1.4, 0.14, 0x8a8e96, 0.07, s * (k.ancho / 2 + 0.7));
  for (let p = k.a + 2; p < k.b - 1; p += 5) (enX ? o.caja(2.2, 0.07, 0.22, 0xd8d0a0, p, 0.04, k.fijo) : o.caja(0.22, 0.07, 2.2, 0xd8d0a0, k.fijo, 0.04, p));
  for (let p = k.a + 9; p < k.b - 2; p += 22) (enX ? farolaBarrio(o, p, k.fijo + k.ancho / 2 + 1.2) : farolaBarrio(o, k.fijo + k.ancho / 2 + 1.2, p));
}
// un campo arado (surcos que no chocan)
function campoTrozo(o, c) { for (let z = c.z0 + 1; z < c.z1 - 0.5; z += 2.2) o.caja(c.x1 - c.x0 - 1, 0.25, 0.6, 0x5a4a2a, (c.x0 + c.x1) / 2, 0.12, z); }
// la puerta da a la calle (lado n o s) y hay ventanas en los demás lados
const huecosTrozo = (E) => [{ lado: E.lado, en: -E.w / 4, tipo: 'puerta' }, { lado: E.lado, en: E.w / 4, tipo: 'ventana' }, { lado: E.lado === 's' ? 'n' : 's', en: 0, tipo: 'ventana' }, { lado: 'e', en: 0, tipo: 'ventana' }, { lado: 'o', en: 0, tipo: 'ventana' }];
// los estantes en fila por el fondo del edificio (lejos de la puerta)
function estantesTrozo(o, E, tipo, color) {
  const z = E.cz + (E.lado === 's' ? -1 : 1) * (E.d / 2 - 1.6), paso = (E.w - 4) / Math.max(1, E.estantes);
  for (let i = 0; i < E.estantes; i++) estante(o, E.cx - E.w / 2 + 2 + paso * (i + 0.5), z, Math.min(4, paso - 1), tipo, color);
}
const TIENDA = { super: [0xd8d4c8, 0x3a5a8a, 0xc8282e, 'super'], farmacia: [0xe8ece8, 0x3a8a4a, 0x3ac86a, 'farmacia'], ferreteria: [0xb8a888, 0x6a4a2a, 0xe8a020, 'ferreteria'], gasolinera: [0xe8e4dc, 0xc8282e, null, 'gasolinera'] };
const tienda = (k) => (o, E) => {
  const [color, tejado, rotulo, tipo] = TIENDA[k];
  edificio(o, E.id, E.cx, E.cz, E.w, E.d, { color, tejado, rotulo, tipo: k, huecos: huecosTrozo(E) });
  estantesTrozo(o, E, tipo, 0x6a5a4a);
};
const EDIFICIO_TROZO = {
  super: tienda('super'), farmacia: tienda('farmacia'), ferreteria: tienda('ferreteria'), gasolinera: tienda('gasolinera'),
  nave(o, E, az) {
    edificio(o, E.id, E.cx, E.cz, E.w, E.d, { color: 0x8a9098, tejado: 0x5a6068, suelo: 0x7a7a7a, tipo: 'nave', huecos: huecosTrozo(E) });
    estantesTrozo(o, E, 'estanteria', 0x5a6a7a); cajasCarton(o, E.cx + 3, E.cz, az);
  },
  granero(o, E) {
    edificio(o, E.id, E.cx, E.cz, E.w, E.d, { color: 0x9a3a2a, tejado: 0x5a2a20, tipo: 'granero', huecos: huecosTrozo(E) });
    estantesTrozo(o, E, 'granero', 0x7a5a3a);
  },
  // contenedores de barco en fila (los de los extremos se abren)
  contenedores(o, E) {
    E.colores.forEach((c, i) => {
      const z = E.cz - 3.2 + i * 3.2, col = COLORES_MARITIMO[c];
      o.caja(6, 2.6, 2.4, col, E.cx, 1.3, z); o.caja(6.04, 0.12, 2.44, NIEVE_M, E.cx, 2.66, z);
      for (let k = -2.7; k <= 2.7; k += 0.6) o.caja(0.1, 2.4, 2.46, col, E.cx + k, 1.3, z);
      solido(E.cx - 3, z - 1.2, E.cx + 3, z + 1.2, 2.6, 'muro');
      if (i !== 1) contenedor('militar', E.cx + 3.6, z);
    });
  },
};
