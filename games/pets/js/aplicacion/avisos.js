// Fans Of Pets · aplicación · AVISOS: lo que la partida le cuenta al sistema de retos (los logros) cada vez que pasa algo. Los casos de uso
// llaman a tras(accion, resultado) después de cada acción del jugador y a pasa(loQuePasa) después de simular; aquí se traduce a los eventos
// que miden los logros (PT.LOGROS: ev) y a los máximos de la colección (criaturas desbloqueadas, jefes por criatura). El dominio no sabe
// de logros: solo cuenta lo que ha pasado. El puerto retos es { evento(ev, n), maximo(ev, n), conseguido(id) } (el adaptador de RETOSL de core,
// o uno de mentira en los tests).
'use strict';
PT.creaAvisos = (retos, partida) => {
  const ev = (nombre, n) => retos.evento(nombre, n);
  const DE_PASA = { nacio: 'nacio', nomina: 'nomina', convencida: 'convencida', seMarcha: 'dimision' };

  // tras una acción del jugador que salió bien (o el error que también cuenta, como el empacho)
  function tras(accion, r) {
    if (accion === 'cuida' && r.error === 'muchas-chuches') ev('empacho');
    if (!r.ok) return;
    if (accion === 'terminaEntrevista') ev('contratado');
    if (accion === 'ponHorario') ev('horario');
    if (accion === 'dormirODespertar' && r.valor === 'dormir' && partida().mascota.motivo === 'siesta') ev('siesta');
    if (accion === 'contraoferta') ev('convencida');
    if (accion === 'despide') { ev('despedida'); coleccion(); }
    if (accion === 'asciende') ascenso(r.valor);
  }
  // tras simular: lo que ha pasado solo
  function pasa(p) {
    for (const k in DE_PASA) if (p[k]) ev(DE_PASA[k]);
    if (p.nacio) coleccion();
  }
  function ascenso(rama) {
    const p = partida();
    ev('ascenso');
    ev('ascenso-' + p.nombreRitmo);
    ev('rama-' + rama);
    coleccion();
    if (['rapido', 'medio', 'largo'].every(id => retos.conseguido(id))) ev('polivalente');
  }
  // los máximos de la colección: criaturas desbloqueadas (eclosionadas alguna vez), por facción, y los jefes conseguidos por criatura
  function coleccion() {
    const p = partida(), vistas = new Set(p.album.map(e => e.criatura));
    if (p.criatura && p.mascota) vistas.add(p.criatura.id);
    retos.maximo('desbloqueadas', vistas.size);
    for (const f of new Set([...vistas].map(id => id.split(':')[0]))) retos.maximo('fac:' + f, [...vistas].filter(id => id.startsWith(f + ':')).length);
    const jefes = {};
    for (const e of p.album) if (e.resultado === 'ascenso') (jefes[e.criatura] = jefes[e.criatura] || new Set()).add(e.rama);
    for (const id in jefes) retos.maximo('jefes:' + id, jefes[id].size);
    retos.maximo('jefes-siesta', Object.keys(jefes).filter(id => jefes[id].has('siesta')).length);
  }
  return { tras, pasa };
};
