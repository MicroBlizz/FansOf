// Tiny Fans · adaptador · PANTALLA «expedicion»: la salida. Une las reglas (por sus casos de uso) con los modelos, los marcadores, los
// efectos y las ventanas de mejora y de resultado. Cada pintado lee la foto de la expedición y coloca un muñeco por cada cosa viva.
'use strict';
(() => {
  let escena = null, parada = null, becario = null, grupos = null, mira = 0, andando = false, dispara = 0, oyentes = [], t = 0;
  const casos = () => TN.casosExpedicion;
  // tipos de cosas vivas: cómo se hace el muñeco de cada una
  const FABRICA = {
    bichos: b => TN.modelos.bicho(b.clase), botin: m => TN.modelos.material(m.material), bolitas: () => TN.modelos.voltio(),
    gigante: g => TN.modelos.sombraGigante(g.radio), caida: () => TN.modelos.mochilaCaida(),
  };
  // deja en la escena un muñeco por cada elemento de la lista (por su id) y quita los que ya no están
  function sincroniza(tipo, lista, coloca) {
    const mapa = grupos[tipo], vistos = new Set();
    for (const e of lista) {
      let m = mapa.get(e.id);
      if (!m) { m = FABRICA[tipo](e); m.position.set(e.x, 0, e.z); escena.add(m); mapa.set(e.id, m); }
      vistos.add(e.id); coloca(m, e);
    }
    for (const [id, m] of mapa) if (!vistos.has(id)) { escena.remove(m); mapa.delete(id); }
  }
  const suave = (m, e, k) => { m.position.x += (e.x - m.position.x) * k; m.position.z += (e.z - m.position.z) * k; };
  function colocaBicho(m, e, f) {
    const dx = f.becario.x - e.x, dz = f.becario.z - e.z;
    if (e.caza) m.rotation.y = Math.atan2(dx, dz);
    suave(m, e, .45); m.userData.anima(t + e.id, { golpe: m.userData.golpe > t });
  }
  function pintaMundo(f, dt) {
    const b = f.becario, dx = b.x - becario.position.x, dz = b.z - becario.position.z;
    andando = Math.hypot(dx, dz) > .004;
    if (dispara > t) { /* mira al bicho al que acaba de disparar */ } else if (andando) mira = Math.atan2(dx, dz);
    let giro = mira - becario.rotation.y; giro = Math.atan2(Math.sin(giro), Math.cos(giro)); becario.rotation.y += giro * Math.min(1, dt * 14);
    suave(becario, b, .5); becario.userData.anima(t, { andando, dispara: dispara > t });
    sincroniza('bichos', f.bichos, (m, e) => colocaBicho(m, e, f));
    sincroniza('botin', f.botin, (m, e) => { m.userData.anima(t); m.scale.setScalar(1 - e.progreso * .35); });
    sincroniza('bolitas', f.bolitas, (m, e) => { suave(m, e, .6); m.userData.anima(t); });
    sincroniza('gigante', f.gigante, (m, e) => { m.userData.disco.material.opacity = .25 + .4 * (1 - Math.min(1, e.falta / AJUSTES.gigante.aviso)); });
    sincroniza('caida', f.mochilaCaida ? [{ id: 1, ...f.mochilaCaida }] : [], m => m.userData.anima(t));
    parada.userData.anima(t, dt); agacha(b);
  }
  // un mueble alto que taparía al becario (queda entre él y la cámara) se encoge mientras esté detrás, para no perderlo de vista
  function agacha(b) {
    const lejos = TN.vista.aSuelo(0, 1), lado = TN.vista.aSuelo(1, 0);
    for (const { grupo, m } of parada.userData.muebles) {
      const alto = Math.min(m.alto || 4, 60); if (alto < 2.5) continue;
      const ext = m.radio || Math.max(m.ancho, m.fondo) / 2, dx = b.x - m.x, dz = b.z - m.z, fondo = dx * lejos.x + dz * lejos.z, ancho = Math.abs(dx * lado.x + dz * lado.z);
      const tapa = fondo > -ext && fondo < ext + alto * 1.3 && ancho < ext + 1.5;
      grupo.scale.y += ((tapa ? Math.max(.06, 1.2 / alto) : 1) - grupo.scale.y) * .2;
    }
  }
  const datosHud = f => ({ bateria: f.becario.bateria, bateriaMax: f.becario.max, baja: f.becario.baja, unidades: f.mochila.unidades, tope: f.mochila.tope * f.mochila.porHueco,
    voltios: f.voltios.tiene, meta: f.voltios.meta, pilas: f.mochila.pilas, nido: f.becario.enNido ? null : f.mapa.nido, caida: f.mochilaCaida });
  const sobre = (x, z, alto = 2.2) => TN.vista.aPantalla(x, alto, z);
  // lo que hace la pantalla cuando pasa cada cosa
  const AL = {
    dispara(e) { mira = Math.atan2(e.ax - e.x, e.az - e.z); dispara = t + .18; },
    'golpe-bicho'(e) { const m = grupos.bichos.get(e.bicho); if (m) m.userData.golpe = t + .1; },
    mordisco: e => (TN.hud.golpe(), TN.bocadillos.dice('-' + Math.round(e.dano), sobre(becario.position.x, becario.position.z), .8, 'malo')),
    pisoton: e => (TN.hud.golpe(), TN.bocadillos.dice('-' + Math.round(e.dano), sobre(becario.position.x, becario.position.z), 1, 'malo')),
    recoge: e => TN.bocadillos.dice('+' + e.cantidad + ' ' + tr(TN.textos.materiales[e.material]), sobre(e.x, e.z), 1.2, 'bueno'),
    'mochila-llena': e => TN.bocadillos.dice(tr('¡Mochila llena!'), sobre(e.x, e.z), 1.4, 'malo'),
    'mochila-recuperada': e => TN.bocadillos.dice(tr('¡Mochila recuperada!') + ' +' + e.unidades, sobre(e.x, e.z), 1.6, 'bueno'),
    'pila-usada': e => TN.bocadillos.dice('+' + tr('Pila'), sobre(becario.position.x, becario.position.z), 1, 'bueno'),
    'gigante-aviso': e => TN.vista.encuadre('ras', e.segundos + 1),
    'mejora-lista': e => TN.hudMejoras.abre(e.oferta, casos().foto().mejoras, id => { if (casos().eligeMejora(id).ok) TN.hudMejoras.cierra(); }),
    vuelve: () => resumen(), cae: () => resumen(),
  };
  function resumen() {
    const fin = casos().foto().fin, meta = TN.metas && TN.metas.actual();
    // si con lo que hay en el almacén ya se puede poner la pieza de la meta, el botón grande manda a construir
    const dato = meta && AJUSTES.metas.lista.find(m => m.id === meta.id), pieza = dato && dato.cuenta.pieza;
    const construir = fin.tipo === 'vuelve' && !!pieza && !Object.keys(TN.recetas.falta(AJUSTES, pieza, TN.casosNido.nido.almacen)).length;
    TN.hudMejoras.cierra();
    TN.hudResumen.abre({ motivo: fin.tipo, botin: fin.tipo === 'vuelve' ? fin.botin : {}, unidades: fin.unidades, segundos: fin.segundos, meta: meta && meta.texto ? meta : null, construir }, {
      otra: () => TN.pantallas.ve('expedicion'), nido: () => TN.pantallas.ve('nido') });
  }
  TN.pantallas.registra({
    id: 'expedicion', joystick: true, enPartida: true,
    entra(datos) {
      const R = AJUSTES.mapa;
      escena = TN.vista.escena(); t = 0; mira = 0; dispara = 0;
      grupos = { bichos: new Map(), botin: new Map(), bolitas: new Map(), gigante: new Map(), caida: new Map() };
      if (escena) {
        parada = TN.modelos.parada(R); escena.add(parada);
        const nido = TN.modelos.aspirador(); nido.scale.setScalar(.8); nido.position.set(R.nido.x - 5.5, 0, R.nido.z - 7.5); nido.rotation.y = .5; escena.add(nido);
        TN.piezas3d.disco(escena, 0xff8a1f, R.nido.radio, R.nido.x, R.nido.z, .55); TN.piezas3d.aro(escena, 0xff8a1f, R.nido.radio, R.nido.x, R.nido.z);
        becario = TN.modelos.becario(); becario.position.set(R.nido.x, 0, R.nido.z); escena.add(becario);
        TN.efectos.monta(escena);
      }
      TN.hud.monta(TN.capa(), { usaPila: () => casos().usaPila() });
      oyentes = [TN.eventos.oye(Object.keys(AL), e => AL[e.tipo](e))];
      casos().sale(datos || {});
      TN.vista.encuadre('juego', 0, true); TN.vista.sigue(R.nido.x, R.nido.z, true);
    },
    sale() {
      for (const f of oyentes) f(); oyentes = [];
      casos().abandona(true);   // irse a medias no borra el botín: la mochila se queda en el suelo
      TN.hud.desmonta(); TN.hudMejoras.cierra(); TN.hudResumen.cierra(); TN.bocadillos.limpia(); TN.efectos.desmonta();
      escena = parada = becario = grupos = null;
    },
    // mientras se elige mejora, o con el resultado delante, el mundo espera
    paso(entrada) { if (!TN.hudMejoras.abierta && !TN.hudResumen.abierto) casos().paso(entrada); },
    pinta(alfa, dt) {
      const f = casos().foto(); if (!f) return;
      t += dt;
      if (escena) { pintaMundo(f, dt); TN.efectos.pinta(dt); TN.vista.sigue(becario.position.x, becario.position.z); TN.vista.pinta(escena, dt); }
      TN.hud.pinta(datosHud(f), TN.vista);
    },
    estado: () => { const f = casos().foto(); return f ? { fase: f.fase, fin: f.fin, t: f.t, becario: f.becario, bichos: f.bichos.length, botin: f.botin.length, mochila: f.mochila, voltios: f.voltios, mejoras: f.mejoras, oferta: f.oferta, mejorasAbierta: TN.hudMejoras.abierta, resumen: TN.hudResumen.abierto } : {}; },
  });
})();
