// Fans Of Nova · NV.Golpe: las reglas de un impacto sobre un enemigo (escudo, estados, reacciones y combos), sin sonido, chispas ni azar.
// Cada paso es una función corta: unas devuelven el daño que queda, otras cambian al enemigo `e` (el dominio es suyo) y devuelven los avisos
// que la pantalla debe enseñar ({ txt, color, g, dy, t }). nvGolpe (armas.js) los junta y se ocupa de dibujar. Probado en tests/nova/unitarios.
'use strict';
NV.Golpe = (() => {
  const escudoEnPie = e => e.esc > 0 && !(e.est.escudoCaido > 0);
  const aviso = (e, txt, color, g, dy, t) => ({ x: e.x, y: e.y - dy, t, txt, color, g });

  // La EM no atraviesa un escudo en pie ni un casco pasivo: antes hay que tumbarlo
  function repele(e, carga) { return carga === 'em' && (escudoEnPie(e) || !!e.d.pasivo); }

  // Lo que cambia el daño antes de tocar el escudo: Brecha, Ablandado, Interferido, resistencia del casco y Cazador del lanzador.
  // `seAleja`: si el enemigo huye de tu nave (lo calcula quien llama, porque necesita la posición de la nave).
  function multiplicaDano(d, e, w, K, seAleja) {
    const carga = w.carga, est = e.est;
    if (carga === 'cinetica' && est.brecha > 0) d *= 1.5;
    if ((carga === 'cinetica' || carga === 'explosiva') && e.calor > 0) d *= 1 + Math.min(K.ablandado.max, K.ablandado.porCalor * e.calor);
    if (est.interferido > 0 && carga !== 'em') d *= 1 + K.interferencia.defensa;
    if (e.resiste === carga) d *= 0.5;
    if (w.portador === 'lanzador' && seAleja) d *= K.cazador.mult;
    return d;
  }

  // Qué reacción provocan el estado que ya tiene el enemigo y la carga que le llega (null si ninguna)
  function eligeReaccion(est, carga, reacciones) {
    for (const r of reacciones) {
      if (!(est[r.a] > 0) && !(r.a === 'marcado' && est.marcado > 0)) continue;
      const ok = r.b === 'cualquiera' || r.b === carga || (r.id === 'impactoLimpio' && carga === 'cinetica') || (r.id === 'fundido' && carga === 'termica');
      if (!ok || (r.a === 'marcado' && carga !== 'explosiva')) continue;
      return r;
    }
    return null;
  }

  // El escudo absorbe y la energía lo tumba; devuelve el daño que pasa al casco (antes de multCasco)
  function absorbeEscudo(e, d, w, c, A) {
    const K = A.combos, est = e.est;
    const pasa = w.portador === 'railgun' && w.carga === 'cinetica' ? d * K.perforaescudos.pasa : 0;   // Perforaescudos: parte va directa al casco
    d -= pasa;
    const mE = c.multEscudo, abs = Math.min(e.esc, d * mE);
    e.esc -= abs; d = Math.max(0, d - abs / mE) + pasa;
    if (w.carga === 'energia' || e.esc <= 0) { est.escudoCaido = A.estados.escudoCaido.duracion; e.esc = 0; }
    return d;
  }

  // Térmica: acumula calor (el doble con Haz enfocado, más con el láser, menos si está Interferido); a 100 explota y vuelve a 0
  function calienta(e, w, A, fuera) {
    const K = A.combos;
    e.calor += 14 * (w.fusion && w.fusion.id === 'hazEnfocado' ? 2 : 1) * (w.portador === 'laser' ? K.laser.acumula : 1) * (e.est.interferido > 0 ? K.sobrecargaLenta.calor : 1);
    if (e.calor < 100) return;
    e.calor = 0; fuera.explosion = { radio: 70, dano: 50 * A.tamanos[w.tam] };
    fuera.avisos.push(aviso(e, '¡Sobrecarga!', '#ff4b4b', 1, 20, 1));
  }
  // EM: interfiere (el doble sobre una Brecha, salvo en área), alarga el Escudo caído (Cortacircuitos) y acumula sistemas hasta el Apagón
  function interfiere(e, w, c, A, sinReaccion, fuera) {
    const K = A.combos, est = e.est, nuevo = !(est.interferido > 0);
    est.interferido = A.estados[c.estado].duracion * ((est.brecha > 0 && !sinReaccion) ? 2 : 1);
    if (est.escudoCaido > 0) est.escudoCaido = Math.max(est.escudoCaido, K.cortacircuitos.escudoCaido);
    e.sis = (e.sis || 0) + K.interferencia.sistemas * (w.portador === 'laser' ? K.laser.acumula : 1);
    if (e.sis >= 100) { e.sis = 0; est.apagon = (e.d.jefe || e.d.capitan ? 0.5 : 1) * A.estados.apagon.duracion; fuera.avisos.push(aviso(e, 'Apagón', c.color, 1, 20, 1)); }
    else if (nuevo) fuera.avisos.push(aviso(e, 'Interferido', c.color, 0, 20, 0.8));
  }
  // El estado que deja cada carga. Devuelve { avisos, explosion }: `explosion` pide a quien llama una explosión de sobrecarga.
  function aplicaEstado(e, w, c, A, sinReaccion) {
    const fuera = { avisos: [], explosion: null };
    if (c.estado === 'sobrecalentado') calienta(e, w, A, fuera);
    else if (c.estado === 'interferido') interfiere(e, w, c, A, sinReaccion, fuera);
    else e.est[c.estado] = A.estados[c.estado].duracion;
    return fuera;
  }

  // El siguiente impacto de otro tipo que no sea explosivo contra un Marcado es crítico, y gasta la marca
  function consumeMarca(est, carga) {
    if (!(est.marcado > 0) || carga === 'explosiva') return false;
    est.marcado = 0;
    return true;
  }

  // Golpeado en el casco mientras está Interferido, el escudo tarda en volver (`d` es el daño que llegó al casco). Va ANTES de aplicar el estado.
  function frenaEscudo(e, d, K, sinEstado) {
    if (d > 0 && e.est.interferido > 0 && e.d.esc && !sinEstado) e.sinEsc = K.sobrecargaLenta.sinEscudo;
  }

  // Plasma: la energía atiza el calor que el enemigo ya tiene (sin pasar de 99: la sobrecarga la dispara un golpe térmico)
  function plasma(e, w, K, sinEstado) {
    if (w.carga === 'energia' && e.calor > 0 && e.calor < 99 && !sinEstado) e.calor = Math.min(99, e.calor + K.plasma.calor);
  }

  return { consumeMarca, frenaEscudo, plasma, repele, multiplicaDano, eligeReaccion, absorbeEscudo, aplicaEstado, escudoEnPie };
})();
