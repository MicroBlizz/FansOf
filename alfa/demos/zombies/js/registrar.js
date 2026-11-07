// Fans of Zombies · REGISTRAR Y COGER (dominio): registrar un sitio tarda un poco y hace algo de ruido; la primera vez se sortea lo que
// hay dentro (e.contenidos[sitio], una lista sin rejilla) y se abre (e.abierto) para que elijas qué coges. Coger mete la cosa en la
// mochila Tetris (o en la riñonera o los bolsillos) si cabe; dejar la saca al sitio abierto o, si no hay ninguno, a un montón en el suelo que también se puede registrar.
'use strict';
var ZOM = globalThis.ZOM || (globalThis.ZOM = {});
(function (Z) {
  // tipo = la clase de sitio (nevera, armario, cocina, basura, fuego…), que decide lo que hay dentro
  Z.empiezaRegistro = function (AJ, e, sitio, tipo) {
    const J = e.jugador;
    if (!sitio) return Z.error('nadaCerca');
    if (!e.contenidos[sitio] && tipo === 'fuego') { e.contenidos[sitio] = []; e.registrados[sitio] = true; }   // en un fuego no hay nada: se abre para cocinar
    if (e.contenidos[sitio]) { e.abierto = sitio; e.tipoAbierto = tipo || null; e.eventos.push({ tipo: 'abre', sitio }); return Z.ok(sitio); }   // ya mirado: se abre al momento
    J.registra = { sitio, tipo: tipo || null, t: AJ.botin.tiempo * (J.A.registra || 1) };
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
    e.contenidos[R.sitio] = Z.botinDe(AJ, AJ.botin.maximo + extra, azar, Z.tipoBotin(AJ, e, R.tipo), Z.carnePodrida(AJ, e, azar));   // el huerto y la carne, según la estación
    e.abierto = R.sitio; e.tipoAbierto = R.tipo;
    e.eventos.push({ tipo: 'abre', sitio: R.sitio, nuevo: true, cosas: e.contenidos[R.sitio].map((c) => c.id) });
    if (Z.buscaLlave) Z.buscaLlave(AJ, e, R.sitio, R.tipo, azar);   // las llaves de los coches (js/coches.js)
  };
  Z.botinDe = function (AJ, n, azar, tipo, sinLuz) {
    const out = [], tabla = AJ.botin.porTipo[tipo] || AJ.botin.cosas;
    if (!Object.keys(tabla).length) return out;
    for (let i = 0; i < n; i++) {
      let c = Z.sortea(tabla, azar);
      if (c === 'nada') continue;
      if (c === 'carne' && sinLuz) c = 'podrida';                // sin luz, la nevera no enfría
      const ya = out.find((o) => o.id === c && (AJ.objetos[c].max || 1) > 1);
      const k = c === 'cartuchos' ? AJ.botin.cartuchos : c === 'clavos' ? AJ.botin.clavos : c === 'balas' ? AJ.botin.balas : 1;
      if (ya) ya.n += k; else out.push({ id: c, n: k });
    }
    return out;
  };
  Z.cierraSitio = (e) => { e.abierto = null; e.tipoAbierto = null; };
  const abierto = (e) => (e.abierto && e.contenidos[e.abierto]) || null;

  // coger la cosa i del sitio abierto: colocada sola donde quepa, o en (gx, gy, gr) de una bolsa si la arrastras a un hueco
  Z.coger = function (AJ, e, i, donde) {
    const lista = abierto(e), c = lista && lista[i], J = e.jugador;
    if (!c) return Z.error('noEsta');
    if (donde) { const m = J[donde.bolsa || 'mochila'], r = m ? Z.ponerEn(AJ, m, c, donde.gx, donde.gy, donde.gr) : Z.error('noEsta'); if (!r.ok) return r; if (r.valor) c.n = r.valor; else lista.splice(i, 1); return Z.ok(r.valor); }
    const queda = Z.meterLleva(AJ, J, c.id, c.n, c.dur);
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
  // dejar una pieza de una de tus bolsas (la mochila si no se dice): en el sitio abierto o en un montón nuevo a tus pies
  Z.dejar = function (AJ, e, uid, bolsa) {
    const m = e.jugador[bolsa || 'mochila'], p = m && Z.pieza(m, uid);
    if (!m) return Z.error('noEsta', { uid });
    if (p && Z.esMaletero(e.abierto) && !Z.cabeEnMaletero(AJ, abierto(e), p)) return Z.error('maleteroLleno');   // el maletero tiene sitio para AJ.coches.maletero casillas
    const r = Z.sacar(m, uid);
    if (!r.ok) return r;
    return Z.ok(Z.dejaEnSitio(e, r.valor));
  };
  // poner una cosa suelta en el sitio abierto o, si no hay ninguno, en un montón nuevo a tus pies (que se abre)
  Z.dejaEnSitio = function (e, cosa) {
    if (!abierto(e)) {
      const id = 'monton-' + (++e.ultimoId), J = e.jugador;
      e.cuerpos.push({ id, x: J.x, z: J.z, monton: true }); e.contenidos[id] = []; e.registrados[id] = true; e.abierto = id;
    }
    abierto(e).push(cosa);
    return e.abierto;
  };
})(ZOM);
