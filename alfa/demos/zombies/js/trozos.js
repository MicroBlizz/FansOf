// Fans of Zombies · EL MUNDO POR TROZOS (dominio): alrededor del distrito hecho a mano (AJ.trozos.centro) el mundo sigue sin fin en
// trozos de 64 m que se generan con la semilla de la partida (e.semilla): siempre salen iguales en la misma partida y distintos en otra.
// Aquí se decide QUÉ hay en cada trozo (su plan: calles, casas, edificios, árboles, coches y campos) y los fans que lo habitan: se
// llenan la primera vez que se carga y, al descargarse, los fans tranquilos se guardan como un número (e.trozos[k].fans) que vuelve a
// salir al cargarlo otra vez. Dibujar y quitar el trozo es cosa de la pantalla (js/trozos-mapa.js). ADR 073.
'use strict';
var ZOM = globalThis.ZOM || (globalThis.ZOM = {});
(function (Z) {
  const T = (AJ) => AJ.trozos;
  Z.claveTrozo = (ci, cj) => ci + ',' + cj;
  Z.trozoDe = (AJ, x, z) => ({ ci: Math.floor((x - T(AJ).ox) / T(AJ).lado), cj: Math.floor((z - T(AJ).oz) / T(AJ).lado) });
  Z.rectTrozo = (AJ, ci, cj) => { const L = T(AJ).lado, x0 = T(AJ).ox + ci * L, z0 = T(AJ).oz + cj * L; return { x0, z0, x1: x0 + L, z1: z0 + L }; };
  const corta = (a, b) => a.x0 < b.x1 && a.x1 > b.x0 && a.z0 < b.z1 && a.z1 > b.z0;
  const crece = (r, m) => ({ x0: r.x0 - m, z0: r.z0 - m, x1: r.x1 + m, z1: r.z1 + m });
  Z.dentroDelCentro = (AJ, r) => corta(r, T(AJ).centro);
  Z.todoCentro = (AJ, r) => { const C = T(AJ).centro; return r.x0 >= C.x0 && r.x1 <= C.x1 && r.z0 >= C.z0 && r.z1 <= C.z1; };
  // un azar propio de cada trozo (mulberry32 sobre un hash de la semilla y las coordenadas)
  Z.azarTrozo = function (semilla, ci, cj, sal = 0) {
    let s = (Math.imul(semilla | 0, 2654435761) ^ Math.imul(ci, 374761393) ^ Math.imul(cj, 668265263) ^ Math.imul(sal + 1, 1274126177)) >>> 0;
    return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  };
  // la clase de un trozo: se decide por bloques de 2 x 2 trozos, para que los barrios no sean de un solo trozo
  Z.tipoTrozo = (AJ, semilla, ci, cj) => Z.sortea(T(AJ).tipos, Z.azarTrozo(semilla, Math.floor(ci / 2), Math.floor(cj / 2), 7));

  // el plan de un trozo: lo que hay dentro (nada que se meta en el distrito hecho a mano)
  Z.planTrozo = function (AJ, semilla, ci, cj) {
    const r = Z.rectTrozo(AJ, ci, cj), tipo = Z.tipoTrozo(AJ, semilla, ci, cj), az = Z.azarTrozo(semilla, ci, cj);
    const P = { clave: Z.claveTrozo(ci, cj), ci, cj, rect: r, tipo, calles: [], casas: [], edificios: [], arboles: [], coches: [], campos: [], fans: T(AJ).fans[tipo] };
    if (Z.todoCentro(AJ, r)) return Object.assign(P, { fans: 0 });
    callesDe(AJ, P);
    const cx = (r.x0 + r.x1) / 2, cz = (r.z0 + r.z1) / 2;
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz], q) => RELLENO[tipo](AJ, P, cuadrante(r, cx, cz, sx, sz), az, q));
    return limpia(AJ, P);
  };
  // las dos calles que cruzan cada trozo por el medio (así se unen con las del trozo de al lado); en el campo son caminos de tierra
  function callesDe(AJ, P) {
    const r = P.rect, cx = (r.x0 + r.x1) / 2, cz = (r.z0 + r.z1) / 2, tierra = P.tipo === 'bosque' || P.tipo === 'granja', ancho = tierra ? 5 : 8;
    for (const [a, b] of tramosFuera(r.x0, r.x1, cz, T(AJ).centro, 'x')) P.calles.push({ eje: 'x', fijo: cz, a, b, ancho, tierra });
    for (const [a, b] of tramosFuera(r.z0, r.z1, cx, T(AJ).centro, 'z')) P.calles.push({ eje: 'z', fijo: cx, a, b, ancho, tierra });
  }
  // el trozo de una línea que queda fuera del centro (0, 1 o 2 tramos)
  function tramosFuera(a, b, fijo, C, eje) {
    const [c0, c1] = eje === 'x' ? [C.x0, C.x1] : [C.z0, C.z1], [f0, f1] = eje === 'x' ? [C.z0, C.z1] : [C.x0, C.x1];
    if (fijo < f0 || fijo > f1 || c1 <= a || c0 >= b) return [[a, b]];
    return [[a, Math.min(b, c0)], [Math.max(a, c1), b]].filter(([p, q]) => q - p > 2);
  }
  // un cuadrante entre las dos calles: su caja y hacia dónde queda la calle de delante (sz: -1 = la calle está al sur)
  function cuadrante(r, cx, cz, sx, sz) {
    const m = 5.5, x0 = sx < 0 ? r.x0 + 1 : cx + m, x1 = sx < 0 ? cx - m : r.x1 - 1, z0 = sz < 0 ? r.z0 + 1 : cz + m, z1 = sz < 0 ? cz - m : r.z1 - 1;
    return { x0, x1, z0, z1, cx: (x0 + x1) / 2, cz: (z0 + z1) / 2, calleZ: sz < 0 ? z1 : z0, frente: sz < 0 ? 1 : -1 };
  }
  const id = (P, n) => 't' + P.ci + '_' + P.cj + '_' + n;
  const pal = (az, n) => Math.floor(az() * n);
  const RELLENO = {
    barrio(AJ, P, Q, az, q) {
      if (az() < 0.18) { for (let i = 0; i < 6; i++) P.arboles.push({ x: Q.x0 + 2 + az() * (Q.x1 - Q.x0 - 4), z: Q.z0 + 2 + az() * (Q.z1 - Q.z0 - 4), s: 1 + az() * 0.4 }); return; }
      for (const dx of [-6.5, 6.5]) {
        const w = 8 + Math.round(az() * 2), d = 7 + Math.round(az()), cz = Q.calleZ - Q.frente * (d / 2 + 3);
        P.casas.push({ id: id(P, q * 2 + (dx > 0)), cx: Q.cx + dx, cz, w, d, frente: Q.frente, paleta: pal(az, 6) });
      }
      for (let i = 0; i < 3; i++) P.arboles.push({ x: Q.x0 + 1.5 + az() * (Q.x1 - Q.x0 - 3), z: Q.calleZ - Q.frente * (13 + az() * 9), s: 0.9 + az() * 0.4 });
      if (az() < 0.5) P.coches.push(cocheEnCalle(P, Q, az));
    },
    comercial(AJ, P, Q, az, q) {
      const k = ['super', 'farmacia', 'ferreteria', 'gasolinera'][pal(az, 4)], [w, d] = { super: [20, 13], farmacia: [10, 9], ferreteria: [14, 10], gasolinera: [10, 7] }[k];
      P.edificios.push({ id: id(P, q), tipo: k, cx: Q.cx, cz: Q.calleZ - Q.frente * (d / 2 + 3), w, d, lado: Q.frente > 0 ? 's' : 'n', estantes: Math.max(1, Math.round(w / 7)) });
      P.coches.push(cocheEnCalle(P, Q, az));
    },
    poligono(AJ, P, Q, az, q) {
      if (az() < 0.25) { P.edificios.push({ id: id(P, q), tipo: 'contenedores', cx: Q.cx, cz: Q.cz, w: 18, d: 10, colores: [pal(az, 4), pal(az, 4), pal(az, 4)] }); return; }
      P.edificios.push({ id: id(P, q), tipo: 'nave', cx: Q.cx, cz: Q.calleZ - Q.frente * 9, w: 20, d: 12, lado: Q.frente > 0 ? 's' : 'n', estantes: 3 });
      if (az() < 0.5) P.coches.push(cocheEnCalle(P, Q, az));
    },
    granja(AJ, P, Q, az, q) {
      const que = (q + pal(az, 4)) % 4;
      if (que === 0) P.edificios.push({ id: id(P, q), tipo: 'granero', cx: Q.cx, cz: Q.calleZ - Q.frente * 8.5, w: 14, d: 11, lado: Q.frente > 0 ? 's' : 'n', estantes: 2 });
      else if (que < 3) P.campos.push({ x0: Q.x0 + 1, x1: Q.x1 - 1, z0: Q.z0 + 1, z1: Q.z1 - 1 });
      else for (let i = 0; i < 10; i++) P.arboles.push({ x: Q.x0 + 1 + az() * (Q.x1 - Q.x0 - 2), z: Q.z0 + 1 + az() * (Q.z1 - Q.z0 - 2), s: 1 + az() * 0.5 });
    },
    bosque(AJ, P, Q, az) {
      for (let i = 0; i < 12; i++) P.arboles.push({ x: Q.x0 + 1 + az() * (Q.x1 - Q.x0 - 2), z: Q.z0 + 1 + az() * (Q.z1 - Q.z0 - 2), s: 1 + az() * 0.6 });
      if (az() < 0.15) P.coches.push({ x: Q.cx, z: Q.cz, color: pal(az, 5), giro: az() * 6 });   // un coche abandonado entre los árboles
    },
  };
  const cocheEnCalle = (P, Q, az) => ({ x: Q.x0 + 3 + az() * (Q.x1 - Q.x0 - 6), z: Q.calleZ + Q.frente * 2.5, color: pal(az, 5), giro: Math.PI / 2 + (az() < 0.5 ? 0 : Math.PI) + (az() - 0.5) * 0.3 });
  // fuera lo que pise el distrito hecho a mano (con margen)
  function limpia(AJ, P) {
    const C = crece(T(AJ).centro, 3), fuera = (x0, z0, x1, z1) => !corta({ x0, z0, x1, z1 }, C);
    P.casas = P.casas.filter((c) => fuera(c.cx - c.w / 2, c.cz - c.d / 2, c.cx + c.w / 2, c.cz + c.d / 2));
    P.edificios = P.edificios.filter((c) => fuera(c.cx - c.w / 2, c.cz - c.d / 2, c.cx + c.w / 2, c.cz + c.d / 2));
    P.arboles = P.arboles.filter((a) => fuera(a.x - 1, a.z - 1, a.x + 1, a.z + 1));
    P.coches = P.coches.filter((a) => fuera(a.x - 3, a.z - 3, a.x + 3, a.z + 3));
    P.campos = P.campos.filter((c) => fuera(c.x0, c.z0, c.x1, c.z1));
    return P;
  }

  // al cargar un trozo: la primera vez se llena con sus fans; las demás vuelven los que se guardaron al descargarlo
  Z.entraTrozo = function (AJ, e, P, mundo, azar) {
    const E = e.trozos || (e.trozos = {}), t = E[P.clave] || (E[P.clave] = { fans: Math.round(P.fans * e.dif.zombis) });
    const hueco = Math.max(0, AJ.mundo.maxZombis - Z.vivos(e).length), n = Math.min(t.fans, hueco), J = e.jugador;
    let salen = 0;
    for (let i = 0; i < n * 3 && salen < n; i++) {
      const p = mundo.puntoTrozo(P.rect, azar);
      if (!p || Z.dist(p.x, p.z, J.x, J.z) < T(AJ).lejosDeTi) continue;
      Z.nuevoZombi(AJ, e, Z.sortea(T(AJ).reparto[P.tipo] || AJ.reparto, azar), p.x, p.z, azar); salen++;
    }
    t.fans -= salen;
    return Z.ok(salen);
  };
  // al descargar un trozo: los fans tranquilos (y los caídos) de dentro se quitan; los vivos se guardan como número
  Z.saleTrozo = function (AJ, e, P) {
    const E = e.trozos || (e.trozos = {}), t = E[P.clave] || (E[P.clave] = { fans: 0 }), r = P.rect;
    const dentro = (z) => z.x >= r.x0 && z.x < r.x1 && z.z >= r.z0 && z.z < r.z1 && (z.vida <= 0 || z.estado === 'vaga') && !z.T.jefe;
    const fuera = e.zombis.filter(dentro);
    t.fans += fuera.filter((z) => z.vida > 0).length;
    e.zombis = e.zombis.filter((z) => !dentro(z));
    return Z.ok(fuera.map((z) => z.id));
  };
})(ZOM);
