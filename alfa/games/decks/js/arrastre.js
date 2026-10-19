// Fans Of Decks · Arrastrar cartas de la mano: la carta sigue al dedo y se juega al soltarla.
// La que pide objetivo se suelta sobre el rival que quieras; la de área o sin objetivo vale soltarla en cualquier sitio de la zona de rivales.
// Si se suelta fuera, vuelve a la mano. Tocar sigue funcionando como antes (tocar la carta y luego el rival). Regla de Arkioner, 18-10-2026.
'use strict';
const DC_UMBRAL_ARRASTRE = 10;
// Copia una carta con sus dibujos (cloneNode no copia lo pintado en un canvas).
function dcClonaCarta(el) {
  const g = el.cloneNode(true), de = el.querySelectorAll('canvas'), a = g.querySelectorAll('canvas');
  a.forEach((cv, k) => { try { cv.getContext('2d').drawImage(de[k], 0, 0); } catch (e) { /* sin dibujo */ } });
  return g;
}
// Engancha el arrastre a las cartas de la mano recién pintada.
function dcArrastreMano(mano) {
  mano.addEventListener('click', ev => { if (DCC.trasArrastre) { ev.stopPropagation(); ev.preventDefault(); } }, true);
  for (const el of mano.querySelectorAll('.dc-carta')) el.addEventListener('pointerdown', ev => dcEmpiezaArrastre(ev, el));
}
function dcEmpiezaArrastre(ev, el) {
  if (ev.button > 0 || DCC.arrastre) return;
  const C = DCC.C, i = +el.dataset.mano, c = C.mano[i]; if (!c || !dcPuedeJugar(C, c)) return;
  const A = { el, i, x0: ev.clientX, y0: ev.clientY, id: ev.pointerId, vivo: false, fantasma: null, blanco: null };
  const mueve = e => { if (e.pointerId === A.id) dcMueveArrastre(A, e); };
  const suelta = e => { if (e.pointerId !== A.id) return; quita(); dcSueltaArrastre(A, e, e.type === 'pointerup'); };
  const quita = () => { window.removeEventListener('pointermove', mueve); window.removeEventListener('pointerup', suelta); window.removeEventListener('pointercancel', suelta); };
  window.addEventListener('pointermove', mueve); window.addEventListener('pointerup', suelta); window.addEventListener('pointercancel', suelta);
}
// La mirilla que va donde está el dedo o el ratón mientras arrastras (su ask, 19-10-2026): blanca buscando, roja y girada cuando fija un blanco.
function dcMirilla() {
  const m = dcEl('span', 'dc-mirilla');
  m.innerHTML = '<svg viewBox="0 0 48 48" aria-hidden="true"><g fill="none" stroke-linecap="round"><circle cx="24" cy="24" r="14" stroke="#20102c" stroke-width="7"/><path d="M24 2v11M24 35v11M2 24h11M35 24h11" stroke="#20102c" stroke-width="7"/><circle class="dc-mir-aro" cx="24" cy="24" r="14" stroke-width="3.5"/><path class="dc-mir-aro" d="M24 3v10M24 35v10M3 24h10M35 24h10" stroke-width="3.5"/></g><circle class="dc-mir-punto" cx="24" cy="24" r="3.6" stroke="#20102c" stroke-width="2"/></svg>';
  return m;
}
// Pasado el umbral, la carta se despega de la mano: un fantasma la sigue, la mirilla marca el punto y se ilumina dónde caería.
function dcMueveArrastre(A, e) {
  if (!A.vivo) {
    if (Math.hypot(e.clientX - A.x0, e.clientY - A.y0) < DC_UMBRAL_ARRASTRE) return;
    A.vivo = true; DCC.arrastre = A; DCC.elegida = null; A.el.dispatchEvent(new Event('pointercancel')); // anula el «mantener pulsada»
    const st = document.getElementById('stage'), r = A.el.getBoundingClientRect(), sr = st.getBoundingClientRect();
    const g = dcClonaCarta(A.el); g.className = A.el.className.replace(/dc-elegida|dc-niega/g, '') + ' dc-carta-arrastre'; g.style.cssText = A.el.style.cssText;
    g.style.width = r.width + 'px'; A.ox = -r.width / 2; A.oy = -r.height - 14; A.sr = sr; A.r0 = r; // la carta va encima del dedo, para ver a quién apuntas
    st.append(g); A.fantasma = g; A.el.classList.add('dc-arrastrada');
    A.mirilla = dcMirilla(); st.append(A.mirilla); st.classList.add('dc-sin-cursor'); play('dcCoge');
    document.getElementById('dc-combate').classList.add('dc-arrastrando');
    const s = document.getElementById('dc-combate'), av = s.querySelector('.dc-aviso');
    if (av) av.textContent = dcNecesitaObjetivo(DCC.C, DCC.C.mano[A.i]) ? tr('Suéltala sobre un rival') : tr('Suéltala en la zona de rivales');
  }
  e.preventDefault();
  A.fantasma.style.left = (e.clientX - A.sr.left + A.ox) + 'px'; A.fantasma.style.top = (e.clientY - A.sr.top + A.oy) + 'px';
  A.mirilla.style.left = (e.clientX - A.sr.left) + 'px'; A.mirilla.style.top = (e.clientY - A.sr.top) + 'px';
  const b = dcBlancoArrastre(A, e.clientX, e.clientY);
  if (b.el !== (A.blanco && A.blanco.el)) { if (A.blanco && A.blanco.el) A.blanco.el.classList.remove('dc-apunta'); if (b.el) b.el.classList.add('dc-apunta'); }
  if (b.ok && !(A.blanco && A.blanco.ok)) play('dcFija');
  A.blanco = b; A.fantasma.classList.toggle('dc-lista', b.ok); A.mirilla.classList.toggle('dc-fijada', b.ok);
}
// Dónde caería: el rival bajo el dedo, o la zona de rivales entera si la carta no pide objetivo.
function dcBlancoArrastre(A, x, y) {
  const C = DCC.C, c = C.mano[A.i], s = document.getElementById('dc-combate'), bajo = document.elementFromPoint(x, y);
  const rv = bajo && bajo.closest('.dc-rival:not(.dc-sale)'), zona = s.querySelector('.dc-rivales');
  const enZona = (() => { if (!zona) return false; const z = zona.getBoundingClientRect(); return y <= z.bottom + 12 && y >= 0; })();
  if (dcNecesitaObjetivo(C, c)) { const k = rv ? +rv.dataset.rival : -1; return k >= 0 && C.rivales[k] && C.rivales[k].hp > 0 ? { ok: true, el: rv, obj: k } : { ok: false, el: null }; }
  return enZona ? { ok: true, el: zona, obj: rv && C.rivales[+rv.dataset.rival] && C.rivales[+rv.dataset.rival].hp > 0 ? +rv.dataset.rival : dcPrimerRival(C) } : { ok: false, el: null };
}
// Al soltar: si cae bien se juega; si no, la carta vuelve a su sitio en la mano.
function dcSueltaArrastre(A, e, soltada) {
  if (!A.vivo) return;
  DCC.arrastre = null; DCC.trasArrastre = true; setTimeout(() => { DCC.trasArrastre = false; }, 0);
  const s = document.getElementById('dc-combate'), g = A.fantasma; s.classList.remove('dc-arrastrando');
  A.mirilla.remove(); document.getElementById('stage').classList.remove('dc-sin-cursor');
  if (A.blanco && A.blanco.el) A.blanco.el.classList.remove('dc-apunta');
  const b = soltada ? dcBlancoArrastre(A, e.clientX, e.clientY) : { ok: false };
  const C = DCC.C;
  if (b.ok && C.mano[A.i] && dcPuedeJugar(C, C.mano[A.i])) {
    if (g.animate) g.animate([{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(1.15)', opacity: 1, offset: .3 }, { transform: 'scale(.5)', opacity: 0 }], { duration: 300, easing: 'cubic-bezier(.2,.8,.3,1)' }).onfinish = () => g.remove(); else g.remove();
    dcEfectoJugada(C.mano[A.i], dcDestinoJugada(C, C.mano[A.i], b.obj));
    dcJugar(C, A.i, b.obj); dcTrasJugada();
    return;
  }
  A.el.classList.remove('dc-arrastrada');
  const r = g.getBoundingClientRect(), dx = A.r0.left - r.left, dy = A.r0.top - r.top;
  if (g.animate) g.animate([{ transform: 'translate(0,0)' }, { transform: `translate(${dx}px, ${dy}px)` }], { duration: 200, easing: 'ease-out' }).onfinish = () => g.remove(); else g.remove();
  const av = s.querySelector('.dc-aviso'); if (av) av.textContent = '';
}
