// Fans Of Paperwork · dominio · TRITURADORA: el muro del juego. No se rompe: se atasca. Cada intento dura AJ.trituradora.intento segundos, en
// los que el equipo le echa documentos; entre uno y otro hay que esperar AJ.trituradora.espera (menos con Recuerdos). El atasco se acumula
// entre intentos; sus tragaderas se restan a cada vistazo (menos con guantes). Mientras dura el intento come munición (c.municion: los
// caducados y los expedientes de los documentos que elija el jugador), siempre la mejor primero: cuanto mejor es el bocado, más atasca; sin
// munición apenas se nota. Al llenar su capacidad se atasca un nivel: sube el tope de nivel, se libera una facción y da un punto de carrera.
'use strict';
PW.trituradora = (() => {
  const AJ = PW.AJ, C = PW.curvas, A = AJ.trituradora;
  const T = e => e.c.trituradora;
  const acabada = e => T(e).nivel >= A.niveles;
  const capacidad = e => C.capacidadTrituradora(T(e).nivel);
  const tragaderas = (e, B) => C.tragaderasTrituradora(T(e).nivel) * B.guantes;
  const atascando = e => T(e).intento > 0;
  const lista = e => !acabada(e) && !atascando(e) && T(e).espera <= 0;
  // lo que vale un bocado de cada munición
  const multiDoc = i => 1 + A.porDocumento * (i + 1);

  // la munición que hay, de mejor a peor: [{ i (documento, o -1 los caducados), hay, multi }]
  function municion(e) {
    const M = e.c.municion, lista = [];
    for (let i = PW.DOCUMENTOS.length - 1; i >= 0; i--) if (M.docs[i] && e.r.expedientes[i] >= 1) lista.push({ i, hay: Math.floor(e.r.expedientes[i]), multi: multiDoc(i) });
    if (M.caducados && e.r.caducados >= 1) lista.push({ i: -1, hay: Math.floor(e.r.caducados), multi: A.caducado });
    return lista.sort((a, b) => b.multi - a.multi);
  }
  // la máquina se come un bocado: el mejor que haya (y lo gasta). Devuelve lo que vale. Si el equipo no le hace nada (se lo traga todo),
  // no se gasta munición
  function come(e, B) {
    if (!B.abierto.sellos) return 1;   // hasta que se abre la munición, la máquina se atasca con lo que le echen
    const m = municion(e)[0];
    if (!m || atascoSeg(e, B) <= 0) return A.sinMunicion;
    if (m.i < 0) e.r.caducados--; else e.r.expedientes[m.i]--;
    return m.multi;
  }
  // empieza un intento. Resultado: PW.ok(segundos) o 'acabada' / 'atascando' / 'esperando' (con los segundos que faltan)
  function atasca(e, B) {
    if (acabada(e)) return PW.error('acabada');
    if (atascando(e)) return PW.error('atascando');
    if (T(e).espera > 0) return PW.error('esperando', { falta: T(e).espera });
    T(e).intento = A.intento;
    T(e).espera = A.espera * B.espera;
    T(e).hambre = 0;
    T(e).multi = come(e, B);
    return PW.ok(T(e).intento);
  }
  // atasco por segundo del equipo con un bocado que vale 1: el líder y los trabajadores, menos las tragaderas en cada vistazo
  function atascoSeg(e, B) {
    const traga = tragaderas(e, B);
    const lider = Math.max(0, B.dano * B.trit - traga) * B.vistazosSeg;
    const equipo = Math.max(0, B.dano * B.trab * B.trit - traga) * AJ.trabajador.vistazosSeg * B.trabajadores;
    return lider + equipo;
  }
  // lo que haría un intento entero con la munición de ahora (sin gastarla): { atasco, multi (el valor medio del bocado), bocados }
  function prevision(e, B) {
    const bocados = Math.ceil(A.bocadosSeg * A.intento);
    if (!B.abierto.sellos) return { atasco: atascoSeg(e, B) * A.intento, multi: 1, bocados };
    let falta = bocados, suma = 0;
    for (const m of municion(e)) { const usa = Math.min(falta, m.hay); suma += usa * m.multi; falta -= usa; }
    const multi = (suma + falta * A.sinMunicion) / bocados;
    return { atasco: atascoSeg(e, B) * A.intento * multi, multi, bocados };
  }
  function atascaNivel(e, sucesos) {
    const t = T(e);
    t.atasco = 0;
    t.nivel++;
    t.intento = 0;
    t.espera = 0;   // el siguiente nivel se puede intentar ya
    const oro = A.premioOro * t.nivel, libera = PW.FACCIONES[t.nivel];   // el último nivel ya no libera a nadie
    const grapas = PW.AJ.grapas.porNivel * t.nivel;   // jugar bien también da grapas de oro, no solo esperar paquetes
    e.r.oro += oro;
    e.c.grapas += grapas;
    sucesos.push({ t: 'trituradora', nivel: t.nivel, oro, grapas, faccion: libera ? libera.fac : null });
  }
  // avanza dt segundos: corre el intento en curso (y la espera, siempre)
  function avanza(e, B, dt, sucesos) {
    const t = T(e);
    t.espera = Math.max(0, t.espera - dt);
    if (!atascando(e)) return;
    const paso = Math.min(dt, t.intento);
    t.intento -= paso;
    t.atasco += atascoSeg(e, B) * paso * t.multi;
    t.hambre += A.bocadosSeg * paso;
    if (t.atasco >= capacidad(e)) return atascaNivel(e, sucesos);
    // el bocado siguiente solo se come si queda intento para aprovecharlo
    while (t.hambre >= 1) { t.hambre -= 1; if (t.intento > 0) t.multi = come(e, B); }
    if (t.intento <= 0) sucesos.push({ t: 'intento-fin', parte: t.atasco / capacidad(e) });
  }
  // el jugador empuja con el dedo durante el intento: un vistazo del líder contra la máquina, con el bocado que tenga en la boca.
  // Resultado: PW.ok(lo que atasca), 'esperando' (no hay intento en marcha) o 'sin-fuerza' (se lo traga todo: se ve, pero no cuenta)
  function empuja(e, B, sucesos) {
    if (!atascando(e)) return PW.error('esperando');
    const t = T(e), d = Math.max(0, B.dano * B.trit - tragaderas(e, B)) * t.multi;
    sucesos.push({ t: 'empujon', d });
    if (!(d > 0)) return PW.error('sin-fuerza');
    t.atasco += d;
    if (t.atasco >= capacidad(e)) atascaNivel(e, sucesos);
    return PW.ok(d);
  }
  // avanzar la espera sin atascar (horas extra)
  const pasaEspera = (e, dt) => { T(e).espera = Math.max(0, T(e).espera - dt); };
  // elegir qué se le echa: cual = 'caducados' o el índice de un documento. Resultado: PW.ok(si queda puesto) o 'desconocido'
  function fijaMunicion(e, cual, si) {
    const M = e.c.municion;
    if (cual === 'caducados') { M.caducados = !!si; return PW.ok(M.caducados); }
    if (!(Number.isInteger(cual) && cual >= 0 && cual < PW.DOCUMENTOS.length)) return PW.error('desconocido', { cual });
    M.docs[cual] = !!si;
    return PW.ok(M.docs[cual]);
  }

  return { empuja, atasca, avanza, atascoSeg, prevision, municion, multiDoc, capacidad, tragaderas, lista, atascando, acabada, pasaEspera, fijaMunicion };
})();
