// Fans of Pop · MEMORIA, LAS REGLAS (dominio, tarea #141 fase 1): qué tablero toca en cada ronda (crece de 3x3 a 4x4 y luego a la
// forma del mundo), la nota de cada burbuja (de grave a aguda por orden), la velocidad y las ayudas de cada dificultad, el instrumento
// de cada mundo, qué mundos se pueden elegir, el récord de cada dificultad y las dos ayudas de la fase 2 (ADR 216): seguir tras fallar
// (una vez por partida) y repetir la melodía (con perlas, contadas). Todo son funciones puras sobre los datos que se les pasan
// (PP_CFG.memoria, PP_FORMAS, PP_FORMAS_MUNDO): sin reloj, azar, SAVE ni dibujo. Lo usan js/memoria.js y js/memoria-elige.js.
'use strict';
const PP_MEM_R = (() => {
  const DIFICULTADES = Object.freeze(['facil', 'normal', 'dificil']);
  const PENTA = [0, 2, 4, 7, 9];   // los grados de la pentatónica (semitonos dentro de la octava)
  const DO5 = 523.25;              // la primera nota de PP_NOTAS: el 3x3 suena igual que antes
  const MAX_ARRIBA = 12;           // la nota más aguda: la 13.ª de PP_NOTAS (2637 Hz); los tableros grandes bajan por abajo

  // la dificultad válida (lo que no se conoce es Normal)
  const dificultad = id => (DIFICULTADES.includes(id) ? id : 'normal');
  // lo de cada dificultad: cuánto se multiplica el paso y su mínimo, a los cuántos segundos de duda brilla la buena (0 = nunca) y si
  // la melodía se ve (luces) o solo se oye
  function ajustesDe(cfg, id) {
    const d = cfg.dificultades[dificultad(id)];
    return Object.freeze({ id: dificultad(id), paso: d.paso, pasoMin: d.pasoMin, pista: d.pista, luces: d.luces });
  }
  // cuánto dura cada burbuja de la melodía en la ronda r (segundos): la de siempre por el multiplicador de la dificultad
  const paso = (cfg, id, r) => {
    const d = ajustesDe(cfg, id);
    return Math.max(cfg.pasoMin * d.pasoMin, (cfg.paso - (r - 1) * cfg.acelera) * d.paso);
  };
  // ¿brilla ya la buena como pista? (Fácil, tras `pista` segundos sin tocar)
  const tocaPista = (ajustes, espera) => ajustes.pista > 0 && espera >= ajustes.pista;

  // el tablero de la ronda r en el mundo m: lleno de 3x3, lleno de 4x4 y, desde `crece.forma`, la forma del mundo
  function formaDe(cfg, formas, formasMundo, m, r) {
    const c = cfg.crece;
    if (r < c.lado4) return lleno(cfg.lado);
    if (r < c.forma) return lleno(4);
    const propias = formasMundo[m] && formasMundo[m][c.ladoForma];
    if (propias && propias.length) return propias[0];
    const comunes = formas[c.ladoForma];
    return comunes[((m % comunes.length) + comunes.length) % comunes.length];
  }
  const lleno = n => Array.from({ length: n }, () => '#'.repeat(n));
  // de las filas de texto ('#' = burbuja) al tablero: { lado, mask }
  const mascara = forma => ({ lado: forma.length, mask: forma.join('').split('').map(ch => (ch === '#' ? 1 : 0)) });
  // ¿cambia el tablero al empezar la ronda r? (para avisar y dar un respiro)
  const crece = (cfg, r) => r === cfg.crece.lado4 || r === cfg.crece.forma;

  // el puesto de la burbuja i entre las que hay (de arriba a la izquierda a abajo a la derecha)
  function puesto(mask, i) { let k = 0; for (let j = 0; j < i; j++) if (mask[j]) k++; return k; }
  // la nota (Hz) de la burbuja con puesto k de `total`: la pentatónica desde Do5 hacia arriba; si no caben, empieza más grave
  function nota(k, total) {
    const s = k - Math.max(0, total - 1 - MAX_ARRIBA), oct = Math.floor(s / 5), g = PENTA[((s % 5) + 5) % 5];
    return Math.round(DO5 * Math.pow(2, oct + g / 12));
  }
  // la burbuja que se añade a la melodía: una de las del tablero que no sea la última (no se vería), elegida con `u` (de 0 a 1, el azar
  // de quien llama: el de siempre o el del reto del día, con semilla)
  function elige(mask, ultima, u) {
    const libres = [...mask.keys()].filter(i => mask[i] && i !== ultima);
    return libres[Math.min(libres.length - 1, Math.floor(u * libres.length))];
  }
  // la melodía en el tablero nuevo: cada burbuja pasa a la del tablero nuevo más cercana a su mismo sitio (en proporción)
  function traduce(sec, nViejo, maskNuevo, nNuevo) {
    return sec.map(i => {
      const x = ((i % nViejo) + 0.5) / nViejo * nNuevo - 0.5, y = (Math.floor(i / nViejo) + 0.5) / nViejo * nNuevo - 0.5;
      let mejor = -1, dist = Infinity;
      maskNuevo.forEach((v, j) => {
        if (!v) return;
        const d = (j % nNuevo - x) ** 2 + (Math.floor(j / nNuevo) - y) ** 2;
        if (d < dist - 1e-9) { dist = d; mejor = j; }
      });
      return mejor;
    });
  }

  // el instrumento del mundo m (el de la caja de música si no tiene)
  const instrumento = (cfg, m) => cfg.instrumentos[m] || cfg.instrumentos[0];
  // qué mundos se pueden elegir: los que ya has alcanzado en el camino (`nivel`, desde 0); el primero, siempre
  function abiertos(nivel, niveles) {
    let inicio = 0;
    return niveles.map(n => { const si = inicio <= Math.max(0, nivel); inicio += n; return si; });
  }
  // el mundo elegido si se puede; si no, el último abierto
  function mundoValido(m, abiertosLista) {
    if (abiertosLista[m]) return m;
    return Math.max(0, abiertosLista.lastIndexOf(true));
  }

  // el récord de una dificultad: Normal es el de siempre (S.record, el que sube a la clasificación); Fácil y Difícil, en S.records
  const recordDe = (S, id) => (dificultad(id) === 'normal' ? S.record || 0 : (S.records && S.records[dificultad(id)]) || 0);
  // lo que cambia en S al acabar con `rondas` en esa dificultad (solo si es récord); `nuevo` dice si lo es
  function conRecord(S, id, rondas) {
    const d = dificultad(id);
    if (rondas <= recordDe(S, d)) return { nuevo: false, cambios: {} };
    if (d === 'normal') return { nuevo: true, cambios: { record: rondas } };
    return { nuevo: true, cambios: { records: Object.assign({}, S.records, { [d]: rondas }) } };
  }

  /* ---------- las ayudas (fase 2, ADR 216). `e` es el estado de la partida: { limpio, seguido, fase, sec, pistas, pistaRonda } ---------- */
  // en una partida `limpio` (un duelo contra gente, cuando lo haya) no vale ninguna ayuda
  const ok = () => Object.freeze({ ok: true });
  const error = motivo => Object.freeze({ ok: false, error: motivo });
  // ¿se ofrece seguir tras este fallo? Una vez por partida y solo si ya has repetido alguna melodía (`desdeRonda`)
  const puedeSeguir = (e, cfg) => !e.limpio && !e.seguido && e.sec.length >= cfg.seguir.desdeRonda;
  // lo que cambia al seguir: la misma ronda, con la misma melodía, se enseña otra vez desde el principio
  const trasSeguir = () => Object.freeze({ seguido: true, fase: 'mira', paso: 0, sigue: 0 });
  // cuántas veces queda «Repetir melodía» en esta partida
  const pistasQuedan = (e, cfg) => (e.limpio ? 0 : Math.max(0, cfg.pista.porPartida - (e.pistas || 0)));
  // ¿se ve el botón? En tu turno, si quedan y no la has usado ya en esta ronda
  const hayPista = (e, cfg) => e.fase === 'toca' && pistasQuedan(e, cfg) > 0 && e.pistaRonda !== e.sec.length;
  // ¿se puede usar ahora con esas perlas? Los fallos, con nombre: limpio, fase, agotada, ronda, perlas
  function puedePista(e, perlas, cfg) {
    if (e.limpio) return error('limpio');
    if (e.fase !== 'toca') return error('fase');
    if (pistasQuedan(e, cfg) <= 0) return error('agotada');
    if (e.pistaRonda === e.sec.length) return error('ronda');
    if (!(perlas >= cfg.pista.perlas)) return error('perlas');
    return ok();
  }
  // lo que cambia al usarla: una menos, gastada en esta ronda, y la melodía se enseña otra vez (tu turno empieza de cero)
  const trasPista = e => Object.freeze({ pistas: (e.pistas || 0) + 1, pistaRonda: e.sec.length, fase: 'mira', paso: 0, sigue: 0 });
  // el cobro de la partida cuando se cobra dos veces (al fallar y al acabar tras seguir): el récord vale si lo fue alguna vez y las
  // monedas se suman
  const sumaCobro = (a, b) => Object.freeze(a ? { nuevo: a.nuevo || b.nuevo, monedas: a.monedas + b.monedas, lleno: b.lleno } : { ...b });

  return Object.freeze({ elige, puedeSeguir, trasSeguir, pistasQuedan, hayPista, puedePista, trasPista, sumaCobro, DIFICULTADES, dificultad, ajustesDe, paso, tocaPista, formaDe, mascara, crece, puesto, nota, traduce, instrumento, abiertos, mundoValido, recordDe, conRecord });
})();
