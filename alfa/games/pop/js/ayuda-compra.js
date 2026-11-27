// Fans of Pop · la ventanita de comprar una ayuda en plena partida (tarea 437, boceto de Pepins): se abre al tocar una ayuda a 0
// (PP_AYUDA_BOTON, js/ayuda-boton.js) y para la partida. Trae la ayuda, para qué sirve, tus perlas y dos botones, 1 y x3, con su
// precio en perlas y euros (ppPerlasPrecioHtml: un menor ve solo perlas, tarea 254). Si faltan perlas, «Te faltan N perlas» de
// siempre (ppFaltanPerlas, js/tienda-venta.js) y, al comprarlas, se hace la compra. Al comprar o con «Ahora no», vuelta a la partida.
'use strict';
function ppVentanaComprarAyuda(k) {
  const A = PP_CFG.ayudas[k], tres = PP_PRECIOS.lote(A.perlas, 3, PP_CFG.ayudasTres);
  PP_PANT.pausa = true;   // la partida espera; ppCierra la suelta
  const t = ppAbre(`<h2>${tr(A.nombre)}</h2>${ppIcono('i-' + k, 90, '#ffd1ec')}<p class="pp-sub">${tr(A.texto)}</p>`
    + `<p class="pp-sub">${tr('Tienes:')} ${ppPerlasHtml(SAVE.perlas || 0, 24)}</p>`);
  t.classList.add('pp-compra-ayuda');
  const compra = (n, precio) => {
    if (!ppPerlas(-precio, 'ayuda')) { ppFaltanPerlas(precio, () => compra(n, precio), () => ppVentanaComprarAyuda(k)); return; }
    ppDaAyuda(k, n); play('ppPremio'); ppCierra(); ppBarraAyudas();
  };
  const uno = ppBoton('', 'pp-btn2 pp-azul', () => compra(1, A.perlas));
  uno.innerHTML = `<span>1</span>${ppPerlasPrecioHtml(A.perlas, 22)}`;   // apilado: cuántas, el precio y sus euros debajo
  const tresB = ppBoton('', 'pp-btn2 pp-pago', () => compra(3, tres.precio));
  tresB.innerHTML = `<span>x3</span>${ppPerlasPrecioHtml(tres.precio, 22)}<small>${tr('Ahorras {n} perlas', { n: tres.ahorro })}</small>`;
  const fila = document.createElement('div'); fila.className = 'pp-compra-ayuda-op'; fila.append(uno, tresB);
  t.append(fila, ppBoton(tr('Ahora no'), 'pp-btn2 pp-volver', ppCierra));
}
