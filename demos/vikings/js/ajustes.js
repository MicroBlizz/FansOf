// Fans of Vikings · AJUSTES: el nombre de la demo para core, la clave de su partida y TODA la calibración del juego:
// los edificios y sus recetas (tiempos, costes, lo que dan), los 4 fans y sus habilidades, los enemigos de Microblizz,
// los asaltos del autobús, la experiencia de la aldea y las misiones de la guía. Se carga antes de lo común.
'use strict';
const AJUSTES = {
  id: 'vikings',                 // para core: la partida en la nube lleva este nombre
  guardado: 'fansof-vikings',    // la clave de la partida en este navegador
};

// La aldea: tamaño lógico del lienzo (pixel art de verdad: se pinta a esta resolución y se amplía sin suavizar)
const VK_ANCHO = 216;

// Experiencia para pasar cada nivel de aldea (la curva de los primeros niveles de Pixel Tribe; después crece sola)
const VK_XP_ALDEA = [9, 10, 40, 50, 75, 175, 250, 320, 400, 550];
const vkXpNivel = n => VK_XP_ALDEA[n - 1] || Math.round(550 + (n - 10) * 150);

// Lo que se guarda en el almacén. vende = oro que da en el almacén; cura = vida que devuelve al comerlo.
const VK_COSAS = {
  zanahoria: { nombre: 'Zanahoria', icono: 'zanahoria', vende: 2 },
  pan:       { nombre: 'Pan', icono: 'pan', vende: 7, cura: 30 },
  espada:    { nombre: 'Espada de hierro', icono: 'espada', vende: 15, equipo: 'arma', atq: 4 },
  escudo:    { nombre: 'Escudo zanahoria', icono: 'escudo', vende: 15, equipo: 'escudo', def: 3, vida: 15 },
};
const VK_TOPE_ALMACEN = 40;   // de cada cosa

// Los edificios: dónde están (casilla de 16 px en el mapa), el dibujo, desde qué nivel de aldea se abren y sus recetas.
// receta: coste { cosa: n, oro: n }, seg = lo que tarda, da = qué sale, xp = experiencia de aldea al acabar.
const VK_EDIFICIOS = {
  casa:     { nombre: 'Casa de los fans', dibujo: 'casa', col: 1, fila: 1, nivel: 1, ayuda: 'Aquí descansan tus fans. Dales pan para curarlos y ponles el equipo.' },
  huerto:   { nombre: 'Huerto', dibujo: 'huerto', col: 8, fila: 1, nivel: 1, trabaja: 'madsquirrel', cola: 3,
    recetas: [{ da: 'zanahoria', n: 2, seg: 20, xp: 1, coste: {} }] },
  cocina:   { nombre: 'Cocina', dibujo: 'cocina', col: 1, fila: 7, nivel: 1, trabaja: 'slyfox', cola: 3,
    recetas: [{ da: 'pan', n: 1, seg: 40, xp: 2, coste: { zanahoria: 3 } }] },
  herreria: { nombre: 'Herrería', dibujo: 'herreria', col: 8, fila: 7, nivel: 2, trabaja: 'crazybunny', cola: 3,
    recetas: [{ da: 'espada', n: 1, seg: 90, xp: 4, coste: { oro: 25, zanahoria: 2 } },
              { da: 'escudo', n: 1, seg: 90, xp: 4, coste: { oro: 25, zanahoria: 2 } }] },
  almacen:  { nombre: 'Almacén', dibujo: 'almacen', col: 4, fila: 12, nivel: 1, trabaja: 'meercat', ayuda: 'Lo que sobra se vende por oro.' },
  autobus:  { nombre: 'Autobús de fans', dibujo: 'autobus', col: 7, fila: 17, nivel: 1, ayuda: 'Sube a tus fans y ve de asalto contra Microblizz.' },
};

// Los 4 fans (Animales Locos). Vida, ataque y defensa al nivel 1; suben un 8 % de vida y +1 de ataque y defensa por nivel.
// hab = su habilidad especial (rec = turnos de recarga). El primero de la lista es el ataque normal.
const VK_FANS = {
  slyfox:      { nombre: 'SlyFox', clase: 'Defensor', vida: 130, atq: 8, def: 8,
    habs: [{ id: 'golpe', nombre: 'Tajo', mult: 1, obj: 'uno' }, { id: 'provocar', nombre: 'Provocar', obj: 'yo', turnos: 2, rec: 3 }] },
  crazybunny:  { nombre: 'CrazyBunny', clase: 'Luchador', vida: 105, atq: 12, def: 4,
    habs: [{ id: 'golpe', nombre: 'Porrazo', mult: 1, obj: 'uno' }, { id: 'barrido', nombre: 'Caos', mult: 0.7, obj: 'todos', rec: 2 }] },
  madsquirrel: { nombre: 'MadSquirrel', clase: 'Arquera', vida: 85, atq: 11, def: 2,
    habs: [{ id: 'golpe', nombre: 'Flecha', mult: 1, obj: 'uno' }, { id: 'doble', nombre: 'Doble flecha', mult: 0.85, obj: 'azar2', rec: 2 }] },
  meercat:     { nombre: 'MeerCat', clase: 'Mago', vida: 80, atq: 10, def: 2, magia: true,
    habs: [{ id: 'golpe', nombre: 'Rayo', mult: 1, obj: 'uno' }, { id: 'curar', nombre: 'Curación', cura: 22, obj: 'equipo', rec: 3 }] },
};
const VK_ORDEN_FANS = ['slyfox', 'crazybunny', 'madsquirrel', 'meercat'];
const vkXpFan = n => 15 + n * 10;   // experiencia para pasar del nivel n al siguiente

// Los enemigos: la plantilla de Microblizz. cada = cada cuántos turnos usa su ataque especial (a todo tu equipo).
const VK_ENEMIGOS = {
  becario:   { nombre: 'Becario', dibujo: 'becario', vida: 45, atq: 11, def: 0 },
  abogado:   { nombre: 'Abogado', dibujo: 'abogado', vida: 80, atq: 15, def: 6, especial: 'Demanda', mult: 0.55, cada: 3 },
  ejecutivo: { nombre: 'El Ejecutivo', dibujo: 'ejecutivo', vida: 620, atq: 28, def: 5, especial: 'Despido masivo', mult: 0.8, cada: 3, jefe: true },
};

// Los asaltos del autobús: 7 por planta de la sede, el 7.º con jefe. Cada asalto son sus oleadas, en orden.
// Al acabar la planta 1 se sube a la siguiente: los mismos asaltos con los enemigos un 45 % más fuertes por planta.
const VK_ASALTOS = [
  { nombre: 'La fotocopiadora', oleadas: [['becario']] },
  { nombre: 'Sala de becarios', oleadas: [['becario', 'becario']] },
  { nombre: 'El office', oleadas: [['becario', 'becario', 'becario']] },
  { nombre: 'Departamento legal', oleadas: [['becario', 'becario'], ['abogado']] },
  { nombre: 'Archivo de patentes', oleadas: [['becario', 'abogado'], ['becario', 'becario', 'abogado']] },
  { nombre: 'Sala de juntas', oleadas: [['abogado', 'abogado'], ['becario', 'becario', 'becario']] },
  { nombre: 'Despacho del Ejecutivo', oleadas: [['becario', 'becario'], ['abogado', 'abogado'], ['abogado', 'ejecutivo', 'abogado']], jefe: true },
];
const VK_FUERZA_PLANTA = 0.45;
// al perder, cada fan se lleva un tercio de la experiencia (para que intentarlo nunca sea perder el tiempo)
const vkPremio = (i, planta) => ({ oro: Math.round((8 + i * 6) * (1 + planta * 0.5)), xp: 6 + i * 3, xpAldea: 2 + i });

// La guía: misiones en orden (la siguiente sale arriba). hecho(S) dice si ya está; premio en oro.
const VK_MISIONES = [
  { texto: 'Toca el huerto y planta zanahorias', hecho: S => S.hechos.zanahoria >= 2, oro: 5 },
  { texto: 'Hornea un pan en la cocina', hecho: S => S.hechos.pan >= 1, oro: 10 },
  { texto: 'Sube al autobús y gana tu primer asalto', hecho: S => S.asalto > 0 || S.planta > 0, oro: 15 },
  { texto: 'Cura a un fan con pan en la casa', hecho: S => S.hechos.comer >= 1, oro: 10 },
  { texto: 'Llega al nivel 2 de aldea y forja en la herrería', hecho: S => (S.hechos.espada || 0) + (S.hechos.escudo || 0) >= 1, oro: 20 },
  { texto: 'Equipa a un fan desde la casa', hecho: S => S.hechos.equipar >= 1, oro: 15 },
  { texto: 'Derrota al Ejecutivo en su despacho', hecho: S => S.planta > 0, oro: 60 },
];
