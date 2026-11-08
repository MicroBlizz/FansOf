// Fans of Survivors · Datos de las mecánicas nuevas (inspiradas en el fan game PokéSurvivor, 7-11-2026): evolución de armas,
// oleadas de choque, jefes que escalan, curanderos, altares, fuentes, cofres con candado y cambio de cartas.
// Van tras el flag 'survivors-mecanicas' (js/mecanicas.js). Si Daniel quiere cambiar el equilibrio, las cifras están aquí.
'use strict';

const MECANICAS = Object.freeze({
  // Evolución: un arma a nivel 5 + su mejora pareja (aunque sea a nivel 1) = carta dorada. Lo que gana el arma evolucionada:
  evolucion: Object.freeze({ dano: 1.8, n: 1, r: 1.2, cd: 0.85, pesoCarta: 40 }),
  // Oleadas de choque: un grupo grande que entra en fila por un lado de la pantalla
  choque: Object.freeze({ primera: 20, cadaMin: 40, cadaMax: 55, grupo: 14, porMinuto: 2, aviso: 1.6 }),
  // Jefes (los mini jefes cada 2 minutos): su vida y su daño suben con el tiempo; mientras hay uno vivo salen menos enemigos
  jefes: Object.freeze({ escalaCada: 600, ritmoConJefe: 0.25, embestidaCada: 5, embestidaAviso: 0.9, embestidaVel: 620, embestidaDura: 0.55, embestidaAncho: 46 }),
  // Curanderos (SoporteBot): como mucho tantos vivos; no se curan entre ellos y tus armas los buscan antes
  curanderos: Object.freeze({ maxVivos: 3, prioridad: 0.35, pesoVidaBaja: 0.4 }),
  // Sitios del mapa: aparecen cerca, duran un rato y se marcan con una flecha en el borde
  sitios: Object.freeze({
    primero: 30, cada: 35, maxVivos: 3, dura: 60, distMin: 260, distMax: 420, radio: 42,
    pesos: Object.freeze({ altar: 4, fuente: 3, candado: 3 }),
    altar: Object.freeze({ dura: 25, poderes: Object.freeze({ dano: 2, vel: 1.4, iman: 3, recarga: 0.6 }) }),
    fuente: Object.freeze({ curaPorSeg: 0.14, capacidad: 1 }),    // fracciones de tu vida máxima
    candado: Object.freeze({ abrir: 3.5, olvida: 0.5 }),           // segundos quieto al lado; lo que se pierde por segundo si te vas
  }),
  // Un principio con más ritmo (Daniel, 7-11-2026: «salen pocos enemigos al principio, me aburro»): las oleadas de los minutos 1 y 2
  // (sustituyen a las dos primeras de OLEADAS en datos.js) y el primer cerco, antes
  inicio: Object.freeze({
    oleadas: Object.freeze([
      // variados y rápidos desde el principio (Daniel, 7-11-2026): Descarga99 que corren y StarBot que disparan
      Object.freeze({ cada: 1, grupo: 3, mezcla: Object.freeze({ becario: 5, descargabot: 4, starbot: 2 }) }),
      Object.freeze({ cada: 1, grupo: 4, mezcla: Object.freeze({ becario: 4, descargabot: 4, starbot: 2, cajabotin: 1 }) }),
    ]),
    primerCerco: 45,
  }),
  // Dificultad (Daniel, 7-11-2026: «en el minuto 5 ya lo tenía todo y los enemigos ni llegan a mí»):
  // · xp: lo que cuesta cada nivel = base + paso × (n − 1) + extra × (niveles por encima de desde); unas 2,5 veces lo de antes
  // · vida: los enemigos tienen vida × (1 + lineal × min + cuadrado × min²): ×2,5 en el minuto 5 y ×5 en el 10 (antes ×1,65 y ×2,6)
  // · vel: +3 % de velocidad por minuto · grupo: cada grupo de las oleadas trae un 15 % más por minuto
  // · jefes: los mini jefes van más rápido, corren si te alejas y embisten más a menudo
  dificultad: Object.freeze({
    xp: Object.freeze({ base: 10, paso: 14, extra: 10, desde: 12 }),
    vida: Object.freeze({ lineal: 0.2, cuadrado: 0.02 }),
    velPorMinuto: 0.03, grupoPorMinuto: 0.15,
    jefes: Object.freeze({ vel: 1.4, corre: 2.2, distCorre: 300, embestidaCada: 3.5 }),
  }),
  // Cambio de cartas: cuántas veces por partida puedes volver a sacar las 3 cartas de subir de nivel
  cambiosCartas: 1,
});

// La mejora pareja de cada arma. Las de Animales Locos van una a una; las de las demás facciones, según su tipo de disparo.
const EVO_PAREJA = Object.freeze({
  zanahoria: 'punos', chaos: 'cafeina', ardillas: 'reflejos', castor: 'diploma',
  zorro: 'hitbox', suricata: 'vampirismo', mapache: 'iman', vacas: 'piel',
});
const EVO_PAREJA_TIPO = Object.freeze({
  bala: 'punos', boomerang: 'punos', tajo: 'punos', combo: 'punos',
  nova: 'reflejos', rayo: 'reflejos', torreta: 'reflejos',
  bomba: 'diploma', eclosion: 'diploma', golpe: 'diploma',
  onda: 'cafeina', corre: 'cafeina', charco: 'hitbox',
  aura: 'iman', haz: 'iman', orbita: 'piel', escudo: 'piel', ruleta: 'vampirismo',
});
