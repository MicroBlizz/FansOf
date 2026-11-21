// Fans of Vikings · EL COMBATE por turnos (las reglas, sin pintar): tus fans vivos contra las oleadas de un asalto. En tu turno
// actúa cada fan una vez, en el orden que quieras: eliges su habilidad (ataque normal o la especial, que tiene recarga) y, si
// hace falta, a qué enemigo. Luego atacan los enemigos de izquierda a derecha (al que provoca, si alguien provoca). La vida no
// se recupera sola: lo que pierdes aquí lo curas con pan en la aldea. Daño = ataque x multiplicador - la mitad de la defensa.
'use strict';
const VK_C = { activo: false };

function vkEmpiezaAsalto(i) {
  const A = VK_ASALTOS[i], planta = i < SAVE.asalto ? Math.max(0, SAVE.planta) : SAVE.planta;
  const fans = VK_ORDEN_FANS.filter(id => SAVE.fans[id].vida > 0).map((id, k) => {
    const st = vkStats(id);
    return { id, lado: 'fan', vida: SAVE.fans[id].vida, max: st.vidaMax, atq: st.atq, def: st.def, rec: {}, provoca: 0, actuo: false, anim: 'reposo', t: k * 0.7, blanco: 0 };
  });
  Object.assign(VK_C, { activo: true, i, A, planta, oleada: 0, fans, enemigos: [], fase: 'entra', sel: 0, hab: null, cola: [], espera: 0.8,
    auto: VK_C.auto || false, numeros: [], turno: 1, resultado: null, premio: null, t: 0 });
  vkOleada();
  vkMusica(A.jefe ? 'boss' : 'gamer');
}
function vkOleada() {
  const lista = VK_C.A.oleadas[VK_C.oleada], f = 1 + VK_C.planta * VK_FUERZA_PLANTA;
  VK_C.enemigos = lista.map((tipo, k) => {
    const E = VK_ENEMIGOS[tipo];
    return { tipo, lado: 'ene', vida: Math.round(E.vida * f), max: Math.round(E.vida * f), atq: Math.round(E.atq * f), def: E.def, turnos: 0, anim: 'reposo', t: k * 0.5, blanco: 0, entra: 1 };
  });
  for (const fan of VK_C.fans) { fan.actuo = false; }
  VK_C.fase = 'entra'; VK_C.espera = 0.9;
}
const vkVivos = l => l.filter(x => x.vida > 0);
function vkSiguienteFan() {
  const i = VK_C.fans.findIndex(f => f.vida > 0 && !f.actuo);
  VK_C.sel = i; VK_C.hab = null;
  return i;
}

/* ---------- las acciones ---------- */
function vkDano(atq, mult, def, magia) {
  const base = atq * mult * (0.88 + Math.random() * 0.24);
  return Math.max(1, Math.round(base - def * (magia ? 0.25 : 0.5)));
}
// una acción ya decidida entra en la cola y se reproduce con su animación; el daño se aplica a mitad del golpe
function vkActua(actor, hab, objetivos) {
  VK_C.cola.push({ actor, hab, objetivos, t: 0, hecho: false });
}
function vkResuelve(a) {
  const yo = a.actor, H = a.hab;
  if (H.id === 'provocar') { yo.provoca = H.turnos + 1; vkNumero(yo, tr('¡PROVOCA!'), VK_COL.oro); play('vkProvocar'); return; }
  if (H.id === 'curar') {
    for (const f of vkVivos(VK_C.fans)) { const c = Math.min(f.max - f.vida, H.cura + yo.atq); f.vida += c; vkNumero(f, '+' + c, VK_COL.vida); }
    play('vkCura'); return;
  }
  for (const o of a.objetivos) {
    if (o.vida <= 0) continue;
    const def = o.def * (o.provoca > 0 ? 1.5 : 1);
    const d = vkDano(yo.atq, H.mult || 1, def, yo.lado === 'fan' && VK_FANS[yo.id].magia);
    o.vida = Math.max(0, o.vida - d); o.blanco = 1; o.anim = 'golpe'; o.t = 0;
    vkNumero(o, '-' + d, o.lado === 'fan' ? VK_COL.rojoClaro : VK_COL.crema);
    if (o.vida <= 0) { o.anim = 'ko'; play('vkCae'); }
  }
  const quien = yo.lado === 'fan' ? yo.id : 'ene';
  play(quien === 'madsquirrel' ? 'vkFlecha' : quien === 'meercat' ? 'vkMagia' : 'vkGolpe');
}
function vkNumero(o, txt, col) { VK_C.numeros.push({ o, txt, col, t: 0, dx: (Math.random() - 0.5) * 8 }); }

// el jugador toca una habilidad del fan elegido
function vkEligeHab(k) {
  const fan = VK_C.fans[VK_C.sel]; if (!fan || VK_C.fase !== 'jugador') return;
  const H = VK_FANS[fan.id].habs[k];
  if (fan.rec[H.id] > 0) { play('vkNoVale'); return; }
  if (H.obj === 'uno') { VK_C.hab = k; play('select'); return; }   // falta elegir a quién
  vkUsaHab(fan, k, null);
}
function vkUsaHab(fan, k, objetivo) {
  const H = VK_FANS[fan.id].habs[k], vivos = vkVivos(VK_C.enemigos);
  let obj = [];
  if (H.obj === 'uno') obj = [objetivo || vivos[0]];
  else if (H.obj === 'todos') obj = vivos;
  else if (H.obj === 'azar2') obj = [0, 1].map(() => vivos[Math.floor(Math.random() * vivos.length)]);
  if (H.rec) fan.rec[H.id] = H.rec + 1;
  fan.actuo = true; VK_C.hab = null;
  vkActua(fan, H, obj);
  VK_C.fase = 'animando';
}
function vkTocaEnemigo(e) {
  if (VK_C.fase !== 'jugador' || e.vida <= 0) return;
  const fan = VK_C.fans[VK_C.sel]; if (!fan) return;
  vkUsaHab(fan, VK_C.hab === null ? 0 : VK_C.hab, e);   // sin habilidad elegida: ataque normal
}
function vkTocaFan(i) {
  const f = VK_C.fans[i];
  if (VK_C.fase === 'jugador' && f.vida > 0 && !f.actuo) { VK_C.sel = i; VK_C.hab = null; play('select'); }
}
// la máquina juega por ti (botón AUTO): especial si está lista y sirve, si no, al enemigo con menos vida
function vkJuegaAuto(fan) {
  const habs = VK_FANS[fan.id].habs, esp = habs[1], vivos = vkVivos(VK_C.enemigos);
  const flojo = vivos.slice().sort((a, b) => a.vida - b.vida)[0];
  let usa = false;
  if (!(fan.rec[esp.id] > 0)) {
    if (esp.id === 'curar') usa = VK_C.fans.some(f => f.vida > 0 && f.vida < f.max * 0.65);
    else if (esp.id === 'provocar') usa = vivos.length >= 2 || vivos.some(e => VK_ENEMIGOS[e.tipo].jefe);
    else if (esp.id === 'barrido') usa = vivos.length >= 2;
    else usa = true;
  }
  vkUsaHab(fan, usa ? 1 : 0, flojo);
}

/* ---------- el turno de los enemigos ---------- */
function vkTurnoEnemigos() {
  const vivosF = vkVivos(VK_C.fans);
  for (const e of vkVivos(VK_C.enemigos)) {
    const E = VK_ENEMIGOS[e.tipo]; e.turnos++;
    if (E.especial && e.turnos % E.cada === 0) vkActua(e, { id: 'especial', nombre: E.especial, mult: E.mult }, vivosF);
    else {
      const provoca = vivosF.filter(f => f.provoca > 0);
      const lista = provoca.length ? provoca : vivosF;
      vkActua(e, { id: 'golpe', mult: 1 }, [lista[Math.floor(Math.random() * lista.length)]]);
    }
  }
  VK_C.fase = 'enemigos';
}
function vkFinTurno() {
  for (const f of VK_C.fans) { f.actuo = false; for (const k in f.rec) if (f.rec[k] > 0) f.rec[k]--; if (f.provoca > 0) f.provoca--; }
  VK_C.turno++;
  VK_C.fase = 'jugador'; vkSiguienteFan();
}

/* ---------- el reloj del combate ---------- */
function vkAvanzaCombate(dt) {
  const C = VK_C; C.t += dt;
  for (const o of [...C.fans, ...C.enemigos]) {
    o.t += dt; o.blanco = Math.max(0, o.blanco - dt * 5);
    if (o.anim === 'golpe' && o.t > 0.3) { o.anim = o.vida > 0 ? 'reposo' : 'ko'; o.t = 0; }
    if (o.anim === 'atacar' && o.t > 0.5) { o.anim = 'reposo'; o.t = 0; }
    if (o.entra) o.entra = Math.max(0, o.entra - dt * 2.5);
  }
  for (const n of C.numeros) n.t += dt;
  C.numeros = C.numeros.filter(n => n.t < 1);
  if (C.espera > 0) { C.espera -= dt; return; }
  // reproducir la cola de acciones, una tras otra
  if (C.cola.length) {
    const a = C.cola[0];
    if (a.t === 0) {
      if (a.actor.vida <= 0) { C.cola.shift(); return; }   // cayó antes de actuar
      a.actor.anim = 'atacar'; a.actor.t = 0; a.nombre = a.hab.nombre;
      if (a.hab.id === 'especial') vkNumero(a.actor, tr(a.hab.nombre).toUpperCase(), VK_COL.oro);
    }
    a.t += dt;
    if (!a.hecho && a.t >= 0.25) { a.hecho = true; vkResuelve(a); }
    if (a.t >= 0.62) C.cola.shift();
    return;
  }
  if (C.fase === 'entra') { C.fase = 'jugador'; vkSiguienteFan(); return; }
  if (C.fase === 'animando' || C.fase === 'enemigos' || C.fase === 'jugador') {
    if (!vkVivos(C.enemigos).length) { vkGanaOleada(); return; }
    if (!vkVivos(C.fans).length) { vkTerminaAsalto(false); return; }
  }
  if (C.fase === 'animando') {
    if (vkSiguienteFan() < 0) vkTurnoEnemigos(); else C.fase = 'jugador';
    return;
  }
  if (C.fase === 'enemigos') { vkFinTurno(); return; }
  if (C.fase === 'jugador' && C.auto && C.sel >= 0) vkJuegaAuto(C.fans[C.sel]);
}
function vkGanaOleada() {
  if (VK_C.oleada + 1 < VK_C.A.oleadas.length) { VK_C.oleada++; vkOleada(); play('vkOleada'); return; }
  vkTerminaAsalto(true);
}
function vkTerminaAsalto(gana) {
  const C = VK_C;
  // la vida que queda vuelve a la aldea (el que cae se queda KO hasta que coma)
  for (const f of C.fans) SAVE.fans[f.id].vida = f.vida;
  if (gana) {
    const p = vkPremio(C.i, C.planta);
    SAVE.oro += p.oro;
    const suben = C.fans.filter(f => vkDaXpFan(f.id, p.xp)).map(f => VK_FANS[f.id].nombre);
    vkDaXpAldea(p.xpAldea);
    if (C.i === SAVE.asalto) { SAVE.asalto++; if (SAVE.asalto >= VK_ASALTOS.length) { SAVE.asalto = 0; SAVE.planta++; } }
    C.premio = { ...p, suben };
  } else {
    const xp = Math.ceil(vkPremio(C.i, C.planta).xp / 3);
    C.premio = { xp, suben: C.fans.filter(f => vkDaXpFan(f.id, xp)).map(f => VK_FANS[f.id].nombre) };
  }
  C.resultado = gana ? 'gana' : 'pierde'; C.fase = 'fin';
  vkSintonia(gana ? 'win' : 'lose');
  vkGuarda();
}
function vkHuye() {
  for (const f of VK_C.fans) SAVE.fans[f.id].vida = f.vida;
  vkGuarda(); vkSalCombate();
}
function vkSalCombate() { VK_C.activo = false; vkMusica('animales'); }
