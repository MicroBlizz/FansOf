// Fans Of · Arte: los colores del campo de cada facción (los usan los dos juegos)
'use strict';
// tu mitad del campo cambia según la facción
const THEMES = {
  animales:  { grad: ['#6eb646', '#70c24b', '#5aae3b'], greens: ['#4f9a35', '#5fae3e', '#86cf5a', '#3f8a2d', '#9bdc6a'], hedge: ['#3f8a35', '#5fae4a'], cap: '#e2463b', capDot: '#fff', title: ['#5fae3e', '#7cc957'] },
  nomuertos: { grad: ['#6a9a52', '#587f4c', '#4c6e47', '#3d5a40'], greens: ['#3e5e3a', '#4f7046', '#62815a', '#33502f', '#6f8f62'], hedge: ['#2f4a35', '#466b4a'], cap: '#8a4fd0', capDot: '#c8ffe0', title: ['#4c6e47', '#62815a'] },
  streamers: { grad: ['#5fae62', '#58a660', '#4b9658'], greens: ['#3f8a4a', '#4f9a55', '#7ac76a', '#357a40', '#8fd87a'], hedge: ['#357852', '#4f9a68'], cap: '#a855f7', capDot: '#f5d0fe', title: ['#4f9a55', '#6fbf6a'] },
  heroes:    { grad: ['#8cbf4a', '#94c652', '#7fb342'], greens: ['#6f9a35', '#86b043', '#a6cf5e', '#5f8a2d', '#b8dc70'], hedge: ['#5d8a35', '#7aa848'], cap: '#f59e0b', capDot: '#fff7d6', title: ['#86b043', '#a6cf5e'] },
  ciber:     { grad: ['#4f8068', '#46735e', '#3a604f'], greens: ['#2f5a48', '#3e6b56', '#5a8a72', '#26493b', '#6a9c84'], hedge: ['#28463f', '#3d6359'], cap: '#22e3ff', capDot: '#e0faff', title: ['#3e6b56', '#5a8a72'] },
  memes:     { grad: ['#7acb48', '#80d24e', '#6cc03e'], greens: ['#5aae3b', '#6cc04a', '#96df66', '#4a9a32', '#a8ec74'], hedge: ['#3f9a35', '#62bd4c'], cap: '#ff3df0', capDot: '#fff', title: ['#6cc04a', '#96df66'] },
  gamer:     { grad: ['#58b06a', '#5cb870', '#4ea464'], greens: ['#3f8f50', '#4fa060', '#7bcf86', '#358045', '#8fdc96'], hedge: ['#2f7a4a', '#4a9a62'], cap: '#22c55e', capDot: '#fff', title: ['#4fa060', '#7bcf86'] },
  olvidados: { grad: ['#93a36a', '#8a9a62', '#7b8b56'], greens: ['#6f7f4a', '#7f8f55', '#9aa86a', '#5f6f3f', '#a8b478'], hedge: ['#5f6f45', '#7d8c5a'], cap: '#a16207', capDot: '#fde68a', title: ['#7f8f55', '#9aa86a'] },
  pop:       { grad: ['#6cc04a', '#72c850', '#62b440'], greens: ['#4f9a35', '#62b440', '#8fd86a', '#438a2d', '#a2e47c'], hedge: ['#3f8a35', '#5fae4a'], cap: '#dc2626', capDot: '#fff', title: ['#62b440', '#8fd86a'] },
};
