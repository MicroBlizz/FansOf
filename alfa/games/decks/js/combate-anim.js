// Fans Of Decks · Las animaciones de la reunión: el rival que embiste, se escuda o manda Spam, los impactos, las cifras flotantes
// y los iconos que vuelan. combate-ui.js llama a dcPintaEventos después de pintar; mientras dura, la mano no responde (.dc-ocupado).
'use strict';
// Lo que pasó, animado en orden: cada 'accion' de un rival (o compañero) abre un tramo de medio segundo en el que ese actor se mueve y,
// un poco después, caen sus cifras (daño, cura, bloqueo) con su icono sobre quien las recibe; el golpeado tiembla. Devuelve lo que dura todo.
const DC_PASO = 520;
function dcPintaEventos(C) {
  const s = document.getElementById('dc-combate'), evs = C.eventos.splice(0);
  let total = 0, t = 0, enTramo = false, k = 0, lider = false;
  for (const e of evs) {
    if (e.t === 'accion') { t = total; total += DC_PASO; enTramo = true; k = 0; dcAnimaAccion(s, e, t + 40); continue; }
    const retardo = (enTramo ? t + 230 : 140) + k * 110; k++;
    dcAnimaEvento(s, e, retardo);
    if (!enTramo && e.t === 'dano' && e.r >= 0 && !lider) { lider = true; dcClase(s.querySelector('.dc-lider-arte'), 'dc-brinca', 60); }
  }
  if (!enTramo && evs.length) total = 400 + k * 110;
  return total ? total + 250 : 0;
}
function dcClase(el, cls, retardo, dura) { if (!el) return; setTimeout(() => { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); setTimeout(() => el.classList.remove(cls), dura || 700); }, retardo || 0); }
// El actor se mueve: el rival embiste, se escuda, cura, manda el sobre de Spam, se potencia…; el compañero brinca.
function dcAnimaAccion(s, e, retardo) {
  if (e.comp !== undefined) return dcClase(s.querySelectorAll('.dc-comp')[e.comp], 'dc-brinca', retardo);
  const rv = s.querySelector('.dc-rival[data-rival="' + e.r + '"]'); if (!rv) return;
  dcClase(rv, 'dc-acto-' + e.tipo, retardo);
  if (e.tipo === 'spam') setTimeout(() => dcVuela(rv.querySelector('.dc-rival-arte'), s.querySelector('.dc-pila-desc'), 'spam', '#f3a6ff'), retardo + 120);
  if (e.tipo === 'ataque') setTimeout(() => dcVuela(rv.querySelector('.dc-rival-arte'), s.querySelector('.dc-lider-arte'), 'ataque', '#ff4b5c', 260), retardo + 60);
  if (e.tipo === 'cura' || e.tipo === 'refuerzo') setTimeout(() => dcImpacto(rv.querySelector('.dc-rival-arte'), e.tipo), retardo + 150);
}
// Una cifra flotante con su icono sobre quien la recibe.
function dcAnimaEvento(s, e, retardo) {
  const obj = e.r < 0 ? s.querySelector('.dc-lider-arte') : s.querySelector('.dc-rival[data-rival="' + e.r + '"] .dc-rival-arte'); if (!obj) return;
  setTimeout(() => {
    const f = dcEl('span', 'dc-flot dc-flot-' + (e.t === 'falla' ? 'esquiva' : e.t), e.t === 'dano' ? '−' + e.n : e.t === 'cura' ? '+' + e.n : e.t === 'bloqueo' ? '+' + e.n : e.t === 'falla' ? tr('Sala llena') : tr('Bloqueado'));
    obj.append(f); setTimeout(() => f.remove(), 1300);
    if (e.t !== 'falla') dcImpacto(obj, e.t === 'dano' ? 'ataque' : e.t === 'cura' ? 'cura' : 'defensa');
    if (e.t === 'dano') dcClase(obj.parentElement, 'dc-tiembla', 0, 450);
  }, retardo);
}
// Un icono que estalla sobre un objetivo.
function dcImpacto(obj, icono) { if (!obj) return; const i = dcEl('span', 'dc-impacto dc-impacto-' + icono); i.append(dcSvg(icono)); obj.append(i); setTimeout(() => i.remove(), 700); }
// Un icono que vuela de un elemento a otro (el sobre de Spam hacia los descartes, el golpe hacia el líder).
function dcVuela(de, a, icono, color, dura) {
  if (!de || !a) return; const st = document.getElementById('stage').getBoundingClientRect(), r1 = de.getBoundingClientRect(), r2 = a.getBoundingClientRect();
  const v = dcEl('span', 'dc-vuelo'); v.append(dcSvg(icono)); v.style.color = color; v.style.left = (r1.left + r1.width / 2 - st.left - 16) + 'px'; v.style.top = (r1.top + r1.height / 2 - st.top - 16) + 'px';
  document.getElementById('stage').append(v);
  const dx = (r2.left + r2.width / 2) - (r1.left + r1.width / 2), dy = (r2.top + r2.height / 2) - (r1.top + r1.height / 2);
  if (v.animate) v.animate([{ transform: 'translate(0,0) scale(.6)', opacity: 0 }, { transform: `translate(${dx * 0.3}px, ${dy * 0.3 - 30}px) scale(1.2)`, opacity: 1, offset: .35 }, { transform: `translate(${dx}px, ${dy}px) scale(.8)`, opacity: 0 }], { duration: dura || 520, easing: 'cubic-bezier(.3,.7,.4,1)' }).onfinish = () => v.remove(); else v.remove();
}
