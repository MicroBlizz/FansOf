// Fans of Pinball · adaptador · PANTALLA DE PARTIDA: la mesa. Crea la partida con el caso de uso «empezar», le da los pasos de física con
// los pulgares, pinta con la cámara y el pintor, y pasa los eventos a los efectos (jugo) y al marcador. La bola espera al primer toque
// (y Lola habla antes, si toca); al subir al ascensor, cartel de planta y la ventana de mejoras; al meter la bola en la tienda de Lola,
// la ventana de la tienda; al acabar, el caso «terminar» y la
// ventana de resultado. Pausa arriba (y sola al salir de la app): el botón «!» de reportes de core se para en partida y vuelve en la pausa.
// Lo que necesita lo encuentra en PB.app (lo compone principal.js).
'use strict';
(() => {
  const K = () => AJUSTES.arte.pxPorUnidad;
  let p = null, foto = null, primeraSala = true, cam = { x: 0, y: 0 }, piezas = null, espera = false, modo = 'historia', cuenta = null, fin = false, enPausa = false, cerrojo = null;
  const app = () => PB.app;
  const reporte = activo => { if (typeof REPORTE === 'undefined') return; if (activo) REPORTE.activar({ captura: () => app().lienzo.captura(), datos: () => ({ planta: foto && foto.planta, modo }) }); else REPORTE.parar(); };
  const medidor = activo => { if (typeof RENDIMIENTO === 'undefined') return; if (activo) RENDIMIENTO.activar(); else RENDIMIENTO.parar(); };
  function pideLuz() { try { if (navigator.wakeLock) navigator.wakeLock.request('screen').then(l => { cerrojo = l; }).catch(() => null); } catch (e) { cerrojo = null; } }
  function sueltaLuz() { if (cerrojo) cerrojo.release().catch(() => null); cerrojo = null; }
  const posCss = (x, y) => app().lienzo.aCss(app().fondo.lx(x) - cam.x, app().fondo.ly(y) - cam.y);
  function monta() {
    const a = app(), capa = PB.capa();
    const hud = PB.creaHud(capa, { pausa: () => pausa() });
    const cifras = PB.creaCifras(capa, AJUSTES.jugo), guia = PB.creaGuia(capa);
    const camara = PB.creaCamara(AJUSTES.jugo, AJUSTES.arte, AJUSTES.mesa);
    const efectos = PB.creaEfectos({ jugo: AJUSTES.jugo, bucle: a.bucle, camara, pintor: a.pintor, particulas: a.particulas, cifras, sonido: a.sonido, sp: a.sprites, hud, posCss,
      posturas: a.posturas, golpeFuerte: AJUSTES.fisica.golpeFuerte });
    return { hud, cifras, guia, camara, efectos };
  }
  function desmonta() {
    if (!piezas) return;
    piezas.hud.quita(); piezas.cifras.quita(); piezas.guia.quita();
    piezas = null;
  }
  // la bola espera al primer toque; Lola habla si tiene algo que decir en esta planta
  function aguarda(planta) {
    espera = true;
    piezas.guia.muestra(app().casos.frase(modo, planta));
  }
  function suelta() {
    if (!espera) return;
    espera = false;
    piezas.guia.oculta();
    app().sonido.despierta();
  }
  // lo que la pantalla hace con algunos eventos (además del jugo); el resto, nada
  const CUENTA = { rompe: e => e.clase, cofre: () => null, enemigo_vencido: () => 'enemigo', caos_empieza: () => 'caos', escalera_entra: () => 'escalera' };
  const PANTALLA = {
    sala_empieza(e) {
      piezas.camara.pega();
      if (e.clase === 'jefe') piezas.cifras.letrero(tr('¡SURVIVALBOT!'), 'pb-rojo', 1.6);
      else piezas.cifras.letrero(tr('PLANTA {n}').replace('{n}', e.planta), e.clase === 'tesoro' ? 'pb-amarillo' : 'pb-azul', 1);
      if (primeraSala) { primeraSala = false; return; }   // la primera sala ya esperó (y Lola habló) al entrar
      if (app().casos.frase(modo, e.planta)) aguarda(e.planta);
    },
    escalera_entra(e) { piezas.cifras.letrero(tr('PLANTA {n}').replace('{n}', e.planta), 'pb-azul', 1.2); },
    fin(e) { termina(e); },
  };
  function apunta(eventos) {
    for (const e of eventos) {
      const c = CUENTA[e.tipo] && CUENTA[e.tipo](e);
      if (c && c in cuenta) cuenta[c] += 1;
      if (PANTALLA[e.tipo]) PANTALLA[e.tipo](e);
    }
  }
  function abreMejoras() {
    piezas.cifras.limpia();
    PB.ventanaMejoras.abre(p.foto(), {
      elige: i => { const r = p.eligeMejora(i); if (!r.ok) console.warn('Fans of Pinball: mejora', r.error); },
      baraja: () => { const r = p.baraja(); return r.ok ? p.foto() : null; },
    });
  }
  function abreTienda() {
    piezas.cifras.limpia();
    const avisa = r => { if (!r.ok) console.warn('Fans of Pinball: tienda', r.error); };
    PB.ventanaTienda.abre(p.foto(), { compra: i => avisa(p.compra(i)), sale: () => avisa(p.salTienda()) });
  }
  function termina(e) {
    fin = true;
    app().entrada.activa(false); medidor(false); reporte(true); sueltaLuz();
    const r = app().casos.termina({ modo, resultado: e.resultado, planta: e.planta, puntos: e.puntos, fichas: e.fichas, cuenta });
    app().sonido.toca('fin');
    setTimeout(() => PB.ventanaResultado.abre(r.valor, { otra: () => PB.pantallas.ve('partida', { modo }), menu: () => PB.pantallas.ve('menu') }), 700);
  }
  function seguir() {
    const c = piezas.cifras;
    [3, 2, 1].forEach((n, i) => setTimeout(() => c.letrero(String(n), 'pb-azul', 0.35), i * 400));
    setTimeout(() => { if (!piezas) return; enPausa = false; app().bucle.reanuda(); app().entrada.activa(true); reporte(false); pideLuz(); }, 1200);
  }
  function salir() {
    const f = p.foto();
    app().casos.termina({ modo, resultado: 'abandono', planta: f.planta, puntos: f.puntos, fichas: f.fichas, cuenta });
    PB.pantallas.ve('menu');
  }
  function pausa() {
    if (!p || fin || enPausa) return;
    if (PB.ventanas.abierta) { app().bucle.reanuda(); return; }   // con una ventana abierta la mesa ya está quieta: el bucle no se queda parado
    enPausa = true;
    app().bucle.pausa(); app().entrada.activa(false); reporte(true); sueltaLuz();
    PB.ventanaPausa.abre({ seguir, salir });
  }
  PB.pantallas.registra({
    id: 'partida',
    enPartida: () => Boolean(p) && !fin && !enPausa,
    entra({ modo: m = 'historia', planta }) {
      const a = app(), r = a.casos.empieza(m, planta ? { planta } : {});
      if (!r.ok) return PB.pantallas.ve('menu');
      const nueva = PB.Partida.nueva(AJUSTES, r.valor);
      p = nueva.valor; modo = m; fin = false; primeraSala = true; enPausa = false; foto = p.foto();
      cuenta = { vasija: 0, cofre: 0, enemigo: 0, caos: 0, escalera: 0 };
      PB.dev.usa(p);
      document.body.classList.add('pb-jugando');
      piezas = monta(); piezas.camara.pega(); a.particulas.vacia(); piezas.efectos.reinicia();
      aguarda(foto.planta);
      a.entrada.activa(true); a.bucle.reanuda(); reporte(false); medidor(true); pideLuz();
    },
    sale() {
      desmonta(); p = null; foto = null;
      document.body.classList.remove('pb-jugando');
      app().entrada.activa(false); medidor(false); sueltaLuz();
    },
    paso(dt, entrada) {
      if (!p || espera || fin || PB.ventanas.abierta) return;
      const fase = p.fase;
      if (fase === 'eligiendo') return abreMejoras();
      if (fase === 'comprando') return abreTienda();
      const eventos = p.paso(dt, entrada);
      if (!eventos.length) return;
      foto = p.foto();
      piezas.efectos.procesa(eventos, foto);
      apunta(eventos);
    },
    pinta(alfa, dt) {
      if (!p) return;
      const a = app(), f = p.foto();
      a.particulas.paso(dt); a.posturas.paso(f, dt);
      const techo = a.lienzo.deCss(0, piezas.hud.franja()).y / K();
      cam = piezas.camara.sigue(f, dt, a.lienzo, techo);
      a.pintor.pinta(f, cam, dt);
      a.lienzo.presenta();
      piezas.hud.pinta(f, cam.y / K() + techo);
      if (typeof RENDIMIENTO !== 'undefined' && RENDIMIENTO.dato) { RENDIMIENTO.dato('bolas', f.bolas.length); RENDIMIENTO.dato('particulas', a.particulas.vivas); }
    },
    estado: () => ({ fase: p ? p.fase : '', planta: foto ? foto.planta : 0, espera, enPausa, fin }),
  });
  // lo que otros piden a la partida: el primer toque, la franja del marcador y la pausa (botón, salir de la app o un salto largo)
  PB.partidaEnMesa = {
    alTocar: () => suelta(),
    franja: () => (piezas ? piezas.hud.franja() : 0),
    pausa: () => pausa(),
  };
})();
