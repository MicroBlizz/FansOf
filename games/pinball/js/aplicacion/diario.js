// Fans of Pinball · aplicación · DIARIO: lo que va por días (PROTOTIPO.md, «Motivos para volver»): la racha de días (un premio al día;
// un día perdido la deja como estaba menos un día, no a cero), la primera partida del día (fichas ×2) y las 3 misiones del día, que
// cuenta el sistema común de core (RETOSL, core/js/sistema/retos-ligero.js) con los datos de AJUSTES.vida. El día es el del calendario
// del jugador. Puertos: { reglas, sesion, reloj: { ahora() → ms } }.
'use strict';
PB.calendario = (() => {
  const dos = n => String(n).padStart(2, '0');
  const dia = d => d.getFullYear() + '-' + dos(d.getMonth() + 1) + '-' + dos(d.getDate());
  // días enteros entre dos claves 'AAAA-MM-DD' (b - a)
  function entre(a, b) {
    const n = t => { const [y, m, d] = t.split('-').map(Number); return Date.UTC(y, m - 1, d) / 86400000; };
    return n(b) - n(a);
  }
  const lunes = d => dia(new Date(d.getFullYear(), d.getMonth(), d.getDate() - (d.getDay() + 6) % 7));
  // milisegundos hasta el lunes que viene a las 00:00 (cuando cierra la semana)
  const hastaLunes = d => new Date(d.getFullYear(), d.getMonth(), d.getDate() - (d.getDay() + 6) % 7 + 7).getTime() - d.getTime();
  return { dia, entre, lunes, hastaLunes };
})();

PB.creaDiario = ({ reglas, sesion, reloj }) => {
  const V = reglas.vida, ahora = () => new Date(reloj.ahora()), hoy = () => PB.calendario.dia(ahora());
  const retos = RETOSL.crear({
    save: () => sesion.datos, guardar: () => sesion.guarda(), pagar: r => { sesion.datos.fichas += r; },
    diarias: V.misiones, semanales: [], logros: [], nDiarias: V.misionesPorDia, nSemanales: 0, hoy: ahora,
  });
  // la racha que tendría hoy: +1 si ayer jugó, la de antes menos los días perdidos (mínimo 1) si no
  function rachaDeHoy() {
    const r = sesion.datos.racha;
    if (!r.dia) return 1;
    const pasan = PB.calendario.entre(r.dia, hoy());
    if (pasan <= 0) return r.dias;
    return pasan === 1 ? r.dias + 1 : Math.max(1, r.dias - (pasan - 1));
  }
  const premio = dias => V.racha[(dias - 1) % V.racha.length];
  return {
    get rachaDisponible() { return sesion.datos.racha.dia !== hoy(); },
    // lo que enseña el menú: { dias (los de hoy si cobra), premio, disponible }
    racha() { const dias = rachaDeHoy(); return { dias, premio: premio(dias), disponible: this.rachaDisponible, cofre: (dias - 1) % V.racha.length === V.racha.length - 1 }; },
    // cobra el premio de hoy: ok({ dias, fichas }) o error('racha_cobrada')
    cobraRacha() {
      if (!this.rachaDisponible) return PB.error('racha_cobrada');
      const dias = rachaDeHoy(), fichas = premio(dias);
      sesion.datos.racha = { dia: hoy(), dias };
      sesion.datos.fichas += fichas;
      sesion.guarda();
      return PB.ok({ dias, fichas });
    },
    get esPrimeraDelDia() { return sesion.datos.diaPrimera !== hoy(); },
    marcaPrimera() { sesion.datos.diaPrimera = hoy(); },
    misiones: () => retos.lista('d'),
    // apunta lo hecho en una partida ({ ev: cuántos }) y cobra las misiones que se cumplan: [{ id, txt, r }]
    apunta(cuenta) {
      for (const ev of Object.keys(cuenta)) if (cuenta[ev] > 0) retos.evento(ev, cuenta[ev]);
      const cobradas = [];
      for (const m of retos.lista('d')) if (m.listo && !m.cobrada && retos.cobrar('d', m.id)) cobradas.push({ id: m.id, txt: m.txt, r: m.r });
      return cobradas;
    },
    claveSemana: () => PB.calendario.lunes(ahora()),
    hastaLunes: () => PB.calendario.hastaLunes(ahora()),
  };
};
