// Fans of Pinball · dominio · SALAS: qué trae cada planta (la tabla de la curva, la sala tesoro, el jefe y la regla para seguir del sin
// fin) y el generador con semilla que coloca dianas (setas en el código), vasijas, cofres y enemigos SOLO en el centro libre de cada
// nivel, sin solaparse nunca con el decorado fijo (paredes, palas, máquinas de café, boca del ascensor, puerta de la tienda, salidas) ni
// entre sí (PB.mesa.libre). Las posiciones fijas de una plantilla que no quepan se cambian por una al azar que sí quepa. Cada sala trae
// además el estado de su decorado: luces de las máquinas (que se retiran en la planta del jefe) y rebotadores, y la persiana de la tienda.
'use strict';
PB.salas = (() => {
  const INTENTOS = 600;
  const esJefe = (pl, planta) => planta % pl.jefeCada === 0;
  // la fila de la curva para una planta (planta > 9: regla para seguir)
  function fila(reglas, planta) {
    const pl = reglas.plantas, sg = pl.seguir, ultima = pl.tabla.length;
    const extra = Math.max(0, planta - ultima);
    const vida = Math.pow(1 + sg.vidaPorPlanta, extra);
    if (esJefe(pl, planta)) {
      const vez = planta / pl.jefeCada;
      return { tipo: 'jefe', vasijas: 0, cofres: 0, enemigos: 0, escalera: 100, vida, jefeVida: reglas.puntos.cosas.jefe.vida * Math.pow(1 + sg.jefeVidaSube, vez - 1) };
    }
    if (planta <= ultima) { const f = pl.tabla[planta - 1]; return { ...f, tipo: f.tesoro ? 'tesoro' : 'normal', vida }; }
    if (planta % pl.tesoroCada === 0) return { ...pl.tabla[pl.tesoroCada - 1], tipo: 'tesoro', nuevo: null, vida };
    const enemigos = Math.min(sg.enemigosTope, pl.tabla[ultima - 1].enemigos + Math.floor(extra / sg.enemigosCada));
    return { ...pl.tabla[ultima - 1], enemigos, nuevo: null, tipo: 'normal', vida };
  }
  // los tipos de becario que ya han salido en esta planta
  function tipos(reglas, planta) {
    const pl = reglas.plantas, hasta = Math.min(planta, pl.tabla.length);
    return pl.tabla.slice(0, hasta).map(f => f.nuevo).filter(Boolean);
  }
  // segundos que da entrar en la escalera de esta planta
  function segundosEscalera(reglas, planta) {
    const sg = reglas.plantas.seguir, extra = Math.max(0, planta - reglas.plantas.tabla.length);
    return Math.max(sg.escaleraMinimo, reglas.reloj.escalera - Math.floor(extra / sg.escaleraBajaCada));
  }
  const CANDIDATOS = 40;
  // un sitio libre al azar dentro de la zona (null si no hay): de unos cuantos sitios libres al azar, el más bajo, para que las cosas se
  // apiñen como en una estantería y quepan más sin dejar huecos donde la bola se quede apoyada
  function sitio(mesa, zona, r, cosas, azar, hueco = mesa.reglas.margen) {
    let mejor = null;
    for (let i = 0, n = 0; i < INTENTOS && n < CANDIDATOS; i++) {
      const x = azar.entre(zona.x0, zona.x1), y = azar.entre(zona.y0, zona.y1);
      if (!PB.mesa.libre(mesa, x, y, r, cosas, hueco)) continue;
      n += 1;
      if (!mejor || y > mejor[1]) mejor = [x, y];
    }
    return mejor;
  }
  const OTRO = { arriba: 'abajo', abajo: 'arriba' };
  // un sitio libre en el nivel pedido o, si ya no cabe nada ahí (el de arriba es pequeño: lo llenan las máquinas de café), en el otro
  function sitioEn(mesa, zonas, nivel, r, cosas, azar, hueco = mesa.reglas.margen) {
    return sitio(mesa, zonas[nivel], r, cosas, azar, hueco) || sitio(mesa, zonas[OTRO[nivel]], r, cosas, azar, hueco);
  }
  // el sitio fijo si cabe; si no, uno al azar en el nivel del sitio fijo (o en el otro)
  function fijoOAzar(mesa, punto, r, cosas, azar) {
    if (punto && PB.mesa.libre(mesa, punto[0], punto[1], r, cosas, mesa.reglas.margen)) return punto;
    const nivel = punto ? PB.mesa.nivelDe(mesa.reglas, punto[1]) : 'arriba';
    return sitioEn(mesa, mesa.reglas.zonas, nivel, r, cosas, azar);
  }
  const nuevaCosa = (sala, datos) => ({ id: sala.siguienteId++, vivo: true, ...datos });
  function ponSetas(sala, mesa, reglas, plantilla, cosas, azar) {
    const r = reglas.plantas.radioSeta;
    for (const p of plantilla.abajo.concat(plantilla.arriba)) {
      const xy = fijoOAzar(mesa, p, r, cosas, azar);
      if (xy) { const s = nuevaCosa(sala, { tipo: 'seta', x: xy[0], y: xy[1], r }); sala.setas.push(s); cosas.push(s); }
    }
  }
  function rompible(sala, reglas, tipo, xy, cosas) {
    const c = reglas.puntos.cosas[tipo];
    const r = tipo === 'cofre' ? reglas.plantas.radioCofre : reglas.plantas.radioVasija;
    const o = nuevaCosa(sala, { tipo, x: xy[0], y: xy[1], r, vida: c.vida, vidaMax: c.vida });
    sala.rompibles.push(o); cosas.push(o);
  }
  // cofres: el primero en el camino de la rampa (nivel de abajo); el resto, arriba (espec.: «la mayoría de cofres» arriba)
  function ponCofres(sala, mesa, reglas, plantilla, n, cosas, azar) {
    const r = reglas.plantas.radioCofre;
    for (let i = 0; i < n; i++) {
      const xy = i === 0 ? fijoOAzar(mesa, plantilla.cofreRampa, r, cosas, azar) : sitioEn(mesa, mesa.reglas.zonas, 'arriba', r, cosas, azar);
      if (xy) rompible(sala, reglas, 'cofre', xy, cosas);
    }
  }
  // vasijas: en la planta 1 las tres primeras justo encima de las palas (primer minuto); el resto, mitad arriba y mitad abajo
  function ponVasijas(sala, mesa, reglas, n, cosas, azar) {
    const r = reglas.plantas.radioVasija, fijas = sala.planta === 1 ? mesa.reglas.primerasVasijas : [];
    for (let i = 0; i < n; i++) {
      const nivel = i % 2 ? 'abajo' : 'arriba';
      const xy = i < fijas.length ? fijoOAzar(mesa, fijas[i], r, cosas, azar) : sitioEn(mesa, mesa.reglas.zonas, nivel, r, cosas, azar);
      if (xy) rompible(sala, reglas, 'vasija', xy, cosas);
    }
  }
  // un becario del tipo dado en la zona de enemigos de ese nivel (null si no cabe)
  function enemigo(sala, mesa, reglas, tipo, nivel, vida, cosas, azar) {
    const re = reglas.enemigos, c = reglas.puntos.cosas[tipo];
    const xy = sitioEn(mesa, re.zonas, nivel, re.radio, cosas, azar, re.hueco);
    if (!xy) return null;
    nivel = PB.mesa.nivelDe(mesa.reglas, xy[1]);   // si no cabía en su nivel, anda por el otro
    const casco = Math.round((c.casco || 0) * vida);
    const o = nuevaCosa(sala, { tipo, nivel, x: xy[0], y: xy[1], r: re.radio, vida: Math.round(c.vida * vida), casco, cascoMax: casco, dir: azar.pasa(0.5) ? 1 : -1, reloj: 0 });
    o.vidaMax = o.vida;
    sala.enemigos.push(o); cosas.push(o);
    return o;
  }
  function ponEnemigos(sala, mesa, reglas, f, opciones, cosas, azar) {
    const n = Math.round(f.enemigos * (opciones.menosEnemigos ? 1 - reglas.plantas.ayuda : 1));
    const lista = tipos(reglas, sala.planta);
    for (let i = 0; i < n; i++) {
      const tipo = i === 0 && f.nuevo ? f.nuevo : azar.elige(lista);
      enemigo(sala, mesa, reglas, tipo, i % 2 ? 'abajo' : 'arriba', f.vida, cosas, azar);
    }
  }
  // la sala de una planta. opciones: { menosEnemigos } (ayuda que se adapta)
  function crea(reglas, mesa, planta, modo, azar, opciones = {}) {
    const f = fila(reglas, planta), pl = reglas.plantas;
    const iPlantilla = modo === 'historia' ? (planta - 1) % pl.plantillas.length : azar.entero(0, pl.plantillas.length - 1);
    const sala = { planta, tipo: f.tipo, plantilla: iPlantilla, rompibles: [], enemigos: [], setas: [], jefe: null, siguienteId: 1,
      umbral: f.escalera, vida: f.vida, total: 0, vencidos: 0, abierta: false, tiempo: 0, salvavidas: 0,
      maquinas: f.tipo === 'jefe' ? [] : mesa.maquinas.map(m => ({ ...m, tipo: 'maquina', luz: 0, espera: 0 })),   // en la del jefe se retiran
      rebotadores: mesa.reglas.rebotadores.map(r => ({ lado: r.lado, luz: 0, espera: 0 })), tienda: 'lista', avisoTienda: -99 };
    const cosas = [];
    if (f.tipo === 'jefe') { sala.jefe = PB.jefe.crea(reglas, f.jefeVida); cosas.push(sala.jefe, ...sala.jefe.cajas); }
    ponSetas(sala, mesa, reglas, pl.plantillas[iPlantilla], cosas, azar);
    ponVasijas(sala, mesa, reglas, f.vasijas, cosas, azar);
    ponCofres(sala, mesa, reglas, pl.plantillas[iPlantilla], f.cofres, cosas, azar);
    ponEnemigos(sala, mesa, reglas, f, opciones, cosas, azar);
    sala.total = sala.rompibles.length + sala.enemigos.length;
    return sala;
  }
  return { fila, tipos, segundosEscalera, crea, enemigo, esJefe };
})();
