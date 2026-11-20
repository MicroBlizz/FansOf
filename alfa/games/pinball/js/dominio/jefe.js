// Fans of Pinball · dominio · JEFE SurvivalBot (planta 10 y cada 10 del sin fin): 3 cajas de botín lo protegen; al romperlas se abre su
// núcleo 6 s (solo el núcleo le quita vida) y luego vuelven. Cada 10 s apunta un láser 1,5 s a UNA pala y dispara un cubito que la congela
// 3 s si llega (la bola lo rompe en el aire); nunca congela dos a la vez. Al 50 % llama a 2 becarios y dispara cada 7 s; al 25 % el
// núcleo se queda abierto y se mueve de lado a lado. Nunca se mete en la bola: si se la encuentra, se da la vuelta.
'use strict';
PB.jefe = (() => {
  const P = { x: 0, y: 0 };
  function crea(reglas, vida) {
    const j = reglas.jefe;
    const cajas = j.cajas.map(([dx, dy], i) => ({ id: -1 - i, tipo: 'caja', dx, dy, x: j.x + dx, y: j.y + dy, r: j.radioCaja,
      vida: reglas.puntos.cosas.caja.vida, vidaMax: reglas.puntos.cosas.caja.vida, vivo: true }));
    return { id: 0, tipo: 'jefe', x: j.x, y: j.y, r: j.radio, vx: 0, vida: Math.round(vida), vidaMax: Math.round(vida), vivo: true,
      nucleo: 0, cajas, cuenta: 0, apunta: null, aviso: 0, rabia: false, movil: false, dir: 1 };
  }
  const tocaBola = (s, x, y, r) => s.bolas.some(b => b.vivo && b.estado === 'mesa' && Math.hypot(b.x - x, b.y - y) < b.r + r + 1);
  // las cajas vuelven cuando se cierra el núcleo (cada una, cuando no tiene la bola encima)
  function vuelvenCajas(s, j) {
    for (const c of j.cajas) {
      if (c.vivo || tocaBola(s, c.x, c.y, c.r)) continue;
      c.vivo = true; c.vida = c.vidaMax;
    }
  }
  function cajaRota(s) {
    const j = s.sala.jefe;
    if (j.movil || j.cajas.some(c => c.vivo)) return;
    j.nucleo = s.r.jefe.nucleo;
    PB.emite(s, 'jefe_nucleo', { x: j.x, y: j.y, segundos: j.nucleo });
  }
  function nucleo(s, j, h) {
    if (j.movil || j.nucleo <= 0) return;
    j.nucleo -= h;
    if (j.nucleo <= 0) j.nucleo = 0;
  }
  // al 25 %: de lado a lado (las cajas, rotas, ya no vuelven)
  function mueve(s, j, h) {
    const rj = s.r.jefe, nx = j.x + j.dir * rj.velocidad * h;
    j.vx = 0;
    const estorba = s.sala.enemigos.some(e => e.vivo && Math.hypot(e.x - nx, e.y - j.y) < e.r + j.r + 2);
    if (nx < rj.xMin || nx > rj.xMax || estorba || tocaBola(s, nx, j.y, j.r)) { j.dir = -j.dir; return; }
    j.x = nx; j.vx = j.dir * rj.velocidad;
    for (const c of j.cajas) { c.x = j.x + c.dx; c.y = j.y + c.dy; }
  }
  // la pala a la que apunta: una de las del nivel de la bola, nunca una ya congelada
  function eligePala(s) {
    const b = s.bolas.find(x => x.vivo && x.estado === 'mesa');
    const nivel = b ? PB.mesa.nivelDe(s.r.mesa, b.y) : 'arriba';
    return s.az.elige(s.palas.filter(p => p.nivel === nivel && p.congelada <= 0));
  }
  function apunta(s, j) {
    const pala = eligePala(s);
    if (!pala) return;
    j.apunta = pala.id; j.aviso = s.r.jefe.frio.aviso; j.cuenta = 0;
    PB.palas.medio(pala, P);
    PB.emite(s, 'jefe_aviso', { pala: pala.id, x: P.x, y: P.y, segundos: j.aviso });
  }
  function frio(s, j, h) {
    const f = s.r.jefe.frio;
    if (j.apunta) {
      j.aviso -= h;
      if (j.aviso <= 0) { PB.proyectiles.cubito(s, j, s.palas.find(p => p.id === j.apunta)); j.apunta = null; }
      return;
    }
    const libre = !PB.proyectiles.vuela(s) && s.palas.every(p => p.congelada <= 0);
    j.cuenta = libre ? j.cuenta + h : j.cuenta;
    if (j.cuenta >= (j.rabia ? f.cadaRabia : f.cada)) apunta(s, j);
  }
  function paso(s, h) {
    const j = s.sala.jefe;
    if (!j || !j.vivo) return;
    nucleo(s, j, h);
    if (j.nucleo <= 0 && !j.movil) vuelvenCajas(s, j);
    if (j.movil) mueve(s, j, h);
    frio(s, j, h);
  }
  function llama(s, j) {
    let n = 0;
    for (let i = 0; i < s.r.jefe.llama; i++) {
      const o = PB.salas.enemigo(s.sala, s.mesa, s.r, 'becario', 'arriba', s.sala.vida, PB.jefe.cosas(s), s.az);
      if (o) { o.llamado = true; n += 1; }
    }
    PB.emite(s, 'jefe_llama', { x: j.x, y: j.y, cuantos: n });
  }
  // lo que ya ocupa sitio en la sala (para poner a los becarios que llama)
  const cosas = s => [s.sala.jefe, ...s.sala.jefe.cajas, ...s.sala.setas, ...s.sala.enemigos, ...s.bolas.filter(b => b.vivo)];
  // tras quitarle vida: rabia al 50 %, movimiento al 25 %, vencido a 0. Devuelve si está vencido
  function herido(s) {
    const j = s.sala.jefe, rj = s.r.jefe;
    if (!j.rabia && j.vida <= j.vidaMax * rj.rabia) { j.rabia = true; llama(s, j); }
    if (!j.movil && j.vida <= j.vidaMax * rj.movil) { j.movil = true; j.nucleo = 1; for (const c of j.cajas) c.vivo = false; }
    if (j.vida > 0) return false;
    vencido(s, j);
    return true;
  }
  function vencido(s, j) {
    const u = s.r.jefe.ultimoGolpe;
    j.vivo = false; j.apunta = null;
    for (const c of s.cubitos) c.vivo = false;
    const p = PB.marcador.premia(s, s.r.puntos.cosas.jefe);
    PB.emite(s, 'jefe_vencido', { x: j.x, y: j.y, ...p, camaraLenta: u.camaraLenta, factor: u.factor });
    PB.partida.jefeVencido(s);
  }
  return { crea, paso, cajaRota, herido, cosas };
})();
