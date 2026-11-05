// Fans of Basement · Jefes (dominio): uno en la última planta de cada zona y después cada 5 plantas. Al llegar a su planta sale
// por debajo de ti y una cinta de PRECAUCIÓN cierra el paso hasta que cae. Cada uno ataca a su manera: el Jefe de Producto
// dispara diapositivas y se tapa con un escudo de PowerPoint, Recursos Humanos lanza sellos de DESPEDIDO en abanico, el Bug de
// Lanzamiento invoca bugs, el Consejo de Accionistas suelta un anillo de monedas y el CEO (el último, en Dirección) alterna
// sellos y bugs: al vencerlo, el servidor queda arreglado. Al caer suelta tazas y un paquete: el del jefe
// la primera vez que lo vences en esa planta; uno normal si ya lo habías vencido.
'use strict';
var BAS = globalThis.BAS || (globalThis.BAS = {});
(function (B) {
  const J = B.jefes = {};

  // Qué jefe hay en una planta ({ id, vuelta }) o null.
  J.dePlanta = function (AJ, planta) {
    const Q = AJ.jefes;
    if (planta < Q.primera || (planta - Q.primera) % Q.cada) return null;
    const k = (planta - Q.primera) / Q.cada;
    return { id: Q.orden[k % Q.orden.length], vuelta: Math.floor(k / Q.orden.length) };
  };

  function crear(e, planta, cual) {
    const AJ = e.aj, d = AJ.jefes[cual.id], suelo = (planta + 1) * AJ.altoPlanta;
    const dif = B.difDe(AJ, planta, 0), vida = Math.round(d.vida * dif.vida * (1 + AJ.jefes.vidaPorVuelta * cual.vuelta) * (1 + AJ.jefes.vidaPorRango * e.rango));
    e.jefe = { id: cual.id, planta, suelo, golpe: dif.golpe, x: AJ.ancho / 2, y: Math.min(suelo - 70, e.jugador.y + 160), vida, vidaMax: vida, radio: d.radio,
      dir: 1, ataqueT: 1.5, escudoT: 0, escudoCadaT: d.escudoCada || 0, golpeT: 0 };
    e.jefesVistos[planta] = true;
    e.eventos.push({ tipo: 'jefe', id: cual.id, nombre: d.nombre });
  }

  function aparecer(e) {
    const AJ = e.aj, p = e.planta, cual = J.dePlanta(AJ, p);
    if (!cual || e.jefesVistos[p] || e.jugador.y < p * AJ.altoPlanta + 140) return;
    crear(e, p, cual);
  }

  function mover(e, jf, d, dt) {
    const AJ = e.aj, min = AJ.pared + jf.radio, max = AJ.ancho - AJ.pared - jf.radio;
    jf.x += jf.dir * d.vel * dt;
    if (jf.x < min) { jf.x = min; jf.dir = 1; }
    if (jf.x > max) { jf.x = max; jf.dir = -1; }
    const jy = e.jugador.y, debajo = jy + 115 <= jf.suelo - 60;   // se pone por debajo de ti; si no cabe, por encima
    const quiere = Math.max(jf.planta * AJ.altoPlanta + 80, Math.min(jf.suelo - 60, debajo ? jy + 115 : jy - 115));
    jf.y += (quiere - jf.y) * Math.min(1, dt * 1.5);
  }

  function disparar(e, jf, ang, b, tipo) {
    e.proyectiles.push({ x: jf.x, y: jf.y, vx: Math.cos(ang) * b.vel, vy: Math.sin(ang) * b.vel, dano: b.dano * jf.golpe, radio: b.radio, tipo, vida: 4 });
  }
  const angAl = (e, jf) => Math.atan2(e.jugador.y - jf.y, e.jugador.x - jf.x);

  const ATAQUE = {
    producto(e, jf, d) { disparar(e, jf, angAl(e, jf), d.bala, 'diapositiva'); },
    rrhh(e, jf, d) { const a = angAl(e, jf); for (let i = 0; i < d.abanico; i++) disparar(e, jf, a + (i - (d.abanico - 1) / 2) * 0.32, d.bala, 'sello'); },
    lanzamiento(e, jf, d) { for (let i = 0; i < d.invoca; i++) B.enemigos.crear(e, 'bug', jf.x + (i ? 30 : -30), jf.y - 10).dir = i ? 1 : -1; },
    // el CEO alterna: un abanico de sellos y, al siguiente ataque, dos bugs
    ceo(e, jf, d) { jf.turno = !jf.turno; if (jf.turno) ATAQUE.rrhh(e, jf, d); else ATAQUE.lanzamiento(e, jf, d); },
    accionistas(e, jf, d) { const a0 = e.t; for (let i = 0; i < d.anillo; i++) disparar(e, jf, a0 + i * Math.PI * 2 / d.anillo, d.bala, 'moneda'); },
  };

  function escudo(jf, d, dt) {
    if (!d.escudoCada) return;
    jf.escudoT = Math.max(0, jf.escudoT - dt);
    jf.escudoCadaT -= dt;
    if (jf.escudoCadaT <= 0) { jf.escudoCadaT = d.escudoCada; jf.escudoT = d.escudo; }
  }

  function atacar(e, jf, d, dt) {
    jf.ataqueT -= dt;
    if (jf.ataqueT > 0) return;
    jf.ataqueT = d.cada;
    ATAQUE[jf.id](e, jf, d);
    e.eventos.push({ tipo: 'ataqueJefe', id: jf.id, x: jf.x, y: jf.y });
  }

  function tocar(e, jf, d) {
    const j = e.jugador, r = jf.radio + e.aj.jugador.radio;
    if ((j.x - jf.x) ** 2 + (j.y - jf.y) ** 2 <= r * r) B.herirJugador(e, d.golpe * jf.golpe, 'jefe');
  }

  // Los proyectiles de los jefes: vuelan en línea recta y, si te dan, quitan café.
  function proyectiles(e, dt) {
    const j = e.jugador, rj = e.aj.jugador.radio;
    for (let i = e.proyectiles.length - 1; i >= 0; i--) {
      const p = e.proyectiles[i];
      p.x += p.vx * dt; p.y += p.vy * dt; p.vida -= dt;
      const r = p.radio + rj, da = (p.x - j.x) ** 2 + (p.y - j.y) ** 2 <= r * r;
      if (da) B.herirJugador(e, p.dano, p.tipo);
      if (da || p.vida <= 0) e.proyectiles.splice(i, 1);
    }
  }

  J.paso = function (e, dt) {
    aparecer(e);
    proyectiles(e, dt);
    const jf = e.jefe;
    if (!jf) return;
    const d = e.aj.jefes[jf.id];
    jf.golpeT = Math.max(0, jf.golpeT - dt);
    mover(e, jf, d, dt);
    escudo(jf, d, dt);
    atacar(e, jf, d, dt);
    tocar(e, jf, d);
  };

  // Una grapa le da. Con el escudo puesto no le hace nada.
  J.herir = function (e, dano) {
    const jf = e.jefe;
    if (!jf) return false;
    if (jf.escudoT > 0) { e.eventos.push({ tipo: 'bloqueado', x: jf.x, y: jf.y }); return false; }
    jf.vida -= dano; jf.golpeT = 0.12;
    e.eventos.push({ tipo: 'impacto', x: jf.x, y: jf.y, dano });
    if (jf.vida <= 0) morir(e, jf);
    return true;
  };

  function morir(e, jf) {
    const P = e.aj.jefes.premio;
    e.jefe = null;
    e.jefesVencidos++; e.bajas++;
    e.bajasPorTipo[jf.id] = (e.bajasPorTipo[jf.id] || 0) + 1;
    for (let i = 0; i < P.tazas; i++) B.enemigos.soltar(e, 'taza', jf.x + (i - 1) * 24, jf.y);
    const primera = !e.vencidos.includes(jf.planta);
    if (primera) e.jefesNuevos.push(jf.planta);
    B.enemigos.soltar(e, primera ? 'paqueteJefe' : 'paquete', jf.x, jf.y - 26);
    e.eventos.push({ tipo: 'jefeVencido', id: jf.id, x: jf.x, y: jf.y, nombre: e.aj.jefes[jf.id].nombre });
    if (jf.planta === e.aj.final && !e.final) { e.final = true; e.eventos.push({ tipo: 'final' }); }   // el CEO: servidor arreglado
  }
})(BAS);
