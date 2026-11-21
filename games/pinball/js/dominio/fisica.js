// Fans of Pinball · dominio · FÍSICA: un paso de la mesa partido en subpasos para que nada se atraviese (MOVIL.md, apartado 2): en cada
// subpaso la bola avanza como mucho medio radio y cada pala gira como mucho unos 3 grados. Orden de choques en cada subpaso: dianas y
// máquinas de café (rebotan con empujón), cosas con vida (rompibles, enemigos, jefe y sus cajas), palas y, al final, las paredes (pasadas
// hasta que no quede ninguna solapada: la pared siempre gana; la cara de dentro de los rebotadores da patada; las puertas del ascensor y
// de la tienda solo cierran a veces). Después, los sensores: el hueco de abajo (bola perdida), la boca de la rampa (viaje a la
// fotocopiadora), la puerta de la tienda de Lola y el ascensor abierto.
'use strict';
PB.fisica = (() => {
  const PASADAS = 8;
  function subpasos(s, dt) {
    const f = s.r.fisica;
    let n = 1;
    for (const b of s.bolas) if (b.vivo && b.estado === 'mesa') n = Math.max(n, Math.ceil(PB.geo.rapidez(b) * dt / (b.r * f.avanceSubpaso)));
    if (s.palas.some(PB.palas.seMueve)) n = Math.max(n, Math.ceil(s.r.mesa.velocidadSube * dt / f.giroSubpaso));
    return Math.min(n, f.maxSubpasos);
  }
  function mueve(s, b, h) {
    b.vy += s.r.fisica.gravedad * h;
    PB.geo.limita(b, s.r.fisica.velocidadMaxima);
    b.x += b.vx * h; b.y += b.vy * h; b.ang += b.vx / b.r * h;
  }
  // un círculo fijo que rebota con empujón hacia fuera (diana o máquina de café); devuelve si lo ha tocado
  function empuja(b, o, rebote, impulso) {
    if (!PB.geo.toca(b, o.x, o.y, o.r)) return false;
    PB.geo.rebota(b, o.x, o.y, o.r, 0, 0, rebote);
    b.vx += PB.geo.N.x * impulso; b.vy += PB.geo.N.y * impulso;
    return true;
  }
  function seta(s, b, o) {
    const f = s.r.fisica;
    if (empuja(b, o, f.rebote.seta, f.impulsoSeta)) PB.golpes.seta(s, b, o);
  }
  function maquina(s, b, o) {
    const f = s.r.fisica;
    if (empuja(b, o, f.rebote.maquina, f.impulsoMaquina)) PB.golpes.maquina(s, b, o);
  }
  // una cosa con vida: golpe (si llega con fuerza) y rebote (salvo si la rompe con Perforante)
  function golpea(s, b, o, rebote) {
    if (!o.vivo || !PB.geo.toca(b, o.x, o.y, o.r)) return;
    const vcx = o.vx || 0, imp = PB.geo.impacto(b, o.x, o.y, vcx, 0);
    const atraviesa = imp >= s.r.fisica.impactoMinimo && PB.golpes.toca(s, b, o, PB.geo.rapidez(b));
    if (!atraviesa) PB.geo.rebota(b, o.x, o.y, o.r, vcx, 0, rebote);
  }
  function cosas(s, b) {
    const sala = s.sala, rb = s.r.fisica.rebote, j = sala.jefe;
    for (const o of sala.setas) seta(s, b, o);
    for (const o of sala.maquinas) maquina(s, b, o);
    for (const o of sala.enemigos) golpea(s, b, o, rb.enemigo);
    for (const o of sala.rompibles) golpea(s, b, o, rb.rompible);
    if (!j) return;
    for (const o of j.cajas) golpea(s, b, o, rb.rompible);
    golpea(s, b, j, rb.jefe);
  }
  function golpePala(s, b, p) {
    PB.geo.limita(b, s.r.fisica.velocidadMaxima);
    const v = PB.geo.rapidez(b);
    b.sinTocar = 0;
    PB.emite(s, 'pala', { pala: p.id, x: b.x, y: b.y, fuerza: v });
    if (v >= s.r.fisica.golpeFuerte) PB.poderes.golpeFuertePala(s, b);
  }
  function palas(s, b) {
    const f = s.r.fisica;
    for (const p of s.palas) {
      const imp = PB.palas.choca(b, p, s.cif.fuerzaPala, f.rebote.pala);
      if (imp < 0) continue;
      if (p.pulsada && p.w === 0) b.atrapada = true;
      if (p.w !== 0 && imp >= f.impactoMinimo) golpePala(s, b, p);
    }
  }
  // la cara de dentro del rebotador: patada hacia fuera si la bola llega con algo de fuerza
  function patada(s, b, p, llega) {
    const k = s.r.fisica.impulsoRebotador;
    if (llega < k.minimo) return;
    b.vx += PB.geo.N.x * k.fuerza; b.vy += PB.geo.N.y * k.fuerza;
    PB.golpes.rebotador(s, b, p);
  }
  // devuelve si ha tenido que sacar la bola
  function pared(s, b, p, rebote) {
    if (PB.geo.dist2Segmento(b.x, b.y, p.ax, p.ay, p.bx, p.by) >= b.r * b.r) return false;
    const llega = PB.geo.rebota(b, PB.geo.P.x, PB.geo.P.y, 0, 0, 0, p.tipo === 'rebotador' ? s.r.fisica.rebote.rebotador : rebote);
    if (p.tipo === 'marco') b.tocoMarco = s.sala.tiempo;
    else if (p.tipo === 'rebotador') patada(s, b, p, llega);
    return true;
  }
  // la puerta de la tienda cierra si no se puede entrar: con la persiana bajada, o sin fichas (y entonces Lola avisa)
  function puertaTienda(s, b, e) {
    if (PB.tienda.puedeEntrar(s) || !pared(s, b, s.mesa.puertaTienda, e)) return false;
    PB.tienda.avisa(s, b);
    return true;
  }
  function pasada(s, b, e) {
    let saca = false;
    for (const p of s.mesa.paredes) saca = pared(s, b, p, e) || saca;
    saca = puertaTienda(s, b, e) || saca;
    return (!s.sala.abierta && pared(s, b, s.mesa.puerta, e)) || saca;
  }
  // pasadas hasta que ninguna pared tenga que sacarla (en una esquina estrecha hacen falta varias)
  function paredes(s, b) {
    const e = s.r.fisica.rebote.pared;
    for (let i = 0; i < PASADAS && pasada(s, b, e); i++);
  }
  const entre = (b, z) => b.y < z.entra && b.x > z.x0 && b.x < z.x1;
  function sensores(s, b) {
    const m = s.r.mesa, ra = m.rampa;
    if (b.y > m.desague) return PB.bolas.pierde(s, b);
    if (b.x > ra.x0 && b.y > ra.y0 && b.y < ra.y1) {
      PB.emite(s, 'rampa', { x: b.x, y: b.y });
      return PB.bolas.viaja(b, ra);
    }
    if (entre(b, m.tienda) && PB.tienda.puedeEntrar(s)) return PB.tienda.entra(s, b);
    if (s.sala.abierta && entre(b, m.escalera)) PB.partida.entraEscalera(s, b);
  }
  function subpaso(s, b, h) {
    mueve(s, b, h);
    cosas(s, b);
    palas(s, b);
    paredes(s, b);
    PB.geo.limita(b, s.r.fisica.velocidadMaxima);
    if (s.fase === 'jugando') sensores(s, b);
  }
  // un paso de física de dt segundos: palas y bolas a la vez, subpaso a subpaso
  function paso(s, dt) {
    const n = subpasos(s, dt), h = dt / n, factor = s.r.enemigos.cafe.factor;
    PB.golpes.enfriaFijos(s, dt);
    for (const b of s.bolas) b.atrapada = false;
    for (let i = 0; i < n && s.fase === 'jugando'; i++) {
      for (const p of s.palas) PB.palas.mueve(p, h, s.r.mesa, factor);
      for (const b of s.bolas) if (b.vivo && b.estado === 'mesa' && s.fase === 'jugando') subpaso(s, b, h);
    }
  }
  return { paso, subpasos };
})();
