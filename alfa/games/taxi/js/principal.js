// Fans Of Taxi · PRINCIPAL: arranca todo (espera a three.js, monta la ciudad, el HUD y los mandos), lleva el bucle con paso fijo (la lógica
// va a 60 pasos por segundo pase lo que pase; la pantalla pinta lo que puede) y reparte los sucesos: propinas y combo, la radio de Lola,
// arrancar y terminar eventos, la policía, el guardado del dinero. Es el único archivo que conoce a todos los demás.
'use strict';
(() => {
  const DT = TAXI.paso;
  let jugador, mundo, acumulado = 0, ultimo = 0, temblor = 0, lolaT = 0, salidaCerca = null, parado = 0;
  const LOLA = {
    bienvenida: ['Hola, soy Lola, desde la emisora. Microblizz quiere cambiar los taxis por robots. Tú eres el último con conductor.', 'Párate en una parada de taxi para empezar el turno. Los corredores aparcados son una carrera; la patrulla, una huida.'],
    turno: ['Los pasajeros rojos van lejos y pagan bien. Los verdes, al lado. Tú verás.', 'Frena y gira: derrapar carga el nitro.', 'Pasa rozando a los coches: propina. Chócalos: adiós combo.'],
    distrae: ['¿Sabías que la Torre Microblizz tiene 90 plantas y ningún ascensor que funcione?', 'Hoy el CEO ha despedido a alguien por respirar. Era yo. Otra vez.', 'Por el parque se llega antes. O no. Prueba.', 'Hay una rampa en el Centro. No digo dónde. Bueno, al norte.'],
    poli: ['Patrulla de Microblizz detrás. Son becarios: pierden el norte en la primera curva.', 'Si te ven, te siguen. Escóndete en un parking y espera.', 'Empújalos contra un muro. Se les cae el servidor.'],
    escapado: ['Limpio. Ya no te buscan.'], parado: ['Te han parado. Lo del evento se lo queda Microblizz, claro.'],
  };
  const frase = lista => HUD.radio(tr(lista[(Math.random() * lista.length) | 0]));

  function iniciar() {
    mundo = { muros: CIUDAD.muros, arboles: CIUDAD.arboles, rampas: CIUDAD.rampas, ancho: CIUDAD.ancho, largo: CIUDAD.largo, semilla: TAXI.ciudad.semilla };
    const n = CIUDAD.nodos[CIUDAD.nodoId(4, 4)];
    jugador = COCHE.nuevo(n.x + TAXI.ciudad.carril, n.z - 20, 0, { masa: 1.1 });
    EVENTOS.crear(mundo.semilla); EVENTOS.dinero = SAVE.dinero;
    TRAFICO.crear(mundo); POLICIA.crear(mundo); PASAJEROS.crear(mundo.semilla);
    ESCENA.iniciar(document.getElementById('lienzo'));
    HUD.montar(); CONTROLES.montar();
    document.getElementById('b-accion').addEventListener('click', CONTROLES.pulsaAccion);
    if (typeof RENDIMIENTO !== 'undefined') RENDIMIENTO.activar({ juego: 'taxi' });
    HUD.radio(tr(LOLA.bienvenida[0]), 7); setTimeout(() => HUD.radio(tr(LOLA.bienvenida[1]), 7), 7500);
    requestAnimationFrame(cuadro);
  }
  const otrosCoches = () => TRAFICO.coches.map(c => c.coche).concat(POLICIA.patrullas.map(p => p.coche), EVENTOS.rivales.map(r => r.coche));

  function pasoLogica() {
    const e = CONTROLES.leer();
    // arrancar un evento: parado en una salida y acción (o quedarse quieto un segundo)
    salidaCerca = EVENTOS.activo ? null : EVENTOS.cerca(jugador);
    if (salidaCerca && COCHE.rapidez(jugador) < 2) { parado += DT; if (e.accion || parado > 1) { const a = EVENTOS.arrancar(salidaCerca, jugador); if (a) { HUD.aviso(tr(a.nombre), 'grande'); play('select'); if (a.tipo === 'turno') frase(LOLA.turno); if (a.tipo === 'huida') frase(LOLA.poli); } parado = 0; } } else parado = 0;
    HUD.accion(salidaCerca && !EVENTOS.activo ? tr('EMPEZAR') + ': ' + tr(salidaCerca.nombre) : '');
    // el coche
    for (const s of COCHE.paso(jugador, e, DT, mundo)) {
      if (s === 'choque') { EVENTOS.corta(); temblor = 0.6; play('slam'); HUD.aviso(tr('CHOQUE'), 'mal'); }
      else if (s === 'salta') { play('jump'); }
      else if (s === 'aterriza') { if (jugador.golpe === 0) { HUD.aviso(tr('SPEEDRUN') + ' +' + Math.round(TAXI.propinas.salto * EVENTOS.estado().combo), 'bien'); EVENTOS.propina('salto'); } }
    }
    if (jugador.derrapando && jugador.derrapeT > TAXI.propinas.derrapeMin && !jugador.derrapePagado) { jugador.derrapePagado = true; HUD.aviso(tr('CLIP VIRAL') + ' +' + Math.round(TAXI.propinas.derrape * EVENTOS.estado().combo), 'bien'); EVENTOS.propina('derrape'); }
    if (!jugador.derrapando) jugador.derrapePagado = false;
    // el tráfico
    for (const s of TRAFICO.paso(DT, mundo, jugador, POLICIA.patrullas.map(p => p.coche).concat(EVENTOS.rivales.map(r => r.coche)))) {
      if (s === 'roce') { jugador.nitro = Math.min(1, jugador.nitro + TAXI.coche.nitroCarga.roce); HUD.aviso(tr('CASI BANEADO') + ' +' + Math.round(TAXI.propinas.roce * EVENTOS.estado().combo), 'bien'); EVENTOS.propina('roce'); play('pop'); }
      else if (s === 'choque-trafico') { EVENTOS.corta(); temblor = 0.4; play('hit'); }
    }
    // la policía
    for (const s of POLICIA.paso(DT, mundo, jugador, TRAFICO.coches.map(c => c.coche).concat(EVENTOS.rivales.map(r => r.coche)))) {
      if (s === 'visto') { HUD.aviso(tr('¡TE HAN VISTO!'), 'mal'); play('womp'); frase(LOLA.poli); }
      else if (s === 'escapado') { HUD.aviso(tr('ESCAPADO'), 'bien'); play('heal'); frase(LOLA.escapado); }
      else if (s === 'derribo') { jugador.nitro = Math.min(1, jugador.nitro + TAXI.coche.nitroCarga.derribo); SAVE.derribos++; HUD.aviso(tr('DERRIBO') + ' +' + Math.round(TAXI.propinas.derribo * EVENTOS.estado().combo), 'bien grande'); EVENTOS.propina('derribo'); play('boom'); temblor = 0.8; }
      else if (s === 'choque-policia') { play('clank'); temblor = 0.3; }
      else if (s === 'parado') { frase(LOLA.parado); if (EVENTOS.activo) fin(EVENTOS.termina('parado')); else HUD.aviso(tr('TE HAN PARADO'), 'mal grande'); }
    }
    // el evento en marcha
    for (const s of EVENTOS.paso(DT, mundo, jugador, otrosCoches())) {
      if (s.tipo === 'dinero') { if (s.etiqueta && !['roce', 'salto', 'derrape', 'derribo'].includes(s.etiqueta)) HUD.aviso(tr(s.etiqueta) + ' +' + fmt(s.cuanto), 'bien grande'); }
      else if (s.tipo === 'sube') { HUD.radio(tr(s.pasajero.tipo.nombre) + ': ' + tr(s.pasajero.tipo.sube), 4); play('card'); }
      else if (s.tipo === 'baja') { HUD.radio(tr(s.pasajero.tipo.nombre) + ': ' + tr(s.pasajero.tipo.baja), 4); HUD.aviso('+' + s.segundos + ' s', 'tiempo'); SAVE.viajes++; play('acorn'); }
      else if (s.tipo === 'harto') { HUD.aviso(tr('SE HA BAJADO'), 'mal'); EVENTOS.corta(); play('deny'); }
      else if (s.tipo === 'ya') { HUD.aviso(tr('¡YA!'), 'grande'); play('deploy'); }
      else if (s.tipo === 'fin') fin(s);
    }
    // Lola distrae de vez en cuando
    lolaT += DT; if (lolaT > 28) { lolaT = 0; if (Math.random() < 0.6) frase(LOLA.distrae); }
    temblor = Math.max(0, temblor - DT * 2);
  }
  function fin(s) {
    const ev = s.evento, clave = ev.tipo + (ev.nombre || '');
    let texto;
    if (s.como === 'parado') texto = tr('TE HAN PARADO') + '<small>' + tr('pierdes') + ' ' + fmt(s.perdido) + ' €</small>';
    else if (ev.tipo === 'turno') texto = tr('FIN DEL TURNO') + '<small>' + ev.viajes + ' ' + tr('viajes') + ' · ' + fmt(s.ganado) + ' €' + (txRecord(clave, s.ganado) ? ' · ' + tr('RÉCORD') : '') + '</small>';
    else if (ev.tipo === 'sprint') texto = tr('PUESTO') + ' ' + ev.puestoFinal + '<small>' + fmt(s.ganado) + ' €</small>';
    else texto = tr('HUIDA') + ': ' + tr(s.como === 'escapado' ? 'ESCAPADO' : 'AGUANTADO') + '<small>' + fmt(s.ganado) + ' €</small>';
    HUD.centro('<b class="ol">' + texto + '</b>'); setTimeout(() => HUD.centro(''), 3500);
    SAVE.dinero = EVENTOS.dinero; txGuarda(); play(s.como === 'parado' ? 'despido' : 'summon');
  }
  function cuadro(t) {
    requestAnimationFrame(cuadro);
    const dt = Math.min(0.1, (t - ultimo) / 1000 || 0); ultimo = t; acumulado += dt;
    let pasos = 0; while (acumulado >= DT && pasos < 4) { pasoLogica(); acumulado -= DT; pasos++; }
    if (pasos === 4) acumulado = 0;   // el navegador se ha atascado: no intentar recuperar el tiempo
    const dentro = PASAJEROS.dentro, activo = EVENTOS.activo;
    const camino = dentro ? dentro.camino : activo && activo.tipo === 'sprint' ? activo.ruta.slice(activo.siguiente - 1).map(id => CIUDAD.nodos[id]) : null;
    const destino = dentro ? { x: dentro.destino.x, z: dentro.destino.z, color: dentro.tramo.color } : activo && activo.tipo === 'sprint' ? { x: activo.meta.x, z: activo.meta.z, color: 0x7ee04a } : null;
    const estado = { jugador, conductores: TRAFICO.coches.concat(POLICIA.patrullas, EVENTOS.rivales), caidas: POLICIA.caidas, pasajeros: PASAJEROS.esperando, camino, destino, temblor, eventos: EVENTOS.estado(), policia: POLICIA.estado(), pasajero: dentro };
    ESCENA.sincroniza(estado, dt); HUD.pinta(estado, dt);
  }
  const listo = () => (window.THREE ? iniciar() : window.addEventListener('three-listo', iniciar, { once: true }));
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', listo); else listo();
})();
