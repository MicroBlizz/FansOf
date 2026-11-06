// Fans of Zombies · PUERTAS, VENTANAS Y BARRICADAS (dominio): cada casa tiene huecos (e.huecos[id] = { tipo, vida, tablas, roto,
// abierta }). Una puerta se abre y se cierra; una ventana tiene cristal. Con martillo, tablas y clavos clavas hasta 3 tablas en un hueco
// (tarda y suena). Los fans que no pueden pasar golpean el hueco: primero caen las tablas, luego el cristal o la puerta. Por un hueco
// abierto o roto (y sin tablas) se pasa. El mundo dice dónde está cada hueco (mundo.huecoCerca) y la pantalla abre o cierra su sólido.
'use strict';
var ZOM = globalThis.ZOM || (globalThis.ZOM = {});
(function (Z) {
  // añade los huecos que falten (al crear la partida y al cargar una guardada de antes de las casas)
  Z.preparaHuecos = function (AJ, e, lista) {
    e.huecos = e.huecos || {};
    for (const h of lista) if (!e.huecos[h.id]) e.huecos[h.id] = { tipo: h.tipo, vida: AJ.huecos[h.tipo].vida, tablas: 0, roto: false, abierta: false };
  };
  Z.pasable = (h) => !!h && h.tablas === 0 && (h.roto || (h.tipo === 'puerta' && h.abierta));

  Z.usaPuerta = function (AJ, e, id) {
    const h = e.huecos[id];
    if (!h || h.tipo !== 'puerta') return Z.error('noEsPuerta');
    if (h.roto) return Z.error('puertaRota');
    if (h.tablas) return Z.error('conTablas');
    h.abierta = !h.abierta;
    Z.haceRuido(AJ, e, e.jugador.x, e.jugador.z, AJ.ruido.puerta, 'jugador');
    e.eventos.push({ tipo: 'puerta', id, abierta: h.abierta });
    return Z.ok(h.abierta);
  };

  // clavar una tabla: martillo, 1 tabla y clavos en la mochila; tarda un poco y se oye. Cierra la puerta
  Z.empiezaTablas = function (AJ, e, id) {
    const h = e.huecos[id], J = e.jugador, B = AJ.huecos.barricada, m = J.mochila;
    if (!h) return Z.error('nadaCerca');
    if (h.tablas >= B.max) return Z.error('yaTapado');
    if (!Z.tiene(m, 'martillo')) return Z.error('sinMartillo');
    if (!Z.tiene(m, 'tablas') || Z.cuantos(m, 'clavos') < B.clavos) return Z.error('sinTablas');
    J.clava = { id, t: B.tiempo };
    return Z.ok(id);
  };
  Z.pasoTablas = function (AJ, e, dt) {
    const J = e.jugador, C = J.clava, B = AJ.huecos.barricada;
    if (!C) return;
    if ((C.t -= dt) > 0) return;
    J.clava = null;
    const h = e.huecos[C.id];
    if (!Z.gasta(J.mochila, 'tablas', 1).ok || !Z.gasta(J.mochila, 'clavos', B.clavos).ok) return;
    h.tablas++; h.vida = B.vidaTabla; h.abierta = false;
    Z.haceRuido(AJ, e, J.x, J.z, AJ.ruido.martillo * (J.A.ruido || 1), 'jugador');
    e.eventos.push({ tipo: 'tabla', id: C.id, tablas: h.tablas });
  };

  // un fan golpea un hueco: primero las tablas (de una en una), luego el cristal o la puerta. pos = dónde está (para el ruido)
  Z.golpeaHueco = function (AJ, e, id, dano, pos) {
    const h = e.huecos[id];
    if (!h || Z.pasable(h)) return;
    h.vida -= dano;
    if (h.vida > 0) return;
    if (h.tablas > 0) {
      h.tablas--; h.vida = h.tablas ? AJ.huecos.barricada.vidaTabla : AJ.huecos[h.tipo].vida;
      e.eventos.push({ tipo: 'tablaRota', id, tablas: h.tablas });
      return;
    }
    h.roto = true; h.abierta = true; h.vida = 0;
    e.eventos.push({ tipo: 'huecoRoto', id, hueco: h.tipo });
    if (pos) Z.haceRuido(AJ, e, pos.x, pos.z, AJ.huecos[h.tipo].ruidoRotura, 'zombi');
  };
  // ¿qué hace un fan que choca al ir a por su objetivo? busca el hueco más cercano de esa pared y va a por él
  Z.buscaHueco = function (AJ, e, zb, mundo) {
    const h = mundo.huecoCerca(zb.x, zb.z, AJ.huecos.busca);
    if (!h) return false;
    zb.meta = zb.obj ? { x: zb.obj.x, z: zb.obj.z } : null;   // a donde iba de verdad (para seguir después de cruzar)
    zb.hueco = h.id; zb.obj = { x: h.x, z: h.z };
    return true;
  };
  // ya en el hueco abierto: un punto al otro lado de la pared, para cruzarlo del todo (pos.eje = 'x' si la pared va a lo largo de x)
  function cruza(zb, pos) {
    const nx = pos.eje === 'x' ? 0 : 1, nz = pos.eje === 'x' ? 1 : 0, lado = nx ? Math.sign(zb.x - pos.x) || 1 : Math.sign(zb.z - pos.z) || 1;
    zb.hueco = null; zb.cruza = { x: pos.x - nx * lado * 1.6, z: pos.z - nz * lado * 1.6 }; zb.tCruza = 2.5; zb.obj = zb.cruza;
  }
  // después de cruzar sigue hacia donde iba
  Z.pasoCruce = function (zb, dt) {
    if (!zb.cruza) return;
    if (Z.dist(zb.x, zb.z, zb.cruza.x, zb.cruza.z) < 0.4 || (zb.tCruza -= dt) <= 0) { zb.cruza = null; if (zb.meta) zb.obj = zb.meta; zb.meta = null; return; }
    zb.obj = zb.cruza;
  };
  // el fan que va a por un hueco: si ya se puede pasar, llega hasta él y sigue; si no, lo golpea
  Z.pasoHuecoZombi = function (AJ, e, zb, dt, mundo) {
    const h = e.huecos[zb.hueco], pos = mundo.posHueco(zb.hueco);
    if (!h || !pos) { zb.hueco = null; return false; }
    const d = Z.dist(zb.x, zb.z, pos.x, pos.z);
    if (Z.pasable(h)) { if (d < 0.6) cruza(zb, pos); return false; }   // abierto: llega hasta él y lo cruza
    if (d > AJ.huecos.alcance) return false;
    zb.a = Math.atan2(pos.x - zb.x, pos.z - zb.z);
    if ((zb.tGolpeHueco = (zb.tGolpeHueco || 0) - dt) > 0) return true;
    zb.tGolpeHueco = AJ.huecos.cadencia;
    Z.golpeaHueco(AJ, e, zb.hueco, zb.T.dano * (zb.T.rompe || 1), pos);
    e.eventos.push({ tipo: 'golpeHueco', id: zb.hueco });
    return true;
  };
})(ZOM);
