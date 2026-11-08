// Fans Of Pets · PRINCIPAL: la composición. Crea los adaptadores (almacén, reloj, sonido), les pasa las reglas y el catálogo a los casos de
// uso y arranca el lienzo, el bucle de cada fotograma (la escena de cada fase) y el reloj que simula cada pocos segundos.
// Es el único archivo que conoce todas las piezas. Pets es un prototipo: se juega solo desde la alfa o con ?dev=1 mientras el juego esté en «Próximamente» (core/js/proximamente.js).
'use strict';
PT.almacen = PT.creaAlmacenLocal(SAVE_KEY, localStorage);
PT.reloj = PT.creaReloj(PT.almacen);
PT.sonido = PT.creaSonido(PT.almacen);
PT.retos = PT.creaRetos(PT.almacen, PT.reloj, premio => PT.casos.ingresa(premio));   // paga por los casos de uso (que se crean justo después)
PT.casos = PT.creaCasos({ reglas: PETS, catalogo: PT.criaturas, almacen: PT.almacen, reloj: PT.reloj, retos: PT.retos });

PT.lienzo = (() => {
  const CV = document.getElementById('cv'), CTX = CV.getContext('2d'), UIC = document.getElementById('pt-ui');
  const V = { sc: 1, dpr: 1, W: 540, H: 960 };

  function ajusta() {
    const bw = document.body.clientWidth, bh = document.body.clientHeight, pad = bw < 600 ? 0 : 24;
    let w = bw - pad * 2, h = (w * V.H) / V.W;
    if (h > bh - pad * 2) { h = bh - pad * 2; w = (h * V.W) / V.H; }
    w = Math.max(200, Math.floor(w)); h = Math.floor((w * V.H) / V.W);
    const st = document.getElementById('stage'); st.style.width = w + 'px'; st.style.height = h + 'px';
    V.sc = w / V.W; V.dpr = Math.min(window.devicePixelRatio || 1, 3);
    CV.width = Math.round(w * V.dpr); CV.height = Math.round(h * V.dpr);
    UIC.style.transform = `scale(${V.sc})`;
  }

  // la escena de cada fase
  function escenaLola(ctx, t, grande) {
    if (grande) { if (!PT.arte.lola(ctx, 200, 420, 0.75, t)) PT.pintor.lola(ctx, 150, 420, 1, t); }
    else if (!PT.arte.lola(ctx, 100, 190, 0.55, t)) PT.pintor.lola(ctx, 90, 220, 0.6, t);
  }
  function escenaHuevos(ctx, p, t) {
    escenaLola(ctx, t, false);
    p.huevos.forEach((id, i) => {
      const c = PT.criaturas.busca(id), sel = PT.ui.elegido === i, x = PT.HUEVO_X[i], y = PT.HUEVO_Y;
      if (sel) { ctx.fillStyle = 'rgba(255,203,61,0.35)'; ctx.beginPath(); ctx.arc(x, y, 82, 0, 7); ctx.fill(); }
      PT.pintor.huevo(ctx, x, y + (sel ? -8 : 0), 58, PT.criaturas.color(c.fac), t, { wob: sel ? 0.3 : 0 });
    });
  }
  function escenaHuevo(ctx, p, t) {
    const c = p.criatura, falta = (p.eclosionaEn - PT.casos.ahora()) / (PETS.huevoHoras * 60 * PT_MINUTO);
    PT.pintor.huevo(ctx, 270, 430, 110, PT.criaturas.color(c.fac), t, { wob: PT.ui.wob + (falta < 0.1 ? 0.25 : 0), bufanda: PT.ui.bufanda, grieta: falta < 0.25 ? 1 - falta * 4 : 0 });
  }
  // el muñeco 3D (PT.muneco3d): de pie o dormida; el jefe es un adulto. false mientras carga o si la criatura no tiene muñeco. Con un minijuego de cuidado
  // en marcha (PT.cuidadoJuego) lo pinta él, con su pose y sus objetos; un segundo y medio después de acabar, la partida lo da por cerrado
  function muneco3d(ctx, c, etapa, r, t, e) {
    const lado = r * 3.1, y = 470 - lado * 0.44, edad = PT.muneco3d.edad(etapa), cj = PT.cuidadoJuego;
    if (cj.activo && cj.pinta(ctx, c.id, edad, 270, y, lado, t)) {
      if (cj.terminado >= 0 && t - cj.terminado > PETS.cuidado.cierraTras) PT.botones.acabaCuidado();
      return true;
    }
    return PT.muneco3d.pinta(ctx, c.id, 270, y, lado, t, e.dormida ? 'dormir' : 'quieto', edad);
  }
  // la mascota en su etapa; en el ascenso, su jefa; en el final, triste
  function escenaMascota(ctx, p, t) {
    const c = p.criatura, m = p.mascota, jefa = p.fase === 'ascenso', etapa = jefa ? 'jefe' : m.etapa;
    const r = PETS.tamano[etapa], ui = PT.ui;
    const e = { dormida: !jefa && m.dormida, triste: !jefa && (m.triste || p.fase === 'final'), anim: ui.anim, at: ui.at, rama: m.rama,
      sonolienta: !jefa && m.necesidades.de('sueno') < PETS.animacion.bostezaConSueno,
      pidiendo: !jefa && !m.dormida && ['hambre', 'diversion'].some(k => m.necesidades.de(k) < PETS.animacion.pideDesde) };
    if (muneco3d(ctx, c, etapa, r, t, e)) return;   // el muñeco 3D de la criatura, si lo tiene (f16, docs/pets/f16-muneco-completo.md); si no, su dibujo de siempre
    if (!PT.arte.tiene(c.id, etapa) || !PT.arte.criatura(ctx, c.id, etapa, 270, 440, r, t, e)) PT.pintor.bebe(ctx, 270, 440, r, PT.criaturas.color(c.fac), t, e);
  }
  function escena(ctx, p, t) {
    const ui = PT.ui;
    if (ui.escena) PT.dev.escena(ctx, t);   // la escena de animaciones del panel DEV
    else if (p.fase === 'entrevista' || p.fase === 'ritmo' || (ui.volverA === '' && p.fase === 'horario')) escenaLola(ctx, t, true);
    else if (p.fase === 'huevos') escenaHuevos(ctx, p, t);
    else if (p.fase === 'huevo' || ui.volverA === 'huevo') escenaHuevo(ctx, p, t);
    else if (p.mascota) escenaMascota(ctx, p, t);
  }
  function fotograma(ms) {
    const t = ms / 1000, ctx = CTX, k = V.sc * V.dpr, p = PT.casos.partida;
    ctx.setTransform(k, 0, 0, k, 0, 0);
    const conHorario = p.fase === 'mascota' || p.fase === 'huevo';
    PT.pintor.oficina(ctx, V.W, V.H, conHorario ? PT.casos.esDia(PT.casos.ahora()) : true);
    PT.ui.wob = Math.max(0, PT.ui.wob - 0.02);
    escena(ctx, p, t);
    requestAnimationFrame(fotograma);
  }
  return { ajusta, fotograma };
})();

// arranque
PT.arranca = () => {
  PT.lienzo.ajusta();
  window.addEventListener('resize', PT.lienzo.ajusta);
  const elige = PT.$('#pt-elige');
  elige.innerHTML = PT.HUEVO_X.map((x, i) => `<button type="button" style="left:${x - 70}px;top:${PT.HUEVO_Y - 80}px" aria-label="${tr('Huevo {n}', { n: i + 1 })}" aria-pressed="false"></button>`).join('');
  elige.querySelectorAll('button').forEach((b, i) => { b.onclick = () => PT.botones.eligeHuevo(i); });
  PT.pantallas.trasSimular(PT.casos.simula());
  PT.pantallas.pinta();
  const tic = () => {
    const fase = PT.casos.partida.fase, pasa = PT.casos.simula();
    PT.pantallas.trasSimular(pasa);
    if (fase !== PT.casos.partida.fase) PT.pantallas.pinta();
    else PT.pantallas.refresca();
  };
  setInterval(tic, PETS.tiempo.cadaSegundos * 1000);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') tic(); });
  const carga = document.getElementById('carga');
  if (carga) carga.remove();
  requestAnimationFrame(PT.lienzo.fotograma);
};
PT.arranca();
