// Fans of Boom · GARAJE: elegir móvil al preparar la partida. Una ficha por facción con su dibujo, su piloto y sus tres tiros
// (cuánto pegan, cuánto les afecta el viento y qué hacen). Se abre en la ventana de encima (#bm-modal) y avisa de la elección.
'use strict';
const GARAJE = (() => {
  const viento = t => (t.viento == null ? 1 : t.viento);   // el del proyectil que se tira (el golpe del cielo cae recto, pero el marcador sí lleva viento)
  const QUE = {   // lo que hace cada efecto, en una frase
    racimo: 'Se abre en trozos arriba del todo.', rebota: 'Rebota y explota otra vez.', fantasma: 'Atraviesa el suelo flotando y explota al salir.', taladro: 'Se mete en el suelo, sube haciendo una curva y explota al salir.',
    combo: 'Explota varias veces seguidas.', parte: 'Pulsa otra vez en el aire y se parte.', glitch: 'Arriba del todo salta hacia delante.', vuelve: 'Rebota hacia ti y explota otra vez.',
    cielo: 'Donde cae, golpe desde el cielo.', tren: 'Sale un tren hacia el rival más cercano.', minas: 'Se queda en el suelo y anda hacia el rival en tu siguiente turno.',
  };
  function dano(t) {   // el daño de un tiro tal como se lee en la ficha: «105 × 4», «110 + 110 por carga»…
    const e = t.efecto || {};
    if (e.tipo === 'cielo') return (e.x.length > 1 ? e.dano + ' × ' + e.x.length : String(e.dano)) + (e.porCarga ? ' ' + tr('+{n} por carga', { n: e.porCarga }) : '');
    if (e.tipo === 'parte') return t.dano + ' / ' + e.trozo.dano + ' × ' + e.n;
    const n = e.tipo === 'racimo' ? e.n : e.tipo === 'combo' ? e.veces : e.tipo === 'rebota' ? e.veces + 1 : e.tipo === 'vuelve' ? 2 : 1, m = t.multi ? t.multi.n : 1;
    return t.dano + (n * m > 1 ? ' × ' + n * m : '');
  }
  function dibujo(def) {   // el móvil pintado en un lienzo pequeño, con el banderín del equipo naranja
    const cv = document.createElement('canvas'), k = 2; cv.width = 140 * k; cv.height = 84 * k; cv.className = 'bm-g-cv';
    const c = cv.getContext('2d'); c.scale(k * 1.35, k * 1.35); c.translate(52, 56);
    CUERPOS.pinta(c, { def }, BOOM.equipos[0], 0);
    c.save(); c.translate(0, -BOOM.movil.centro); c.rotate(-0.6); c.fillStyle = def.colores[1]; c.strokeStyle = OL; c.lineWidth = 3; c.beginPath(); rrPath(c, -2, -4, BOOM.movil.boca + 2, 8, 3); c.fill(); c.stroke(); c.restore();
    return cv;
  }
  function abre(actual, alElegir) {
    const caja = document.createElement('div'); caja.className = 'bm-tarjeta bm-garaje';
    caja.innerHTML = `<h2>${tr('GARAJE')}</h2><p class="bm-nota">${tr('Un móvil por facción. Lo que más pega, menos agujero hace; y al que más le afecta el viento, más pega.')}</p><div class="bm-g-lista"></div><button class="bm-btn bm-sec" id="bm-g-x">${tr('CERRAR')}</button>`;
    const lista = caja.querySelector('.bm-g-lista');
    for (const d of BOOM.moviles) {
      const f = document.createElement('button'); f.className = 'bm-g-ficha' + (d.id === actual ? ' bm-on' : ''); f.style.setProperty('--c1', d.colores[0]); f.style.setProperty('--c2', d.colores[1]);
      f.append(dibujo(d));
      const tiros = d.tiros.map((t, i) => `<li class="${i === 2 ? 'bm-g-ss' : ''}"><img class="bm-ico" src="${ICONOS.tiro(d, i)}" alt=""><div><b>${i < 2 ? tr('TIRO ' + (i + 1)) : 'SS'} · ${tr(t.nombre)}</b><span>${tr('Daño')} ${dano(t)} · ${tr('Viento')} ×${String(viento(t)).replace('.', ',')}</span>${t.efecto ? `<em>${tr(QUE[t.efecto.tipo])}</em>` : t.carga ? `<em>${tr('Carga el satélite.')}</em>` : ''}${i === 1 ? `<em class="bm-g-cd">${tr('No se puede usar dos turnos seguidos.')}</em>` : ''}</div></li>`).join('');
      f.insertAdjacentHTML('beforeend', `<div class="bm-g-txt"><h3>${tr(d.nombre)}</h3><small>${tr(d.faccion)} · ${d.piloto} · ${tr('Vida')} ${d.vida}</small><p>${tr(d.nota)}</p><ul>${tiros}</ul></div>`);
      f.onclick = () => { play('select'); alElegir(d.id); };
      lista.append(f);
    }
    $('#bm-modal').replaceChildren(caja); $('#bm-modal').hidden = false;
    caja.querySelector('#bm-g-x').onclick = () => { play('select'); $('#bm-modal').hidden = true; };
  }
  return { abre };
})();
