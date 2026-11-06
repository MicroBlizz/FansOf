// Fans of Zombies · REGISTRAR Y COGER (dominio): registrar un sitio tarda un poco y hace algo de ruido; la primera vez se sortea lo que
// hay dentro (e.contenidos[sitio], una lista sin rejilla) y se abre (e.abierto) para que elijas qué coges. Coger mete la cosa en la
// mochila Tetris si cabe; dejar la saca al sitio abierto o, si no hay ninguno, a un montón en el suelo que también se puede registrar.
'use strict';
var ZOM = globalThis.ZOM || (globalThis.ZOM = {});
(function (Z) {
  Z.empiezaRegistro = function (AJ, e, sitio) {
    const J = e.jugador;
    if (!sitio) return Z.error('nadaCerca');
    if (e.contenidos[sitio]) { e.abierto = sitio; e.eventos.push({ tipo: 'abre', sitio }); return Z.ok(sitio); }   // ya mirado: se abre al momento
    J.registra = { sitio, t: AJ.botin.tiempo * (J.A.registra || 1) };
    Z.haceRuido(AJ, e, J.x, J.z, AJ.ruido.registrar * (J.A.ruido || 1), 'jugador');
    return Z.ok(sitio);
  };
  Z.pasoRegistro = function (AJ, e, dt, azar) {
    const J = e.jugador, R = J.registra;
    if (!R) return;
    R.t -= dt;
    if (R.t > 0) return;
    J.registra = null; e.registrados[R.sitio] = true; e.stats.registros++;
    const extra = (J.A.botinExtra || 0) + (R.sitio.startsWith('cuerpo-') ? 2 : 0);
    e.contenidos[R.sitio] = Z.botinDe(AJ, AJ.botin.maximo + extra, azar);
    e.abierto = R.sitio;
    e.eventos.push({ tipo: 'abre', sitio: R.sitio, nuevo: true, cosas: e.contenidos[R.sitio].map((c) => c.id) });
  };
  Z.botinDe = function (AJ, n, azar) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const c = Z.sortea(AJ.botin.cosas, azar);
      if (c === 'nada') continue;
      const ya = out.find((o) => o.id === c && (AJ.objetos[c].max || 1) > 1);
      const k = c === 'cartuchos' ? AJ.botin.cartuchos : c === 'clavos' ? AJ.botin.clavos : 1;
      if (ya) ya.n += k; else out.push({ id: c, n: k });
    }
    return out;
  };
  Z.cierraSitio = (e) => { e.abierto = null; };
  const abierto = (e) => (e.abierto && e.contenidos[e.abierto]) || null;

  // coger la cosa i del sitio abierto: colocada sola, o en (gx, gy, gr) si la arrastras a un hueco
  Z.coger = function (AJ, e, i, donde) {
    const lista = abierto(e), c = lista && lista[i];
    if (!c) return Z.error('noEsta');
    const m = e.jugador.mochila;
    if (donde) { const r = Z.ponerEn(AJ, m, c, donde.gx, donde.gy, donde.gr); if (!r.ok) return r; lista.splice(i, 1); return Z.ok(0); }
    const queda = Z.meter(AJ, m, c.id, c.n);
    if (queda === c.n) return Z.error('noCabe', { id: c.id });
    if (queda) c.n = queda; else lista.splice(i, 1);
    return Z.ok(queda);
  };
  Z.cogerTodo = function (AJ, e) {
    const lista = abierto(e);
    if (!lista) return Z.error('noEsta');
    for (let i = lista.length - 1; i >= 0; i--) Z.coger(AJ, e, i);
    return lista.length ? Z.error('noCabe') : Z.ok(true);
  };
  // dejar una pieza de la mochila: en el sitio abierto o en un montón nuevo a tus pies
  Z.dejar = function (AJ, e, uid) {
    const r = Z.sacar(e.jugador.mochila, uid);
    if (!r.ok) return r;
    if (!abierto(e)) {
      const id = 'monton-' + (++e.ultimoId), J = e.jugador;
      e.cuerpos.push({ id, x: J.x, z: J.z, monton: true }); e.contenidos[id] = []; e.registrados[id] = true; e.abierto = id;
    }
    abierto(e).push(r.valor);
    return Z.ok(e.abierto);
  };
})(ZOM);
