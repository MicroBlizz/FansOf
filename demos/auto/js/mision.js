// Fans of Auto · LAS MISIONES: cada banda tiene una cabina que suena cuando tiene trabajo para ti (si no te odia). Una misión
// es una lista de pasos escritos como datos (coge tal coche, recoge tal objeto, llega a tal sitio) con un tiempo y un premio:
// dinero, respeto de esa banda (y un poco menos de las otras) y +1 al multiplicador. También están las ofertas que se abren
// al pisar un sitio (la cabina, el Templo del Autoguardado) y el guardado de la partida: solo en el Templo y pagando.
'use strict';

const MISIONES = [
  { banda: ZONA.animales, nombre: 'Entrega Bestial', premio: 20000, tiempo: 100,
    texto: '«¡Eh, conejo! La furgoneta de helados de la Heladería Animal lleva un cargamento de caos congelado. Llévala al Parque Gashapón antes de que se derrita. Y sin frenar por los peatones, que eso lo hace Microblizz.»',
    pasos: [
      { tipo: 'coche', coche: 'helados', donde: 'heladeria', texto: 'Coge la furgoneta de helados de la Heladería Animal.' },
      { tipo: 'ir', donde: 'parque', enCoche: true, texto: 'Lleva la furgoneta al Parque Gashapón.' },
    ] },
  { banda: ZONA.granizo, nombre: 'Parche del Día Uno', premio: 20000, tiempo: 80,
    texto: '«Granizo Corp. le habla. El remaster sale hoy y, como siempre, no funciona. Recoja el parche del día uno en la puerta de la Torre y llévelo a Cajas de Botín antes de que salgan las críticas. Si llega tarde, lo llamaremos «contenido futuro».»',
    pasos: [
      { tipo: 'coger', objeto: 'disco', donde: 'torre', texto: 'Recoge el parche en la puerta de la Torre Granizo Corp.' },
      { tipo: 'ir', donde: 'cajas', texto: 'Entrega el parche en Cajas de Botín.' },
    ] },
  { banda: ZONA.extractores, nombre: 'Punto de Extracción', premio: 20000, tiempo: 90,
    texto: '«Pssst. Hay una mochila con botín en el aparcamiento del sur. Cógela y llégate al Punto de Extracción. Aviso: en cuanto la toques, los Moderadores lo sabrán. Siempre lo saben.»',
    pasos: [
      { tipo: 'coger', objeto: 'mochila', donde: 'aparcamiento3', texto: 'Coge la mochila del aparcamiento del sur.', buscado: 2 },
      { tipo: 'ir', donde: 'extraccion', texto: 'Llega al Punto de Extracción con la mochila.' },
    ] },
];

// la oferta que ve el jugador (la cabina o el Templo); pantallas.js la enseña y el jugador acepta o cuelga
function ofrecer(tipo, dato) {
  if (S.oferta || S.mision) return;
  const j = S.jugadores[0];
  if (tipo === 'telefono') {
    const m = MISIONES.find(m => m.banda === dato.banda && !S.hechas.includes(m.nombre));
    if (!m) return;
    S.oferta = { tipo, mision: m, telefono: dato }; play('telefono');
  } else if (tipo === 'templo') {
    S.oferta = { tipo, texto: j.dinero >= DONATIVO ? tr('Templo del Autoguardado: guardar la partida cuesta un donativo de 5.000. «Sin donativo no hay guardado.»') : tr('Templo del Autoguardado: «¡Sin donativo no hay guardado!» Vuelve con 5.000.'), puede: j.dinero >= DONATIVO };
  }
  S.pausa = true;
}
function aceptaOferta() {
  const o = S.oferta, j = S.jugadores[0];
  if (!o) return;
  S.oferta = null; S.pausa = false;
  if (o.tipo === 'telefono') empiezaMision(o.mision);
  else if (o.tipo === 'templo' && o.puede) { j.dinero -= DONATIVO; guardaPartida(); play('guardado'); mensaje(tr('Partida guardada. El donativo no es deducible.')); }
}
function rechazaOferta() { S.oferta = null; S.pausa = false; }

function empiezaMision(m) {
  const j = S.jugadores[0];
  S.mision = { datos: m, paso: 0, tiempo: m.tiempo * 60, cocheId: null, objetoId: null };
  play('mision'); rotulo(m.nombre.toUpperCase(), 120, 'oro');
  preparaPaso();
  for (const t of S.telefonos) t.suena = false;
}
function preparaPaso() {
  const M = S.mision, p = M.datos.pasos[M.paso], L = MAPA.lugares[p.donde];
  if (p.tipo === 'coche') {
    // el coche de la misión aparece en su sitio (si ya había uno de ese tipo cerca, vale ese)
    let c = S.coches.find(c => c.tipo === p.coche && !c.chatarra && dist(c, L) < 60);
    if (!c) { for (const o of S.coches) if (dist(o, L) < 30) o.x += 999; c = nuevoCoche(p.coche, L.x, L.y, 0, null); }
    M.cocheId = c.id;
  } else if (p.tipo === 'coger') {
    const o = { id: S.sigId++, tipo: p.objeto, x: L.x, y: L.y, t: 0, mision: true }; S.objetos.push(o); M.objetoId = o.id;
  }
  mensaje(tr(p.texto), 420);
}
function objetoDeMision(o) {
  const M = S.mision; if (!M || o.id !== M.objetoId) return;
  const p = M.datos.pasos[M.paso], j = S.jugadores[0];
  if (p.buscado) calor(j, p.buscado * 40);
  play('moneda'); M.lleva = o.tipo; avanzaPaso();
}
function avanzaPaso() {
  const M = S.mision; M.paso++;
  if (M.paso >= M.datos.pasos.length) { cumpleMision(); return; }
  preparaPaso();
}
function pasoMision() {
  const M = S.mision, j = S.jugadores[0];
  // las cabinas suenan si hay trabajo y la banda no te odia
  for (const t of S.telefonos) t.suena = !M && !S.oferta && !!MISIONES.find(m => m.banda === t.banda && !S.hechas.includes(m.nombre)) && j.respeto[t.banda] >= 25;
  if (!M) return;
  M.tiempo--;
  if (M.tiempo <= 0) { fallaMision(tr('Se acabó el tiempo.')); return; }
  const p = M.datos.pasos[M.paso], L = MAPA.lugares[p.donde];
  if (p.tipo === 'coche') { if (j.coche === M.cocheId) avanzaPaso(); }
  else if (p.tipo === 'ir') {
    if (p.enCoche) { const c = S.coches.find(c => c.id === M.cocheId); if (!c || c.chatarra) { fallaMision(tr('El coche de la misión ha quedado para chatarra.')); return; } if (j.coche === M.cocheId && dist(c, L) < (L.r || 20)) avanzaPaso(); }
    else { const pos = j.coche !== null ? S.coches.find(c => c.id === j.coche) || j : j; if (dist(pos, L) < (L.r || 20)) avanzaPaso(); }
  }
}
function cumpleMision() {
  const M = S.mision, j = S.jugadores[0], z = M.datos.banda;
  j.dinero += M.datos.premio; j.mult = Math.min(10, j.mult + 1);
  j.respeto[z] = Math.min(100, j.respeto[z] + 25);
  for (let k = 0; k < 3; k++) if (k !== z) j.respeto[k] = Math.max(0, j.respeto[k] - 8);
  j.calor = 0; j.buscado = 0;
  S.hechas.push(M.datos.nombre); S.mision = null;
  play('win'); rotulo(tr('MISIÓN CUMPLIDA'), 150, 'oro'); S.fx.push({ tipo: 'dinero', x: j.x, y: j.y - 10, t: 80, texto: '+' + M.datos.premio });
  mensaje(S.hechas.length >= MISIONES.length ? tr('Has hecho los tres recados de la demo. El resto del barrio, en la próxima versión.') : tr('Respeto de ' + ZONA_NOMBRE[z] + ' arriba. El multiplicador también.'), 300);
}
function fallaMision(por) {
  const M = S.mision; if (!M) return;
  const j = S.jugadores[0], z = M.datos.banda;
  j.respeto[z] = Math.max(0, j.respeto[z] - 10);
  S.mision = null; play('fallo'); rotulo(tr('MISIÓN FALLIDA'), 150, 'rojo'); mensaje(por + ' ' + tr(ZONA_NOMBRE[z] + ' no lo olvidará.'), 240);
  S.objetos = S.objetos.filter(o => !o.mision);
}

/* ---------- guardar y cargar (solo en el Templo) ---------- */
function guardaPartida() {
  const j = S.jugadores[0];
  try { localStorage.setItem('fansof-auto', JSON.stringify({ v: 1, dinero: j.dinero, mult: j.mult, respeto: j.respeto, vidas: Math.max(1, j.vidas), hechas: S.hechas })); } catch (_) { /* sin guardar */ }
}
function cargaPartida() {
  try { const g = JSON.parse(localStorage.getItem('fansof-auto') || 'null'); if (g && g.v === 1) return g; } catch (_) { /* nada */ }
  return null;
}
function borraPartida() { try { localStorage.removeItem('fansof-auto'); } catch (_) { /* nada */ } }
