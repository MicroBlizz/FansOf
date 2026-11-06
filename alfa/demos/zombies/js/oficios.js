// Fans of Zombies · FABRICAR, COCINAR, EL GRIFO Y DESMONTAR (dominio): las recetas de AJ.recetas (vendas con tela en cualquier sitio;
// filete y guiso «al fuego»: junto a un bidón con fuego o en la cocina de una casa mientras haya luz); el grifo de la cocina, para beber
// o llenar botellas, hasta que cortan el agua; y desmontar muebles con palanca o martillo, que deja tablas y clavos en el sitio.
'use strict';
var ZOM = globalThis.ZOM || (globalThis.ZOM = {});
(function (Z) {
  // ¿dónde estás para cocinar? 'fuego' si es un bidón, o una cocina con luz
  Z.dondeCocinas = (e, tipoSitio) => (tipoSitio === 'fuego' || (tipoSitio === 'cocina' && !e.sinLuz) ? 'fuego' : null);
  Z.receta = (AJ, id) => AJ.recetas.find((r) => r.id === id) || null;
  Z.faltaPara = (AJ, m, r) => r.con.filter(([id, n]) => Z.cuantos(m, id) < n).map(([id]) => id);

  // fabricar: comprueba en una copia que lo que sale cabe; si cabe, lo hace de verdad
  Z.fabrica = function (AJ, e, id, donde) {
    const r = Z.receta(AJ, id), m = e.jugador.mochila;
    if (!r) return Z.error('sinReceta', { id });
    if (r.donde && r.donde !== donde) return Z.error('sinFuego');
    if (Z.faltaPara(AJ, m, r).length) return Z.error('faltaMaterial', { falta: Z.faltaPara(AJ, m, r) });
    const copia = JSON.parse(JSON.stringify(m));
    for (const [cid, n] of r.con) Z.gasta(copia, cid, n);
    if (Z.meter(AJ, copia, r.sale[0], r.sale[1])) return Z.error('noCabe', { id: r.sale[0] });
    if (r.deja) Z.meter(AJ, copia, r.deja[0], r.deja[1]);
    m.piezas = copia.piezas; m.uid = copia.uid;
    e.eventos.push({ tipo: 'fabrica', id });
    return Z.ok(r.sale[0]);
  };

  // el grifo de la cocina: beber o llenar una botella vacía, hasta el corte de agua
  Z.bebeGrifo = function (AJ, e) {
    if (e.sinAgua) return Z.error('sinAgua');
    const J = e.jugador; J.sed = Math.min(100, J.sed + AJ.grifo.sed);
    e.eventos.push({ tipo: 'usa', cosa: 'grifo' });
    return Z.ok(true);
  };
  Z.llenaBotella = function (AJ, e) {
    if (e.sinAgua) return Z.error('sinAgua');
    const p = e.jugador.mochila.piezas.find((q) => q.id === 'botella');
    if (!p) return Z.error('sinBotella');
    p.id = 'agua';                                              // misma forma: se cambia en su sitio
    e.eventos.push({ tipo: 'usa', cosa: 'grifo' });
    return Z.ok(true);
  };

  // desmontar un mueble (tipo en AJ.desmontar.tipos): con palanca o martillo, tarda, suena y deja tablas y clavos dentro
  Z.empiezaDesmontar = function (AJ, e, sitio, tipo) {
    const D = AJ.desmontar.tipos[tipo], m = e.jugador.mochila;
    if (!D) return Z.error('noSeDesmonta');
    if (e.desmontados[sitio]) return Z.error('yaDesmontado');
    if (!Z.tiene(m, 'palanca') && !Z.tiene(m, 'martillo')) return Z.error('sinHerramienta');
    e.jugador.desmonta = { sitio, tipo, t: AJ.desmontar.tiempo };
    return Z.ok(sitio);
  };
  Z.pasoDesmontar = function (AJ, e, dt) {
    const J = e.jugador, D = J.desmonta;
    if (!D || (D.t -= dt) > 0) return;
    J.desmonta = null; e.desmontados[D.sitio] = true; e.registrados[D.sitio] = true;
    const [tablas, clavos] = AJ.desmontar.tipos[D.tipo], lista = e.contenidos[D.sitio] || (e.contenidos[D.sitio] = []);
    if (tablas) lista.push({ id: 'tablas', n: tablas });
    if (clavos) lista.push({ id: 'clavos', n: clavos });
    Z.haceRuido(AJ, e, J.x, J.z, AJ.desmontar.ruido * (J.A.ruido || 1), 'jugador');
    e.abierto = D.sitio; e.tipoAbierto = D.tipo;
    e.eventos.push({ tipo: 'desmontado', sitio: D.sitio, tablas, clavos });
  };
})(ZOM);
