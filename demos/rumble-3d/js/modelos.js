// Boceto 3D de Fans of Rumble · Los muñecos en 3D, copiando los colores y la gracia de sus dibujos del juego
// (core/js/serie/arte/animales.js y microblizz.js): CrazyBunny, MadSquirrel, MeerCat, MechaVaca (con su vaca),
// el Becario de Microblizz y su jefe, SurvivalBot.
// Cada muñeco se parte en trozos que se mueven por separado («huesos»): cuerpo, cabeza, brazos, piernas y cola.
// El «pivote» de cada trozo es el punto sobre el que gira (el hombro para el brazo, el cuello para la cabeza…).
// El muñeco mira hacia +Z y tiene los pies en el suelo (y = 0).
'use strict';
import { bola, caja, cajaRedonda, cono, cilindro, aro, mover } from './piezas.js';

const OL = 0x20102c;

function bunny() {
  const blanco = 0xf7f3ff, rosa = 0xffb3cf;
  const corona = mover([
    cilindro(0xffcb3d, [0, 0, 0], 0.5, 0.56, 0.42, 0, 12),
    ...[0, 1, 2, 3, 4].map(i => { const a = (i / 5) * Math.PI * 2 + 0.3; return cono(0xffcb3d, [Math.sin(a) * 0.45, 0.33, Math.cos(a) * 0.45], 0.13, 0.32, 0, 6); }),
    bola(0xff4b5c, [0, 0.02, 0.55], [0.13, 0.13, 0.08]),
  ], { p: [-0.25, 4.62, 0.3], r: [-0.25, 0, 0.22] });
  return {
    nombre: 'CrazyBunny', escala: 0.9, radio: 1.6, alto: 5.7,
    huesos: {
      cuerpo: { padre: null, pivote: [0, 0.9, 0], piezas: [
        bola(blanco, [0, 1.45, 0], [1.25, 1.2, 1.1]),
        bola(0xffe0ee, [0, 1.35, 0.62], [0.82, 0.86, 0.52]),
        // la capa naranja de rey (un cono aplastado detrás)
        ...mover([cono(0xff7a1a, [0, 0, 0], 1.55, 2.7, 0, 16)], { p: [0, 1.45, -0.7], r: [-0.12, 0, 0], s: [1, 1, 0.42] }),
      ] },
      cabeza: { padre: 'cuerpo', pivote: [0, 2.45, 0], piezas: [
        bola(blanco, [0, 3.25, 0.05], [1.4, 1.3, 1.25]),
        bola(0xff9cc4, [-0.95, 2.95, 0.82], [0.3, 0.19, 0.12], [0, -0.7, 0]),
        bola(0xff9cc4, [0.95, 2.95, 0.82], [0.3, 0.19, 0.12], [0, 0.7, 0]),
        // ojo normal (a la derecha según lo miras) y ojo loco con la espiral morada
        bola(0xffffff, [0.62, 3.42, 1.0], [0.5, 0.56, 0.32]),
        bola(OL, [0.72, 3.4, 1.28], 0.17),
        bola(0xffffff, [0.85, 3.55, 1.38], 0.06),
        bola(0xffffff, [-0.6, 3.48, 1.0], [0.46, 0.5, 0.32]),
        aro(0x8a2bff, [-0.6, 3.48, 1.3], 0.27, 0.045),
        aro(0x8a2bff, [-0.6, 3.48, 1.32], 0.13, 0.045),
        bola(0x8a2bff, [-0.6, 3.48, 1.33], 0.05),
        // boca abierta con los dos dientes, y la nariz
        bola(0x5a1530, [0, 2.74, 1.02], [0.5, 0.3, 0.25]),
        caja(0xffffff, [-0.12, 2.9, 1.2], [0.2, 0.24, 0.08]),
        caja(0xffffff, [0.12, 2.9, 1.2], [0.2, 0.24, 0.08]),
        bola(0xff7aa8, [0, 3.07, 1.27], [0.14, 0.1, 0.1]),
        // orejas: la izquierda tiesa y la derecha doblada
        bola(blanco, [-0.55, 5.0, -0.1], [0.42, 1.3, 0.28], [0, 0, 0.12]),
        bola(rosa, [-0.57, 5.0, 0.12], [0.2, 0.95, 0.1], [0, 0, 0.12]),
        bola(blanco, [0.62, 4.5, -0.1], [0.42, 0.8, 0.28], [0, 0, -0.28]),
        bola(blanco, [1.22, 5.05, -0.1], [0.38, 0.78, 0.25], [0, 0, -1.1]),
        bola(rosa, [1.22, 5.05, 0.1], [0.17, 0.55, 0.1], [0, 0, -1.1]),
        ...corona,
      ] },
      brazoI: { padre: 'cuerpo', pivote: [-1.1, 2.05, 0.1], piezas: [
        bola(blanco, [-1.32, 1.6, 0.15], [0.32, 0.6, 0.32], [0, 0, 0.3]),
        bola(blanco, [-1.48, 1.08, 0.28], 0.36),
      ] },
      brazoD: { padre: 'cuerpo', pivote: [1.1, 2.05, 0.1], piezas: [
        bola(blanco, [1.32, 1.6, 0.15], [0.32, 0.6, 0.32], [0, 0, -0.3]),
        // la zanahoria gigante: se agarra por la punta y pega con la parte gorda
        cono(0xff8a1f, [1.55, 2.35, 0.55], 0.46, 2.9, [Math.PI - 0.22, 0, 0.12], 12),
        aro(0xc45a12, [1.55, 2.0, 0.47], 0.24, 0.04, [Math.PI / 2 - 0.22, 0, 0.12]),
        aro(0xc45a12, [1.57, 2.8, 0.65], 0.36, 0.04, [Math.PI / 2 - 0.22, 0, 0.12]),
        cono(0x5cc23a, [1.38, 4.05, 0.8], 0.2, 0.95, [-0.2, 0, 0.45], 6),
        cono(0x47a82f, [1.78, 4.05, 0.82], 0.2, 0.9, [-0.2, 0, -0.35], 6),
        bola(blanco, [1.48, 1.08, 0.28], 0.38),
      ] },
      piernaI: { padre: null, pivote: [-0.55, 0.7, 0], piezas: [bola(blanco, [-0.6, 0.3, 0.25], [0.5, 0.32, 0.7])] },
      piernaD: { padre: null, pivote: [0.55, 0.7, 0], piezas: [bola(blanco, [0.6, 0.3, 0.25], [0.5, 0.32, 0.7])] },
    },
  };
}

function squirrel() {
  const pelo = 0xb14d1c, crema = 0xf6d7a7, cola = 0xc45a22;
  return {
    nombre: 'MadSquirrel', escala: 0.78, radio: 1.1, alto: 3.3,
    huesos: {
      cuerpo: { padre: null, pivote: [0, 0.6, 0], piezas: [
        bola(pelo, [0, 1.0, 0], [0.85, 0.9, 0.8]),
        bola(crema, [0, 0.95, 0.5], [0.55, 0.62, 0.4]),
      ] },
      cola: { padre: 'cuerpo', pivote: [0, 0.75, -0.75], piezas: [
        bola(cola, [0, 0.85, -0.9], 0.55),
        bola(cola, [0, 1.45, -1.4], 0.66),
        bola(cola, [0, 2.25, -1.6], 0.74),
        bola(cola, [0, 3.0, -1.35], 0.68),
        bola(cola, [0, 3.45, -0.85], 0.55),
        bola(0xf0a065, [0, 3.55, -0.45], 0.4),
      ] },
      cabeza: { padre: 'cuerpo', pivote: [0, 1.7, 0], piezas: [
        bola(pelo, [0, 2.2, 0.05], [0.96, 0.88, 0.86]),
        bola(crema, [0, 1.93, 0.66], [0.58, 0.38, 0.36]),
        bola(0x3a1a12, [0, 2.1, 0.98], [0.16, 0.11, 0.1]),
        caja(0xffffff, [0, 1.73, 0.96], [0.26, 0.3, 0.1]),
        bola(0xffffff, [-0.38, 2.42, 0.7], [0.38, 0.41, 0.26]),
        bola(OL, [-0.3, 2.38, 0.94], 0.15),
        bola(0xffffff, [0.42, 2.48, 0.72], [0.28, 0.3, 0.2]),
        bola(OL, [0.47, 2.47, 0.9], 0.1),
        bola(0xff8fae, [-0.72, 2.0, 0.6], [0.2, 0.12, 0.08], [0, -0.7, 0]),
        bola(0xff8fae, [0.72, 2.0, 0.6], [0.2, 0.12, 0.08], [0, 0.7, 0]),
        cono(pelo, [-0.6, 2.95, -0.05], 0.3, 0.85, [0, 0, 0.35], 8),
        cono(pelo, [0.6, 2.95, -0.05], 0.3, 0.85, [0, 0, -0.35], 8),
        cono(0xff9bb0, [-0.58, 2.9, 0.1], 0.15, 0.5, [0, 0, 0.35], 6),
        cono(0xff9bb0, [0.58, 2.9, 0.1], 0.15, 0.5, [0, 0, -0.35], 6),
      ] },
      brazoI: { padre: 'cuerpo', pivote: [-0.7, 1.35, 0.2], piezas: [
        bola(pelo, [-0.85, 1.12, 0.35], [0.22, 0.4, 0.22], [0, 0, 0.4]),
        bola(pelo, [-0.92, 0.84, 0.48], 0.22),
      ] },
      brazoD: { padre: 'cuerpo', pivote: [0.7, 1.35, 0.2], piezas: [
        bola(pelo, [0.85, 1.12, 0.35], [0.22, 0.4, 0.22], [0, 0, -0.4]),
        bola(pelo, [0.92, 0.84, 0.48], 0.22),
        bola(0x9a6a33, [1.02, 0.86, 0.78], [0.3, 0.36, 0.3]),   // la bellota
        bola(0x5b3a1c, [1.02, 1.12, 0.78], [0.34, 0.16, 0.34]),
      ] },
      piernaI: { padre: null, pivote: [-0.4, 0.45, 0], piezas: [bola(0x7a3414, [-0.42, 0.2, 0.2], [0.36, 0.22, 0.5])] },
      piernaD: { padre: null, pivote: [0.4, 0.45, 0], piezas: [bola(0x7a3414, [0.42, 0.2, 0.2], [0.36, 0.22, 0.5])] },
    },
  };
}

function becario() {
  const gris = 0xaab4c4;
  return {
    nombre: 'Becario', escala: 0.82, radio: 1.15, alto: 3.1,
    huesos: {
      cuerpo: { padre: null, pivote: [0, 0.5, 0], piezas: [
        cajaRedonda(gris, [0, 1.55, 0], [2.1, 2.1, 1.6], 0.42),
        caja(0xd7dee9, [0, 2.4, 0.74], [1.5, 0.22, 0.12]),
        cajaRedonda(0x1b4fc4, [0, 1.72, 0.78], [1.6, 0.98, 0.16], 0.07),
        // ojos con sueño, ojeras y boca de «otra reunión»
        caja(0xe8f1ff, [-0.36, 1.86, 0.88], [0.36, 0.07, 0.05], [0, 0, -0.12]),
        caja(0xe8f1ff, [0.36, 1.86, 0.88], [0.36, 0.07, 0.05], [0, 0, 0.12]),
        caja(0x7d9bdf, [-0.36, 1.74, 0.87], [0.26, 0.04, 0.04]),
        caja(0x7d9bdf, [0.36, 1.74, 0.87], [0.26, 0.04, 0.04]),
        caja(0xe8f1ff, [0, 1.5, 0.88], [0.28, 0.06, 0.05]),
        // la acreditación colgada del cuello
        caja(0xff4b5c, [-0.34, 1.0, 0.82], [0.08, 0.72, 0.05], [0, 0, -0.75]),
        caja(0xff4b5c, [0.34, 1.0, 0.82], [0.08, 0.72, 0.05], [0, 0, 0.75]),
        caja(0xffffff, [0, 0.66, 0.84], [0.56, 0.46, 0.06]),
        caja(0x2e8bff, [0, 0.74, 0.86], [0.46, 0.12, 0.05]),
        bola(0x8fd3ff, [0.92, 2.28, 0.72], [0.13, 0.2, 0.1]),   // gota de sudor
      ] },
      cabeza: { padre: 'cuerpo', pivote: [0, 2.6, 0], piezas: [
        cilindro(0x3a4252, [0, 2.9, 0], 0.05, 0.05, 0.6, 0, 6),
        bola(0xff4b5c, [0, 3.25, 0], 0.19),
      ] },
      brazoI: { padre: 'cuerpo', pivote: [-1.1, 1.4, 0], piezas: [bola(gris, [-1.25, 1.12, 0.12], 0.3)] },
      brazoD: { padre: 'cuerpo', pivote: [1.1, 1.4, 0], piezas: [
        bola(gris, [1.25, 1.12, 0.12], 0.3),
        cilindro(0xffffff, [1.32, 1.42, 0.42], 0.3, 0.26, 0.55, 0, 12),   // la taza de café
        cilindro(0x6b3f22, [1.32, 1.69, 0.42], 0.25, 0.25, 0.04, 0, 12),
        aro(0xffffff, [1.62, 1.42, 0.42], 0.14, 0.05),
      ] },
      piernaI: { padre: null, pivote: [-0.45, 0.45, 0], piezas: [cajaRedonda(0x5b6578, [-0.45, 0.2, 0.1], [0.55, 0.35, 0.72], 0.14)] },
      piernaD: { padre: null, pivote: [0.45, 0.45, 0], piezas: [cajaRedonda(0x5b6578, [0.45, 0.2, 0.1], [0.55, 0.35, 0.72], 0.14)] },
    },
  };
}

function meercat() {
  const pelo = 0xd9b07a, PI = Math.PI;
  return {
    nombre: 'MeerCat', escala: 0.8, radio: 0.95, alto: 3.4,
    huesos: {
      cuerpo: { padre: null, pivote: [0, 0.6, 0], piezas: [
        bola(pelo, [0, 1.15, 0], [0.7, 1.05, 0.62]),
        bola(0xf3dcb2, [0, 1.1, 0.4], [0.45, 0.8, 0.32]),
        caja(0xff4b5c, [0, 1.3, 0.7], [0.14, 0.46, 0.06]), caja(0xff4b5c, [0, 1.3, 0.7], [0.42, 0.14, 0.06]),
        // alas de ángel
        bola(0xffffff, [-0.8, 1.95, -0.5], [0.78, 0.42, 0.12], [0, 0.5, 0.55]),
        bola(0xffffff, [0.8, 1.95, -0.5], [0.78, 0.42, 0.12], [0, -0.5, -0.55]),
        bola(0xc99d66, [0, 0.45, -0.65], [0.17, 0.17, 0.6], [0.6, 0, 0]),
      ] },
      cabeza: { padre: 'cuerpo', pivote: [0, 2.1, 0], piezas: [
        bola(pelo, [0, 2.65, 0.05], [0.72, 0.68, 0.66]),
        bola(0xecca95, [0, 2.45, 0.5], [0.42, 0.3, 0.3]),
        bola(0x2b1622, [0, 2.56, 0.79], [0.13, 0.09, 0.08]),
        bola(0x5b3a26, [-0.3, 2.74, 0.5], [0.22, 0.19, 0.1], [0, 0, -0.35]), bola(0x5b3a26, [0.3, 2.74, 0.5], [0.22, 0.19, 0.1], [0, 0, 0.35]),
        bola(0xffffff, [-0.3, 2.75, 0.58], 0.1), bola(0xffffff, [0.3, 2.75, 0.58], 0.1),
        bola(OL, [-0.29, 2.75, 0.66], 0.05), bola(OL, [0.31, 2.75, 0.66], 0.05),
        bola(0x5b3a26, [-0.62, 2.88, 0], [0.16, 0.2, 0.1]), bola(0x5b3a26, [0.62, 2.88, 0], [0.16, 0.2, 0.1]),
        // cofia de enfermera y aureola
        cajaRedonda(0xffffff, [0, 3.3, 0.05], [0.85, 0.36, 0.62], 0.12),
        caja(0xff4b5c, [0, 3.32, 0.37], [0.08, 0.24, 0.04]), caja(0xff4b5c, [0, 3.32, 0.37], [0.24, 0.08, 0.04]),
        aro(0xffcb3d, [0, 3.78, 0], 0.48, 0.06, [PI / 2, 0, 0]),
      ] },
      brazoI: { padre: 'cuerpo', pivote: [-0.55, 1.75, 0.1], piezas: [bola(pelo, [-0.72, 1.38, 0.2], [0.17, 0.38, 0.17], [0, 0, 0.3])] },
      brazoD: { padre: 'cuerpo', pivote: [0.55, 1.75, 0.1], piezas: [
        bola(pelo, [0.72, 1.38, 0.2], [0.17, 0.38, 0.17], [0, 0, -0.3]),
        cilindro(0xffcb3d, [0.86, 1.95, 0.35], 0.06, 0.06, 2.5, [0.08, 0, -0.06], 6),   // el bastón que cura
        bola(0x7be04a, [0.93, 3.25, 0.45], 0.27),
        caja(0xffffff, [0.93, 3.25, 0.71], [0.06, 0.24, 0.04]), caja(0xffffff, [0.93, 3.25, 0.71], [0.24, 0.06, 0.04]),
      ] },
      piernaI: { padre: null, pivote: [-0.3, 0.4, 0], piezas: [bola(0xc99d66, [-0.3, 0.17, 0.15], [0.25, 0.17, 0.36])] },
      piernaD: { padre: null, pivote: [0.3, 0.4, 0], piezas: [bola(0xc99d66, [0.3, 0.17, 0.15], [0.25, 0.17, 0.36])] },
    },
  };
}

// la cabeza de la vaca: la misma dentro del mecha y suelta
function cabezaVaca(y, z) {
  const PI = Math.PI;
  return [
    bola(0xffffff, [0, y, z], [0.66, 0.6, 0.58]),
    bola(0xffb3cf, [0, y - 0.22, z + 0.48], [0.4, 0.25, 0.22]),
    bola(OL, [-0.13, y - 0.2, z + 0.68], 0.05), bola(OL, [0.13, y - 0.2, z + 0.68], 0.05),
    bola(OL, [-0.24, y + 0.1, z + 0.5], 0.08), bola(OL, [0.24, y + 0.1, z + 0.5], 0.08),
    bola(0x2b2d3a, [-0.32, y + 0.24, z + 0.36], [0.18, 0.14, 0.08], [0, -0.4, 0]),
    cono(0xf3e6cc, [-0.4, y + 0.55, z - 0.05], 0.09, 0.34, [0, 0, 0.5], 6), cono(0xf3e6cc, [0.4, y + 0.55, z - 0.05], 0.09, 0.34, [0, 0, -0.5], 6),
    bola(0xffffff, [-0.66, y + 0.08, z - 0.05], [0.26, 0.11, 0.14], [0, 0, 0.3]), bola(0xffffff, [0.66, y + 0.08, z - 0.05], [0.26, 0.11, 0.14], [0, 0, -0.3]),
    aro(0xff4fa3, [0, y + 0.05, z - 0.05], 0.68, 0.06),   // los cascos de gamer
    bola(0xff4fa3, [-0.68, y, z - 0.05], [0.1, 0.22, 0.22]), bola(0xff4fa3, [0.68, y, z - 0.05], [0.1, 0.22, 0.22]),
  ];
}

function mechavaca() {
  const rosa = 0xff8fc8, oscuro = 0xb84f86, puno = 0x3b3d47, PI = Math.PI;
  return {
    nombre: 'MechaVaca', escala: 0.82, radio: 1.7, alto: 5.2,
    huesos: {
      cuerpo: { padre: null, pivote: [0, 1.3, 0], piezas: [
        cajaRedonda(rosa, [0, 2.4, 0], [2.8, 2.5, 2.2], 0.7),
        caja(0xffffff, [0, 1.6, 1.07], [2.1, 0.32, 0.12]),
        bola(0x2b2d3a, [-0.7, 2.2, 1.06], [0.3, 0.22, 0.06], [0, 0, 0.3]), bola(0x2b2d3a, [0.6, 2.7, 1.06], [0.22, 0.17, 0.06]),
        cono(rosa, [-1.0, 3.85, 0], 0.3, 0.8, [0, 0, 0.4], 8), cono(rosa, [1.0, 3.85, 0], 0.3, 0.8, [0, 0, -0.4], 8),
        cajaRedonda(oscuro, [-1.6, 3.0, 0], [0.7, 0.9, 1.1], 0.25), cajaRedonda(oscuro, [1.6, 3.0, 0], [0.7, 0.9, 1.1], 0.25),
        aro(0x9fe3ff, [0, 3.62, 0.2], 0.78, 0.13, [PI / 2, 0, 0]),   // la cabina
      ] },
      cabeza: { padre: 'cuerpo', pivote: [0, 3.6, 0], piezas: cabezaVaca(3.95, 0.2) },
      brazoI: { padre: 'cuerpo', pivote: [-1.6, 2.7, 0], piezas: [cajaRedonda(rosa, [-1.95, 2.0, 0.15], [0.8, 1.5, 0.9], 0.3), cajaRedonda(puno, [-2.0, 1.05, 0.25], [0.9, 0.62, 0.95], 0.2)] },
      brazoD: { padre: 'cuerpo', pivote: [1.6, 2.7, 0], piezas: [cajaRedonda(rosa, [1.95, 2.0, 0.15], [0.8, 1.5, 0.9], 0.3), cajaRedonda(puno, [2.0, 1.05, 0.25], [0.9, 0.62, 0.95], 0.2)] },
      piernaI: { padre: null, pivote: [-0.75, 1.1, 0], piezas: [cajaRedonda(oscuro, [-0.75, 0.75, 0], [0.8, 1.1, 0.9], 0.25), cajaRedonda(puno, [-0.75, 0.2, 0.15], [0.95, 0.4, 1.2], 0.15)] },
      piernaD: { padre: null, pivote: [0.75, 1.1, 0], piezas: [cajaRedonda(oscuro, [0.75, 0.75, 0], [0.8, 1.1, 0.9], 0.25), cajaRedonda(puno, [0.75, 0.2, 0.15], [0.95, 0.4, 1.2], 0.15)] },
    },
  };
}

function vaca() {
  const PI = Math.PI;
  return {
    nombre: 'Vaca', escala: 0.7, radio: 1.0, alto: 2.8,
    huesos: {
      cuerpo: { padre: null, pivote: [0, 0.6, 0], piezas: [
        bola(0xffffff, [0, 1.0, 0], [0.85, 0.85, 0.8]),
        bola(0x2b2d3a, [-0.42, 1.15, 0.62], [0.25, 0.2, 0.1], [0, -0.5, 0]), bola(0x2b2d3a, [0.45, 0.7, 0.6], [0.2, 0.16, 0.1], [0, 0.5, 0]),
        bola(0x2b2d3a, [0.2, 1.4, -0.65], [0.3, 0.22, 0.1]),
        aro(0xff4fa3, [0, 1.62, 0], 0.5, 0.08, [PI / 2, 0, 0]),
      ] },
      cabeza: { padre: 'cuerpo', pivote: [0, 1.7, 0], piezas: cabezaVaca(2.2, 0.1) },
      brazoI: { padre: 'cuerpo', pivote: [-0.75, 1.3, 0.1], piezas: [bola(0xffffff, [-0.85, 1.0, 0.3], [0.2, 0.35, 0.2], [0, 0, 0.4]), bola(0x2b2d3a, [-0.92, 0.72, 0.42], 0.15)] },
      brazoD: { padre: 'cuerpo', pivote: [0.75, 1.3, 0.1], piezas: [bola(0xffffff, [0.85, 1.0, 0.3], [0.2, 0.35, 0.2], [0, 0, -0.4]), bola(0x2b2d3a, [0.92, 0.72, 0.42], 0.15)] },
      piernaI: { padre: null, pivote: [-0.35, 0.4, 0], piezas: [bola(0x2b2d3a, [-0.35, 0.17, 0.15], [0.25, 0.18, 0.32])] },
      piernaD: { padre: null, pivote: [0.35, 0.4, 0], piezas: [bola(0x2b2d3a, [0.35, 0.17, 0.15], [0.25, 0.18, 0.32])] },
    },
  };
}

// el jefe de Microblizz: un robot de oficina con corbata que «sobrevive a todo»
function survivalbot() {
  const traje = 0x3e4659, metal = 0xaab4c4;
  return {
    nombre: 'SurvivalBot', escala: 1.15, radio: 2.2, alto: 7.4,
    huesos: {
      cuerpo: { padre: null, pivote: [0, 1.4, 0], piezas: [
        cajaRedonda(traje, [0, 2.6, 0], [2.7, 2.5, 1.8], 0.5),
        caja(0xffffff, [0, 3.0, 0.88], [0.9, 1.1, 0.1]),
        caja(0xff4b5c, [0, 2.7, 0.95], [0.26, 1.0, 0.06]), caja(0xc22a3a, [0, 3.35, 0.96], [0.32, 0.22, 0.06]),
        caja(0x2b3245, [-0.6, 3.0, 0.9], [0.32, 1.2, 0.08], [0, 0, 0.35]), caja(0x2b3245, [0.6, 3.0, 0.9], [0.32, 1.2, 0.08], [0, 0, -0.35]),
        caja(0xffcb3d, [0.85, 2.3, 0.92], [0.45, 0.3, 0.06]),   // la chapa de «empleado del mes»
        cilindro(metal, [0, 3.95, 0], 0.4, 0.5, 0.4, 0, 10),
      ] },
      cabeza: { padre: 'cuerpo', pivote: [0, 4.1, 0], piezas: [
        cajaRedonda(metal, [0, 4.85, 0], [2.0, 1.5, 1.6], 0.45),
        cajaRedonda(0x20102c, [0, 4.9, 0.78], [1.6, 0.6, 0.16], 0.1),
        caja(0xff4b5c, [0, 4.9, 0.87], [1.25, 0.15, 0.05]),
        cilindro(0x3a4252, [0.6, 5.9, 0], 0.05, 0.05, 0.7, 0, 6), bola(0xffcb3d, [0.6, 6.3, 0], 0.18),
        cilindro(0x3a4252, [-0.6, 5.9, 0], 0.05, 0.05, 0.7, 0, 6), bola(0x7df3ff, [-0.6, 6.3, 0], 0.18),
      ] },
      brazoI: { padre: 'cuerpo', pivote: [-1.5, 3.4, 0], piezas: [cajaRedonda(traje, [-1.8, 2.6, 0.1], [0.8, 1.7, 0.9], 0.3), cajaRedonda(metal, [-1.85, 1.45, 0.25], [1.0, 0.75, 1.0], 0.25)] },
      brazoD: { padre: 'cuerpo', pivote: [1.5, 3.4, 0], piezas: [cajaRedonda(traje, [1.8, 2.6, 0.1], [0.8, 1.7, 0.9], 0.3), cajaRedonda(metal, [1.85, 1.45, 0.25], [1.0, 0.75, 1.0], 0.25), cajaRedonda(0x5b3a26, [2.3, 1.2, 0.6], [0.3, 0.9, 1.2], 0.1)] },
      piernaI: { padre: null, pivote: [-0.65, 1.4, 0], piezas: [cajaRedonda(traje, [-0.65, 0.9, 0], [0.8, 1.3, 0.9], 0.25), cajaRedonda(0x20102c, [-0.65, 0.2, 0.15], [0.95, 0.4, 1.3], 0.15)] },
      piernaD: { padre: null, pivote: [0.65, 1.4, 0], piezas: [cajaRedonda(traje, [0.65, 0.9, 0], [0.8, 1.3, 0.9], 0.25), cajaRedonda(0x20102c, [0.65, 0.2, 0.15], [0.95, 0.4, 1.3], 0.15)] },
    },
  };
}

export const MODELOS = { bunny: bunny(), squirrel: squirrel(), becario: becario(), meercat: meercat(), mechavaca: mechavaca(), vaca: vaca(), survivalbot: survivalbot() };
