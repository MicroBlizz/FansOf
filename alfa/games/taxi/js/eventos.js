// Fans Of Taxi · EVENTOS: lo que se arranca desde la calle, sin menús. En algunos cruces hay una salida con su referencia visual: la parada
// de taxi (turno), unos corredores aparcados (sprint) o una patrulla aparcada (huida). Te paras encima y arrancas. Aquí viven el turno de
// taxi (el reloj que crece), el sprint contra rivales por una ruta de cruces y la huida (sobrevivir a la policía un rato), más el dinero,
// las propinas y el combo. Sin DOM ni three: la pantalla lee `EVENTOS.estado()` y los sucesos que devuelve `paso`.
'use strict';
const EVENTOS = (() => {
  const K = TAXI.eventos, PR = TAXI.propinas;
  let salidas = [], activo = null, dinero = 0, combo = 1, comboN = 0, rivales = [], azar = mulberry32(11), ganado = 0;
  function crear(semilla) {
    azar = mulberry32((semilla || 0) + 11); activo = null; rivales = []; combo = 1; comboN = 0; ganado = 0;
    // las salidas del prototipo, en cruces concretos de la rejilla
    const n = (i, j) => CIUDAD.nodos[CIUDAD.nodoId(i, j)];
    salidas = [
      { tipo: 'turno', nodo: n(4, 4), nombre: 'PARADA DE TAXI' },
      { tipo: 'turno', nodo: n(1, 2), nombre: 'PARADA DE TAXI' },
      { tipo: 'sprint', nodo: n(5, 1), meta: n(1, 6), nombre: 'SPRINT: DEL CENTRO A LA MADRIGUERA' },
      { tipo: 'sprint', nodo: n(2, 6), meta: n(6, 2), nombre: 'SPRINT: LA VUELTA AL CENTRO' },
      { tipo: 'huida', nodo: n(6, 5), nombre: 'HUIDA: AGUANTA 60 SEGUNDOS' },
    ];
    for (const s of salidas) { s.x = s.nodo.x + (s.tipo === 'turno' ? 0 : 5); s.z = s.nodo.z - 5; }
  }
  const cerca = jugador => salidas.find(s => Math.hypot(s.x - jugador.x, s.z - jugador.z) < K.radio);

  function arrancar(s, jugador) {
    if (activo) return null;
    ganado = 0; combo = 1; comboN = 0;
    if (s.tipo === 'turno') { activo = { tipo: 'turno', reloj: TAXI.turno.inicio, viajes: 0 }; PASAJEROS.llenar(); }
    else if (s.tipo === 'sprint') {
      const ruta = CIUDAD.camino(s.nodo.id, s.meta.id);
      activo = { tipo: 'sprint', ruta, meta: s.meta, siguiente: 1, cuenta: 3, t: 0 };
      rivales = [];
      for (let i = 0; i < K.sprint.rivales; i++) {
        const r = CONDUCTOR.nuevo(ruta[0], ruta[1], lerp(K.sprint.vel[0], K.sprint.vel[1], azar()), { tipo: 'rival', color: [0xff4b5c, 0x7ee04a, 0x8a6fe0][i], siguiente: 1, llegado: 0, lado: [1.1, 0.55, -0.2][i] });
        r.ruta = ruta; r.ruta_i = 1; r.coche.x = s.nodo.x - 4 + i * 4; r.coche.z = s.nodo.z - 10 - (i % 2) * 5; r.coche.ang = jugador.ang;
        rivales.push(r);
      }
    } else if (s.tipo === 'huida') { activo = { tipo: 'huida', t: K.huida.dura }; POLICIA.poner(K.huida.nivel); }
    activo.nombre = s.nombre;
    return activo;
  }
  function suma(cuanto, etiqueta) { const n = Math.round(cuanto * combo); dinero += n; ganado += n; return { tipo: 'dinero', cuanto: n, etiqueta, combo }; }
  function propina(clase) { comboN++; if (comboN % PR.comboSube === 0) combo = Math.min(PR.comboMax, combo + 1); return suma(PR[clase] || 10, clase); }
  function corta() { combo = 1; comboN = 0; }
  function termina(como) { const r = { tipo: 'fin', evento: activo, como, ganado }; if (como === 'parado' || como === 'harto') { dinero -= ganado; r.perdido = ganado; } activo = null; rivales = []; PASAJEROS.vaciar(); return r; }

  // sucesos: dinero, fin, cuenta, meta…
  function paso(dt, mundo, jugador, otrosCoches) {
    const sucesos = [];
    if (!activo) return sucesos;
    if (activo.tipo === 'turno') {
      activo.reloj -= dt;
      for (const s of PASAJEROS.paso(dt, jugador, true)) {
        if (s.tipo === 'baja') { activo.reloj = Math.min(TAXI.turno.max, activo.reloj + s.segundos); activo.viajes++; sucesos.push(suma(s.dinero, s.etiqueta)); }
        sucesos.push(s);
      }
      if (activo.reloj <= 0) sucesos.push(termina('tiempo'));
    } else if (activo.tipo === 'sprint') {
      if (activo.cuenta > 0) { activo.cuenta -= dt; if (activo.cuenta <= 0) sucesos.push({ tipo: 'ya' }); for (const r of rivales) { r.coche.v = 0; } return sucesos; }
      activo.t += dt;
      const todos = rivales.map(r => r.coche).concat(otrosCoches, [jugador]);
      let puesto = 1;
      for (const r of rivales) {
        if (r.llegado) continue;
        // goma elástica: el que va detrás corre un poco más
        const miD = Math.hypot(r.coche.x - activo.meta.x, r.coche.z - activo.meta.z), tuD = Math.hypot(jugador.x - activo.meta.x, jugador.z - activo.meta.z);
        const extra = miD > tuD + 30 ? K.sprint.goma : miD < tuD - 30 ? -K.sprint.goma * 0.6 : 0;
        CONDUCTOR.paso(r, dt, mundo, todos, azar, { vmax: r.vel + extra, acel: 13 });
        COCHE.chocan(jugador, r.coche);
        if (miD < 10) { r.llegado = ++activo.llegados || (activo.llegados = 1); }
        else if (miD < tuD) puesto++;
      }
      activo.puesto = Math.min(puesto, (activo.llegados || 0) + 1 + rivales.filter(r => !r.llegado && Math.hypot(r.coche.x - activo.meta.x, r.coche.z - activo.meta.z) < Math.hypot(jugador.x - activo.meta.x, jugador.z - activo.meta.z)).length);
      // el siguiente cruce de la ruta (para pintar el camino)
      const prox = CIUDAD.nodos[activo.ruta[activo.siguiente]];
      if (prox && Math.hypot(prox.x - jugador.x, prox.z - jugador.z) < 9 && activo.siguiente < activo.ruta.length - 1) activo.siguiente++;
      if (Math.hypot(activo.meta.x - jugador.x, activo.meta.z - jugador.z) < 9) {
        const p = (activo.llegados || 0) + 1; activo.puestoFinal = p;
        sucesos.push(suma(K.sprint.premio[p - 1] || 0, 'PUESTO ' + p)); sucesos.push(termina('meta'));
      }
    } else if (activo.tipo === 'huida') {
      activo.t -= dt;
      if (POLICIA.nivel === 0) { sucesos.push(suma(K.huida.premio, 'HUIDA')); sucesos.push(termina('escapado')); }
      else if (activo.t <= 0) { POLICIA.poner(0); sucesos.push(suma(K.huida.premio, 'HUIDA')); sucesos.push(termina('aguantado')); }
    }
    return sucesos;
  }
  const estado = () => ({ activo, dinero, combo, comboN, ganado });
  return { crear, cerca, arrancar, paso, propina, corta, termina, estado, set dinero(v) { dinero = v; }, get dinero() { return dinero; }, get salidas() { return salidas; }, get rivales() { return rivales; }, get activo() { return activo; } };
})();
