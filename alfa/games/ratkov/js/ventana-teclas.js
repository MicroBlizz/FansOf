// Fans of Ratkov · CAMBIAR LAS TECLAS (Opciones > TECLAS, solo en el ordenador). Una fila por acción con su tecla: tocas el botón, pulsas
// la tecla nueva y listo (Esc cancela). Si esa tecla ya la usaba otra acción, se cambian entre ellas. Se guarda en AJUSTES.teclas
// (este navegador) y vale al momento. El ratón (apuntar, disparar, clic derecho para la zanahoria) no se cambia.
'use strict';
let TECLAS_VUELTA = null;   // qué abrir al cerrar (las Opciones)
function abreTeclas(alCerrar) {
  if (alCerrar !== undefined) TECLAS_VUELTA = alCerrar; alCerrar = TECLAS_VUELTA;
  CAPTURA_TECLA = null;
  const fila = a => '<div class="tecla-fila"><span>' + esc(tr(a.n)) + '</span><button type="button" class="btn tecla' + (AJUSTES.teclas && AJUSTES.teclas[a.id] ? ' cambiada' : '') + '" data-t="' + a.id + '">' + esc(teclasDe(a.id).map(nombreTecla).join(' / ')) + '</button></div>';
  const h = cabecera(tr('TECLAS')) + '<p class="nota">' + esc(tr('Toca una acción y pulsa la tecla nueva. Esc cancela. El ratón apunta y dispara; el clic derecho lanza la zanahoria bomba. Esc siempre pausa.')) + '</p>'
    + '<div class="teclas">' + ACCIONES_TECLA.map(fila).join('') + '</div>'
    + '<div class="pie"><button type="button" class="btn" data-a="def">' + esc(tr('RESTABLECER')) + '</button><button type="button" class="btn bien" data-a="ok">' + esc(tr('LISTO')) + '</button></div>';
  const v = abreVentana('v-teclas', h);
  const cierra = () => { CAPTURA_TECLA = null; cierraVentana('v-teclas'); if (alCerrar) alCerrar(); };
  enganchaCerrar(v, 'v-teclas'); const x = v.querySelector('[data-cierra]'); if (x) x.addEventListener('click', () => { CAPTURA_TECLA = null; if (alCerrar) alCerrar(); });
  v.querySelector('[data-a="ok"]').onclick = () => { play('select'); cierra(); };
  v.querySelector('[data-a="def"]').onclick = () => { AJUSTES.teclas = null; guardaAjustes(); rehaceTeclas(); play('select'); toast(tr('Teclas como venían de fábrica.'), true); abreTeclas(alCerrar); };
  v.querySelectorAll('[data-t]').forEach(b => (b.onclick = () => {
    v.querySelectorAll('.tecla.espera').forEach(o => { o.classList.remove('espera'); o.textContent = teclasDe(o.dataset.t).map(nombreTecla).join(' / '); });
    CAPTURA_TECLA = b.dataset.t; b.classList.add('espera'); b.textContent = tr('PULSA UNA TECLA…'); play('select');
  }));
}
// la tecla que llega mientras se espera una (va antes que el juego: así no dispara la acción vieja)
window.addEventListener('keydown', e => {
  if (!CAPTURA_TECLA) return;
  e.preventDefault(); e.stopImmediatePropagation();
  const id = CAPTURA_TECLA, c = e.code;
  CAPTURA_TECLA = null;
  if (c === 'Escape' || !c) { abreTeclas(); return; }
  const t = Object.assign({}, AJUSTES.teclas || {}), antes = teclasDe(id);
  // si otra acción usaba esa tecla, se la queda la tecla vieja de esta (se cambian)
  for (const a of ACCIONES_TECLA) {
    if (a.id === id || !teclasDe(a.id).includes(c)) continue;
    const resto = teclasDe(a.id).filter(k => k !== c);
    t[a.id] = resto.length ? resto : [antes.find(k => k !== c) || antes[0]];
  }
  t[id] = [c];
  AJUSTES.teclas = t; guardaAjustes(); rehaceTeclas(); play('compra');
  toast(trf('%1: %2', tr(ACCIONES_TECLA.find(a => a.id === id).n), nombreTecla(c)), true);
  abreTeclas();
}, true);
