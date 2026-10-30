// Fans of Jump · LA CUENTA EN EL SERVIDOR (cliente de servidor/72-jump-cuenta.sql): las zanahorias, lo comprado en el puesto, el kit, lo puesto,
// el regalo diario, los anuncios del día, las órdenes de Microblizz, las marcas y las compras con euros viven en el servidor; aquí se ven en GUARDA.
// · Cada acción (partida acabada, regalo, anuncio, compra, pack) se aplica AL MOMENTO en GUARDA (el juego no espera) y se pone en una cola
//   (GUARDA.cola) que se manda en orden con una clave única; el servidor contesta con el estado completo, que SUSTITUYE lo de aquí. Si el servidor
//   dice que no (faltan zanahorias, ya lo tienes, repetida…), esa acción se tira y se vuelve a pedir el estado: lo de aquí se corrige solo.
// · Sin red, la cola espera y se manda al volver (evento 'online', al volver a la pestaña o con la siguiente acción). Se puede jugar igual.
// · Sin cuenta (CUENTA inactiva), con ?nube=0, o si el servidor aún no tiene las funciones: todo sigue en la partida local (JS.activo() es false).
// · La primera vez que una cuenta entra, su partida local pasa al servidor (jump_migrar, con topes); otro dispositivo de la misma cuenta solo
//   aporta lo que haya comprado en el puesto, nunca zanahorias. Lo que llevas puesto se sube un momento después de cambiarlo (jump_poner).
'use strict';

const JS = (() => {
  let activo = false, enviando = false, temporizador = 0, ultimoPuesto = '', puestoPendiente = false;   // puestoPendiente: lo puesto aquí aún no está en el servidor
  const nube = () => typeof CUENTA !== 'undefined' && CUENTA.activa && typeof CUENTA.rpc === 'function';
  const sinFuncion = e => /Could not find|HTTP 404|PGRST202/i.test(String((e && e.message) || e));
  const deNegocio = e => /repetida|faltan_zanas|ya_la_tienes|todavia_no|sin_anuncios|ya_duplicado|tope_kit|no_existe|tienda_cerrada|tipo_no_valido|clave_no_valida|sin_contrato|no_se_vende/.test(String((e && e.message) || e));
  const clave = n => n + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const puestoDe = () => ({ pelaje: GUARDA.pelaje, capa: GUARDA.capa, piel: GUARDA.piel || 'madera', estela: GUARDA.estela });

  // lo que manda el servidor pasa a GUARDA (y con salvaGuarda se queda de copia para jugar sin red)
  function aplica(est) {
    if (!est || typeof est !== 'object' || !est.estado) return;
    const e = est.estado, m = e.marcas || {};
    GUARDA.zanas = Math.max(0, Math.floor(+est.zanas || 0));
    GUARDA.tengo = e.tengo || {}; GUARDA.kit = e.kit || {}; GUARDA.compras = e.compras || {};
    if (e.puesto && !puestoPendiente) { GUARDA.pelaje = e.puesto.pelaje || GUARDA.pelaje; GUARDA.capa = e.puesto.capa || GUARDA.capa; GUARDA.piel = e.puesto.piel || 'madera'; GUARDA.estela = e.puesto.estela || GUARDA.estela; }
    GUARDA.regalo = e.regalo && typeof e.regalo === 'object' ? e.regalo : null;
    GUARDA.anuncios = e.anuncios && e.anuncios.dia ? e.anuncios : null;
    if (Array.isArray(e.misiones) && e.misiones.length === 3) GUARDA.misiones = e.misiones;
    GUARDA.nivelMision = e.nivelMision || {};
    if (e.pase && typeof e.pase === 'object') GUARDA.pase = Object.assign({ temporada: -1, xp: 0, premium: false, cobrados: [], cobradosP: [] }, e.pase);   // el contrato de obra (75)
    GUARDA.mejor = Math.max(GUARDA.mejor || 0, +m.mejor || 0); GUARDA.mejorM = Math.max(GUARDA.mejorM || 0, +m.mejorM || 0);
    GUARDA.partidas = Math.max(GUARDA.partidas || 0, +m.partidas || 0); GUARDA.rescatados = +m.rescatados || 0;
    if (!puestoPendiente) ultimoPuesto = JSON.stringify(puestoDe());
    salvaGuarda();
  }
  const errorTexto = e => {
    const s = String((e && e.message) || e);
    return /faltan_zanas/.test(s) ? tr('Te faltan zanahorias') : /ya_la_tienes/.test(s) ? tr('Eso ya es tuyo') : /todavia_no|ya_duplicado/.test(s) ? tr('Hoy ya lo has cogido')
      : /sin_anuncios/.test(s) ? tr('Mañana más anuncios') : /tienda_cerrada/.test(s) ? tr('La tienda con euros aún no está abierta.') : tr('El servidor no lo ha aceptado y se ha corregido');
  };

  async function arranca() {
    if (!nube() || new URLSearchParams(location.search).get('nube') === '0') return;
    const tarda = ms => new Promise((_, no) => setTimeout(() => no(new Error('tarda')), ms));
    try {
      let est = await Promise.race([CUENTA.rpc('jump_estado', {}), tarda(6000)]);
      if (!est) est = await Promise.race([CUENTA.rpc('jump_migrar', { p_save: GUARDA }), tarda(8000)]);                                   // la primera vez: la partida local entra
      else if (!GUARDA.jsUnido) est = (await Promise.race([CUENTA.rpc('jump_migrar', { p_save: { tengo: GUARDA.tengo, kit: GUARDA.kit } }), tarda(8000)])) || est;   // otro dispositivo: solo lo comprado
      GUARDA.jsUnido = true; activo = true; aplica(est); vaciaCola();
    } catch (e) {
      if (sinFuncion(e)) return;                       // el servidor aún no lo tiene: sigue la partida local
      if (GUARDA.jsUnido) { activo = true; vaciaCola(); }   // sin red: GUARDA es la última copia del servidor; lo pendiente se manda al volver
    }
  }
  // una acción: se apunta en la cola y se intenta mandar ya
  function pide(tipo, args) {
    if (!activo) return;
    (GUARDA.cola = GUARDA.cola || []).push(Object.assign({ tipo, clave: clave(tipo) }, args || {}));
    salvaGuarda(); vaciaCola();
  }
  const RPC = {
    partida: a => CUENTA.rpc('jump_partida', { p_clave: a.clave, p_stats: a.stats }),
    regalo: a => CUENTA.rpc('jump_regalo', { p_clave: a.clave }),
    anuncio: a => CUENTA.rpc('jump_anuncio', { p_clave: a.clave, p_tipo: a.t }),
    comprar: a => CUENTA.rpc('jump_comprar', { p_clave: a.clave, p_cat: a.cat, p_id: a.id }),
    pack: a => CUENTA.rpc('jump_pack', { p_clave: a.clave, p_pack: a.pack }),
    pase: a => CUENTA.rpc('jump_pase_cobrar', { p_clave: a.clave, p_nivel: a.nivel, p_premium: !!a.premium }),
  };
  async function vaciaCola() {
    if (!activo || enviando || !nube()) return; enviando = true;
    try {
      while (GUARDA.cola && GUARDA.cola.length) {
        const a = GUARDA.cola[0];
        let est = null;
        try { est = await (RPC[a.tipo] || (() => null))(a); }
        catch (e) {
          if (!deNegocio(e)) throw e;                   // sin red o error del servidor: se queda en la cola y se reintenta después
          GUARDA.cola.shift(); salvaGuarda();
          if (!/repetida/.test(String(e && e.message))) { try { toast(errorTexto(e)); } catch (_) { /* sin aviso */ } }
          try { est = await CUENTA.rpc('jump_estado', {}); } catch (_) { est = null; }   // lo de aquí se corrige con lo del servidor
          if (est) aplica(est);
          continue;
        }
        GUARDA.cola.shift(); aplica(est);
      }
    } catch (_) { /* sin red: se reintenta al volver */ }
    enviando = false;
  }
  // lo que llevas puesto se sube un momento después de cambiarlo (salvaGuarda avisa)
  function alGuardar() {
    if (!activo) return;
    const p = JSON.stringify(puestoDe()); if (p === ultimoPuesto) return;
    puestoPendiente = true; clearTimeout(temporizador);
    temporizador = setTimeout(async () => {
      try { const est = await CUENTA.rpc('jump_poner', { p_puesto: puestoDe() }); puestoPendiente = false; aplica(est); } catch (_) { /* se reintenta en el próximo cambio */ }
    }, 1500);
  }
  // al volver a la pestaña: lo que hiciste en otro dispositivo (si no hay nada pendiente de mandar)
  if (document.addEventListener) document.addEventListener('visibilitychange', async () => {
    if (document.hidden || !activo || enviando || (GUARDA.cola && GUARDA.cola.length)) return;
    try { aplica(await CUENTA.rpc('jump_estado', {})); } catch (_) { /* sin red */ }
  });
  if (window.addEventListener) window.addEventListener('online', () => setTimeout(vaciaCola, 1000));
  // borrar la cuenta de Jump en el servidor (solo pruebas y DEV)
  async function reinicia() { if (activo) await CUENTA.rpc('jump_reiniciar', {}); delete GUARDA.jsUnido; GUARDA.cola = []; salvaGuarda(); }
  return { arranca, pide, aplica, alGuardar, vaciaCola, reinicia, activo: () => activo, errorTexto };
})();
