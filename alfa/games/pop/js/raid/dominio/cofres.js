// Fans of Pop · RAID, los cofres escondidos (dominio puro, tarea 448): sus posiciones y monedas salen de una SEMILLA entera que guarda el servidor
// y reparte a todos los clientes. El servidor NO repite este algoritmo: solo guarda la semilla; el móvil pinta los cofres y los paga (las monedas de
// Pop viven solo en el móvil). cfg = { cantidad, min, max, lado, zona? }; `zona` = { x, y, lado } limita el reparto a un cuadrado del tablero (la
// raid de prueba de la alfa); sin zona, todo el tablero. Una cfg mal formada lanza Error (fallo de programación). ALGORITMO EXACTO:
//  1) generador mulberry32 sobre enteros de 32 bits: a = semilla|0; cada paso: a = (a + 0x6D2B79F5)|0; t = imul(a ^ (a>>>15), 1|a);
//     t = (t + imul(t ^ (t>>>7), 61|t)) ^ t; devuelve (t ^ (t>>>14))>>>0 (un entero sin signo de 32 bits);
//  2) por cada cofre, en orden: se sacan dos números, x = zona.x + n1 mod zona.lado, y = zona.y + n2 mod zona.lado; si esa casilla ya tiene cofre
//     se repite el par (todo el par) hasta que sea nueva; luego se saca un tercero y monedas = min + (n3 mod (max - min + 1)).
'use strict';
const PP_RAID_COFRES = (() => {
  function mulberry32(semilla) {
    let a = semilla | 0;
    return () => {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return (t ^ (t >>> 14)) >>> 0;
    };
  }
  const clave = (x, y, lado) => y * lado + x;
  const ent = Number.isInteger;

  // la zona de reparto (por defecto, todo el tablero); lanza Error si cfg no vale
  function zonaDe(cfg) {
    const { cantidad, min, max, lado } = cfg;
    if (![cantidad, min, max, lado].every(ent)) throw new Error('cofres: cantidad, min, max y lado deben ser enteros');
    if (cantidad < 0 || lado < 1 || min > max) throw new Error('cofres: cantidad, lado o rango de monedas imposibles');
    const z = cfg.zona || { x: 0, y: 0, lado };
    comprobarZona(z, lado);
    if (cantidad > z.lado * z.lado) throw new Error('cofres: la zona tiene menos casillas que cofres');
    return z;
  }
  function comprobarZona(z, lado) {
    if (![z.x, z.y, z.lado].every(ent) || z.x < 0 || z.y < 0 || z.lado < 1) throw new Error('cofres: la zona debe ser { x, y, lado } enteros');
    if (z.x + z.lado > lado || z.y + z.lado > lado) throw new Error('cofres: la zona no cabe en el tablero');
  }

  // la lista [{ x, y, monedas }, ...] de una semilla
  function generar(semilla, cfg) {
    const z = zonaDe(cfg);
    const sig = mulberry32(semilla);
    const vistas = new Set();
    const lista = [];
    while (lista.length < cfg.cantidad) {
      const x = z.x + sig() % z.lado, y = z.y + sig() % z.lado;
      if (vistas.has(clave(x, y, cfg.lado))) continue;
      vistas.add(clave(x, y, cfg.lado));
      lista.push({ x, y, monedas: cfg.min + (sig() % (cfg.max - cfg.min + 1)) });
    }
    return lista;
  }
  // el índice de consulta rápida de una lista
  function indexar(lista, lado) { return new Map(lista.map(c => [clave(c.x, c.y, lado), c.monedas])); }
  const hayCofre = (indice, x, y, lado) => indice.has(clave(x, y, lado));
  const monedasEn = (indice, x, y, lado) => indice.get(clave(x, y, lado)) || 0;
  return Object.freeze({ mulberry32, generar, indexar, hayCofre, monedasEn });
})();
if (typeof module !== 'undefined') module.exports = PP_RAID_COFRES;
