// Fans of Nova · Ayuda: cada menú tiene su botón de info (nvInfo) con la explicación de esa pantalla, que además sale sola
// la primera vez que la ves (la partida se pausa mientras tanto). «Cómo se juega», en la galaxia, las repasa todas.
'use strict';
const NV_TUTO_CLAVE = 'nova-tutorial-1';
// Cada aviso es una o varias páginas: título, frases cortas e icono [grupo, clave] de iconos.js.
const NV_TUTO = {
  galaxia: [{ titulo: 'LA GALAXIA', ic: ['sis', 'vel'], lineas: [
    'Toca un sector para ver qué hay y vuelve a tocarlo para lanzar la misión.',
    'Solo puedes atacar los vecinos de lo que ya has liberado. Si ganas, el sector se pinta de tu color.',
    'Los puntos blancos son el peligro: más peligro, enemigos más duros y más aleación.',
    'La aleación se gasta en la Nave capital, en mejoras que se quedan para siempre.'] }],
  mision: [{ titulo: 'CÓMO SE JUEGA', ic: ['arma', 'railgun'], lineas: [
    'Arrastra el dedo para mover la nave. Las armas apuntan y disparan solas.',
    'Las naves destruidas dejan restos: pásales por encima para comerlos y crecer.',
    'Cada enemigo lleva su rango. Si es mayor que el tuyo, huye hasta crecer; tumbar a uno grande da muchísima chatarra.',
    'Los enemigos solo hacen daño con sus armas: chocar no duele.'] },
  { titulo: 'TU NAVE', ic: ['sis', 'casco'], lineas: [
    'Arriba tienes el casco (verde) y la barra de chatarra hasta el siguiente rango (amarilla).',
    'El mapa pequeño de abajo enseña a los enemigos y las estaciones.',
    'Acaba con los capitanes y llegará el jefe del sector. Derrótalo para liberar el sector.'] }],
  cartas: [{ titulo: 'SUBIR DE RANGO', ic: ['cat', 'ofensiva'], lineas: [
    'Al subir de rango eliges una carta: una ofensiva, una defensiva, una de utilidad y otra al azar.',
    'Las armas nuevas ocupan una ranura libre. Al crecer ganas ranuras y las armas salen más grandes.',
    'Con todas las ranuras llenas salen mejoras pequeñas: daño, robo de vida, velocidad...',
    'Las armas tienen rareza: común, rara, épica y legendaria. Cuanto más rara, más fuerte y más difícil de ver.',
    'Cada carta tiene su propio botón Repetir: cambia solo esa carta y las demás se quedan, así puedes probar suerte con el arma sin perder la fusión o el escudo.'] }],
  fusion: [{ titulo: 'FUSIONES', ic: ['sis', 'fusion'], lineas: [
    'Dos armas que encajan se funden en una sola más fuerte.',
    'La fusión rinde lo de dos armas en una sola ranura, así que te deja un hueco libre para otra.'] }],
  estacion: [{ titulo: 'LA ESTACIÓN', ic: ['sis', 'regen'], lineas: [
    'Al entrar en una estación la partida se para.',
    'Con la chatarra que llevas puedes reparar el casco y cambiar un arma por otra.',
    'Verás tu nave con sus armas en los anclajes. Toca un anclaje para ver hasta dónde tira, y toca otro para cambiar las dos armas de sitio.',
    'Las de proa tiran 90° al frente, las de los lados 180° hacia su lado, las de popa 180° hacia atrás y las de arriba 360°.',
    'El taller de tamaños sirve para unir y dividir armas.'] }],
  taller: [{ titulo: 'EL TALLER', ic: ['taller', 'unir'], lineas: [
    'Toca dos armas del mismo tamaño y pulsa Unir: dos pequeñas hacen una mediana y dos medianas una grande.',
    'Más tamaño es mucho más daño, alcance y bala.',
    'Dividir hace lo contrario, y necesita una ranura libre.',
    'La nave sigue a la vista: toca un anclaje y luego otro para cambiar las armas de sitio, o para mover una a un anclaje vacío.',
    'Muchas pequeñas van bien contra enjambres; pocas grandes, contra jefes.'] }],
  capital: [{ titulo: 'NAVE CAPITAL', ic: ['sis', 'mejora'], lineas: [
    'Aquí se gasta la aleación que ganas en las misiones. Perder también paga, pero la mitad.',
    'Sus mejoras se quedan entre partidas: Núcleo, Hangar, Sensores, Academia, Arsenal y Astillero.',
    'El Arsenal desbloquea armas y módulos mejores para las cartas. Se empieza solo con las armas básicas.'] }],
  arsenal: [{ titulo: 'EL ARSENAL', ic: ['arma', 'railgun'], lineas: [
    'Aquí ves todo lo que puede salir en las cartas. Lo bloqueado se abre subiendo el Arsenal de la nave capital.',
    'Retirar un objeto del pool lo quita de las cartas, pero cada retirada cuesta más que la anterior. Reponerlo es gratis.',
    'Más probable gasta aleación para que ese objeto salga más a menudo. Siempre queda al menos un arma en el pool.'] }],
  faccion: [{ titulo: 'TU FACCIÓN', ic: ['sis', 'vel'], lineas: [
    'Tu facción decide el color con el que pintas la galaxia.',
    'Empiezas en un enclave rebelde, justo enfrente del territorio oficial de tu facción.',
    'En el centro está el núcleo de Microblizz: el sector más peligroso de todos.'] }],
  nave: [{ titulo: 'LAS NAVES', ic: ['arma', 'flak'], lineas: [
    'Cada casco es de una facción y empieza con un arma de su estilo.',
    'Debajo del nombre pone en qué destaca. La eliges antes de cada misión.'] }],
  capitan: [{ titulo: 'EL CAPITÁN', ic: ['cap', 'bunny'], lineas: [
    'El capitán da una ventaja para toda la misión y casi siempre una pega.',
    'Pro Gamer no tiene ni lo uno ni lo otro: la nave tal cual.'] }],
  oficial: [{ titulo: 'EL OFICIAL', ic: ['fac', 'fuego'], lineas: [
    'El oficial suma un bonus pequeño para toda la misión.',
    'Elige el que encaje con tu forma de jugar: más daño, más casco, más cartas...'] }],
  armas: [{ titulo: 'ARMAS Y CARGAS', ic: ['arma', 'laser'], lineas: [
    'Cada arma es un portador (railgun, flak, láser, lanzador o drones) con una carga: cinética, energía, térmica, explosiva o EM.',
    'Cada portador solo admite las cargas que tienen sentido: no hay láseres cinéticos.',
    'Las cargas dejan estados en el enemigo. Si otra carga le da encima, salta una reacción con daño extra.',
    'Ejemplo: la cinética abre brecha y la térmica la funde.'] }]
};
const NV_TUTO_ORDEN = ['galaxia', 'faccion', 'nave', 'capitan', 'oficial', 'mision', 'armas', 'cartas', 'fusion', 'estacion', 'taller', 'capital', 'arsenal'];

function nvTutoVisto() { try { return JSON.parse(localStorage.getItem(NV_TUTO_CLAVE) || '{}'); } catch (e) { return {}; } }
function nvTutoMarca(ids) { const v = nvTutoVisto(); for (const id of ids) v[id] = 1; try { localStorage.setItem(NV_TUTO_CLAVE, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } }
// Enseña el aviso `id` si no se ha visto (nunca con el bot de pruebas). Mientras está abierto, la partida no avanza.
function nvTuto(...ids) {   // varios ids: se enseñan seguidos los que falten
  const v = nvTutoVisto(), faltan = ids.filter(id => NV_TUTO[id] && !v[id]);
  if (NVP.auto || NVP.tuto || !faltan.length) return;
  const pags = []; for (const id of faltan) pags.push(...NV_TUTO[id]);
  nvTutoMuestra(pags, () => nvTutoMarca(faltan));
}
// El botón de info de cada menú: un círculo dibujado en la esquina del panel que abre la ayuda de esa pantalla.
function nvInfo(panel, ids) {
  const b = nvEl('nv-info', '', 'button'); b.title = tr('Información'); b.setAttribute('aria-label', tr('Información'));
  b.appendChild(nvIcono('ui', 'info', '#2f8cff', 38));
  b.onclick = ev => { ev.stopPropagation(); if (NVP.tuto) return; const pags = []; for (const id of [].concat(ids)) pags.push(...NV_TUTO[id]); nvTutoMuestra(pags, () => nvTutoMarca([].concat(ids))); };
  panel.appendChild(b);
  setTimeout(() => nvTuto(...[].concat(ids)), 0);   // la primera vez sale sola, con el panel ya pintado
}
function nvTutoTodo() {   // «Cómo se juega»: todas las páginas seguidas
  const pags = []; for (const id of NV_TUTO_ORDEN) pags.push(...NV_TUTO[id]);
  nvTutoMuestra(pags, () => nvTutoMarca(NV_TUTO_ORDEN));
}
function nvTutoMuestra(pags, alAcabar) {
  const raiz = document.getElementById('nv-partida'); if (!raiz) return;
  let i = 0; NVP.tuto = true;
  const capa = nvEl('nv-tuto'); raiz.appendChild(capa);
  const cierra = todo => { capa.remove(); NVP.tuto = false; NVP.ult = 0; alAcabar(); if (todo) nvTutoMarca(NV_TUTO_ORDEN); };
  const pinta = () => {
    const P = pags[i]; capa.textContent = '';
    const c = nvEl('nv-tutocaja');
    c.appendChild(nvIcono(P.ic[0], P.ic[1], '#ffd93d', 64));
    c.appendChild(nvEl('nv-titulo', tr(P.titulo)));
    for (const l of P.lineas) c.appendChild(nvEl('nv-tutolinea', tr(l)));
    if (pags.length > 1) c.appendChild(nvEl('nv-cdet', (i + 1) + ' / ' + pags.length));
    const ult = i === pags.length - 1;
    const b = nvEl('nv-boton', ult ? tr('Entendido') : tr('Siguiente'), 'button');
    b.onclick = () => { if (ult) cierra(false); else { i++; pinta(); } };
    c.appendChild(b);
    if (!ult) { const s = nvEl('nv-tutosaltar', tr('Saltar el tutorial'), 'button'); s.onclick = () => cierra(true); c.appendChild(s); }
    capa.appendChild(c);
  };
  pinta();
}
