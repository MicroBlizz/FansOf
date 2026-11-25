// Fans of Pop · REGIONES: los 100 mundos del juego van en 10 regiones de 10 mundos. Aquí está la lista de regiones (nombre, truco
// propio, rival del jefazo) y la función con la que el archivo de cada región (js/regiones/rNN-*.js) rellena sus mundos; los datos
// de cada mundo viven en esos archivos. Lógica pura: sin pantalla, sin azar, sin reloj y sin guardado.
// Se carga antes de js/niveles.js, que arma PP_MUNDOS con ppMundosAbiertos().
'use strict';
const PP_MUNDOS_POR_REGION = 10;
// n: número de región (1-10) · truco: la regla nueva de la región (null = las burbujas de siempre) · jefazo: rival del jefe del
// último mundo de la región (null = el CEO de siempre) · mundos: los datos de sus mundos, que rellena ppRegistraRegion
const PP_REGIONES = [
  { n: 1, nombre: 'Dulce Hogar', truco: null, jefazo: 'ceoespacial', mundos: [] },
  { n: 2, nombre: 'Valle Arcoíris', truco: 'aspa', jefazo: null, mundos: [] },
  { n: 3, nombre: 'Granja Feliz', truco: 'setos', jefazo: null, mundos: [] },
  { n: 4, nombre: 'Ciudad de Juguete', truco: 'gemelas', jefazo: null, mundos: [] },
  { n: 5, nombre: 'Isla Tropical', truco: 'gigante', jefazo: null, mundos: [] },
  { n: 6, nombre: 'País del Invierno', truco: 'dormilonas', jefazo: null, mundos: [] },
  { n: 7, nombre: 'Reino de los Cuentos', truco: 'espejo', jefazo: null, mundos: [] },
  { n: 8, nombre: 'Mercado del Mundo', truco: 'color', jefazo: null, mundos: [] },
  { n: 9, nombre: 'Parque de los Sueños', truco: 'saltarina', jefazo: null, mundos: [] },
  { n: 10, nombre: 'Galaxia de Caramelo', truco: 'mezcla', jefazo: null, mundos: [] },
];
// El archivo de una región le da sus mundos: los 10 a la vez y en orden de región (la 2 después de la 1…), para que cada mundo tenga
// siempre el mismo número (el nivel global y las partidas guardadas dependen de él) y el jefazo caiga en el mundo 10 de la región.
// Un fallo aquí es de programación (región que no existe, repetida, fuera de orden, incompleta o tarde): lanza.
let ppRegionesCerradas = false;
function ppRegistraRegion(n, mundos) {
  const r = PP_REGIONES[n - 1];
  if (ppRegionesCerradas) throw new Error('ppRegistraRegion: la región ' + n + ' llega tarde (PP_MUNDOS ya está hecho: cárgala antes de js/niveles.js)');
  if (!r || r.n !== n) throw new Error('ppRegistraRegion: no existe la región ' + n);
  if (r.mundos.length) throw new Error('ppRegistraRegion: la región ' + n + ' ya tiene sus mundos');
  if (n > 1 && !PP_REGIONES[n - 2].mundos.length) throw new Error('ppRegistraRegion: la región ' + n + ' va después de la ' + (n - 1));
  if (!Array.isArray(mundos) || mundos.length !== PP_MUNDOS_POR_REGION) throw new Error('ppRegistraRegion: la región ' + n + ' lleva ' + PP_MUNDOS_POR_REGION + ' mundos justos');
  r.mundos.push(...mundos);
}
// Los mundos de las regiones que ya tienen datos, en orden (la lista plana que usa el juego)
function ppMundosAbiertos() { return PP_REGIONES.flatMap(r => r.mundos); }
// js/niveles.js arma PP_MUNDOS con esto: desde aquí ya no entra ninguna región (llegaría tarde y PP_MUNDOS no la tendría)
function ppCierraRegiones() { ppRegionesCerradas = true; return ppMundosAbiertos(); }
// Los 100 huecos del selector: n (1-100), su región (1-10), los datos del mundo (o null) y si está abierto (tiene datos)
function ppHuecosMundo() {
  const huecos = [];
  for (const r of PP_REGIONES) {
    for (let i = 0; i < PP_MUNDOS_POR_REGION; i++) {
      const mundo = r.mundos[i] || null;
      huecos.push({ n: (r.n - 1) * PP_MUNDOS_POR_REGION + i + 1, region: r.n, mundo, abierto: !!mundo });
    }
  }
  return huecos;
}
// Región de un mundo dado por su índice (0 = el primero de PP_MUNDOS) y si es el último de ella. Fuera de rango: null.
function ppRegionDeMundo(m) {
  if (!Number.isInteger(m) || m < 0) return null;
  const r = PP_REGIONES[Math.floor(m / PP_MUNDOS_POR_REGION)];
  return r && r.mundos.length ? { region: r, ultimo: m % PP_MUNDOS_POR_REGION === PP_MUNDOS_POR_REGION - 1 } : null;
}
