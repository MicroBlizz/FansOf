// Fans of Spy · ADAPTADORES · Las ventanas: el menú (con las dos misiones y lo que llevas ganado), la pausa, cómo se juega, los
// ajustes (sonido, idioma y cuenta, con el componente de Opciones de core) y el final de la planta (la nota, las cuentas y los
// Clips). Solo montan lo que enseña cada una y a dónde lleva cada botón; las pinta SPY.hud.ventana.
// Se crea con SPY.creaVentanas({ casos, empezar(nivel, guiada), salir() }).
'use strict';
var SPY = globalThis.SPY || (globalThis.SPY = {});
SPY.creaVentanas = function ({ casos, empezar, salir }) {
  const S = SPY, H = S.hud;
  const AYUDA = [
    'Llega a la puerta verde sin que te vean.',
    'En tu turno juegas hasta 2 cartas. Cada carta tiene un coste: cuanto más gastes, más se moverán los guardias antes de que te vuelva a tocar.',
    'Cualquier carta sirve también para andar 3 casillas, en vez de usar su efecto.',
    'Lo que ve cada guardia está pintado en el suelo: azul tranquilo, amarillo sospecha y rojo alerta. Los coches, las columnas y las paredes tapan la vista.',
    'El ruido atrae a los guardias. Úsalo para sacarlos de su sitio.',
    'Si te ven, salta la alerta: escóndete o aléjate hasta que se calmen.',
    'Arrastra para mirar el escenario, pellizca para acercarte y pulsa GIRAR para verlo desde otro lado.',
  ];
  let abierta = null;

  function abre(nombre, datos) { abierta = nombre; H.ventana(datos); }
  function cierra() { abierta = null; H.ventana(null); }

  // «Clips 45», «Parking S»…: lo que llevas ganado, en pastillas.
  function marcador() {
    const prog = casos.progreso(), caja = H.crea('div', 'spy-marcador');
    for (const [nombre, valor] of [['Clips', prog.clips], ['Parking', prog.notas.parking], ['Misión', prog.notas.prueba]]) {
      if (valor === undefined) continue;   // una planta sin nota todavía no sale
      const pastilla = H.crea('span');
      pastilla.append(H.crea('i', '', nombre), ' ', H.crea('b', '', String(valor)));
      caja.append(pastilla);
    }
    return caja;
  }

  function menu() {
    abre('menu', { clase: 'menu', titulo: 'FANS OF SPY', sub: 'Operación Torre',
      lineas: ['Sigilo por turnos con cartas. Cuela a CrazyBunny en la torre de Microblizz sin que te vean.', marcador()],
      botones: [
        ['TUTORIAL: EL PARKING', 'spy-naranja', () => empezar('parking', true)],
        ['MISIÓN DE PRUEBA', 'spy-verde', () => empezar('prueba', false)],
        ['CÓMO SE JUEGA', 'spy-azul', () => ayuda(menu)],
        ['AJUSTES', 'spy-amarillo', () => ajustes(menu)],
      ] });
  }

  function ayuda(volver) {
    abre('ayuda', { clase: 'spy-ayuda', titulo: 'CÓMO SE JUEGA', lineas: AYUDA, botones: [['ENTENDIDO', 'spy-verde', volver]] });
  }

  function ajustes(volver) {
    const o = OPCIONES.lista({ filas: [OPCIONES.interruptor('Sonido', 'Los efectos del juego.', S.almacen.conSonido, S.almacen.ponSonido), 'idioma', 'cuenta'], versionTexto: 'Fans of Spy ' + S.AJ.version });
    abre('ajustes', { titulo: 'AJUSTES', lineas: [o.lista, o.version].filter(Boolean), botones: [['VOLVER', 'spy-verde', volver]] });
  }

  function pausa() {
    abre('pausa', { titulo: 'PAUSA', sub: casos.planta.nombre, botones: [
      ['SEGUIR', 'spy-verde', cierra],
      ['CÓMO SE JUEGA', 'spy-azul', () => ayuda(pausa)],
      ['AJUSTES', 'spy-amarillo', () => ajustes(pausa)],
      ['REINICIAR', 'spy-naranja', () => empezar(casos.nivel, casos.guiada())],
      ['SALIR AL MENÚ', 'spy-rojo', salir],
    ] });
  }

  // Las cuentas del final, en filas: [texto, valor, clase].
  function cuentas(filas) {
    const caja = H.crea('div', 'spy-datos');
    for (const [texto, valor, clase] of filas) {
      const fila = H.crea('div', 'spy-dato ' + (clase || ''));
      fila.append(H.crea('span', '', texto), H.crea('b', '', String(valor)));
      caja.append(fila);
    }
    return caja;
  }
  function loQueDiceLola(texto) {
    const caja = H.crea('div', 'spy-lola-dijo');
    caja.append(H.crea('p', '', texto));
    return caja;
  }

  // El final de la planta: con nota si se llega a la puerta, o el aviso de que te han tumbado.
  function final(fin, guiada) {
    const k = casos.p.cuenta, nivel = casos.nivel, repetir = ['REPETIR', 'spy-azul', () => empezar(nivel, guiada)], alMenu = ['MENÚ', 'spy-amarillo', salir];
    if (fin.como !== 'meta') {
      abre('final', { titulo: 'TE HAN TUMBADO', sub: casos.planta.nombre, lineas: ['Los Becarios te han dejado sin fuerzas. Prueba otra ruta o escóndete antes.'], botones: [['REINTENTAR', 'spy-naranja', () => empezar(nivel, guiada)], alMenu] });
      return;
    }
    const filas = [['Turnos (objetivo ' + casos.planta.par + ')', k.turnos], ['Alertas', k.alertas]];
    if (!guiada) filas.push(['Guardias derribados', k.derribos]);   // en el tutorial no se ataca
    filas.push(['Puntos', fin.puntos]);
    if (k.secretos) filas.push(['El cochazo del CEO', '+' + S.AJ.nota.secreto, 'premio']);
    filas.push(['Clips ganados', '+' + fin.clips, 'premio']);
    const lineas = [H.crea('div', 'spy-nota', fin.nota), cuentas(filas)];
    if (guiada) lineas.push(loQueDiceLola(S.guia.FINAL));
    const botones = guiada ? [['MISIÓN DE PRUEBA', 'spy-naranja', () => empezar('prueba', false)], repetir, alMenu] : [repetir, alMenu];
    abre('final', { titulo: guiada ? 'PLANTA SUPERADA' : 'MISIÓN CUMPLIDA', sub: casos.planta.nombre, lineas, botones });
  }

  // Sin WebGL no hay juego: se dice claro.
  function sin3d() {
    abre('sin3d', { titulo: 'SIN 3D', lineas: ['Este navegador no puede pintar el juego en 3D. Prueba con otro navegador o actualízalo.'], botones: [] });
  }

  return Object.freeze({ menu, pausa, ayuda, ajustes, final, sin3d, cierra, abierta: () => abierta });
};
