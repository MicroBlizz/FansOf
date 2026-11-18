// Fans of Spy · ADAPTADORES · La pantalla de juego: une los casos de uso, la vista 3D y el HUD. Lleva qué carta hay elegida, en
// qué modo (por su efecto o para andar) y qué objetivo se ha tocado; prepara los datos que pinta el HUD (mano, barra de turnos,
// estado, panel de la carta, Lola) y lo que se marca en el suelo; y, al jugar, reproduce los eventos y espera a que acaben.
// Tocar una casilla marcada la elige (y enseña el camino y si lo verían); tocarla otra vez, o pulsar el botón, la confirma.
// Se crea con SPY.creaPantalla({ casos, plantas, azar, alAcabar(fin, guiada) }) y devuelve lo que principal.js necesita.
'use strict';
var SPY = globalThis.SPY || (globalThis.SPY = {});
SPY.creaPantalla = function ({ casos, plantas, azar, alAcabar }) {
  const S = SPY, H = S.hud, A = S.animacion, AJ = S.AJ;
  const NOMBRES = { becario: 'Becario', vigilante: 'Vigilante', camara: 'Cámara' };
  const MOTIVOS = {
    'te-ven': 'Te están viendo: ahora no puedes esconderte.', 'ya-escondido': 'Ya estás escondido.', 'sin-pared': 'Necesitas una pared o un coche al lado.',
    'sin-guardias': 'No hay ningún guardia que lo oiga.', 'vida-llena': 'Tienes la vida llena.', 'sin-objetivo': 'No hay nada a tu alcance para esta carta.',
    'tope-cartas': 'Ya has jugado las 2 cartas de este turno.', 'no-toca': 'Ahora haz lo que dice Lola.', 'otra-carta': 'Lola te pide otra carta.', 'otra-casilla': 'Toca la casilla que brilla.',
  };
  const VACIAS = () => ({ celdas: [], camino: [], guardias: [], destino: null, guardia: null, ruido: null, guia: null });
  const mundos = new Map();
  const E = { planta: null, mundo: null, vis: A.nueva(), cam: S.camara.nueva(), marcas: VACIAS(), verConos: true, secretos: [] };
  let sel = null, firma = '', aviso = null, callada = null;

  const ocupada = () => A.ocupada(E.vis);
  const senala = () => (ocupada() || aviso ? null : casos.senala());
  const esMovimiento = (s) => s.modo === 'andar' || !!s.opc.carta.pasos;
  const objetivosDe = (s) => (s.modo === 'andar' ? s.opc.andar.objetivos : s.opc.objetivos);
  const costeDe = (s) => (s.modo === 'andar' ? s.opc.andar.coste : s.opc.coste);
  const ruidoDe = (s) => (s.modo === 'andar' ? AJ.turno.andar.ruido : s.opc.carta.ruido || 0);
  const noPuede = (s) => (s.modo === 'andar' ? s.opc.andar.puede : s.opc.puede);

  // Los objetivos que se pueden tocar con la carta elegida; en el tutorial, solo la casilla que pide Lola.
  function objetivos(s) {
    const o = objetivosDe(s), g = senala();
    if (noPuede(s)) return { clase: o.clase, lista: [] };
    return g && g.en ? { clase: o.clase, lista: o.lista.filter((q) => q.x === g.en.x && q.y === g.en.y) } : o;
  }

  // ---------- los datos del HUD ----------
  function datosMano() {
    const p = casos.p, g = senala(), fijo = !!g && (g.que === 'acabar' || g.que === 'seguir');
    return p.baraja.mano.map((id, i) => {
      const c = AJ.cartas[id], f = AJ.familias[c.familia], pedida = !!g && !!g.cartas && g.cartas.includes(id);
      return { i, id, nombre: c.nombre, corto: f.corto, color: f.color, fondo: f.fondo, coste: S.cartas.coste(AJ, p.agente, id), ruido: c.ruido > 0,
        elegida: !!sel && sel.i === i, apagada: fijo || (!!g && !!g.cartas && !pedida), senalada: pedida && !sel };
    });
  }
  function datosOrden() {
    const o = casos.orden(sel ? costeDe(sel) : 0), fichas = [{ tipo: 'agente', nombre: 'TÚ', ahora: true }];
    const vuelta = { tipo: 'agente', nombre: 'TÚ', fantasma: true, en: o.vuelve };
    let puesta = false;
    o.lista.slice(0, 4).forEach((s, i) => {
      if (!puesta && (o.vuelve === null ? i === 1 : s.en > o.vuelve)) { fichas.push(vuelta); puesta = true; }
      fichas.push({ tipo: s.tipo, nombre: NOMBRES[s.tipo], en: s.en, estado: s.estado });
    });
    if (!puesta) fichas.push(vuelta);
    return fichas;
  }
  function datosEstado() {
    const v = E.vis, sospecha = [...v.guardias.values()].some((g) => g.estado === 'sospecha' || g.estado === 'mira');
    return { planta: E.planta.nombre, alerta: v.alerta, sospecha, vida: v.vida, vidaMax: casos.p.agente.vidaMax };
  }
  function datosCuenta() {
    const t = casos.p.turno, g = senala();
    return { jugadas: t.jugadas, tope: AJ.turno.cartas, mazo: casos.p.baraja.mazo.length, gasto: t.gasto, espera: !t.jugadas && !t.gasto, bloqueado: ocupada() || !!casos.p.fin, senalada: !!g && g.que === 'acabar' };
  }
  // El aviso bajo el texto de la carta: por qué no vale, qué tocar o qué pasará por el camino elegido.
  function avisoDe(s, o) {
    const no = noPuede(s);
    if (no) return { aviso: MOTIVOS[no] || 'Ahora no se puede.', avisoMalo: true };
    if (s.prev && s.prev.teVen) return { aviso: 'Te verán por ese camino.', avisoMalo: true };
    if (s.prev && s.prev.oyen.length) return { aviso: 'Te oirán llegar e irán a mirar.', avisoMalo: true };
    if (s.objetivo) return { aviso: esMovimiento(s) ? 'Camino libre. Toca otra vez o confirma.' : 'Toca otra vez o confirma.' };
    return { aviso: o.clase === 'celdas' ? 'Toca una casilla marcada.' : o.clase === 'guardias' ? 'Toca un guardia marcado.' : '' };
  }
  function datosAccion() {
    if (!sel) return null;
    const o = objetivos(sel), g = senala(), andar = sel.modo === 'andar';
    const listo = !noPuede(sel) && (o.clase === 'nada' || !!sel.objetivo);
    return { texto: andar ? 'Andas hasta 3 casillas. Hace un poco de ruido.' : sel.opc.carta.texto, ...avisoDe(sel, o), modo: sel.modo, costeEfecto: sel.opc.coste, costeAndar: sel.opc.andar.coste,
      soloModo: g && g.que === 'andar' ? 'andar' : g && g.que === 'carta' ? 'efecto' : null, usar: listo ? (o.clase === 'nada' ? 'USAR' : 'CONFIRMAR') : null };
  }
  // Lo que dice Lola ahora: un aviso suyo (al rebobinar) o la frase del paso del tutorial, salvo que el jugador la haya quitado.
  function datosLola() {
    if (ocupada()) return { texto: null, seguir: false };
    if (aviso) return { texto: aviso, seguir: true };
    const paso = casos.paso();
    return paso && callada !== paso.id ? { texto: paso.lola, seguir: paso.pide.que === 'seguir' } : { texto: null, seguir: false };
  }

  // ---------- lo que se marca en el suelo ----------
  // Lo de la carta elegida: a dónde se puede ir o a quién se puede tocar, lo ya elegido, el camino y hasta dónde llega el ruido.
  function marcaCarta(m, s) {
    const o = objetivos(s), radio = ruidoDe(s), centro = esMovimiento(s) ? s.objetivo : casos.p.agente;
    if (o.clase === 'celdas') { m.celdas = o.lista; m.destino = s.objetivo; }
    if (o.clase === 'guardias') { m.guardias = o.lista; m.guardia = s.objetivo ? s.objetivo.id : null; }
    if (s.prev) m.camino = s.prev.camino;
    if (radio > 0 && centro && !noPuede(s)) m.ruido = { x: centro.x, y: centro.y, radio };
  }
  function marca() {
    const m = VACIAS(), g = senala();
    m.guia = g && g.en ? g.en : null;
    if (sel && !ocupada()) marcaCarta(m, sel);
    E.marcas = m;
  }

  // Pinta todo el HUD y las marcas con la partida tal como está.
  function refresca() {
    const lola = datosLola();
    E.verConos = AJ.agentes[casos.p.agente.id].veConos || casos.p.plano > 0;
    E.secretos = casos.p.secretos;   // al rebobinar la partida es otra: sus secretos también
    H.mano(datosMano()); H.accion(ocupada() ? null : datosAccion()); H.orden(datosOrden()); H.cuenta(datosCuenta());
    H.lola(lola.texto, lola.seguir);
    H.centrar(E.cam.libre);
    marca();
  }
  // La fila de estado cambia en mitad de las animaciones: se repinta solo cuando cambia algo.
  function refrescaEstado() {
    const d = datosEstado(), f = [d.planta, d.alerta.activa, d.alerta.turnos, d.sospecha, d.vida].join();
    if (f !== firma) { firma = f; H.estado(d); }
  }

  // ---------- jugar ----------
  const fx = { suena: S.suena, cartel: H.cartel, carta: () => H.mano(datosMano()), roba: () => H.mano(datosMano()), pasa() {} };
  function despues(valor) {
    if (valor.rebobina) { A.sincroniza(E.vis, casos.p, E.planta); S.suena('spyRebobina'); E.vis.destello = 0.6; aviso = S.guia.REBOBINA; callada = null; }
    refresca();
    if (valor.fin) alAcabar(valor.fin, casos.guiada());
  }
  function reproduce(r) {
    if (!r.ok) { S.suena('spyNoVale'); H.cartel(MOTIVOS[r.codigo] || 'Ahora no se puede.', 'mal'); refresca(); return; }
    sel = null;
    S.camara.centra(E.cam);
    A.reproduce(E.vis, r.valor.eventos, fx, () => despues(r.valor));
    refresca();
  }
  function ejecuta() {
    const s = sel;
    if (!s || ocupada()) return;
    reproduce(s.modo === 'andar' ? casos.anda(s.i, s.objetivo) : casos.juega(s.i, s.objetivo || undefined));
  }

  // Elegir una carta de la mano (o soltarla si ya estaba elegida).
  function eligeCarta(i) {
    if (ocupada() || casos.p.fin || i >= casos.p.baraja.mano.length) return;
    aviso = null;
    const g = senala(), id = casos.p.baraja.mano[i];
    if (g && (!g.cartas || !g.cartas.includes(id))) { S.suena('spyNoVale'); H.cartel(MOTIVOS[g.cartas ? 'otra-carta' : 'no-toca'], 'mal'); refresca(); return; }
    if (sel && sel.i === i) { sel = null; refresca(); return; }
    sel = { i, opc: casos.opciones(i).valor, modo: g && g.que === 'andar' ? 'andar' : 'efecto', objetivo: null, prev: null };
    S.suena('spyElige');
    refresca();
  }
  function ponModo(modo) {
    if (!sel || ocupada()) return;
    Object.assign(sel, { modo, objetivo: null, prev: null });
    S.suena('spyElige');
    refresca();
  }
  // Un toque en una casilla del suelo (o en un guardia): elige el objetivo y, si ya era el elegido, lo confirma.
  function tocaCasilla(celda) {
    if (!sel || ocupada() || !celda) return;
    const q = objetivos(sel).lista.find((x) => x.x === celda.x && x.y === celda.y);
    if (!q) return;
    if (sel.objetivo && sel.objetivo.x === q.x && sel.objetivo.y === q.y) { ejecuta(); return; }
    sel.objetivo = q;
    sel.prev = esMovimiento(sel) ? casos.prevision(q, sel.modo === 'andar' ? AJ.turno.andar.pasos : sel.opc.carta.pasos, ruidoDe(sel)) : null;
    S.suena('spyElige');
    refresca();
  }
  // El guardia que hay bajo el dedo: se le toca el cuerpo, que en pantalla queda más arriba que su casilla.
  function guardiaEn(lista, px, py) {
    let mejor = null, cerca = 0.075;
    for (const g of lista) {
      const s = S.camara.aPantalla(E.cam, g.x + 0.5, 0.5, g.y + 0.5), d = Math.hypot((s.x - px) * E.cam.aspecto, s.y - py);
      if (s.delante && d < cerca) { mejor = g; cerca = d; }
    }
    return mejor;
  }
  function sigue() {
    if (ocupada()) return;
    if (aviso) aviso = null; else casos.sigue();
    S.suena('spyElige');
    refresca();
  }
  // Un toque en la vista (px y py, de 0 a 1): acelera lo que se está viendo, pasa la frase de Lola o elige lo que hay debajo.
  function toca(px, py) {
    if (ocupada()) { E.vis.rapido = 4; return; }
    if (!sel) { const g = senala(); if (aviso || (g && g.que === 'seguir')) sigue(); return; }
    const o = objetivos(sel);
    tocaCasilla(o.clase === 'guardias' ? guardiaEn(o.lista, px, py) : S.camara.casilla(E.cam, px, py));
  }

  // Coloca la vista en una planta con la partida `p` (cada escenario se construye una sola vez).
  function monta(nivel, planta, p) {
    E.planta = planta;
    if (!mundos.has(nivel)) mundos.set(nivel, S.escenario.construye(planta));
    E.mundo = mundos.get(nivel); E.secretos = p.secretos; E.marcas = VACIAS();
    A.sincroniza(E.vis, p, planta);
    S.camara.limites(E.cam, planta.ancho, planta.alto);
    sel = null; firma = ''; aviso = null; callada = null;
  }
  // Empieza una planta de verdad.
  function empieza(nivel, guiada) {
    const r = casos.empieza(nivel, guiada);
    if (!r.ok) return r;
    monta(nivel, casos.planta, casos.p);
    refresca(); refrescaEstado();
    return r;
  }
  // El fondo del menú: una planta tal como empieza, sin partida.
  function fondo(nivel) {
    monta(nivel, S.planta.de(plantas, nivel), S.partida.nueva(AJ, plantas, nivel, { azar }).valor);
  }

  const acciones = {
    carta: eligeCarta, modo: ponModo, usar: ejecuta, seguir: sigue,
    cancelar() { sel = null; refresca(); },
    acabar() { if (ocupada() || casos.p.fin) return; aviso = null; reproduce(casos.acaba()); },
    // quitar de en medio la frase de Lola (solo en el paso libre: en los demás hace falta para saber qué toca)
    callar() { const paso = casos.paso(); if (paso && paso.pide.que === 'libre' && !aviso && !ocupada()) { callada = paso.id; refresca(); } },
  };

  // A dónde mira la cámara: un poco por delante del agente, sin enseñar más vacío del necesario por los bordes de la planta.
  // Si la planta cabe entera en el hueco, la vista se queda quieta con el borde de abajo pegado a las cartas (y lo mismo a lo
  // ancho, centrada). Con la cámara girada no hay bordes que cuadrar: mira al agente y ya.
  function punto() {
    const a = E.vis.agente, pl = E.planta, C = S.camara;
    if (C.girada(E.cam)) return { x: a.x, z: a.z };
    const v = C.alcance(E.cam), medio = pl.ancho / 2;
    const x0 = Math.min(medio, v.lado - 0.4), x1 = Math.max(medio, pl.ancho - v.lado + 0.4);
    const z1 = pl.alto + 0.5 - v.sur, z0 = Math.min(z1, v.norte - 1.5);
    return { x: Math.max(x0, Math.min(x1, a.x)), z: Math.max(z0, Math.min(z1, a.z - 1)) };
  }

  return { E, acciones, empieza, fondo, toca, refresca, refrescaEstado, ocupada, punto, haySeleccion: () => !!sel };
};
