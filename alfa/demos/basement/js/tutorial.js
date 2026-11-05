// Fans of Basement · Tutorial con Lola (solo pantalla y guardado): la pelirroja de Microblizz (su dibujo de Swipe) te explica el
// juego en bocadillos de pergamino la primera vez que pasa cada cosa: al empezar la primera bajada, al ver el primer becario
// atrapado, al llegar al primer jefe, al volver a tu mesa y al abrir la primera vez cada pestaña. Mientras habla, la bajada se para;
// cada toque pasa al siguiente bocadillo. Lo ya visto se guarda en SAVE.tuto y no vuelve a salir.
'use strict';
var BAS = globalThis.BAS || (globalThis.BAS = {});
(function (B) {
  const UI = B.ui, C = UI.C, T = UI.texto;
  const GUIONES = {
    bajada: [
      '¡Hola! Soy Lola. El servidor de Microblizz se ha caído y alguien tiene que bajar a arreglarlo. Sí: tú, becario.',
      'Pon el dedo en cualquier sitio y arrástralo para moverte. Tu grapadora dispara sola a lo que tengas más cerca.',
      'El café es tu oxígeno: lo tienes arriba a la izquierda. Se gasta solo y con cada golpe. Si llega a cero, te desmayas y pierdes la caja.',
      'Lo que sueltan los bots va a tu caja del despedido. Antes de quedarte sin café, pulsa ASCENSOR: tarda unos segundos, ¡aguanta!',
    ],
    becario: ['¡Un becario atrapado! Tócalo para rescatarlo: te seguirá disparando y, si subes a salvo, te dará propina.'],
    jefe: ['¡Cuidado, un jefe! La cinta de PRECAUCIÓN no te deja bajar hasta vencerlo. Esquiva lo que te lance. Si vas mal de café, siempre puedes llamar al ascensor.'],
    mesa: [
      'Esta es tu mesa. Con las monedas de la caja te formas: cada curso del tablero te hace más fuerte.',
      'Es un árbol de talentos: cada uno pide alguno de la fila de encima. En las filas de borde naranja eliges uno de dos, y si te arrepientes puedes REINICIAR.',
    ],
    equipo: ['Aquí te pones el equipo y eliges mascota. Todo sale de los paquetes: toca el de la rareza que quieras ponerte.'],
    ventaja: ['Al empezar y en cada departamento nuevo eliges una ventaja. Solo vale para esta bajada, así que piensa qué te hace falta.'],
    modos: ['Aquí tienes dos modos más, siempre desde Marketing: el DESAFÍO DEL DÍA, la misma bajada para todos, y el EVENTO DE LA SEMANA, con reglas especiales. Cada uno tiene su premio y su ranking.'],
    presion: [
      'Aquí eliges dónde bajas. Cada departamento, salvo Marketing, pide su acreditación.',
      'Sin ella puedes bajar, pero la presión te frena y el café se gasta mucho más. Cómprala con el botón naranja de su fila.',
    ],
    departamento: ['¡Ya puedes saltarte departamentos! El ascensor te deja en cualquiera cuyo jefe de antes hayas vencido. Abajo pagan más, pero pegan más fuerte.'],
    final: [
      '¡Lo has conseguido! El servidor vuelve a funcionar y Microblizz ni se ha enterado de que estuvo caído.',
      'Ahora puedes ASCENDER en tu mesa: empiezas la campaña otra vez con un cargo mejor. O bajar al Código Legacy de 2004, que no tiene fondo. Nadie sabe qué hay abajo del todo.',
    ],
    catalogo: ['Este es el catálogo de bichos. Cada bicho nuevo que tumbas paga una vez; los raros pagan mucho. Complétalo y te llevas tres paquetes del jefe.'],
    habilidad: [
      'Abajo a la izquierda tienes tu habilidad especial: la Reunión de emergencia deja quietos a todos unos segundos.',
      'Úsala cuando te rodeen y espera a que se recargue. Al vencer jefes abrirás más, y en EQUIPO eliges cuál llevas.',
    ],
    red: [
      '¿Ves la exclamación verde? Ese bicho está débil: pulsa RED (abajo a la derecha) y lo atrapas vivo.',
      'Los capturados valen más que su botín y, si subes a salvo, van al terrario de tu despacho. Si está entero, se escapa y pierdes la red.',
    ],
    taller: [
      'Este es el taller. Al bajar, rompe taquillas, fotocopiadoras y máquinas de café: sueltan tornillos, cables y chips.',
      'Aquí los cambias por el arma o la pieza que quieras, sin azar, o subes de nivel tus armas. Ojo: si te desmayas, se pierden con la caja.',
    ],
    paquetes: ['Los paquetes dan equipo, armas o mascotas. Las probabilidades están siempre a la vista. El del jefe es mejor: lo da cada jefe la primera vez que lo vences.'],
  };
  const TU = B.tuto = { activo: null };

  // Empieza un guion si no se ha visto todavía. Devuelve true si va a hablar Lola.
  TU.lanza = function (clave, t) {
    if (TU.activo || (SAVE.tuto && SAVE.tuto[clave]) || !GUIONES[clave]) return false;
    TU.activo = { clave, i: 0, t0: t };
    return true;
  };
  TU.habla = () => !!TU.activo;

  TU.toca = function (t) {
    const a = TU.activo;
    if (!a || t - a.t0 < 0.35) return;
    a.i++; a.t0 = t;
    if (a.i < GUIONES[a.clave].length) return;
    SAVE.tuto = { ...(SAVE.tuto || {}), [a.clave]: true };
    TU.activo = null;
    basGuarda();
  };

  TU.dibuja = function (g, W, H, t) {
    const a = TU.activo;
    if (!a) return [];
    g.fillStyle = 'rgba(10,5,20,0.55)'; g.fillRect(0, 0, W, H);
    const h = 270, y = H - h - 150, x = 18, w = W - 36;
    UI.pergamino(g, x, y, w, h);
    UI.panel(g, x + 14, y - 112, 208, 160, C.rojo, '#ff9a8e', '#9a1f1a', 5);
    UI.dibuja(g, 'ev-lola', x + 118, y - 32, 2.5);
    UI.franja(g, 'LOLA', x + 290, y - 22, 22, 140);
    UI.lineas(g, tr(GUIONES[a.clave][a.i]), x + 34, y + 72, 22, w - 68, C.cafe, 'left', 0, 28);
    if (t - a.t0 > 0.5 && Math.floor(t * 2) % 2) T(g, tr('Toca para seguir'), x + w - 30, y + h - 34, 16, '#8a5a24', 'right', 0);
    return [{ x: 0, y: 0, w: W, h: H, accion: 'tuto' }];
  };
})(BAS);
