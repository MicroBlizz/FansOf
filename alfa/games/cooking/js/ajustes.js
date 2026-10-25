// Fans of Cooking · AJUSTES: el nombre del juego para core y TODAS las cifras del juego (rejilla, cocineros, tiempos de cortar, cocinar y quemar,
// pedidos, puntos, estrellas y teclas). Se carga antes de lo común. Cambiar el equilibrio del juego es tocar solo este archivo.
'use strict';
const AJUSTES = {
  id: 'cooking',                // para core: la partida en la nube lleva este nombre
  guardado: 'for-cooking-v1',   // la clave de la partida en este navegador (estrellas, cocineros elegidos, sonido)
};
const COOK = {
  paso: 1 / 60,                 // segundos de cada paso de la simulación (fijo: misma entrada, misma partida)
  tile: 64,                     // píxeles de cada casilla
  hud: 104,                     // alto de la franja de pedidos, arriba
  cocinero: {
    velocidad: 215,             // píxeles por segundo
    radio: 20,                  // el cuerpo, para no meterse en las mesas
    alcance: 0.78,              // a cuántas casillas por delante llega la mano (casilla que tiene enfrente)
    lanzar: 4,                  // casillas que vuela lo que se lanza
  },
  // tiempos en segundos: cortar (manteniendo USAR), cocinar en sartén, horno y olla, cuánto más tarda en quemarse, lavar un plato, apagar un fuego
  tiempos: { cortar: 1.6, sarten: 5, horno: 7, olla: 6, quemar: 5, lavar: 1.4, apagar: 1.6, platoVuelve: 7 },
  // los pedidos: cuántos se ven como mucho, cada cuánto llega uno, cuánto dura, los puntos y el combo
  pedidos: { max: 4, primero: 1, cadencia: 11, dura: 48, base: 20, propinaMax: 12, caduca: -10, comboMax: 4 },
  tirar: -3,                    // puntos por tirar un plato con comida (castigo pequeño: no te quedes bloqueado)
  fuego: { aviso: 2.5, propaga: 9 },   // segundos de humo antes del fuego, y cada cuánto salta a la casilla de al lado si nadie lo apaga
  // las teclas: dos personas en el mismo teclado, sin ratón. En solitario se llevan los dos cocineros y se cambia con la tecla de cambiar.
  teclas: {
    j1: { arriba: ['KeyW'], abajo: ['KeyS'], izquierda: ['KeyA'], derecha: ['KeyD'], coger: ['Space', 'KeyE'], usar: ['KeyQ', 'ShiftLeft'], cambiar: ['Tab', 'KeyC'] },
    j2: { arriba: ['ArrowUp'], abajo: ['ArrowDown'], izquierda: ['ArrowLeft'], derecha: ['ArrowRight'], coger: ['Enter', 'NumpadEnter', 'KeyM'], usar: ['ShiftRight', 'ControlRight', 'KeyN'], cambiar: [] },
    pausa: ['Escape', 'KeyP'],
  },
  // los cocineros que se pueden llevar (pieles de la serie, nada cambia): clave del dibujo de core y estrellas que hacen falta para abrirlo
  cocineros: [
    { key: 'bunny', nombre: 'CrazyBunny', estrellas: 0 }, { key: 'skeleton', nombre: 'SkeletonCrew', estrellas: 0 },
    { key: 'squirrel', nombre: 'MadSquirrel', estrellas: 3 }, { key: 'meercat', nombre: 'MeerCat', estrellas: 6 },
    { key: 'ghostmage', nombre: 'GhostMage', estrellas: 9 }, { key: 'cybermarine', nombre: 'CyberMarine', estrellas: 12 },
    { key: 'techdroid', nombre: 'TechDroid', estrellas: 15 }, { key: 'progamer', nombre: 'ProGamer', estrellas: 18 },
    { key: 'snackmom', nombre: 'SnackMom', estrellas: 22 }, { key: 'memelord', nombre: 'MemeLord', estrellas: 26 },
    { key: 'chonkcat', nombre: 'ChonkCat', estrellas: 30 }, { key: 'mechavaca', nombre: 'MechaVaca', estrellas: 36 },
    { key: 'twitchking', nombre: 'StreamKing', estrellas: 42 }, { key: 'necrolord', nombre: 'NecroLord', estrellas: 48 },
  ],
  colores: { j1: '#ff7a1a', j2: '#33b5ff' },
};
