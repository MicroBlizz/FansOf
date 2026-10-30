// Fans Of Taxi · ADAPTADOR del coche a Rapier: la física de verdad del coche del jugador. Una carrocería (un cuerpo rígido) con cuatro
// ruedas de rayo y suspensión (el controlador de vehículos de Rapier): sube cuestas, se inclina en las curvas, salta y vuelca de
// verdad, y choca con lo mismo que se ve (js/fisica/formas.js).
//
// El resto del juego no sabe nada de Rapier: sigue leyendo y escribiendo el mismo coche de siempre (x, y, z, ang, v, vl, aire,
// nitro...). Cada paso, este adaptador mira si alguien lo ha movido desde fuera (reaparecer, un choque con el tráfico, el rescate del
// agua) y se lo pasa a Rapier; luego aplica los mandos, avanza la física y vuelve a escribir el coche. Las cifras del manejo son las de
// TAXI.coche (aceleración, velocidad máxima, nitro, suelos) y las del chasis, TAXI.fisica.
'use strict';
const COCHE_RAPIER = (() => {
  const K = TAXI.coche, F = TAXI.fisica;
  const DELANTE = 0, DETRAS = 2;   // las ruedas 0 y 1 son las delanteras; 2 y 3, las traseras
  // dónde queda el suelo respecto al centro del cuerpo, con el coche quieto en llano: anclaje + suspensión algo comprimida + rueda
  const ALTO = -F.ruedaY + F.suspension * 0.8 + F.radioRueda;

  // --- cuaterniones y vectores (Rapier los da como { x, y, z, w })
  function rota(q, v) {
    const ix = q.w * v.x + q.y * v.z - q.z * v.y, iy = q.w * v.y + q.z * v.x - q.x * v.z, iz = q.w * v.z + q.x * v.y - q.y * v.x, iw = -q.x * v.x - q.y * v.y - q.z * v.z;
    return { x: ix * q.w + iw * -q.x + iy * -q.z - iz * -q.y, y: iy * q.w + iw * -q.y + iz * -q.x - ix * -q.z, z: iz * q.w + iw * -q.z + ix * -q.y - iy * -q.x };
  }
  const deGiro = ang => ({ x: 0, y: Math.sin(ang / 2), z: 0, w: Math.cos(ang / 2) });
  const punto = (x, y, z) => ({ x, y, z });

  function crear(fisica, c) {
    const { R, mundo } = fisica;
    const cuerpo = mundo.createRigidBody(R.RigidBodyDesc.dynamic().setTranslation(c.x, c.y + ALTO + 0.2, c.z).setRotation(deGiro(c.ang)).setCanSleep(false).setCcdEnabled(true));
    // la inercia de una caja de esa masa, algo mayor de lado y de frente: el coche cabecea y se balancea, pero cuesta volcarlo
    const [a, b, l] = F.caja.map(m => m * 2), m = F.masa;
    const inercia = punto(m * (b * b + l * l) / 12 * 1.6, m * (a * a + l * l) / 12, m * (a * a + b * b) / 12 * 1.6);
    mundo.createCollider(R.ColliderDesc.cuboid(...F.caja).setTranslation(0, F.cajaAlto, 0).setMassProperties(m, punto(0, F.centroMasas, 0), inercia, { x: 0, y: 0, z: 0, w: 1 }).setFriction(0.2).setRestitution(0.05), cuerpo);
    const control = mundo.createVehicleController(cuerpo);
    control.indexUpAxis = 1; control.setIndexForwardAxis = 2;   // arriba es +y y adelante +z, como en el resto del juego
    const [ax, az] = F.ruedas;
    for (const [x, z] of [[-ax, az], [ax, az], [-ax, -az], [ax, -az]]) {
      control.addWheel(punto(x, F.ruedaY, z), punto(0, -1, 0), punto(-1, 0, 0), F.suspension, F.radioRueda);
      const i = control.numWheels() - 1;
      control.setWheelMaxSuspensionTravel(i, F.recorrido);
      control.setWheelSuspensionStiffness(i, F.dureza);
      control.setWheelSuspensionCompression(i, F.amortigua[0]);
      control.setWheelSuspensionRelaxation(i, F.amortigua[1]);
      control.setWheelFrictionSlip(i, F.agarre);
      control.setWheelSideFrictionStiffness(i, F.agarreLado);
      control.setWheelMaxSuspensionForce(i, m * K.gravedad * 4);
    }
    const v = { fisica, cuerpo, control, foto: null, enSuelo: true, aireT: 0, rampa: null };
    escribe(v, c);
    return v;
  }

  // --- si alguien ha movido el coche desde fuera (reaparecer, el rescate del agua, un choque con otro coche), Rapier se entera
  function siHaCambiado(v, c) {
    const f = v.foto; if (!f) return;
    const mueve = Math.hypot(c.x - f.x, c.z - f.z), gira = Math.abs(c.ang - f.ang) > 1e-6;
    if (mueve > 3 || gira || Math.abs(c.y - f.y) > 3) return recoloca(v, c);
    if (mueve > 1e-6 || Math.abs(c.v - f.v) > 1e-6 || Math.abs(c.vl - f.vl) > 1e-6) {   // un empujón: se desplaza y cambia de velocidad, sin girar
      const p = v.cuerpo.translation(), vel = v.cuerpo.linvel(), s = Math.sin(c.ang), co = Math.cos(c.ang);
      v.cuerpo.setTranslation(punto(p.x + c.x - f.x, p.y, p.z + c.z - f.z), true);
      v.cuerpo.setLinvel(punto(s * c.v + co * c.vl, vel.y, co * c.v - s * c.vl), true);
    }
  }
  function recoloca(v, c) {   // de pie, en el sitio y con la velocidad que diga el coche
    const s = Math.sin(c.ang), co = Math.cos(c.ang);
    c.aire = false; v.aireT = 0; v.volcadoT = 0;
    v.cuerpo.setTranslation(punto(c.x, c.y + ALTO + 0.2, c.z), true);
    v.cuerpo.setRotation(deGiro(c.ang), true);
    v.cuerpo.setLinvel(punto(s * c.v + co * c.vl, c.vy || 0, co * c.v - s * c.vl), true);
    v.cuerpo.setAngvel(punto(0, 0, 0), true);
    v.foto = { x: c.x, y: c.y, z: c.z, ang: c.ang, v: c.v, vl: c.vl };
  }
  // volcado (o de lado) y casi parado un par de segundos: se pone de pie donde está, como en cualquier juego de coches
  function siVolcado(v, c, dt) {
    const q = v.cuerpo.rotation(), arriba = 1 - 2 * (q.x * q.x + q.z * q.z);
    v.volcadoT = arriba < 0.3 && Math.hypot(c.v, c.vl) < 3 ? (v.volcadoT || 0) + dt : 0;
    if (v.volcadoT > F.volcado) { c.v = 0; c.vl = 0; c.vy = 0; c.y = CIUDAD.altura(c.x, c.z, c.y); recoloca(v, c); }
  }

  // --- los mandos: motor, freno, marcha atrás, dirección, derrape y nitro (las cifras de TAXI.coche, como el coche arcade)
  function mandos(v, c, e, dt, S) {
    const { control, cuerpo } = v, avance = c.v;
    c.usandoNitro = !!(e.nitro && c.nitro > 0 && avance > 1);
    if (c.usandoNitro) c.nitro = Math.max(0, c.nitro - K.nitroGasto * dt);
    else if (avance > K.vmax * K.nitroVelocidad.desde) c.nitro = Math.min(1, c.nitro + K.nitroVelocidad.carga * dt);
    const vmax = (c.usandoNitro ? K.vmaxNitro : K.vmax) * S[0];
    let empuje = e.gas * K.acel + (c.usandoNitro ? K.nitroAcel : 0), freno = 0;
    if (e.freno > 0) {
      if (avance > 0.5) freno = F.frenoFuerza * e.freno;
      else if (!e.gas && avance > -K.marchaAtras) empuje = -K.acel * 0.6 * e.freno;   // marcha atrás
    } else if (!e.gas && Math.abs(avance) > 0.2) freno = F.frenoFuerza * 0.1;   // el motor retiene
    if (avance > vmax) empuje = Math.min(empuje, 0);
    // la fuerza de cada rueda motriz (tracción a las cuatro: así no se encabrita): masa · aceleración repartida
    const fuerza = F.masa * empuje / 4;
    for (let i = 0; i < 4; i++) { control.setWheelEngineForce(i, fuerza); control.setWheelBrake(i, freno); }
    // dirección: mucho parado, menos cuanto más rápido (a giroCae ya es la mitad); el derrape gira más
    const quiereDerrape = e.freno > 0 && Math.abs(e.giro) > 0.3 && avance > K.derrapeMin;
    if (quiereDerrape && !c.derrapando) v.sucesos.push('derrape-empieza');
    // una vez cruzado, el derrape sigue mientras se mantenga el volante hacia el mismo lado (sin freno): así se encadenan curvas
    const sigueDerrape = c.derrapando && Math.abs(e.giro) > 0.3 && Math.sign(e.giro) === c.ladoDerrape && ((c.derrapeT || 0) < F.derrapeSigue || Math.abs(c.vl) > 1) && avance > K.derrapeMin * 0.7;
    if (quiereDerrape && !c.derrapando) c.ladoDerrape = Math.sign(e.giro);
    c.derrapando = quiereDerrape || sigueDerrape;
    const angulo = e.giro * F.giroMax / (1 + Math.max(0, avance) / F.giroCae) * (c.derrapando ? K.derrapeGiro : 1);
    c.giroRuedas = lerp(c.giroRuedas || 0, angulo, Math.min(1, 12 * dt));
    for (let i = DELANTE; i < DELANTE + 2; i++) control.setWheelSteering(i, c.giroRuedas);
    // agarre: el del suelo; derrapando, las traseras patinan (el freno apenas frena: sirve para cruzar el coche, no para pararlo)
    const agarre = F.agarre * (S[2] === undefined ? 1 : S[2]);
    for (let i = 0; i < 4; i++) control.setWheelFrictionSlip(i, i >= DETRAS && c.derrapando ? F.agarreDerrape * (S[2] === undefined ? 1 : S[2]) : agarre);
    if (c.derrapando) { for (let i = 0; i < 4; i++) control.setWheelBrake(i, i < DETRAS ? freno * F.frenoDerrape : 0); c.nitro = Math.min(1, c.nitro + K.nitroCarga.derrape * dt); c.derrapeT = (c.derrapeT || 0) + dt; } else c.derrapeT = 0;
    // el rozamiento del aire y del suelo (TAXI.coche.rozamiento y el freno de cada suelo), y por encima de la velocidad máxima frena
    const vel = cuerpo.linvel(), roza = (K.rozamiento + S[1]) * dt + (avance > vmax ? (avance - vmax) / Math.max(avance, 1) * 2 * dt : 0);
    cuerpo.applyImpulse(punto(-vel.x * roza * F.masa, 0, -vel.z * roza * F.masa), true);
  }

  // --- ayudas de arcade: carga contra el suelo, menos balanceo con las ruedas abajo, y en el aire se endereza solo
  function ayudas(v, c, e, dt, enSuelo) {
    const { cuerpo } = v, q = cuerpo.rotation(), w = cuerpo.angvel(), arriba = rota(q, punto(0, 1, 0)), adelante = rota(q, punto(0, 0, 1));
    if (enSuelo) {
      const apoyo = F.apoyo * c.v * c.v * dt;
      cuerpo.applyImpulse(punto(-arriba.x * apoyo, -arriba.y * apoyo, -arriba.z * apoyo), true);
      const balanceo = w.x * adelante.x + w.y * adelante.y + w.z * adelante.z, quita = balanceo * Math.min(1, F.estabiliza * dt);
      // y el coche no hace trompos: el giro sobre sí mismo tiene un tope; derrapando, lo lleva el volante (cruzarse, aguantar,
      // y al soltar se endereza)
      let gy = clamp(w.y - adelante.y * quita, -F.giroTope, F.giroTope);
      if (c.derrapando) gy = lerp(gy, e.giro * F.giroDerrape, Math.min(1, F.derrapeMando * dt));
      v.giroQuerido = c.derrapando ? e.giro * F.giroDerrape : null;
      cuerpo.setAngvel(punto(w.x - adelante.x * quita, gy, w.z - adelante.z * quita), true);
    } else {
      // par que lleva «arriba» hacia el cielo: arriba × (0, 1, 0)
      const k = F.nivela * dt;
      cuerpo.setAngvel(punto(w.x * (1 - k * 0.3) - arriba.z * k, w.y, w.z * (1 - k * 0.3) + arriba.x * k), true);
    }
  }

  // derrapar es para ir rápido de lado, no para frenar: las ruedas de lado se comen mucha velocidad y se devuelve casi toda
  // (la dirección la pone la física; solo cambia cuánto corre)
  // `minima`: con gas, la rapidez que se garantiza (la de antes del paso menos derrapePierde): las traseras patinan y casi no empujan
  function conservaDerrape(v, antes, dt, minima) {
    const vel = v.cuerpo.linvel(), ahora = Math.hypot(vel.x, vel.z), previa = Math.hypot(antes.x, antes.z);
    if (ahora < 1) return;
    const rapidez = Math.max(minima, ahora >= previa ? ahora : ahora + (previa - ahora) * F.derrapeConserva);
    // la marcha sigue al morro con retraso (el coche va cruzado), pero nunca más cruzada que derrapeAngulo: así el derrape se
    // aguanta mientras se lleve el volante, en vez de acabar en un trompo o enderezarse solo
    const q = v.cuerpo.rotation(), adelante = rota(q, punto(0, 0, 1)), morro = Math.atan2(adelante.x, adelante.z);
    let rumbo = Math.atan2(antes.x, antes.z), dif = angulo(morro - rumbo);   // desde la marcha de antes del paso: las ruedas la enderezarían de golpe
    rumbo += Math.sign(dif) * Math.min(Math.abs(dif), F.derrapeRumbo * dt);
    dif = angulo(morro - rumbo);
    if (Math.abs(dif) > F.derrapeAngulo) rumbo = morro - Math.sign(dif) * F.derrapeAngulo;
    v.cuerpo.setLinvel(punto(Math.sin(rumbo) * rapidez, vel.y, Math.cos(rumbo) * rapidez), true);
    // y el morro gira lo que pide el volante (sin el empujón de las ruedas, que lo pasaba de vueltas)
    if (v.giroQuerido !== null) { const w = v.cuerpo.angvel(); v.cuerpo.setAngvel(punto(w.x, v.giroQuerido, w.z), true); }
  }
  const angulo = a => Math.atan2(Math.sin(a), Math.cos(a));   // entre -π y π

  // --- después de la física: el coche de siempre a partir del cuerpo de Rapier
  function escribe(v, c) {
    const { cuerpo, control } = v, p = cuerpo.translation(), q = cuerpo.rotation(), vel = cuerpo.linvel();
    const arriba = rota(q, punto(0, 1, 0)), adelante = rota(q, punto(0, 0, 1));
    // el coche está donde tocaría el suelo bajo la carrocería (ahí pone la pantalla su malla)
    c.x = p.x - arriba.x * ALTO; c.y = p.y - arriba.y * ALTO; c.z = p.z - arriba.z * ALTO;
    c.ang = Math.atan2(adelante.x, adelante.z);
    const s = Math.sin(c.ang), co = Math.cos(c.ang);
    c.v = vel.x * s + vel.z * co; c.vl = vel.x * co - vel.z * s; c.vy = vel.y;
    c.rot = { x: q.x, y: q.y, z: q.z, w: q.w };
    c.pendiente = adelante.y / Math.max(0.1, Math.hypot(adelante.x, adelante.z));
    c.giro = cuerpo.angvel().y;
    let ruedas = 0; for (let i = 0; i < 4; i++) if (control.wheelIsInContact(i)) ruedas++;
    c.ruedasEnSuelo = ruedas;
    v.foto = { x: c.x, y: c.y, z: c.z, ang: c.ang, v: c.v, vl: c.vl };
  }

  // un paso: entrada { giro, gas, freno, nitro } como el coche arcade. Devuelve los sucesos (choque, roce-muro, salta, aterriza, agua)
  function paso(v, c, e, dt, mundo) {
    v.sucesos = [];
    siHaCambiado(v, c);
    FISICA_RAPIER.actualizar(c.x, c.z);
    const S = K.suelos[c.suelo] || K.suelos.asfalto;
    const inicio = v.cuerpo.linvel();
    mandos(v, c, e, dt, S);
    // las rampas de salto dan el mismo impulso que en el coche arcade (la cuña sola apenas levanta)
    if (!c.aire && c.v > 8 && mundo.rampas) for (const rp of mundo.rampas) if (rp !== v.rampa && COCHE.enRampa(c, rp)) {
      const vel = v.cuerpo.linvel(); v.cuerpo.setLinvel(punto(vel.x, Math.max(vel.y, c.v * K.salto), vel.z), true);
      v.rampa = rp; c.nitro = Math.min(1, c.nitro + K.nitroCarga.salto); v.sucesos.push('salta'); break;
    }
    ayudas(v, c, e, dt, !c.aire);
    const antes = Math.hypot(c.v, c.vl), velAntes = v.cuerpo.linvel();
    v.control.updateVehicle(dt);
    FISICA_RAPIER.paso();
    if (c.derrapando && !c.aire) conservaDerrape(v, velAntes, dt, e.gas ? Math.hypot(inicio.x, inicio.z) * (1 - F.derrapePierde * dt) : 0);
    escribe(v, c);
    // en el aire si ninguna rueda toca (con un poco de margen: un bache no es un salto)
    const aire = c.ruedasEnSuelo === 0;
    v.aireT = aire ? v.aireT + dt : 0;
    if (!c.aire && v.aireT > 0.15) c.aire = true;
    else if (c.aire && !aire) { c.aire = false; v.rampa = null; v.sucesos.push('aterriza'); }
    // un choque: la velocidad de lado a lado cae de golpe en un paso (los mandos no pueden quitar tanto)
    const vel = v.cuerpo.linvel(), golpe = Math.hypot(vel.x - velAntes.x, vel.z - velAntes.z);
    if (golpe > F.golpe && antes > 3) {
      c.golpe = antes;
      if (antes > K.choqueFuerte && (c.choqueT || 0) <= 0) { c.choqueT = 0.8; v.sucesos.push('choque'); } else v.sucesos.push('roce-muro');
    } else c.golpe = 0;
    c.choqueT = Math.max(0, (c.choqueT || 0) - dt);
    c.suelo = mundo.suelo ? mundo.suelo(c.x, c.z, c.y) : 'asfalto';
    if (c.suelo === 'agua' && !c.aire) v.sucesos.push('agua');
    siVolcado(v, c, dt);
    return v.sucesos;
  }

  return { crear, paso, recoloca, ALTO };
})();
