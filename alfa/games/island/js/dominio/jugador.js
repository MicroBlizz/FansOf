// Fans of Island · dominio/jugador: CRAZYBUNNY como regla pura. Andar con inercia, saltar (más alto cuanto más se mantiene), el margen al
// borde (coyote) y el salto pulsado antes de tocar el suelo (buffer), flotar con las orejas, caer, rebotar al pisar, el golpe con su
// invulnerabilidad, pisar un pez, el golpe de una gota y volver a tierra firme si cae al mar. Sin pantalla, reloj ni azar: dt y los mandos ({dir, salto, buffer}) entran como
// argumentos, la física (IS.creaFisica) también, y los sonidos o el marcador los hace quien llama con los eventos que devuelve paso().
'use strict';
{
  const { V_SALTO, V_MAX, R_J, MAR } = IS.FISICA;
  const GIRO_DER = -Math.PI / 2 + 0.5, GIRO_IZQ = Math.PI / 2 - 0.5;   // de perfil, un poco girado hacia nosotros
  const VIDAS = 3, INVULNERABLE = 1.5;
  const SALTO_PISAR = { con: 500, sin: 400 };   // el rebote tras pisar a un pez, según se mantenga el salto
  const giraHacia = (o, dt) => { o.giro += ((o.mira > 0 ? GIRO_DER : GIRO_IZQ) - o.giro) * Math.min(1, dt * 14); };

  function crea(x, z) {   // x, z: dónde sale (z, la altura del suelo de la salida)
    return { x, y: IS.MEDIDAS.CARRIL, z, vx: 0, vz: 0, giro: GIRO_DER, mira: 1, vidas: VIDAS, inv: 0, aterriza: 0, anda: 0,
      flota: 0, coyote: 0, cortado: true, empuje: 0, salvo: { x, z } };
  }
  function salta(j, m, enSuelo, dt) {   // true si despega en este paso; gasta m.buffer
    j.coyote = enSuelo ? 0.1 : j.coyote - dt;
    if (m.buffer > 0) m.buffer -= dt;
    const despega = m.buffer > 0 && j.coyote > 0;
    if (despega) { j.vz = V_SALTO; j.coyote = 0; m.buffer = 0; j.flota = 0; j.cortado = false; }
    if (!m.salto && j.vz > 0 && !j.cortado) { j.vz *= 0.45; j.cortado = true; }   // salto corto si sueltas pronto
    return despega;
  }
  function anda(j, m, enSuelo, dt) {
    j.empuje -= dt;
    if (j.empuje > 0) return;
    if (m.dir) {
      j.vx = Math.max(-V_MAX, Math.min(V_MAX, j.vx + m.dir * (enSuelo ? 1100 : 800) * dt)); j.mira = m.dir;
      return;
    }
    const f = (enSuelo ? 1500 : 500) * dt;
    j.vx = Math.abs(j.vx) <= f ? 0 : j.vx - Math.sign(j.vx) * f;
  }
  function vuela(j, m, dt, f) {   // flotar y caer; devuelve 'aire', 'aterriza' o 'suelo'
    const flotando = m.salto && j.vz < 0 && j.flota < 0.9;
    if (flotando) { j.flota += dt; j.vz = Math.max(j.vz, -55); }
    j.flotando = flotando;
    const r = f.cae(j, dt, flotando ? 0.2 : 1, R_J);
    if (r === 'aterriza') { j.aterriza = 0.12; j.flota = 0; }
    return r;
  }
  function relojes(j, r, dt, f) {   // el tiempo de la pose, de la invulnerabilidad y el último suelo firme
    j.aterriza -= dt; j.inv -= dt;
    j.anda = (r === 'suelo' && Math.abs(j.vx) > 20) ? j.anda + dt : 0;
    if (r === 'suelo' && f.arribaCol(Math.floor(j.x / IS.MEDIDAS.T)) === j.z) j.salvo = { x: j.x, z: j.z };
    giraHacia(j, dt);
  }
  function daña(j) {   // true si de verdad quita una vida (no está parpadeando)
    if (j.inv > 0) return false;
    j.vidas--; j.inv = INVULNERABLE; return true;
  }
  function alMar(j) {   // si cae al mar pierde una vida y vuelve al último suelo firme; devuelve los eventos
    if (j.z >= MAR - 50) return [];
    const ev = [];
    if (daña(j)) ev.push('daño');
    if (j.vidas > 0) { j.x = j.salvo.x; j.z = j.salvo.z; j.vz = 0; j.vx = 0; }
    return ev;
  }
  function paso(j, m, dt, f) {   // un fotograma; devuelve los eventos: 'salto', 'daño'
    const ev = [];
    const enSuelo = j.z <= f.sueloDe(j, R_J) + 0.01 && j.vz <= 0;
    if (salta(j, m, enSuelo, dt)) ev.push('salto');
    anda(j, m, enSuelo, dt);
    if (f.mueveX(j, j.vx * dt, R_J)) j.vx = 0;
    relojes(j, vuela(j, m, dt, f), dt, f);
    return ev.concat(alMar(j));
  }
  function pose(j) {
    if (j.inv > 1.1) return 'herido';
    if (j.vz > 0) return 'salto';
    if (j.flotando) return 'flota';
    if (j.vz < 0) return 'cae';
    if (j.aterriza > 0) return 'aterriza';
    if (j.anda > 0) return Math.floor(j.anda / 0.12) % 2 ? 'paso1' : 'paso2';
    return 'reposo';
  }
  function rebota(j, salto) {   // tras pisar a alguien: más alto si se mantiene el salto
    j.vz = salto ? 470 : 360; j.flota = 0; j.cortado = !salto;
  }
  function golpeado(j, dx) {   // el golpe de un enemigo: quita vida (si no parpadea) y empuja; true si quitó vida
    const quita = daña(j);
    j.vz = 260; j.vx = (Math.sign(dx) || 1) * 180; j.empuje = 0.3; j.cortado = true;
    return quita;
  }
  function pisaPez(j, arriba, salto) {   // un pez pisado: queda encima de él (arriba, su altura) y rebota
    j.z = arriba; j.vz = salto ? SALTO_PISAR.con : SALTO_PISAR.sin; j.flota = 0; j.cortado = !salto;
  }
  function golpeaGota(j, dir) {   // el golpe de una gota de agua (dir, hacia dónde va): quita vida y empuja; false si parpadea y no hace nada
    if (!daña(j)) return false;
    j.vx = dir * 150; j.vz = Math.max(j.vz, 170); j.empuje = 0.2; j.cortado = true;
    return true;
  }
  IS.GIRO = Object.freeze({ DER: GIRO_DER, IZQ: GIRO_IZQ });
  IS.giraHacia = giraHacia;
  IS.Jugador = Object.freeze({ crea, paso, pose, daña, rebota, golpeado, pisaPez, golpeaGota });
}
