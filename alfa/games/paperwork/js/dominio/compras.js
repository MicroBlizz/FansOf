// Fans Of Paperwork · dominio · COMPRAS: lo que se compra y con qué. Los útiles del líder y la herramienta de cada zona con oro; la mejora de cada documento con expedientes
// de ese documento (aparece al haberlo visto); los Recuerdos con Indemnización; los nodos del plan de carrera con puntos. Cada compra
// devuelve PW.ok(nivel nuevo) o un error con nombre: 'sin-saldo', 'al-maximo', 'no-disponible', 'falta-requisito', 'desconocido'.
'use strict';
PW.compras = (() => {
  const AJ = PW.AJ, C = PW.curvas;
  const paga = (saldo, precio) => (saldo >= precio ? PW.ok(saldo - precio) : PW.error('sin-saldo', { falta: precio - saldo }));

  function precioUtil(e, cual) {
    const c = AJ.utiles[cual];
    return c ? C.coste(c, e.r.utiles[cual]) : NaN;
  }
  // la zona más honda de la que ya han salido documentos en este turno (los de una zona asoman unas plantas antes de llegar a ella)
  const zonaVista = e => C.zonaDeDocumento(C.documentosDe(e.r.plantaMax)[1]);
  // la herramienta de la zona z (quitagrapas, cúter, abrecartas): se puede comprar en cuanto sale un documento de su zona
  const vistaZona = (e, z) => zonaVista(e) >= z;
  const precioHerramienta = (e, z) => C.coste(AJ.herramienta, e.r.herramientas[z]) * Math.pow(AJ.herramienta.porZona, z);
  function compraHerramienta(e, z) {
    if (!(Number.isInteger(z) && z >= 0 && z < PW.ZONAS.length)) return PW.error('desconocido', { z });
    if (!vistaZona(e, z)) return PW.error('no-disponible');
    if (e.r.herramientas[z] >= AJ.herramienta.max) return PW.error('al-maximo');
    const pago = paga(e.r.oro, precioHerramienta(e, z));
    if (!pago.ok) return pago;
    e.r.oro = pago.valor;
    return PW.ok(++e.r.herramientas[z]);
  }
  // un útil propio de una zona (las fundas) no sale hasta llegar a ella
  function vistoUtil(e, cual) {
    const u = PW.UTILES.find(x => x.id === cual);
    if (!u || (u.abre && !PW.desbloqueos.tiene(e, u.abre))) return false;
    if (u.duro && C.documentosDe(e.r.plantaMax)[1] < AJ.dureza.desde) return false;
    return u.zona === undefined || zonaVista(e) >= u.zona;
  }
  function compraUtil(e, cual) {
    const c = AJ.utiles[cual];
    if (!c) return PW.error('desconocido', { cual });
    if (!vistoUtil(e, cual)) return PW.error('no-disponible');
    if (e.r.utiles[cual] >= c.max) return PW.error('al-maximo');
    const pago = paga(e.r.oro, precioUtil(e, cual));
    if (!pago.ok) return pago;
    e.r.oro = pago.valor;
    return PW.ok(++e.r.utiles[cual]);
  }
  // un documento está disponible cuando ya se ha llegado a una planta donde sale
  const vistoDocumento = (e, m) => C.documentosDe(e.r.plantaMax)[1] >= m;
  const precioDocumento = (e, m) => C.coste(AJ.mejoraDocumento, e.r.mejorasDoc[m]);
  function compraDocumento(e, m) {
    if (!(m >= 0 && m < PW.DOCUMENTOS.length)) return PW.error('desconocido', { m });
    if (!vistoDocumento(e, m)) return PW.error('no-disponible');
    if (e.r.mejorasDoc[m] >= PW.bonos.calcula(e).topeDocumento) return PW.error('al-maximo');
    const pago = paga(e.r.expedientes[m], precioDocumento(e, m));
    if (!pago.ok) return pago;
    e.r.expedientes[m] = pago.valor;
    return PW.ok(++e.r.mejorasDoc[m]);
  }
  const precioRecuerdo = (e, id) => C.coste(AJ.recuerdo, e.c.recuerdos[id] || 0);
  function compraRecuerdo(e, id) {
    if (!PW.RECUERDOS.some(r => r.id === id)) return PW.error('desconocido', { id });
    if ((e.c.recuerdos[id] || 0) >= AJ.recuerdo.max) return PW.error('al-maximo');
    const pago = paga(e.c.indemnizacion, precioRecuerdo(e, id));
    if (!pago.ok) return pago;
    e.c.indemnizacion = pago.valor;
    e.c.recuerdos[id] = (e.c.recuerdos[id] || 0) + 1;
    return PW.ok(e.c.recuerdos[id]);
  }
  // puntos del plan de carrera: uno por nivel atascado de la Trituradora, uno cada AJ.carreraPuntos.cadaNiveles del nivel más alto
  // y los comprados con grapas de oro (dominio/meritos.js)
  function puntos(e) {
    const P = AJ.carreraPuntos;
    const ganados = e.c.trituradora.nivel * P.porNivelTrituradora + Math.floor(e.c.nivelMax / P.cadaNiveles) + e.c.puntosComprados;
    const gastados = PW.CARRERA.reduce((s, n) => s + (e.c.plan[n.id] ? n.coste : 0), 0);
    return ganados - gastados;
  }
  function compraCarrera(e, id) {
    const n = PW.CARRERA.find(x => x.id === id);
    if (!n) return PW.error('desconocido', { id });
    if (!PW.desbloqueos.tiene(e, 'plan')) return PW.error('no-disponible');
    if (e.c.plan[id]) return PW.error('al-maximo');
    if (n.pide && !e.c.plan[n.pide]) return PW.error('falta-requisito', { pide: n.pide });
    if (puntos(e) < n.coste) return PW.error('sin-saldo', { falta: n.coste - puntos(e) });
    e.c.plan[id] = true;
    return PW.ok(1);
  }
  // la fotocopiadora (nodo del plan): el tipo de documento que da el doble; -1 la apaga. Solo documentos a los que ya se llegó alguna vez
  function fijaFotocopia(e, m) {
    if (!e.c.plan.fotocopiadora) return PW.error('falta-requisito', { pide: 'fotocopiadora' });
    if (m !== -1 && !(Number.isInteger(m) && m >= 0 && m < PW.DOCUMENTOS.length)) return PW.error('desconocido', { m });
    if (m !== -1 && C.documentosDe(e.c.plantaMax)[1] < m) return PW.error('no-disponible');
    e.c.fotocopia = m;
    return PW.ok(m);
  }
  // qué parte de los expedientes se vende sola al clasificar (0 a 1, en cuartos)
  function fijaVenta(e, parte) {
    if (![0, 0.25, 0.5, 0.75, 1].includes(parte)) return PW.error('desconocido', { parte });
    e.r.venta = parte;
    return PW.ok(parte);
  }

  // el nivel al que el equipo se despide solo (nodo 'autodespido' del plan de carrera); 0 lo apaga
  function fijaAutoDespido(e, nivel) {
    if (!e.c.plan.autodespido) return PW.error('falta-requisito', { pide: 'autodespido' });
    if (!(nivel === 0 || (Number.isInteger(nivel) && nivel >= 2))) return PW.error('desconocido', { nivel });
    e.c.autoDespido = nivel;
    return PW.ok(nivel);
  }

  return { vistoUtil, fijaFotocopia, fijaAutoDespido, precioUtil, compraUtil, vistaZona, precioHerramienta, compraHerramienta, vistoDocumento, precioDocumento, compraDocumento, precioRecuerdo, compraRecuerdo, puntos, compraCarrera, fijaVenta };
})();
