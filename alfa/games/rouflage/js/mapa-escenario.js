// Fans of Rouflage · MI ESCENARIO COMO MAPA DEL JUEGO: convierte un escenario decorado (los datos de «Mi escenario»: { v, e, m, p }, escenario-pinta.js)
// en un mapa que entiende el juego (el mismo formato que defineMapa, mapa-datos.js), para que se pueda andar, congelarse y pintarse en él con las
// reglas de siempre. Lo usan la SALA DE ESPERA CON AMIGOS (sala-viva.js) y la partida con amigos en el mapa ESTE ESCENARIO (pvp-mapas.js, pvp.js). El suelo, las paredes y la pintura se dibujan con el pintor de Mi escenario
// (escPintaTrozo, escenario-mundo.js): pintaMundo (mapa.js) llama a pintaMundoEsc cuando el mapa actual lleva `esc`. No sale en las listas de mapas.
'use strict';

const MAPA_ESC = { id: 'mi-escenario', clave: '' };
// deja el escenario como el mapa 'mi-escenario' (sin cargarlo) y devuelve su id. Si los datos son los mismos que la última vez, no rehace nada
function mapaDeEscenario(datos) {
  const clave = JSON.stringify(datos || null);
  if (MAPA_ESC.clave === clave && MAPAS[MAPA_ESC.id]) return MAPA_ESC.id;
  const sala = salaDeDatos(datos) || salaDeDatos({ v: 2, e: 'oficina', m: [] });
  if (!sala.pint) sala.pint = pinturaNueva();
  const M = escMundo(sala.id), [sx, sy] = M.salida || [M.origen[0] + 200, M.origen[1] + 200];
  // por dónde salen los colados: un corro alrededor de la salida del escenario (luego, cada uno en la casilla libre más cercana)
  const corro = [[0, 0], [60, 0], [-60, 0], [0, 50], [60, 50], [-60, 50], [0, -50], [60, -50], [-60, -50], [120, 0]].map(([dx, dy]) => [sx + dx, sy + dy]);
  // los becarios esperan en la sala más lejana de la salida (de las que tienen sitio): ahí no ven a nadie pintarse
  const centro = z => [(z.x + z.w / 2) * CEL, (z.y + z.h / 2) * CEL], grandes = M.zonas.filter(z => z.w * z.h >= 24);
  const espera = M.esperaZona || (grandes.length ? grandes : M.zonas).reduce((a, z) => (!a || lejos(...centro(z), sx, sy) > lejos(...centro(a), sx, sy) ? z : a), null);      // en un lienzo, la que marcó el jugador (BECARIOS, escenario-obra.js)
  const [ex, ey] = M.becarios || (espera ? centro(espera) : [sx, sy]), becarios = [[ex - 40, ey + 20], [ex + 40, ey + 20], [ex, ey - 20]];
  const muebles = sala.muebles.map(m => { const S = MUEBLES_SALA[m.id]; return S && TIPOS_MUEBLE[S.t] ? { t: S.t, x: m.x, y: m.y, v: (m.v || 0) % Math.max(1, S.vars || 1), f: m.f ? 1 : 0 } : null; }).filter(Boolean);
  // las gracias de los muebles que las traen, como en sus mapas: el coche del jefe sopla y salta (EVENTOS.turbo, dibujo-roaster.js) y los coches
  // aparcados saltan como alarma (EVENTOS.faros, dibujo-parking.js). Antes el escenario no llevaba ninguna y el coche del gachapón se quedaba quieto
  const hay = t => muebles.some(m => m.t === t);
  MAPAS[MAPA_ESC.id] = {
    evento: hay('roaster') ? { tipo: 'turbo' } : null, siempre: hay('coche') || hay('cocheH') ? ['faros'] : [],
    id: MAPA_ESC.id, nombre: 'Mi escenario', lema: '', ancho: M.MW, alto: M.MH, muro: M.muro, canto: M.canto,
    salas: M.zonas.map(z => ({ id: z.id, nombre: z.nombre, x: z.x, y: z.y, w: z.w, h: z.h, suelo: z.suelo, pared: z.pared })),
    pasos: [], carteles: [], pegatinas: [], epitafios: [],
    muebles,
    puerta: { x: -2000, y: -2000, w: 40, h: 80 },      // sin puerta de Recursos Humanos: aquí nadie espera encerrado
    salidaCamaleones: corro, salidaCazadores: becarios, espera: espera ? espera.id : '', plaza: [sx, sy],
    barreras: typeof barrerasDe === 'function' ? barrerasDe(M, espera) : [],      // la sala de los becarios, cerrada hasta la caza (barreras.js)
    esc: { sala, M },
  };
  MAPA_ESC.clave = clave;
  return MAPA_ESC.id;
}
// el suelo, las paredes y la pintura del escenario (como en el editor), y la sombra de cada mueble encima
function pintaMundoEsc(c, R) {
  const { sala, M } = MAPA_ACT.esc, ks = Math.max(0.5, Math.abs(c.getTransform().a) || 1);
  c.save(); c.beginPath(); c.rect(R.x0, R.y0, R.x1 - R.x0, R.y1 - R.y0); c.clip();
  escPintaTrozo(c, M, R, sala.pint, ks);
  pegPintaSala(c, sala, R);      // las pegatinas (escenario-pegatinas.js)
  for (const m of MUEBLES) if (cruzan(m.dib, R)) sombraMueble(c, m);
  c.restore();
}
// la casilla libre más cercana a un punto (para no salir dentro de un mueble)
function sitioLibreCerca(x, y) {
  if (cabe(x, y)) return [x, y];
  for (let r = 20; r <= 400; r += 20) for (let a = 0; a < 16; a++) { const px = x + Math.cos(a * TAU / 16) * r, py = y + Math.sin(a * TAU / 16) * r; if (cabe(px, py)) return [px, py]; }
  return [x, y];
}
