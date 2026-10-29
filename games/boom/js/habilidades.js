// Fans of Boom · HABILIDADES: los efectos propios de cada móvil que no caben en un tiro normal. El barrido orbital, el gatito pegajoso,
// el muro del Gato gordo, la raid (humo y avión al turno siguiente), el rayo en cadena, el martillazo que empuja y la llamada de
// artillería. partida.js les pasa lo que necesitan (K: la partida, estalla, aviso, vivos, masCerca). Sin DOM.
'use strict';
const HABILIDADES = (() => {
  const C = BOOM.movil, DT = BOOM.paso, W = BOOM.mundo.ancho, H = BOOM.mundo.alto;
  const golpe = (p, x, demora, estilo, def) => ({ tipo: 'golpe', x: clamp(x, 4, W - 4), demora, demora0: demora, estilo, def, dueno: p.dueno, alto: p.alto, ang: p.ang, t: 0, traza: [], hecho: false });
  const dir = (p, dueno) => Math.sign(p.vx) || dueno.dir;

  // el proyectil ha tocado algo: si su efecto es de aquí, se encarga y devuelve true
  function impacto(K, p, ef, fin, dueno) {
    const P = K.P;
    switch (ef.tipo) {
      case 'barrido': {   // el rayo baja donde ha caído el dardo y arrastra por el suelo hacia delante
        K.estalla(p.x, p.y, p.def, p);
        P.proys.push({ tipo: 'barrido', x: p.x, y: p.y, dir: dir(p, dueno), queda: ef.largo, cuenta: ef.cada, dueno: p.dueno, alto: p.alto, ang: p.ang, t: 0, traza: [], demora: 0.3, hecho: false,
          def: { forma: 'rayo', radio: ef.radio, crater: ef.crater, dano: ef.dano + (ef.porCarga || 0) * (p.carga || 0) }, ef });
        K.aviso('barrido', { x: p.x, y: p.y }); return true;
      }
      case 'pega': {   // se queda pegado (al rival, si le ha dado) y espera al siguiente turno de quien lo tiró
        const m = fin.tipo === 'movil' ? P.moviles[fin.movil] : null;
        P.pendientes.push({ tipo: 'pega', dueno: p.dueno, movil: m ? m.id : null, dx: m ? p.x - m.x : 0, dy: m ? p.y - m.y : 0, x: p.x, y: p.y,
          def: { forma: 'gatito', radio: ef.radio, crater: ef.crater, dano: ef.dano }, alto: p.alto, ang: p.ang });
        K.aviso('pega', { x: p.x, y: p.y, m }); return true;
      }
      case 'muro': {   // aplasta y se queda tumbado: un muro nuevo de terreno
        K.estalla(p.x, p.y, p.def, p);
        const y = Math.min(TERRENO.suelo(p.x, p.y - 20), H - 10) - ef.alto * 0.55;
        TERRENO.pon(p.x, y, ef.ancho, ef.alto, 'gato');
        for (const v of K.vivos()) if (TERRENO.solido(v.x, v.y - 2)) { let yy = v.y; while (yy > 0 && TERRENO.solido(v.x, yy - 1)) yy--; v.y = yy; }   // quien quede dentro, encima
        K.aviso('muro', { x: p.x, y }); return true;
      }
      case 'raid': {   // el humo marca el sitio; el avión pasa al empezar el siguiente turno de quien lo tiró
        K.estalla(p.x, p.y, p.def, p);
        P.pendientes.push({ tipo: 'raid', dueno: p.dueno, x: p.x, y: p.y, dir: dir(p, dueno), ef });
        K.aviso('humo', { x: p.x, y: p.y }); return true;
      }
      case 'cadena': {   // un trueno donde cae y luego salta al rival más cercano que no haya recibido ya, cada vez más flojo
        K.estalla(p.x, p.y, p.def, p);
        const def = k => ({ forma: 'trueno', radio: ef.radio, crater: ef.crater, dano: Math.round(ef.dano * Math.pow(ef.baja, k)) });
        P.proys.push(golpe(p, p.x, 0.35, 'trueno', def(0)));
        let x = p.x; const tocados = K.vivos().filter(v => v.equipo !== dueno.equipo && Math.abs(v.x - p.x) < ef.radio + C.radio);
        for (let k = 1; k <= ef.saltos; k++) {
          const e = K.vivos().filter(v => v.equipo !== dueno.equipo && !tocados.includes(v) && Math.abs(v.x - x) <= ef.alcance).sort((a, b) => Math.abs(a.x - x) - Math.abs(b.x - x))[0];
          if (!e) break;
          tocados.push(e); P.proys.push(Object.assign(golpe(p, e.x, 0.35 + k * 0.4, 'trueno', def(k)), { desde: x })); x = e.x;
        }
        return true;
      }
      case 'empuje': {   // martillazo: explota y empuja lejos a todos los que pille, menos a quien lo tira
        K.estalla(p.x, p.y, p.def, p);
        const lista = [];
        for (const v of K.vivos()) {
          if (v === dueno) continue;
          const d = Math.hypot(v.x - p.x, v.y - C.centro - p.y); if (d > ef.alcance) continue;
          lista.push({ id: v.id, queda: (v.x >= p.x ? 1 : -1) * Math.max(60, ef.fuerza * (1 - d / ef.alcance)) });
        }
        if (lista.length) P.proys.push({ tipo: 'empuje', x: p.x, y: p.y, lista, dueno: p.dueno, t: 0, traza: [], demora: 0.1, hecho: false, def: p.def });
        K.aviso('empuje', { x: p.x, y: p.y, n: lista.length }); return true;
      }
      case 'artilleria': {   // ¡Acción!: los obuses caen a lo ancho, uno tras otro, desde detrás de quien dispara
        K.estalla(p.x, p.y, p.def, p);
        const d = dir(p, dueno), def = { forma: 'obus', cae: true, radio: ef.radio, crater: ef.crater, dano: ef.dano }, T = 1.1;
        for (let i = 0; i < ef.n; i++) {
          const x = clamp(p.x + d * (i / (ef.n - 1) - 0.5) * ef.ancho, 10, W - 10), y0 = -80, x0 = x - d * 360, yg = TERRENO.suelo(x, 0);
          const q = FISICA.nuevo(x0, y0, (x - x0) / T, (yg - y0 - 0.5 * BOOM.gravedad * T * T) / T, 0, null, p.dueno, 0, def);
          q.demora = 0.45 + i * ef.cada; P.proys.push(q);
        }
        K.aviso('accion', { x: p.x, y: p.y }); return true;
      }
    }
    return false;
  }

  // un paso de lo que no es un proyectil normal; devuelve true al acabar
  function vuela(K, p) {
    if (p.tipo === 'barrido') {
      const s = p.ef.vel * DT; p.x += p.dir * s; p.queda -= s; p.cuenta += s; p.t += DT;
      if (p.x < 2 || p.x > W - 2) return true;
      p.y = TERRENO.suelo(p.x, 0);
      if (p.cuenta >= p.ef.cada && p.y < H) { p.cuenta = 0; K.estalla(p.x, p.y, p.def, p); }
      return p.queda <= 0;
    }
    if (p.tipo === 'empuje') {   // los empujados se deslizan por el suelo (si se acaba el suelo, siguen y luego caen)
      let quedan = false; p.t += DT;
      for (const e of p.lista) {
        const v = K.P.moviles[e.id]; if (!v.vivo || !e.queda) continue;
        const s = Math.sign(e.queda) * Math.min(Math.abs(e.queda), 480 * DT), nx = clamp(v.x + s, 14, W - 14);
        if (TERRENO.solido(nx, v.y - 34) || nx === v.x) { e.queda = 0; continue; }   // choca con una pared
        v.x = nx; e.queda -= s; quedan = quedan || Math.abs(e.queda) > 0.5;
        for (let y = Math.floor(v.y - 30); y <= v.y + 4; y++) if (TERRENO.solido(v.x, y)) { v.y = y; break; }
      }
      return !quedan;
    }
    if (p.tipo === 'avion') {   // el avión de la raid cruza y suelta las bombas cuando pasa por encima del humo
      p.x += p.dir * 760 * DT; p.t += DT;
      const ef = p.ef;
      while (p.soltadas < ef.n && (p.x - (p.blanco - p.dir * ef.ancho / 2)) * p.dir >= p.soltadas * ef.ancho / (ef.n - 1)) {
        const q = FISICA.nuevo(p.x, p.y + 20, p.dir * 160, 60, 0, null, p.dueno, 0, { forma: 'bomba', cae: true, radio: ef.radio, crater: ef.crater, dano: ef.dano });
        K.P.proys.push(q); p.soltadas++;
      }
      return (p.x - p.blanco) * p.dir > ef.ancho / 2 + 900;
    }
    if (p.tipo === 'pegado') {   // el gatito pegajoso, a punto de explotar: parpadea un momento y estalla
      p.t += DT; if (p.t < 0.6) return false;
      K.estalla(p.x, p.y, p.def, p); return true;
    }
    return true;
  }

  // al empezar el turno de m: explotan sus gatitos pegajosos y llegan sus raids. Devuelve true si hay algo que ver antes de apuntar
  function alEmpezar(K, m) {
    const P = K.P, mios = P.pendientes.filter(n => n.dueno === m.id); if (!mios.length) return false;
    P.pendientes = P.pendientes.filter(n => n.dueno !== m.id);
    for (const n of mios) {
      if (n.tipo === 'pega') {
        const v = n.movil != null ? P.moviles[n.movil] : null, x = v && v.vivo ? v.x + n.dx : n.x, y = v && v.vivo ? v.y + n.dy : n.y;
        P.proys.push({ tipo: 'pegado', x, y, def: n.def, dueno: m.id, alto: false, ang: 0, t: 0, traza: [], demora: 0, hecho: false });
      } else if (n.tipo === 'raid') {
        P.proys.push({ tipo: 'avion', x: n.x - n.dir * (n.ef.ancho / 2 + 900), y: Math.max(60, TERRENO.suelo(n.x, 0) - 330), dir: n.dir, blanco: n.x, soltadas: 0, ef: n.ef, dueno: m.id, alto: false, ang: 0, t: 0, traza: [], demora: 0.2, hecho: false, def: { forma: 'avion' } });
        K.aviso('raid', { m });
      }
    }
    return true;
  }
  // dónde está ahora cada cosa que espera (el gatito va pegado al rival), para dibujarla
  function donde(P, n) { const v = n.movil != null ? P.moviles[n.movil] : null; return v && v.vivo ? { x: v.x + n.dx, y: v.y + n.dy } : { x: n.x, y: n.y }; }
  return { impacto, vuela, alEmpezar, donde };
})();
