// Fans Of · MONEDAS: las dos monedas de todo juego (PLAN-MONEDAS.md). La GANADA solo sale de jugar y es la única que paga lo que tiene azar;
// la COMPRADA entra con dinero (y cae poco a poco jugando) y nunca entra en nada con azar: compra cosas a precio fijo (pase, cosméticos, ventajas).
// El único puente va de la GANADA a la COMPRADA (oro → gemas, caro: `cambio` de ganada por cada comprada), nunca al revés (decisión de Arkioner, 19-10-2026):
// así el dinero no llega al gashapón ni en dos pasos, y jugando mucho se abaratan el pase y los cosméticos. El ratio solo pasa precios de una a otra.
// Nombres, iconos y ratio: valores de core ← AJUSTES.monedas del juego ← config remota `monedas` (tabla config_servidor, servidor/70; antes, la fila de `flags`), consultados cada vez.
// cual es siempre 'ganada' o 'comprada'. Un juego con partida propia (modo ligero) pone AJUSTES.monedas.leer(cual) y escribir(cual, n); con core, SAVE.gold y SAVE.gems.
// No pinta nada por sí solo: el juego llama a chip(), saldo(), ventanaCambio(), compraReal() desde su tienda o su cartera.
'use strict';
const MONEDAS = (() => {
  const tr = (t, d) => (typeof IDIOMA !== 'undefined' && IDIOMA.tr ? IDIOMA.tr(t, d) : t.replace(/\{(\w+)\}/g, (m, k) => (d && k in d ? d[k] : m)));
  const BASE = {
    ganada: { id: 'oro', nombre: 'Oro', nombre_en: 'Gold', icono: () => (typeof COIN_SVG !== 'undefined' ? COIN_SVG : '') },
    comprada: { id: 'gemas', nombre: 'Gemas', nombre_en: 'Gems', icono: () => (typeof GEM_SVG !== 'undefined' ? GEM_SVG : '') },
    ratio: 100,    // 1 comprada «vale» 100 ganadas: solo para pasar precios de una a otra (p. ej. la tirada: ECON.pull × ratio en oro)
    cambio: 200,   // lo que cuesta 1 comprada en ganada al cambiar (el doble de lo que vale: cambiar sale caro a propósito). 0 = sin puente
  };
  const mezcla = (a, b) => { const o = Object.assign({}, a); for (const k in b || {}) o[k] = b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && typeof b[k] !== 'function' ? mezcla(a[k] || {}, b[k]) : b[k]; return o; };
  const remota = () => {   // la config `monedas` del servidor para este juego (ratio, nombres…); si no llega, la fila antigua de flags (dato es JSON); si está mal escrito, se ignora
    const c = typeof NUCLEO !== 'undefined' && NUCLEO.configRemota && NUCLEO.configRemota('monedas');
    if (c && typeof c === 'object') return c;
    const r = typeof NUCLEO !== 'undefined' && NUCLEO.flagRemoto && NUCLEO.flagRemoto('monedas');
    if (!r || !r.dato) return null;
    try { return JSON.parse(r.dato); } catch (e) { return null; }
  };
  // ¿este juego va con las dos monedas? Basta con que lo declare en AJUSTES.monedas (publicado en todos el 19-10-2026; antes iba tras un flag).
  // La fila `monedas` de `flags` del juego sigue existiendo solo como configuración (dato = ratio y cambio) y el servidor la mira para cobrar
  // el gashapón en oro y el pase en gemas (servidor/47 y 48): su `valor` tiene que seguir en true mientras el juego declare AJUSTES.monedas.
  const activo = () => typeof AJUSTES !== 'undefined' && !!AJUSTES.monedas;
  const conf = () => mezcla(mezcla(BASE, typeof AJUSTES !== 'undefined' && AJUSTES.monedas), remota());
  const mon = cual => { const c = conf(); return cual === 'comprada' ? c.comprada : c.ganada; };
  const nombre = cual => { const m = mon(cual); return typeof NUCLEO !== 'undefined' && NUCLEO.idioma !== 'es' && m.nombre_en ? m.nombre_en : m.nombre; };
  const icono = cual => { const i = mon(cual).icono; return typeof i === 'function' ? i() : i || ''; };
  const chip = (cual, n) => `<span class="moneda-chip moneda-${cual}">${icono(cual)}${typeof n === 'number' ? (typeof fmt === 'function' ? fmt(n) : n) : ''}</span>`;
  const propio = () => typeof AJUSTES !== 'undefined' && AJUSTES.monedas && typeof AJUSTES.monedas.leer === 'function';
  const saldo = cual => (propio() ? AJUSTES.monedas.leer(cual) : typeof SAVE !== 'undefined' ? (cual === 'comprada' ? SAVE.gems : SAVE.gold) || 0 : 0);
  // la guardia: nada con azar cobra en comprada. motivo: el gasto que se va a hacer; v: { gold, gems, … } o { comprada: n }
  const azar = (motivo, v) => {
    if (!v || !(v.gems || v.comprada)) return true;
    const t = `Monedas: «${motivo}» tiene azar y quiere cobrar en moneda comprada. Eso no se hace (PLAN-MONEDAS.md).`;
    if (typeof NUCLEO !== 'undefined' && NUCLEO.desarrollo) throw new Error(t);
    console.error(t); if (typeof toast === 'function') toast(tr('Eso no se puede pagar con {m}', { m: nombre('comprada') }));
    return false;
  };
  // el puente: resta `n × cambio` de ganada y suma n comprada. Devuelve una promesa con { ganada, comprada }
  async function cambiar(nComprada) {
    const c = conf(); nComprada = Math.floor(nComprada);
    if (!(c.cambio > 0) || !(nComprada >= 1)) throw new Error('cantidad');
    const cuesta = nComprada * c.cambio;
    if (saldo('ganada') < cuesta) throw new Error('falta_oro');
    if (typeof ECO !== 'undefined' && ECO.servidor && ECO.servidor('economia')) {   // con cuenta: lo hace el servidor con el `cambio` de la misma fila (servidor/48-cambio-oro-gemas.sql)
      await ECO.pedir('cambiar_oro_gemas', { p_gemas: nComprada });
    } else if (propio()) {
      AJUSTES.monedas.escribir('ganada', saldo('ganada') - cuesta); AJUSTES.monedas.escribir('comprada', saldo('comprada') + nComprada);
    } else if (typeof ECO !== 'undefined') {
      ECO.gastar('cambio', { gold: cuesta }); ECO.ganar('cambio', { gems: nComprada });
    } else throw new Error('sin_cartera');
    if (typeof saveGame === 'function') saveGame(); else if (typeof CUENTA !== 'undefined' && CUENTA.cambio) CUENTA.cambio();
    return { ganada: cuesta, comprada: nComprada };
  }
  // la ventana común: cuántas compradas quieres y cuánta ganada cuestan. alAcabar(resultado) opcional
  function ventanaCambio(alAcabar) {
    if (typeof confirmBox !== 'function') return;
    const c = conf(), tengo = saldo('ganada'), pasos = [1, 5, 10, 50, 100].filter(n => n * c.cambio <= tengo);
    if (!pasos.length) { if (typeof toast === 'function') toast(tr('Te falta {m}: se consigue jugando', { m: nombre('ganada') })); return; }
    let n = pasos[0];
    const filas = pasos.map(p => `<button class="btn-ghost ol" data-cambio="${p}">${chip('ganada', p * c.cambio)} → ${chip('comprada', p)}</button>`).join('');
    confirmBox(tr('CAMBIAR {j} POR {p}', { j: nombre('ganada').toUpperCase(), p: nombre('comprada').toUpperCase() }), `<div class="cambio-lista">${filas}</div><small>${tr('1 de {p} cuesta {r} de {j}. El cambio no se deshace.', { p: nombre('comprada'), r: c.cambio, j: nombre('ganada') })}</small>`, tr('CAMBIAR YA'), () => {
      cambiar(n).then(r => { if (typeof play === 'function') play('win'); if (typeof updateWallets === 'function') updateWallets(); if (typeof toast === 'function') toast('+' + r.comprada + ' ' + nombre('comprada')); if (alAcabar) alAcabar(r); })
        .catch(e => { if (typeof play === 'function') play('deny'); if (typeof toast === 'function') toast(typeof ECO !== 'undefined' && ECO.errorTexto ? ECO.errorTexto(e) : 'No se ha podido'); });
    });
    for (const b of document.querySelectorAll('[data-cambio]')) { b.setAttribute('aria-pressed', String(+b.dataset.cambio === n)); b.onclick = () => { n = +b.dataset.cambio; for (const x of document.querySelectorAll('[data-cambio]')) x.setAttribute('aria-pressed', String(x === b)); }; }
  }
  // Antes de pagar con dinero real, un invitado ve una RECOMENDACIÓN (no un bloqueo): sin cuenta con email o Google, si pierde la instalación pierde su progreso y sus compras
  // La primera vez de un invitado lleva además un check obligatorio («soy consciente y me doy por avisado») que se guarda en el servidor (avisos_compra, SQL 55); versión del texto: AVISO_VERSION
  const AVISO_VERSION = '1';
  function recomiendaCuenta(seguir) {
    if (typeof CUENTA === 'undefined' || !CUENTA.invitado || typeof confirmBox !== 'function') return seguir();
    const juego = (location.pathname.match(/games\/([^/]+)/) || [])[1] || 'web', clave = 'fansof-aviso-compra-' + juego + '-' + AVISO_VERSION;
    let visto = false; try { visto = !!localStorage.getItem(clave); } catch (e) { /* sin almacenamiento: se pide siempre */ }
    const check = visto ? '' : `<label style="display:flex;gap:8px;align-items:flex-start;margin-top:10px;text-align:left"><input type="checkbox" id="aviso-ok" style="margin-top:3px"><span>${tr('Soy consciente y me doy por avisado.')}</span></label>`;
    confirmBox(tr('CREA UNA CUENTA ANTES DE PAGAR'), tr('Te pedimos encarecidamente que crees una cuenta con email o Google antes de pagar. Ahora juegas como invitado: si pierdes la instalación del juego, pierdes todo tu progreso, incluidos los artículos y créditos comprados con dinero real. Cancela y entra desde «Iniciar sesión / crear cuenta».') + check, tr('COMPRAR IGUALMENTE'), () => {
      if (!visto) {
        try { localStorage.setItem(clave, '1'); } catch (e) { /* no pasa nada */ }
        try { if (CUENTA.activa) CUENTA.rpc('aviso_compra', { p_juego: juego, p_version: AVISO_VERSION }).catch(() => { /* el 55 aún sin aplicar: se sigue */ }); } catch (e) { /* idem */ }
      }
      seguir();
    });
    const ok = document.getElementById('cf-ok'), c = document.getElementById('aviso-ok');
    if (ok && c) { ok.disabled = true; ok.style.opacity = '.45'; c.onchange = () => { ok.disabled = !c.checked; ok.style.opacity = c.checked ? '' : '.45'; }; }
  }
  // lo que solo se compra con dinero real (gemas, pack de bienvenida, sin anuncios…). producto: su id en Play Console y en servidor/90 (p. ej. rumble_gemas_550).
  // · En la app de Android con ese id: cobra Google (core/js/sistema/pagos.js) y el servidor entrega; alComprar recibe { real: true, gemas, entradas, derecho, objeto }
  //   y NO debe dar nada por su cuenta (el saldo ya viene del servidor).
  // · En desarrollo: compra de prueba, alComprar({ prueba: true }) da lo suyo en local como siempre.
  // · En la web: todavía no está a la venta.
  function compraReal(titulo, html, alComprar, producto) {
    if (typeof confirmBox !== 'function') return;
    if (producto && typeof PAGOS !== 'undefined' && PAGOS.disponible()) {
      confirmBox(titulo, `${html}<small>${tr('Pago seguro con Google Play. Lo comprado queda en tu cuenta.')}</small>`, tr('COMPRAR'), () => recomiendaCuenta(() => {
        if (typeof toast === 'function') toast(tr('Abriendo Google Play…'), true);
        PAGOS.comprar(producto).then(r => { if (alComprar) alComprar(r); })
          .catch(e => { const t = PAGOS.errorTexto(e); if (!t) return; if (typeof play === 'function') play('deny'); if (typeof toast === 'function') toast(t); });
      }));
    }
    else if (typeof NUCLEO !== 'undefined' && NUCLEO.desarrollo) confirmBox(titulo, `${html}<small>${tr('Compra de prueba (solo en desarrollo): no se cobra nada.')}</small>`, tr('COMPRAR'), () => recomiendaCuenta(() => alComprar({ prueba: true })));
    else confirmBox(tr('SOLO CON DINERO REAL'), `${html}<small>${tr('Esto se paga con dinero de verdad y todavía no está a la venta: llegará con la app de Android.')}</small>`, null);
  }
  // Lo que devuelve la pista de pago de un pase, en %: pasePct = { pase: 26, pasepvp: 70 } en la fila `monedas` de flags (dato). Sirve para que lo que da
  // la pista de pago se quede cerca de lo que cuesta el pase (se puede encadenar uno tras otro, sin acumular). Sin dato, 100 (todo). Mismo valor en el servidor (49).
  const pasePct = p => { const v = ((conf().pasePct || {})[p === 'p' ? 'pasepvp' : 'pase']); return typeof v === 'number' && v >= 0 && v <= 100 ? Math.floor(v) : 100; };
  return { conf, activo, nombre, icono, chip, saldo, azar, cambiar, ventanaCambio, compraReal, recomiendaCuenta, pasePct };
})();
