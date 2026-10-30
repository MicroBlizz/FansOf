// Fans of Karts (prototipo) · LOS OBJETOS: salen de los regalos de la pista, por ruleta. Cuanto más atrás vas, mejores
// tocan (REPARTO). Todos son bromas de la serie: el Hotfix, el Pase de batalla, el Nerf, el Parche, la Caja de botín, el Mantenimiento
// de servidores y la Cola de inicio de sesión. Aquí está también lo que anda suelto por la pista (Nerfs volando y Parches en el suelo)
// y cuándo usa cada rival lo que le ha tocado.
'use strict';

const OBJETOS = {
  hotfix: { nombre: 'Hotfix', fig: 'hotfix', texto: 'Un turbo de emergencia. Arregla tu velocidad y rompe otras tres cosas.' },
  pase: { nombre: 'Pase de batalla', fig: 'pase', usos: 3, texto: 'Tres turbos. El cuarto es de pago.' },
  nerf: { nombre: 'Nerf', fig: 'nerf', texto: 'Sale disparado hacia delante: a quien le da, encoge y corre menos.' },
  parche: { nombre: 'Parche', fig: 'parche', texto: 'Lo sueltas detrás. Quien lo pisa descubre que el parche lo ha roto todo.' },
  botin: { nombre: 'Caja de botín', fig: 'botin', texto: 'Casi siempre sale un spray gris común. Casi.' },
  mantenimiento: { nombre: 'Mantenimiento', fig: 'cono', texto: 'Servidores en mantenimiento: todos los que van delante se paran.' },
  cola: { nombre: 'Cola de inicio', fig: 'reloj', texto: 'Mete al primero en la cola de inicio de sesión. Posición: 9.999.' },
};
const LISTA_OBJETOS = Object.keys(OBJETOS);
// lo que pesa cada objeto en la ruleta según el puesto: [1º y 2º, 3º a 5º, 6º a 8º]
const REPARTO = { hotfix: [30, 24, 12], parche: [34, 16, 6], nerf: [24, 26, 16], botin: [12, 16, 12], pase: [0, 10, 24], mantenimiento: [2, 12, 22], cola: [0, 2, 12] };
function sorteaObjeto(puesto) {
  const col = puesto <= 2 ? 0 : puesto <= 5 ? 1 : 2;
  const vale = () => true;      // online también salen todos (los nuevos van por la red: pvp-objetos.js)
  let total = 0; for (const id of LISTA_OBJETOS) if (vale(id)) total += REPARTO[id][col];
  let r = Math.random() * total;
  for (const id of LISTA_OBJETOS) { if (!vale(id)) continue; r -= REPARTO[id][col]; if (r < 0) return id; }
  return 'hotfix';
}
function cogeRegalo(k) {
  if (k.objeto || k.tRuleta > 0) return;
  k.tRuleta = 1.25;
  suena(k, 'ruleta');
  if (k.esJugador && !CARRERA.regaloVisto) { CARRERA.regaloVisto = true; comenta(envoltorio() === 'gashapon' ? 'Gashapon de Microblizz: te toca lo que salga. No se admiten devoluciones.' : 'Regalo de Microblizz: el contenido puede no coincidir con el envoltorio.'); }
}
// cada paso: la ruleta gira y, al parar, da el objeto
function giraRuleta(k, dt) {
  if (k.tRuleta <= 0) return;
  k.tRuleta -= dt;
  if (k.tRuleta <= 0) { k.objeto = sorteaObjeto(k.puesto); k.usos = OBJETOS[k.objeto].usos || 1; suena(k, 'premio'); if (k.ia) k.ia.tUsa = 0.8 + Math.random() * 3; }
}

function usaObjeto(k, C) {
  if (!k.objeto || k.tRuleta > 0 || k.estado !== 'normal' || k.fin) return;
  const id = k.objeto, P = PISTA, yo = k.esJugador, quien = tr(k.piloto.nombre);
  if (--k.usos <= 0) k.objeto = null;
  if (OBJETOS[id].usa) { OBJETOS[id].usa(k, C, yo, quien); return; }      // los nuevos (objetos-2.js)
  if (id === 'hotfix' || id === 'pase') { daTurbo(k, id === 'pase' ? 0.85 : 1.15, 1.36, true); if (yo && id === 'hotfix') comenta('Hotfix aplicado. Efectos secundarios: todavía no se conocen.'); }
  else if (id === 'nerf') {
    const o = { tipo: 'nerf', x: k.x, y: k.y, idx: k.idx + 1.2, lat: k.lat, vel: Math.max(k.v, 60) + 110, autor: k, vida: 4.5, alto: 3, fase: 0 };
    C.sueltos.push(o); suena(k, 'missile');
    if (C.pvp && (yo || k.plaza != null)) pvpLanza(o, k);
  } else if (id === 'parche') {
    const o = { tipo: 'parche', x: k.x - Math.cos(k.ang) * 10, y: k.y - Math.sin(k.ang) * 10, idx: k.idx - 1.2, lat: k.lat, autor: k, vida: 45, armado: 0.35, alto: 0, fase: Math.random() * 6 };
    C.sueltos.push(o); suena(k, 'poof');
    if (C.pvp && (yo || k.plaza != null)) pvpLanza(o, k);
  } else if (id === 'botin') {
    const r = Math.random();
    if (r < 0.55) {     // lo de siempre
      for (let i = 0; i < 14; i++) chispa(k.x - Math.cos(k.ang) * 6, k.y - Math.sin(k.ang) * 6, 3, azar(-26, 26), azar(-26, 26), azar(10, 50), 0.8, i % 2 ? '#9aa0ad' : '#c3c8d2', 3, 40);
      if (yo) { aviso('SPRAY GRIS COMÚN', 'Otra vez.', '#9aa0ad'); comenta('Caja de botín: probabilidad de algo bueno, «variable».'); play('sad'); }
    } else if (r < 0.85) { daTurbo(k, 1.15, 1.36, true); if (yo) aviso('¡HOTFIX!', 'Poco común.', '#5ef27a'); }
    else { k.objeto = 'pase'; k.usos = 3; if (yo) { aviso('¡LEGENDARIO!', 'Pase de batalla: 3 turbos.', '#ff8a1f'); play('levelup'); } }
  } else if (id === 'mantenimiento') {
    let n = 0;
    for (const o of C.karts) if (o !== k && o.avance > k.avance && (o.remoto ? (pvpGolpeaRemoto(o, 'parado', k), true) : golpea(o, 'parado', k))) { n++; if (o.esJugador) { aviso('MANTENIMIENTO', 'Volvemos enseguida™', '#ff8a1f'); comenta(trf('%1 ha puesto los servidores en mantenimiento.', quien)); } }
    if (yo) { aviso('MANTENIMIENTO', n ? 'Los de delante, parados.' : 'No había nadie delante.', '#ff8a1f'); play('horn'); }
  } else if (id === 'cola') {
    const orden = C.orden, obj = orden[0] === k ? orden[1] : orden[0];
    if (obj && obj.remoto) pvpGolpeaRemoto(obj, 'cola', k);      // el rival del PvP decide si le da (según su inmunidad) y avisa
    else if (obj && golpea(obj, 'cola', k)) {
      if (obj.esJugador) { aviso('EN COLA', 'Posición en la cola: 9.999', '#22e3ff'); comenta(trf('%1 te ha metido en la cola de inicio de sesión.', quien)); }
      else if (yo) { aviso('¡A LA COLA!', trf('%1: posición 9.999', tr(obj.piloto.nombre)), '#22e3ff'); play('hack'); }
    }
  }
}

// ---------- lo que anda suelto por la pista ----------
function mueveSueltos(C, dt) {
  const P = PISTA, N = P.N;
  for (let n = C.sueltos.length - 1; n >= 0; n--) {
    const o = C.sueltos[n];
    o.vida -= dt;
    if (o.mueve) o.mueve(o, C, dt);
    else if (o.tipo === 'nerf') {
      // vuela siguiendo la pista y se va hacia el kart que tenga delante
      o.idx += (o.vel * dt) / PASO_VIA;
      let obj = null, cerca = 9;
      for (const k of C.karts) { if (k === o.autor || k.estado === 'cae') continue; let d = k.idx - (((o.idx % N) + N) % N); if (d < -N / 2) d += N; else if (d > N / 2) d -= N; if (d > -0.6 && d < cerca) { cerca = d; obj = k; } }
      if (obj) o.lat = acerca(o.lat, obj.lat, 46 * dt);
      const i = ((Math.floor(o.idx) % N) + N) % N, t = o.idx - Math.floor(o.idx), a = P.via[i], b = P.via[(i + 1) % N];
      o.lat = limita(o.lat, -a.ancho / 2 + 3, a.ancho / 2 - 3);
      o.x = a.x + (b.x - a.x) * t - a.ty * o.lat; o.y = a.y + (b.y - a.y) * t + a.tx * o.lat;
      if (Math.random() < 0.6) chispa(o.x, o.y, 4, azar(-8, 8), azar(-8, 8), azar(0, 20), 0.25, '#ff9aa6', 1.6, 30);
      for (const k of C.karts) {
        if (k === o.autor || k.z > 6 || k.remoto) continue;      // al rival del PvP le da (o no) en su navegador
        const dx = k.x - o.x, dy = k.y - o.y;
        if (dx * dx + dy * dy < 49) {
          if (golpea(k, 'nerf', o.autor)) {
            if (k.esJugador) { aviso('¡NERFEADO!', 'Notas del parche: corres un 26 % menos.', '#ff3348'); comenta(trf('%1: «Era necesario para el equilibrio del juego».', o.autor.nombre || tr(o.autor.piloto.nombre))); if (C.pvp) pvpMeHanDado('nerf', o.autor); }
            else if (C.pvp && pvpAvisaAutor('nerf', o.autor, k)) { /* el autor humano ya sabe que ha dado */ }
            else if (o.autor.esJugador) { aviso('¡NERF!', trf('%1 corre un 26 % menos.', tr(k.piloto.nombre)), '#5ef27a'); play('laugh'); }
          }
          o.vida = 0; break;
        }
      }
    } else {
      // un Parche en el suelo: quien lo pisa (su dueño también) hace un trompo
      if (o.armado > 0) o.armado -= dt;
      else for (const k of C.karts) {
        if (k.z > 3 || k.remoto) continue;
        const dx = k.x - o.x, dy = k.y - o.y;
        if (dx * dx + dy * dy < 42) {
          if (golpea(k, 'trompo', o.autor)) {
            if (k.esJugador) { aviso('¡PARCHE APLICADO!', 'Se ha roto todo lo demás.', '#6f8fe8'); comenta(trf('Parche 1.0.%1: «Corregido un error por el que el jugador iba recto».', 1 + ((Math.random() * 8) | 0))); if (C.pvp) pvpMeHanDado('parche', o.autor); }
            else if (C.pvp && pvpAvisaAutor('parche', o.autor, k)) { /* idem */ }
            else if (o.autor.esJugador) { aviso('¡PARCHE!', trf('%1 se ha roto.', tr(k.piloto.nombre)), '#5ef27a'); play('laugh'); }
            o.vida = 0;
          }
          break;
        }
      }
    }
    if (o.vida <= 0) { for (let i = 0; i < 8; i++) chispa(o.x, o.y, 3, azar(-30, 30), azar(-30, 30), azar(20, 70), 0.4, o.tipo === 'nerf' ? '#ff3348' : o.tipo === 'bellota' ? '#c98a4b' : o.tipo === 'vacaSuelo' ? '#ff8fc8' : '#6f8fe8', 2); C.sueltos.splice(n, 1); }
  }
}

// ---------- cuándo usa su objeto un rival ----------
function iaUsa(k, dt, C) {
  if (!k.objeto || k.tRuleta > 0 || k.estado !== 'normal') return;
  const ia = k.ia, N = PISTA.N;
  ia.tUsa -= dt;
  if (ia.tUsa > 0) return;
  const id = k.objeto;
  let usa = false;
  if (id === 'nerf') {       // solo si tiene a alguien delante y cerca
    for (const o of C.karts) { if (o === k) continue; let d = o.idx - k.idx; if (d < -N / 2) d += N; else if (d > N / 2) d -= N; if (d > 1 && d < 16 && Math.abs(o.lat - k.lat) < 30) usa = true; }
  } else if (id === 'parche') {   // si le pisan los talones
    for (const o of C.karts) { if (o === k) continue; let d = k.idx - o.idx; if (d < -N / 2) d += N; else if (d > N / 2) d -= N; if (d > 1 && d < 9) usa = true; }
    if (Math.random() < 0.004) usa = true;
  } else if (id === 'hotfix' || id === 'pase') usa = PISTA.curvaS[(Math.floor(k.idx) + 6) % N] < 0.006 && k.suelo !== S_LENTO;      // los turbos, en recta
  else if (OBJETOS[id].ia) usa = OBJETOS[id].ia(k, C);
  else usa = true;
  if (usa) { usaObjeto(k, C); ia.tUsa = 0.9 + Math.random() * 1.5; } else ia.tUsa = 0.25;
}
