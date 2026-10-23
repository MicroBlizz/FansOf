// Fans of Snakes · Mundos: las fases tipo Candy Crush. Cada mundo tiene su aspecto (TEMA, js/muros.js) y 5 fases; la quinta es
// la del JEFE. Cada fase tiene sus muros, un objetivo y las estrellas por tiempo: 1 por superarla, 2 si tardas menos de t2
// segundos y 3 si tardas menos de t3. La primera vez que la superas da su premio en monedas. Se desbloquean en orden.
// Para añadir una fase: otra línea en `fases` (los muros, de DIBUJOS_MUROS). El progreso se guarda en SAVE.fases.
'use strict';

const OBJETIVOS = {
  manzanas: { texto: 'Come {n} manzanas', valor: J => J.comidas },
  puntos:   { texto: 'Consigue {n} puntos', valor: J => J.puntos },
  frenesis: { texto: 'Haz {n} Frenesís', valor: J => J.frenesis },
  cortes:   { texto: 'Corta {n} trozos de cola en Frenesí', valor: J => J.monedasPartida },
  locuras:  { texto: 'Coge {n} locuras', valor: J => J.locuras },
  racha:    { texto: 'Consigue una racha x{n}', valor: J => J.mejorRacha },
};

const MUNDOS = [
  {
    id: 'jardin', nombre: 'EL JARDÍN', color: '#3ddc84', tema: TEMA_BASE,
    fases: [
      { muros: 'ninguno', obj: ['manzanas', 8], t3: 35, t2: 60, premio: 20 },
      { muros: 'esquinas', obj: ['manzanas', 12], t3: 50, t2: 80, premio: 25 },
      { muros: 'barras', obj: ['puntos', 600], t3: 60, t2: 100, premio: 30 },
      { muros: 'columnas', obj: ['frenesis', 1], t3: 60, t2: 100, premio: 35 },
      { muros: 'cruz', obj: ['manzanas', 25], t3: 110, t2: 160, premio: 80, jefe: true },
    ],
  },
  {
    id: 'oficina', nombre: 'LA OFICINA DE MICROBLIZZ', color: '#b388ff',
    tema: { fondo: '#1a1526', rejilla: '#2c2440', borde: '#4a3d6b', muro: '#6b5a8f', muroLuz: '#a593d1' },
    fases: [
      { muros: 'escritorios', obj: ['manzanas', 15], t3: 60, t2: 95, premio: 40 },
      { muros: 'escritorios', obj: ['frenesis', 2], t3: 90, t2: 140, premio: 45 },
      { muros: 'columnas', obj: ['cortes', 15], t3: 100, t2: 150, premio: 50 },
      { muros: 'laberinto', obj: ['locuras', 3], t3: 70, t2: 110, premio: 55 },
      { muros: 'marco', obj: ['puntos', 3000], t3: 120, t2: 180, premio: 120, jefe: true },
    ],
  },
  {
    id: 'retro', nombre: 'EL MÓVIL DE 1999', color: '#c5d4a8',
    tema: { fondo: '#2c3a24', rejilla: '#3a4a30', borde: '#8a9a72', muro: '#8a9a72', muroLuz: '#c5d4a8' },
    fases: [
      { muros: 'zigzag', obj: ['racha', 5], t3: 50, t2: 90, premio: 60 },
      { muros: 'marco', obj: ['manzanas', 30], t3: 120, t2: 170, premio: 65 },
      { muros: 'laberinto', obj: ['frenesis', 3], t3: 130, t2: 190, premio: 70 },
      { muros: 'cruz', obj: ['cortes', 35], t3: 150, t2: 210, premio: 80 },
      { muros: 'laberinto', obj: ['puntos', 6000], t3: 170, t2: 240, premio: 200, jefe: true },
    ],
  },
];

const idFase = (m, f) => MUNDOS[m].id + '-' + (f + 1);
const estrellasDe = (m, f) => (SAVE.fases || {})[idFase(m, f)] || 0;
// abierta: la primera de todas, o si la anterior (de este mundo o la última del mundo de antes) está superada
function faseAbierta(m, f) {
  if (m === 0 && f === 0) return true;
  if (f > 0) return estrellasDe(m, f - 1) > 0;
  return estrellasDe(m - 1, MUNDOS[m - 1].fases.length - 1) > 0;
}
const textoObjetivo = f => tr(OBJETIVOS[f.obj[0]].texto, { n: f.obj[1].toLocaleString('es-ES') });
const totalEstrellas = () => MUNDOS.reduce((a, M, m) => a + M.fases.reduce((b, _, f) => b + estrellasDe(m, f), 0), 0);
