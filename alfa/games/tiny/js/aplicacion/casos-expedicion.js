// Tiny Fans · aplicación · CASOS DE USO DE LA EXPEDICIÓN: salir, dar un paso, elegir mejora, gastar una pila y terminar (volver: el botín
// pasa al almacén del nido; caer: la mochila se queda en el suelo). No tienen reglas: piden al dominio, anuncian los eventos y guardan.
// Puertos: { reglas, sesion, reloj, eventos }.
'use strict';
TN.creaCasosExpedicion = ({ reglas, sesion, reloj, eventos }) => {
  let exp = null, cerrada = true;
  const HORA = 3600000;
  const nido = () => { const r = TN.Nido.desdeJson(reglas, sesion.partida.nido); return r.ok ? r.valor : TN.Nido.nuevo(reglas); };
  // al volver, el botín entra en el almacén; si traía la mochila caída, deja de estar en el suelo
  function vuelve(fin, rescato) {
    const p = sesion.partida, n = nido();
    if (fin.unidades) { n.guarda(fin.botin); p.ponNido(n.aJson()); }
    if (rescato) p.recogeMochila();
    p.anotaVuelta(fin.unidades > 0, reglas.asalto.abreTrasVueltasConBotin || 1);
  }
  // al caer, lo que llevaba (y lo rescatado) se queda donde cayó; con las manos vacías, la mochila de antes sigue donde estaba
  function cae(fin, rescato) {
    const p = sesion.partida;
    if (fin.unidades || rescato) p.anotaCaida({ x: fin.x, z: fin.z, huecos: fin.huecos }, reloj.ahora());
    else { p.cuenta('caidas'); p.cuenta('caidasSeguidas'); }
  }
  function termina(foto) {
    if (cerrada) return;
    cerrada = true;
    (foto.fin.tipo === 'vuelve' ? vuelve : cae)(foto.fin, foto.rescatada > 0);
    sesion.guarda();
  }
  const anuncia = lista => { eventos.emite(lista); return lista; };
  return {
    get enCurso() { return !!exp && !cerrada; },
    // empieza una salida (escenario y semilla: solo en pruebas). Resultado: ok(foto) o el error del dominio
    sale(datos = {}) {
      const p = sesion.partida, n = nido(), pilas = n.almacen.pilas > 0 ? 1 : 0;
      const r = TN.Expedicion.nueva(reglas, { semilla: datos.semilla === undefined ? reloj.semilla() : datos.semilla, escenario: datos.escenario,
        mochilaCaida: p.mochilaCaida(reloj.ahora(), reglas.mochila.caidaHoras * HORA), pilas, caidasSeguidas: p.contadores.caidasSeguidas });
      if (!r.ok) return r;
      if (pilas) { n.saca({ pilas }); p.ponNido(n.aJson()); }
      exp = r.valor; cerrada = false;
      p.anotaSalida(); sesion.guarda();
      return TN.ok(exp.foto());
    },
    // un paso de simulación; anuncia y devuelve sus eventos
    paso(entrada) {
      if (!exp || cerrada) return [];
      const lista = exp.paso(entrada), foto = exp.foto();
      if (foto.fin) termina(foto);
      return anuncia(lista);
    },
    foto: () => (exp ? exp.foto() : null),
    eligeMejora(id) { if (!exp) return TN.error('sin-expedicion'); const r = exp.eligeMejora(id); if (r.ok) anuncia(r.valor); return r; },
    usaPila() { if (!exp) return TN.error('sin-expedicion'); const r = exp.usaPila(); if (r.ok) anuncia(r.valor); return r; },
  };
};
