// Fans of Asalto · APLICACIÓN · Los casos de uso: lo que el jugador puede hacer, uno por función. Cada caso valida, llama al dominio,
// guarda y devuelve AS.ok(...) o AS.error('codigo'). Juntan las dos mitades del juego: el progreso de fuera (plumas, mejoras, equipo,
// logros) y la partida en curso con su batalla. Se montan en principal.js con sus puertos: el almacén (carga/guarda el progreso y la
// partida) y el azar. No tocan la pantalla: la pantalla los llama y pinta lo que devuelven.
'use strict';
AS.creaCasos = ({ datos, almacen, azar, hoy = () => '', compras: puertosCompras = {} }) => {   // hoy: el día como 'AAAA-MM-DD', con la hora del servidor (principal.js)
  const PR = AS.progreso;
  let prog = PR.deJSON(datos, almacen.carga());
  let partida = null, doblada = null, batalla = null, visto = null, nObjeto = 0, cifras = AS.cifras.vacio();   // cifras: las del último combate y las de la partida entera

  const guarda = () => { almacen.guarda(prog); };
  // las misiones del día: las lleva el sistema común de retos de core (RETOSL). Ese guarda lo suyo en el campo `retos` del progreso (el
  // `sobre` es su caja: se rellena con el progreso de ahora cada vez) y cobra con plumas; el día es el del servidor
  const sobre = {};
  const diaComoFecha = () => { const d = hoy().split('-').map(Number); return d.length === 3 ? new Date(d[0], d[1] - 1, d[2], 12) : new Date(); };
  const retos = RETOSL.crear({ save: () => { sobre.retos = prog.retos; return sobre; }, guardar: () => { prog = { ...prog, retos: sobre.retos }; guarda(); },
    pagar: plumas => { prog = PR.apunta(prog, { plumas }); }, diarias: datos.retosDia, semanales: [], logros: [], nDiarias: datos.retosDia.length, nSemanales: 0, hoy: diaComoFecha });
  // un caso de progreso: si sale bien, el progreso nuevo se queda y se guarda
  function conProgreso(r, saca) {
    if (!r.ok) return r;
    prog = saca ? saca(r.valor) : r.valor;
    guarda();
    return r;
  }
  // las compras (Coronas, aspectos, Sin anuncios; ADR 200): sus casos de uso se mezclan con los de aquí
  const compras = AS.creaCompras({ datos, leer: () => prog, escribe: p => { prog = p; guarda(); }, ...puertosCompras });
  const idObjeto = () => 'o' + Math.floor(azar() * 1e9).toString(36) + (++nObjeto).toString(36);

  /* ---------- la partida: lo que va dejando en el progreso ---------- */
  function mira() { visto = { plumas: partida.plumas, cuenta: partida.cuenta, unidos: partida.cuenta.absorbidos }; }
  // lo que la partida ha hecho desde la última vez, para las misiones del día. Los unidos solo cuentan hacia arriba: deshacer una unión y repetirla no suma otra vez
  function apuntaRetos(c) {
    const unidos = Math.max(0, c.absorbidos - visto.unidos);
    for (const [ev, n] of [['oleadas', c.oleadasGanadas - visto.cuenta.oleadasGanadas], ['lineas', c.lineas - visto.cuenta.lineas], ['unidos', unidos]]) if (n > 0) retos.evento(ev, n);
    visto.unidos = Math.max(visto.unidos, c.absorbidos);
  }
  function sincroniza() {
    const c = partida.cuenta, d = k => c[k] - visto.cuenta[k];
    apuntaRetos(c);
    prog = PR.apunta(prog, { plumas: partida.plumas - visto.plumas, oroTotal: d('oroGanado'), enemigos: d('bajas'), jefes: d('jefes'), lineas: d('lineas'), ascensos: d('ascensos'), dorados: d('dorados') },
      { nivelMax: c.nivelMax });
    visto = { plumas: partida.plumas, cuenta: c, unidos: visto.unidos };
    const j = partida.final ? null : partida.aJSON();
    if (j || partida.final) almacen.guardaPartida(j && { ...j, cifras });   // las cifras del combate viajan con la partida guardada
    guarda();
  }
  // un caso de la partida: se ejecuta, y si sale bien se apunta lo que haya dejado
  function conPartida(hace) {
    if (!partida) return AS.error('sin-partida');
    const r = hace(partida);
    if (r.ok) sincroniza();
    return r;
  }
  function cierra() {
    const p = partida;
    prog = PR.apuntaOleada(prog, p.zona, p.oleada - (p.final === 'victoria' ? 0 : 1), p.sinFin);
    if (p.final === 'victoria') prog = PR.terminaZona(prog, p.zona, p.dificultad);
    almacen.guardaPartida(null);
    guarda();
  }
  const zonaAbierta = (zona, sinFin) => !!datos.zonas[zona] && (sinFin ? prog.zonas.includes(zona) : zona === 0 || prog.zonas.includes(zona - 1));
  // la primera partida es guiada: en la primera zona, mientras no se haya hecho (o saltado) la guía
  const cfgPartida = (zona, sinFin, dif) => ({ zona, sinFin: !!sinFin, dificultad: dif || 0, guiada: zona === 0 && !sinFin && !prog.consejos.guia, mejoras: prog.mejoras, rarezas: prog.rarezas, despertar: prog.dormido, equipo: PR.statsEquipo(datos, prog) });
  // los objetos del botín del jefe: 50 % normal, 35 % raro, 15 % épico
  function botin(n) {
    const lista = Array.from({ length: n }, () => { const r = azar(); return PR.objetoNuevo(datos, azar, idObjeto(), r < 0.5 ? 0 : r < 0.85 ? 1 : 2); });
    const g = PR.guardaObjetos(datos, prog, lista);
    prog = g.p;
    return { objetos: lista, fuera: g.fuera };
  }

  // la oferta de cartas del Despertar abierta, con lo que la pantalla enseña (null si no hay)
  function ofertaDeCartas() {
    const o = partida && partida.despertar.oferta;
    if (!o) return null;
    const L = datos.legendarios, x = AS.equipo.todos(partida.equipo).find(t => t.h.id === o.id), info = AS.legendario.datosDe(datos, x.h);
    return { id: o.id, sitio: x.sitio, nombre: info ? info.nombre : '', cambiada: o.cambiada, puedeCambiar: partida.puedeAnuncio('cartas'),
      cartas: o.cartas.map(id => ({ id, nombre: L.cartas[id].nombre, txt: L.cartas[id].txt })) };
  }

  /* ---------- SOLO PARA PRUEBAS (panel DEV): rehacen la partida desde su guardado con unos héroes cambiados ---------- */
  // el héroe guardado, ya legendario: con el nivel de legendario como poco, ascendido a su primera clase si no lo estaba y marcado.
  // tipo (opcional): antes se convierte en ese Animal Loco, para probar las parejas de seres (conejo + vaca…); rama (opcional, tarea
  // #156): asciende a esa clase si es suya, para probar las parejas de los dioses (conejo luchador + vaca luchadora…)
  function legendarioDePrueba(jh, tipo, rama) {
    const t = datos.heroes[tipo] ? tipo : jh.tipo, clases = datos.heroes[t].clases;
    const suya = clases.includes(rama) ? rama : t === jh.tipo && jh.rama ? jh.rama : clases[0];
    return { ...jh, tipo: t, rama: suya, nivel: Math.max(jh.nivel, datos.legendarios.nivel), legendario: true };
  }
  // cambios: [{ sitio, tipo, rama }]. La partida se guarda y se vuelve a cargar con esos héroes hechos legendarios
  function devCambia(cambios) {
    if (!partida) return AS.error('sin-partida');
    const j = partida.aJSON() && JSON.parse(JSON.stringify(partida.aJSON()));
    if (!j) return AS.error('ahora-no');
    for (const { sitio, tipo, rama } of cambios) {
      const lista = sitio.donde === 'campo' ? j.equipo.campo : j.equipo.banquillo;
      if (!lista[sitio.i]) return AS.error('nadie-ahi');
      lista[sitio.i] = legendarioDePrueba(lista[sitio.i], tipo, rama);
    }
    const r = AS.Partida.deJSON(datos, j, PR.statsEquipo(datos, prog), azar);
    if (!r.ok) return r;
    partida = r.valor;
    sincroniza();
    return AS.ok(partida);
  }

  return {
    ...compras,
    get progreso() { return prog; },
    get partida() { return partida; },
    get batalla() { return batalla; },
    // las cifras del combate: { ultimo, partida }, cada una { ref del héroe: { tipo, dano, aguante, cura, bajas } }
    get cifras() { return cifras; },
    statsEquipo: () => PR.statsEquipo(datos, prog),
    logrosPendientes: () => PR.logrosPendientes(datos, prog),
    costeMejora: id => PR.costeMejora(datos, prog, id),
    rarezaSiguiente: () => PR.rarezaSiguiente(datos, prog),
    abreRareza: () => conProgreso(PR.abreRareza(datos, prog)),
    // el Poder Dormido: abre con plumas los Despertares I, II y III de los legendarios (para las partidas nuevas)
    dormidoSiguiente: () => PR.dormidoSiguiente(datos, prog),
    abreDormido: () => conProgreso(PR.abreDormido(datos, prog)),
    // las máquinas de invocar (se elige una para las partidas nuevas) y las dificultades de cada zona
    maquinaAbierta: id => PR.maquinaAbierta(datos, prog, id),
    abreMaquina: id => conProgreso(PR.abreMaquina(datos, prog, id)),
    eligeMaquina: id => conProgreso(PR.eligeMaquina(datos, prog, id)),
    dificultadAbierta: (zona, d) => zonaAbierta(zona, false) && PR.dificultadAbierta(datos, prog, zona, d),
    metas: () => PR.metas(datos, prog),
    // lo que las últimas acciones han dejado para enseñar (misiones cumplidas)
    avisos: () => (partida ? partida.recogeAvisos() : []),
    zonaAbierta,

    /* ---------- fuera de la partida ---------- */
    compraMejora: id => conProgreso(PR.compraMejora(datos, prog, id)),
    ponObjeto: id => conProgreso(PR.ponObjeto(datos, prog, id)),
    quitaObjeto: hueco => conProgreso(PR.quitaObjeto(datos, prog, hueco)),
    deshaceObjeto: id => conProgreso(PR.deshaceObjeto(datos, prog, id)),
    mejoraObjeto: hueco => conProgreso(PR.mejoraObjeto(datos, prog, hueco)),
    compraCofre: () => conProgreso(PR.compraCofre(datos, prog, azar, idObjeto()), v => v.p),
    cobraLogro: id => conProgreso(PR.cobraLogro(datos, prog, id)),
    // plumas de regalo del anuncio de la Tienda (tope por día; llamar solo DESPUÉS de verse el anuncio): AS.ok({ p, plumas }) o 'tope-diario'
    plumasDeRegalo: () => conProgreso(PR.regalaPlumas(datos, prog, hoy()), v => v.p),
    // el regalo diario (calendario de 7 días): lo que enseña la ventana, si hay uno por cobrar y cobrarlo o doblarlo (esto último, solo DESPUÉS de verse el anuncio)
    regalo: () => ({ ...AS.regalo.calendario(datos, prog.diario, hoy()) }),
    dia: () => hoy(),
    hayRegalo: () => AS.regalo.pendiente(prog.diario, hoy()),
    cobraRegalo: () => conProgreso(PR.cobraRegalo(datos, prog, hoy(), azar, idObjeto), v => v.p),
    doblaRegalo: () => conProgreso(PR.doblaRegalo(datos, prog, hoy(), azar, idObjeto), v => v.p),
    // las misiones del día: [{ id, txt, goal, prog, r, listo, cobrada }], cuántas esperan cobro y cobrar una
    misionesDia: () => retos.lista('d').sort((a, b) => datos.retosDia.findIndex(x => x.id === a.id) - datos.retosDia.findIndex(x => x.id === b.id)),   // siempre en el mismo orden
    misionesListas: () => retos.listos('d'),
    cobraMision: id => (retos.cobrar('d', id) ? AS.ok(true) : AS.error('mision-no-cobrable')),
    regalosQuedan: () => AS.anuncios.regaloQuedan(datos, prog.regalo, hoy()),
    // doblar las plumas de la partida acabada con anuncio (una vez por partida; llamar solo DESPUÉS de verse el anuncio): AS.ok(las plumas que suma)
    puedeDoblar: () => !!partida && AS.anuncios.dobla({ plumas: partida.plumas, final: partida.final, yaDoblada: doblada === partida }).ok,
    doblaPlumas() {
      if (!partida) return AS.error('sin-partida');
      const r = AS.anuncios.dobla({ plumas: partida.plumas, final: partida.final, yaDoblada: doblada === partida });
      if (!r.ok) return r;
      doblada = partida; prog = PR.apunta(prog, { plumas: r.valor }); guarda();
      return r;
    },
    // plumas sin anuncio (solo el panel DEV)
    regalaPlumas(n) { prog = PR.apunta(prog, { plumas: n }); guarda(); return AS.ok(prog.plumas); },
    consejoVisto(id) { prog = PR.consejoVisto(prog, id); guarda(); },
    // volver a ver la partida guiada: la próxima partida nueva de la primera zona la trae
    // ver la guía otra vez: vuelve la partida guiada y también los consejos de la primera vez (los que empiezan por «c-»)
    repiteGuia() { for (const id of ['guia', ...Object.keys(prog.consejos).filter(k => k.startsWith('c-'))]) prog = PR.olvidaConsejo(prog, id); guarda(); },
    sonido(vol, mus) { prog = { ...prog, vol, mus }; guarda(); },
    // «Borrar todo»: lo comprado con euros (Coronas, aspectos, Pack de inicio) se queda
    borraTodo() { prog = { ...PR.nuevo(), ...AS.coronas.pagado(prog) }; partida = null; batalla = null; almacen.guardaPartida(null); guarda(); },
    // para la partida en la nube: cambiar el progreso entero por el que llega
    cambiaProgreso(j) { prog = PR.deJSON(datos, j); guarda(); },

    /* ---------- empezar, seguir y dejar una partida ---------- */
    // dif: la dificultad (0, 1 o 2; sin decir nada, la primera). El modo sin fin va siempre en la primera
    nuevaPartida(zona, sinFin, dif) {
      if (!zonaAbierta(zona, sinFin)) return AS.error('zona-cerrada');
      if (!sinFin && dif && !PR.dificultadAbierta(datos, prog, zona, dif)) return AS.error('dificultad-cerrada');
      const cfg = cfgPartida(zona, sinFin, dif), r = AS.Partida.nueva(datos, { ...cfg, maquina: cfg.guiada ? 'altar' : prog.maquina }, azar);   // la partida guiada enseña el Altar de siempre
      if (!r.ok) return r;
      partida = r.valor; batalla = null; cifras = AS.cifras.vacio(); mira();
      prog = PR.empiezaPartida(prog);
      sincroniza();
      return r;
    },
    hayGuardada: () => !!almacen.cargaPartida(),
    // un resumen de la partida guardada, para el menú: por dónde va y quién está en el campo. null si no hay
    guardada() {
      const j = almacen.cargaPartida();
      if (!j || !j.equipo) return null;
      return { zona: j.zona, oleada: j.n, sinFin: !!j.sinFin, dificultad: j.dificultad || 0, heroes: (j.equipo.campo || []).filter(Boolean).map(h => ({ tipo: h.tipo, nivel: h.nivel, dorado: !!h.dorado })) };
    },
    continua() {
      const j = almacen.cargaPartida();
      const r = AS.Partida.deJSON(datos, j, PR.statsEquipo(datos, prog), azar);
      if (!r.ok) { almacen.guardaPartida(null); return r; }
      partida = r.valor; batalla = null; cifras = AS.cifras.deJSON(datos, j.cifras); mira();
      return r;
    },
    // dejar la partida a medias: cuenta hasta donde se llegó
    abandona() {
      if (!partida) return AS.error('sin-partida');
      prog = PR.apuntaOleada(prog, partida.zona, partida.oleada - 1, partida.sinFin);
      partida = null; batalla = null;
      almacen.guardaPartida(null); guarda();
      return AS.ok(true);
    },

    /* ---------- preparar la oleada ---------- */
    invoca: () => conPartida(p => p.invoca(azar)),
    empuja: (col, dir) => conPartida(p => p.empuja(col, dir, azar)),
    // el Estallido de la segunda máquina: uno por oleada
    estalla: () => conPartida(p => p.estalla(azar)),
    // gasta la piedra de destino i de la bolsa: una tirada aparte, gratis y con la rareza subida
    tiraPiedra: i => conPartida(p => p.tiraPiedra(i, azar)),
    mueve: (desde, hasta) => conPartida(p => p.mueve(desde, hasta)),
    cambia: (a, b) => conPartida(p => p.cambia(a, b)),
    // qué ganaría el que se queda si se unen: no cambia ni guarda nada
    vistaUnion: (desde, hasta) => (partida ? partida.vistaUnion(desde, hasta) : AS.error('sin-partida')),
    absorbe: (desde, hasta) => conPartida(p => p.absorbe(desde, hasta, azar)),
    deshace: () => conPartida(p => p.deshace()),
    asciende: (sitio, clase) => conPartida(p => p.asciende(sitio, clase, azar)),

    /* ---------- el Despertar de los legendarios: mientras haya oferta de cartas no se lucha ---------- */
    oferta: ofertaDeCartas,
    eligeCarta: carta => conPartida(p => p.eligeCarta(carta, azar)),
    // otras 3 cartas con anuncio (una vez por oferta): llamar solo DESPUÉS de verse el anuncio entero. Es el anuncio 'cartas'
    cambiaCartas: () => conPartida(p => p.anuncio('cartas', azar)),
    // SOLO PARA PRUEBAS (panel DEV): el héroe de ese sitio, legendario al instante; y un ser uniendo dos (tipos: [el de desde, el de
    // hasta], opcional: por defecto se quedan los suyos; para conejo + vaca, ['heroe-bunny', 'heroe-mechavaca']). ramas (opcional, igual
    // que tipos): para un dios, la pareja exacta; para el Gran Jefe Supremo, tipos conejo y vaca y ramas ['luchador', 'luchador']
    devLegendario: (sitio, tipo) => devCambia([{ sitio, tipo }]),
    devSer(desde, hasta, tipos = [], ramas = []) {
      const r = devCambia([{ sitio: desde, tipo: tipos[0], rama: ramas[0] }, { sitio: hasta, tipo: tipos[1], rama: ramas[1] }]);
      return r.ok ? conPartida(p => p.absorbe(desde, hasta, azar)) : r;
    },

    /* ---------- la tienda de la partida ---------- */
    compraObjeto: i => conPartida(p => p.compraObjeto(i)),
    vendeObjeto: id => conPartida(p => p.vendeObjeto(id)),
    cambiaOferta: () => conPartida(p => p.cambiaOferta(azar)),
    // los anuncios opcionales ('oferta', 'esencia' o 'vida'): llamar solo DESPUÉS de verse el anuncio entero
    puedeAnuncio: tipo => !!partida && partida.puedeAnuncio(tipo),
    anuncio: tipo => conPartida(p => p.anuncio(tipo, azar)),

    /* ---------- la batalla ---------- */
    lucha() {
      if (!partida) return AS.error('sin-partida');
      const r = partida.lucha();
      if (!r.ok) return r;
      batalla = AS.batalla.crea({ ...r.valor, azar });
      return AS.ok(batalla);
    },
    // avanza la batalla un paso de dt segundos; devuelve la batalla (con sus eventos nuevos en batalla.eventos)
    tic(dt) { if (batalla) AS.batalla.avanza(batalla, dt); return batalla; },
    terminaOleada() {
      if (!partida || !batalla || !batalla.fin) return AS.error('batalla-sin-acabar');
      const res = { cosecha: batalla.cosecha || 0, ...AS.batalla.resultado(batalla) };   // la esencia de la carta «Cosecha» (B.cosecha)
      const r = partida.terminaOleada(res, azar);
      if (!r.ok) return r;
      batalla = null; cifras = AS.cifras.suma(cifras, res.cifras);
      sincroniza();
      if (partida.fase === 'fin') cierra();
      return AS.ok({ ...r.valor, batalla: res });
    },

    /* ---------- los premios ---------- */
    cobraCofre(doble) {
      if (!partida) return AS.error('sin-partida');
      const r = partida.cobraCofre(doble);
      if (!r.ok) return r;
      const b = r.valor.objetos ? botin(r.valor.objetos) : { objetos: [], fuera: 0 };
      sincroniza();
      if (partida.fase === 'fin') cierra();
      return AS.ok({ ...r.valor, objetos: b.objetos, fuera: b.fuera });
    },
    eligeReliquia: id => conPartida(p => p.eligeReliquia(id)),
    refrescaReliquias: () => conPartida(p => p.refrescaReliquias(azar)),
    todasLasReliquias: () => conPartida(p => p.todasLasReliquias()),
  };
};
