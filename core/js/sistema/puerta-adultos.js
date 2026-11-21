// Fans Of · PUERTA DE ADULTOS (tarea #178, ADR 166): antes de pagar con dinero real, una pregunta que un niño pequeño no sabe resolver.
// · Reglas (sin pantalla, sin reloj y con el azar que se le pase): reto(azar) da una multiplicación de 6-9 por 12-19, siempre válida y congelada;
//   acierta(reto, texto) dice si lo escrito (solo cifras) es la respuesta.
// · Pantalla: pide(seguir) la enseña en la ventana de confirmación de core, con el teclado de números, y llama a seguir() solo si se acierta.
//   Si se falla, no sigue: avisa y la próxima compra trae otra pregunta. No se guarda nada: se pide en cada compra (Pepins, 19-11-2026).
// La usa MONEDAS.compraReal (core/js/sistema/monedas.js) tras el flag común 'puerta-adultos'; ningún juego la llama por su cuenta.
'use strict';
const PUERTA_ADULTOS = (() => {
  const tr = (t, d) => (typeof IDIOMA !== 'undefined' && IDIOMA.tr ? IDIOMA.tr(t, d) : t.replace(/\{(\w+)\}/g, (m, k) => (d && k in d ? d[k] : m)));
  const entre = (azar, min, max) => min + Math.min(max - min, Math.floor(azar() * (max - min + 1)));
  function reto(azar = Math.random) {
    const a = entre(azar, 6, 9), b = entre(azar, 12, 19);
    return Object.freeze({ a, b, respuesta: a * b });
  }
  const acierta = (r, texto) => /^\s*\d{1,4}\s*$/.test(String(texto == null ? '' : texto)) && Number(texto) === r.respuesta;

  // el botón RESPONDER se enciende solo con alguna cifra escrita; Intro también sigue
  function preparaCampo() {
    const ok = document.getElementById('cf-ok'), i = document.getElementById('puerta-resp');
    if (!ok || !i) return;
    const enciende = () => { const hay = /\d/.test(i.value); ok.disabled = !hay; ok.style.opacity = hay ? '' : '.45'; };
    i.oninput = enciende;
    i.onkeydown = e => { if (e.key === 'Enter' && !ok.disabled) ok.click(); };
    enciende();
    setTimeout(() => { try { i.focus(); } catch (e) { /* sin foco: se toca a mano */ } }, 50);
  }
  function falla() {
    if (typeof play === 'function') play('deny');
    if (typeof toast === 'function') toast(tr('Respuesta incorrecta: no se ha comprado nada.'));
  }
  function pide(seguir, azar) {
    if (typeof confirmBox !== 'function') return;
    const r = reto(azar);
    const html = `<p>${tr('Para comprar con dinero real, pide a una persona adulta que conteste:')}</p>`
      + `<p style="font-size:28px;font-weight:800;margin:10px 0">${tr('¿Cuánto es {a} × {b}?', { a: r.a, b: r.b })}</p>`
      + `<input id="puerta-resp" type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" maxlength="4" aria-label="${tr('Respuesta')}"`
      + ' style="width:140px;font-size:28px;font-weight:800;text-align:center;padding:10px;border-radius:12px;border:3px solid #20102c">';
    confirmBox(tr('PREGUNTA PARA ADULTOS'), html, tr('RESPONDER'), () => {
      const i = document.getElementById('puerta-resp');
      if (acierta(r, i && i.value)) seguir(); else falla();
    });
    preparaCampo();
  }
  return Object.freeze({ reto, acierta, pide });
})();
