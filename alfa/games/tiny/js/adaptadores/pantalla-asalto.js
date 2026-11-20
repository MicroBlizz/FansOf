// Tiny Fans · adaptador · PANTALLA «asalto»: el asalto al nido abandonado. Dos minutos para romper paredes, esquivar trampas, llegar al
// almacén, coger lo que quepa y salir por donde se entró. Si el nido abandonado aún está vacío, lo dice y vuelve al nido.
'use strict';
(() => {
  let escena = null, becario = null, piezas = null, oyentes = [], t = 0, salir = null;
  const casos = () => TN.casosAsalto;
  const FALLA = { tiempo: 'Se acabó el tiempo', bateria: 'Te has quedado sin batería', abandona: 'Te has ido con las manos vacías' };
  function monta(f) {
    const k = f.casilla, suelo = TN.modelos.sueloNido(f.columnas, f.filas);
    suelo.scale.setScalar(k); suelo.position.set(-f.columnas * k / 2, 0, -f.filas * k / 2); escena.add(suelo);
    for (const p of f.piezas) {
      if (p.pieza === 'entrada') { TN.piezas3d.disco(escena, 0xff8a1f, k * .45, p.x, p.z, .7); continue; }
      const m = TN.modelos.pieza(p.pieza === 'puerta-plastico' ? 'puerta' : p.pieza); m.scale.set(k, p.clase === 'pared' ? k * .5 : k, k); m.position.set(p.x, 0, p.z); escena.add(m);   // paredes bajas: que no tapen el pasillo piezas.set(p.col + ',' + p.fila, m);
    }
    const e = f.piezas.find(p => p.pieza === 'entrada'), a = f.piezas.find(p => p.pieza === 'almacen');
    if (a) TN.piezas3d.aro(escena, 0xffd23f, k * .55, a.x, a.z);
    if (!e) TN.piezas3d.disco(escena, 0xff8a1f, k * .45, f.becario.x, f.becario.z, .7);
    becario = TN.modelos.becario(); becario.scale.setScalar(1.05); becario.position.set(f.becario.x, 0, f.becario.z); escena.add(becario);
  }
  const sobre = () => TN.vista.aPantalla(becario.position.x, 2, becario.position.z);
  const AL = {
    rompe(e) { const m = piezas.get(e.col + ',' + e.fila); if (m) { escena.remove(m); piezas.delete(e.col + ',' + e.fila); } },
    'golpe-pieza'(e) { const m = piezas.get(e.col + ',' + e.fila); if (m) m.userData.golpe = t + .1; },
    trampa: e => TN.bocadillos.dice(e.dano ? '-' + Math.round(e.dano) : tr('¡Trampa!'), sobre(), .9, 'malo'),
    'asalto-coge': e => { TN.bocadillos.dice(tr('¡Botín!') + ' +' + e.unidades, sobre(), 1.6, 'bueno'); TN.guia.dice('asalto-sal', '¡Lo tienes! Sal por donde entraste', 5, true); },
    'asalto-sale': () => resumen(), 'asalto-falla': () => resumen(),
  };
  function resumen() {
    const fin = casos().foto().fin;
    TN.hudResumen.abre({ motivo: fin.tipo === 'sale' ? 'asalto-sale' : 'asalto-falla', botin: fin.botin, unidades: fin.unidades, segundos: fin.segundos, aviso: tr(FALLA[fin.motivo] || '') },
      { otra: () => TN.pantallas.ve('expedicion'), nido: () => TN.pantallas.ve('nido') });
  }
  TN.pantallas.registra({
    id: 'asalto', joystick: true, enPartida: true,
    entra(datos) {
      t = 0; piezas = new Map(); escena = null;
      const r = casos().entra(datos || {});
      if (!r.ok) {
        const n = r.datos && r.datos.faltan;
        return TN.ventanas.abre({ clase: 'nota', titulo: tr('Nido vacío'), cuerpo: tr(n === 1 ? 'Ya te lo llevaste todo. Vuelve de 1 expedición con botín y se habrá llenado otra vez.' : 'Ya te lo llevaste todo. Vuelve de {n} expediciones con botín y se habrá llenado otra vez.', { n }),
          alCerrar: () => TN.pantallas.ve('nido') });
      }
      escena = TN.vista.escena();
      if (escena) { monta(r.valor); TN.efectos.monta(escena); }
      TN.hud.monta(TN.capa(), { usaPila() {} });
      salir = TN.crea('button', { type: 'button', className: 'tn-boton tn-salir', textContent: tr('Irme'), onclick: () => casos().abandona() }); TN.capa().append(salir);
      oyentes = [TN.eventos.oye(Object.keys(AL), e => AL[e.tipo](e))];
      TN.guia.dice('asalto', 'Rompe paredes, coge el botín del almacén y sal', 5);
      TN.vista.encuadre('asalto', 0, true); TN.vista.sigue(r.valor.becario.x, r.valor.becario.z, true);
    },
    sale() {
      for (const f of oyentes) f(); oyentes = [];
      TN.hud.desmonta(); TN.hudResumen.cierra(); TN.bocadillos.limpia(); TN.efectos.desmonta(); if (salir) salir.remove();
      escena = becario = piezas = salir = null;
    },
    paso(entrada) { if (escena !== null && !TN.hudResumen.abierto && !TN.ventanas.abierta) casos().paso(entrada); },
    pinta(alfa, dt) {
      const f = casos().foto(); if (!f || !escena) return;
      t += dt;
      const b = f.becario, dx = b.x - becario.position.x, dz = b.z - becario.position.z;
      becario.rotation.y = Math.atan2(b.mira.x, b.mira.z);
      becario.position.x += dx * .5; becario.position.z += dz * .5; becario.userData.anima(t, { andando: Math.hypot(dx, dz) > .004 });
      for (const m of piezas.values()) { if (m.userData.anima) m.userData.anima(t); m.rotation.z = m.userData.golpe > t ? .08 : 0; }
      TN.efectos.pinta(dt); TN.vista.sigue(becario.position.x, becario.position.z); TN.vista.pinta(escena, dt);
      TN.hud.pinta({ bateria: b.bateria, bateriaMax: b.max, baja: b.bateria < AJUSTES.becario.bateriaBaja, unidades: f.mochila.unidades, tope: f.mochila.tope * AJUSTES.mochila.porHueco,
        voltios: f.cogiendo, meta: 1, pilas: 0, cuenta: f.quedan, nido: null, caida: null }, TN.vista);
    },
    estado: () => { const f = casos().foto(); return f ? { fase: f.fase, fin: f.fin, quedan: f.quedan, becario: f.becario, cogido: f.cogido, piezas: f.piezas.length } : {}; },
  });
})();
