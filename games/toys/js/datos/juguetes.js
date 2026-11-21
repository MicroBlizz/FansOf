// Fans of Toys · datos · JUGUETES: lo que Microblizz fabrica de sus franquicias. De cada uno: lo que cuesta hacer una unidad, su precio
// normal, lo que cuesta el molde (se paga solo la primera vez) y cuántas unidades se venden en un mes normal a precio normal.
// `desde` es el nivel de la cuenta en que aparece; `azar` (opcional) multiplica el baile de la demanda. Nombres en español: su inglés,
// en idioma/en.js. Cifras de partida (tarea #259).
'use strict';
TY.JUGUETES = TY.congela([
  { id: 'bunny', nombre: 'Peluche de CrazyBunny', franquicia: 'animales', coste: 4, precio: 12, molde: 80, demanda: 40, desde: 0 },
  { id: 'becario', nombre: 'Becario articulado', franquicia: 'oficina', coste: 3, precio: 8, molde: 50, demanda: 55, desde: 0 },
  { id: 'zombi', nombre: 'No-muerto de goma', franquicia: 'nomuertos', coste: 2, precio: 6, molde: 40, demanda: 70, desde: 0 },
  { id: 'slime', nombre: 'Slime de Pop en bote', franquicia: 'pop', coste: 3, precio: 10, molde: 60, demanda: 50, desde: 0 },
  { id: 'lola', nombre: 'Lola de Recursos Humanos', franquicia: 'oficina', coste: 6, precio: 18, molde: 120, demanda: 34, desde: 0 },
  { id: 'streamer', nombre: 'Streamer con aro de luz', franquicia: 'streamers', coste: 8, precio: 22, molde: 160, demanda: 30, desde: 0 },
  { id: 'caja', nombre: 'Caja sorpresa Animales Locos', franquicia: 'animales', coste: 5, precio: 15, molde: 150, demanda: 45, azar: 2, desde: 0 },
  { id: 'survivalbot', nombre: 'SurvivalBot de cuerda', franquicia: 'ciber', coste: 9, precio: 26, molde: 200, demanda: 28, desde: 1 },
  { id: 'trituradora', nombre: 'Trituradora de juguete', franquicia: 'oficina', coste: 11, precio: 32, molde: 240, demanda: 24, desde: 2 },
  { id: 'ceo', nombre: 'Figura del CEO con maletín', franquicia: 'oficina', coste: 14, precio: 45, molde: 320, demanda: 18, desde: 3 },
]);
// las franquicias que pueden ponerse de moda un trimestre
TY.FRANQUICIAS = TY.congela({ animales: 'Animales Locos', oficina: 'La Torre Microblizz', nomuertos: 'No-muertos', pop: 'Cultura Pop', streamers: 'Streamers', ciber: 'Ciberpunks' });
