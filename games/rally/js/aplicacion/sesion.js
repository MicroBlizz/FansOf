// Fans of Rally · aplicacion · SESIÓN: los casos de uso. Prepara cada carrera (pista, fichas de los coches y rivales), lleva el
// campeonato tramo a tramo con sus puntos, y guarda los récords en el almacén: la mejor vuelta y su fantasma de cada tramo en
// contrarreloj, y el mejor campeonato. Sin pantalla: la usan las pantallas de adaptadores/.
'use strict';
RA.creaSesion = ({ almacen, reglas, pilotos, rivales, tramos }) => {
  const pistas = {}, paisajes = {};
  const vacios = () => ({ piloto: pilotos[0].id, vueltas: {}, fantasmas: {}, campeonato: null });
  let records = { ...vacios(), ...(almacen.carga() || {}) };
  let temporada = null;
  const guarda = () => almacen.guarda(records);
  const pista = i => pistas[i] || (pistas[i] = RA.Pista.crea(tramos[i]));
  // dónde va cada adorno del tramo: lo mismo para lo que se ve y para lo que se choca
  const paisaje = i => paisajes[i] || (paisajes[i] = RA.Paisaje.reparte(pista(i), tramos[i], RA.Paisaje.limites(pista(i), 420), reglas.carrera.controles));
  const piloto = () => pilotos.find(p => p.id === records.piloto) || pilotos[0];

  function rivalesDe() {
    return rivales.slice(0, reglas.carrera.rivales).map((r, k) => ({
      id: r.id, ficha: RA.Coche.ficha(reglas.coche), pericia: reglas.ia.pericia[k % reglas.ia.pericia.length], carril: ((k % 3) - 1) * 0.18, goma: 0,
    }));
  }
  function carrera(modo, tramo) {
    const r = RA.Carrera.crea({ pista: pista(tramo), tramo: tramos[tramo], modo, reglas, jugador: { ficha: RA.Coche.ficha(reglas.coche, piloto()) }, rivales: rivalesDe(),
      obstaculos: RA.Paisaje.obstaculos(paisaje(tramo)) });
    return r.ok ? r.valor : null;
  }
  function eligePiloto(id) {
    if (!pilotos.some(p => p.id === id)) return RA.error('piloto_desconocido', id);
    records.piloto = id; guarda();
    return RA.ok(id);
  }
  // ---- campeonato: los tres tramos seguidos; el tiempo agotado lo acaba
  function empiezaCampeonato() {
    temporada = { tramo: 0, puntos: Object.fromEntries(['jugador', ...rivales.map(r => r.id)].map(id => [id, 0])), puestos: [], acabado: false };
    return temporada;
  }
  function apuntaCarrera(clasificacion, sinTiempo) {
    if (!temporada) return RA.error('sin_campeonato');
    if (sinTiempo) { temporada.acabado = true; temporada.sinTiempo = true; return RA.ok(temporada); }
    clasificacion.forEach((c, k) => { temporada.puntos[c.id] = (temporada.puntos[c.id] || 0) + (reglas.carrera.puntos[k] || 0); });
    temporada.puestos.push(clasificacion.findIndex(c => c.id === 'jugador') + 1);
    temporada.tramo++;
    if (temporada.tramo >= tramos.length) cierraCampeonato();
    return RA.ok(temporada);
  }
  function cierraCampeonato() {
    temporada.acabado = true;
    const yo = temporada.puntos.jugador;
    if (!records.campeonato || yo > records.campeonato.puntos) { records.campeonato = { puntos: yo, piloto: records.piloto }; temporada.record = true; guarda(); }
  }
  // la tabla del campeonato, de más a menos puntos
  const tabla = () => (temporada ? Object.entries(temporada.puntos).sort((a, b) => b[1] - a[1]) : []);
  // ---- contrarreloj: mejor vuelta y su fantasma por tramo
  function apuntaVuelta(tramo, tiempo, fantasma) {
    const id = tramos[tramo].id, antes = records.vueltas[id];
    if (antes && antes <= tiempo) return false;
    records.vueltas[id] = Math.round(tiempo * 1000) / 1000;
    if (RA.Fantasma.valido(fantasma)) records.fantasmas[id] = fantasma;
    guarda();
    return true;
  }
  const fantasmaDe = tramo => { const g = records.fantasmas[tramos[tramo].id]; return RA.Fantasma.valido(g) ? g : null; };
  const mejorVuelta = tramo => records.vueltas[tramos[tramo].id] || null;
  return {
    pista, paisaje, carrera, eligePiloto, piloto, empiezaCampeonato, apuntaCarrera, tabla, apuntaVuelta, fantasmaDe, mejorVuelta,
    get temporada() { return temporada; },
    get records() { return records; },
  };
};
