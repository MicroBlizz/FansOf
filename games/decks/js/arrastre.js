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
  dcCierraLupa();
  mano.addEventListener('click', ev => { if (DCC.trasArrastre) { ev.stopPropagation(); ev.preventDefault(); } }, true);
  for (const el of mano.querySelectorAll('.dc-carta')) {
    el.addEventListener('pointerdown', ev => { if (ev.pointerType !== 'mouse') dcLupaLuego(el, 220); dcEmpiezaArrastre(ev, el); });
    el.addEventListener('pointerenter', ev => { if (ev.pointerType === 'mouse' && !DCC.arrastre) dcLupaLuego(el, 380); });
    for (const t of ['pointerup', 'pointerleave', 'pointercancel']) el.addEventListener(t, dcCierraLupa);
    el.addEventListener('contextmenu', ev => ev.preventDefault());   // en el móvil, mantener pulsado no saca el menú del navegador
  }
}
// La lupa (su ask, 20-10-2026): con el dedo quieto sobre una carta de la mano (o el ratón encima un momento) sale en grande encima, para
// leerla sin tapar nada; en cuanto empieza el arrastre se quita y la carta vuelve a su tamaño. No abre ninguna ventana.
let dcLupaT = null;
function dcLupaLuego(el, ms) { dcCierraLupa(); dcLupaT = setTimeout(() => { dcLupaT = null; if (!DCC.arrastre && el.isConnected) dcLupa(el); }, ms); }
function dcCierraLupa() { if (dcLupaT) { clearTimeout(dcLupaT); dcLupaT = null; } const v = document.querySelector('#stage > .dc-lupa'); if (v) v.remove(); }
function dcLupa(el) {
  const st = document.getElementById('stage'), sr = st.getBoundingClientRect(), r = el.getBoundingClientRect(), w0 = el.offsetWidth, h0 = el.offsetHeight;
  if (!w0 || !h0) return;
  const g = dcClonaCarta(el); g.className = el.className.replace(/dc-elegida|dc-niega|dc-reparte|dc-arrastrada/g, '') + ' dc-lupa'; g.style.cssText = el.style.cssText; g.style.width = w0 + 'px';
  const k = Math.min(sr.width * 0.4, 190) / w0, w = w0 * k, h = h0 * k;   // se escala entera (letra incluida), sin pasar del 40 % del ancho
  const left = Math.max(6, Math.min(sr.width - w - 6, r.left - sr.left + r.width / 2 - w / 2)), top = Math.max(6, r.top - sr.top - h - 12);
  g.style.left = left + 'px'; g.style.top = top + 'px'; g.style.setProperty('--k', k); st.append(g);
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
    A.vivo = true; DCC.arrastre = A; dcCierraLupa(); DCC.elegida = null; A.el.dispatchEvent(new Event('pointercancel')); // anula el «mantener pulsada»
    const st = document.getElementById('stage'), r = A.el.getBoundingClientRect(), sr = st.getBoundingClientRect();
    const g = dcClonaCarta(A.el); g.className = A.el.className.replace(/dc-elegida|dc-niega/g, '') + ' dc-carta-arrastre'; g.style.cssText = A.el.style.cssText;
    g.style.width = r.width + 'px'; A.sr = sr; A.r0 = r; A.dedo = e.pointerType === 'touch' ? 46 : 28;
    st.append(g); A.fantasma = g; A.gw = g.offsetWidth; A.gh = g.offsetHeight; A.el.classList.add('dc-arrastrada');
    A.mirilla = dcMirilla(); st.append(A.mirilla); st.classList.add('dc-sin-cursor'); play('dcCoge');
    document.getElementById('dc-combate').classList.add('dc-arrastrando');
    const s = document.getElementById('dc-combate'), av = s.querySelector('.dc-aviso');
    if (av) av.textContent = dcNecesitaObjetivo(DCC.C, DCC.C.mano[A.i]) ? tr('Suéltala sobre un rival') : tr('Suéltala en la zona de rivales');
  }
  e.preventDefault();
  const x = e.clientX - A.sr.left, y = e.clientY - A.sr.top, p = dcSitioFantasma(A, x, y);
  A.fantasma.style.left = p.left + 'px'; A.fantasma.style.top = p.top + 'px';
  A.mirilla.style.left = x + 'px'; A.mirilla.style.top = y + 'px';
  const b = dcBlancoArrastre(A, e.clientX, e.clientY);
  if (b.el !== (A.blanco && A.blanco.el)) { if (A.blanco && A.blanco.el) A.blanco.el.classList.remove('dc-apunta'); if (b.el) b.el.classList.add('dc-apunta'); }
  if (b.ok && !(A.blanco && A.blanco.ok)) play('dcFija');
  A.blanco = b; A.fantasma.classList.toggle('dc-lista', b.ok); A.mirilla.classList.toggle('dc-fijada', b.ok);
}
// Dónde va la carta cogida: flotando encima del dedo, para leerla mientras la mirilla marca el blanco (su ask, 20-10-2026: en el móvil la
// mirilla caía sobre el texto). Se mide la carta de verdad (en el móvil la de la mano puede ir encogida) y se deja más hueco con el dedo
// que con el ratón. Arriba del todo, sobre los rivales, no cabe encima: se pone al lado del dedo. Se ve al 80 % desde abajo (decks-anim.css).
function dcSitioFantasma(A, x, y) {
  const W = A.sr.width, H = A.sr.height, w = A.gw, h = A.gh, v = 0.8, mx = w * (1 - v) / 2, my = h * (1 - v);   // margen invisible por la escala
  const cabe = y - A.dedo - h * v >= 4;
  if (cabe) return { left: Math.max(4 - mx, Math.min(W - 4 - w + mx, x - w / 2)), top: y - A.dedo - h };
  let left = x + A.dedo - mx; if (left + w - mx > W - 4) left = x - A.dedo - w + mx;
  return { left, top: Math.max(4 - my, Math.min(H - h - 4, y - my - h * v / 2)) };
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
