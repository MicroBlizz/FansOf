// Fans of Pinball · dominio · EVENTOS: la lista CERRADA de lo que puede pasar en la mesa y los datos que lleva cada uno. Partida.paso()
// devuelve los eventos de ese paso como { tipo, ...datos } y la pantalla pone con ellos sonido, vibración y efectos. Posiciones en
// unidades del mundo; segundos; `dano`, `puntos` y `fichas` ya con todos los multiplicadores. Un evento que no está aquí, o al que le
// falta un dato, es un fallo de programación (PB.eventoMal lo dice; los tests lo comprueban en cada paso).
'use strict';
PB.EVENTOS = PB.congela({
  golpe: ['x', 'y', 'objetivo', 'dano', 'fuerte', 'critico'],     // la bola golpea algo con vida (objetivo: vasija, cofre, becario…, caja, jefe)
  rompe: ['x', 'y', 'clase', 'puntos', 'fichas'],                 // se rompe (clase): vasija, cofre, caja (del jefe), cubito o cafe
  cofre: ['x', 'y', 'fichas', 'segundos'],                        // además de «rompe»: el cofre suelta fichas y tiempo
  enemigo_vencido: ['x', 'y', 'clase', 'puntos', 'fichas', 'segundos'],   // clase: becario, cafetero, fichador, casco
  pala: ['pala', 'x', 'y', 'fuerza'],                             // una pala en movimiento golpea la bola (fuerza = velocidad de salida)
  bola_perdida: ['x', 'y', 'criatura', 'segundos', 'siguiente'],  // segundos quitados (0 en el CAOS); siguiente criatura (null si no sale otra)
  caos_empieza: ['segundos', 'bolas'],
  caos_acaba: ['criatura'],                                       // la criatura que se queda de bola
  escalera_abierta: ['x', 'y'],                                  // se abre el ascensor (el nombre viene de la escalera)
  escalera_entra: ['x', 'y', 'segundos', 'puntos', 'fichas', 'expres', 'planta'],   // la bola entra en el ascensor; planta = la nueva
  por_los_pelos: ['x', 'y', 'camaraLenta', 'factor'],             // cámara lenta: segundos reales y parte de velocidad
  jefe_aviso: ['pala', 'x', 'y', 'segundos'],                     // el láser apunta a una pala (x, y: la pala)
  pala_congelada: ['pala', 'x', 'y', 'segundos'],
  jefe_golpe: ['x', 'y', 'dano', 'vida', 'vidaMax'],
  jefe_vencido: ['x', 'y', 'puntos', 'fichas', 'camaraLenta', 'factor'],
  mejora: ['mejora', 'nivel'],                                    // nivel = cuántas tiene ya de esa mejora
  tiempo_fuera: ['planta'],
  fin: ['resultado', 'planta', 'puntos', 'fichas'],               // resultado: 'tiempo' | 'victoria'
  // los que añadió N2 porque la pantalla los necesita (sonido o letrero propio)
  seta: ['x', 'y', 'puntos'],
  explosion: ['x', 'y', 'radio', 'dano', 'origen'],               // origen: salto, dinamita, basura, rebote
  poder: ['criatura', 'poder', 'x', 'y'],                         // se activa un poder (el zorro se esconde, el castor arma la dinamita…)
  salvabolas: ['x', 'y', 'clase'],                                // clase: 'salvabolas' (vuelve al lanzador) | 'salvavidas' (rebota del hueco)
  empujon: ['x', 'y', 'motivo'],                                  // motivo: 'quieta' | 'sin_tocar'
  pala_lenta: ['pala', 'x', 'y', 'segundos'],                     // un café dio en una pala
  fichaje: ['x', 'y', 'segundos'],                                // el fichador quita tiempo
  jefe_nucleo: ['x', 'y', 'segundos'],                            // se abre el núcleo del jefe
  jefe_llama: ['x', 'y', 'cuantos'],                              // el jefe llama a becarios
  sala_empieza: ['planta', 'clase', 'reloj'],                     // clase: normal | tesoro | jefe
  rampa: ['x', 'y'],                                              // la bola entra en la rampa y sube a la fotocopiadora
  // los de la mesa con decorado grande (0.2.0): el ascensor sigue usando los nombres escalera_abierta y escalera_entra
  maquina: ['x', 'y', 'id', 'puntos', 'fichas'],                  // la bola da en una máquina de café (id: 0, 1 o 2)
  rebotador: ['x', 'y', 'lado', 'puntos'],                        // patada de un rebotador (lado: izquierdo | derecho)
  fotocopia: ['x', 'y', 'puntos', 'fichas'],                      // la fotocopiadora escupe la bola arriba, con papeles volando
  tienda_entra: ['x', 'y', 'fichas'],                             // la bola entra en la tienda de Lola: la mesa se para
  tienda_sin_fichas: ['x', 'y', 'faltan'],                        // la bola da en la persiana sin fichas para lo más barato
  tienda_compra: ['mejora', 'precio'],                            // además del evento «mejora»
  tienda_sale: ['x', 'y', 'mejora'],                              // la bola vuelve a la mesa (mejora: la comprada, o '' si no compró)
});
// lo que le falta a un evento para valer: '' si está bien
PB.eventoMal = e => {
  if (!e || typeof e.tipo !== 'string' || !PB.EVENTOS[e.tipo]) return 'tipo desconocido: ' + (e && e.tipo);
  const falta = PB.EVENTOS[e.tipo].filter(campo => e[campo] === undefined);
  return falta.length ? e.tipo + ' sin ' + falta.join(', ') : '';
};
// apunta un evento en la lista del paso de la partida `s` (el dato `tipo` es siempre el del evento: las clases van en `clase`)
PB.emite = (s, tipo, datos) => { s.ev.push({ ...datos, tipo }); };
