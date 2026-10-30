// Fans of Ratkov · COPIAS DE SEGURIDAD de la partida (en este aparato). Cada vez que se guarda: copia nueva si cambió algo importante (armas, chapas,
// incursiones, cosas del alijo) o pasaron 3 minutos; se quedan las 10 últimas. En Opciones > COPIAS DE SEGURIDAD se ven con su hora y un resumen (chapas, incursiones, armas) y se puede volver a
// una. Así, si algo desaparece por un fallo, se recupera. Al recuperar se marca para subir a la nube, para que la nube no la pise.
'use strict';
const COPIAS = { clave: 'forat-copias', max: 10, cada: 3 * 60 * 1000 };
const leeCopias = () => { try { return JSON.parse(localStorage.getItem(COPIAS.clave) || '[]'); } catch (e) { return []; } };
// lo que se enseña de una partida para reconocerla
function resumenCopia(s) {
  const armas = [s.equipo && s.equipo.arma1, s.equipo && s.equipo.arma2, ...(s.alijo || []), ...(s.mochila || [])].filter(o => o && ARMAS[o.id]).map(o => o.id);
  return { chapas: s.chapas || 0, inc: (s.cuentas && s.cuentas.incursiones) || 0, armas, cosas: (s.alijo || []).filter(Boolean).length };
}
function copiaSeguridad(forzar) {
  try {
    const l = leeCopias(), ahora = Date.now();
    // dentro de los 3 minutos se pone al día la última, pero solo si lo importante es igual (mismas armas, chapas, incursiones y cosas en el
    // alijo) y no era una copia fija (antes de entrar, de borrar o de recuperar). Si cambió algo de eso, copia nueva: la de antes se queda
    const igual = l[0] && JSON.stringify(resumenCopia(l[0].d)) === JSON.stringify(resumenCopia(SAVE));
    if (!forzar && l[0] && !l[0].f && igual && ahora - l[0].t < COPIAS.cada) l[0] = { t: l[0].t, d: SAVE };
    else l.unshift(forzar ? { t: ahora, d: SAVE, f: 1 } : { t: ahora, d: SAVE });
    localStorage.setItem(COPIAS.clave, JSON.stringify(l.slice(0, COPIAS.max)));
  } catch (e) { /* sin sitio: no pasa nada, la partida ya está guardada */ }
}
// al empezar cada incursión, una copia aparte (por si lo de dentro sale mal)
function copiaAntesDeEntrar() { copiaSeguridad(true); }

function abreCopias() {
  const l = leeCopias();
  const fila = (c, i) => {
    const r = resumenCopia(c.d), cuando = new Date(c.t).toLocaleString(NUCLEO.idioma, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    return '<div class="fila-obj"><div class="fo-t"><b>' + esc(cuando) + '</b><span>' + esc(trf('%1 chapas · %2 incursiones · %3 cosas en el alijo', miles(r.chapas), r.inc, r.cosas)) + '</span><span>' + esc(r.armas.length ? r.armas.map(id => tr(OBJ[id].n)).join(', ') : tr('sin armas')) + '</span></div><div class="fo-b">' + boton('RECUPERAR', 'recupera', i, 'bien') + '</div></div>';
  };
  const h = cabecera(tr('COPIAS DE SEGURIDAD')) + '<p class="nota">' + esc(tr('El juego guarda solo una copia de tu partida cada pocos minutos y al entrar en cada incursión. Si algo ha desaparecido, vuelve a una de antes.')) + '</p>'
    + '<div class="lista">' + (l.length ? l.map(fila).join('') : '<p class="vacio">' + esc(tr('Todavía no hay copias.')) + '</p>') + '</div>';
  const v = abreVentana('v-teclas', h); enganchaCerrar(v, 'v-teclas');
  v.querySelectorAll('[data-a="recupera"]').forEach(b => (b.onclick = () => {
    const c = l[+b.dataset.i]; if (!c) return;
    confirmBox(tr('¿VOLVER A ESTA COPIA?'), esc(tr('Tu partida de ahora se cambia por esta. Antes se guarda una copia de la de ahora, por si te arrepientes.')), tr('RECUPERAR'), () => {
      copiaSeguridad(true);
      try {
        localStorage.setItem(AJUSTES.guardado, JSON.stringify(c.d));
        // que la nube no la pise al abrir: queda pendiente de subir
        const k = AJUSTES.guardado + '-nube', m = JSON.parse(localStorage.getItem(k) || '{"version":0}'); m.pendiente = true; localStorage.setItem(k, JSON.stringify(m));
      } catch (e) { toast(tr('No se ha podido recuperar.')); return; }
      location.reload();
    });
  }));
}
