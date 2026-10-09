// Fans of Survivors · Armas de las facciones (2/2): Memes, Comunidad Gamer, Olvidados y Cultura Pop (ver datos-facciones.js).
'use strict';

// memes
armaFaccion('memes', 'memelord_a', 'memelord', 'ruleta', 'Carta viral', 'Cada carta juega un efecto al azar: cura, aturde, bola de fuego o perros.', '🃏', '#ff9ad9', {}, ['dano', 'cd', 'n', 'dano']);
armaFaccion('memes', 'memelord_b', 'memelord', 'nova', 'Lluvia de memes', 'Una lluvia de risas sale en todas direcciones.', '🤣', '#ffe14d', {n: 7, dano: 12, cd: 3.2}, ['n2', 'dano', 'cd', 'vel']);
armaFaccion('memes', 'suchdog', 'suchdog', 'corre', 'Perros wow', 'Perros muy wow que corren hacia los enemigos y muerden.', null, '#ffcb3d', {spr: 'suchdog', dano: 24, n: 2, r: 45, vel: 360, cd: 2.6}, ['n', 'dano', 'cd', 'vel']);
armaFaccion('memes', 'gifblaster', 'gifblaster', 'bala', 'GIF en bucle', 'Una ráfaga de GIFs sin parar. Poco daño, pero muchísimos.', '🌀', '#4f9dff', {dano: 5, cd: 0.3, vel: 480}, ['dano', 'cd', 'n', 'pierce']);
armaFaccion('memes', 'synthcat', 'synthcat', 'bomba', 'Notas musicales', 'Notas que caen y explotan en área. Nadie sabe por qué.', '🎵', '#c06bff', {dano: 28, r: 60}, ['n', 'dano', 'r', 'cd']);
armaFaccion('memes', 'trollbot', 'trollbot', 'aura', 'Cara de troll', 'Un aura que frena a los enemigos cercanos y los enfada.', null, '#ff9ad9', {dano: 7, r: 85, lento: 0.8}, ['r', 'lento', 'dano', 'tick']);
armaFaccion('memes', 'stonks', 'stonks', 'golpe', 'Gráfica al alza', 'Una gráfica que sube de golpe sobre el enemigo más fuerte.', '📈', '#5fe05a', {dano: 34, cd: 2.2}, ['dano', 'n', 'cd', 'alc']);
armaFaccion('memes', 'chonkcat', 'chonkcat', 'onda', 'Gato aplastante', 'Un gato enorme se sienta encima de los enemigos cercanos y los aturde.', '🐈', '#ffb36b', {dano: 42, r: 90, aturde: 1, cd: 6}, ['dano', 'r', 'aturde', 'cd']);
ARMA_INICIAL.memes = 'memelord_a';

// gamer
armaFaccion('gamer', 'progamer_a', 'progamer', 'combo', 'Combo de teclado', 'Golpes rapidísimos al enemigo más cercano; cada 4.º es un ¡COMBO! de daño triple en área.', '⌨️', '#7dff5e', {}, ['r', 'dano', 'cd', 'combo']);
armaFaccion('gamer', 'progamer_b', 'progamer', 'golpe', '¡COMBO!', 'Golpea a dos enemigos a la vez con un combo de daño enorme.', '💥', '#ff4b5c', {dano: 45, n: 2, cd: 4.5}, ['dano', 'n', 'cd', 'alc']);
armaFaccion('gamer', 'noobs', 'noobs', 'orbita', 'Gorros de hélice', 'Gorros con hélice que giran a tu alrededor.', '🧢', '#4f9dff', {n: 3, dano: 10, r: 75}, ['n', 'dano', 'r', 'tick']);
armaFaccion('gamer', 'speedrunner', 'speedrunner', 'corre', 'Atajos', 'Una corredora velocísima atraviesa a los enemigos y los deja atrás.', null, '#7dff5e', {spr: 'speedrunner', dano: 30, r: 50, vel: 430, cd: 2.2}, ['n', 'dano', 'cd', 'vel']);
armaFaccion('gamer', 'modder', 'modder', 'aura', 'Parches del Modder', 'Un aura de parches: te cura poco a poco y arregla a los enemigos a golpes.', null, '#7dff7a', {dano: 4, r: 72, cura: 1.0}, ['cura', 'r', 'dano', 'cura']);
armaFaccion('gamer', 'coleccionista', 'coleccionista', 'bala', 'Discos que rebotan', 'Discos de juego que rebotan de un enemigo a otro.', '💿', '#9fd3ff', {dano: 18, rebota: 2, cd: 1.1}, ['dano', 'rebota', 'n', 'cd']);
armaFaccion('gamer', 'ragequitter', 'ragequitter', 'bomba', 'Mando por los aires', 'Tira el mando con rabia y explota donde cae.', '🎮', '#ff4b5c', {dano: 38, r: 70, cd: 2.8}, ['n', 'dano', 'r', 'cd']);
armaFaccion('gamer', 'recreativa', 'recreativa', 'escudo', 'Carcasa arcade', 'Una carcasa de máquina arcade que aguanta golpes y se repara sola.', '🕹️', '#ffcb3d', {cd: 9}, ['golpe', 'cd', 'golpe', 'cd']);
ARMA_INICIAL.gamer = 'progamer_a';

// olvidados
armaFaccion('olvidados', 'vikingo_a', 'vikingo', 'boomerang', 'Hacha boomerang', 'Lanza un hacha hacia el enemigo y vuelve, golpeando a la ida y a la vuelta.', '🪓', '#c9a24b', {}, ['n', 'alc', 'dano', 'cd']);
armaFaccion('olvidados', 'vikingo_b', 'vikingo', 'escudo', 'Muro de escudos', 'Un muro de escudos que para dos golpes y se levanta de nuevo.', '🛡️', '#c9a24b', {cd: 12, n: 2}, ['golpe', 'cd', 'golpe', 'cd']);
armaFaccion('olvidados', 'swarmbug', 'swarmbug', 'nova', 'Bichos de estrategia', 'Bichos de un juego que nunca salió salen en todas direcciones.', '🐜', '#c9a24b', {n: 6, dano: 10}, ['n2', 'dano', 'cd', 'vel']);
armaFaccion('olvidados', 'vikingsquad', 'vikingsquad', 'orbita', 'Escudos vikingos', 'Tres escudos giran a tu alrededor y golpean a quien los toca.', '🛡️', '#c9a24b', {n: 3, dano: 13, r: 80}, ['n', 'dano', 'r', 'tick']);
armaFaccion('olvidados', 'retromarine', 'retromarine', 'bala', 'Ráfaga retro', 'Una ráfaga de tres disparos en abanico.', null, '#ff9a3c', {n: 3, dano: 8, cd: 0.8, vel: 500}, ['n', 'dano', 'cd', 'pierce']);
armaFaccion('olvidados', 'ghostagent', 'ghostagent', 'rayo', 'Disparo fantasma', 'Un disparo invisible con mucho daño a un enemigo lejano.', null, '#b6c2d9', {dano: 50, cd: 3, alc: 460, cadena: 0}, ['dano', 'cd', 'n', 'alc']);
armaFaccion('olvidados', 'rockracer', 'rockracer', 'bomba', 'Misiles del coche', 'Misiles que caen sobre los enemigos y explotan.', '🚀', '#ff4b5c', {n: 2, dano: 24, r: 50, cd: 2.4}, ['n', 'dano', 'r', 'cd']);
armaFaccion('olvidados', 'titanbeta', 'titanbeta', 'onda', 'Pisotón de la beta', 'Un pisotón gigante que aplasta y aturda a los enemigos cercanos.', null, '#c9a24b', {dano: 50, r: 100, aturde: 0.6, cd: 5.5}, ['dano', 'r', 'aturde', 'cd']);
ARMA_INICIAL.olvidados = 'vikingo_a';

// pop
armaFaccion('pop', 'directora_a', 'directora', 'onda', 'Claqueta de corte', 'Una claqueta gigante se cierra de golpe y atrae a los enemigos hacia ti.', '🎬', '#ff7a7a', {dano: 14, r: 130, cd: 3.4, lento: 0.6, emp: -520}, ['r', 'dano', 'lento', 'cd']);
armaFaccion('pop', 'directora_b', 'directora', 'onda', 'Megáfono', '¡ACCIÓN! Un grito de megáfono empuja y aturde a los enemigos cercanos.', '📣', '#ffcb3d', {dano: 20, r: 115, aturde: 0.6, cd: 4.5}, ['dano', 'r', 'aturde', 'cd']);
armaFaccion('pop', 'extras', 'extras', 'nova', 'Extras de cartón', 'Extras de cartón salen volando en todas direcciones.', '🎭', '#ff7a7a', {n: 6, dano: 10}, ['n2', 'dano', 'cd', 'vel']);
armaFaccion('pop', 'doble', 'doble', 'golpe', 'Acrobacia', 'El doble salta desde el cielo sobre el enemigo y le cae encima.', '🤸', '#ff7a7a', {dano: 32, cd: 2.2}, ['n', 'dano', 'cd', 'alc']);
armaFaccion('pop', 'detective', 'detective', 'bala', 'Lupa del detective', 'Un disparo certero a distancia que atraviesa a varios enemigos.', '🔍', '#9fd3ff', {dano: 24, cd: 1, vel: 520, atraviesa: 3}, ['n', 'dano', 'pierce', 'cd']);
armaFaccion('pop', 'heroe', 'heroe', 'corre', 'Vuelo en picado', 'El superhéroe se lanza en picado contra los enemigos.', null, '#ff4b5c', {spr: 'heroe', dano: 45, r: 60, vel: 380, cd: 3}, ['dano', 'r', 'n', 'cd']);
armaFaccion('pop', 'spoiler', 'spoiler', 'onda', 'Spoiler del final', 'Grita el final de la película y deja en shock a los enemigos cercanos.', null, '#c06bff', {dano: 18, r: 105, aturde: 1.3, cd: 6}, ['r', 'aturde', 'dano', 'cd']);
armaFaccion('pop', 'kaiju', 'kaiju', 'onda', 'Pisotón de goma', 'Un monstruo de goma pisa fuerte y daña a todo lo que hay alrededor.', null, '#7dff5e', {dano: 48, r: 95, cd: 4.2}, ['dano', 'r', 'cd', 'aturde']);
ARMA_INICIAL.pop = 'directora_a';
