// Fans of Pinball · dominio · BOLAS: la bola es la criatura. Crearla con sus cifras, lanzarla por el canal (o subirla por la rampa) en un
// viaje sin choques hasta su salida en el nivel de arriba (la del lanzador o la bandeja de la fotocopiadora, con su premio), perderla por el hueco de abajo (salvabolas, Salvavidas, CAOS o −8 s y la siguiente
// criatura) y vigilar que no se quede parada ni rebotando sin tocar nada (empujón).
'use strict';
PB.bolas = (() => {
  function crea(s, criatura) {
    const cif = PB.progreso.cifras(s.r, criatura, s.niveles[criatura] || 1).valor;
    return {
      id: s.siguienteBola++, criatura, cif, vivo: true, estado: 'mesa', viaje: null, clon: false,
      x: 0, y: 0, vx: 0, vy: 0, r: s.r.fisica.radioBola * s.cif.radio, ang: 0,
      quieta: 0, sinTocar: 0, desdeToque: 0, golpes: 0, atrapada: false, tocoMarco: -99,
      oculta: false, dinamita: false, estela: 0, rastroT: 0, rastro: [], quemados: new Set(),
    };
  }
  // pone la bola de viaje por un camino ({ camino, segundos, salida, premio }) hasta su salida de arriba
  function viaja(b, ruta) {
    b.estado = 'viaje'; b.viaje = { camino: ruta.camino, segundos: ruta.segundos, t: 0, salida: ruta.salida, premio: ruta.premio || null };
    b.x = ruta.camino[0][0]; b.y = ruta.camino[0][1]; b.vx = 0; b.vy = 0;
  }
  // una bola nueva de esa criatura sale por el lanzador
  function lanza(s, criatura) {
    const b = crea(s, criatura);
    viaja(b, s.r.mesa.lanzador);
    s.bolas.push(b);
    return b;
  }
  function llega(s, b) {
    const sa = b.viaje.salida, premio = b.viaje.premio;
    Object.assign(b, { estado: 'mesa', viaje: null, x: sa.x, y: sa.y, vx: sa.vx, vy: sa.vy, quieta: 0, sinTocar: 0 });
    if (!premio) return;
    const p = PB.marcador.premia(s, s.r.puntos.cosas[premio]);
    PB.emite(s, 'fotocopia', { x: sa.x, y: sa.y, ...p });
  }
  // avanza el viaje (posición a lo largo del camino) y la deja en la mesa al llegar
  function pasoViaje(s, b, dt) {
    const v = b.viaje, [a, z] = v.camino;
    v.t += dt;
    const f = Math.min(1, v.t / v.segundos);
    b.x = a[0] + (z[0] - a[0]) * f; b.y = a[1] + (z[1] - a[1]) * f;
    if (f >= 1) llega(s, b);
  }
  const vivas = s => s.bolas.filter(b => b.vivo);
  function siguiente(s) {
    s.activa = (s.activa + 1) % s.equipo.length;
    return s.equipo[s.activa];
  }
  // en el CAOS perder una bola no cuesta nada; si no queda ninguna, sale la siguiente criatura
  function pierdeEnCaos(s, b) {
    b.vivo = false;
    const otra = vivas(s).length ? null : siguiente(s);
    if (otra) lanza(s, otra);
    PB.emite(s, 'bola_perdida', { x: b.x, y: b.y, criatura: b.criatura, segundos: 0, siguiente: otra });
  }
  function salva(s, b) {
    if (s.sala.tiempo < s.r.reloj.salvabolas) {
      viaja(b, s.r.mesa.lanzador);
      PB.emite(s, 'salvabolas', { x: b.x, y: b.y, clase: 'salvabolas' });
      return true;
    }
    if (s.sala.salvavidas >= s.cif.salvavidas) return false;
    s.sala.salvavidas += 1;
    const sv = s.r.mesa.salvavidas;
    Object.assign(b, { x: sv.x, y: sv.y, vx: 0, vy: sv.vy });
    PB.emite(s, 'salvabolas', { x: b.x, y: b.y, clase: 'salvavidas' });
    return true;
  }
  // la bola se ha colado entre las palas de abajo
  function pierde(s, b) {
    if (s.caos.activo) return pierdeEnCaos(s, b);
    if (salva(s, b)) return;
    b.vivo = false; s.combo = 0;
    const segundos = PB.marcador.quitaTiempo(s, s.r.reloj.perderBola), otra = siguiente(s);
    lanza(s, otra);
    PB.emite(s, 'bola_perdida', { x: b.x, y: b.y, criatura: b.criatura, segundos, siguiente: otra });
  }
  function empuja(s, b, vx, vy, motivo) {
    b.vx += vx; b.vy += vy; b.quieta = 0; b.sinTocar = 0;
    PB.geo.limita(b, s.r.fisica.velocidadMaxima);
    PB.emite(s, 'empujon', { x: b.x, y: b.y, motivo });
  }
  // parada 3 s (y no atrapada con la pala) o 10 s sin tocar nada: empujón
  function vigila(s, b, dt) {
    const f = s.r.fisica, lenta = PB.geo.rapidez(b) < f.quieta.velocidad;
    b.quieta = lenta && !b.atrapada ? b.quieta + dt : 0;
    b.sinTocar = b.atrapada ? 0 : b.sinTocar + dt;
    if (b.quieta >= f.quieta.segundos) empuja(s, b, s.az.entre(-0.3, 0.3) * f.quieta.empujon, -f.quieta.empujon, 'quieta');
    else if (b.sinTocar >= f.sinTocar.segundos) empuja(s, b, (s.r.mesa.ancho / 2 - b.x) * 2, -f.sinTocar.empujon, 'sin_tocar');
  }
  return { crea, viaja, lanza, pasoViaje, pierde, vigila, vivas };
})();
