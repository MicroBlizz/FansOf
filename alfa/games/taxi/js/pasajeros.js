// Fans Of Taxi · PASAJEROS: durante el turno de taxi aparecen en las aceras con su círculo de color (lo lejos que van) y su personaje de la
// serie; te paras a su lado para que suba, el camino hasta su destino se marca con puntos y, al llegar y parar, cobras según la distancia
// y los segundos que sumas al reloj según lo rápido que has ido. Cada pasajero tiene su propia paciencia. Sin DOM ni three.
'use strict';
const PASAJEROS = (() => {
  const K = TAXI.pasajeros;
  // los personajes de la serie que cogen el taxi, con su frase al subir y al bajar (la unidad dibujada vendrá del arte de core más adelante)
  const TIPOS = [
    { id: 'becario', nombre: 'Becario', color: 0x2e8bff, sube: '¡A la Torre, que llego tarde otra vez!', baja: 'Gracias. Me descontarán el taxi de la nómina.' },
    { id: 'progamer', nombre: 'ProGamer', color: 0x7ee04a, sube: 'A la LAN Party. Si pierdo la ranked por ti, te reporto.', baja: 'GG. Propina si no te vuelvo a ver.' },
    { id: 'skeleton', nombre: 'SkeletonCrew', color: 0xfff6ea, sube: 'A la Cripta antes del amanecer, por favor.', baja: 'Buen viaje. Tenía los huesos de corbata.' },
    { id: 'streamking', nombre: 'StreamKing', color: 0xff4b5c, sube: '¡Estamos en directo, chat! Dale caña.', baja: '¡Clip! Mañana lo subo.' },
    { id: 'snackmom', nombre: 'SnackMom', color: 0xff9fd0, sube: 'Despacito, que llevo la compra.', baja: 'Toma un bocadillo. Y la propina.' },
    { id: 'noob', nombre: 'Noob', color: 0xffcb3d, sube: '¿Cómo se abre la puerta? Ah, ya.', baja: '¿Esto era aquí? Bueno, vale.' },
    { id: 'lola', nombre: 'Lola', color: 0xa3325e, sube: 'Hola, soy yo. Hoy voy de pasajera.', baja: 'Por el parque se llega antes. Guiño.' },
  ];
  let esperando = [], dentro = null, azar = mulberry32(3), vistoDestino = null;
  function crear(semilla) { esperando = []; dentro = null; azar = mulberry32(semilla || 3); }
  const nuevo = () => {
    const sitio = CIUDAD.puntoAcera(azar);
    let destino, d = 0, intentos = 0;
    do { destino = CIUDAD.puntoAcera(azar); d = Math.hypot(destino.x - sitio.x, destino.z - sitio.z); } while ((d < 50 || destino.manzana === sitio.manzana) && ++intentos < 20);
    const tramo = K.colores.find(c => d <= c.hasta);
    return { ...sitio, tipo: TIPOS[(azar() * TIPOS.length) | 0], destino, distancia: d, tramo, paciencia: K.paciencia * d / K.velPar, t: 0, subiendo: 0 };
  };
  function llenar(n = K.cuantos) { while (esperando.length < n) esperando.push(nuevo()); }
  function vaciar() { esperando = []; dentro = null; }

  // sucesos: { tipo: 'sube' | 'baja' | 'harto', ... }
  function paso(dt, jugador, enTurno) {
    const sucesos = [];
    if (!enTurno) return sucesos;
    const quieto = COCHE.rapidez(jugador) < K.paradoVel && !jugador.aire;
    if (!dentro) {
      for (const p of esperando) {
        p.t += dt;
        if (quieto && Math.hypot(p.x - jugador.x, p.z - jugador.z) < K.recoger) {
          p.subiendo += dt;
          if (p.subiendo >= K.subir) {
            dentro = p; dentro.viaje = 0; esperando = esperando.filter(q => q !== p);
            const desde = CIUDAD.nodoCercano(jugador.x, jugador.z).id, hasta = CIUDAD.nodoCercano(p.destino.x, p.destino.z).id;
            dentro.camino = CIUDAD.camino(desde, hasta).map(id => CIUDAD.nodos[id]);
            sucesos.push({ tipo: 'sube', pasajero: p }); break;
          }
        } else p.subiendo = 0;
      }
    } else {
      dentro.viaje += dt;
      if (dentro.viaje > dentro.paciencia) { sucesos.push({ tipo: 'harto', pasajero: dentro }); dentro = null; }
      else if (quieto && Math.hypot(dentro.destino.x - jugador.x, dentro.destino.z - jugador.z) < K.dejar) {
        dentro.bajando = (dentro.bajando || 0) + dt;
        if (dentro.bajando >= K.subir) {
          const par = dentro.distancia / K.velPar, parte = dentro.viaje / par;
          const bono = K.bonos.find(b => parte <= b[0]) || [0, 0, 'LENTO'];
          const dinero = Math.round(dentro.tramo.tarifa + dentro.distancia * K.porMetro);
          sucesos.push({ tipo: 'baja', pasajero: dentro, dinero, segundos: bono[1], etiqueta: bono[2] });
          dentro = null;
        }
      } else dentro.bajando = 0;
    }
    llenar();
    return sucesos;
  }
  return { crear, llenar, vaciar, paso, TIPOS, get esperando() { return esperando; }, get dentro() { return dentro; } };
})();
