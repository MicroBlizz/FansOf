// Tiny Fans · adaptador · MARCADORES de la expedición y del asalto: batería y mochila arriba, la barra de voltios, el botón de la pila a
// la derecha, la flecha naranja al nido, la roja a la mochila caída, el borde rojo de batería baja y la cuenta atrás del asalto. El
// tercio de abajo queda libre para el pulgar. Lee datos sencillos que le prepara la pantalla; no toca el dominio.
'use strict';
TN.hud = (() => {
  let caja = null, n = {}, flechas = [];
  const pct = (a, b) => Math.max(0, Math.min(100, b ? a / b * 100 : 0)).toFixed(0) + '%';
  function flecha(clase) { const f = TN.crea('div', { className: 'tn-flecha tn-flecha-' + clase }); f.innerHTML = TN.iconos.svg('flecha', 40); caja.append(f); return f; }
  // coloca una flecha en el borde, apuntando a un punto que queda fuera de la vista
  function apunta(f, p, w, h) {
    const m = AJUSTES.interfaz.flechaMargen, dx = p.x - w / 2, dy = p.y - h / 2;
    const dentro = p.x > m && p.x < w - m && p.y > m + 60 && p.y < h - m;
    f.hidden = dentro; if (dentro) return;
    const k = Math.min((w / 2 - m) / Math.abs(dx || 1e-6), (h / 2 - m - 40) / Math.abs(dy || 1e-6));
    f.style.transform = `translate(${(w / 2 + dx * k - 20).toFixed(0)}px, ${(h / 2 + dy * k - 20).toFixed(0)}px) rotate(${Math.atan2(dy, dx).toFixed(2)}rad)`;
  }
  return {
    // acciones: { usaPila() }
    monta(capa, acciones) {
      this.desmonta();
      n.bateria = TN.crea('i'); n.voltios = TN.crea('i'); n.mochila = TN.crea('b'); n.pilas = TN.crea('b'); n.cuenta = TN.crea('b', { className: 'tn-cuenta', hidden: true });
      n.pila = TN.crea('button', { type: 'button', className: 'tn-pila', onclick: acciones.usaPila }, TN.iconos.nodo('pila', 40), n.pilas);
      n.borde = TN.crea('div', { className: 'tn-borde-rojo', hidden: true });
      caja = TN.crea('div', { className: 'tn-hud' }, n.borde,
        TN.crea('div', { className: 'tn-hud-arriba' },
          TN.crea('div', { className: 'tn-medidor tn-m-bateria' }, TN.iconos.nodo('pila', 26), TN.crea('span', { className: 'tn-barra' }, n.bateria)),
          TN.crea('div', { className: 'tn-medidor tn-m-mochila' }, TN.iconos.nodo('mochila', 26), n.mochila)),
        TN.crea('div', { className: 'tn-medidor tn-m-voltios' }, TN.iconos.nodo('rayo', 22), TN.crea('span', { className: 'tn-barra' }, n.voltios)),
        n.cuenta, n.pila);
      flechas = [flecha('nido'), flecha('mochila')];
      capa.append(caja);
    },
    // datos: { bateria, bateriaMax, baja, unidades, tope, voltios, meta, pilas, cuenta (segundos, opcional), nido: {x,z}|null, caida: {x,z}|null }
    pinta(d, vista) {
      if (!caja) return;
      n.bateria.style.width = pct(d.bateria, d.bateriaMax); n.bateria.className = d.baja ? 'tn-roja' : '';
      n.voltios.style.width = pct(d.voltios, d.meta);
      n.mochila.textContent = d.unidades + '/' + d.tope; n.mochila.className = d.unidades >= d.tope ? 'tn-llena' : '';
      n.pilas.textContent = d.pilas; n.pila.hidden = !d.pilas;
      n.borde.hidden = !d.baja;
      n.cuenta.hidden = d.cuenta === undefined;
      if (d.cuenta !== undefined) { const s = Math.max(0, Math.ceil(d.cuenta)); n.cuenta.textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); n.cuenta.classList.toggle('tn-prisa', s <= 20); }
      const w = caja.clientWidth, h = caja.clientHeight;
      [d.nido, d.caida].forEach((p, i) => { if (!p) { flechas[i].hidden = true; return; } apunta(flechas[i], vista.aPantalla(p.x, 0, p.z), w, h); });
    },
    // un destello rojo al recibir un golpe
    golpe() { if (!caja) return; const d = TN.crea('div', { className: 'tn-destello' }); caja.append(d); setTimeout(() => d.remove(), 260); },
    desmonta() { if (caja) caja.remove(); caja = null; n = {}; flechas = []; },
  };
})();
