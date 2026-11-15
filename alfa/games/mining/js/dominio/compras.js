// Fans Of Mining · dominio · COMPRAS: lo que se compra y con qué. Las mejoras del pico con oro; la mejora de cada material con piezas
// de ese material (aparece al haberlo visto); los Recuerdos con Indemnización; los nodos del plan de carrera con puntos. Cada compra
// devuelve MN.ok(nivel nuevo) o un error con nombre: 'sin-saldo', 'al-maximo', 'no-disponible', 'falta-requisito', 'desconocido'.
'use strict';
MN.compras = (() => {
  const AJ = MN.AJ, C = MN.curvas;
  const paga = (saldo, precio) => (saldo >= precio ? MN.ok(saldo - precio) : MN.error('sin-saldo', { falta: precio - saldo }));

  function precioPico(e, cual) {
    const c = AJ.picoMejoras[cual];
    return c ? C.coste(c, e.r.pico[cual]) : NaN;
  }
  function compraPico(e, cual) {
    const c = AJ.picoMejoras[cual];
    if (!c) return MN.error('desconocido', { cual });
    if (e.r.pico[cual] >= c.max) return MN.error('al-maximo');
    const pago = paga(e.r.oro, precioPico(e, cual));
    if (!pago.ok) return pago;
    e.r.oro = pago.valor;
    return MN.ok(++e.r.pico[cual]);
  }
  // un material está disponible cuando ya se ha llegado a una planta donde sale
  const vistoMaterial = (e, m) => C.materialesDe(e.r.plantaMax)[1] >= m;
  const precioMaterial = (e, m) => C.coste(AJ.mejoraMaterial, e.r.mejorasMat[m]);
  function compraMaterial(e, m) {
    if (!(m >= 0 && m < MN.MATERIALES.length)) return MN.error('desconocido', { m });
    if (!vistoMaterial(e, m)) return MN.error('no-disponible');
    if (e.r.mejorasMat[m] >= MN.bonos.calcula(e).topeMaterial) return MN.error('al-maximo');
    const pago = paga(e.r.piezas[m], precioMaterial(e, m));
    if (!pago.ok) return pago;
    e.r.piezas[m] = pago.valor;
    return MN.ok(++e.r.mejorasMat[m]);
  }
  const precioRecuerdo = (e, id) => C.coste(AJ.recuerdo, e.c.recuerdos[id] || 0);
  function compraRecuerdo(e, id) {
    if (!MN.RECUERDOS.some(r => r.id === id)) return MN.error('desconocido', { id });
    if ((e.c.recuerdos[id] || 0) >= AJ.recuerdo.max) return MN.error('al-maximo');
    const pago = paga(e.c.indemnizacion, precioRecuerdo(e, id));
    if (!pago.ok) return pago;
    e.c.indemnizacion = pago.valor;
    e.c.recuerdos[id] = (e.c.recuerdos[id] || 0) + 1;
    return MN.ok(e.c.recuerdos[id]);
  }
  // puntos del plan de carrera: uno por nivel roto de la Trituradora y uno cada AJ.carreraPuntos.cadaNiveles del nivel más alto
  function puntos(e) {
    const P = AJ.carreraPuntos;
    const ganados = e.c.trituradora.nivel * P.porNivelTrituradora + Math.floor(e.c.nivelMax / P.cadaNiveles);
    const gastados = MN.CARRERA.reduce((s, n) => s + (e.c.plan[n.id] ? n.coste : 0), 0);
    return ganados - gastados;
  }
  function compraCarrera(e, id) {
    const n = MN.CARRERA.find(x => x.id === id);
    if (!n) return MN.error('desconocido', { id });
    if (e.c.plan[id]) return MN.error('al-maximo');
    if (n.pide && !e.c.plan[n.pide]) return MN.error('falta-requisito', { pide: n.pide });
    if (puntos(e) < n.coste) return MN.error('sin-saldo', { falta: n.coste - puntos(e) });
    e.c.plan[id] = true;
    return MN.ok(1);
  }
  // qué parte de las piezas se vende sola al reciclar (0 a 1, en cuartos)
  function fijaVenta(e, parte) {
    if (![0, 0.25, 0.5, 0.75, 1].includes(parte)) return MN.error('desconocido', { parte });
    e.r.venta = parte;
    return MN.ok(parte);
  }

  // el nivel al que el equipo se despide solo (nodo 'autodespido' del plan de carrera); 0 lo apaga
  function fijaAutoDespido(e, nivel) {
    if (!e.c.plan.autodespido) return MN.error('falta-requisito', { pide: 'autodespido' });
    if (!(nivel === 0 || (Number.isInteger(nivel) && nivel >= 2))) return MN.error('desconocido', { nivel });
    e.c.autoDespido = nivel;
    return MN.ok(nivel);
  }

  return { fijaAutoDespido, precioPico, compraPico, vistoMaterial, precioMaterial, compraMaterial, precioRecuerdo, compraRecuerdo, puntos, compraCarrera, fijaVenta };
})();
