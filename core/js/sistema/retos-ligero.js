// Fans Of · RETOS PARA JUEGOS LIGEROS: misiones diarias, semanales y logros sin oro, gemas ni pase de core.
// El SISTEMA es común (qué misiones salen cada día, cómo se cuentan los avisos, qué está listo para cobrar);
// el juego pone sus DATOS y sus FIRMAS (dónde guarda, cómo paga, qué día es). Las pantallas son del juego.
// Uso:  const RETOS_X = RETOSL.crear({ save: () => SAVE, guardar, pagar, diarias, semanales, logros, nDiarias: 3, nSemanales: 2 });
//   save()          el objeto de la partida del juego (se guarda tal cual en la nube); aquí se usa su campo `retos`
//   guardar()       guarda la partida (y avisa a la cuenta) tras cada cambio
//   pagar(r, tipo)  entrega el premio r (el juego sabe en qué moneda); tipo: 'diaria' | 'semanal' | 'logro'
//   diarias, semanales   [{ id, txt, goal, ev, r }]: cada día/semana salen n de la lista, las mismas para todo el mundo
//   logros               [{ id, txt, goal, ev, r }]: se miden contra el total de toda la vida de ese evento
// El juego avisa de lo que pasa con evento(ev, n) (suma) o maximo(ev, n) (se queda con el mayor). Para el resto de reglas del
// proyecto (textos en español con tr(), monedas ganada/comprada) ver docs/guia/core/retos.md.
// Nota: retos.js (el de Rumble, TD y Survivors) no usa esto todavía; su migración está en docs/decisiones/023.
'use strict';
const RETOSL = (() => {
  const dosCifras = n => String(n).padStart(2, '0');
  const diaDe = d => d.getFullYear() + '-' + dosCifras(d.getMonth() + 1) + '-' + dosCifras(d.getDate());
  function lunesDe(d) { const atras = (d.getDay() + 6) % 7; return diaDe(new Date(d.getFullYear(), d.getMonth(), d.getDate() - atras)); }
  function semillaDe(texto) { let h = 7; for (const ch of texto) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; }
  function azar(semilla) { let a = semilla >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  // n misiones de la lista, siempre las mismas para la misma clave (el día o la semana)
  function sortea(lista, n, clave) {
    const R = azar(semillaDe(clave)), resto = lista.slice(), salen = [];
    while (salen.length < n && resto.length) salen.push(resto.splice(Math.floor(R() * resto.length), 1)[0]);
    return salen.map(m => ({ id: m.id, prog: 0, cobrada: false }));
  }

  function crear(cfg) {
    const nD = cfg.nDiarias || 3, nS = cfg.nSemanales || 2;
    const hoy = cfg.hoy || (() => new Date());
    function datos() {
      const s = cfg.save(); if (!s.retos) s.retos = { dia: null, semana: null, total: {}, logros: {} };
      return s.retos;
    }
    // renueva las listas cuando cambia el día o la semana (o si la lista de datos cambió)
    function repasa() {
      const r = datos(), ahora = hoy(), dia = diaDe(ahora), sem = lunesDe(ahora);
      const cambioD = !r.dia || r.dia.clave !== dia || r.dia.lista.length !== Math.min(nD, cfg.diarias.length) || r.dia.lista.some(m => !cfg.diarias.some(x => x.id === m.id));
      const cambioS = !r.semana || r.semana.clave !== sem || r.semana.lista.length !== Math.min(nS, cfg.semanales.length) || r.semana.lista.some(m => !cfg.semanales.some(x => x.id === m.id));
      if (cambioD) r.dia = { clave: dia, lista: sortea(cfg.diarias, nD, 'd' + dia) };
      if (cambioS) r.semana = { clave: sem, lista: sortea(cfg.semanales, nS, 'w' + sem) };
      if (cambioD || cambioS) cfg.guardar();
      return r;
    }
    const defDe = (p, id) => (p === 'l' ? cfg.logros : p === 'd' ? cfg.diarias : cfg.semanales).find(x => x.id === id);

    // el juego avisa de lo que pasa: suma n a las misiones de ese evento y al total de toda la vida
    function evento(ev, n) {
      n = n === undefined ? 1 : n; if (!(n > 0)) return;
      const r = repasa();
      for (const lista of [r.dia.lista, r.semana.lista]) {
        const p = lista === r.dia.lista ? 'd' : 's';
        for (const m of lista) { const d = defDe(p, m.id); if (d && d.ev === ev && !m.cobrada) m.prog = Math.min(d.goal, m.prog + n); }
      }
      r.total[ev] = (r.total[ev] || 0) + n; cfg.guardar();
    }
    // como evento, pero para lo que se mide por el mejor valor (el rango más alto alcanzado)
    function maximo(ev, n) {
      const r = repasa(); if (!(n > (r.total[ev] || 0))) return;
      r.total[ev] = n; cfg.guardar();
    }

    // lo que enseña la pantalla: [{ id, txt, goal, prog, r, listo, cobrada }]
    function lista(p) {
      const r = repasa();
      if (p === 'l') return cfg.logros.map(d => { const prog = Math.min(d.goal, r.total[d.ev] || 0); return { id: d.id, txt: d.txt, goal: d.goal, prog, r: d.r, listo: prog >= d.goal, cobrada: !!r.logros[d.id] }; });
      const mias = p === 'd' ? r.dia.lista : r.semana.lista;
      return mias.map(m => { const d = defDe(p, m.id); return { id: m.id, txt: d.txt, goal: d.goal, prog: m.prog, r: d.r, listo: m.prog >= d.goal, cobrada: m.cobrada }; });
    }
    function cobrar(p, id) {
      const r = repasa(), d = defDe(p, id); if (!d) return false;
      if (p === 'l') { if (r.logros[id] || (r.total[d.ev] || 0) < d.goal) return false; r.logros[id] = 1; }
      else { const m = (p === 'd' ? r.dia.lista : r.semana.lista).find(x => x.id === id); if (!m || m.cobrada || m.prog < d.goal) return false; m.cobrada = true; }
      cfg.pagar(d.r, p === 'l' ? 'logro' : p === 'd' ? 'diaria' : 'semanal'); cfg.guardar(); return true;
    }
    // cuántos premios esperan en cada lista (para el globo del botón)
    function listos(p) { return lista(p).filter(x => x.listo && !x.cobrada).length; }
    function listosTodos() { return listos('d') + listos('s') + listos('l'); }
    return { evento, maximo, lista, cobrar, listos, listosTodos };
  }
  return { crear };
})();
