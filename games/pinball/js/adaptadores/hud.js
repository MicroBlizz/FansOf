// Fans of Pinball · adaptador · MARCADOR (HTML encima del lienzo, dentro de la zona segura de arriba): la planta, el reloj grande en el
// centro (verde y parado en las plantas sin perder, rojo con poco tiempo), las fichas, los puntos y el combo, la barra de sala con la
// marca donde se abre el ascensor, la barra de CAOS y la pausa en la esquina, lejos de los pulgares. La flecha al ascensor abierto sale
// cuando no se ve. Solo toca el DOM cuando cambia un valor. franja() dice dónde acaba (por debajo, los toques son de las palas).
'use strict';
PB.creaHud = (capa, acciones) => {
  const n = {}, antes = {};
  const icono = (nombre, escala) => PB.imagen(AJUSTES.arte.imagenes[nombre], escala, 'pb-icono');
  n.planta = PB.crea('b'); n.reloj = PB.crea('b'); n.fichas = PB.crea('b'); n.puntos = PB.crea('span'); n.combo = PB.crea('span', { className: 'pb-combo' });
  n.sala = PB.crea('i'); n.umbral = PB.crea('u'); n.caos = PB.crea('i');
  n.cajaFichas = PB.crea('div', { className: 'pb-chapa pb-chapa-fichas' }, icono('moneda', 2), n.fichas);
  n.cajaReloj = PB.crea('div', { className: 'pb-reloj' }, icono('reloj', 1), n.reloj);
  n.barraCaos = PB.crea('div', { className: 'pb-barra pb-barra-caos' }, icono('caos', 1), PB.crea('span', {}, n.caos));
  n.flecha = PB.crea('div', { className: 'pb-flecha', hidden: true });
  const pausa = PB.crea('button', { type: 'button', className: 'pb-pausa', ariaLabel: tr('Pausa'), onclick: acciones.pausa }, PB.crea('i'), PB.crea('i'));
  const caja = PB.crea('div', { className: 'pb-hud' },
    PB.crea('div', { className: 'pb-hud-fila' },
      PB.crea('div', { className: 'pb-chapa' }, icono('planta', 1), n.planta), n.cajaReloj, n.cajaFichas, pausa),
    PB.crea('div', { className: 'pb-hud-fila pb-hud-barras' },
      PB.crea('div', { className: 'pb-barra pb-barra-sala' }, icono('ascensorHud', 1), PB.crea('span', {}, n.sala, n.umbral)), n.barraCaos),
    PB.crea('div', { className: 'pb-hud-fila pb-hud-puntos' }, n.puntos, n.combo), n.flecha);
  capa.append(caja);
  let franja = 0;   // dónde acaba el marcador (px CSS): se mide una vez y otra tras cada cambio de tamaño
  const mide = () => { franja = 0; };
  window.addEventListener('resize', mide);
  // cambia un texto o un estilo solo si es distinto del que había
  function pon(clave, valor, fn) { if (antes[clave] !== valor) { antes[clave] = valor; fn(valor); } }
  const pct = v => Math.max(0, Math.min(100, v * 100)).toFixed(1) + '%';
  function reloj(f) {
    const s = Math.max(0, Math.ceil(f.reloj));
    pon('reloj', s, v => { n.reloj.textContent = v; });
    pon('estadoReloj', f.relojParado ? 'pb-verde' : s <= 10 ? 'pb-prisa' : '', v => { n.cajaReloj.className = 'pb-reloj ' + v; });
  }
  function barras(f) {
    pon('sala', pct(f.sala.barra), v => { n.sala.style.width = v; });
    pon('umbral', pct(f.sala.umbral), v => { n.umbral.style.left = v; });
    pon('abierta', f.sala.abierta, v => n.sala.classList.toggle('pb-abierta', v));
    const caos = f.caos.activo ? f.caos.quedan / Math.max(0.01, f.caos.duracion) : f.caos.barra / f.caos.umbral;
    pon('caos', pct(caos), v => { n.caos.style.width = v; });
    pon('caosActivo', f.caos.activo, v => n.barraCaos.classList.toggle('pb-activo', v));
  }
  return {
    // foto del dominio; arriba = la y del mundo arriba de la vista
    pinta(f, arriba) {
      reloj(f); barras(f);
      pon('planta', f.planta, v => { n.planta.textContent = v; });
      pon('fichas', f.fichas, v => { n.fichas.textContent = PB.miles(v); });
      pon('puntos', f.puntos, v => { n.puntos.textContent = PB.miles(v); });
      pon('combo', f.multiplicador > 1 ? '×' + f.multiplicador.toFixed(1).replace('.', ',') : '', v => { n.combo.textContent = v; });
      pon('flecha', f.escalera.abierta && f.escalera.fondo < arriba, v => { n.flecha.hidden = !v; });
    },
    get fichas() { return n.cajaFichas; },
    franja: () => franja || (franja = caja.getBoundingClientRect().bottom),
    quita() { caja.remove(); window.removeEventListener('resize', mide); },
  };
};
