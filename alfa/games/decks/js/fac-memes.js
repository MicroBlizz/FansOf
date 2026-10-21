// Fans Of Decks · Facción Memes (líder MemeLord). Pasiva Viral (decisión de Arkioner, 21-10-2026): su jugada de líder es la habilidad de OTRA facción y CAMBIA con cada uso.
// Nunca es a ciegas: el botón enseña cuál es la que toca ahora y cuál es el riesgo. Por ahora salen de todos los demás líderes (las abiertas, cuando haya desbloqueo en orden: dcLiderAbierto).
// El resto del mazo es de memes sin azar: perros, gatos y cartas que cargan la jugada más deprisa.
'use strict';
Object.assign(CFG.units, { memelord: { r: 18 }, suchdog: { r: 11 }, gifblaster: { r: 12 }, synthcat: { r: 13 }, trollbot: { r: 13 }, stonks: { r: 14 }, chonkcat: { r: 22 }, clickbait: { r: 14 } });
Object.assign(DC_CARTAS, {
  // ---------- mazo inicial ----------
  suchdog: { fac: 'memes', nombre: 'SuchDog', tipo: 'empleado', rar: 'basic', coste: 1, arte: 'suchdog', fx: { dano: 5, veces: 3 }, asc: { dano: 6 }, texto: 'Dos perros muy wow: {dano} de daño, {veces} veces.' },
  gifblaster: { fac: 'memes', nombre: 'GifBlaster', tipo: 'empleado', rar: 'basic', coste: 1, arte: 'gifblaster', fx: { dano: 4, veces: 4 }, asc: { dano: 5 }, texto: 'GIFs en bucle: {dano} de daño, {veces} veces.' },
  trollbot: { fac: 'memes', nombre: 'TrollBot', tipo: 'empleado', rar: 'basic', coste: 1, arte: 'trollbot', fx: { bloqueo: 11, debil: 1 }, asc: { bloqueo: 15 }, texto: 'Se pone delante y los provoca: {bloqueo} de bloqueo y Débil {debil}.' },
  sp_gatos: { fac: 'memes', nombre: 'Lluvia de gatos', tipo: 'tarea', rar: 'basic', coste: 2, arte: 'sp_gatos', fx: { dano: 12, obj: 'todos' }, asc: { dano: 16 }, texto: 'Llueven gatos en la sala: {dano} de daño a todos los rivales.' },
  sp_likes: { fac: 'memes', nombre: 'Like masivo', tipo: 'tarea', rar: 'basic', coste: 0, arte: 'sp_likes', fx: { roba: 1, carga: 1 }, asc: { roba: 2 }, texto: 'Gratis: robas {roba} y tu jugada de líder se carga {carga}.' },
  // ---------- pool ----------
  synthcat: { fac: 'memes', nombre: 'SynthCat', tipo: 'empleado', rar: 'common', coste: 2, arte: 'synthcat', fx: { dano: 8, obj: 'todos' }, asc: { dano: 11 }, texto: 'Un gato con teclado, y sus notas explotan: {dano} de daño a todos los rivales.' },
  stonks: { fac: 'memes', nombre: 'Stonks', tipo: 'empleado', rar: 'rare', coste: 2, arte: 'stonks', fx: { dano: 9, fuerza: 1 }, asc: { dano: 12, fuerza: 2 }, texto: 'Todo sube: {dano} de daño y +{fuerza} de fuerza el resto de la reunión.' },
  chonkcat: { fac: 'memes', nombre: 'ChonkCat', tipo: 'empleado', rar: 'epic', coste: 3, arte: 'chonkcat', fx: { dano: 18, aturde: 1 }, asc: { dano: 24 }, texto: 'Se sienta encima del rival: {dano} de daño y se queda sin turno.' },
  clickbait: { fac: 'memes', nombre: 'Clickbait', tipo: 'empleado', rar: 'rare', coste: 1, arte: 'clickbait', fx: { dano: 9, vulnerable: 1 }, asc: { dano: 12 }, texto: 'Lo que pasó después te sorprenderá: {dano} de daño y Vulnerable {vulnerable}.' },
  doge: { fac: 'memes', nombre: 'Doge de guardia', tipo: 'empleado', rar: 'common', coste: 2, arte: 'suchdog', fx: { dano: 15 }, asc: { dano: 19 }, texto: 'Much daño, very ouch: {dano} de daño.' },
  sp_confusion: { fac: 'memes', nombre: 'Confusión', tipo: 'tarea', rar: 'rare', coste: 1, arte: 'sp_confusion', fx: { aturde: 1, debil: 1 }, asc: { debil: 2 }, texto: 'Un hilo imposible de seguir: el rival pierde su turno y Débil {debil}.' },
  ratio: { fac: 'memes', nombre: 'Ratio', tipo: 'tramite', rar: 'common', coste: 1, ic: 'RT', mini: 'emotes', fx: { bloqueo: 9, debil: 1 }, asc: { bloqueo: 13 }, texto: 'Tu respuesta tiene más likes: {bloqueo} de bloqueo y Débil {debil}.' },
  tutorial: { fac: 'memes', nombre: 'Tutorial de 10 horas', tipo: 'tramite', rar: 'common', coste: 0, ic: 'TU', mini: 'speedrun', fx: { carga: 2, despedida: true }, asc: { despedida: false }, texto: 'Gratis: tu jugada de líder se carga {carga}.' },
  copiapega: { fac: 'memes', nombre: 'Copiar y pegar', tipo: 'tramite', rar: 'rare', coste: 1, ic: 'CP', mini: 'clon', fx: { carga: 3, roba: 1 }, asc: { carga: 4 }, texto: 'Ctrl+C, Ctrl+V: tu jugada de líder se carga {carga} y robas {roba}.' },
  se_hizo_viral: { fac: 'memes', nombre: 'Se hizo viral', tipo: 'directiva', rar: 'rare', coste: 1, ic: 'SV', mini: 'ping', fx: { poder: 'viral', n: 1 }, asc: { n: 2 }, texto: 'Viral: cada vez que usas la jugada de tu líder, robas {n}.' },
  sp_trending: { fac: 'memes', nombre: 'Trending topic', tipo: 'tarea', rar: 'legendary', coste: 2, arte: 'sp_likes', fx: { carga: 6, roba: 2 }, asc: { coste: 1 }, texto: 'Todo el mundo lo comparte: tu jugada de líder se carga entera y robas {roba}.' },
  comp_perro: { fac: 'memes', nombre: 'Perro del equipo', tipo: 'companero', rar: 'common', coste: 1, arte: 'suchdog', fx: { companero: true, turnos: 3, dano: 5 }, asc: { dano: 8 }, texto: 'Se queda {turnos} turnos: al acabar cada uno pega {dano} al rival con menos vida.' },
  comp_gato: { fac: 'memes', nombre: 'Gato influencer', tipo: 'companero', rar: 'rare', coste: 2, arte: 'synthcat', fx: { companero: true, turnos: 3, dano: 5, bloqueo: 4 }, asc: { dano: 8, bloqueo: 5 }, texto: 'Se queda {turnos} turnos: al acabar cada uno pega {dano} al rival con menos vida y te da {bloqueo} de bloqueo.' },
});
DC_MAZOS.memelord = ['suchdog', 'suchdog', 'suchdog', 'gifblaster', 'gifblaster', 'trollbot', 'trollbot', 'sp_gatos', 'sp_gatos', 'sp_likes'];
// Viral: la jugada de este líder es la de otro, y se anuncia la siguiente en cuanto se usa la actual (nunca se repite dos veces seguidas).
const DC_VIRAL_CAMPOS = ['dano', 'bloqueo', 'blindaje', 'fuerzaTurno', 'caos', 'roba', 'invoca', 'n', 'texto'];
function dcViralElige(C) {
  const otras = Object.keys(DC_LIDERES).filter(k => k !== 'memelord' && dcLiderAbierto(k) && DC_LIDERES[k].jugada.nombre !== C.viralActual);
  const J = DC_LIDERES[otras[(Math.random() * otras.length) | 0]].jugada, carga = C.salto.carga, S = { nombre: tr('Viral') + ': ' + tr(J.nombre), carga, viral: true };
  for (const k of DC_VIRAL_CAMPOS) if (J[k] !== undefined) S[k] = J[k];
  S.texto = J.texto; C.viralActual = J.nombre; C.salto = S;
}
DC_FACCIONES.memes = { nombre: 'Memes', pasiva: 'Viral', texto: 'Memes: la jugada de tu líder es la de otra facción y cambia cada vez que la usas. Siempre ves cuál te toca.',
  alSalto(C, usada) {
    if (usada && C.poderes.viral) { dcRoba(C, C.poderes.viral); C.log.push(tr('Se hizo viral: robas {n}', { n: C.poderes.viral })); }
    dcViralElige(C);
  },
  estados(C) { return [{ cls: 'dc-est-fijo', icono: 'refuerzo', texto: tr('Viral'), n: tr(C.salto.nombre).replace(/^[^:]*: /, ''), explica: tr(DC_FACCIONES.memes.texto), turno: false }]; } };
DC_LIDERES.memelord = { nombre: 'MemeLord', faccion: 'memes', arte: 'memelord', hp: 72,
  jugada: { nombre: 'Carta viral', carga: 6, viral: true, texto: 'Gratis cuando has gastado {carga} de CAOS en cartas: juega la jugada de otro líder, y cada vez es otra.' } };
DC_PODER_ICONO.viral = 'refuerzo';
Object.assign(DC_BIB_FACCIONES, { memes: 'Memes' });
