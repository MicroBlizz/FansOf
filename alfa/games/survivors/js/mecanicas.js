// Fans of Survivors · Las mecánicas nuevas en la partida (inspiradas en PokéSurvivor, 7-11-2026), tras el flag 'survivors-mecanicas':
// evolución de armas (carta dorada), oleadas de choque, embestidas avisadas de los mini jefes, curanderos con tope, altares,
// fuentes, cofres con candado y cambio de cartas. Las reglas puras están en js/reglas.js y las cifras en js/datos-mecanicas.js.
// juego.js llama a MEC en unos pocos puntos (empezar, cada fotograma, apuntar, subir de nivel); si el flag está cerrado, todo sigue como antes.
'use strict';

const MEC = (() => {
  const M = MECANICAS, azar = Math.random;
  const activas = () => NUCLEO.flag('survivors-mecanicas', 'Survivors: evolución de armas, oleadas de choque, jefes que escalan, curanderos limitados, altares, fuentes, cofres con candado y cambio de cartas', false);
  const parejaDe = k => SVR.pareja(k, ARMAS[k], EVO_PAREJA, EVO_PAREJA_TIPO);
  const st = () => P && P.mec;

  /* ---------- empezar ---------- */
  function iniciar() {
    P.mec = activas() ? { evos: {}, choqueT: M.choque.primera, sitioT: M.sitios.primero, sitios: [], buffs: {}, cambios: M.cambiosCartas } : null;
  }

  /* ---------- evolución de armas ---------- */
  const evolucionada = k => !!(st() && st().evos[k]);
  // las cifras de un arma, con la evolución si la tiene
  const cifras = (k, v) => (evolucionada(k) ? SVR.aplicarEvolucion(v, M.evolucion) : v);
  // la carta dorada de cada arma que ya puede evolucionar
  function cartasEvolucion() {
    if (!st()) return [];
    return SVR.evolucionesListas(P.armas, P.pasivas, st().evos, SV.nivelMax, parejaDe).map(k => ({
      clase: 'evo', id: k, nombre: ARMAS[k].nombre, carta: ARMAS[k].carta, nuevo: false, nivelNuevo: SV.nivelMax, peso: M.evolucion.pesoCarta,
      desc: 'Mucho más daño, uno más a la vez y más área.' }));
  }
  function evolucionar(k) {
    st().evos[k] = true;
    aviso('¡EVOLUCIÓN!', tr(ARMAS[k].nombre));
    particulas(P.jug.x, P.jug.y - 30, 40, '#ffcb3d', 260, 6, 0.9); play('crown');
  }
  // lo que se añade a la descripción de un arma que llega a nivel 5: con qué mejora evoluciona
  function pista(k) {
    const p = st() && parejaDe(k);
    return p ? tr('Evoluciona con: {p}', { p: tr(PASIVAS[p].nombre) }) : '';
  }

  /* ---------- poderes de los altares ---------- */
  const buff = nombre => (st() && st().buffs[nombre] > 0 ? M.sitios.altar.poderes[nombre] : 1);

  /* ---------- apuntar: los curanderos y los que tienen poca vida, antes ---------- */
  function distancia(e, d2) {
    return st() ? SVR.distanciaApuntar(d2, !!e.d.cura, e.vida / e.vidaMax, M.curanderos) : d2;
  }

  /* ---------- curanderos ---------- */
  // el tipo de enemigo que sale de verdad: si ya hay demasiados curanderos, sale un becario
  function tipoQueSale(tipo) {
    if (!st() || !ENEMIGOS[tipo].cura) return tipo;
    const vivos = P.enemigos.filter(e => !e.muerto && e.d.cura).length;
    return SVR.caben(vivos, M.curanderos) ? tipo : 'becario';
  }
  // ¿este curandero puede curar a ese? (con el flag cerrado, a cualquiera menos a sí mismo, como antes)
  function puedeCurar(cur, o) {
    if (!st()) return o !== cur && o.vida < o.vidaMax;
    return SVR.puedeCurar(cur, { vida: o.vida, vidaMax: o.vidaMax, esCurandero: !!o.d.cura }) && o !== cur;
  }

  /* ---------- jefes ---------- */
  const ritmo = () => (st() ? SVR.ritmoOleada(M.jefes, P.enemigos.some(e => e.elite && !e.muerto)) : 1);
  const escalaJefe = () => (st() ? SVR.escalaJefe(M.jefes, P.t) : 1);
  // la embestida de un mini jefe: marca una franja hacia ti, se para un momento y carga
  function embestidas(dt) {
    const J = M.jefes;
    for (const e of P.enemigos) {
      if (!e.elite || e.muerto) continue;
      const E = e.emb || (e.emb = { fase: 'espera', t: D.jefes.embestidaCada });
      E.t -= dt;
      if (E.fase === 'espera' && E.t <= 0) {
        const dx = P.jug.x - e.x, dy = P.jug.y - e.y, d = Math.hypot(dx, dy) || 1;
        Object.assign(E, { fase: 'aviso', t: J.embestidaAviso, dx: dx / d, dy: dy / d, largo: J.embestidaVel * J.embestidaDura });
        e.congT = J.embestidaAviso; play('womp');
      } else if (E.fase === 'aviso' && E.t <= 0) Object.assign(E, { fase: 'carga', t: J.embestidaDura });
      else if (E.fase === 'carga') {
        e.x += E.dx * J.embestidaVel * dt; e.y += E.dy * J.embestidaVel * dt;
        if (E.t <= 0) Object.assign(E, { fase: 'espera', t: D.jefes.embestidaCada });
      }
    }
  }

  /* ---------- oleadas de choque ---------- */
  function choque(dt) {
    const C = M.choque, S = st();
    S.choqueT -= dt;
    if (S.choqueT > 0 || P.jefe) return;
    S.choqueT = SVR.esperaChoque(C, azar);
    const O = oleada(Math.floor(P.t / 60)), n = SVR.tamChoque(C, Math.floor(P.t / 60));
    const a = azar() * Math.PI * 2, cx = P.jug.x + Math.cos(a) * 470, cy = P.jug.y + Math.sin(a) * 470, px = -Math.sin(a), py = Math.cos(a);
    aviso('¡OLEADA DE CHOQUE!', '¡Viene una fila entera por un lado!'); play('horn');
    for (let i = 0; i < n && P.enemigos.length < SV.maxEnemigos; i++) {
      const k = (i - (n - 1) / 2) * 30;
      crearEnemigo(tipoQueSale(elegirPeso(O.mezcla)), cx + px * k, cy + py * k);
    }
  }

  /* ---------- sitios del mapa: altares, fuentes y cofres con candado ---------- */
  function sitios(dt) {
    const S = st(), D = M.sitios;
    S.sitioT -= dt;
    if (S.sitioT <= 0 && S.sitios.length < D.maxVivos) {
      S.sitioT = D.cada;
      const s = SVR.sorteaSitio(D, P.jug.x, P.jug.y, azar);
      S.sitios.push(Object.assign(s, { t: D.dura, queda: D.fuente.capacidad * P.jug.vidaMax, prog: 0 }));
    }
    for (const s of S.sitios) { s.t -= dt; usarSitio(s, Math.hypot(P.jug.x - s.x, P.jug.y - s.y) < D.radio, dt); }
    S.sitios = S.sitios.filter(s => s.t > 0);
    for (const k in S.buffs) S.buffs[k] = Math.max(0, S.buffs[k] - dt);
  }
  const USOS = {
    altar(s) {
      const p = SVR.sorteaPoder(M.sitios.altar, azar); st().buffs[p] = M.sitios.altar.dura; s.t = 0;
      aviso('¡ALTAR!', NOMBRE_PODER[p]); particulas(s.x, s.y - 20, 30, '#e879f9', 220, 5); play('shield');
    },
    fuente(s, dt) {
      const r = SVR.bebeFuente(M.sitios.fuente, P.jug.vidaMax, s.queda, dt); s.queda = r.queda; curarSuave(r.cura);
      if (s.queda <= 0) { s.t = 0; numero(s.x, s.y - 40, 'FUENTE VACÍA', '#7dd3fc'); }
    },
    candado(s, dt, cerca) {
      s.prog = SVR.progresoCandado(M.sitios.candado, s.prog, cerca, dt);
      if (s.prog >= 1) { s.t = 0; soltarCofre(s.x, s.y); numero(s.x, s.y - 50, '¡ABIERTO!', '#ffcb3d', true); }
    },
  };
  const NOMBRE_PODER = { dano: '25 segundos de doble daño', vel: '25 segundos de velocidad', iman: '25 segundos de imán gigante', recarga: '25 segundos de recarga rápida' };
  function usarSitio(s, cerca, dt) {
    if (s.tipo === 'candado') USOS.candado(s, dt, cerca);
    else if (cerca) USOS[s.tipo](s, dt);
  }

  /* ---------- dificultad ---------- */
  const D = M.dificultad;
  const xpNivel = n => (st() ? SVR.xpNivel(D.xp, n) : SV.xpNivel(n));
  const vidaMin = min => (st() ? SVR.vidaPorMinuto(D.vida, min) : vidaPorMinuto(min));
  const velMin = min => (st() ? SVR.velPorMinuto(D, min) : 1);
  const grupo = (base, min) => (st() ? SVR.grupoPorMinuto(D, base, min) : base);
  const velJefe = () => (st() ? D.jefes.vel : 0.9);
  // lo que se multiplica la velocidad de un enemigo que está a dd del jugador: SurvivalBot y (con el flag) los mini jefes corren si te alejas
  function persigue(e, dd) {
    if (e.jefe && dd > 380) return 2.6;
    if (st() && e.elite && dd > D.jefes.distCorre) return D.jefes.corre;
    return 1;
  }

  /* ---------- un principio con más ritmo ---------- */
  // la oleada del minuto `min` (la de M.inicio si la hay, si no la de OLEADAS)
  const oleada = min => (st() && M.inicio.oleadas[min]) || OLEADAS[Math.min(OLEADAS.length - 1, min)];
  // el segundo en que llega el momento especial número i
  const tEvento = (i, t) => (st() && i === 0 ? M.inicio.primerCerco : t);

  /* ---------- cambio de cartas ---------- */
  const cambiosQuedan = () => (st() ? st().cambios : 0);
  function gastaCambio() { if (cambiosQuedan() > 0) st().cambios--; }

  /* ---------- cada fotograma ---------- */
  function paso(dt) {
    if (!st()) return;
    choque(dt); embestidas(dt); sitios(dt);
  }
  return Object.freeze({ iniciar, paso, cifras, evolucionada, cartasEvolucion, evolucionar, pista, buff, distancia, tipoQueSale, puedeCurar,
    ritmo, escalaJefe, xpNivel, vidaMin, velMin, grupo, velJefe, persigue, oleada, tEvento, cambiosQuedan, gastaCambio, activas: () => !!st(), sitiosVivos: () => (st() ? st().sitios : []), buffs: () => (st() ? st().buffs : {}) });
})();
