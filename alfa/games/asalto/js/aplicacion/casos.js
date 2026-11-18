// Fans of Asalto · APLICACIÓN · Los casos de uso: lo que el jugador puede hacer, uno por función. Cada caso valida, llama al dominio,
// guarda y devuelve AS.ok(...) o AS.error('codigo'). Juntan las dos mitades del juego: el progreso de fuera (plumas, mejoras, equipo,
// logros) y la partida en curso con su batalla. Se montan en principal.js con sus puertos: el almacén (carga/guarda el progreso y la
// partida) y el azar. No tocan la pantalla: la pantalla los llama y pinta lo que devuelven.
'use strict';
AS.creaCasos = ({ datos, almacen, azar }) => {
  const PR = AS.progreso;
  let prog = PR.deJSON(datos, almacen.carga());
  let partida = null, batalla = null, visto = null, nObjeto = 0, cifras = AS.cifras.vacio();   // cifras: las del último combate y las de la partida entera

  const guarda = () => { almacen.guarda(prog); };
  // un caso de progreso: si sale bien, el progreso nuevo se queda y se guarda
  function conProgreso(r, saca) {
    if (!r.ok) return r;
    prog = saca ? saca(r.valor) : r.valor;
    guarda();
    return r;
  }
  const idObjeto = () => 'o' + Math.floor(azar() * 1e9).toString(36) + (++nObjeto).toString(36);

  /* ---------- la partida: lo que va dejando en el progreso ---------- */
  function mira() { visto = { plumas: partida.plumas, cuenta: partida.cuenta }; }
  function sincroniza() {
    const c = partida.cuenta, d = k => c[k] - visto.cuenta[k];
    prog = PR.apunta(prog, { plumas: partida.plumas - visto.plumas, oroTotal: d('oroGanado'), enemigos: d('bajas'), jefes: d('jefes'), lineas: d('lineas'), ascensos: d('ascensos'), dorados: d('dorados') },
      { nivelMax: c.nivelMax });
    mira();
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
  const cfgPartida = (zona, sinFin, dif) => ({ zona, sinFin: !!sinFin, dificultad: dif || 0, guiada: zona === 0 && !sinFin && !prog.consejos.guia, mejoras: prog.mejoras, rarezas: prog.rarezas, equipo: PR.statsEquipo(datos, prog) });
  // los objetos del botín del jefe: 50 % normal, 35 % raro, 15 % épico
  function botin(n) {
    const lista = Array.from({ length: n }, () => { const r = azar(); return PR.objetoNuevo(datos, azar, idObjeto(), r < 0.5 ? 0 : r < 0.85 ? 1 : 2); });
    const g = PR.guardaObjetos(datos, prog, lista);
    prog = g.p;
    return { objetos: lista, fuera: g.fuera };
  }

  return {
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
    // plumas de regalo (el anuncio de la Tienda)
    regalaPlumas(n) { prog = PR.apunta(prog, { plumas: n }); guarda(); return AS.ok(prog.plumas); },
    consejoVisto(id) { prog = PR.consejoVisto(prog, id); guarda(); },
    // volver a ver la partida guiada: la próxima partida nueva de la primera zona la trae
    // ver la guía otra vez: vuelve la partida guiada y también los consejos de la primera vez (los que empiezan por «c-»)
    repiteGuia() { for (const id of ['guia', ...Object.keys(prog.consejos).filter(k => k.startsWith('c-'))]) prog = PR.olvidaConsejo(prog, id); guarda(); },
    sonido(vol, mus) { prog = { ...prog, vol, mus }; guarda(); },
    borraTodo() { prog = PR.nuevo(); partida = null; batalla = null; almacen.guardaPartida(null); guarda(); },
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
    absorbe: (desde, hasta) => conPartida(p => p.absorbe(desde, hasta)),
    deshace: () => conPartida(p => p.deshace()),
    asciende: (sitio, clase) => conPartida(p => p.asciende(sitio, clase)),

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
      const res = AS.batalla.resultado(batalla);
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
