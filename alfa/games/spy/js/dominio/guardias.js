// Fans of Spy · DOMINIO · Los vigías: qué hace un guardia (un Becario) en su turno según su estado y qué hace una cámara.
// Estados de un guardia: tranquilo (azul: patrulla o guarda su puesto), sospecha (amarillo: va a mirar una casilla), mira (amarillo:
// otea el sitio), vuelve (azul: regresa a lo suyo), alerta (rojo: va a por el agente), cafe (parado bebiendo, no mira) y derribado.
// Todas las funciones reciben el contexto `c` = { aj, planta, p (la partida), azar } y apuntan lo que pasa en p.eventos.
'use strict';
var SPY = globalThis.SPY || (globalThis.SPY = {});
(function (S) {
  const R = S.rejilla, V = S.vision;
  const CALMA = ['tranquilo', 'vuelve'], ATENTOS = ['tranquilo', 'vuelve', 'sospecha', 'mira'];
  const ev = (c, t, datos) => { c.p.eventos.push({ t, ...datos }); };
  const activo = (g) => g.estado !== 'derribado' && g.estado !== 'cafe';
  const ojos = (aj, g) => ({ x: g.x, y: g.y, dir: g.dir, alcance: aj.guardias[g.tipo].alcance, apertura: aj.guardias[g.tipo].apertura });
  const ojosCamara = (aj, cam) => ({ x: cam.x, y: cam.y, dir: cam.dirs[cam.i], alcance: aj.camara.alcance, apertura: aj.camara.apertura });

  // Los que miran ahora mismo (guardias en pie y cámaras), cada uno con sus ojos: [{ id, clase, ojos }].
  function vigias(c) {
    const lista = c.p.guardias.filter(activo).map((g) => ({ id: g.id, clase: 'guardia', ojos: ojos(c.aj, g) }));
    return lista.concat(c.p.camaras.map((cam) => ({ id: cam.id, clase: 'camara', ojos: ojosCamara(c.aj, cam) })));
  }
  // Los vigías que ven una casilla (sin contar si el agente está escondido): para avisar antes de pisarla.
  const quienVe = (c, celda) => vigias(c).filter((v) => V.ve(c.planta, v.ojos, celda)).map((v) => v.id);
  const vistoAhora = (c) => !c.p.agente.oculto && quienVe(c, c.p.agente).length > 0;

  function ponEstado(c, g, estado) { g.estado = estado; ev(c, 'estado', { quien: g.id, estado }); }

  // Salta la alerta roja (o se renueva, y su cuenta atrás vuelve a empezar): todos los guardias en pie van a por el agente, a la
  // casilla donde lo han visto.
  function alarma(c, quien) {
    const p = c.p, renueva = p.alerta.activa && p.alerta.turnos !== c.aj.alerta.turnos;
    if (!p.alerta.activa) { p.cuenta.alertas++; ev(c, 'alerta', { quien }); }
    p.alerta = { activa: true, turnos: c.aj.alerta.turnos, visto: { x: p.agente.x, y: p.agente.y } };
    if (renueva) ev(c, 'cuenta', { turnos: p.alerta.turnos });
    for (const g of p.guardias) if (g.estado !== 'derribado' && g.estado !== 'alerta') ponEstado(c, g, 'alerta');
  }
  // Se acaba la alerta: los guardias vuelven a lo suyo.
  function calma(c) {
    c.p.alerta = { activa: false, turnos: 0, visto: null };
    ev(c, 'calma', {});
    for (const g of c.p.guardias) if (g.estado === 'alerta') ponEstado(c, g, 'vuelve');
  }
  // ¿Estos ojos ven al agente? Si lo ven, salta la alarma.
  function miraAgente(c, id, o) {
    if (c.p.agente.oculto || !V.ve(c.planta, o, c.p.agente)) return false;
    alarma(c, id);
    return true;
  }
  // Tras un paso del agente: ¿lo ve alguien en la casilla que pisa?
  function trasPasoDelAgente(c) {
    for (const v of vigias(c)) if (miraAgente(c, v.id, v.ojos)) return true;
    return false;
  }

  function sospecha(c, g, celda) {
    g.objetivo = { x: celda.x, y: celda.y }; g.mirar = 0;
    if (g.estado !== 'sospecha') ponEstado(c, g, 'sospecha');
  }
  // Un ruido en una casilla: los guardias atentos que estén a `radio` casillas o menos van a mirar.
  function ruido(c, celda, radio) {
    ev(c, 'ruido', { x: celda.x, y: celda.y, radio });
    for (const g of c.p.guardias) if (ATENTOS.includes(g.estado) && R.cheb(g, celda) <= radio) sospecha(c, g, celda);
  }

  // Lo que un guardia en pie comprueba al moverse o girarse: si ve al agente (alarma) o a un compañero en el suelo (sospecha).
  function ojea(c, g) {
    if (!activo(g)) return;
    const o = ojos(c.aj, g);
    if (miraAgente(c, g.id, o) || !CALMA.includes(g.estado)) return;
    const cuerpo = c.p.guardias.find((d) => d.estado === 'derribado' && !d.escondido && !d.visto && V.ve(c.planta, o, d));
    if (!cuerpo) return;
    cuerpo.visto = true; c.p.cuenta.cuerposVistos++;
    ev(c, 'cuerpo', { quien: g.id, de: cuerpo.id });
    sospecha(c, g, cuerpo);
  }

  function gira(c, g, dir) {
    if (g.dir === dir) return;
    g.dir = dir; ev(c, 'gira', { quien: g.id, dir });
    ojea(c, g);
  }

  // Un Becario tranquilo que pisa un café abandonado se para a bebérselo: mientras bebe, no mira.
  function tomaCafe(c, g) {
    const i = c.p.objetos.findIndex((o) => o.tipo === 'cafe' && o.x === g.x && o.y === g.y);
    if (i < 0 || !CALMA.includes(g.estado)) return false;
    c.p.objetos.splice(i, 1);
    g.vuelta = g.estado; g.bebe = c.aj.cafe.turnos;
    ponEstado(c, g, 'cafe');
    return true;
  }

  // Un paso del guardia a la casilla de al lado. Si en ella está el agente (escondido), se topa con él y salta la alarma.
  function daPaso(c, g, paso) {
    const a = c.p.agente;
    g.dir = R.dirHacia(g, paso, g.dir);
    if (R.igual(paso, a)) { a.oculto = false; ev(c, 'descubre', { quien: g.id, dir: g.dir }); alarma(c, g.id); return false; }
    g.x = paso.x; g.y = paso.y;
    return true;
  }

  // El guardia anda hacia `destino` hasta `pasos` casillas. Tras cada paso mira; si algo le cambia el estado, se para.
  // Devuelve { llego, movido }. El evento del camino se apunta antes que lo que pase por el camino, para que se vea en su orden.
  function anda(c, g, destino, pasos) {
    const p = c.p, libre = (x, y) => c.planta.pisaGuardia(x, y) && !p.guardias.some((o) => o !== g && o.estado !== 'derribado' && o.x === x && o.y === y);
    const e = { t: 'mueve', quien: g.id, camino: [] };
    p.eventos.push(e);
    for (const paso of R.ruta(libre, g, destino).slice(0, pasos)) {
      const estado = g.estado;
      if (!daPaso(c, g, paso)) break;
      e.camino.push({ x: g.x, y: g.y, dir: g.dir });
      if (tomaCafe(c, g)) break;
      ojea(c, g);
      if (g.estado !== estado) break;
    }
    if (!e.camino.length) p.eventos.splice(p.eventos.indexOf(e), 1);
    return { llego: R.igual(g, destino), movido: e.camino.length > 0 };
  }

  // El siguiente punto de la ruta: de ida y vuelta, o en círculo si la ruta es un ciclo.
  function siguientePunto(g) {
    if (g.ciclo) { g.iRuta = (g.iRuta + 1) % g.ruta.length; return; }
    if (g.iRuta + g.sentido < 0 || g.iRuta + g.sentido >= g.ruta.length) g.sentido = -g.sentido;
    g.iRuta += g.sentido;
  }

  const TURNOS = {
    // Tranquilo: el que tiene ruta la recorre y, al llegar a un punto, se gira hacia el siguiente; el que no, guarda su puesto.
    tranquilo(c, g) {
      if (!g.ruta) { gira(c, g, g.puesto.dir); return; }
      if (R.igual(g, g.ruta[g.iRuta])) siguientePunto(g);
      const r = anda(c, g, g.ruta[g.iRuta], c.aj.guardias[g.tipo].pasos);
      if (!r.llego || g.estado !== 'tranquilo') return;
      siguientePunto(g);
      gira(c, g, R.dirHacia(g, g.ruta[g.iRuta], g.dir));
    },
    // Vuelve a su ruta o a su puesto; al llegar, tranquilo otra vez.
    vuelve(c, g) {
      const r = anda(c, g, g.ruta ? g.ruta[g.iRuta] : g.puesto, c.aj.guardias[g.tipo].pasos);
      if (!r.llego || g.estado !== 'vuelve') return;
      ponEstado(c, g, 'tranquilo');
      if (!g.ruta) gira(c, g, g.puesto.dir);
    },
    // Va a la casilla sospechosa; cuando llega (o ya no puede acercarse más), se queda a mirar.
    sospecha(c, g) {
      const r = anda(c, g, g.objetivo, c.aj.guardias[g.tipo].pasos);
      if (g.estado !== 'sospecha' || !(r.llego || !r.movido)) return;
      g.mirar = c.aj.alerta.mirar;
      ponEstado(c, g, 'mira');
    },
    // Otea: primero a su derecha y luego al otro lado. Si no encuentra nada, se vuelve.
    mira(c, g) {
      gira(c, g, R.gira(g.dir, g.mirar % 2 ? 4 : 2));
      if (g.estado !== 'mira') return;
      g.mirar--;
      if (g.mirar <= 0) ponEstado(c, g, 'vuelve');
    },
    // Alerta: si tiene al agente pegado, le pega; si no, corre a donde lo vieron por última vez y, una vez allí, mira alrededor.
    alerta(c, g) {
      const p = c.p, a = p.agente, tipo = c.aj.guardias[g.tipo];
      if (!a.oculto && R.manh(g, a) === 1) {
        g.dir = R.dirHacia(g, a, g.dir);
        a.vida = Math.max(0, a.vida - tipo.golpe);
        ev(c, 'golpe', { quien: g.id, dano: tipo.golpe, vida: a.vida, dir: g.dir });
        return;
      }
      const r = anda(c, g, p.alerta.visto, tipo.pasos + c.aj.alerta.pasosExtra);
      if (!r.movido && g.estado === 'alerta') gira(c, g, R.gira(g.dir, 2));
    },
    // Bebiendo el café: pierde el turno y, al acabarlo, sigue con lo que estaba.
    cafe(c, g) {
      g.bebe--;
      if (g.bebe <= 0) ponEstado(c, g, g.vuelta || 'tranquilo');
    },
  };

  // El turno de un guardia: hace lo de su estado y, al acabar, echa un vistazo (por si algo ha cambiado delante de él sin
  // que se moviera). Devuelve lo que tarda en volver a actuar (en alerta van más rápido).
  function turnoGuardia(c, g) {
    const hace = TURNOS[g.estado];
    if (hace) hace(c, g);
    ojea(c, g);
    return g.estado === 'alerta' ? c.aj.alerta.ritmo : c.aj.guardias[g.tipo].ritmo;
  }
  // El turno de una cámara: gira a su siguiente dirección y mira.
  function turnoCamara(c, cam) {
    cam.i = (cam.i + 1) % cam.dirs.length;
    ev(c, 'gira', { quien: cam.id, dir: cam.dirs[cam.i] });
    miraAgente(c, cam.id, ojosCamara(c.aj, cam));
    return c.aj.camara.ritmo;
  }

  S.guardias = Object.freeze({ activo, ojos, ojosCamara, vigias, quienVe, vistoAhora, alarma, calma, trasPasoDelAgente, sospecha, ruido, ponEstado, turnoGuardia, turnoCamara });
})(SPY);
