// Fans of Pinball · dominio · FOTO: todo lo que hay que pintar, en un objeto plano que se RELLENA en cada llamada (no se crea: sin basura
// en el bucle, MOVIL.md apartado 3). Vale hasta la siguiente llamada; quien quiera guardarlo, que lo copie. Unidades del mundo (x de 0 a
// 180, y de 0 arriba a 640 abajo), segundos y radianes. Los campos, en fija() y en las copias de abajo.
'use strict';
PB.foto = (() => {
  const FOTOS = new WeakMap();
  // copia en `destino` los vivos de `fuente`, reutilizando sus objetos
  function rellenaLista(destino, fuente, copia) {
    let n = 0;
    for (const o of fuente) if (o.vivo !== false) destino[n] = copia(destino[n] || {}, o), n++;
    destino.length = n;
    return destino;
  }
  function bola(d, b) {
    d.id = b.id; d.criatura = b.criatura; d.x = b.x; d.y = b.y; d.r = b.r; d.angulo = b.ang; d.vx = b.vx; d.vy = b.vy;
    d.viajando = b.estado !== 'mesa'; d.enTienda = b.estado === 'tienda'; d.espera = b.estado === 'viaje' && b.viaje.t === 0;
    d.atrapada = b.atrapada; d.oculta = b.oculta; d.dinamita = b.dinamita; d.clon = b.clon; d.estela = b.estela > 0; d.rastro = b.rastro;
    return d;
  }
  function pala(d, p) {
    d.id = p.id; d.nivel = p.nivel; d.lado = p.lado; d.x = p.x; d.y = p.y; d.largo = p.largo; d.grosor = p.grosor;
    d.angulo = p.ang; d.pulsada = p.pulsada; d.congelada = p.congelada; d.lenta = p.lenta;
    return d;
  }
  function cosa(d, o) {
    d.id = o.id; d.tipo = o.tipo; d.x = o.x; d.y = o.y; d.r = o.r; d.vida = o.vida; d.vidaMax = o.vidaMax;
    return d;
  }
  const fijo = (d, o) => Object.assign(d, { id: o.id, x: o.x, y: o.y, r: o.r, encendida: o.luz > 0 });
  const rebotador = (d, o) => Object.assign(d, { lado: o.lado, encendida: o.luz > 0 });
  const enemigo = (d, o) => Object.assign(cosa(d, o), { casco: o.casco, cascoMax: o.cascoMax, dir: o.dir });
  const punto = (d, o) => Object.assign(d, { tipo: o.tipo, x: o.x, y: o.y, r: o.r || 0, pala: o.pala || null });
  function jefe(f, j) {
    if (!j) { f.jefe = null; return; }
    const d = f.jefe || (f.jefe = { cajas: [], laser: null });
    Object.assign(d, { x: j.x, y: j.y, r: j.r, vida: j.vida, vidaMax: j.vidaMax, vivo: j.vivo, abierto: j.nucleo > 0, nucleo: j.movil ? null : j.nucleo,
      movil: j.movil, rabia: j.rabia, laser: j.apunta ? { pala: j.apunta, segundos: j.aviso } : null });
    rellenaLista(d.cajas, j.cajas, cosa);
  }
  // lo que no cambia en toda la partida
  function fija(s) {
    const m = s.r.mesa;
    return { mundo: { ancho: m.ancho, alto: m.alto, niveles: m.niveles }, paredes: s.mesa.paredes, puerta: s.mesa.puerta,
      escalera: { ...m.escalera, abierta: false }, rampa: m.rampa, lanzador: m.lanzador, desague: m.desague,
      equipo: s.equipo, bolas: [], palas: [], rompibles: [], setas: [], maquinas: [], rebotadores: [], enemigos: [], cafes: [], cubitos: [],
      bolsas: [], jefe: null, caos: {}, sala: {}, oferta: [], tienda: { ...m.tienda, estado: 'lista', puede: false, oferta: [] } };
  }
  function marcador(f, s) {
    const rr = s.r.reloj, sala = s.sala, fs = f.sala, c = f.caos;
    f.fase = s.fase; f.modo = s.modo; f.planta = s.planta; f.reloj = s.reloj; f.puntos = s.puntos; f.fichas = Math.floor(s.fichas);
    f.relojParado = PB.marcador.protegida(s) && s.reloj <= rr.minimoProtegido; f.combo = s.combo; f.multiplicador = PB.marcador.multiplicador(s);
    f.criatura = s.equipo[s.activa]; f.mejoras = s.mejoras; f.barajar = s.barajar; f.resultado = s.resultado;
    c.barra = s.caos.barra; c.umbral = s.caos.umbral; c.activo = s.caos.activo; c.quedan = s.caos.quedan; c.duracion = s.caos.duracion;
    fs.tipo = sala.tipo; fs.tiempo = sala.tiempo; fs.barra = PB.marcador.barraSala(s); fs.umbral = sala.umbral / 100;
    fs.abierta = sala.abierta; fs.salvabolas = sala.tiempo < rr.salvabolas;
    f.escalera.abierta = sala.abierta;
    f.tienda.estado = sala.tienda; f.tienda.puede = PB.tienda.puedeEntrar(s);
  }
  function oferta(f, s) {
    const lista = s.r.mejoras.lista;
    f.oferta.length = 0;
    for (const id of s.oferta) {
      const m = lista.find(x => x.id === id);
      f.oferta.push({ id, nombre: m.nombre, texto: m.texto, rareza: m.rareza, tiene: s.mejoras[id] || 0 });
    }
  }
  // lo que ofrece Lola en la tienda, con su precio (solo mientras se compra)
  function tienda(f, s) {
    const lista = s.r.mejoras.lista, o = f.tienda.oferta;
    o.length = 0;
    if (!s.compra) return;
    for (const id of s.compra.oferta) {
      const m = lista.find(x => x.id === id);
      o.push({ id, nombre: m.nombre, texto: m.texto, rareza: m.rareza, tiene: s.mejoras[id] || 0, precio: PB.tienda.precio(s.r, id) });
    }
  }
  function rellena(s) {
    let f = FOTOS.get(s);
    if (!f) { f = fija(s); FOTOS.set(s, f); }
    marcador(f, s);
    rellenaLista(f.bolas, s.bolas, bola);
    rellenaLista(f.palas, s.palas, pala);
    rellenaLista(f.rompibles, s.sala.rompibles, cosa);
    rellenaLista(f.setas, s.sala.setas, cosa);
    rellenaLista(f.maquinas, s.sala.maquinas, fijo);
    rellenaLista(f.rebotadores, s.sala.rebotadores, rebotador);
    rellenaLista(f.enemigos, s.sala.enemigos, enemigo);
    rellenaLista(f.cafes, s.cafes, punto);
    rellenaLista(f.cubitos, s.cubitos, punto);
    rellenaLista(f.bolsas, s.bolsas, punto);
    jefe(f, s.sala.jefe);
    if (s.fase === 'eligiendo' || f.oferta.length) oferta(f, s);
    if (s.compra || f.tienda.oferta.length) tienda(f, s);
    return f;
  }
  return { rellena };
})();
