// Fans of Pop · RAID, la pantalla (adaptador de pantalla, tarea 448, nodo n4, ADR 243): abre y cierra la raid, mueve la cámara con los dedos y
// pinta cada fotograma. Junta las piezas: la sincronía con el servidor (PP_RAID_SINCRONIA sobre PP_RAID_RED), la imagen de puntos de LEJOS y
// las burbujas de CERCA, los efectos, el CEO, los rótulos (PP_RAID_HUD) y lo que pasa con cada suceso (PP_RAID_SUCESOS).
// · abre(id): `null` = la raid de la semana; 'prueba' = la raid de prueba de la alfa. Solo desde la portada o el camino.
// · prueba(): rehace la raid de prueba en el servidor (rol alfa) y la abre. · cierra(): manda lo pendiente y vuelve a donde estaba.
// · pinta(c, t, dt): la llama el bucle de js/principal.js cuando la pantalla es 'raid'.
// Con `?raid=local` en la dirección no hay servidor: uno de mentira en este navegador, compartido entre pestañas (servidor-local-pestanas.js).
// Se entra por el botón del camino o el enlace ?raid=1 (flag 'raid', js/raid/adaptadores/camino.js) y desde el panel DEV. Lee de Pop: PP_CV, PP_V, PP_PANT, ppIrA,
// ppLogico, PP_IMG, PP_COLORES, PP_FILAS, ppTexto, PP_CHISPAS, CUENTA, tr.
'use strict';
const PP_RAID_PANTALLA = (() => {
  const Z_MAX = 60, Z_TOQUE = 50, ANIM_S = 0.35, HUD_CADA = 0.25;
  const CAM = PP_RAID_CAMARA;
  let R = null;          // la raid abierta: su estado de pantalla
  let piezas = null;     // lo que se monta una sola vez: la red, los rótulos y los gestos
  let abriendo = false;  // mientras el servidor rehace la raid de prueba (para que dos pulsaciones no la rehagan dos veces)
  const creaLienzo = (w, h) => Object.assign(document.createElement('canvas'), { width: w, height: h });
  // la ventana del tablero: entre la cabecera y el pie, con un margen para el marco de la bandeja (512 de ancho: de lejos, un píxel por burbuja)
  const vista = () => ({ x: 14, y: PP_RAID_HUD.ALTO.cabecera + 18, w: 512, h: PP_V.H - PP_RAID_HUD.ALTO.cabecera - PP_RAID_HUD.ALTO.pie - 36 });
  const imagen = k => PP_IMG[k] || null;   // un dibujo de Pop ya cargado
  const activa = () => !!R && PP_PANT.actual === 'raid';
  const texto = (c, s, x, y, tam, col, borde) => ppTexto(c, s, x, y, tam, col, 'center', borde);
  const modoLocal = () => new URLSearchParams(location.search).get('raid') === 'local';

  /* ---------- la red ---------- */
  // en local cada pestaña es un jugador distinto (su nombre se guarda mientras dure la pestaña)
  function usuarioLocal() {
    let u = sessionStorage.getItem('pp_raid_yo');
    if (!u) { u = 'local-' + Math.random().toString(36).slice(2, 8); sessionStorage.setItem('pp_raid_yo', u); }
    return u;
  }
  function creaRed() {
    if (!modoLocal()) return PP_RAID_RED.crea({ rpc: (n, a) => CUENTA.rpc(n, a), hay: () => typeof CUENTA !== 'undefined' && !!CUENTA.usuario });
    const srv = PP_RAID_SERVIDOR_LOCAL_PESTANAS.crea({ reloj: Date.now, cfg: PP_CFG.raid, semilla: 448, almacen: localStorage });
    const yo = usuarioLocal();
    return PP_RAID_RED.crea({ rpc: (n, a) => srv.rpc(n, a, yo), hay: () => true });
  }

  /* ---------- la cámara ---------- */
  const pon = cam => { R.cam = CAM.limita(cam, vista(), R.zona, Z_MAX); };
  function arrastra(dx, dy) { if (activa()) { R.anim = null; pon(CAM.mueve(R.cam, dx, dy)); } }
  // la cámara con el zoom `z` (ya dentro de sus topes: si no, el tablero se correría sin cambiar de tamaño) y el punto (px, py) quieto
  function conZoom(px, py, z) {
    const v = vista(), zBien = Math.min(Z_MAX, Math.max(CAM.zMin(v, R.zona), z));
    return CAM.limita(CAM.zoomEn(R.cam, v, px, py, zBien), v, R.zona, Z_MAX);
  }
  function pellizca(px, py, factor) { if (activa()) { R.anim = null; R.cam = conZoom(px, py, R.cam.z * factor); } }
  // va hasta el zoom `z` con el punto (px, py) quieto, en un momento
  function animaA(px, py, z) { R.anim = { de: R.cam, a: conZoom(px, py, z), t: 0 }; }
  // el mapa pequeño (solo de cerca): dónde está en la ventana
  const cajaMini = v => ({ x: v.x + 12, y: v.y + 12, w: 104, h: 104 });
  // un toque en el mapa pequeño lleva la cámara a ese sitio del tablero
  function saltaA(px, py) {
    const v = vista(), m = cajaMini(v), k = R.zona.lado / m.w;
    play('select');
    R.anim = { de: R.cam, a: CAM.limita({ x: R.zona.x + (px - m.x) * k, y: R.zona.y + (py - m.y) * k, z: R.cam.z }, v, R.zona, Z_MAX), t: 0 };
  }
  // los botones + y −: de la imagen de puntos a las burbujas y vuelta, por el centro de la ventana
  function botonZoom(dir) {
    if (!activa()) return;
    const v = vista(), lejos = R.cam.z < PP_RAID_CERCA.Z_BURBUJAS;
    play('select');
    animaA(v.x + v.w / 2, v.y + v.h / 2, dir > 0 ? (lejos ? Z_TOQUE : Z_MAX) : (R.cam.z > Z_TOQUE * 0.6 ? PP_RAID_CERCA.Z_BURBUJAS * 1.3 : 0));
  }
  function avanzaCamara(dt) {
    if (!R.anim) return;
    R.anim.t = Math.min(1, R.anim.t + dt / ANIM_S);
    const k = 1 - Math.pow(1 - R.anim.t, 3);
    R.cam = CAM.mezcla(R.anim.de, R.anim.a, k);
    if (R.anim.t >= 1) R.anim = null;
  }
  // dice a la sincronía qué trozos se ven: de lejos, todos los de la zona; de cerca, solo los de la ventana
  function mira() {
    const cerca = R.cam.z >= PP_RAID_CERCA.Z_BURBUJAS;
    const ids = cerca ? CAM.trozos(CAM.visibles(R.cam, vista(), R.zona)) : R.trozosZona;
    const clave = ids.join();
    if (clave === R.mirando) return;
    R.mirando = clave;
    R.sinc.mirar(ids);
  }

  // la bandeja: el trozo de la ventana que ocupa el tablero (de lejos, un cuadrado en medio; de cerca, la ventana entera)
  function bandeja(v) {
    const [x0, y0] = CAM.aPantalla(R.cam, v, R.zona.x, R.zona.y), [x1, y1] = CAM.aPantalla(R.cam, v, R.zona.x + R.zona.lado, R.zona.y + R.zona.lado);
    const x = Math.max(v.x, x0), y = Math.max(v.y, y0);
    return { x, y, w: Math.min(v.x + v.w, x1) - x, h: Math.min(v.y + v.h, y1) - y };
  }

  /* ---------- el CEO ---------- */
  // asomado en la esquina toda la semana; cuando baja a pelear (o ya ha perdido), grande y en medio
  function sitioCeo() {
    const v = vista(), grande = R.humor === 'pelea' || R.humor === 'vencido';
    return grande ? { x: 270, y: v.y + 190, tam: 230 } : { x: 446, y: Math.max(v.y + 62, bandeja(v).y - 34), tam: 132 };   // de chico, sentado en el borde de la bandeja
  }
  const dentro = (c, px, py) => px >= c.x && py >= c.y && px < c.x + c.w && py < c.y + c.h;

  /* ---------- los toques ---------- */
  function toca(px, py) {
    if (!activa() || !R.resumen) return;
    if (dentro(PP_RAID_CEO_PINTA.caja(sitioCeo()), px, py)) { PP_RAID_SUCESOS.tocaCeo(R, px, py); return; }
    if (R.cam.z >= PP_RAID_CERCA.Z_BURBUJAS && dentro(cajaMini(vista()), px, py)) { saltaA(px, py); return; }
    const celda = CAM.celdaEn(R.cam, vista(), R.zona, px, py);
    if (!celda) return;
    if (R.cam.z < PP_RAID_CERCA.Z_BURBUJAS) { play('select'); animaA(px, py, Z_TOQUE); return; }   // de lejos, tocar acerca a ese sitio
    PP_RAID_SUCESOS.toque(R, celda[0], celda[1], px, py);
  }
  const conDedo = f => e => { if (!activa() || !$pp('#pp-modal').hidden) return; const [x, y] = ppLogico(e); f(e, x, y); };
  function escucha(gestos) {
    PP_CV.addEventListener('pointerdown', conDedo((e, x, y) => gestos.abajo(e.pointerId, x, y, e.timeStamp)));
    PP_CV.addEventListener('pointermove', conDedo((e, x, y) => gestos.mueve(e.pointerId, x, y)));
    const fin = e => { if (R) gestos.arriba(e.pointerId, e.timeStamp); else gestos.suelta(); };
    window.addEventListener('pointerup', fin);   // en la ventana: el dedo puede soltarse encima de un rótulo
    window.addEventListener('pointercancel', () => gestos.suelta());
    PP_CV.addEventListener('wheel', conDedo((e, x, y) => { e.preventDefault(); pellizca(x, y, e.deltaY < 0 ? 1.18 : 1 / 1.18); }), { passive: false });
  }
  function monta() {
    if (piezas) return piezas;
    const hud = PP_RAID_HUD.crea({ raiz: PP_UI, tr, icono: ppIcono, alCerrar: () => { play('select'); cierra(); }, alZoom: botonZoom, alPedir: b => { play('select'); PP_RAID_CAMINO.comparte(b); } });
    const gestos = PP_RAID_GESTOS.crea({ alTocar: toca, alArrastrar: arrastra, alPellizcar: pellizca });
    escucha(gestos);
    piezas = { red: creaRed(), hud, gestos };
    return piezas;
  }

  /* ---------- abrir y cerrar ---------- */
  function nueva(id, { red, hud }) {
    const zona = id === 'prueba' ? { ...PP_CFG.raid.prueba.cofres.zona } : { x: 0, y: 0, lado: CAM.LADO };
    const colores = PP_FILAS.map(([h, s, l]) => PP_RAID_LEJOS.hslARgb([h, s, Math.min(80, l + 6)]));   // un punto más pastel que la burbuja: de lejos se ve su brillo, no su borde
    const dibujo = PP_RAID_DIBUJO.crea(zona, creaLienzo, imagen);
    const programa = (fn, ms) => { const h = setTimeout(fn, ms); return () => clearTimeout(h); };
    const r = {
      id, zona, hud, dibujo, trozosZona: CAM.trozosDeZona(zona), antes: PP_PANT.actual,
      sinc: PP_RAID_SINCRONIA.crea({ red, raid: id, cfg: PP_CFG.raid, reloj: Date.now, programa, visible: () => R === r && PP_PANT.actual === 'raid' && !document.hidden }),
      lejos: PP_RAID_LEJOS.crea({ lienzo: creaLienzo(CAM.LADO, CAM.LADO), dibujo: dibujo.pixeles, colores, zona }),
      // los botones del primer mundo de Pop (bm-boton; si no están, la burbuja de siempre), cada uno con una de sus caritas variadas
      cerca: PP_RAID_CERCA.crea({
        creaLienzo, colores, caras: PP_CARAS.despierta.length,
        imagen: k => imagen('bm-boton-' + PP_COLORES[k] + '-arriba') || imagen('b-' + PP_COLORES[k] + '-arriba'),
        cara: (c, cx, cy, r, v) => ppPintaCaraVariada(c, cx, cy, r, PP_CARAS.despierta[v], 1, 0, v),
      }),
      fx: PP_RAID_FX.crea({ azar: Math.random, chispas: (x, y) => PP_CHISPAS.chispas(x, y, Math.random), imagen }),
      voces: PP_RAID_VOCES.crea({ azar: Math.random, tr, di: f => hud.di(f), escribe: m => hud.chat(m) }),
      cam: CAM.entera(vista(), zona), anim: null, mirando: null, pintadas: new Array(256).fill(-1),
      racha: PP_RAID_ZUMO.nueva(), cofres: null, firma: null, nivel: null, humor: null, golpe: 0, resumen: null, avisoRed: false, hudT: 0,
      vista, abierta: () => R === r,
    };
    return r;
  }
  // por qué no se puede abrir ahora (texto), o '' si se puede
  function pega() {
    if (R || abriendo) return 'La raid ya está abierta';
    if (!PP_RAID_CAMINO.activa() && !ppEsPruebas()) return 'La raid aún no está abierta';   // el flag 'raid' (camino.js) o, para el panel DEV, alfa y localhost
    if (PP_PANT.actual !== 'titulo' && PP_PANT.actual !== 'mapa') return 'Abre la raid desde la portada o desde el camino';
    return '';
  }
  // abre la raid; devuelve un aviso (texto) si no se puede
  function abre(id = null) {
    const pero = pega();
    if (pero) return pero;
    const p = monta();
    const r = nueva(id, p);
    R = r;
    r.lejos.todo(r.sinc.tablero());
    r.quita = r.sinc.escucha((nombre, datos) => PP_RAID_SUCESOS.recibe(r, nombre, datos));
    ppIrA('raid');
    p.hud.muestra(true);
    mira();
    r.sinc.arranca();
    return '';
  }
  // cierra la raid; `vuelve` = volver a la pantalla de antes (falso cuando ya se ha ido a otra: fuera())
  async function cierra(vuelve = true) {
    const r = R;
    if (!r) return;
    R = null;
    piezas.hud.muestra(false);
    piezas.gestos.suelta();
    if (vuelve) ppIrA(r.antes);
    await r.sinc.cierra();   // manda la tanda de toques que quedara (los cofres confirmados aún se pagan)
    r.quita();
  }
  // el juego cambia de pantalla por su cuenta con la raid abierta (lo avisa ppIrA): se cierra sin volver a ningún sitio
  function fuera() { if (R) cierra(false); }
  // rehace la raid de prueba (solo rol alfa) y la abre; devuelve un aviso si falla. Primero mira si se puede abrir: rehacerla borra la anterior
  async function prueba() {
    const pero = pega();
    if (pero) return pero;
    abriendo = true;
    const res = await monta().red.prueba();
    abriendo = false;
    if (!res.ok) return 'No se pudo: ' + res.error;
    return abre('prueba');
  }

  /* ---------- cada fotograma ---------- */
  // el mapa pequeño de cuando se está cerca: la zona entera y un marco blanco con lo que se ve
  function minimapa(c, v) {
    const { x, y, w: lado } = cajaMini(v), k = lado / R.zona.lado, vis = CAM.visibles(R.cam, v, R.zona);
    c.fillStyle = '#ff9ccf'; c.beginPath(); c.roundRect(x - 7, y - 7, lado + 14, lado + 14, 16); c.fill();
    c.fillStyle = '#fff'; c.beginPath(); c.roundRect(x - 3, y - 3, lado + 6, lado + 6, 12); c.fill();
    c.fillStyle = '#fff3d6'; c.fillRect(x, y, lado, lado);
    c.imageSmoothingEnabled = R.zona.lado > lado;
    c.drawImage(R.lejos.lienzo, R.zona.x, R.zona.y, R.zona.lado, R.zona.lado, x, y, lado, lado);
    c.lineWidth = 4; c.strokeStyle = '#ff4f9a';
    c.strokeRect(x + (vis.x0 - R.zona.x) * k, y + (vis.y0 - R.zona.y) * k, Math.max(6, (vis.x1 - vis.x0) * k), Math.max(6, (vis.y1 - vis.y0) * k));
  }
  function rotulos(dt) {
    R.hudT -= dt;
    if (R.hudT > 0) return;
    R.hudT = HUD_CADA;
    const s = R.sinc.estado(), v = vista();
    if (!s) return;
    const cuenta = s.yo.burbujas + s.yo.golpes;
    R.hud.estado(s, { cuenta, partes: PP_RAID_SEMANA.partes(PP_RAID_SEMANA.queda(s.fin, s.ahora)), siguiente: PP_RAID_PREMIOS.siguiente(cuenta, PP_CFG.raid) });
    R.hud.zoom(R.cam.z >= Z_MAX - 0.01, R.cam.z <= CAM.zMin(v, R.zona) + 0.001);
  }
  // el marco de la bandeja, como el de las ventanas de Pop: sombra rosa, borde rosa, filo blanco
  function marco(c, b) {
    const caja = (col, m, dy, r) => { c.fillStyle = col; c.beginPath(); c.roundRect(b.x - m, b.y - m + dy, b.w + m * 2, b.h + m * 2, r); c.fill(); };
    caja('rgba(196, 58, 132, 0.3)', 12, 9, 30);
    caja('#ff9ccf', 12, 0, 30);
    caja('#fff', 6, 0, 24);
  }
  function tablero(c, v) {
    const cerca = R.cam.z >= PP_RAID_CERCA.Z_BURBUJAS, b = bandeja(v);
    marco(c, b);
    c.save();
    c.beginPath(); c.roundRect(b.x, b.y, b.w, b.h, 18); c.clip();
    R.cerca.pinta(c, { cam: R.cam, vista: v, zona: R.zona, tablero: R.sinc.tablero(), lejos: R.lejos.lienzo, dibujo: R.dibujo, escala: PP_V.sc * PP_V.dpr });
    R.fx.pintaPops(c, R.cam, v);
    R.fx.pintaCofres(c, R.cam, v);
    c.restore();
    if (cerca) minimapa(c, v);
    PP_RAID_CEO_PINTA.pinta(c, { ...sitioCeo(), humor: R.humor || 'chulo', t: performance.now() / 1000, golpe: R.golpe, imagen });
  }
  function pinta(c, t, dt) {
    ppPintaFondo(c, 'fondo-jefe', t);   // el salón de los jefes, como en los duelos
    if (!R) return;
    const v = vista();
    avanzaCamara(dt);
    pon(R.cam);   // por si la ventana ha cambiado de tamaño
    R.fx.avanza(dt);
    R.voces.avanza(dt, R.humor || 'chulo');
    R.golpe = Math.max(0, R.golpe - dt * 3);
    mira();
    R.lejos.vuelca();
    const [sx, sy] = R.fx.sacudida();
    c.save(); c.translate(sx, sy);
    tablero(c, v);
    R.fx.pintaParts(c);
    R.fx.pintaTextos(c, texto);
    R.fx.pintaRacha(c, texto, 270, v.y + v.h - 70, PP_RAID_ZUMO.tamano(R.racha.n), PP_RAID_ZUMO.resto(R.racha, Date.now()));
    c.restore();
    rotulos(dt);
  }

  return Object.freeze({ abre, cierra, fuera, prueba, pinta, abierta: () => !!R, estado: () => (R ? { cam: R.cam, resumen: R.sinc.estado(), fx: R.fx.cuenta(), humor: R.humor } : null) });
})();
